---
title: Microsoft's Latest Patch Tuesday Fixes 114 Vulnerabilities
link: https://lifehacker.com/tech/microsoft-patch-tuesday-january-2026?utm_medium=RSS
author: Emily Long
publish_date: 2026-01-14 08:30:00
saved_date: 2026-01-17 15:08:42
image: https://lifehacker.com/imagery/articles/01KEWSRKZ2BAFKD483MGAJ5048/hero-image.jpg
tags: #Tech
---

![image](https://lifehacker.com/imagery/articles/01KEWSRKZ2BAFKD483MGAJ5048/hero-image.jpg)

Microsoft has released its "Patch Tuesday" update for January, and you should ensure your computer receives these security fixes as soon as possible. This update addresses 114 vulnerabilities in total, including three zero-days (bugs that have been actively exploited or publicly disclosed before an official fix is available from the developer).

As [reported by BleepingComputer](https://www.bleepingcomputer.com/news/microsoft/microsoft-january-2026-patch-tuesday-fixes-3-zero-days-114-flaws/ "open in a new window"), security flaws were found across the following categories: 57 elevation-of-privilege vulnerabilities, three security feature bypass vulnerabilities, 22 remote code-execution vulnerabilities, 22 information disclosure vulnerabilities, two denial of service vulnerabilities, and five spoofing vulnerabilities. Six of the remote code execution vulnerabilities and two of the elevation of privilege vulnerabilities are considered "critical."

Your machine should receive security updates automatically when Patch Tuesday drops, which is around 10 am PT on the second Tuesday of the month. You can check to confirm by going to **Start > Settings > Windows Update** and selecting **Check for Windows updates**

## Three zero-days patched in January

One of the three zero-days fixed this month has been actively exploited in the wild. The flaw, labeled [CVE-2026-20805](https://msrc.microsoft.com/update-guide/en-US/advisory/CVE-2026-20805 "open in a new window"), is an information disclosure vulnerability in the Desktop Windows Manager that allows attackers access to memory addresses from a remote ALPC port. Microsoft Threat Intelligence Center (MSTIC) & Microsoft Security Response Center (MSRC) have been credited with identifying this bug.

The other two zero-days have been publicly disclosed. [CVE-2026-21265](https://msrc.microsoft.com/update-guide/en-US/advisory/CVE-2026-21265 "open in a new window") is a security bypass feature vulnerability that allows threat actors to bypass Secure Boot on systems that have not updated certificates issued in 2011 and nearing expiration. [CVE-2023-31096](https://msrc.microsoft.com/update-guide/en-US/advisory/CVE-2023-31096 "open in a new window") is an elevation of privilege vulnerability in third-party Agere Soft Modem drivers that ship with supported Windows operating systems installed. Microsoft has removed these drivers from Windows.

Microsoft released other non-security updates today, as well as additional patches for Microsoft Edge and Mariner vulnerabilities earlier this month.