---
title: "공룡책 운영체제 정리 12: 입출력 시스템"
published: 2026-05-19
description: "Operating System Concepts 10판 Ch.12 입출력 시스템 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 12, **I/O Systems** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 617 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### 장치 드라이버

- 의미: 커널과 장치 컨트롤러 사이의 장치별 코드.
- 기능: 장치 명령과 상태 처리를 운영체제 인터페이스에 맞춘다.
- 주의: 드라이버 버그는 커널 안정성에 직접 영향을 줄 수 있다.
- 키워드: `driver`

### 장치 컨트롤러

- 의미: 실제 장치를 제어하는 하드웨어 구성 요소.
- 기능: 레지스터와 버퍼를 통해 CPU나 DMA와 통신한다.
- 주의: 드라이버와 컨트롤러는 소프트웨어/하드웨어로 구분된다.
- 키워드: `controller`

### 폴링

- 의미: CPU가 장치 상태를 반복 확인하는 방식.
- 기능: 단순한 장치나 짧은 대기에서 쓸 수 있다.
- 주의: 대기 시간이 길면 CPU를 낭비한다.
- 키워드: `polling`

### 인터럽트

- 의미: 장치가 CPU에게 처리 필요를 알리는 방식.
- 기능: CPU가 I/O 완료를 기다리며 놀지 않게 한다.
- 주의: 너무 잦으면 interrupt overhead가 커진다.
- 키워드: `interrupt`

### DMA

- 의미: 장치와 메모리 사이의 데이터 전송을 CPU 대신 처리하는 방식.
- 기능: 대량 I/O에서 CPU 복사 부담을 줄인다.
- 주의: 메모리 보호와 캐시 일관성을 함께 봐야 한다.
- 키워드: `DMA`

## 핵심 다이어그램

![입출력 시스템 - I/O 요청 흐름](/os-concepts/diagrams/os-12-i-o-systems.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
