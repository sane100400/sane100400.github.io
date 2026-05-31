---
title: "Google Cloud Study Jam ARC132 - Speech와 Translation API 실습"
published: 2026-05-31
description: "ARC132 챌린지 랩에서 Text-to-Speech, Speech-to-Text, Translation API를 lab-vm에서 호출하는 방법"
tags: [GCP, Speech API, Text-to-Speech, Translation API, API Key, Qwiklabs]
category: Cloud
draft: false
---

ARC132는 사전 학습 API를 여러 개 호출하는 랩이다. API key를 만든 뒤 lab-vm에서 Text-to-Speech, Speech-to-Text, Translation, language detection을 차례대로 실행한다.

이 랩은 지시문이 콘솔에서 API key를 만들라고 요구한다. Cloud Shell 명령으로 우회하기보다 콘솔에서 만드는 편이 채점이 잘 잡힌다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | Speech, Text-to-Speech, Translation API 호출에 쓸 API key를 만든다. | 콘솔 생성이 채점에 잘 잡힌다. 이후 Cloud Shell에서는 key string만 `API_KEY`로 export해서 lab-vm에 가져간다. |
| Task 2 | Text-to-Speech API로 텍스트를 MP3 음성 파일로 바꾼다. | 요청 JSON의 `voice.languageCode`, `voice.name`, `audioEncoding`이 출력 음성 조건이다. 응답의 `audioContent`는 base64라서 `tts_decode.py`로 디코딩해야 실제 MP3가 된다. |
| Task 3 | Cloud Speech API로 FLAC 오디오를 프랑스어 텍스트로 변환한다. | `encoding`, `sampleRateHertz`, `languageCode`가 오디오와 맞아야 한다. 오디오는 `gs://...` URI로 넘기므로 로컬 다운로드가 필요 없다. |
| Task 4 | Translation API로 일본어 문장을 영어로 번역한다. | `q`는 번역할 원문, `target`은 목표 언어다. `format: text`는 HTML이 아닌 일반 텍스트로 처리하겠다는 뜻이다. |
| Task 5 | Translation detect endpoint로 문장의 언어를 감지한다. | `/detect` endpoint를 쓰며, 응답의 `language`와 `confidence`를 보면 어떤 언어로 판정됐는지 알 수 있다. |

## Task 1. API key 만들기

프로젝트를 맞추고 API Keys API를 켠다.

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"

gcloud config set project "$PROJECT_ID"
gcloud services enable apikeys.googleapis.com --project="$PROJECT_ID"
```

그다음 콘솔에서 직접 키를 만든다.

```text
APIs & Services > Credentials > Create credentials > API key
```

오른쪽 위 계정이 랩 학생 계정인지 꼭 확인한다. 생성된 키는 복사해서 `API_KEY`로 쓴다.

```bash
export API_KEY="PASTE_CONSOLE_API_KEY_HERE"
```

키를 잃어버렸고 display name이 `API key 1`이면 Cloud Shell에서 다시 읽을 수 있다.

```bash
KEY_NAME=$(gcloud services api-keys list \
  --project="$PROJECT_ID" \
  --format="json(name,displayName)" \
  | jq -r '.[] | select(.displayName == "API key 1") | .name' \
  | head -n 1)
```

## 나머지 API 활성화와 lab-vm 접속

```bash
gcloud services enable \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  translate.googleapis.com \
  --project="$PROJECT_ID"
```

이후 `lab-vm`에 접속한다.

```bash
ZONE=$(gcloud compute instances list \
  --filter="name=lab-vm" \
  --project="$PROJECT_ID" \
  --format="value(zone)" \
  | head -n 1)

gcloud compute ssh lab-vm --zone="$ZONE" --project="$PROJECT_ID"
```

VM 안에서는 가상환경을 켜고 API key를 다시 export한다.

```bash
export API_KEY="PASTE_API_KEY_HERE"
source venv/bin/activate
```

## Task 2. Text-to-Speech

요청 JSON을 만들고 `text:synthesize`를 호출한다.

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  --data-binary @synthesize-text.json \
  "https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}" \
  > synthesize-text.txt
```

응답의 `audioContent`는 base64라서 MP3 파일로 디코딩해야 한다. 스크립트의 `tts_decode.py`가 그 역할을 한다.

```bash
python tts_decode.py \
  --input "synthesize-text.txt" \
  --output "synthesize-text-audio.mp3"
```

`synthesize-text-audio.mp3` 파일이 생기면 채점한다.

## Task 3. Speech-to-Text

프랑스어 FLAC 샘플을 Cloud Speech API에 보낸다.

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  --data-binary @speech_request_fr.json \
  "https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}" \
  > speech_response.json
```

응답에 `transcript`가 보이면 된다.

## Task 4. Translation

일본어 문장을 영어로 번역한다.

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  --data-binary @translate_request.json \
  "https://translation.googleapis.com/language/translate/v2?key=${API_KEY}" \
  > translated_response.txt
```

## Task 5. Language detection

마지막은 언어 감지 endpoint다.

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  --data-binary @detect_request.json \
  "https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}" \
  > detection_response.txt
```

최종 파일들을 한 번에 확인한다.

```bash
ls -l \
  synthesize-text.json \
  synthesize-text.txt \
  synthesize-text-audio.mp3 \
  speech_request_fr.json \
  speech_response.json \
  translated_response.txt \
  detection_response.txt
```

## 마무리

ARC132는 API별 요청 파일과 응답 파일 이름을 채점기가 보는 랩이다. 호출이 성공했어도 파일명을 다르게 저장하면 안 잡힐 수 있다. 스크립트의 파일명은 그대로 두고 API key 값만 바꾸는 쪽이 안전하다.
