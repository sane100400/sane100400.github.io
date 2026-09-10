# About Me

![Introduce](/introduce.jpg)

**김현경 (HyeonGyeong Kim)** | Security & Privacy Researcher

고려대학교 정보보호대학원 융합보안학과 LG Cyber Security 전공 석사과정으로, Hacking and Countermeasure Research Lab(HCRLab)에서 연구하고 있습니다.

개인정보보호와 시스템 보안을 함께 공부하며, 실제 데이터를 바탕으로 보안 위협을 측정하고 대응 방안을 설계하는 데 관심이 있습니다. 블록체인 보안, 온라인 개인정보 불법유통, 보안·프라이버시 평가를 중심으로 연구하고 있으며, CTF와 보안 도구 개발을 통해 공격자 관점의 문제 해결 역량도 꾸준히 확장하고 있습니다.

---

## Education

- **고려대학교 정보보호대학원** 융합보안학과 LG Cyber Security 전공 석사과정 / HCRLab (2026.09 ~ 현재)
- **고려대학교** 스마트보안학부·개인정보보호융합전공 졸업 / 학점 3.93 (2022.03 ~ 2026.08)

---

## Research

### Qubic의 Monero Selfish Mining 캠페인 실증 분석
> 2025.09 ~ 2026.08 · AFT 2026 채택

실제 채굴 풀 참여와 커뮤니티 데이터 수집을 통해 Monero 네트워크에서 Qubic의 블록 생성 패턴과 orphan 발생 구간을 추적했습니다. 평균 해시파워 점유율을 23~34%로 측정하고 10개의 orphan-run을 식별했으며, 이론적 수익성과 실측 결과를 비교해 공격의 전술과 한계를 분석했습니다.

- 공동저자 논문: *Inside Qubic's Selfish Mining Campaign on Monero: Evidence, Tactics, and Limits*
- [논문 보기 (arXiv)](https://arxiv.org/abs/2512.01437)
- [분석 대시보드](https://qubicselfishmining.app/)

::github{repo="shlee-lab/Qubic-Monero-Selfish-Mining-Analysis"}

### 공개 웹상 개인정보 불법유통 의심 게시글의 게시 양상 분석
> 2026.08 ~ 2026.09 · 제1저자 원고 작성 완료

검색어 설계와 크롤러를 활용해 후보 URL 8,634건을 수집하고, 200개 도메인의 의심 게시글 1,557건을 선별·분석했습니다. 게시물을 개인정보 DB, 로그인·인증정보, 통장·계좌, 신원 문서로 유형화하고 반복 등록, 연락 유도, 검색어 반사 악용 양상을 분석해 도메인 단위 중복과 검색결과 오염을 함께 고려하는 탐지·삭제 체계의 필요성을 제시했습니다.

### 보안 메신저의 보안성·사용성·프라이버시 통합 평가
> 2025.05 ~ 2025.10 · 제1저자

N2SF 기반 보안성 기준에 사용성과 프라이버시 지표를 결합한 평가 프레임워크를 설계하고, Wickr, Signal, Telegram, Delta Chat, KakaoTalk을 비교해 정부·기업·민간 조직별 메신저 선택 기준을 제안했습니다.

- 정보처리학회 논문지 제14권 제10호, pp. 825–837 (2025.10)
- [논문 보기 (한국정보처리학회)](https://tkips.kips.or.kr/digital-library/103418)

---

## Projects & Leadership

### WSL 기반 CTF Evidence Loop 및 Codex 플러그인 개발
> 2026.07 ~ 2026.08

CTF 풀이의 증거·가설·실험·검증 상태를 일관되게 관리하고, 세션 중단 이후에도 재현 가능한 분석을 이어갈 수 있는 워크플로를 설계했습니다. Python CLI로 체크포인트와 작업 상태를 관리하고, WSL 메모리·cgroup 여유량에 따른 작업 분류 및 독립 작업 디렉터리를 적용해 병렬 분석의 안정성을 높였습니다.

이 워크플로를 활용해 2026 사이버공격방어대회(CCE)와 Black Hat MEA CTF 본선 진출에 기여했습니다.

### INC0GNITO 2026 보안 컨퍼런스 총괄 기획·운영
> 2025.10 ~ 2026.05

전국 33개 대학 정보보안 동아리가 참여한 학생 주도형 보안 컨퍼런스를 회장으로서 총괄했습니다. 프로젝트 관리·행사 기획·홍보·CTF 운영 조직을 구성하고 1,400만 원 규모의 예산을 집행했으며, CTF 300명·아이디어톤 200명·컨퍼런스 500명 등 총 1,000명 규모의 프로그램을 운영했습니다.

---

## Skill Set

### Development

| 구분 | Skill |
|---|---|
| Languages | C, Python, JavaScript, Solidity |
| Tooling / DevOps | Git, GitHub, Docker, WSL |
| Environment | Linux, Windows, macOS |

### Security

| 구분 | Skill |
|---|---|
| Pwnable | Pwntools, GDB 기반 동적 디버깅 및 취약점 익스플로잇 |
| Reversing | IDA, Ghidra 정적 분석 / x64dbg, GDB 동적 디버깅 |
| Digital Forensics | Android(ADB), macOS, Windows 아티팩트 수집 및 분석 |
| Blockchain | Solidity 기반 시스템 오디팅 및 워게임 분석 |
| Cryptography | 공개키·비밀키 암호 및 블록체인 암호 알고리즘 |
| Web Hacking | Burp Suite 기반 웹 트래픽 분석 및 취약점 검증 |

---

## CTF

| 대회 | 결과 |
|---|---|
| 2026 Black Hat MEA CTF 예선 | **1위** / 3,400팀 (본선 진출) |
| 2026 SCTF | **1위** / 200팀 |
| 2026 BITSCTF | **1위** / 859팀 |
| 2026 SUCTF | **2위** / 387팀 |
| 2026 DiceCTF | Open Division 4위·Global 5위 / 496팀 |
| 2026 사이버공격방어대회(CCE) 예선 | 12위 (본선 진출) |
| 2026 CodeGate 예선 | 13위 / 388팀 |
| 2025 Dreamhack CTF Season 7 Round #4 | **1위** / 745명 (개인전) |
| 2025 Hacktheon 세종 본선 | 5위 / 9팀 |
| 2025 Hacktheon 세종 예선 | 10위 / 260팀 (본선 진출) |
| 2024 San Diego CTF | 7위 / 670팀 |
| 2024 WolvCTF | 15위 / 625팀 |

---

## Awards & Certifications

- 2024 개인정보보호·보안 정책 아이디어 공모전 장려상
- 고려대학교 학기최우등생 (2022-1, 2022-2, 2024-2)
- K-Shield Junior 정보보호 관리과정 수료·프로젝트 1위 (KISA, 2025)
- TOEIC 860 (2025.08)
- 네트워크관리사 2급 (2023.10)

---

## Activities

- 2026 개인정보 불법유통 대학생 모니터링단 멘토 (KISA)
- 2025 블록체인 누리단 1기 (KISA)
- 2025 개인정보 불법유통 대학생 모니터링단 2기 (KISA)
- 2024 업비트 서포터즈 UPTO! 3기 (두나무)
- 2024 개인정보 불법유통 대학생 모니터링단 (KISA)

---

## Contact

- Email: [ruby100400@korea.ac.kr](mailto:ruby100400@korea.ac.kr)
- GitHub: [github.com/sane100400](https://github.com/sane100400)
