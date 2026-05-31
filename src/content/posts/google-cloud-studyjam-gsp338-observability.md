---
title: "Google Cloud Study Jam GSP338 - Cloud Observability 모니터링과 로그 메트릭"
published: 2026-05-31
description: "GSP338 챌린지 랩에서 커스텀 메트릭, 로그 기반 메트릭, 대시보드, 알림 정책을 구성하는 방법"
tags: [GCP, Cloud Monitoring, Cloud Logging, Observability, Qwiklabs]
category: Cloud
draft: false
---

GSP338은 Cloud Monitoring과 Cloud Logging을 같이 다루는 랩이다. VM startup script에서 커스텀 메트릭을 쓰게 만들고, 로그 기반 메트릭을 만든 뒤, Media Dashboard와 alert policy에 연결한다.

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-central1"
export ZONE="us-central1-a"
export VM_NAME="video-queue-monitor"
export CUSTOM_METRIC_NAME="big_video_upload_rate"
export ALERT_THRESHOLD="3"
```

`CUSTOM_METRIC_NAME`과 threshold는 랩에서 주는 값이므로 바꾸지 말고 확인한다.

## Task 1. Cloud Monitoring 활성화

```bash
gcloud services enable \
  monitoring.googleapis.com \
  logging.googleapis.com \
  compute.googleapis.com \
  --project="$PROJECT_ID"

gcloud monitoring dashboards list \
  --project="$PROJECT_ID" \
  --filter='displayName="Media_Dashboard"'
```

`Media_Dashboard`가 보이면 초기 리소스가 준비된 상태다.

## Task 2. VM에서 custom metric 생성

VM의 instance ID와 서비스 계정을 확인한다.

```bash
INSTANCE_ID=$(gcloud compute instances describe "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --format="value(id)")

VM_SA=$(gcloud compute instances describe "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --format="value(serviceAccounts[0].email)")
```

VM 서비스 계정에는 metric writer가 필요하다.

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${VM_SA}" \
  --role="roles/monitoring.metricWriter"
```

기존 startup script의 placeholder를 실제 프로젝트, 인스턴스 ID, zone으로 바꿔 VM metadata에 다시 넣고 VM을 재시작한다.

커스텀 메트릭 descriptor가 바로 안 생기면, 스크립트처럼 Monitoring API에 time series point를 하나 직접 써서 descriptor를 만들어 둘 수 있다.

## Task 3. 로그 기반 메트릭

`big_video_upload_rate` 로그 기반 메트릭을 만든다. 필터는 4K 또는 8K 업로드 로그를 잡는다.

```bash
gcloud logging metrics create "$CUSTOM_METRIC_NAME" \
  --project="$PROJECT_ID" \
  --config-from-file=log-metric.json
```

`labelExtractors`로 `file_format` 라벨을 뽑는 것도 채점 포인트다.

## Task 4. Media Dashboard 수정

기존 `Media_Dashboard`를 JSON으로 받아온 뒤 widget 두 개를 넣는다.

1. `custom.googleapis.com/opencensus/my.videoservice.org/measure/input_queue_size`
2. `logging.googleapis.com/user/${CUSTOM_METRIC_NAME}`

업데이트는 아래 명령으로 한다.

```bash
gcloud monitoring dashboards update "$DASHBOARD_NAME" \
  --project="$PROJECT_ID" \
  --config-from-file=media-dashboard-update.json
```

채점이 안 되면 metric filter의 `resource.type`이 맞는지 확인한다. 스크립트는 기본적으로 `cloud_function`을 쓰지만, 환경에 따라 `cloud_run_revision`으로 time series가 생길 수 있다.

## Task 5. Alert policy

마지막은 고해상도 영상 업로드 rate가 threshold를 넘으면 울리는 정책이다.

```bash
gcloud alpha monitoring policies create \
  --project="$PROJECT_ID" \
  --policy-from-file=alert-policy.json
```

정책 이름은 `High resolution video uploads`로 맞춘다.

## 마무리

GSP338은 JSON을 직접 만지는 부분이 많다. 이름보다 더 중요한 건 metric type과 resource type이다. 채점이 안 되면 dashboard와 alert policy JSON에서 `logging.googleapis.com/user/...`와 `resource.type`을 먼저 확인하자.
