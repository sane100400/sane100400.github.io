---
title: "Google Cloud Study Jam GSP345 - Terraform으로 인프라 관리하기"
published: 2026-05-31
description: "GSP345 챌린지 랩에서 Terraform 파일 생성, import, remote backend, Registry module, firewall 설정을 진행하는 방법"
tags: [GCP, Terraform, Compute Engine, Cloud Storage, VPC, Qwiklabs]
category: Cloud
draft: false
---

GSP345는 Terraform 랩이다. 기존 VM을 Terraform state로 가져오고, remote backend를 만들고, 인스턴스를 수정하고, Registry module로 VPC를 만든 뒤 firewall까지 구성한다.

이 랩은 손으로 콘솔 리소스를 고치면 state와 코드가 어긋나기 쉽다. 가급적 스크립트의 태스크 블록을 그대로 실행하는 편이 좋다.

## 과제별 이해 포인트

| 과제 | 하는 일 | 명령어에서 볼 포인트 |
|---|---|---|
| Task 1 | Terraform 프로젝트 구조와 provider 설정을 만든다. | `modules/instances`, `modules/storage`처럼 모듈 폴더를 나눈다. `terraform init`은 provider를 내려받고 현재 디렉터리를 Terraform 작업 폴더로 초기화한다. |
| Task 2 | 이미 존재하는 Compute Engine VM 2대를 Terraform state로 가져온다. | `terraform import`는 리소스를 새로 만드는 명령이 아니다. 코드에 resource block이 먼저 있어야 하고, import ID는 `projects/PROJECT/zones/ZONE/instances/NAME` 형식이다. |
| Task 3 | Cloud Storage bucket을 만들고 Terraform remote backend로 사용한다. | backend 설정을 추가한 뒤 `terraform init -migrate-state -force-copy`로 local state를 GCS backend로 옮긴다. bucket은 state 파일을 저장하는 인프라다. |
| Task 4 | 새 VM을 Terraform 코드에 추가해 apply한다. | Terraform에서는 코드가 원하는 상태다. resource block을 추가하고 `apply`하면 새 VM이 생긴다. 콘솔에서 직접 만들면 state에 안 들어간다. |
| Task 5 | Terraform 코드에서 리소스를 제거해 실제 인프라에서도 없앤다. | destroy 명령이 아니라 코드 변경 후 `apply`로 상태를 맞춘다. state에 있던 리소스가 코드에서 사라지면 Terraform은 삭제 계획을 만든다. |
| Task 6 | Terraform Registry의 network module로 VPC를 만든다. | 외부 module을 쓰면 `terraform init -upgrade`가 필요하다. module input인 `project_id`, `network_name`, subnet 설정이 실제 리소스 이름이 된다. |
| Task 7 | Terraform으로 firewall rule을 만든다. | firewall resource도 코드로 관리한다. `network = module.vpc.network_name`처럼 module output을 참조해서 앞에서 만든 VPC에 규칙을 붙인다. |

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export REGION="us-east4"
export ZONE="us-east4-c"
export BUCKET_NAME="tf-bucket-..."
export INSTANCE_NAME="tf-instance-..."
export VPC_NAME="tf-vpc-..."

gcloud config set project "$PROJECT_ID"

mkdir -p ~/gsp345-terraform/modules/instances
mkdir -p ~/gsp345-terraform/modules/storage
cd ~/gsp345-terraform
```

버킷 이름, 새 인스턴스 이름, VPC 이름은 랩마다 달라진다.

## Task 1. 기본 Terraform 파일

루트 `variables.tf`, `main.tf`, 모듈 폴더의 빈 파일을 만든다.

```bash
touch modules/instances/instances.tf
touch modules/instances/outputs.tf
touch modules/storage/storage.tf
touch modules/storage/outputs.tf

terraform fmt -recursive
terraform init
```

여기서는 리소스를 만들기보다 프로젝트 구조와 provider 초기화가 채점 포인트다.

## Task 2. 기존 인프라 import

기존 `tf-instance-1`, `tf-instance-2`를 Terraform 코드로 표현한 뒤 state로 import한다.

```bash
terraform import 'module.instances.google_compute_instance.tf-instance-1' \
  "projects/${PROJECT_ID}/zones/${ZONE}/instances/tf-instance-1"

terraform import 'module.instances.google_compute_instance.tf-instance-2' \
  "projects/${PROJECT_ID}/zones/${ZONE}/instances/tf-instance-2"

terraform apply -auto-approve
```

스크립트는 기존 VM의 disk, machine type, image, network 값을 `gcloud compute instances describe`로 읽어 코드에 반영한다. 이 과정을 빼면 import 후 apply에서 불필요한 변경이 생길 수 있다.

## Task 3. Remote backend

storage module로 GCS 버킷을 만들고, 그 버킷을 Terraform backend로 사용한다.

```hcl
resource "google_storage_bucket" "storage-bucket" {
  name                        = var.bucket_name
  location                    = "US"
  force_destroy               = true
  uniform_bucket_level_access = true
}
```

버킷을 만든 뒤 `backend "gcs"`를 추가하고 state를 옮긴다.

```bash
terraform init -migrate-state -force-copy
```

## Task 4. 인프라 수정

새 Compute Engine 인스턴스를 Terraform 코드에 추가한다. 랩에서 준 `INSTANCE_NAME`을 그대로 써야 한다.

```hcl
resource "google_compute_instance" "tf-instance-266133" {
  name         = "tf-instance-266133"
  machine_type = "e2-micro"
  zone         = var.zone
}
```

코드 추가 후 `terraform apply -auto-approve`로 반영한다.

## Task 5. 리소스 삭제

삭제 태스크는 `terraform destroy`를 쓰는 방식이 아니라, 코드에서 특정 리소스를 제거한 뒤 apply로 맞추는 흐름이다. 스크립트는 새로 만든 인스턴스를 코드에서 빼고 다시 apply한다.

```bash
terraform fmt -recursive
terraform init
terraform apply -auto-approve
```

## Task 6. Registry module 사용

Google Network module을 사용해 VPC를 구성한다.

```hcl
module "vpc" {
  source       = "terraform-google-modules/network/google"
  version      = "~> 9.0"
  project_id   = var.project_id
  network_name = var.vpc_name
}
```

`terraform init -upgrade`를 실행해야 Registry module을 내려받는다.

## Task 7. Firewall 구성

마지막은 Terraform으로 firewall rule을 추가한다.

```hcl
resource "google_compute_firewall" "tf-firewall" {
  name    = "tf-firewall"
  network = module.vpc.network_name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }
}
```

채점이 안 되면 VPC 이름과 firewall 이름이 랩 요구사항과 같은지 확인한다.

## 마무리

GSP345는 Terraform state가 핵심이다. import 후 코드를 대충 쓰면 apply 때 기존 VM을 바꾸려 들 수 있다. 스크립트처럼 기존 리소스 속성을 읽어서 코드에 반영한 뒤 import하는 흐름을 유지하자.
