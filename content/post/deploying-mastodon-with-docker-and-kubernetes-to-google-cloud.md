+++
date = "2017-04-16T19:05:33-07:00"
categories = ["cloud"]
tags = ["kubernetes", "docker", "cloud", "gke", "mastodon"]
description = "how to easily deploy a docker containerized auto-scaling mastodon kubernetes cluster to google container engine"
title = "Deploying Mastodon to Google Cloud Platform"
draft = true
+++

1. create google cloud platform account if you haven't
gcloud auth login
gcloud config set project gcloud-zihao  
gcloud config set compute/zone us-west1-a  

2. kubernetes cluster
gcloud container clusters create mastodon --disk-size=10 --machine-type=g1-small --num-nodes=1
gcloud container clusters get-credentials mastodon

3. cloud storage

- connect to gcloud kubernetes master


4. deploy postgresql + redis

5. deploy mastodon 

