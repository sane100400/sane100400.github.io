---
title: "공룡책 운영체제 정리 11: 대용량 저장장치"
published: 2026-05-20
description: "Operating System Concepts 10판 Ch.11 대용량 저장장치 핵심 개념 의미와 기능 정리"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판 Chapter 11, **Mass-Storage Structure** 정리다. 다른 공룡책 정리 글들처럼 개념별로 의미와 기능을 먼저 잡는 방식으로 적었다.

원서 기준 PDF page 573 부근에서 시작한다. 다이어그램은 핵심 흐름만 Mermaid로 작성한 뒤 PNG로 생성했다.

## 핵심 개념

### HDD

- 의미: 회전 원판과 이동 헤드로 데이터를 읽는 저장장치.
- 기능: 큰 용량을 저렴하게 제공한다.
- 주의: 탐색 시간과 회전 지연이 성능에 큰 영향을 준다.
- 키워드: `HDD`, `seek time`

### SSD/NVM

- 의미: 기계적 움직임 없이 플래시나 비휘발성 메모리로 접근하는 저장장치.
- 기능: 낮은 지연 시간과 높은 랜덤 접근 성능을 제공한다.
- 주의: 마모 관리와 쓰기 증폭을 고려해야 한다.
- 키워드: `SSD`, `NVM`

### 디스크 스케줄링

- 의미: I/O 요청 처리 순서를 조정하는 정책.
- 기능: HDD 헤드 이동과 평균 대기 시간을 줄인다.
- 주의: SSD에서는 HDD만큼 효과가 크지 않을 수 있다.
- 키워드: `SCAN`, `C-SCAN`

### 스왑 공간

- 의미: 메모리 부족 시 페이지를 저장장치에 내려놓는 공간.
- 기능: 물리 메모리 압박을 완화한다.
- 주의: 과도한 스왑은 시스템 전체를 느리게 만든다.
- 키워드: `swap`

### RAID

- 의미: 여러 디스크를 묶어 성능이나 신뢰성을 높이는 구조.
- 기능: striping, mirroring, parity로 목적을 달성한다.
- 주의: RAID는 백업이 아니다.
- 키워드: `RAID`, `parity`

## 핵심 다이어그램

![대용량 저장장치 - RAID 기본 구조](/os-concepts/diagrams/os-11-mass-storage-structure.png)

## 읽고 넘어갈 기준

위 개념들의 의미와 기능을 한 문장씩 말할 수 있으면 다음 장으로 넘어가도 된다.
