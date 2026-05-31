---
title: "공룡책 운영체제 정리 15: 파일 시스템 내부"
published: 2026-05-16
description: "Operating System Concepts 10판 Ch.15 파일 시스템 내부 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 15, **File-System Internals** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 730 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 마운트

- 의미: 다른 파일 시스템을 기존 디렉터리 트리에 붙이는 작업.
- 기능: 여러 장치와 원격 파일 시스템을 하나의 이름 공간으로 보이게 한다.
- 주의: 마운트는 파일 복사가 아니다.
- 키워드: `mount`

### VFS

- 의미: 서로 다른 파일 시스템을 공통 인터페이스로 감싸는 계층.
- 기능: ext4, XFS, NFS, procfs를 같은 파일 API로 다루게 한다.
- 주의: VFS는 실제 저장 형식이 아니라 추상화 계층이다.
- 키워드: `VFS`

### 파일 공유

- 의미: 여러 사용자나 프로세스가 같은 파일에 접근하는 상황.
- 기능: 권한, 잠금, 동시 갱신 문제를 다룬다.
- 주의: 공유 파일은 일관성 의미론을 함께 봐야 한다.
- 키워드: `sharing`, `lock`

### 원격 파일 시스템

- 의미: 네트워크 너머 파일을 로컬처럼 접근하는 방식.
- 기능: NFS처럼 클라이언트-서버 구조로 파일 연산을 제공한다.
- 주의: 네트워크 실패와 캐시 일관성이 핵심 문제다.
- 키워드: `NFS`, `RPC`

### 일관성 의미론

- 의미: 한 사용자의 변경이 다른 사용자에게 언제 보이는지에 대한 규칙.
- 기능: UNIX semantics, session semantics 등을 구분한다.
- 주의: 성능을 위해 캐시하면 즉시 일관성은 어려워진다.
- 키워드: `consistency`

## 핵심 다이어그램

![파일 시스템 내부 - VFS 계층](/os-concepts/diagrams/os-15-file-system-internals.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
