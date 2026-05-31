---
title: "Google Cloud Study Jam 실습 글 모음"
published: 2026-05-31
description: "studyjam 스크립트를 랩별로 나눠 정리한 Google Skills 챌린지 랩 실습 목차"
tags: [GCP, Google Cloud, Qwiklabs, Study Jam]
category: Cloud
draft: false
---

`studyjam` 폴더에 있던 정답 스크립트를 랩별로 나눠서 블로그 글로 정리했다. 한 글에 전부 몰아넣으면 검색은 되지만, 실제 실습할 때는 지금 하는 랩만 따로 열어두는 편이 훨씬 편하다.

공통 원칙은 같다.

1. 랩은 시크릿 창에서 연다.
2. `PROJECT_ID`, 리전, 존, 리소스 이름은 자기 랩 화면 값으로 바꾼다.
3. 스크립트는 태스크 하나씩 실행한다.
4. 각 태스크가 끝날 때마다 `Check my progress` 또는 `Verify Task`를 누른다.
5. 채점이 안 되면 다음 태스크로 넘어가기 전에 이름, 리전, 권한 전파, 대기 시간을 먼저 본다.

## ARC 계열

| 랩 | 글 |
|---|---|
| ARC101 | [Monitor and Manage Google Cloud Resources](/posts/google-cloud-studyjam-arc101-monitoring-functions/) |
| ARC104 | [Cloud Run Functions 챌린지 랩 진행 기록](/posts/qwiklabs-arc104-cloud-run-functions/) |
| ARC106 | [Streaming Analytics into BigQuery](/posts/google-cloud-studyjam-arc106-streaming-bigquery/) |
| ARC109 | [Deploy and Secure Serverless APIs with API Gateway](/posts/google-cloud-studyjam-arc109-api-gateway/) |
| ARC111 | [Cloud Storage and Data Protection Solutions](/posts/google-cloud-studyjam-arc111-storage-data-protection/) |
| ARC125 | [Use APIs to Work with Cloud Storage](/posts/google-cloud-studyjam-arc125-cloud-storage-api/) |
| ARC130 | [Analyze Sentiment with Natural Language API](/posts/google-cloud-studyjam-arc130-natural-language/) |
| ARC132 | [Speech and Language Solutions with Pre-trained APIs](/posts/google-cloud-studyjam-arc132-speech-language-api/) |

ARC104는 이미 따로 적어둔 글이 있어서 새로 중복 작성하지 않았다. `fix-cs-tracker-eventarc-permission.txt`, `http-messenger-task3-commands.txt`, `patch-cs-tracker-max-instances.txt`는 ARC104에서 막혔을 때 쓰는 보조 노트라 ARC104 글과 같이 보면 된다.

## GSP 계열

| 랩 | 글 |
|---|---|
| GSP313 | [Implement Load Balancing on Compute Engine](/posts/google-cloud-studyjam-gsp313-load-balancing/) |
| GSP314 | [Set Up a Google Cloud Network](/posts/google-cloud-studyjam-gsp314-google-cloud-network/) |
| GSP315 | [Set Up an App Dev Environment on Google Cloud](/posts/google-cloud-studyjam-gsp315-app-dev-environment/) |
| GSP321 | [Develop your Google Cloud Network](/posts/google-cloud-studyjam-gsp321-develop-cloud-network/) |
| GSP322 | [Build a Secure Google Cloud Network](/posts/google-cloud-studyjam-gsp322-secure-cloud-network/) |
| GSP338 | [Monitor and Log with Google Cloud Observability](/posts/google-cloud-studyjam-gsp338-observability/) |
| GSP421 | [APIs Explorer: Cloud Storage](/posts/google-cloud-studyjam-gsp421-apis-explorer-storage/) |
| GSP345 | [Build Infrastructure with Terraform on Google Cloud](/posts/google-cloud-studyjam-gsp345-terraform/) |
| GSP510 | [Manage Kubernetes in Google Cloud](/posts/google-cloud-studyjam-gsp510-kubernetes/) |

## 읽는 방법

각 글의 명령어는 “그대로 외우는 답”이 아니라 실습 흐름을 맞추는 기준으로 보면 된다. 특히 랩에서 주는 이름은 자주 바뀐다. 글에 나온 변수 이름은 구조를 보여주기 위한 것이고, 실제 값은 랩 패널에서 확인해야 한다.

명령이 성공했는데 채점만 안 되는 경우도 있다. 그럴 때는 1분 정도 기다렸다가 다시 누르거나, 글에 적어둔 확인 명령으로 실제 리소스가 어느 프로젝트와 리전에 만들어졌는지 확인하면 된다.
