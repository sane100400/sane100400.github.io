---
title: "공룡책 운영체제 정리 시리즈"
published: 2026-05-31
description: "Operating System Concepts 10판 운영체제 정리 시리즈"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

`Operating System Concepts` 10판, 흔히 말하는 공룡책을 읽으며 정리한 운영체제 글 모음이다. 처음 올린 버전은 키워드 메모에 가까워서, 이번에는 각 장의 문제의식과 대표 개념을 내 기준으로 다시 묶었다.

책의 문장과 그림을 그대로 옮기지는 않았다. 장별 주제를 바탕으로 다시 썼고, 그림은 관계가 헷갈리는 지점을 직접 다이어그램으로 그려 PNG 파일로 넣었다.

## 읽는 순서

1. Ch.01-02에서 운영체제가 제공하는 서비스와 커널 구조를 잡는다.
2. Ch.03-05에서 프로세스, 스레드, CPU 스케줄링을 묶어 실행 관리 흐름으로 본다.
3. Ch.06-08에서 동기화와 교착 상태를 함께 본다.
4. Ch.09-10에서 주소 변환, 페이징, 가상 메모리를 연결한다.
5. Ch.11-15에서 저장장치, I/O, 파일 시스템을 아래에서 위로 따라간다.
6. Ch.16-19에서 보안, 보호, 가상 머신, 분산 시스템으로 범위를 넓힌다.
7. Ch.20-21에서 Linux와 Windows를 사례로 앞 개념을 다시 확인한다.

## 참고한 공개 정리

아래 글들은 빠진 주제가 없는지 대조하는 용도로만 참고했다. 본문 문장은 복사하지 않았다.

- [Parksb - 공룡책으로 정리하는 운영체제](https://parksb.github.io/article/5.html)
- [Responsibility - 운영체제 공룡책 10판 정리](https://responsibility.tistory.com/171)
- [Studying Alone - 운영체제 공룡책 정리](https://studyingalone.tistory.com/6)
- [Witch-Work - 운영체제 정리 글](https://witch.work/posts/os-7)

## 목차

| 순서 | 글 | 대표 다이어그램 |
|---:|---|---|
| 01 | [공룡책 운영체제 정리 01: 운영체제 개요](/posts/os-concepts-01-introduction/) | 운영체제의 위치 |
| 02 | [공룡책 운영체제 정리 02: 운영체제 구조](/posts/os-concepts-02-operating-system-structures/) | 시스템 호출 흐름 |
| 03 | [공룡책 운영체제 정리 03: 프로세스](/posts/os-concepts-03-processes/) | 프로세스 상태 전이 |
| 04 | [공룡책 운영체제 정리 04: 스레드와 병행성](/posts/os-concepts-04-threads-concurrency/) | 사용자 스레드와 커널 스레드 |
| 05 | [공룡책 운영체제 정리 05: CPU 스케줄링](/posts/os-concepts-05-cpu-scheduling/) | CPU 스케줄링 위치 |
| 06 | [공룡책 운영체제 정리 06: 동기화 도구](/posts/os-concepts-06-synchronization-tools/) | 임계 구역 보호 |
| 07 | [공룡책 운영체제 정리 07: 동기화 예제](/posts/os-concepts-07-synchronization-examples/) | 생산자-소비자 구조 |
| 08 | [공룡책 운영체제 정리 08: 교착 상태](/posts/os-concepts-08-deadlocks/) | 자원 할당 그래프 |
| 09 | [공룡책 운영체제 정리 09: 메인 메모리](/posts/os-concepts-09-main-memory/) | 페이징 주소 변환 |
| 10 | [공룡책 운영체제 정리 10: 가상 메모리](/posts/os-concepts-10-virtual-memory/) | 요구 페이징 처리 |
| 11 | [공룡책 운영체제 정리 11: 대용량 저장장치](/posts/os-concepts-11-mass-storage-structure/) | RAID 기본 구조 |
| 12 | [공룡책 운영체제 정리 12: 입출력 시스템](/posts/os-concepts-12-i-o-systems/) | I/O 요청 흐름 |
| 13 | [공룡책 운영체제 정리 13: 파일 시스템 인터페이스](/posts/os-concepts-13-file-system-interface/) | 경로 이름 해석 |
| 14 | [공룡책 운영체제 정리 14: 파일 시스템 구현](/posts/os-concepts-14-file-system-implementation/) | 파일 블록 할당 방식 |
| 15 | [공룡책 운영체제 정리 15: 파일 시스템 내부](/posts/os-concepts-15-file-system-internals/) | VFS 계층 |
| 16 | [공룡책 운영체제 정리 16: 보안](/posts/os-concepts-16-security/) | 보안 방어 계층 |
| 17 | [공룡책 운영체제 정리 17: 보호](/posts/os-concepts-17-protection/) | 접근 행렬 모델 |
| 18 | [공룡책 운영체제 정리 18: 가상 머신](/posts/os-concepts-18-virtual-machines/) | Type 1과 Type 2 하이퍼바이저 |
| 19 | [공룡책 운영체제 정리 19: 네트워크와 분산 시스템](/posts/os-concepts-19-networks-and-distributed-systems/) | 분산 파일 시스템 |
| 20 | [공룡책 운영체제 정리 20: Linux 시스템](/posts/os-concepts-20-the-linux-system/) | Linux 시스템 구조 |
| 21 | [공룡책 운영체제 정리 21: Windows 시스템](/posts/os-concepts-21-windows/) | Windows 커널 모드 구조 |

## 우선순위

시험이나 면접 준비라면 Ch.03 프로세스, Ch.04 스레드, Ch.05 CPU 스케줄링, Ch.06 동기화, Ch.08 교착 상태, Ch.09-10 메모리 관리, Ch.13-14 파일 시스템을 먼저 보는 편이 효율적이다. 전체 범위를 잡으려면 Ch.01부터 순서대로 읽는 것이 좋다.
