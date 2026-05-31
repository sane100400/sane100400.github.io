---
title: "공룡책 운영체제 정리 시리즈"
published: 2026-05-31
description: "Operating System Concepts 10판을 블로그용으로 정리한 시리즈 목차"
tags: [Operating System, OS, 공룡책, CS]
category: "Computer Science"
draft: false
---

공룡책을 처음부터 길게 풀어쓰기보다, 블로그에서는 개념별 의미와 기능을 먼저 잡는 편이 읽기 좋다. 이 시리즈는 그 방식으로 `Operating System Concepts` 10판의 주요 장을 정리한다.

참고한 공개 정리글은 아래와 같다. 문장은 그대로 가져오지 않고, 구성 방향과 학습 흐름만 참고했다.

## 참고한 글

- [Parksb - 공룡책으로 정리하는 운영체제](https://parksb.github.io/article/5.html)
- [Responsibility - 운영체제 공룡책 10판 정리](https://responsibility.tistory.com/171)
- [Studying Alone - 운영체제 공룡책 정리](https://studyingalone.tistory.com/6)
- [Witch-Work - 운영체제 정리 글](https://witch.work/posts/os-7)

## 목차

| 순서 | 글 | 핵심 다이어그램 |
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

## 먼저 볼 장

처음 공부할 때는 Ch.03 프로세스, Ch.05 CPU 스케줄링, Ch.06 동기화, Ch.08 교착 상태, Ch.09-10 메모리 관리, Ch.13-14 파일 시스템을 우선 보면 된다.
