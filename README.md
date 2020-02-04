# zihao.me

![Build Status](https://gitlab.com/zzh8829/zihao-pages/badges/master/build.svg)

Zihao Zhang's person website powered by:

- Hugo: Static HTML generator
- Webpack: JavaScript packer
- Gulp: Build pipeline

---

## Mac instructions

```
brew install hugo
brew install node

git submodule update --init
yarn install
yarn start
```

## Publish Site

```
yarn deploy
# or
yarn deploy-gitlab
```

## All Commands

```
start           # Dev Build + Watch
build           # Build production
clean           # Clean artifacts
deploy          # Deploy with Google Cloud Storage
deploy-gitlab   # Deploy with GitLab
```
