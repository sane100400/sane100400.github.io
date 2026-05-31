---
title: "Google Cloud Study Jam GSP313 - Compute Engine 로드 밸런싱 실습"
published: 2026-05-31
description: "GSP313 챌린지 랩에서 웹 서버 3대, Network Load Balancer, HTTP Load Balancer를 구성하는 방법"
tags: [GCP, Compute Engine, Load Balancing, Qwiklabs]
category: Cloud
draft: false
---

GSP313은 Compute Engine 위에서 두 종류의 로드 밸런서를 구성하는 랩이다. 먼저 `web1`, `web2`, `web3` 인스턴스를 만들고 Network Load Balancer를 붙인다. 그다음 managed instance group 기반의 HTTP Load Balancer를 만든다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | Apache가 설치된 웹 서버 VM 3대를 만들고 HTTP 방화벽을 연다. | `--metadata-from-file=startup-script=...`가 VM 부팅 시 Apache 설치 스크립트를 넣는다. `--tags=network-lb-tag`와 firewall rule의 `--target-tags`가 맞아야 80번 포트가 열린다. |
| Task 2 | Regional Network Load Balancer를 만들어 VM 3대로 TCP/HTTP 트래픽을 분산한다. | `target-pool`은 레거시 Network LB의 backend 묶음이다. `forwarding-rules create`에서 `--address`, `--target-pool`, `--ports=80`이 연결된다. |
| Task 3 | Managed Instance Group을 backend로 쓰는 전역 HTTP Load Balancer를 만든다. | HTTP LB는 `instance template -> MIG -> backend service -> URL map -> proxy -> global forwarding rule` 순서다. health check source range를 firewall로 열어야 backend가 healthy가 된다. |

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-east4"
export ZONE="us-east4-c"

set +H

gcloud config set project "$PROJECT_ID"
gcloud config set compute/region "$REGION"
gcloud config set compute/zone "$ZONE"
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"
```

`set +H`는 startup script의 `#!/bin/bash`를 붙여넣을 때 `!`가 history expansion으로 해석되는 일을 막기 위한 설정이다.

## Task 1. 웹 서버 3대 만들기

`web1`, `web2`, `web3` 인스턴스를 만들고, 각 VM의 Apache index 페이지에 VM 이름을 넣는다.

```bash
for VM in web1 web2 web3; do
  gcloud compute instances create "$VM" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --machine-type=e2-small \
    --network=default \
    --tags=network-lb-tag \
    --image-family=debian-12 \
    --image-project=debian-cloud \
    --metadata-from-file=startup-script="${VM}-startup.sh"
done
```

외부에서 HTTP로 접근할 수 있게 firewall rule도 만든다.

```bash
gcloud compute firewall-rules create www-firewall-network-lb \
  --project="$PROJECT_ID" \
  --network=default \
  --direction=INGRESS \
  --action=ALLOW \
  --target-tags=network-lb-tag \
  --rules=tcp:80 \
  --source-ranges=0.0.0.0/0
```

Apache 설치가 끝날 때까지 1분 정도 기다린 뒤 각 VM의 외부 IP로 접속해 본다. 응답이 보이면 채점한다.

## Task 2. Network Load Balancer

정적 regional IP, HTTP health check, target pool, forwarding rule을 차례대로 만든다.

```bash
gcloud compute addresses create network-lb-ip-1 \
  --project="$PROJECT_ID" \
  --region="$REGION"

gcloud compute http-health-checks create basic-check \
  --project="$PROJECT_ID" \
  --port=80

gcloud compute target-pools create www-pool \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --http-health-check=basic-check
```

target pool에 VM 3대를 붙이고 forwarding rule을 만든다.

```bash
gcloud compute target-pools add-instances www-pool \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --instances=web1,web2,web3 \
  --instances-zone="$ZONE"

gcloud compute forwarding-rules create www-rule \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --ports=80 \
  --address=network-lb-ip-1 \
  --target-pool=www-pool
```

IP를 확인하고 접속해 본 뒤 채점한다.

## Task 3. HTTP Load Balancer

세 번째 태스크는 전역 HTTP Load Balancer다. instance template, managed instance group, named port, health check, backend service, URL map, proxy, forwarding rule 순서로 이어진다.

```bash
gcloud compute instance-templates create lb-backend-template \
  --project="$PROJECT_ID" \
  --machine-type=e2-medium \
  --network=default \
  --tags=allow-health-check \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --metadata-from-file=startup-script=lb-startup.sh

gcloud compute instance-groups managed create lb-backend-group \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --template=lb-backend-template \
  --size=2
```

HTTP Load Balancer health check source range는 따로 열어야 한다.

```bash
gcloud compute firewall-rules create fw-allow-health-check \
  --project="$PROJECT_ID" \
  --network=default \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80 \
  --source-ranges=130.211.0.0/22,35.191.0.0/16 \
  --target-tags=allow-health-check
```

마지막 forwarding rule까지 만들면 전역 IP가 나온다.

```bash
gcloud compute forwarding-rules describe http-content-rule \
  --project="$PROJECT_ID" \
  --global \
  --format="value(IPAddress)"
```

HTTP Load Balancer는 URL이 응답하기까지 3분 이상 걸릴 수 있다. 바로 채점이 안 되면 조금 기다린 뒤 다시 누른다.

## 마무리

GSP313은 이름이 고정된 리소스가 많다. `web1`, `web2`, `web3`, `www-pool`, `www-rule`, `lb-backend-group`, `web-backend-service` 같은 이름을 바꾸면 채점기가 못 찾을 수 있다. 실습 중에는 스크립트 이름을 유지하는 편이 낫다.
