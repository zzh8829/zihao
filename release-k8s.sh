#!/bin/bash
set -e
gsutil -m rsync -d -r public gs://storage.zihao.me/zihao.me
rm -rf public
