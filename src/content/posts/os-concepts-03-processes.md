---
title: "공룡책 운영체제 정리 03: 프로세스"
published: 2026-05-28
description: "Operating System Concepts 10판 Ch.03 프로세스 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 3, **Processes** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 143 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 프로세스

- 의미: 실행 중인 프로그램.
- 기능: CPU 스케줄링, 메모리 보호, 파일 소유의 기본 단위가 된다.
- 주의: 프로그램은 파일이고 프로세스는 실행 상태까지 포함한다.
- 키워드: `process`, `address space`

### PCB

- 의미: 프로세스 상태를 저장하는 커널 자료구조.
- 기능: 문맥 교환 때 레지스터, PC, 상태, 열린 파일 정보를 저장하고 복원한다.
- 주의: PCB는 사용자 프로그램이 직접 건드릴 수 없다.
- 키워드: `PCB`, `context switch`

### 프로세스 상태

- 의미: new, ready, running, waiting, terminated 같은 실행 단계.
- 기능: 스케줄러가 어떤 프로세스를 실행할 수 있는지 판단하게 한다.
- 주의: waiting은 CPU가 없어서가 아니라 I/O나 이벤트를 기다리는 상태다.
- 키워드: `ready`, `waiting`

### IPC

- 의미: 프로세스 사이의 통신 방법.
- 기능: 공유 메모리나 메시지 전달로 독립된 프로세스가 협력하게 한다.
- 주의: 공유 메모리는 빠르지만 동기화가 필요하다.
- 키워드: `IPC`, `shared memory`, `message passing`

## 핵심 다이어그램

![프로세스 - 프로세스 상태 전이](/os-concepts/diagrams/os-03-processes.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
