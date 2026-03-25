---
title: This Free Script Disables Every AI Feature in Windows 11
link: https://lifehacker.com/tech/this-script-disables-all-the-ai-features-in-windows-11?utm_medium=RSS
author: Justin Pot
publish_date: 2026-01-07 17:00:00
saved_date: 2026-01-17 15:08:44
image: https://lifehacker.com/imagery/articles/01KED0B1D345J0CD6WR4GPNT45/hero-image.png
tags: #AI
---

![image](https://lifehacker.com/imagery/articles/01KED0B1D345J0CD6WR4GPNT45/hero-image.png)

Some people love AI. If you're not one of them (or if you have a favorite AI tool that isn't baked into it), using Windows 11 can feel increasingly hostile. It seems like every part of it now exists to push you into using Copilot—even notepad.exe has a prominent AI button in the user interface at this point.

If you'd like your operating system to go back to being an operating system, check out  
[RemoveWindowsAI](https://github.com/zoicware/RemoveWindowsAI "open in a new window"). This free script changes various registry keys to disable AI features including Copilot, [Recall](https://lifehacker.com/tech/windows-recall-privacy-security-concerns), and the Copilot integrations in applications including Edge, Paint, and Notepad. Using various workarounds , it then configures Windows Update to not install those updates again ([the documentation](https://github.com/zoicware/RemoveWindowsAI/blob/main/Documentation.md "open in a new window") breaks the process down, if you're interested).

## How to run RemoveWindowsAI on your machine

To get started you need to open Microsoft PowerShell on your computer. Make sure you're using Windows PowerShell 5.1, and not the updated PowerShell 7 (this only really applies if you've intentionally installed PowerShell 7, so don't worry about this step if you didn't actively do that).

To start the script you will need to copy a command [from the Github page for RemoveWindowsAI](https://github.com/zoicware/RemoveWindowsAI "open in a new window") and paste it into your PowerShell window (I'm not including the command directly here in case it changes in the future). Once you do, the user interface will show up, allowing you to choose which AI features you want to disable. Make your choices and watch the changes take place in the PowerShell window.

![A screenshot of the script running in PowerShell.](https://lifehacker.com/imagery/articles/01KED0B1D345J0CD6WR4GPNT45/images-1.fill.size_2000x998.v1767815611.png)

Credit: Justin Pot

I tried this out, removing everything. I then opened Notepad—no Copilot icon in sight. The Copilot application was also gone, along with all reference to AI in the Settings application. It would be nice if Microsoft offered a way to do this without resorting to this sort of unofficial workaround, but that isn't the world we live in.