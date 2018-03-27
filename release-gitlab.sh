#!/bin/bash 
set -e
TMP=$(mktemp -d)
git clone git@gitlab.com:zzh8829/zihao-pages.git $TMP
rm -rf $TMP/*
cp -r gitlab-pages/. $TMP/
mv public $TMP/
cd $TMP
git add .
git commit -m "Update Pages $(date)"
git push origin master
rm -rf $TMP
