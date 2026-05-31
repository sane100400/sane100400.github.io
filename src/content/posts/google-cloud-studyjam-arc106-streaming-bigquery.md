---
title: "Google Cloud Study Jam ARC106 - Pub/Sub 데이터를 BigQuery로 스트리밍하기"
published: 2026-05-31
description: "ARC106 챌린지 랩에서 Cloud Storage, BigQuery, Pub/Sub, Dataflow 템플릿을 연결하는 순서"
tags: [GCP, Dataflow, BigQuery, PubSub, Cloud Storage, Qwiklabs]
category: Cloud
draft: false
---

ARC106은 Pub/Sub로 들어온 메시지를 Dataflow 템플릿으로 BigQuery 테이블에 쓰는 랩이다. 리소스는 많지만 연결은 한 방향이다. 버킷을 만들고, BigQuery 테이블을 만들고, Pub/Sub 토픽을 만든 뒤 Dataflow job을 띄우면 된다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | Dataflow job이 임시 파일을 둘 Cloud Storage 버킷을 만든다. | `--location="$REGION"`은 Dataflow 리전과 맞추고, `--uniform-bucket-level-access`는 객체별 ACL보다 버킷 IAM으로 권한을 관리하겠다는 뜻이다. |
| Task 2 | Pub/Sub 메시지가 적재될 BigQuery dataset과 table을 만든다. | `bq --location=US mk --dataset`은 dataset 위치를 정한다. 테이블 스키마 `data:STRING`은 Pub/Sub 메시지 payload를 문자열 칼럼에 넣기 위한 최소 구조다. |
| Task 3 | Dataflow가 읽을 Pub/Sub 토픽과 pull subscription을 만든다. | 토픽 이름은 랩 값과 같아야 한다. subscription은 채점 자체보다 확인용에 가깝지만, 콘솔에서 기본 subscription을 만든 흐름과 맞춰준다. |
| Task 4 | Google 제공 Dataflow 템플릿으로 Pub/Sub to BigQuery streaming job을 실행한다. | `inputTopic`은 `projects/PROJECT/topics/TOPIC` 전체 경로가 필요하고, `outputTableSpec`은 `PROJECT:DATASET.TABLE` 형식이다. `--staging-location`은 아까 만든 버킷의 `temp` prefix를 쓴다. |
| Task 5 | 테스트 메시지를 발행하고 BigQuery에 실제 행이 들어갔는지 확인한다. | streaming이라 바로 조회되지 않을 수 있다. `sleep 90`은 채점기를 기다리는 시간이 아니라 Dataflow가 BigQuery에 쓰는 시간을 주는 것이다. |

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
