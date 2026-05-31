---
title: "공룡책 운영체제 정리 07: 동기화 예제"
published: 2026-05-24
description: "Operating System Concepts 10판 Ch.07 동기화 예제 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 7, **Synchronization Examples** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 375 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### Bounded Buffer

- 의미: 크기가 제한된 버퍼를 생산자와 소비자가 공유하는 문제.
- 기능: empty/full/mutex를 나눠 버퍼 상태와 접근을 제어한다.
- 주의: 빈 칸 수와 상호 배제는 다른 문제다.
- 키워드: `producer`, `consumer`

### Readers-Writers

- 의미: 여러 reader와 단독 writer의 균형 문제.
- 기능: 읽기 동시성을 살리면서 쓰기 일관성을 보장한다.
- 주의: reader 우선 정책은 writer starvation을 만들 수 있다.
- 키워드: `reader`, `writer`

### Dining Philosophers

- 의미: 여러 프로세스가 둘 이상의 자원을 동시에 요구하는 문제.
- 기능: 원형 대기와 자원 획득 순서의 위험을 보여 준다.
- 주의: 교착 상태를 막아도 starvation은 따로 봐야 한다.
- 키워드: `circular wait`

### 커널 동기화

- 의미: 커널 내부 자료구조를 보호하는 동기화.
- 기능: 스핀락, 세마포어, 원자 연산 등 상황에 맞는 도구를 쓴다.
- 주의: 커널에서는 잠든 상태로 기다릴 수 없는 문맥도 있다.
- 키워드: `spinlock`, `atomic`

## 핵심 다이어그램

![동기화 예제 - 생산자-소비자 구조](/os-concepts/diagrams/os-07-synchronization-examples.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
