---
title: "Owning Your Notes: Self-Hosting Memos with Docker and Secure Access via Pinggy"
link: https://dev.to/lightningdev123/owning-your-notes-self-hosting-memos-with-docker-and-secure-access-via-pinggy-20bm
author: Lightning Developer
publish_date: 2026-01-05 04:55:48
saved_date: 2026-01-17 15:10:05
tags: #webdev #ai #pinggy #productivity
---


Note-taking apps are everywhere. They are fast, polished, and convenient, but they often come with quiet compromises. Monthly payments, limited exports, and the uncomfortable feeling that your most personal thoughts live on someone else’s server. For many people, notes are not just reminders. They are ideas, plans, research, and private reflections. That is where self-hosting starts to make sense.

This article walks through a practical way to run your own note-taking system using Memos, containerized with Docker, and made accessible from anywhere using [Pinggy](https://pinggy.io/). The goal is not to replace every cloud feature, but to regain control while keeping things simple.

### Why Self-Host a Note-Taking App?

Cloud-based tools solve the setup problem, but they introduce new dependencies. Pricing can change. Features can disappear. Access depends on accounts and policies you do not control. More importantly, notes often contain sensitive information that you may prefer to keep private.

Self-hosting flips this model. Your data stays on your machine or server. You decide how it is backed up, who can access it, and how long it exists. With tools like Docker and lightweight tunneling services, this no longer requires deep infrastructure knowledge.

### What Makes Memos Different?

[![memos](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fontqs77nl8gp8u9kxw08.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fontqs77nl8gp8u9kxw08.png)

Memos is a minimalist, open-source note-taking service designed around quick capture and ownership. It focuses on writing first, organization second. Notes are stored as plain text with Markdown support, which keeps them readable and portable.

Under the hood, Memos uses a Go backend and a modern web frontend. By default, it stores data in a simple SQLite database, which means backups are as easy as copying a folder. For users who want more scale, MySQL and PostgreSQL are also supported.

Some highlights worth noting:

Markdown is native, not an add-on  
The interface stays fast and uncluttered  
No tracking or telemetry by default  
Multi-user support works well for small teams  
APIs are available for automation and integrations

It feels closer to a personal notebook than a complex productivity suite, and that is intentional.

### What You Will Build

By the end of this setup, you will have:

A self-hosted Memos instance running in Docker  
All notes stored locally on your system  
Remote access from any device using a secure tunnel  
No subscriptions and no external dependencies for your data

### Prerequisites

You only need Docker installed on your system.

On Windows or macOS, install Docker Desktop from the official Docker site.

On Ubuntu or Debian-based systems, you can use:  

```
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable docker --now
sudo usermod -aG docker $USER
```

After adding yourself to the Docker group, log out and log back in.

### Running Memos with Docker

Memos is intentionally easy to deploy. A single command is enough to get started.  

```
docker run -d \
  --name memos \
  -p 5230:5230 \
  -v ~/.memos:/var/opt/memos \
  neosmemo/memos:stable
```

What this does in simple terms:

The container runs in the background  
Port `5230` on your machine maps to the app  
Your notes are stored in a local folder  
The stable version of Memos is used

Once the container starts, you can confirm it is running:  

```
docker ps
```

Then open your browser and visit:  

```
http://localhost:5230
```

### Optional: Using Docker Compose

If you prefer a more structured setup, Docker Compose works well:  

```
version: '3.8'

services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    ports:
      - "5230:5230"
    volumes:
      - ./memos-data:/var/opt/memos
    restart: unless-stopped
```

Start it with:  

```
docker compose up -d
```

This approach makes future updates and configuration changes easier to manage.

### First-Time Setup in the Browser

When you open Memos for the first time, you will be asked to create an account. This initial account becomes the administrator. Choose a strong password, because this protects all your notes.

After logging in, the interface feels refreshingly simple. A text box at the top is always ready. Notes appear below in a clean timeline. There are no forced folders or complex hierarchies.

You can try a first note like this:  

```
# My First Self-Hosted Memo

This is my personal note-taking system running on my own hardware.

- No subscriptions
- Full privacy
- Complete data control

#selfhosted #notes
```

Tags, search, and Markdown formatting are available without getting in the way.

### Making Memos Accessible from Anywhere

Running Memos locally is useful, but access from your phone or another laptop is often essential. This is where [Pinggy](https://pinggy.io/) becomes helpful.

[Pinggy](https://pinggy.io/) creates a secure tunnel over SSH, exposing your local service to the internet without changing firewall rules or router settings.

Open a new terminal and run:  

```
ssh -p 443 -R0:localhost:5230 -t free.pinggy.io
```

After connecting, you will see a public URL similar to:  

```
https://randomstring.a.pinggy.link
```

Opening this link in a browser gives you access to your Memos instance from anywhere.

### Adding Basic Authentication

Since the service is now reachable online, adding another security layer is a good idea. Pinggy supports HTTP basic authentication.  

```
ssh -p 443 -R0:localhost:5230 -t free.pinggy.io "b:username:password"
```

Replace the username and password with your own values. Anyone opening the link will need to authenticate before even reaching the Memos login page.

### About Persistent URLs

With the free tier, the public URL changes every time the tunnel restarts. If you want a stable address that you can bookmark and reuse, [Pinggy](https://pinggy.io/) offers persistent subdomains as part of its paid plans.

### Conclusion

Self-hosting does not have to be complex or time-consuming. With Memos, you get a fast and thoughtful note-taking experience that stays out of your way. Docker keeps deployment clean and repeatable. Pinggy removes the usual networking hurdles that make remote access intimidating.

The result is a system that feels personal again. Your ideas stay with you, on your terms, without recurring costs or hidden trade-offs. If you value privacy, simplicity, and control, this setup is a solid place to start.

#### Reference:

[Self-Hosting a Note-Taking Application with Memos and Pinggy](https://pinggy.io/blog/self_hosting_memos_note_taking_app/)