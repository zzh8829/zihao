+++
categories = ["cloud"]
date = "2017-03-19T10:39:54-07:00"
description = "How I bootstrapped a mini Kubernetes cluster on ubuntu linux from scratch with kubeadm and weave"
tags = ["kubernetes", "docker", "cloud"]
title = "Creating a Kubernetes Cluster from Scratch with Kubeadm"

+++

Containerization and Kubernetes are the hottest cloud technologies right now. Here is how I configured a mini Kubernetes cluster for my side projects.
<!--more-->

## An Introduction to Kubernetes

You are probably already familiar with docker containers, simply running `docker build` will get you a consistent and reusable deployment unit. Everything sounds great, but manually deploying, restarting on crash, deciding which container goes to which server and managing their IPs and ports are inconvenient and sometimes painful. Kubernetes is an open source container orchestration solution aiming to solve all of those and more.
  
Here are some important Kubernetes term you should know about

* pod - group of one or more containers running on a *node*
* node - a server inside of a Kubernetes *cluster*
* cluster - a group of servers managed by Kubernetes
* master - the server that runs Kubernetes and manages other servers
* worker - servers managed by the master server
* deployment - settings for deploying *pods* to *cluster*
* service - settings for accessing *pods* within *cluster*
* ingress - settings for accessing *pods* from the Internet

<br/>
A standard Kubernetes cluster has following [components](https://kubernetes.io/docs/concepts/overview/components/)

* etcd - Distributed key-value store for configuration and service discovery.
* weave/flannel - Container Network Interface for connecting services  
* kube-apiserver - API server for management and orchestration
* kube-controller-manager - Controls Kubernetes services
* kube-discovery - Service discovery
* kube-dns - DNS server for internal hostnames
* kube-proxy - Routes traffic through proxy
* kube-schedular - Schedules containers on the cluster.

<br/>
Note that these are my own explanation of what they do, if you want the legitimate and precise definition read the [official docs](https://kubernetes.io/docs). Thanks to Google and the Kubernetes community, setting all of them up takes less than 5 minutes.

## Setting up Kubernetes Cluster
In this article we are building a minimalistic single node cluster with optional workers. The default CPU/memory configuration for master servers are quite high because they were prepared for larger cluster. I recommend 2 CPUs and 1 GB memory for the least resistant process. If you are cheap like me, you can hack through with some extra tweaks on a low-end server. Any kind of server is fine for workers, as long as they can connect to the master.

We will start with deploying the Kubernetes master on a fresh ubuntu server. Having some swap space is great, especially if you are low on memory.
```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo echo "/swapfile   none    swap    sw    0   0" >> /etc/fstab
```
Install packages required for Kubernetes
```bash
# Prepare for new repos
sudo apt-get -y install apt-transport-https ca-certificates software-properties-common curl
# Add docker repo
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
       "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
       $(lsb_release -cs) \
       stable"
# Add kubernetes repo
sudo curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
sudo add-apt-repository \
       "deb https://apt.kubernetes.io/ \
       kubernetes-$(lsb_release -cs) \
       main"
sudo apt-get update && apt-get install -y docker-ce kubelet kubeadm kubernetes-cni
```
Now we can start building the master with kubeadm
```bash
kubeadm init
```
This will print the secret for authenticating worker nodes, don't forget to save them.
If nothing went wrong, the master server will be running! At this point we don't ever need to login to the master server again, the next step will be on your own machine. You need `kubectl` to communicate with the master server. On mac with homebrew, this is very simple just `brew install kubectl`, for other OS follow the [instructions here](https://kubernetes.io/docs/tasks/kubectl/install/)
```bash
# Download kubectl config from the master server
scp root@"master ip":/etc/kubernetes/admin.conf ~/.kube/config
# We need this to run pods on master node cuz servers are expensive
kubectl taint nodes --all dedicated-
# Install weave CNI, there are other choices, but weave is probably the easist
kubectl apply -f https://git.io/weave-kube-1.6
# Install Dashboard for nice graphical web interface.
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard.yaml
# Proxy dashboard so we can view it locally
kubectl proxy
```
Congratulations, now we have a complete working single node Kubernetes *cluster*. You can check the status and explore a bit with dashboard at `localhost:8001/ui`
![Kubernetes Dashboard](/images/kube-dash.png) 

To join more nodes into our cluster, repeat the same commands as the master node above, except the `kubeadm init` is replaced with
```bash
kubeadm join --token="master token" "master ip"
```
You shouldn't need to manually type this, the master server should print this with pre-filled token and IP at the end of initialization.

## Ingress, Let's Encrypt and Hello World Deployment
Now we have our server cluster running, let's put some real work to it. One thing we haven't talked about is how does our app inside the cluster talks to the Internet? If you are running on AWS or GCE, you can use their built-in load balancer for Kubernetes, but since we are building from scratch, we need a thing called Ingress Controller.

Ingress Controller controls load balancing, routing and public HTTPS encryption. Each app needs to define its own Ingress resource which I will cover later. To set up an Ingress Controller you can use my configurations here or read up on fancier versions on official docs 
```bash
kubectl apply -f https://gist.githubusercontent.com/zzh8829/fe2e8388a22ec6f2244ccb835b62e07c/raw/4284e123937f5d09683d9a7494d40335e819ccea/nginx-ingress.yaml
``` 
This will create a nginx powered ingress that direct all traffic a default back-end that returns 404 for everything. In order to support encrypted HTTPS traffic, we can use [kube-lego](https://github.com/jetstack/kube-lego) to automatically enable HTTPS through Let's Encrypt. Simply download configurations from their [examples](https://github.com/jetstack/kube-lego/tree/master/examples/nginx/lego), modify them and deploy with `kubectl apply -f yourconfigname.yaml`

Now we will create and deploy a basic node.js hello world application. If you don't understand what this code does, just close this page and go back to Reddit or something.

```javascript
// index.js
var http = require('http');
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World!\n");
});
server.listen(8000);
console.log("Server running at http://127.0.0.1:8000/");
```
Create a simple Dockerfile
```
FROM node:boron
RUN mkdir -p /app
WORKDIR /app
COPY . .
EXPOSE 8000
CMD node index.js
```
Build and verify and upload to Docker hub
```
docker built -t zihao/hello .
docker run -d -p 8000:8000 zihao/hello
curl localhost:8000
# You should see "Hello World!" from curl
docker push zihao/hello
```
Now everything is ready, we will deploy this Hello World application to our Kubernetes Cluster. Save the following configuration as `deploy.yaml`
```YAML
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 1
  revisionHistoryLimit: 2
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
      - name: hello
        image: zihao/hello
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: hello
  labels:
    app: hello
spec:
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: hello
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: hello
  annotations:
    kubernetes.io/tls-acme: "true"
    kubernetes.io/ingress.class: "nginx"
spec:
  tls:
  - hosts:
    - hello.kube.zihao.me
    secretName: hello-tls
  rules:
  - host: hello.kube.zihao.me
    http:
      paths:
      - backend:
          serviceName: hello
          servicePort: 8000
        path: /
```
This deploy script contains 3 parts: Deployment, Service and Ingress. The deployment part will pull our pre-built container image `zihao/hello` and run it with 1 replica. The service part describes that our container *hello* is listening on port 8000, and creates a service *hello* with port 80 for other containers in our cluster to access. The last Ingress part enables HTTPS traffic and says Internet traffic from `hello.kube.zihao.me` will be directed to our hello service at port 80. Now we will deploy this with
```
kubectl apply -f deploy.yaml
```
Point your domain DNS to the master server and after a while you will be able to see our example working at https://hello.kube.zihao.me YAY!

![Hello World](/images/kube-hello.png)

* * *

 *The hello world project is available on [GitLab](https://gitlab.com/zzh8829/hello)*
 
 *Learn more about [Kubernetes](https://kubernetes.io/) and [Docker](https://docker.com)*

