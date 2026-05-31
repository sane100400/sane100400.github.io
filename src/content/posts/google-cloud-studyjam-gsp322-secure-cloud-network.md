---
title: "Google Cloud Study Jam GSP322 - 안전한 Google Cloud 네트워크 만들기"
published: 2026-05-31
description: "GSP322 챌린지 랩에서 Bastion, IAP SSH, 방화벽 태그, 내부 SSH 연결을 구성하는 방법"
tags: [GCP, VPC, IAP, Firewall, Compute Engine, Qwiklabs]
category: Cloud
draft: false
---

GSP322는 열린 방화벽을 닫고, bastion은 IAP로만 접속하게 만들고, juice-shop VM은 HTTP와 내부 SSH만 허용하도록 바꾸는 랩이다. 보안 랩이라 “잘 열기”보다 “불필요하게 열린 걸 지우기”가 더 중요하다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| 리소스 확인 | 기존 bastion, juice-shop VM, 네트워크, 관리 서브넷 CIDR을 찾는다. | `--filter='name~bastion'`처럼 정규식 필터를 써서 환경마다 다른 이름을 자동 탐색한다. `networkInterfaces[0].network.basename()`은 전체 URL에서 네트워크 이름만 뽑는다. |
| Bastion 정리 | bastion을 켜고 외부 IP를 제거한다. | `delete-access-config`는 VM을 지우는 게 아니라 NIC의 외부 IP 설정만 제거한다. IAP 접속만 허용하려면 이 단계가 필요하다. |
| 넓은 firewall 삭제 | `0.0.0.0/0`에서 SSH/RDP/ICMP를 여는 기존 규칙을 제거한다. | `jq`로 firewall JSON을 필터링한다. 새로 만들 허용 규칙은 제외하고, 오래된 open access rule만 지우는 게 포인트다. |
| 태그 적용 | bastion과 juice-shop VM에 서로 다른 target tag를 붙인다. | firewall rule은 VM 이름이 아니라 target tag로 적용된다. 태그가 빠지면 규칙이 있어도 VM에 적용되지 않는다. |
| 필요한 firewall 생성 | IAP SSH, 외부 HTTP, 관리망 내부 SSH만 허용한다. | IAP SSH source range는 `35.235.240.0/20`이다. juice-shop SSH는 `MGMT_RANGE`에서만 허용해야 public SSH가 열리지 않는다. |
| 접속 테스트 | IAP로 bastion에 접속한 뒤 내부 IP로 juice-shop SSH를 확인한다. | `--tunnel-through-iap`가 핵심이다. 내부 SSH 테스트는 juice-shop의 internal IP를 사용한다. |

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export ZONE="us-east1-c"

export TAG_SSH_IAP="accept-ssh-iap-ingress-ql-..."
export TAG_SSH_INTERNAL="accept-ssh-internal-ingress-ql-..."
export TAG_HTTP="accept-http-ingress-ql-..."

gcloud config set project "$PROJECT_ID"
gcloud config set compute/zone "$ZONE"
gcloud services enable compute.googleapis.com iap.googleapis.com --project="$PROJECT_ID"
```

태그 이름은 랩에서 지정한 값이므로 반드시 화면 값을 확인한다.

## 리소스 자동 확인

스크립트는 VM 이름과 네트워크 이름을 자동으로 찾는다.

```bash
export BASTION_VM=$(gcloud compute instances list \
  --project="$PROJECT_ID" \
  --filter='name~bastion' \
  --format='value(name)' \
  | head -n 1)

export JUICE_VM=$(gcloud compute instances list \
  --project="$PROJECT_ID" \
  --filter='name~juice' \
  --format='value(name)' \
  | head -n 1)
```

랩 환경마다 VM 이름이 조금 다를 수 있어서, 하드코딩하지 않고 찾는 방식이 안전하다.

## Bastion 외부 IP 제거

bastion은 IAP로만 들어가야 하므로 외부 IP가 있으면 제거한다.

```bash
BASTION_ACCESS_CONFIG=$(gcloud compute instances describe "$BASTION_VM" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --format='value(networkInterfaces[0].accessConfigs[0].name)')

if [ -n "$BASTION_ACCESS_CONFIG" ]; then
  gcloud compute instances delete-access-config "$BASTION_VM" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --access-config-name="$BASTION_ACCESS_CONFIG"
fi
```

## 너무 넓은 firewall rule 삭제

`0.0.0.0/0`에서 SSH, RDP, ICMP를 허용하는 오래된 규칙을 지운다. 단, 새로 만들 규칙 이름은 삭제하지 않도록 제외한다.

```bash
gcloud compute firewall-rules list \
  --project="$PROJECT_ID" \
  --filter='direction=INGRESS' \
  --format='table(name,network.basename(),sourceRanges.list(),allowed[].map().firewall_rule().list(),targetTags.list())'
```

삭제 전에는 목록을 눈으로 확인하는 편이 좋다. 이 랩의 의도는 public SSH를 없애는 것이다.

## 네트워크 태그 적용

bastion에는 IAP SSH 태그, juice-shop에는 HTTP와 내부 SSH 태그를 붙인다.

```bash
gcloud compute instances add-tags "$BASTION_VM" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --tags="$TAG_SSH_IAP"

gcloud compute instances add-tags "$JUICE_VM" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --tags="$TAG_HTTP,$TAG_SSH_INTERNAL"
```

## 필요한 firewall rule만 만들기

IAP SSH source range는 `35.235.240.0/20`이다.

```bash
gcloud compute firewall-rules create allow-ssh-from-iap \
  --project="$PROJECT_ID" \
  --network="$NETWORK" \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:22 \
  --source-ranges=35.235.240.0/20 \
  --target-tags="$TAG_SSH_IAP" || true
```

juice-shop HTTP는 외부에 열고, juice-shop SSH는 management subnet에서만 열어둔다.

```bash
gcloud compute firewall-rules create allow-http-to-juice-shop \
  --project="$PROJECT_ID" \
  --network="$NETWORK" \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags="$TAG_HTTP" || true
```

## 접속 테스트

먼저 IAP로 bastion에 접속한다.

```bash
gcloud compute ssh "$BASTION_VM" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --tunnel-through-iap \
  --ssh-key-expire-after=10m
```

그다음 bastion에서 juice-shop 내부 IP로 SSH가 되는지 확인한다.

```bash
JUICE_INTERNAL_IP=$(gcloud compute instances describe "$JUICE_VM" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --format='value(networkInterfaces[0].networkIP)')
```

## 마무리

GSP322에서 채점이 안 되면 대부분 태그나 넓은 firewall rule 때문이다. 새 규칙을 만들었더라도 예전 `0.0.0.0/0` SSH 규칙이 남아 있으면 실패한다. firewall list를 보고 source range와 target tag를 직접 확인하자.
