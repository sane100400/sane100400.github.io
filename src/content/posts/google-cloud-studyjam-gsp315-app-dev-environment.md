---
title: "Google Cloud Study Jam GSP315 - 앱 개발 환경과 썸네일 함수 실습"
published: 2026-05-31
description: "GSP315 챌린지 랩에서 버킷, Pub/Sub, Cloud Run Functions 썸네일 생성, 이전 엔지니어 권한 제거를 진행하는 방법"
tags: [GCP, Cloud Run Functions, Eventarc, PubSub, Cloud Storage, Qwiklabs]
category: Cloud
draft: false
---

GSP315는 ARC101과 비슷하게 Cloud Storage 이벤트로 썸네일을 만드는 랩이다. 다만 Eventarc와 서비스 계정 권한이 더 자주 문제를 일으킨다. 스크립트에는 실패한 트리거와 Storage notification을 정리하는 구간까지 들어 있다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | 이미지 업로드를 받을 Cloud Storage 버킷을 만든다. | `gcloud storage buckets create`의 `--location`은 함수 리전과 맞추는 편이 안전하다. 트리거가 같은 리전에서 만들어지기 때문이다. |
| Task 2 | 썸네일 생성 결과를 알릴 Pub/Sub 토픽을 만든다. | 함수 코드 안의 `topicName` 값과 `TOPIC_NAME`이 같아야 한다. 토픽 이름이 다르면 함수는 성공해도 publish가 실패한다. |
| Task 3 | Storage 이벤트를 받는 Cloud Run Function을 배포하고, 원본 이미지에서 64x64 썸네일을 만든다. | Eventarc 트리거는 여러 서비스 계정 권한을 필요로 한다. `roles/eventarc.eventReceiver`, `roles/pubsub.publisher`, bucket `roles/storage.objectAdmin`, `--trigger-service-account`를 같이 봐야 한다. |
| Task 3 troubleshooting | 실패한 배포가 남긴 function, Cloud Run service, Eventarc trigger, Storage notification을 지우고 다시 배포한다. | `|| true`는 삭제 대상이 없어도 계속 진행하기 위한 장치다. `Notification quota exceeded`가 나오면 이 정리 단계가 특히 중요하다. |
| Task 4 | 이전 클라우드 엔지니어 계정의 프로젝트 권한을 제거한다. | `remove-iam-policy-binding`은 member와 role이 정확히 일치해야 제거된다. 제거 후 `get-iam-policy --flatten`으로 계정이 남았는지 확인한다. |

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-central1"
export ZONE="us-central1-a"

export BUCKET_NAME="${PROJECT_ID}-bucket"
export TOPIC_NAME="topic-memories-..."
export FUNCTION_NAME="memories-thumbnail-creator"

export USER1_EMAIL="student-...@qwiklabs.net"
export PREVIOUS_ENGINEER_EMAIL="student-...@qwiklabs.net"
```

`TOPIC_NAME`, `USER1_EMAIL`, `PREVIOUS_ENGINEER_EMAIL`은 랩마다 달라진다.

## API와 서비스 에이전트 준비

```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  cloudfunctions.googleapis.com \
  eventarc.googleapis.com \
  logging.googleapis.com \
  pubsub.googleapis.com \
  run.googleapis.com \
  storage.googleapis.com \
  --project="$PROJECT_ID"
```

Eventarc와 Cloud Functions 서비스 에이전트가 바로 생기지 않는 경우가 있어서 스크립트에서는 미리 생성 요청을 넣는다.

```bash
gcloud beta services identity create \
  --service=eventarc.googleapis.com \
  --project="$PROJECT_ID" || true

gcloud storage service-agent \
  --project="$PROJECT_ID" >/tmp/gsp315-gcs-service-agent.txt
```

## Task 1. 버킷 만들기

```bash
gcloud storage buckets create "gs://${BUCKET_NAME}" \
  --project="$PROJECT_ID" \
  --location="$REGION"
```

만든 뒤 채점한다.

## Task 2. Pub/Sub 토픽

```bash
gcloud pubsub topics create "$TOPIC_NAME" \
  --project="$PROJECT_ID"
```

여기까지는 단순하다. 토픽 이름이 랩 화면과 같아야 한다.

## Task 3. 썸네일 Cloud Run Function

함수 서비스 계정에는 Eventarc 수신, Run invoke, Pub/Sub publish 권한이 필요하다. Storage 서비스 계정에도 Pub/Sub publish 권한이 필요하다.

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${FUNCTION_SA}" \
  --role="roles/eventarc.eventReceiver" \
  --condition=None

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${GCS_SA}" \
  --role="roles/pubsub.publisher" \
  --condition=None
```

이 랩은 실패한 배포가 남긴 Eventarc trigger나 bucket notification 때문에 다음 배포가 막히는 일이 있다. 스크립트가 기존 function, run service, eventarc trigger, pubsub topic, storage notification을 정리하는 이유다.

```bash
gcloud functions delete "$FUNCTION_NAME" \
  --project="$PROJECT_ID" \
  --gen2 \
  --region="$REGION" \
  --quiet || true

gcloud run services delete "$FUNCTION_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --quiet || true
```

정리 후에는 2분 정도 기다렸다가 배포한다.

```bash
gcloud functions deploy "$FUNCTION_NAME" \
  --project="$PROJECT_ID" \
  --gen2 \
  --runtime=nodejs22 \
  --region="$REGION" \
  --source=. \
  --entry-point=memories-thumbnail-creator \
  --trigger-bucket="$BUCKET_NAME" \
  --trigger-location="$REGION" \
  --service-account="$FUNCTION_SA" \
  --trigger-service-account="$FUNCTION_SA" \
  --memory=256Mi
```

샘플 이미지를 올려 트리거를 발생시킨다.

```bash
curl -L -o map.jpg "https://storage.googleapis.com/cloud-training/gsp315/map.jpg"
gcloud storage cp map.jpg "gs://${BUCKET_NAME}/map.jpg"
gcloud storage ls "gs://${BUCKET_NAME}"
```

`64x64_thumbnail` 파일이 보이면 채점한다.

## Task 3이 안 될 때

함수는 있는데 채점기가 트리거를 못 잡는다면 troubleshooting 블록만 실행한다. 기본 흐름에서 처음부터 그 블록까지 다 붙여넣으면 오히려 시간이 더 걸린다.

확인 순서는 함수 describe, Eventarc trigger list, Storage notification 정리, 재배포다.

## Task 4. 이전 엔지니어 권한 제거

마지막은 이전 엔지니어 계정의 IAM binding을 제거한다.

```bash
gcloud projects remove-iam-policy-binding "$PROJECT_ID" \
  --member="user:${PREVIOUS_ENGINEER_EMAIL}" \
  --role="roles/viewer" \
  --condition=None
```

정확한 role은 랩 지시문과 현재 IAM policy를 같이 본다. 스크립트에서는 제거 후 policy를 다시 조회해서 계정이 남아 있는지 확인한다.

## 마무리

GSP315는 권한 전파와 찌꺼기 정리가 절반이다. `Notification quota exceeded`, Eventarc permission denied, trigger not detected가 나오면 코드를 고치기 전에 이전 실패 흔적부터 지우는 편이 빠르다.
