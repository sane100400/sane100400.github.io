---
title: "Qwiklabs GSP1151 - Vertex AI 프롬프트 디자인 베스트 프랙티스 정리"
published: 2026-05-03
tags: [GCP, Vertex AI, Gemini, Qwiklabs, Prompt Engineering]
category: Cloud
draft: false
---

Google Skills의 **GSP1151 - Generative AI with Vertex AI: Prompt Design** 랩 정리.
이 랩은 챌린지 랩과 달리 **INSERT 빈칸이 거의 없고 노트북 모든 셀을 위에서부터 실행만 하면 9개 체크포인트가 자동 채점**되는 워밍업 랩이다 (30분, 무료). 그래서 이 글은 "정답 풀이" 가 아니라 **노트북에서 다루는 프롬프트 엔지니어링 베스트 프랙티스 5가지**를 정리한 노트.

핵심 환경:

```python
from google import genai
from google.genai.types import GenerateContentConfig

client = genai.Client(vertexai=True, project=PROJECT_ID, location="global")
MODEL_ID = "gemini-2.5-flash"
```

---

## 1. Be Concise — 군더더기 빼기

LLM 프롬프트는 **노이즈가 곧 의도 오해 가능성**이다. 같은 결과를 얻는다면 짧은 프롬프트가 항상 낫다.

🛑 **Not recommended**

```python
prompt = "What do you think could be a good name for a flower shop that specializes in selling bouquets of dried flowers more than fresh flowers?"
```

✅ **Recommended**

```python
prompt = "Suggest a name for a flower shop that sells bouquets of dried flowers"
```

긴 프롬프트는 모델이 의도를 잘못 잡거나 불필요한 부연을 늘어놓게 만든다.

---

## 2. Be Specific & Well-Defined — 구체적이고 명확하게

너무 일반적인 프롬프트는 일반적인 답변만 받는다. 원하는 산출물의 형태를 명시하라.

🛑 **Not recommended**

```python
prompt = "Tell me about Earth"
```

→ 백과사전 같은 장문이 쏟아짐.

✅ **Recommended**

```python
prompt = "Generate a list of ways that makes Earth unique compared to other planets"
```

→ 비교 관점, 목록 형태가 명확해서 활용 가능한 답이 나옴.

---

## 3. Ask One Task at a Time — 한 번에 하나씩

여러 질문을 한 프롬프트에 묶으면 답변 품질이 떨어지고 답이 어지러워진다.

🛑 **Not recommended**

```python
prompt = "What's the best method of boiling water and why is the sky blue?"
```

✅ **Recommended** — 두 번 따로 호출

```python
prompt1 = "What's the best method of boiling water?"
prompt2 = "Why is the sky blue?"
```

호출 비용이 늘어 보여도, 각 답변의 품질·재사용성이 훨씬 좋다.

---

## 4. Watch Out for Hallucinations — 환각 주의

LLM은 **자신감 있게 틀린 답**을 내놓는다. 특히 실시간 정보 (오늘 날짜, 최신 뉴스 등) 가 그렇다. `temperature=1.0` 으로 올리면 더 잘 드러난다.

```python
generation_config = GenerateContentConfig(temperature=1.0)
prompt = "What day is it today?"
response = client.models.generate_content(model=MODEL_ID, contents=prompt)
```

→ "today's date is usually [Current Date]" 같은 얼버무림이 나옴. **모델은 today 를 모른다.**

대응: 프롬프트에서 사실 검증이 필요한 영역을 분리하고, 외부 데이터 소스 (RAG, 함수 호출, search 도구) 와 연결한다.

### 4-1. System Instructions 로 가드레일 치기

`system_instruction` 으로 모델의 역할·범위를 미리 제한하면, 주제에서 벗어난 질문을 차단할 수 있다.

```python
chat = client.chats.create(
    model=MODEL_ID,
    config=GenerateContentConfig(
        system_instruction=[
            "Hello! You are an AI chatbot for a travel web site.",
            "Your mission is to provide helpful queries for travelers.",
            "Remember that before you answer a question, you must check to see if it complies with your mission.",
            "If not, you can say, Sorry I can't answer that question.",
        ]
    ),
)

chat.send_message("What is the best place for sightseeing in Milan, Italy?")
# → 정상 답변 (밀라노 두오모 등)

chat.send_message("How do I make pizza dough at home?")
# → "Sorry I can't answer that question."
```

여행 챗봇이 갑자기 피자 도우 레시피를 답하지 않게 됨. **Production 챗봇이라면 거의 필수**.

---

## 5. Reduce Variability — Generative → Classification 으로 전환

같은 의도라도 **선택지가 있는 분류 문제**로 바꾸면 출력 변동성이 확 줄어든다.

🛑 **Generative (변동성 높음)**

```python
prompt = "I'm a high school student. Recommend me a programming activity to improve my skills."
```

→ 매번 답이 길고 다름. 평가하기 어려움.

✅ **Classification (변동성 낮음)**

```python
prompt = """I'm a high school student. Which of these activities do you suggest and why:
a) learn Python
b) learn JavaScript
c) learn Fortran
"""
```

→ 모델이 a/b/c 중에서 골라서 비교 분석함. 결과가 일관되고 후처리도 쉬움.

분류 형태는 안전성 측면에서도 유리하다 — 허용된 옵션만 답할 수 있으니 예측 불가능한 출력이 줄어든다.

---

## 6. Few-Shot Examples 로 품질 향상

프롬프트에 예시 1~5개를 넣으면 LLM이 **in-context** 로 답변 패턴을 학습한다.

### Zero-shot

```python
prompt = """Decide whether a Tweet's sentiment is positive, neutral, or negative.

Tweet: I loved the new YouTube video you made!
Sentiment:
"""
```

→ "Positive" (대문자 포함, 형식 일정 X)

### One-shot

```python
prompt = """Decide whether a Tweet's sentiment is positive, neutral, or negative.

Tweet: I loved the new YouTube video you made!
Sentiment: positive

Tweet: That was awful. Super boring 😠
Sentiment:
"""
```

→ "negative" (소문자 통일, 예시 형식 따름)

### Few-shot

예시 2~3개를 추가하면 더 미묘한 케이스도 일관되게 처리. 단 **너무 많으면 over-fit** 되어 오히려 일반화 능력이 떨어진다. **1~5개가 sweet spot**.

추가로 중요한 것:
- 예시는 **실제 분포를 반영** 해야 함 (positive 예시만 5개 넣고 negative 분류를 기대하면 안 됨)
- 예시 품질이 결과 품질을 직접 결정함

---

## 정리

| 원칙 | 한 줄 요약 |
|---|---|
| Concise | 짧게 써라 |
| Specific | 형태/관점을 명시해라 |
| One task | 한 번에 한 가지만 물어라 |
| Hallucinations | 자신만만한 거짓에 속지 마라, 시스템 지시로 막아라 |
| Classification > Generative | 선택지로 바꾸면 일관성 ↑ |
| Few-shot | 예시 1~5개로 형식·품질 잡아라 |

이 6개만 의식적으로 적용해도 같은 모델로 응답 품질이 눈에 띄게 좋아진다.

---

## 부록 — GSP1151 진행 노트

### 채워야 할 것 거의 없음

이 랩은 INSERT 빈칸이 없다. 그냥 노트북 첫 셀부터 끝까지 **Shift+Enter** 로 차례로 실행하면 9개 체크포인트가 알아서 들어옴. **Run All** 한 번이면 끝.

### 함정: import 단계에서 커널 사망

`from google import genai` 또는 `client = genai.Client(...)` 에서 다음 에러:

```
AttributeError: module 'google.auth.transport.mtls' has no attribute 'should_use_client_cert'
```

원인은 Workbench 인스턴스의 `google-auth` 가 너무 구버전. [GSP515 챌린지 랩](/posts/qwiklabs-gsp515-gemini-vertex-ai/) 에서 만난 거랑 동일한 이슈.

해결:

```python
!pip install -q --upgrade google-auth google-genai
```

→ **Kernel → Restart Kernel** → 첫 셀부터 다시 실행.

설치 시 `WARNING: Ignoring invalid distribution -oogle-auth` 같은 경고는 무시해도 됨.

이 에러를 두 번째 만났으니 **Qwiklabs Workbench 이미지 공통 문제**로 봐도 된다. 앞으로 Vertex AI 노트북 랩에서 import 죽으면 위 한 줄이 정답.
