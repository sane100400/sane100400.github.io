---
title: "공룡책 운영체제 정리 04: 스레드와 병행성"
published: 2026-05-27
description: "Operating System Concepts 10판 Ch.04 스레드와 병행성 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 4, **Threads & Concurrency** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 216 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 스레드

- 의미: 프로세스 안의 실행 흐름.
- 기능: 같은 주소 공간을 공유하면서 여러 작업을 동시에 진행한다.
- 주의: 스택과 레지스터는 스레드마다 따로 있고, 힙과 파일은 보통 공유한다.
- 키워드: `thread`, `stack`

### 병행성

- 의미: 여러 작업이 겹쳐 진행되는 성질.
- 기능: 대기 시간이 있는 작업을 효율적으로 섞어 실행한다.
- 주의: 단일 코어에서도 병행성은 가능하다.
- 키워드: `concurrency`

### 병렬성

- 의미: 여러 작업이 같은 순간 실제로 동시에 실행되는 성질.
- 기능: 멀티코어에서 계산량을 나눠 처리한다.
- 주의: 스레드가 많다고 항상 병렬성이 늘지는 않는다.
- 키워드: `parallelism`, `multicore`

### 스레드 모델

- 의미: 사용자 스레드와 커널 스레드를 연결하는 방식.
- 기능: many-to-one, one-to-one, many-to-many로 블로킹과 병렬성 특성이 달라진다.
- 주의: 커널이 스케줄링하는 대상은 결국 커널 스레드다.
- 키워드: `user thread`, `kernel thread`

## 핵심 다이어그램

![스레드와 병행성 - 사용자 스레드와 커널 스레드](/os-concepts/diagrams/os-04-threads-concurrency.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
