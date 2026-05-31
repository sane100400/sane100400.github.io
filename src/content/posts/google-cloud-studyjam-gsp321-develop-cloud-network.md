---
title: "Google Cloud Study Jam GSP321 - 개발/운영 네트워크와 WordPress 배포"
published: 2026-05-31
description: "GSP321 챌린지 랩에서 VPC, Bastion, Cloud SQL, GKE, WordPress, uptime check, IAM을 구성하는 방법"
tags: [GCP, VPC, Cloud SQL, GKE, WordPress, Qwiklabs]
category: Cloud
draft: false
---

GSP321은 긴 랩이다. 개발 VPC와 운영 VPC를 만들고, bastion host를 세우고, Cloud SQL과 GKE에 WordPress를 배포한다. 마지막에는 uptime check와 추가 엔지니어 권한까지 설정한다.

한 번에 끝까지 붙여넣기보다 태스크마다 멈춰서 채점하는 게 좋다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | 개발용 VPC와 WordPress/mgmt 서브넷을 만든다. | `--subnet-mode=custom`이라 subnet을 직접 정의한다. `griffin-dev-wp`는 GKE/WordPress용, `griffin-dev-mgmt`는 관리 접근용으로 분리된다. |
| Task 2 | 운영용 VPC와 WordPress/mgmt 서브넷을 만든다. | 개발 VPC와 CIDR이 겹치지 않게 다른 range를 쓴다. 이름에 `prod`가 들어가는지 확인해야 채점기가 구분한다. |
| Task 3 | 두 VPC에 모두 연결된 bastion host를 만든다. | `--network-interface`를 두 번 써서 NIC를 2개 붙인다. 두 번째 인터페이스의 `no-address`는 외부 IP 없이 내부망 전용으로 두겠다는 뜻이다. |
| Task 4 | Cloud SQL MySQL 인스턴스와 WordPress database/user를 만든다. | SQL instance 생성은 오래 걸린다. `authorized-networks`는 Cloud Shell에서 MySQL 접속하려고 잠시 여는 값이고, DB user/password는 Kubernetes secret과 맞아야 한다. |
| Task 5 | 개발 VPC의 WordPress 서브넷에 GKE 클러스터를 만든다. | `--network`, `--subnetwork`, `--enable-ip-alias`가 중요하다. 클러스터가 default VPC에 생기면 이후 WordPress 배포가 랩 의도와 어긋난다. |
| Task 6 | WordPress Kubernetes manifest와 Cloud SQL proxy secret을 준비한다. | `sed`로 DB 계정 placeholder를 바꾸고, 서비스 계정 key를 `cloudsql-instance-credentials` secret으로 넣는다. secret 이름이 manifest와 맞아야 한다. |
| Task 7 | WordPress deployment와 LoadBalancer service를 배포한다. | `YOUR_SQL_INSTANCE` 자리에는 Cloud SQL connection name이 들어간다. LoadBalancer 외부 IP는 늦게 생기므로 `kubectl get service`로 기다린다. |
| Task 8 | WordPress 외부 IP를 대상으로 uptime check를 만든다. | `--resource-labels=host=...,project_id=...`에서 host는 URL이 아니라 IP/hostname 값이다. path와 port도 채점 기준에 들어간다. |
| Task 9 | 추가 엔지니어에게 프로젝트 접근 권한을 준다. | `--member="user:${USER2_EMAIL}"`의 이메일과 `--role="roles/editor"`가 랩 지시와 일치해야 한다. |

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-east1"
export ZONE="us-east1-c"
export USER2_EMAIL="student-...@qwiklabs.net"

export ROOT_PASSWORD="RootPassw0rd!"
export WP_DB_NAME="wordpress"
export WP_DB_USER="wp_user"
export WP_DB_PASSWORD="stormwind_rules"
```

비밀번호는 스크립트 값으로 맞춰도 되지만, 랩에서 지정한 값이 있으면 그 값을 우선한다.

## Task 1, 2. 개발/운영 VPC

개발 VPC에는 WordPress용 서브넷과 관리용 서브넷을 만든다.

```bash
gcloud compute networks create griffin-dev-vpc \
  --project="$PROJECT_ID" \
  --subnet-mode=custom

gcloud compute networks subnets create griffin-dev-wp \
  --project="$PROJECT_ID" \
  --network=griffin-dev-vpc \
  --region="$REGION" \
  --range=192.168.16.0/20
```

운영 VPC도 같은 구조로 만든다.

```bash
gcloud compute networks create griffin-prod-vpc \
  --project="$PROJECT_ID" \
  --subnet-mode=custom
```

각 태스크가 끝나면 바로 채점한다.

## Task 3. Bastion host

bastion은 개발 관리 서브넷과 운영 관리 서브넷에 동시에 연결한다. 운영 쪽 인터페이스에는 외부 IP를 붙이지 않는다.

```bash
gcloud compute instances create bastion \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --network-interface=network=griffin-dev-vpc,subnet=griffin-dev-mgmt \
  --network-interface=network=griffin-prod-vpc,subnet=griffin-prod-mgmt,no-address
```

## Task 4. Cloud SQL

MySQL 8 인스턴스를 만들고 WordPress용 database와 user를 만든다.

```bash
gcloud sql instances create griffin-dev-db \
  --project="$PROJECT_ID" \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --availability-type=ZONAL \
  --storage-size=10 \
  --root-password="$ROOT_PASSWORD"
```

Cloud SQL은 생성과 patch 작업이 느리다. 스크립트처럼 `RUNNABLE` 상태를 기다리고 pending operation이 끝났는지 확인한다.

```bash
gcloud sql operations list \
  --project="$PROJECT_ID" \
  --instance=griffin-dev-db \
  --filter='status!=DONE'
```

Cloud Shell에서 MySQL 접속을 하려면 현재 Cloud Shell의 외부 IP를 authorized networks에 추가한다.

## Task 5. GKE 클러스터

개발 WordPress 서브넷에 GKE 클러스터를 만든다.

```bash
gcloud container clusters create griffin-dev \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --num-nodes=2 \
  --machine-type=e2-standard-4 \
  --disk-size=20 \
  --network=griffin-dev-vpc \
  --subnetwork=griffin-dev-wp \
  --scopes=cloud-platform \
  --enable-ip-alias
```

생성 후 credential을 받고 `kubectl get nodes`로 확인한다.

## Task 6. Kubernetes 준비

`gs://spls/gsp321/wp-k8s`에서 manifest를 받아 database user와 password를 치환한다.

```bash
gsutil -m cp -r gs://spls/gsp321/wp-k8s .
cd wp-k8s

sed -i \
  -e "s/username_goes_here/${WP_DB_USER}/g" \
  -e "s/password_goes_here/${WP_DB_PASSWORD}/g" \
  wp-env.yaml

kubectl apply -f wp-env.yaml
```

Cloud SQL proxy 서비스 계정 키를 secret으로 넣는 것도 이 태스크의 일부다.

## Task 7. WordPress 배포

Cloud SQL connection name을 manifest에 넣고 deployment와 service를 적용한다.

```bash
CONNECTION_NAME=$(gcloud sql instances describe griffin-dev-db \
  --project="$PROJECT_ID" \
  --format="value(connectionName)")

sed -i "s|YOUR_SQL_INSTANCE|${CONNECTION_NAME}|g" wp-deployment.yaml

kubectl apply -f wp-deployment.yaml
kubectl apply -f wp-service.yaml
```

LoadBalancer IP는 바로 안 나올 수 있다.

```bash
kubectl get service wordpress
```

외부 IP가 나온 뒤 `curl -I http://IP`가 응답하면 채점한다.

## Task 8, 9. Monitoring과 IAM

WordPress 외부 IP로 uptime check를 만든다.

```bash
gcloud monitoring uptime create griffin-dev-wp-uptime-check \
  --project="$PROJECT_ID" \
  --resource-type=uptime-url \
  --resource-labels=host="${WORDPRESS_IP}",project_id="${PROJECT_ID}" \
  --protocol=http \
  --path=/ \
  --port=80
```

마지막은 추가 엔지니어에게 editor 권한을 주는 태스크다.

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="user:${USER2_EMAIL}" \
  --role="roles/editor" \
  --condition=None
```

## 마무리

GSP321은 기다리는 시간이 길다. Cloud SQL operation, GKE cluster 생성, LoadBalancer IP 할당이 모두 느릴 수 있다. 태스크가 실패했다고 바로 다음 단계로 넘어가지 말고, 상태 명령으로 준비가 끝났는지 확인하는 게 낫다.
