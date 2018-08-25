# zihao.me

![Build Status](https://gitlab.com/zzh8829/zihao-pages/badges/master/build.svg)

Zihao Zhang's person website powered by:

- Hugo: Static HTML generator
- Webpack: JavaScript packer
- Gulp: Build pipeline
-

---

## Mac instructions

```
brew install hugo
brew install node

yarn install
yarn watch
```

## Publish Site
```
yarn deploy
yarn deploy-gitlab
```

## All Commands
```
watch           # Build + watch + dev server
build           # Build production
clean           # Clean artifacts
deploy          # Deploy with Google Cloud Storage
deploy-gitlab   # Deploy with GitLab
```
