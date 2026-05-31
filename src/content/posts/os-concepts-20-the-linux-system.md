---
title: "공룡책 운영체제 정리 20: Linux 시스템"
published: 2026-05-11
description: "Operating System Concepts 10판 Ch.20 Linux 시스템 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 20, **The Linux System** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 915 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### Linux 커널

- 의미: UNIX 계열 아이디어를 바탕으로 한 모듈형 단일 커널.
- 기능: 프로세스, 메모리, 파일, 네트워크, 장치 관리를 수행한다.
- 주의: 모듈을 쓴다고 마이크로커널은 아니다.
- 키워드: `Linux`, `kernel`

### 커널 모듈

- 의미: 실행 중인 커널에 동적으로 붙는 코드.
- 기능: 드라이버, 파일 시스템, 네트워크 기능을 확장한다.
- 주의: 커널 권한으로 실행되므로 버그 영향이 크다.
- 키워드: `kernel module`

### fork/exec

- 의미: UNIX식 프로세스 생성과 프로그램 교체 모델.
- 기능: 쉘, 파이프, 서버 프로세스 생성의 기본이 된다.
- 주의: fork 후 메모리는 copy-on-write로 지연 복사될 수 있다.
- 키워드: `fork`, `exec`

### Linux 스케줄링

- 의미: 일반 작업과 실시간 작업을 구분해 CPU를 배정하는 구조.
- 기능: 공정성과 반응성을 함께 고려한다.
- 주의: 정책별 우선순위 의미가 다르다.
- 키워드: `CFS`, `real-time`

### Linux VFS

- 의미: 여러 파일 시스템을 공통 인터페이스로 묶는 계층.
- 기능: ext4, procfs, tmpfs, NFS를 같은 API로 다루게 한다.
- 주의: /proc은 디스크 파일이 아니라 커널 상태를 파일처럼 보여 준다.
- 키워드: `VFS`, `procfs`

## 핵심 다이어그램

![Linux 시스템 - Linux 시스템 구조](/os-concepts/diagrams/os-20-the-linux-system.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
