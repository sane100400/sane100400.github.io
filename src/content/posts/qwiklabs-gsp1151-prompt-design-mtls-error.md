---
title: "Qwiklabs GSP1151 - Prompt Design 랩에서 google-genai mtls 에러"
published: 2026-05-03
tags: [GCP, Vertex AI, Gemini, Qwiklabs, Troubleshooting]
category: Cloud
draft: false
---

Google Skills의 **GSP1151 - Generative AI with Vertex AI: Prompt Design** 랩.
이전 [GSP515 챌린지 랩](/posts/qwiklabs-gsp515-gemini-vertex-ai/) 에서 만났던 똑같은 에러가 또 나옴. 이 랩은 **Run All만 누르면 끝나는** 워밍업 랩이라 실제 작업은 거의 없는데, 노트북 환경 자체에 문제가 있어서 결국 똑같은 워크어라운드를 반복해야 한다.

## 에러

`from google import genai` 후 `client = genai.Client(vertexai=True, ...)` 실행하면:

```
AttributeError: module 'google.auth.transport.mtls' has no attribute 'should_use_client_cert'
```

Traceback 끝부분:

```python
File /opt/conda/lib/python3.10/site-packages/google/genai/_api_client.py:868
    and mtls.should_use_client_cert()  # type: ignore[no-untyped-call]
```

## 원인

Qwiklabs Workbench 인스턴스에 **`google-auth` 가 너무 구버전**으로 깔려 있음. 새 버전 `google-genai` 가 `mtls.should_use_client_cert()` 헬퍼를 호출하는데, 구버전 `google-auth` 에는 그 함수가 없어서 AttributeError.

GSP515 챌린지 랩의 Workbench 인스턴스(`generative-ai-jupyterlab`) 와 GSP1151의 인스턴스(`workbench-notebook`) **둘 다 동일한 문제**가 있음. Qwiklabs 측 이미지 업데이트가 안 된 듯.

## 해결

새 셀 만들어서:

```python
!pip install -q --upgrade google-auth google-genai
```

→ JupyterLab 메뉴 **Kernel → Restart Kernel** → Restart 클릭
→ 첫 셀부터 다시 실행 (Run All 또는 Shift+Enter)

그러면 `client = genai.Client(...)` 정상 통과.

설치 시 나오는 경고들은 무시해도 됨:

- `WARNING: Ignoring invalid distribution -oogle-auth` — 깨진 이전 설치 흔적
- `gcsfs / pandas-gbq / google-api-python-client requires google-auth-oauthlib` — 이 랩에서 안 쓰는 패키지

## 그래도 죽으면

커널이 import 단계에서 사망 (`The kernel for ... appears to have died`) 하면 클린 재설치:

```python
!pip uninstall -y google-genai google-auth google-auth-oauthlib google-auth-httplib2
!pip install -q --upgrade --no-cache-dir google-genai google-auth google-cloud-aiplatform
```

→ Kernel Restart → 첫 셀부터.

그래도 안 되면 **Workbench 인스턴스 자체 Stop → Start**:

1. 콘솔 → Vertex AI → Workbench
2. 인스턴스 체크 → 상단 **STOP**
3. "Stopped" 되면 → **START**
4. **OPEN JUPYTERLAB** → 노트북 다시 열기

## GSP1151 랩 자체에 대한 노트

이 랩은 INSERT 빈칸이 거의 없고 **노트북 모든 셀을 위에서부터 실행하기만 하면 9개 체크포인트가 자동으로 채점**된다.

순서:

1. 패키지 설치 + import (여기서 에러 발생 → 위 워크어라운드)
2. Be concise, Be specific, Ask one task at a time, Watch out for hallucinations
3. System instructions로 가드레일 / Generative vs Classification
4. Few-shot examples로 응답 품질 향상

총 100점, 30분 안에 끝남. 쉬운데 **첫 import 셀에서 막히면 시간 다 날아감**.

## 결론

같은 mtls 에러를 두 번째 만났으니 **Qwiklabs Workbench 이미지의 공통 문제**로 봐도 됨. 앞으로 어떤 Vertex AI 랩이든 노트북 import에서 죽으면 바로 위의 `pip install --upgrade google-auth google-genai` + Kernel Restart 가 정답.
