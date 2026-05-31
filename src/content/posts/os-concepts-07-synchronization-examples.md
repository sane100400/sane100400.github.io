---
title: "공룡책 운영체제 정리 07: 동기화 예제"
published: 2026-05-24
description: "Operating System Concepts 10판 Ch.07 동기화 예제 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 7, **Synchronization Examples** 정리다.

공룡책 10판 기준 PDF p.375 근처에서 시작한다. bounded-buffer, readers-writers, dining philosophers 문제부터 동기화 도구를 조합할 때 무엇을 분리해서 봐야 하는지까지 차례로 정리한다.

## 먼저 볼 부분

- bounded-buffer, readers-writers, dining philosophers 문제
- 동기화 도구를 조합할 때 무엇을 분리해서 봐야 하는지
- Linux, Windows 같은 실제 커널의 동기화 선택
- POSIX mutex, semaphore, condition variable 사용 감각

## 생산자-소비자 문제

bounded-buffer 문제는 생산자가 데이터를 넣고 소비자가 데이터를 꺼내는 구조다. 여기에는 두 종류의 조건이 있다. 버퍼에 빈 칸이 있어야 생산자가 넣을 수 있고, 버퍼에 데이터가 있어야 소비자가 꺼낼 수 있다. 동시에 버퍼 자료구조 자체는 한 번에 하나만 수정해야 한다.

그래서 empty, full, mutex 같은 역할을 분리한다. 빈 칸 수를 세는 일과 버퍼 내부를 보호하는 일은 서로 다른 문제다. 이 분리가 동기화 예제를 읽는 핵심이다.

## Readers-Writers 문제

읽기 작업은 서로 동시에 실행되어도 보통 문제가 없다. 하지만 쓰기 작업은 단독으로 실행되어야 한다. readers-writers 문제는 읽기 동시성을 최대한 살리면서 쓰기 일관성을 보장하는 문제다.

정책에 따라 reader를 우선할 수도 있고 writer를 우선할 수도 있다. reader 우선은 읽기 성능은 좋지만 writer가 오래 기다릴 수 있다. writer 우선은 갱신 지연을 줄이지만 읽기 처리량이 줄어들 수 있다. 결국 정책 선택은 workload에 따라 달라진다.

## Dining Philosophers가 보여 주는 것

철학자 문제는 여러 실행 흐름이 둘 이상의 자원을 필요로 할 때 생기는 위험을 보여 준다. 모두가 왼쪽 젓가락을 잡고 오른쪽 젓가락을 기다리면 원형 대기가 생긴다. 이것은 8장의 교착 상태 조건으로 이어진다.

해결책은 동시에 앉을 수 있는 철학자 수를 제한하거나, 자원 획득 순서를 정하거나, 양쪽 자원을 모두 얻을 수 있을 때만 집도록 만드는 식이다. 여기서 볼 대목은 교착 상태 방지와 기아 방지가 별개의 문제라는 점이다.

## 실제 커널에서는 상황별 도구를 고른다

커널은 일반 응용 프로그램보다 제약이 많다. 인터럽트 문맥에서는 잠들 수 없고, 멀티코어에서는 같은 커널 자료구조를 여러 CPU가 동시에 건드릴 수 있다. 그래서 짧은 임계 구역에는 spinlock, 잠들 수 있는 경로에는 mutex나 semaphore, 단순 카운터에는 atomic 연산처럼 상황에 맞는 도구를 쓴다.

동기화 예제를 공부할 때는 정답 코드를 외우기보다, 어떤 상태를 보호하고 어떤 조건을 기다리는지 분리해서 보는 편이 오래 간다.

## 다이어그램

![동기화 예제 - 생산자-소비자 구조](/os-concepts/diagrams/os-07-synchronization-examples.png)

![동기화 예제 - Readers-Writers 정책](/os-concepts/diagrams/os-07-synchronization-examples-detail.png)

## 용어 정리

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

## 조심할 부분

- 동일한 semaphore 하나로 모든 문제를 해결하려 하면 상태 조건과 상호 배제가 섞인다.
- 교착 상태를 막아도 starvation이 생길 수 있다.
- 커널 동기화에서는 잠들 수 있는 문맥과 잠들 수 없는 문맥을 구분해야 한다.

## 이어지는 내용

동기화 도구를 잘못 조합하면 프로세스들이 서로를 영원히 기다릴 수 있다. 8장은 교착 상태를 정리한다.
