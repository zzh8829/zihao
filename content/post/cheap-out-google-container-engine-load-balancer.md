+++
description = "Cheap Out Load Balancer on Google Container Engine"
title = "Custom Nginx Ingress Controller on Google Container Engine"
date = "2017-04-23T23:26:07-07:00"
categories = ["cloud"]
tags = ["gke", "kubernetes", "nginx"]

+++

Google Container Engine offers a great managed kubernetes cluster. But it comes with one catch, Load Balancing and Ingress Controller are rather expensive. Here is how you can use nginx as an alternative to google's load balancer.
<!--more-->

```bash
gcloud config set project gcloud-zihao
gcloud config set compute/zone us-east1-b
export CLUSTER_NAME=zihao

# create load balancer's static ip
gcloud compute addresses create $CLUSTER_NAME-ip --region us-east1
export LB_ADDRESS_IP=$(gcloud compute addresses list | grep $CLUSTER_NAME-ip | awk '{print $3}')
gcloud compute addresses list
```
We want our load balancer node to have a static IP address so we don't need to change DNS.

```bash
# create cluster with one instance
gcloud container clusters create $CLUSTER_NAME --addons HorizontalPodAutoscaling,KubernetesDashboard --disk-size=30 --machine-type=n1-standard-1 --num-nodes=1 --zone us-east1-b
gcloud container clusters get-credentials $CLUSTER_NAME

# re-assign static ip to instance
export LB_INSTANCE_NAME=$(kubectl describe nodes | head -n1 | awk '{print $2}')
export LB_INSTANCE_NAT=$(gcloud compute instances describe $LB_INSTANCE_NAME | grep -A3 networkInterfaces: | tail -n1 | awk -F': ' '{print $2}')
gcloud compute instances delete-access-config $LB_INSTANCE_NAME \
    --access-config-name "$LB_INSTANCE_NAT"
gcloud compute instances add-access-config $LB_INSTANCE_NAME \
    --access-config-name "$LB_INSTANCE_NAT" --address $LB_ADDRESS_IP
```

We want to label our load balancing node so kubernetes only assigns nginx ingress controller to this node

```bash
# label our load balancer node
kubectl label nodes $LB_INSTANCE_NAME role=load-balancer

# enable http ports for load balancer
gcloud compute instances add-tags $LB_INSTANCE_NAME --tags http-server,https-server
```

Now we have everything set up on google cloud, here is the deployment file for nginx ingress controller.

```YAML
apiVersion: v1
kind: Namespace
metadata:
  name: ingress-nginx
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: default-http-backend
  labels:
    app: default-http-backend
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: default-http-backend
  template:
    metadata:
      labels:
        app: default-http-backend
    spec:
      terminationGracePeriodSeconds: 60
      containers:
      - name: default-http-backend
        # Any image is permissible as long as:
        # 1. It serves a 404 page at /
        # 2. It serves 200 on a /healthz endpoint
        image: gcr.io/google_containers/defaultbackend:1.4
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 30
          timeoutSeconds: 5
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: 10m
            memory: 20Mi
          requests:
            cpu: 10m
            memory: 20Mi
---
apiVersion: v1
kind: Service
metadata:
  name: default-http-backend
  namespace: ingress-nginx
  labels:
    app: default-http-backend
spec:
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: default-http-backend
---
kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-configuration
  namespace: ingress-nginx
  labels:
    app: ingress-nginx
data:
  hsts-include-subdomains: "false"
---
kind: ConfigMap
apiVersion: v1
metadata:
  name: tcp-services
  namespace: ingress-nginx
data:
  1194: "default/openvpn-openvpn:1194"
---
kind: ConfigMap
apiVersion: v1
metadata:
  name: udp-services
  namespace: ingress-nginx
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ingress-nginx
  template:
    metadata:
      labels:
        app: ingress-nginx
      annotations:
        prometheus.io/port: '10254'
        prometheus.io/scrape: 'true'
    spec:
      # hostNetwork makes it possible to use ipv6 and to preserve the source IP correctly regardless of docker configuration
      # however, it is not a hard dependency of the nginx-ingress-controller itself and it may cause issues if port 10254 already is taken on the host
      # that said, since hostPort is broken on CNI (https://github.com/kubernetes/kubernetes/issues/31307) we have to use hostNetwork where CNI is used
      # like with kubeadm
      hostNetwork: true
      nodeSelector:
        role: load-balancer
      containers:
        - name: nginx-ingress-controller
          image: quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.12.0
          args:
            - /nginx-ingress-controller
            - --default-backend-service=$(POD_NAMESPACE)/default-http-backend
            - --configmap=$(POD_NAMESPACE)/nginx-configuration
            - --tcp-services-configmap=$(POD_NAMESPACE)/tcp-services
            - --udp-services-configmap=$(POD_NAMESPACE)/udp-services
            - --annotations-prefix=nginx.ingress.kubernetes.io
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          ports:
          - name: http
            containerPort: 80
            hostPort: 80
          - name: https
            containerPort: 443
            hostPort: 443
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          resources:
            limits:
              cpu: 50m
              memory: 100Mi
            requests:
              cpu: 10m
              memory: 50Mi
```

Here we have ``nodeSelector: role: load-balancer` so this pod only lands on load balancer node in the cluster. We use `hostPort` here to connect internet traffic with nginx container.

```bash
# install nginx ingres controller with hostPort
kubectl apply -f nginx-ingress-controller.yaml
```
You can test the default backend with `curl $LB_ADDRESS_IP` and should see output like `default backend - 404`. If everything goes as expected, our cheap ingress controller is ready to use for Ingress resource with `kubernetes.io/ingress.class: "nginx"` annotation.
