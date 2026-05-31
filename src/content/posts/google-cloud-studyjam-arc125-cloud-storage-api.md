---
title: "Google Cloud Study Jam ARC125 - Cloud Storage JSON API로 버킷 다루기"
published: 2026-05-31
description: "ARC125 챌린지 랩에서 gsutil 대신 curl과 Cloud Storage JSON API로 버킷과 객체를 조작하는 방법"
tags: [GCP, Cloud Storage, REST API, curl, Qwiklabs]
category: Cloud
draft: false
---

ARC125는 Cloud Storage를 CLI로 다루는 랩처럼 보이지만, 실제 채점 포인트는 JSON API 사용이다. `gsutil`이나 `gcloud storage`로 같은 결과를 만들어도 채점이 안 될 수 있다. 이 랩에서는 `curl`로 REST API를 호출해야 한다.

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export BUCKET_1="${PROJECT_ID}-bucket-1"
export BUCKET_2="${PROJECT_ID}-bucket-2"
export OBJECT_NAME="world-map.png"
export TOKEN="$(gcloud auth print-access-token)"

gcloud config set project "$PROJECT_ID"
```

토큰은 시간이 지나면 만료될 수 있다. 중간에 `401`이 나오면 `export TOKEN="$(gcloud auth print-access-token)"`를 다시 실행한다.

## Task 1. JSON API로 버킷 2개 만들기

요청 본문을 JSON 파일로 만든 뒤 `storage/v1/b` endpoint에 POST한다.

```bash
cat > bucket1.json <<EOF
{
  "name": "${BUCKET_1}",
  "location": "us",
  "storageClass": "multi_regional"
}
EOF

curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @bucket1.json \
  "https://storage.googleapis.com/storage/v1/b?project=${PROJECT_ID}"
```

두 번째 버킷도 같은 방식으로 만든다. 여기까지 끝나면 채점한다.

## Task 2. 객체 업로드

업로드는 `/upload/storage/v1/b/{bucket}/o` endpoint를 쓴다.

```bash
curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: image/png" \
  --data-binary @"${OBJECT_NAME}" \
  "https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_1}/o?uploadType=media&name=${OBJECT_NAME}"
```

원본 이미지가 없으면 스크립트처럼 1x1 PNG를 base64로 만들어도 된다. 채점은 보통 파일명과 위치를 본다.

## Task 3. 객체 복사

버킷 1의 객체를 버킷 2로 복사한다.

```bash
curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary '{}' \
  "https://storage.googleapis.com/storage/v1/b/${BUCKET_1}/o/${OBJECT_NAME}/copyTo/b/${BUCKET_2}/o/${OBJECT_NAME}"
```

복사가 됐는지 확인한다.

```bash
curl -H "Authorization: Bearer ${TOKEN}" \
  "https://storage.googleapis.com/storage/v1/b/${BUCKET_2}/o/${OBJECT_NAME}"
```

객체는 보이는데 채점이 안 되면 `rewriteTo` endpoint를 한 번 더 써보는 fallback이 있다. 그래도 `gsutil cp`로 바꾸지는 않는 게 좋다.

## Task 4. 객체 공개

객체 ACL에 `allUsers: READER`를 추가한다.

```bash
cat > public-acl.json <<'EOF'
{
  "entity": "allUsers",
  "role": "READER"
}
EOF

curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @public-acl.json \
  "https://storage.googleapis.com/storage/v1/b/${BUCKET_2}/o/${OBJECT_NAME}/acl"
```

공개 URL은 아래처럼 확인한다.

```bash
curl -I "https://storage.googleapis.com/${BUCKET_2}/${OBJECT_NAME}"
```

## Task 5. 객체와 버킷 삭제

마지막은 버킷 1의 객체와 버킷 1을 삭제한다.

```bash
curl -X DELETE \
  -H "Authorization: Bearer ${TOKEN}" \
  "https://storage.googleapis.com/storage/v1/b/${BUCKET_1}/o/${OBJECT_NAME}"

curl -X DELETE \
  -H "Authorization: Bearer ${TOKEN}" \
  "https://storage.googleapis.com/storage/v1/b/${BUCKET_1}"
```

## 마무리

ARC125의 함정은 “결과가 같으면 되겠지”라고 생각하는 것이다. 이 랩은 Cloud Storage JSON API를 쓰는 연습이라 REST 호출 자체가 채점 포인트다. 끝까지 `curl`로 진행하자.
