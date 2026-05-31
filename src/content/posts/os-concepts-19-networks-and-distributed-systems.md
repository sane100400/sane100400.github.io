---
title: "공룡책 운영체제 정리 19: 네트워크와 분산 시스템"
published: 2026-05-12
description: "Operating System Concepts 10판 Ch.19 네트워크와 분산 시스템 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 19, **Networks and Distributed Systems** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 871 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 분산 시스템

- 의미: 네트워크로 연결된 여러 컴퓨터가 협력하는 시스템.
- 기능: 자원 공유, 확장성, 신뢰성 향상을 노린다.
- 주의: 부분 실패가 핵심 난점이다.
- 키워드: `distributed system`

### 이름 해석

- 의미: 사람이 쓰는 이름을 주소나 위치로 바꾸는 과정.
- 기능: 도메인 이름, 파일 경로, 서비스 이름을 실제 위치와 연결한다.
- 주의: 이름과 위치를 분리해야 이동성과 복제가 쉬워진다.
- 키워드: `naming`, `DNS`

### 프로토콜

- 의미: 통신 주체가 메시지를 주고받는 규칙.
- 기능: 오류 처리, 순서, 흐름 제어, 연결 관리를 정의한다.
- 주의: TCP와 UDP는 신뢰성 제공 방식이 다르다.
- 키워드: `protocol`, `TCP`, `UDP`

### 투명성

- 의미: 분산되어 있다는 사실을 사용자에게 덜 보이게 하는 성질.
- 기능: 위치, 복제, 장애, 이동을 숨긴다.
- 주의: 완전한 투명성은 성능과 복잡도 비용을 만든다.
- 키워드: `transparency`

### 분산 파일 시스템

- 의미: 원격 파일을 로컬 파일처럼 다루는 시스템.
- 기능: 클라이언트 캐시와 서버 저장소를 조합한다.
- 주의: 성능과 일관성 사이의 절충이 핵심이다.
- 키워드: `DFS`, `cache`

## 핵심 다이어그램

![네트워크와 분산 시스템 - 분산 파일 시스템](/os-concepts/diagrams/os-19-networks-and-distributed-systems.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
