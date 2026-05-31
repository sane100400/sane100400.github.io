---
title: "공룡책 운영체제 정리 01: 운영체제 개요"
published: 2026-05-30
description: "Operating System Concepts 10판 Ch.01 운영체제 개요 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 1, **Introduction** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 31 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 운영체제

- 의미: 하드웨어와 응용 프로그램 사이에서 자원을 관리하는 프로그램 집합.
- 기능: CPU, 메모리, 저장장치, I/O 장치를 안전하게 나눠 쓰게 한다.
- 주의: GUI가 아니라 커널의 자원 관리 역할을 먼저 떠올리면 된다.
- 키워드: `kernel`, `resource manager`

### 인터럽트

- 의미: CPU에게 외부 사건이나 예외를 알리는 신호.
- 기능: I/O 완료, 타이머 만료, 예외 상황을 커널이 처리하게 만든다.
- 주의: 폴링은 CPU가 계속 확인하는 방식이고, 인터럽트는 장치가 알려 주는 방식이다.
- 키워드: `interrupt`, `handler`

### 이중 모드

- 의미: 사용자 모드와 커널 모드를 나누는 보호 구조.
- 기능: 일반 프로그램이 위험한 명령이나 장치 접근을 직접 하지 못하게 한다.
- 주의: 시스템 호출은 이 경계를 넘는 통제된 입구다.
- 키워드: `user mode`, `kernel mode`

### 캐시

- 의미: 빠른 저장 계층에 자주 쓰는 데이터를 임시로 두는 구조.
- 기능: CPU와 메모리, 메모리와 디스크 사이의 속도 차이를 줄인다.
- 주의: 빠르지만 여러 복사본이 생기므로 일관성 문제가 따라온다.
- 키워드: `cache`, `consistency`

## 핵심 다이어그램

![운영체제 개요 - 운영체제의 위치](/os-concepts/diagrams/os-01-introduction.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
