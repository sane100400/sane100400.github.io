---
title: "Google Cloud Study Jam ARC111 - Cloud Storage와 데이터 보호 실습"
published: 2026-05-31
description: "ARC111 챌린지 랩에서 Coldline 버킷, retention policy, 객체 업로드를 태스크별로 진행하는 방법"
tags: [GCP, Cloud Storage, Qwiklabs]
category: Cloud
draft: false
---

ARC111은 Cloud Storage 기초 태스크가 짧게 이어지는 랩이다. 버킷 하나를 새로 만들고, 미리 만들어진 버킷에 retention policy를 걸고, 다른 버킷에는 파일을 올린다.

이 랩은 `Check my progress` 대신 `Verify Task`를 누르는 형식이다. 스크립트도 태스크가 끝날 때마다 멈추도록 되어 있다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | Coldline storage class를 가진 새 버킷을 만든다. | `gsutil mb`는 make bucket이다. `-p`는 프로젝트, `-l`은 위치, `-c COLDLINE`은 기본 storage class를 정한다. |
| Task 2 | 이미 만들어진 버킷에 짧은 retention policy를 설정한다. | `gsutil retention set 30s`는 객체를 최소 30초 동안 삭제하지 못하게 하는 정책이다. 새 버킷을 만드는 과제가 아니라 기존 버킷 이름을 정확히 써야 한다. |
| Task 3 | 지정된 운영 버킷에 테스트 파일을 업로드한다. | `gsutil cp`의 목적지는 `gs://버킷/객체명`이다. 채점기는 파일 내용보다 객체가 요구한 버킷과 이름으로 존재하는지를 본다. |

## 시작 값

버킷 이름 3개는 랩마다 다르다. 특히 `BUCKET2`, `BUCKET3`는 이미 만들어져 있는 버킷일 수 있으니 스크립트 값만 믿지 말고 랩 화면을 본다.

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-central1"

export BUCKET1="...-bucket"
export BUCKET2="...-gcs-bucket"
export BUCKET3="...-bucket-ops"

gcloud config set project "$PROJECT_ID"
gcloud config set compute/region "$REGION"
```

## Task 1. Coldline 버킷 만들기

첫 번째 태스크는 새 버킷을 `COLDLINE` storage class로 만드는 것이다.

```bash
gsutil mb \
  -p "$PROJECT_ID" \
  -l "$REGION" \
  -c COLDLINE \
  "gs://${BUCKET1}"

gsutil ls -L -b "gs://${BUCKET1}"
```

`Storage class: COLDLINE`이 보이면 `Verify Task`를 누른다.

## Task 2. Retention policy 설정

두 번째 버킷에는 30초 retention policy를 건다.

```bash
gsutil retention set 30s "gs://${BUCKET2}"
gsutil retention get "gs://${BUCKET2}"
```

이미 있는 버킷에 정책을 붙이는 태스크라 버킷 이름을 틀리면 바로 실패한다. `gsutil ls`로 버킷이 있는지 먼저 확인해도 된다.

## Task 3. 파일 업로드

마지막은 간단한 텍스트 파일을 만들어 지정된 버킷에 올리는 태스크다.

```bash
echo "ARC111 object upload test - $(date -u)" > arc111-object.txt

gsutil cp arc111-object.txt "gs://${BUCKET3}/arc111-object.txt"
gsutil ls "gs://${BUCKET3}"
```

업로드한 객체가 보이면 `Verify Task`를 누른다.

## 마무리

ARC111은 어렵지 않지만 버킷 이름이 세 개라 헷갈리기 쉽다. 태스크마다 대상 버킷이 다르다. 새로 만드는 건 `BUCKET1`, retention은 `BUCKET2`, 파일 업로드는 `BUCKET3`라고 기억하면 된다.
