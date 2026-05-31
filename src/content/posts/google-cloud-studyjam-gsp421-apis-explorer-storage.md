---
title: "Google Cloud Study Jam GSP421 - APIs Explorer Cloud Storage 실습"
published: 2026-05-31
description: "GSP421 랩에서 Cloud Storage 버킷 생성, 업로드, 복사, 삭제와 퀴즈 답을 태스크별로 정리"
tags: [GCP, Cloud Storage, APIs Explorer, Qwiklabs]
category: Cloud
draft: false
---

GSP421은 Cloud Storage 버킷을 만들고, 파일을 올리고, 다른 버킷으로 복사하고, 삭제하는 흐름을 연습하는 랩이다. 원래는 APIs Explorer를 쓰는 랩이지만, 스크립트는 Cloud Shell에서 `gsutil`로 빠르게 같은 리소스를 만든다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | 첫 번째 Cloud Storage 버킷을 만든다. | `gsutil mb`는 make bucket이고, `-p`, `-l`, `-c`는 프로젝트, 위치, storage class를 뜻한다. 버킷 이름은 전역 고유해야 해서 timestamp suffix를 붙인다. |
| Task 2 | 두 번째 버킷을 만든다. | 두 버킷을 같은 location/class로 만들되 이름은 달라야 한다. 복사 태스크의 목적지가 된다. |
| Task 3 | 첫 번째 버킷에 PNG 파일 두 개를 올린다. | base64로 만든 작은 PNG라도 객체 이름이 맞으면 실습에는 충분하다. `gsutil cp 로컬파일 gs://버킷/객체명` 구조를 보면 된다. |
| Task 4 | 첫 번째 버킷의 파일을 두 번째 버킷으로 복사한다. | Cloud Storage 내부 복사도 `gsutil cp gs://source gs://dest` 형태다. destination 객체명을 `demo-image1-copy.png`처럼 채점 조건에 맞춘다. |
| Task 5 | 첫 번째 버킷 안의 파일을 삭제한다. | 버킷 삭제 전에 객체를 먼저 비운다. `gsutil rm`은 객체 삭제이고 bucket 삭제가 아니다. |
| Task 6 | 비워진 첫 번째 버킷을 삭제한다. | `gsutil rb`는 remove bucket이다. 객체가 남아 있으면 실패한다. |
| Task 7 | Cloud Storage 개념 퀴즈를 푼다. | default storage class, 전역 고유 bucket name, storage class 종류를 묻는다. 명령어 실습과 별개지만 랩 완료에 포함된다. |

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"

gcloud config set project "$PROJECT_ID"
gcloud services enable storage.googleapis.com --project="$PROJECT_ID"

export BUCKET_SUFFIX="$(date +%s)"
export BUCKET1="${PROJECT_ID}-gsp421-1-${BUCKET_SUFFIX}"
export BUCKET2="${PROJECT_ID}-gsp421-2-${BUCKET_SUFFIX}"
```

Cloud Storage 버킷 이름은 전역에서 고유해야 한다. suffix를 붙이는 이유가 이것이다.

## Task 1. 첫 번째 버킷

```bash
gsutil mb -p "$PROJECT_ID" -l US -c STANDARD "gs://${BUCKET1}"
gsutil ls -p "$PROJECT_ID"
```

버킷이 보이면 채점한다.

## Task 2. 두 번째 버킷

```bash
gsutil mb -p "$PROJECT_ID" -l US -c STANDARD "gs://${BUCKET2}"
gsutil ls -p "$PROJECT_ID"
```

여기도 끝나면 바로 채점한다.

## Task 3. 파일 업로드

체크포인트가 요구하는 파일명으로 작은 PNG 두 개를 만든 뒤 첫 번째 버킷에 올린다.

```bash
gsutil cp demo-image1.png "gs://${BUCKET1}/demo-image1.png"
gsutil cp demo-image2.png "gs://${BUCKET1}/demo-image2.png"

gsutil ls "gs://${BUCKET1}"
```

파일 내용은 중요하지 않고 이름과 위치가 중요하다.

## Task 4. 버킷 간 복사

```bash
gsutil cp \
  "gs://${BUCKET1}/demo-image1.png" \
  "gs://${BUCKET2}/demo-image1-copy.png"

gsutil ls "gs://${BUCKET2}"
```

복사된 객체 이름이 `demo-image1-copy.png`인지 확인한다.

## Task 5, 6. 파일과 버킷 삭제

먼저 첫 번째 버킷의 파일을 지운다.

```bash
gsutil rm "gs://${BUCKET1}/demo-image1.png"
gsutil rm "gs://${BUCKET1}/demo-image2.png"
```

그다음 첫 번째 버킷을 삭제한다.

```bash
gsutil rb "gs://${BUCKET1}"
```

버킷이 비어 있지 않으면 `rb`가 실패한다. 삭제 전 `gsutil ls "gs://${BUCKET1}"`로 남은 객체가 없는지 확인하면 된다.

## Task 7. 퀴즈 답

스크립트에 적어둔 답은 다음과 같다.

| 질문 | 답 |
|---|---|
| Each bucket has a default storage class | True |
| Every bucket must have a unique name across Cloud Storage namespace | True |
| Cloud Storage storage classes | Multi-Regional, Regional, Nearline, Coldline |

## 마무리

GSP421은 버킷 이름 충돌만 조심하면 빠르게 끝난다. 같은 명령을 다시 실행할 때는 suffix가 바뀌므로, 채점 중인 버킷 이름과 현재 쉘의 `BUCKET1`, `BUCKET2`가 같은지 확인하자.
