---
title: "Qwiklabs GSP515 - Gemini API in Vertex AI 챌린지 랩 후기 (삽질 포함)"
published: 2026-05-03
tags: [GCP, Vertex AI, Gemini, Qwiklabs]
category: Cloud
draft: false
---

Google Skills의 챌린지 랩 **GSP515 - Explore Generative AI with the Gemini API in Vertex AI: Challenge Lab** 를 진행하면서 마주친 이슈들을 정리한다. 단순 정답 노트라기보다는, 같은 함정에 빠질 사람들을 위한 실전 가이드.

## 랩 개요

- 25분 / 5크레딧 / Intermediate
- 4개 태스크: API 활성화 → curl로 Gemini 호출 → Workbench 노트북에서 Function Call → Video 설명
- 모델: `gemini-2.5-flash`, Region: `us-west1`

---

## 0. 시작 전 — 시크릿 탭 필수

**일반 탭에서 시작하면 안 된다.** 본인 개인 Google 계정과 Qwiklabs 학생 계정이 충돌해서 채점이 꼬인다 (실제로 한 번 망함).

- Chrome 시크릿 창 (Ctrl+Shift+N) 새로 열기
- 거기서 학생 계정으로만 콘솔 진입
- Cloud Shell도 시크릿 창 안에서만 사용

---

## Task 1. Cloud Shell에서 curl로 Gemini 호출

### 환경변수 설정

```bash
PROJECT_ID=qwiklabs-gcp-XX-XXXXXXXX
LOCATION=us-west1
API_ENDPOINT=${LOCATION}-aiplatform.googleapis.com
MODEL_ID="gemini-2.5-flash"
```

### API 활성화

```bash
gcloud services enable aiplatform.googleapis.com notebooks.googleapis.com compute.googleapis.com --project=$PROJECT_ID
```

### curl 호출 (한 줄로!)

```bash
curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" -H "Content-Type: application/json" "https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent" -d '{"contents":[{"role":"user","parts":[{"text":"Why is the sky blue?"}]}]}'
```

### 함정 1 — `bad substitution`

랩 페이지의 curl 예시를 그대로 복사하면 `${MODEL_ID}` 와 `:generateContent` 사이에 **줄바꿈**이 들어가서 bash가 변수명을 깨먹는다.

```
-bash: https://...${MODEL_ID
  }:generateContent: bad substitution
```

**해결:** 백슬래시 줄바꿈 다 제거하고 한 줄로 통째 실행. 또는 URL을 변수에 먼저 담기:

```bash
URL="https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent"
curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" -H "Content-Type: application/json" "$URL" -d '{"contents":[{"role":"user","parts":[{"text":"Why is the sky blue?"}]}]}'
```

### 함정 2 — 채점이 안 된다 (가장 큰 삽질)

호출 성공 (`finishReason: STOP`) 했는데 채점기가 점수 0점만 띄움. Audit log 확인하면 호출 기록은 정상:

```bash
gcloud logging read 'protoPayload.serviceName="aiplatform.googleapis.com"' --limit=3 --format="value(timestamp,protoPayload.methodName)"
```

→ `PredictionService.GenerateContent` 잡힘.

**결국 답은 랩 종료 → 새 랩 시작.** 첫 번째 랩의 채점기가 깨진 케이스. 새 시크릿 창에서 새 PROJECT_ID로 다시 하니 한 번에 통과.

> 교훈: 채점기가 5분 넘게 안 잡으면 그냥 랩 종료/재시작이 답. 시간 더 안 버린다.

### 함정 3 — `Enable required API` 체크가 따로 안 잡힘

콘솔에서 Vertex AI API만 켜면 충분할 줄 알았지만 채점기는 추가로 보는 게 있음. 한 줄로:

```bash
gcloud services enable aiplatform.googleapis.com notebooks.googleapis.com compute.googleapis.com --project=$PROJECT_ID
```

---

## Task 2. Vertex AI Workbench 노트북 열기

콘솔 → **Vertex AI > Workbench** → `generative-ai-jupyterlab` → **OPEN JUPYTERLAB**
→ `gemini-explorer-challenge.ipynb` → 커널 **Python 3**

---

## Task 3. Function Call (INSERT 채우기)

이 노트북은 **새 Gen AI SDK** (`google-genai`) 사용. 채워야 하는 부분:

| 자리 | 정답 |
|---|---|
| `<<INSERT CORRECT MODEL NAME HERE>>` | `gemini-2.5-flash` |
| Task 3.2 `INSERT CORRECT CLASSNAME` | `FunctionDeclaration` |
| Task 3.3 `INSERT CORRECT CLASSNAME` | `Tool` (대문자 T) |

```python
get_current_weather_func = FunctionDeclaration(
    name="get_current_weather",
    description="Get the current weather in a given location",
    parameters={
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "The city and state"}
        },
    },
)

weather_tool = Tool(function_declarations=[get_current_weather_func])
```

### 함정 4 — 커널 사망 / `AttributeError: should_use_client_cert`

`from google import genai` 단계에서 커널이 죽거나 mtls 에러 뜸.

**원인:** Workbench 인스턴스의 `google-auth` 가 너무 구버전.

**해결:**

```python
!pip install -q --upgrade google-auth google-genai
```

→ **Kernel → Restart Kernel** → 첫 셀부터 다시.

그래도 죽으면 클린 재설치:

```python
!pip uninstall -y google-genai google-auth
!pip install -q --upgrade --no-cache-dir google-genai google-auth google-cloud-aiplatform
```

→ 재시작.

`-oogle-auth` invalid distribution 경고는 무시해도 됨. `gcsfs / pandas-gbq` 의존성 경고도 이 랩과 무관.

---

## Task 4. Video 설명

Video URI는 셀 주석에 적혀 있음:

```
gs://github-repo/img/gemini/multimodality_usecases_overview/mediterraneansea.mp4
```

채울 값:

| 자리 | 정답 |
|---|---|
| `INPUT CORRECT CLASSNAME.from_uri` | `Part.from_uri` |
| `INSERT VIDEO URI` | 위 URI |
| `client.models.INSERT CORRECT METHOD NAME` | `generate_content_stream` |

`for response in responses:` 루프가 있으니까 streaming 메서드 (`generate_content_stream`) 가 정답.

```python
video = Part.from_uri(
    file_uri="gs://github-repo/img/gemini/multimodality_usecases_overview/mediterraneansea.mp4",
    mime_type="video/mp4",
)
contents = [prompt, video]

responses = client.models.generate_content_stream(
    model=multimodal_model,
    contents=contents
)
```

---

## 정리 — 다음에 같은 랩 할 사람을 위한 체크리스트

1. **시크릿 창 사용** (개인 계정과 충돌 방지)
2. curl은 **한 줄로 통째 실행** (줄바꿈 = `bad substitution`)
3. API 활성화는 `gcloud services enable aiplatform.googleapis.com notebooks.googleapis.com compute.googleapis.com` 한 방
4. Task 1 채점 5분 넘게 안 들어오면 **랩 재시작이 답**
5. 노트북 import 단계에서 죽으면 **`google-auth` + `google-genai` 업그레이드 → 커널 재시작**
6. Task 3/4 의 INSERT는 `FunctionDeclaration`, `Tool`, `Part.from_uri`, `generate_content_stream`

---

## 후기

랩 자체는 25분짜리지만 채점기 이슈로 시간 절반은 삽질로 날렸다. Qwiklabs 챌린지 랩은 **인내심 < 재시작 결단** 이 더 빠르다는 걸 배움.
