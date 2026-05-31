---
title: "공룡책 운영체제 정리 10: 가상 메모리"
published: 2026-05-21
description: "Operating System Concepts 10판 Ch.10 가상 메모리 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 10, **Virtual Memory** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 501 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 가상 메모리

- 의미: 물리 메모리보다 큰 주소 공간을 쓰는 것처럼 보이게 하는 기법.
- 기능: 프로그램 일부만 메모리에 올려 메모리 사용 효율을 높인다.
- 주의: 무한 메모리를 제공하는 기술은 아니다.
- 키워드: `virtual memory`

### 요구 페이징

- 의미: 접근한 페이지가 필요할 때만 메모리에 올리는 방식.
- 기능: 초기 적재 비용과 메모리 사용량을 줄인다.
- 주의: page fault가 자주 나면 성능이 크게 떨어진다.
- 키워드: `demand paging`

### 페이지 폴트

- 의미: 접근한 페이지가 메모리에 없을 때 발생하는 트랩.
- 기능: 커널이 페이지를 디스크에서 읽어 오도록 만든다.
- 주의: 일반 캐시 미스보다 훨씬 비싸다.
- 키워드: `page fault`

### 페이지 교체

- 의미: 빈 프레임이 없을 때 내보낼 페이지를 고르는 작업.
- 기능: FIFO, LRU, Optimal 같은 정책으로 fault 수를 줄인다.
- 주의: Optimal은 실제 구현보다 비교 기준이다.
- 키워드: `FIFO`, `LRU`

### Thrashing

- 의미: 계산보다 페이지 교체에 시간을 더 쓰는 상태.
- 기능: working set과 page-fault frequency로 감지한다.
- 주의: 프로세스를 더 넣으면 오히려 악화될 수 있다.
- 키워드: `thrashing`, `working set`

## 핵심 다이어그램

![가상 메모리 - 요구 페이징 처리](/os-concepts/diagrams/os-10-virtual-memory.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
