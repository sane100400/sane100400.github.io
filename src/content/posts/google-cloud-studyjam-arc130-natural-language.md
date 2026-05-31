---
title: "Google Cloud Study Jam ARC130 - Natural Language API 감정 분석 실습"
published: 2026-05-31
description: "ARC130 챌린지 랩에서 API key, Apps Script, lab-vm의 Natural Language API 호출을 진행하는 방법"
tags: [GCP, Natural Language API, Apps Script, API Key, Qwiklabs]
category: Cloud
draft: false
---

ARC130은 Natural Language API를 쓰는 랩이다. Cloud Shell에서 API key를 만들고, Google Docs의 Apps Script에 붙여 넣고, lab-vm에서 syntax 분석과 multilingual entity 분석을 실행한다.

이 랩은 API key 채점이 조금 예민하다. 제한을 건 키보다 기본 이름의 제한 없는 키가 더 잘 잡히는 경우가 있다.

## Task 1. API key 만들기

프로젝트를 맞추고 API를 켠다.

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"

gcloud config set project "$PROJECT_ID"
gcloud services enable language.googleapis.com apikeys.googleapis.com --project="$PROJECT_ID"
```

채점용 키는 일단 제한 없이 만든다.

```bash
KEY_DISPLAY_NAME="API key 1"

gcloud services api-keys create \
  --display-name="$KEY_DISPLAY_NAME" \
  --project="$PROJECT_ID"

KEY_NAME=$(gcloud services api-keys list \
  --filter="displayName=$KEY_DISPLAY_NAME" \
  --project="$PROJECT_ID" \
  --format="value(name)" \
  | head -n 1)

export API_KEY=$(gcloud services api-keys get-key-string "$KEY_NAME" \
  --project="$PROJECT_ID" \
  --format="value(keyString)")
```

`Check my progress`가 안 넘어가면 `gcloud alpha services api-keys create --display-name="API key 1"` 방식으로 한 번 더 만들어 본다. 그래도 안 되면 콘솔에서 직접 만드는 게 낫다.

## 콘솔에서 API key를 만들 때

브라우저가 개인 계정으로 열려 있으면 권한 오류가 난다. 시크릿 창에서 랩의 **Open Google Console** 버튼으로 들어가고, 오른쪽 위 계정이 `student-...@qwiklabs.net`인지 확인한다.

경로는 다음과 같다.

```text
APIs & Services > Credentials > Create credentials > API key
```

생성된 키는 복사해 둔다. 제한 설정은 하지 않고 닫아도 된다.

## Task 2. Google Docs와 Apps Script

이 태스크는 Cloud Shell보다 콘솔과 문서 화면에서 진행한다.

1. 새 Google Docs 문서를 만든다.
2. `Extensions > Apps Script`를 연다.
3. 랩에 나온 Apps Script 코드를 붙여 넣는다.
4. `retrieveSentiment` 함수 안의 API key 자리에 방금 만든 키를 넣는다.
5. 저장하고 실행 권한을 승인한다.
6. 문서를 새로고침한 뒤 텍스트를 선택한다.
7. 메뉴에서 `Natural Language Tools > Mark Sentiment`를 실행한다.

여기서는 코드 자체보다 브라우저 계정이 더 자주 문제다. 문서와 콘솔이 같은 랩 계정으로 열려 있는지 확인한다.

## lab-vm 접속

Task 3부터는 `lab-vm` 안에서 실행한다.

```bash
ZONE=$(gcloud compute instances list \
  --filter="name=lab-vm" \
  --project="$PROJECT_ID" \
  --format="value(zone)" \
  | head -n 1)

gcloud compute ssh lab-vm --zone="$ZONE" --project="$PROJECT_ID"
```

VM 안으로 들어간 뒤 API key를 다시 export한다.

```bash
export API_KEY="PASTE_API_KEY_HERE"
```

## Task 3. Syntax와 품사 분석

요청 JSON을 만들고 `documents:analyzeSyntax`를 호출한다.

```bash
cat > analyze-request.json <<'EOF'
{
  "document":{
    "type":"PLAIN_TEXT",
    "content": "Google, headquartered in Mountain View, unveiled the new Android phone at the Consumer Electronic Show. Sundar Pichai said in his keynote that users love their new Android phones."
  },
  "encodingType": "UTF8"
}
EOF

curl -s -H "Content-Type: application/json" \
  "https://language.googleapis.com/v1/documents:analyzeSyntax?key=${API_KEY}" \
  -d @analyze-request.json > analyze-response.txt
```

응답 파일이 만들어졌는지 확인하고 채점한다.

## Task 4. 다국어 Natural Language 처리

프랑스어 문장을 entity 분석 API에 보낸다.

```bash
cat > multi-nl-request.json <<'EOF'
{
  "document":{
    "type":"PLAIN_TEXT",
    "content":"Le bureau japonais de Google est situé à Roppongi Hills, Tokyo."
  }
}
EOF

curl -s -H "Content-Type: application/json" \
  "https://language.googleapis.com/v1/documents:analyzeEntities?key=${API_KEY}" \
  -d @multi-nl-request.json > multi-response.txt
```

마지막으로 파일 4개가 있는지 확인한다.

```bash
ls -l analyze-request.json analyze-response.txt multi-nl-request.json multi-response.txt
```

## 마무리

ARC130은 API 호출보다 API key 생성과 브라우저 계정이 더 까다롭다. Task 1이 안 잡히면 키 제한을 먼저 풀고, 그래도 안 되면 콘솔에서 `API key 1` 이름으로 직접 만들어 보자.
