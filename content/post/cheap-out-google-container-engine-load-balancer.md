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
export CLUSTER_NAME=zihao

# create load balancer's static ip
gcloud compute addresses create $CLUSTER_NAME-ip --region us-west1
export LB_ADDRESS_IP=$(gcloud compute addresses list | grep $CLUSTER_NAME-ip | awk '{print $3}')
```
We want our load balancer node to have a static IP address so we don't need to change DNS.

```bash
# create cluster with one instance
gcloud container clusters create $CLUSTER_NAME --disable-addons HttpLoadBalancing --disk-size=10 --machine-type=g1-small --num-nodes=1
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
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: default-http-backend
  labels:
    k8s-app: default-http-backend
  namespace: kube-system
spec:
  replicas: 1
  template:
    metadata:
      labels:
        k8s-app: default-http-backend
    spec:
      terminationGracePeriodSeconds: 60
      containers:
      - name: default-http-backend
        # Any image is permissable as long as:
        # 1. It serves a 404 page at /
        # 2. It serves 200 on a /healthz endpoint
        image: gcr.io/google_containers/defaultbackend:1.0
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
  namespace: kube-system
  labels:
    k8s-app: default-http-backend
spec:
  ports:
  - port: 80
    targetPort: 8080
  selector:
    k8s-app: default-http-backend
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-ingress-controller
  namespace: kube-system
data:
  hsts-include-subdomains: "false"
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  labels:
    k8s-app: nginx-ingress-controller
  namespace: kube-system
spec:
  replicas: 1
  template:
    metadata:
      labels:
        k8s-app: nginx-ingress-controller
    spec:
      # hostNetwork makes it possible to use ipv6 and to preserve the source IP correctly regardless of docker configuration
      # however, it is not a hard dependency of the nginx-ingress-controller itself and it may cause issues if port 10254 already is taken on the host
      # that said, since hostPort is broken on CNI (https://github.com/kubernetes/kubernetes/issues/31307) we have to use hostNetwork where CNI is used
      # like with kubeadm
      hostNetwork: true
      terminationGracePeriodSeconds: 60
      nodeSelector:
        role: load-balancer
      containers:
      - image: gcr.io/google_containers/nginx-ingress-controller:0.9.0-beta.3
        name: nginx-ingress-controller
        readinessProbe:
          httpGet:
            path: /healthz
            port: 10254
            scheme: HTTP
        livenessProbe:
          httpGet:
            path: /healthz
            port: 10254
            scheme: HTTP
          initialDelaySeconds: 10
          timeoutSeconds: 1
        ports:
        - containerPort: 80
          hostPort: 80
        - containerPort: 443
          hostPort: 443
        env:
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: POD_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
        args:
        - /nginx-ingress-controller
        - --default-backend-service=$(POD_NAMESPACE)/default-http-backend
        - --configmap=$(POD_NAMESPACE)/nginx-ingress-controller
```

Here we have ``nodeSelector: role: load-balancer` so this pod only lands on load balancer node in the cluster. We use `hostPort` here to connect internet traffic with nginx container.

```bash
# install nginx ingres controller with hostPort
kubectl apply -f nginx-ingress-controller.yaml
```
You can test the default backend with `curl $LB_ADDRESS_IP` and should see output like `default backend - 404`. If everything goes as expected, our cheap ingress controller is ready to use for Ingress resource with `kubernetes.io/ingress.class: "nginx"` annotation. 
