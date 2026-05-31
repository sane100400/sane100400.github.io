---
title: "Google Cloud Study Jam ARC109 - Cloud Run Function을 API Gateway로 노출하기"
published: 2026-05-31
description: "ARC109 챌린지 랩에서 HTTP 함수, API Gateway, Pub/Sub publish 기능을 단계별로 구성하는 방법"
tags: [GCP, API Gateway, Cloud Run Functions, PubSub, Qwiklabs]
category: Cloud
draft: false
---

ARC109는 서버리스 API를 만드는 랩이다. 먼저 HTTP Cloud Run Function을 만들고, API Gateway를 붙인 다음, 같은 API가 Pub/Sub 메시지를 발행하도록 함수를 바꾼다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | HTTP로 호출되는 Cloud Run Functions 2세대 함수를 만든다. | `--trigger-http`는 HTTP 엔드포인트를 만들고, `--allow-unauthenticated`는 인증 없이 호출 가능하게 한다. `--entry-point=helloHttp`는 코드 안의 함수 이름과 반드시 같아야 한다. |
| Task 2 | API Gateway를 만들고 `/gcfunction` 경로를 함수 backend로 연결한다. | OpenAPI의 `x-google-backend.address`에 함수 URL이 들어간다. `--backend-auth-service-account`를 쓰므로 API Gateway service agent에 `roles/iam.serviceAccountTokenCreator`가 필요하다. |
| Task 3 | 함수 코드를 바꿔 API 호출 시 Pub/Sub 토픽으로 메시지를 발행하게 만든다. | 함수 서비스 계정에 `roles/pubsub.publisher`가 있어야 한다. 재배포해도 Gateway hostname은 그대로이고, backend 함수 동작만 바뀐다. |

## 시작 값

스크립트는 프로젝트 ID를 현재 `gcloud config`에서 읽는다. 그래도 시작 전에 랩 프로젝트가 맞는지 확인한다.

```bash
export REGION=us-central1
export FUNCTION_NAME=gcfunction
export API_ID=gcfunction-api
export API_CONFIG_ID=gcfunction-api
export GATEWAY_ID=gcfunction-api
export TOPIC_ID=demo-topic

export PROJECT_ID="$(gcloud config get-value project)"
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
```

API Gateway가 함수 backend에 접근하려면 Compute 기본 서비스 계정과 API Gateway service agent를 같이 봐야 한다.

```bash
export COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
export APIGW_SERVICE_AGENT="service-${PROJECT_NUMBER}@gcp-sa-apigateway.iam.gserviceaccount.com"
```

## Task 1. HTTP 함수 만들기

필요한 API를 켜고 Node.js 22 함수 프로젝트를 만든다.

```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  apigateway.googleapis.com \
  servicemanagement.googleapis.com \
  servicecontrol.googleapis.com \
  pubsub.googleapis.com
```

처음 함수는 `Hello World!`를 반환하는 HTTP 함수다.

```bash
gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --runtime=nodejs22 \
  --region="$REGION" \
  --source=. \
  --entry-point=helloHttp \
  --trigger-http \
  --allow-unauthenticated \
  --service-account="$COMPUTE_SA"
```

배포 후 함수 URL을 받아서 직접 호출한다.

```bash
export FUNCTION_URL="$(gcloud functions describe "$FUNCTION_NAME" \
  --gen2 \
  --region="$REGION" \
  --format='value(serviceConfig.uri)')"

curl -i "$FUNCTION_URL"
```

## Task 2. API Gateway 만들기

OpenAPI spec에서 backend 주소를 방금 만든 함수 URL로 넣는다.

```yaml
swagger: '2.0'
info:
  title: gcfunction API
  version: 1.0.0
schemes:
- https
x-google-backend:
  address: ${FUNCTION_URL}
paths:
  /gcfunction:
    get:
      operationId: gcfunction
      responses:
       '200':
          description: A successful response
```

API Gateway service agent가 backend auth service account 토큰을 만들 수 있어야 한다.

```bash
gcloud iam service-accounts add-iam-policy-binding "$COMPUTE_SA" \
  --member="serviceAccount:${APIGW_SERVICE_AGENT}" \
  --role="roles/iam.serviceAccountTokenCreator"
```

그다음 API, config, gateway 순서로 만든다.

```bash
gcloud api-gateway apis create "$API_ID" --project="$PROJECT_ID"

gcloud api-gateway api-configs create "$API_CONFIG_ID" \
  --api="$API_ID" \
  --project="$PROJECT_ID" \
  --openapi-spec=openapispec.yaml \
  --backend-auth-service-account="$COMPUTE_SA"

gcloud api-gateway gateways create "$GATEWAY_ID" \
  --api="$API_ID" \
  --api-config="$API_CONFIG_ID" \
  --location="$REGION" \
  --project="$PROJECT_ID"
```

Gateway는 `ACTIVE`가 될 때까지 시간이 걸린다. `defaultHostname`을 받아서 `/gcfunction` 경로로 호출한다.

## Task 3. Pub/Sub 메시지 발행

이제 함수가 Pub/Sub에 publish하도록 바꾼다. 먼저 서비스 계정에 Publisher 권한을 준다.

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/pubsub.publisher"

gcloud pubsub topics create "$TOPIC_ID"
gcloud pubsub subscriptions create "${TOPIC_ID}-sub" --topic="$TOPIC_ID"
```

함수 코드는 `@google-cloud/pubsub`를 추가하고 `demo-topic`으로 메시지를 보낸다. 다시 배포한 뒤 Gateway URL을 호출하면 subscription에 메시지가 쌓인다.

```bash
curl -i "https://${GATEWAY_HOSTNAME}/gcfunction"
gcloud pubsub subscriptions pull "${TOPIC_ID}-sub" --limit=5
```

채점 전에는 `--auto-ack`를 쓰지 않는 편이 낫다. 메시지를 확인만 하고 남겨두면 채점기가 보기 좋다.

## 마무리

ARC109에서 제일 자주 빠지는 부분은 API Gateway의 backend auth 권한이다. 함수는 직접 호출되는데 Gateway 호출만 실패한다면 `roles/iam.serviceAccountTokenCreator` 바인딩부터 확인하자.
