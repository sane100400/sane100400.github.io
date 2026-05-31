---
title: "Google Cloud Study Jam GSP314 - Google Cloud 네트워크 구성 실습"
published: 2026-05-31
description: "GSP314 챌린지 랩에서 커스텀 VPC, 서브넷, 방화벽 규칙, VM을 구성하는 방법"
tags: [GCP, VPC, Firewall, Compute Engine, Qwiklabs]
category: Cloud
draft: false
---

GSP314는 커스텀 VPC를 만들고, 서로 다른 리전에 서브넷을 두 개 만든 다음, 방화벽 규칙과 VM을 추가하는 랩이다. 태스크는 짧지만 리소스 이름이 랜덤처럼 생겨서 오타가 나기 쉽다.

## 시작 설정

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"

gcloud config set project "$PROJECT_ID"
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"
```

## Task 1, 2. 네트워크와 방화벽 규칙

먼저 custom subnet mode VPC를 만든다.

```bash
gcloud compute networks create vpc-network-22ye \
  --project="$PROJECT_ID" \
  --subnet-mode=custom \
  --bgp-routing-mode=regional
```

서브넷은 두 리전에 나뉜다.

```bash
gcloud compute networks subnets create subnet-a-bt9h \
  --project="$PROJECT_ID" \
  --network=vpc-network-22ye \
  --region=us-east4 \
  --range=10.10.10.0/24 \
  --stack-type=IPV4_ONLY

gcloud compute networks subnets create subnet-b-e6y2 \
  --project="$PROJECT_ID" \
  --network=vpc-network-22ye \
  --region=us-west1 \
  --range=10.10.20.0/24 \
  --stack-type=IPV4_ONLY
```

그다음 SSH, RDP, ICMP 방화벽 규칙을 만든다.

```bash
gcloud compute firewall-rules create yvtx-firewall-ssh \
  --project="$PROJECT_ID" \
  --network=vpc-network-22ye \
  --direction=INGRESS \
  --action=ALLOW \
  --source-ranges=0.0.0.0/0 \
  --rules=tcp:22
```

ICMP 규칙은 두 서브넷 CIDR에서만 허용한다.

```bash
gcloud compute firewall-rules create zzla-firewall-icmp \
  --project="$PROJECT_ID" \
  --network=vpc-network-22ye \
  --direction=INGRESS \
  --action=ALLOW \
  --source-ranges=10.10.10.0/24,10.10.20.0/24 \
  --rules=icmp
```

Task 1과 Task 2는 이어서 채점한다. 네트워크와 방화벽 이름이 랩에서 요구한 값과 같아야 한다.

## Task 3. VM 추가

각 서브넷에 VM을 하나씩 만든다.

```bash
gcloud compute instances create us-test-01 \
  --project="$PROJECT_ID" \
  --zone=us-east4-c \
  --machine-type=e2-standard-2 \
  --network=vpc-network-22ye \
  --subnet=subnet-a-bt9h \
  --image-family=debian-12 \
  --image-project=debian-cloud

gcloud compute instances create us-test-02 \
  --project="$PROJECT_ID" \
  --zone=us-west1-a \
  --machine-type=e2-standard-2 \
  --network=vpc-network-22ye \
  --subnet=subnet-b-e6y2 \
  --image-family=debian-12 \
  --image-project=debian-cloud
```

연결 확인은 `us-test-01`에서 `us-test-02`의 내부 IP로 ping을 날리면 된다.

```bash
US_TEST_02_INTERNAL_IP=$(gcloud compute instances describe us-test-02 \
  --project="$PROJECT_ID" \
  --zone=us-west1-a \
  --format='value(networkInterfaces[0].networkIP)')

gcloud compute ssh us-test-01 \
  --project="$PROJECT_ID" \
  --zone=us-east4-c \
  --command="ping -c 3 ${US_TEST_02_INTERNAL_IP}"
```

## 마무리

GSP314는 복잡한 설정보다 이름 맞추기가 더 중요하다. `vpc-network-22ye`, `subnet-a-bt9h`, `subnet-b-e6y2` 같은 값이 랩마다 달라질 수 있으니, 자기 랩 화면의 값을 먼저 보고 스크립트를 수정하자.
