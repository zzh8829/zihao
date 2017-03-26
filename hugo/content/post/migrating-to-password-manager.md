+++
categories = ["security"]
date = "2017-03-23T23:33:17-07:00"
description = ""
tags = ["security", "password"]
title = "Migrating to Password Manager"
draft = true
+++

Having my Spotify password stolen finally tilted me into using a password manager. This is my journey to strong and unique passwords on all my *653* logins.
<!--more-->

## The Dark History
When registering for new accounts, there is occasionally that little hint about not repeating passwords. I never took it seriously, but honestly who could remember all the different passwords, especially for power users who registered on hundreds of websites. There is this common trick that most people use: having different password for websites grouped by the importance. I too used this strategy and had 5 levels of passwords. The weakest one was literally same as my username, it's for sites that I absolutely do not care about. The strongest one being password for my Gmail and financial accounts which I really can't afford to lose. It was around 2 years ago I had my level 2 password pawned because a small online forum got hacked and they stored password in plain text. Then this January I got alert for login attempts on my Skype account. And finally last week my Spotify shows it's playing on a unrecognized device and random play lists popped up. That was the point I decided my passwords scheme was not suitable anymore and started switching to managed, strong and unique passwords. 

## Choosing the Best Password Manager

#### Plain Text in Cloud Storage
I actually had a little file of some random password stored in my [personal cloud storage](https://seafile.zihao.me). The problem with this is passwords are in plain text, generating new passwords is not easy, no auto fill support and user experience is not that great. But this is very accessible and easy to start, you can do it on iCloud, Dropbox or whatever you prefer.

#### Legitimate Password Manager
The two most popular managers are [LastPass](https://lastpass.com) and [1Password](https://1password.com). LastPass has more users, but 1Password is more commonly seen in the developer community because it was started in macOS. I tried out both apps and eventually went with 1Password. Reasons are

  - LastPass had some security problems before: [2015](https://blog.lastpass.com/2015/06/lastpass-security-notice.html/), [2017](https://blog.lastpass.com/2017/03/important-security-updates-for-our-users.html/)
  - 1Password has prettier interface
  - 1Password just feels smoother overall

One thing I really liked from LastPass but missing in 1Password was the [Inbox Importer](https://helpdesk.lastpass.com/downloading-and-installing/inbox-importer/). 

## Migration from Chrome
The first step is to get rid of all my old and insecure passwords from Google Chrome. This is very important because Chrome does auto-fill/login on almost all my passwords, without this step I really can't remember to reset passwords.

### Exporting Everything from Chrome
This was definitely not as easy as I imagined.

### Clean up and Loading into 1Password
I wrote this python script to clean up everything

### Disable Chrome Password Auto-Fill 
We don't want to use chrome auto-fill anymore after switching to 

## 






























































