---
title: I automated Linux backups with a simple bash script and cron (and it’s better than a GUI)
link: https://www.howtogeek.com/i-automated-linux-backups-with-a-simple-script-3-lessons-i-learned-the-hard-way/
author: John Wachira
publish_date: 2026-01-14 10:00:16
saved_date: 2026-01-17 15:09:09
image: https://static0.howtogeekimages.com/wordpress/wp-content/uploads/2025/11/hand-holding-a-hard-drive-with-cloud-backup-icons-showing-error-alerts-and-an-active-backup-progress-bar.png
tags: #Linux #Linux & macOS Terminal
---

![image](https://static0.howtogeekimages.com/wordpress/wp-content/uploads/2025/11/hand-holding-a-hard-drive-with-cloud-backup-icons-showing-error-alerts-and-an-active-backup-progress-bar.png)

A tool like Déjà Dup is an easy and excellent graphical way to [automate Linux backups](https://www.howtogeek.com/how-to-set-up-automatic-backups-on-ubuntu-using-deja-dup/). However, creating a backup script is the superior, DIY way to automate backups. It offers way more control over what gets backed up, where the data gets backed up, and the frequency of backup jobs. It’s also a fun introduction to basic scripting. Here’s how I created a simple backup script and used cron to automate backup jobs.