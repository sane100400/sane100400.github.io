---
title: "Google Cloud Study Jam ARC101 - 리소스 모니터링과 썸네일 함수 실습"
published: 2026-05-31
description: "ARC101 챌린지 랩에서 버킷, Pub/Sub, Cloud Run Functions, 알림 정책을 순서대로 구성하는 방법"
tags: [GCP, Cloud Functions, Cloud Run Functions, Monitoring, PubSub, Qwiklabs]
category: Cloud
draft: false
---

ARC101은 Cloud Storage에 이미지를 올리면 함수가 썸네일을 만들고, Pub/Sub로 메시지를 보내고, 마지막에 Cloud Monitoring 알림 정책까지 만드는 랩이다. 명령어는 길지만 흐름은 단순하다. 버킷을 만들고, 토픽을 만들고, 함수가 버킷 이벤트를 받게 연결한 뒤, 함수 활성 인스턴스 메트릭으로 알림을 만든다.

## 시작 전에 바꿀 값

스크립트 맨 위에서 아래 값은 랩 화면에 맞춰 바꾼다.

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-east4"
export BUCKET_NAME="travel-bucket-..."
export USER2_EMAIL="student-...@qwiklabs.net"
export TOPIC_NAME="travel-topic-..."
export FUNCTION_NAME="travel-thumbnail-generator"
export ALERT_EMAIL="내가 받을 이메일 주소"
```

`ALERT_EMAIL`은 스크립트에 비어 있던 값이다. 이걸 그대로 두면 알림 채널 생성에서 막힌다. 개인 이메일을 넣고 진행하면 된다.

## 공통 설정

프로젝트와 리전을 맞춘 뒤 필요한 API를 한 번에 켠다.

```bash
gcloud config set project "$PROJECT_ID"
gcloud config set compute/region "$REGION"

gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  cloudfunctions.googleapis.com \
  eventarc.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  pubsub.googleapis.com \
  run.googleapis.com \
  storage.googleapis.com \
  --project="$PROJECT_ID"
```

Cloud Run Functions 2세대는 Eventarc와 Pub/Sub 권한이 같이 엮인다. 그래서 프로젝트 번호를 뽑아 기본 Compute 서비스 계정과 Storage 서비스 계정을 변수로 잡아둔다.

```bash
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
FUNCTION_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
GCS_SA="service-${PROJECT_NUMBER}@gs-project-accounts.iam.gserviceaccount.com"
```

## Task 1. 버킷과 User 2 권한

버킷을 만들고, 랩에서 준 두 번째 사용자에게 Storage Object Viewer를 붙인다.

```bash
gcloud storage buckets create "gs://${BUCKET_NAME}" \
  --project="$PROJECT_ID" \
  --location="$REGION"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="user:${USER2_EMAIL}" \
  --role="roles/storage.objectViewer"
```

여기까지 끝나면 바로 `Check my progress`를 누른다. User 2 이메일을 잘못 넣으면 버킷은 있어도 채점이 안 된다.

## Task 2. Pub/Sub 토픽

토픽 이름도 랩마다 달라진다.

```bash
gcloud pubsub topics create "$TOPIC_NAME" \
  --project="$PROJECT_ID"
```

토픽 생성 뒤 채점한다.

## Task 3. 썸네일 함수

이 태스크가 제일 오래 걸린다. 함수 서비스 계정에 Eventarc 수신, Pub/Sub publish, Run invoke 권한을 붙이고, 버킷에는 objectAdmin을 준다. Storage 서비스 계정에는 Pub/Sub Publisher가 필요하다.

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${FUNCTION_SA}" \
  --role="roles/eventarc.eventReceiver"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${GCS_SA}" \
  --role="roles/pubsub.publisher"
```

함수 코드는 `imagemagick-stream`으로 64x64 썸네일을 만들고, 생성된 파일명을 Pub/Sub 토픽으로 보낸다. 코드 안의 `REPLACE_WITH_YOUR_TOPIC ID`는 반드시 실제 토픽 이름으로 치환해야 한다.

```bash
sed -i "s/REPLACE_WITH_YOUR_TOPIC ID/${TOPIC_NAME}/g" index.js
```

배포는 Cloud Run Functions 2세대 방식으로 한다.

```bash
gcloud functions deploy "$FUNCTION_NAME" \
  --project="$PROJECT_ID" \
  --gen2 \
  --runtime=nodejs22 \
  --region="$REGION" \
  --source=. \
  --entry-point=thumbnail \
  --trigger-bucket="$BUCKET_NAME" \
  --trigger-location="$REGION" \
  --service-account="$FUNCTION_SA" \
  --trigger-service-account="$FUNCTION_SA" \
  --memory=256Mi
```

배포가 끝나면 샘플 이미지를 올려서 트리거를 한 번 발생시킨다.

```bash
curl -L -o travel.jpg "https://storage.googleapis.com/cloud-training/arc101/travel.jpg"
gcloud storage cp travel.jpg "gs://${BUCKET_NAME}/travel.jpg"
gcloud storage ls "gs://${BUCKET_NAME}"
```

썸네일 파일이 보이면 채점한다. 함수는 배포 직후 바로 채점이 안 잡힐 수 있으니 1분 정도 기다렸다 다시 눌러보는 것도 괜찮다.

## Task 3이 안 잡힐 때

트리거가 잘못 만들어졌는지 먼저 본다.

```bash
gcloud functions describe "$FUNCTION_NAME" \
  --project="$PROJECT_ID" \
  --gen2 \
  --region="$REGION"

gcloud eventarc triggers list \
  --project="$PROJECT_ID" \
  --location="$REGION"
```

함수 이름은 맞는데 버킷 필터가 없거나 트리거가 깨져 있으면, 함수를 지우고 다시 배포하는 편이 빠르다.

## Task 4. 알림 정책

마지막은 이메일 알림 채널과 정책이다. 알림 정책 이름은 `Active Cloud Run Function Instances`로 둔다.

```bash
CHANNEL_ID=$(gcloud alpha monitoring channels create \
  --project="$PROJECT_ID" \
  --display-name="ARC101 email notification" \
  --type=email \
  --channel-labels=email_address="$ALERT_EMAIL" \
  --format="value(name)")
```

정책은 Cloud Functions active instances가 0보다 커지는 조건을 본다. 여기서 채점이 안 되면 `ALERT_EMAIL`이 비어 있지 않은지, 정책 displayName이 스크립트와 같은지 먼저 확인한다.

## 마무리

ARC101에서 자주 막히는 지점은 함수 코드보다 IAM과 Eventarc 전파다. API를 켠 직후에는 서비스 에이전트가 늦게 생길 수 있고, 권한을 붙인 직후에도 바로 반영되지 않을 수 있다. 함수 배포와 트리거 생성이 실패하면 1분 정도 기다린 뒤 같은 배포 명령을 다시 실행해 보자.
