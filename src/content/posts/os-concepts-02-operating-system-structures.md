---
title: "공룡책 운영체제 정리 02: 운영체제 구조"
published: 2026-05-29
description: "Operating System Concepts 10판 Ch.02 운영체제 구조 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 2, **Operating-System Structures** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 85 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 시스템 호출

- 의미: 응용 프로그램이 커널 기능을 요청하는 공식 인터페이스.
- 기능: 파일, 프로세스, 장치, 통신, 보호 기능을 커널을 통해 수행한다.
- 주의: API는 개발자가 보는 함수이고, 시스템 호출은 커널 경계로 들어가는 실제 요청이다.
- 키워드: `system call`, `API`

### 운영체제 서비스

- 의미: 프로그램 실행, I/O, 파일, 통신, 오류 감지 등 OS가 제공하는 기능.
- 기능: 응용 프로그램이 하드웨어 세부 사항 없이 실행되게 한다.
- 주의: 서비스는 사용자 편의 기능과 시스템 효율 기능으로 나눠 볼 수 있다.
- 키워드: `service`, `I/O`

### 커널 구조

- 의미: 커널 내부 기능을 배치하는 방식.
- 기능: 모놀리식, 계층형, 마이크로커널, 모듈형 구조로 성능과 격리를 조절한다.
- 주의: 마이크로커널은 작게 나누는 구조이지 항상 빠른 구조는 아니다.
- 키워드: `monolithic`, `microkernel`, `module`

### 부팅

- 의미: 펌웨어와 부트로더를 거쳐 커널을 메모리에 올리는 과정.
- 기능: 하드웨어 초기화 후 운영체제 실행 환경을 만든다.
- 주의: 부트로더는 커널이 아니라 커널을 적재하는 프로그램이다.
- 키워드: `boot loader`, `kernel image`

## 핵심 다이어그램

![운영체제 구조 - 시스템 호출 흐름](/os-concepts/diagrams/os-02-operating-system-structures.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
