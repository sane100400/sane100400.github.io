---
title: "공룡책 운영체제 정리 09: 메인 메모리"
published: 2026-05-22
description: "Operating System Concepts 10판 Ch.09 메인 메모리 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 9, **Main Memory** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 455 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 논리 주소

- 의미: 프로그램이 생성하는 주소.
- 기능: 프로세스마다 독립된 주소 공간을 갖게 한다.
- 주의: 논리 주소는 실제 RAM 위치가 아니다.
- 키워드: `logical address`

### 물리 주소

- 의미: 메모리 장치가 실제로 접근하는 주소.
- 기능: MMU가 논리 주소를 변환해 만든다.
- 주의: 운영체제가 보호와 배치를 관리한다.
- 키워드: `physical address`, `MMU`

### 연속 할당

- 의미: 프로세스를 물리 메모리의 연속된 공간에 배치하는 방식.
- 기능: 단순하지만 외부 단편화가 생긴다.
- 주의: compaction은 비용이 크다.
- 키워드: `contiguous allocation`

### 페이징

- 의미: 논리 메모리와 물리 메모리를 고정 크기 조각으로 나누는 방식.
- 기능: 외부 단편화를 줄이고 비연속 배치를 가능하게 한다.
- 주의: 내부 단편화와 페이지 테이블 비용은 남는다.
- 키워드: `paging`, `page`, `frame`

### TLB

- 의미: 페이지 번호와 프레임 번호 매핑을 저장하는 빠른 캐시.
- 기능: 주소 변환 비용을 줄인다.
- 주의: 데이터 캐시가 아니라 주소 변환 캐시다.
- 키워드: `TLB`, `hit ratio`

## 핵심 다이어그램

![메인 메모리 - 페이징 주소 변환](/os-concepts/diagrams/os-09-main-memory.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
