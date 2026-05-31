---
title: "Google Cloud Study Jam GSP322 - 안전한 Google Cloud 네트워크 만들기"
published: 2026-05-31
description: "GSP322 챌린지 랩에서 Bastion, IAP SSH, 방화벽 태그, 내부 SSH 연결을 구성하는 방법"
tags: [GCP, VPC, IAP, Firewall, Compute Engine, Qwiklabs]
category: Cloud
draft: false
---

GSP322는 열린 방화벽을 닫고, bastion은 IAP로만 접속하게 만들고, juice-shop VM은 HTTP와 내부 SSH만 허용하도록 바꾸는 랩이다. 보안 랩이라 “잘 열기”보다 “불필요하게 열린 걸 지우기”가 더 중요하다.

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
