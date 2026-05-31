---
title: "Qwiklabs ARC104 - Cloud Run Functions 챌린지 랩 진행 기록"
published: 2026-05-25
description: "Cloud Storage 트리거 함수와 HTTP 함수를 배포하면서 만난 Eventarc, Pub/Sub 권한 이슈 정리"
tags: [GCP, Cloud Run Functions, Cloud Functions, Eventarc, Qwiklabs]
category: Cloud
draft: false
---

Google Skills의 **ARC104 - Build Serverless Applications with Cloud Run Functions: Challenge Lab** 진행 기록이다.

15분짜리 introductory 랩이라고 되어 있는데, 실제로는 권한 전파와 Eventarc 트리거에서 시간이 꽤 샜다. 랩 자체는 단순하다. 버킷 하나 만들고, Cloud Storage 이벤트로 실행되는 함수 하나, HTTP 요청에 응답하는 함수 하나를 배포하면 된다.

아래 값은 랩마다 바뀐다. 글에서는 그대로 복붙하지 말고 자기 랩 화면에 나온 값을 넣으면 된다.

```bash
export PROJECT_ID=qwiklabs-gcp-XX-XXXXXXXXXXXX
export REGION=us-east1

gcloud config set project $PROJECT_ID
```

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| API 활성화 | Cloud Run Functions 2세대 배포에 필요한 서비스 API를 켠다. | `cloudfunctions`만으로는 부족하다. 소스 빌드는 `cloudbuild`, 컨테이너 저장은 `artifactregistry`, 실행은 `run`, 이벤트 연결은 `eventarc`가 맡는다. |
| Task 1 | Storage 이벤트를 발생시킬 버킷을 만든다. | 버킷 이름을 프로젝트 ID와 같게 요구하는 랩이다. `gs://$PROJECT_ID`와 `--location=$REGION`이 채점 포인트다. |
| Task 2 | Cloud Storage object finalize 이벤트를 받는 `cs-tracker` 함수를 배포한다. | `functions.cloudEvent('cs-tracker', ...)`의 이름과 `--entry-point=cs-tracker`가 같아야 한다. `--trigger-bucket`은 Eventarc 트리거의 bucket filter가 된다. |
| Task 3 | HTTP 요청에 응답하는 `http-messenger` 함수를 배포한다. | Storage 트리거와 달리 `--trigger-http`를 쓴다. 외부 호출이 필요하면 `--allow-unauthenticated`나 IAM invoker 설정도 같이 봐야 한다. |
| 패치 작업 | 권한 전파나 max instances 조건 때문에 채점이 막힐 때 기존 함수를 보정한다. | Eventarc service agent, Storage service account의 Pub/Sub 권한, `serviceConfig.maxInstanceCount` 값이 자주 문제 된다. |

## 0. API 활성화

Cloud Run functions 2세대는 Cloud Functions만 켜서는 부족하다. 빌드, 실행, 트리거 생성에 필요한 API를 같이 켜야 한다.

```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  eventarc.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

실습 중에 API를 막 켠 직후라면 바로 다음 배포에서 권한 에러가 날 수 있다. 이건 설정을 틀렸다기보다 서비스 에이전트 권한 전파가 늦는 경우가 많다.

## Task 1. Cloud Storage 버킷 만들기

버킷 이름은 프로젝트 ID와 같게 만들라고 나온다.

```bash
gcloud storage buckets create gs://$PROJECT_ID --location=$REGION
```

여기까지는 별다른 함정이 없었다. 만들고 바로 `Check my progress`를 누르면 된다.

## Task 2. Cloud Storage 이벤트 함수 만들기

함수 이름은 `cs-tracker`, 런타임은 Node.js 24, 리전은 `us-east1`.

```bash
mkdir -p ~/cs-tracker
cd ~/cs-tracker
```

`index.js`:

```bash
cat > index.js <<'EOF'
const functions = require('@google-cloud/functions-framework');

functions.cloudEvent('cs-tracker', (cloudevent) => {
  console.log('A new event in your Cloud Storage bucket has been logged!');
  console.log(cloudevent);
});
EOF
```

`package.json`:

```bash
cat > package.json <<'EOF'
{
  "name": "nodejs-functions-gen2-codelab",
  "version": "0.0.1",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^2.0.0"
  }
}
EOF
```

배포:

```bash
gcloud functions deploy cs-tracker \
  --gen2 \
  --runtime=nodejs24 \
  --region=$REGION \
  --source=. \
  --entry-point=cs-tracker \
  --trigger-bucket=$PROJECT_ID \
  --max-instances=2
```

정상 배포 후에는 파일 하나를 올려서 트리거를 발생시킨다.

```bash
echo "test" > test.txt
gcloud storage cp test.txt gs://$PROJECT_ID/
```

## 삽질 1. Eventarc Service Agent 권한 에러

처음 배포할 때 이런 에러가 났다.

```text
Permission denied while using the Eventarc Service Agent.
If you recently started to use Eventarc, it may take a few minutes before all necessary permissions are propagated to the Service Agent.
```

몇 분 기다렸다가 다시 배포해도 되지만, 나는 아래처럼 Eventarc 서비스 에이전트 역할을 명시적으로 붙였다.

```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:service-$PROJECT_NUMBER@gcp-sa-eventarc.iam.gserviceaccount.com" \
  --role="roles/eventarc.serviceAgent"
```

그 다음 `gcloud functions deploy cs-tracker ...`를 다시 실행했다.

## 삽질 2. Cloud Storage 서비스 계정의 Pub/Sub 권한 에러

그 다음에는 트리거 생성 단계에서 다른 에러가 났다.

```text
The Cloud Storage service account for your bucket is unable to publish to Cloud Pub/Sub topics in the specified project.
To use GCS CloudEvent triggers, the GCS service account requires the Pub/Sub Publisher (roles/pubsub.publisher) IAM role in the specified project.
```

이건 Cloud Storage 서비스 계정에 Pub/Sub Publisher 권한을 주면 된다.

```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:service-${PROJECT_NUMBER}@gs-project-accounts.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"
```

다시 배포:

```bash
cd ~/cs-tracker

gcloud functions deploy cs-tracker \
  --gen2 \
  --runtime=nodejs24 \
  --region=$REGION \
  --source=. \
  --entry-point=cs-tracker \
  --trigger-bucket=$PROJECT_ID \
  --max-instances=2
```

배포가 끝나면 함수 상태를 확인한다.

```bash
gcloud functions describe cs-tracker \
  --gen2 \
  --region=$REGION \
  --format="value(state)"
```

`ACTIVE`가 나오면 새 파일을 한 번 더 올리고 채점했다.

```bash
echo "test2" > test2.txt
gcloud storage cp test2.txt gs://$PROJECT_ID/
```

## Task 3. HTTP 함수 만들기

함수 이름은 `http-messenger`. Cloud Storage 트리거가 아니라 HTTP 트리거다.

```bash
mkdir -p ~/http-messenger
cd ~/http-messenger
```

`index.js`:

```bash
cat > index.js <<'EOF'
const functions = require('@google-cloud/functions-framework');

functions.http('http-messenger', (req, res) => {
  res.status(200).send('HTTP function (2nd gen) has been called!');
});
EOF
```

`package.json`:

```bash
cat > package.json <<'EOF'
{
  "name": "nodejs-functions-gen2-codelab",
  "version": "0.0.1",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^2.0.0"
  }
}
EOF
```

배포:

```bash
gcloud functions deploy http-messenger \
  --gen2 \
  --runtime=nodejs24 \
  --region=$REGION \
  --source=. \
  --entry-point=http-messenger \
  --trigger-http \
  --min-instances=1 \
  --max-instances=5 \
  --allow-unauthenticated
```

내 랩에서는 HTTP 함수의 max instances가 `5`로 잡힌 상태가 맞았다. 같은 ARC104라도 랩 문구나 채점 기준이 바뀔 수 있으니, 이 값은 자기 화면에 나온 조건을 먼저 확인하는 게 낫다.

설정 확인:

```bash
gcloud functions describe http-messenger \
  --gen2 \
  --region=$REGION \
  --format="min=$(value(serviceConfig.minInstanceCount)) max=$(value(serviceConfig.maxInstanceCount))"
```

응답 테스트:

```bash
FUNCTION_URL=$(gcloud functions describe http-messenger --gen2 --region=$REGION --format="value(serviceConfig.uri)")
curl "$FUNCTION_URL"
```

기대 응답:

```text
HTTP function (2nd gen) has been called!
```

## 정리

이 랩에서 시간을 먹은 건 함수 코드가 아니라 IAM이었다.

Cloud Storage 이벤트 함수가 안 만들어지면 에러 메시지를 먼저 본다. Eventarc 서비스 에이전트 문제인지, Cloud Storage 서비스 계정의 Pub/Sub Publisher 문제인지에 따라 붙여야 할 역할이 다르다.

그리고 `cat > file <<'EOF'` 방식으로 파일을 만들 때는 Cloud Shell에 명령어를 통째로 붙여넣는 게 편하다. `curl`이나 긴 `gcloud` 명령은 줄바꿈이 어긋나면 엉뚱한 명령으로 실행된다. 실제로 한 번 그렇게 깨졌다.

다시 한다면 순서는 이렇게 잡을 것 같다.

1. API 먼저 전부 활성화
2. 버킷 생성 후 Task 1 채점
3. Eventarc, GCS Pub/Sub 권한을 미리 확인
4. `cs-tracker` 배포 후 파일 업로드
5. `http-messenger` 배포 후 URL 호출

랩 시간은 15분이라고 되어 있지만, 권한 전파가 한번 걸리면 체감상 30분짜리다. 그래도 원인은 뻔한 편이라 에러 문구만 놓치지 않으면 오래 막힐 랩은 아니었다.
