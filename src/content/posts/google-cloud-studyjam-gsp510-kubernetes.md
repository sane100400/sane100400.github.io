---
title: "Google Cloud Study Jam GSP510 - GKE와 Managed Prometheus 실습"
published: 2026-05-31
description: "GSP510 챌린지 랩에서 GKE 클러스터, Managed Prometheus, 로그 기반 메트릭, 컨테이너 빌드와 배포를 진행하는 방법"
tags: [GCP, GKE, Kubernetes, Managed Prometheus, Artifact Registry, Qwiklabs]
category: Cloud
draft: false
---

GSP510은 GKE 랩이다. 클러스터를 만들고 Managed Prometheus를 켠 뒤, 일부러 깨진 앱을 배포해 로그 기반 메트릭과 알림을 만들고, 마지막에는 코드를 컨테이너 이미지로 빌드해서 다시 배포한다.

## 시작 값

```bash
export PROJECT_ID="qwiklabs-gcp-XX-XXXXXXXXXXXX"
export CLUSTER_NAME="hello-world-..."
export ZONE="us-west1-b"
export REGION="${ZONE%-*}"
export NAMESPACE="gmp-..."
export REPO_NAME="hello-repo"
export SERVICE_NAME="helloweb-service-..."
export INTERVAL="30s"

gcloud config set project "$PROJECT_ID"
gcloud config set compute/zone "$ZONE"
```

클러스터 이름, namespace, service 이름이 랩마다 달라진다.

## Task 1. GKE 클러스터 만들기

```bash
gcloud services enable \
  container.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  artifactregistry.googleapis.com

gcloud container clusters create "$CLUSTER_NAME" \
  --zone "$ZONE" \
  --release-channel "regular" \
  --num-nodes "3" \
  --enable-autoscaling \
  --min-nodes "2" \
  --max-nodes "6"

gcloud container clusters get-credentials "$CLUSTER_NAME" --zone "$ZONE"
```

클러스터 생성은 시간이 걸린다. `kubectl get nodes`로 노드가 보인 뒤 채점한다.

## Task 2. Managed Prometheus

클러스터에 Managed Prometheus를 켜고 namespace를 만든다.

```bash
gcloud container clusters update "$CLUSTER_NAME" \
  --zone "$ZONE" \
  --enable-managed-prometheus

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
```

샘플 앱과 `PodMonitoring` 리소스를 적용한다.

```bash
kubectl -n "$NAMESPACE" apply -f prometheus-app.yaml
kubectl -n "$NAMESPACE" apply -f pod-monitoring.yaml
kubectl -n "$NAMESPACE" get pods
```

## Task 3. 앱 배포

`gs://spls/gsp510/hello-app/`에서 샘플 앱을 가져와 배포한다.

```bash
gcloud storage cp -r gs://spls/gsp510/hello-app/ .

kubectl -n "$NAMESPACE" apply -f ~/hello-app/manifests/helloweb-deployment.yaml
```

이 시점의 deployment는 이미지가 잘못되어 `InvalidImageName` 상태가 나오는 게 정상이다. 그 상태를 이용해 다음 태스크에서 로그 기반 메트릭을 만든다.

## Task 4. 로그 기반 메트릭과 알림

warning 로그를 세는 metric을 만든다.

```bash
gcloud logging metrics create pod-image-errors \
  --description="Counts Kubernetes pod image errors and warnings" \
  --log-filter='resource.type="k8s_pod"
severity=WARNING'
```

그다음 `Pod Error Alert` 알림 정책을 만든다.

```bash
gcloud monitoring policies create --policy-from-file="$HOME/pod-error-alert-policy.json"
```

채점이 안 되면 기존 정책을 삭제하고 스크립트의 troubleshooting 블록으로 정책만 다시 만들어 본다.

## Task 5. 이미지 수정 후 재배포

deployment manifest의 `<todo>` 이미지를 Google 샘플 이미지로 바꾼다.

```bash
perl -0pi -e 's|image:\s*["'\'']?<todo>["'\'']?|image: us-docker.pkg.dev/google-samples/containers/gke/hello-app:1.0|g' \
  ~/hello-app/manifests/helloweb-deployment.yaml

kubectl -n "$NAMESPACE" delete deployment helloweb --ignore-not-found
kubectl -n "$NAMESPACE" apply -f ~/hello-app/manifests/helloweb-deployment.yaml
kubectl -n "$NAMESPACE" rollout status deployment/helloweb --timeout=180s
```

## Task 6. 컨테이너 빌드와 배포

앱 버전을 `2.0.0`으로 바꾸고 Artifact Registry에 이미지를 push한다.

```bash
export IMAGE_URI="${REPO_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/hello-app:v2"

gcloud auth configure-docker "${REPO_LOCATION}-docker.pkg.dev" --quiet
docker build -t "$IMAGE_URI" .
docker push "$IMAGE_URI"
```

deployment 이미지를 새 이미지로 바꾸고 LoadBalancer service를 노출한다.

```bash
kubectl -n "$NAMESPACE" set image deployment/helloweb hello-app="$IMAGE_URI"
kubectl -n "$NAMESPACE" rollout status deployment/helloweb --timeout=180s

kubectl -n "$NAMESPACE" expose deployment helloweb \
  --name="$SERVICE_NAME" \
  --type=LoadBalancer \
  --port=8080 \
  --target-port="$TARGET_PORT"
```

external IP는 늦게 붙을 수 있다.

```bash
kubectl -n "$NAMESPACE" get service "$SERVICE_NAME"
```

IP가 나오면 `curl http://IP:8080`으로 확인하고 채점한다.

## 마무리

GSP510은 “깨진 상태”도 실습 흐름의 일부다. Task 3에서 이미지 에러가 나는 건 실패가 아니라 다음 메트릭 태스크를 위한 준비다. 서둘러 고치지 말고 Task 4를 먼저 채점한 뒤 Task 5에서 이미지를 바꾸면 된다.
