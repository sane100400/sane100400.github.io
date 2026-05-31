---
title: "공룡책 운영체제 정리 06: 동기화 도구"
published: 2026-05-25
description: "Operating System Concepts 10판 Ch.06 동기화 도구 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 6, **Synchronization Tools** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 332 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 경쟁 조건

- 의미: 실행 순서에 따라 공유 데이터 결과가 달라지는 상황.
- 기능: 동기화가 필요한 지점을 찾게 해 주는 핵심 문제다.
- 주의: 한 줄 증가 연산도 읽기-수정-쓰기 단계로 쪼개질 수 있다.
- 키워드: `race condition`

### 임계 구역

- 의미: 공유 데이터를 접근하는 코드 영역.
- 기능: 한 번에 하나의 실행 흐름만 들어오게 보호한다.
- 주의: 상호 배제, 진행, 한정 대기를 만족해야 한다.
- 키워드: `critical section`

### 뮤텍스

- 의미: 하나의 실행 흐름만 임계 구역에 들어오게 하는 락.
- 기능: 공유 자료구조를 간단히 보호한다.
- 주의: 락 범위가 넓으면 병렬성이 줄어든다.
- 키워드: `mutex`, `lock`

### 세마포어

- 의미: 정수 카운터로 자원 수나 실행 순서를 관리하는 동기화 도구.
- 기능: 여러 개의 동일 자원, 생산자-소비자 문제에 자주 쓰인다.
- 주의: wait/signal 순서를 틀리면 교착 상태가 생긴다.
- 키워드: `semaphore`, `wait`, `signal`

### 모니터

- 의미: 공유 데이터와 동기화 연산을 묶은 고수준 구조.
- 기능: 조건 변수로 특정 조건이 될 때까지 기다리게 한다.
- 주의: wait 후에는 조건을 다시 확인하는 습관이 필요하다.
- 키워드: `monitor`, `condition variable`

## 핵심 다이어그램

![동기화 도구 - 임계 구역 보호](/os-concepts/diagrams/os-06-synchronization-tools.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
