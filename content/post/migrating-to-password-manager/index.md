+++
categories = ["security"]
date = "2017-03-23T23:33:17-07:00"
description =  "Migrating to 1Password Manager from Google Chrome"
tags = ["security", "password"]
title = "Migrating to Password Manager"
+++

Having my Spotify password stolen finally tilted me into using a password manager. This is my journey to strong and unique passwords on all my *653* logins.
<!--more-->

## The Dark History
When registering for new accounts, there is occasionally that little hint about not repeating passwords. I never took it seriously since I already registered on hundreds of other websites. There is this common trick that most people use: having different password for websites grouped by the importance. I too used this strategy and had 5 levels of passwords. The weakest one was literally same as my username and the strongest one had uppercase letters, digits and special characters (BTW this is [not very secure](https://xkcd.com/936/)).

Everything worked well in the beginning. It was around a year ago I had my level 2 password pawned because a small online forum got hacked and they stored password in plain text. Then this January I got alert for login attempts on my Skype account. And finally last week my Spotify showed an unrecognized device and random playlists were popping up. That's when I decided my old passwords scheme was too weak and started switching to managed, strong and unique passwords.

## Choosing the Best Password Manager

#### Plain Text in Cloud Storage
I actually had a little file of some generated passwords stored in my [personal cloud storage](https://seafile.zihao.me). Although I trust the security of my cloud storage, plain text isn't a good password storage format. On top of that,  the user experience wasn't that great: no auto fill support, no passwords generator, etc. But it was indeed very accessible, you can do it on iCloud, Dropbox or whatever you prefer.

![1password text](password-text.png)

#### Legitimate Password Manager
[LastPass](https://lastpass.com) and [1Password](https://1password.com) are two of the two most popular managers. LastPass has more users in general, 1Password is more popular in the developer community. They both offer desktop and mobile client and secure storage with fancy password generation and auto fill features. I tried out both apps and eventually went with 1Password. Reasons are

  - LastPass had some security problems before: [2015](https://blog.lastpass.com/2015/06/lastpass-security-notice.html/), [2017](https://blog.lastpass.com/2017/03/important-security-updates-for-our-users.html/)
  - 1Password has prettier interface
  - 1Password is less intrusive

One thing I really liked from LastPass but missing in 1Password was the [Inbox Importer](https://helpdesk.lastpass.com/downloading-and-installing/inbox-importer/).

## Migration from Chrome
The first step is to get rid of all my old and insecure passwords from Google Chrome password storage. This is very useful because Chrome does auto-fill/login on almost all the website I commonly use, without purging them I really can't remember to reset passwords.

#### Exporting Everything from Chrome
This was incredibly difficult before Chrome released password exporting feature in 2016. Thanks to password exporting you can do it easily like the following

- enable exporting at `chrome://flags/#password-import-export`
- export to csv at `chrome://settings/passwords`

#### Loading into 1Password
Importing directly will pollute the vault you already have, so we will create a new vault at https://my.1password.com/vaults Now we can import them to 1Password in the desktop app `file -> import`

![1password import](password-import.png)

#### Disable Chrome Password Auto-Fill
Chrome's built in auto-fill is not needed anymore after switching to password manager. Removing them from Chrome completely also reduces the risk of side channel attacks. Go to `chrome://settings` and use `Clear browsing data -> Passwords` also uncheck Google Smart Lock to prevent the annoying pop-ups.

## Eliminate Weak and Duplicate Passwords

This is really the main reason I imported everything to 1Password. With 1Password's built in Security Audit we can see our weak and duplicate passwords.

![password weak](password-weak.png)

Now we have all these information ready, your job is to fix'em all! My personal password generation setup is 32 characters long with 4 digits and 2 special characters. There really isn't a painless way to reset everything, I recommend doing them over period of few weeks and start from the more important websites like emails and banks. In the end, protecting security needs your time and attention, tools are only here to provide some help.

***

PS:

Username and password logins are extremely inefficient and insecure. IMO, web authentication should be linked directly to email providers. If we can reset password through email, why can we just login with proof from email providers? Even then, having a master password is still the weakest point of this ecosystem. Some suggested the use of finger prints, face or retina scan. But they are closer to identification then authentication. The key point of authentication is they can't be stolen or replicated easily. In this regard, PGP or private key based auth is ideal but probably too complicated for end users. I wish there is an alternative universe where humans are born with some biological private key. Maybe we already have that in our body somewhere waiting for us discover.
