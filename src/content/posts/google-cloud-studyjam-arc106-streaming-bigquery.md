---
title: "Google Cloud Study Jam ARC106 - Pub/Sub 데이터를 BigQuery로 스트리밍하기"
published: 2026-05-31
description: "ARC106 챌린지 랩에서 Cloud Storage, BigQuery, Pub/Sub, Dataflow 템플릿을 연결하는 순서"
tags: [GCP, Dataflow, BigQuery, PubSub, Cloud Storage, Qwiklabs]
category: Cloud
draft: false
---

ARC106은 Pub/Sub로 들어온 메시지를 Dataflow 템플릿으로 BigQuery 테이블에 쓰는 랩이다. 리소스는 많지만 연결은 한 방향이다. 버킷을 만들고, BigQuery 테이블을 만들고, Pub/Sub 토픽을 만든 뒤 Dataflow job을 띄우면 된다.

## 랩 값 확인

스크립트에는 아래 값들이 모여 있다. 랩 화면에서 새로 받은 값으로 바꿔 넣는다.

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-west1"
export BUCKET_NAME="$PROJECT_ID"
export DATASET_NAME="sensors_..."
export TABLE_NAME="temperature_..."
export TOPIC_NAME="sensors-temp-..."
export DATAFLOW_JOB_NAME="dfjob-..."
export TEMPLATE_PATH="gs://dataflow-templates-us-west1/latest/PubSub_to_BigQuery"
```

`BUCKET_NAME`은 프로젝트 ID를 그대로 쓰는 경우가 많다. BigQuery dataset, table, Pub/Sub topic, Dataflow job 이름은 채점기가 직접 찾으므로 랩 패널 값과 같아야 한다.

## Task 1. Cloud Storage 버킷

Dataflow가 staging 파일을 둘 버킷을 만든다.

```bash
gcloud services enable storage.googleapis.com

gcloud storage buckets create "gs://${BUCKET_NAME}" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --uniform-bucket-level-access
```

`gs://${BUCKET_NAME}/temp` 폴더를 미리 만들 필요는 없다. Dataflow가 object prefix처럼 사용하면서 필요한 객체를 만든다.

## Task 2. BigQuery dataset과 table

이 랩의 테이블 스키마는 단순하다. `data:STRING` 한 칼럼만 있으면 된다.

```bash
gcloud services enable bigquery.googleapis.com

bq --location=US mk --dataset "${PROJECT_ID}:${DATASET_NAME}"

bq mk --table \
  "${PROJECT_ID}:${DATASET_NAME}.${TABLE_NAME}" \
  data:STRING
```

만든 뒤에는 `bq show`로 확인하고 채점한다.

## Task 3. Pub/Sub 토픽

토픽과 pull subscription을 만든다. 콘솔의 “Add a default subscription” 체크박스와 비슷하게 `${TOPIC_NAME}-sub` 이름을 쓰면 확인하기 쉽다.

```bash
gcloud services enable pubsub.googleapis.com

gcloud pubsub topics create "$TOPIC_NAME"

gcloud pubsub subscriptions create "${TOPIC_NAME}-sub" \
  --topic="$TOPIC_NAME"
```

## Task 4. Dataflow 템플릿 실행

Dataflow는 Pub/Sub topic과 BigQuery table spec을 정확히 넘겨야 한다.

```bash
export INPUT_TOPIC="projects/${PROJECT_ID}/topics/${TOPIC_NAME}"
export OUTPUT_TABLE_SPEC="${PROJECT_ID}:${DATASET_NAME}.${TABLE_NAME}"

gcloud services enable dataflow.googleapis.com compute.googleapis.com

gcloud dataflow jobs run "$DATAFLOW_JOB_NAME" \
  --region="$REGION" \
  --gcs-location="$TEMPLATE_PATH" \
  --staging-location="gs://${BUCKET_NAME}/temp" \
  --parameters="inputTopic=${INPUT_TOPIC},outputTableSpec=${OUTPUT_TABLE_SPEC}"
```

job이 `Running`이 될 때까지 기다린다.

```bash
gcloud dataflow jobs list \
  --region="$REGION" \
  --filter="name=${DATAFLOW_JOB_NAME}"
```

`Failed`가 나오면 바로 재실행하지 말고 job describe와 logging read로 원인을 본다. 테이블 이름, dataset 위치, Pub/Sub topic 경로가 틀린 경우가 많다.

## Task 5. 메시지 발행과 BigQuery 확인

테스트 메시지를 발행하고 1분 정도 기다린 뒤 BigQuery를 조회한다.

```bash
gcloud pubsub topics publish "$TOPIC_NAME" \
  --message='{"data": "73.4 F"}'

sleep 90

bq query --use_legacy_sql=false \
  "SELECT * FROM \`${PROJECT_ID}.${DATASET_NAME}.${TABLE_NAME}\` ORDER BY data LIMIT 10"
```

조회 결과가 비어 있으면 Dataflow가 아직 쓰는 중일 수 있다. 메시지를 한 번 더 보내고 다시 기다려도 된다.

## 마무리

ARC106은 순서가 중요하다. Dataflow job을 먼저 띄워놓고 table이나 topic을 고치면 꼬이기 쉽다. 버킷, BigQuery, Pub/Sub를 먼저 채점으로 확인하고 나서 Dataflow를 실행하면 실패 원인을 훨씬 좁히기 쉽다.
