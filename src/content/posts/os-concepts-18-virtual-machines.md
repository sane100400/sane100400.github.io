---
title: "공룡책 운영체제 정리 18: 가상 머신"
published: 2026-05-13
description: "Operating System Concepts 10판 Ch.18 가상 머신 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 18, **Virtual Machines** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 838 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 가상 머신

- 의미: 소프트웨어로 만든 독립 실행 환경.
- 기능: 하나의 물리 장치 위에서 여러 OS나 실행 환경을 격리한다.
- 주의: VM은 컨테이너보다 아래 계층, 즉 하드웨어 가상화에 가깝다.
- 키워드: `VM`

### 하이퍼바이저

- 의미: 가상 머신을 만들고 물리 자원을 나눠 주는 계층.
- 기능: CPU, 메모리, I/O, 저장장치를 가상화한다.
- 주의: Type 1은 하드웨어 위, Type 2는 호스트 OS 위에서 동작한다.
- 키워드: `hypervisor`

### Trap-and-emulate

- 의미: 민감한 명령을 잡아 하이퍼바이저가 대신 처리하는 방식.
- 기능: 게스트 OS가 직접 하드웨어를 만지는 것처럼 보이게 한다.
- 주의: 모든 민감 명령이 자동으로 trap되는 것은 아니다.
- 키워드: `trap`

### Binary translation

- 의미: 문제가 되는 명령을 안전한 명령열로 바꾸는 방식.
- 기능: 하드웨어 지원이 부족한 환경에서 가상화를 가능하게 한다.
- 주의: 성능 비용이 있다.
- 키워드: `binary translation`

### Live migration

- 의미: 실행 중인 VM을 다른 물리 호스트로 옮기는 기술.
- 기능: 서비스 중단을 줄이며 유지보수와 부하 분산을 돕는다.
- 주의: 메모리 변경분과 I/O 상태 처리가 어렵다.
- 키워드: `live migration`

## 핵심 다이어그램

![가상 머신 - Type 1과 Type 2 하이퍼바이저](/os-concepts/diagrams/os-18-virtual-machines.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
