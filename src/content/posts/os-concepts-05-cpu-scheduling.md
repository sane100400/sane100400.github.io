---
title: "공룡책 운영체제 정리 05: CPU 스케줄링"
published: 2026-05-26
description: "Operating System Concepts 10판 Ch.05 CPU 스케줄링 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 5, **CPU Scheduling** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 266 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### CPU 스케줄러

- 의미: 준비 큐에서 다음 실행 대상을 고르는 커널 구성 요소.
- 기능: CPU 이용률, 처리량, 응답 시간, 대기 시간을 조절한다.
- 주의: 스케줄러가 고르고 디스패처가 실제 문맥 교환을 수행한다.
- 키워드: `scheduler`, `ready queue`

### 선점형 스케줄링

- 의미: 실행 중인 프로세스를 중간에 빼앗을 수 있는 방식.
- 기능: 대화형 시스템의 응답성을 높인다.
- 주의: 공유 자료구조 보호가 더 중요해진다.
- 키워드: `preemption`

### FCFS/SJF/RR

- 의미: 대표적인 기본 스케줄링 알고리즘.
- 기능: FCFS는 단순하고, SJF는 평균 대기 시간을 줄이며, RR은 시간 할당량으로 응답성을 만든다.
- 주의: SJF는 다음 CPU burst를 알아야 한다는 한계가 있다.
- 키워드: `FCFS`, `SJF`, `RR`

### MLFQ

- 의미: 여러 큐와 피드백으로 작업 성격을 반영하는 방식.
- 기능: 짧고 상호작용적인 작업에 빠른 응답을 주면서 긴 작업도 처리한다.
- 주의: 큐 이동 규칙과 aging이 핵심이다.
- 키워드: `MLFQ`, `aging`

### 실시간 스케줄링

- 의미: 마감 시간을 기준으로 CPU를 배정하는 방식.
- 기능: 평균 성능보다 deadline 보장을 우선한다.
- 주의: 실시간은 단순히 빠르다는 뜻이 아니다.
- 키워드: `deadline`, `EDF`

## 핵심 다이어그램

![CPU 스케줄링 - CPU 스케줄링 위치](/os-concepts/diagrams/os-05-cpu-scheduling.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
