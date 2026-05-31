---
title: "공룡책 운영체제 정리 21: Windows 시스템"
published: 2026-05-10
description: "Operating System Concepts 10판 Ch.21 Windows 시스템 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 21, **Windows** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 963 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### Windows 구조

- 의미: 사용자 모드와 커널 모드, Executive, Kernel, HAL로 나뉜 구조.
- 기능: 호환성, 보안, 이식성, 성능을 계층적으로 처리한다.
- 주의: Windows를 GUI만으로 이해하면 핵심을 놓친다.
- 키워드: `Windows`, `Executive`

### Executive

- 의미: 커널 모드의 고수준 관리자 집합.
- 기능: 프로세스, 메모리, I/O, 객체, 보안 관리를 담당한다.
- 주의: Kernel보다 더 높은 수준의 OS 서비스를 제공한다.
- 키워드: `Executive`

### 객체 관리자

- 의미: 커널 객체의 이름, 핸들, 수명을 관리하는 구성 요소.
- 기능: 파일, 프로세스, 이벤트 같은 자원을 일관된 방식으로 다룬다.
- 주의: 핸들은 사용자 공간 포인터가 아니라 커널 객체 참조다.
- 키워드: `object manager`, `handle`

### 보안 참조 모니터

- 의미: 접근 토큰과 보안 설명자를 바탕으로 접근을 검사하는 구성 요소.
- 기능: Windows 보호 모델의 핵심 경로다.
- 주의: 권한 검사는 객체 접근 시점에 반복적으로 일어난다.
- 키워드: `access token`, `security descriptor`

### NTFS

- 의미: Windows의 대표 파일 시스템.
- 기능: MFT, 권한, 저널링, 압축, 링크, change journal을 제공한다.
- 주의: 저널링은 모든 사용자 데이터를 완전히 보존한다는 뜻이 아니다.
- 키워드: `NTFS`, `MFT`

## 핵심 다이어그램

![Windows 시스템 - Windows 커널 모드 구조](/os-concepts/diagrams/os-21-windows.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
