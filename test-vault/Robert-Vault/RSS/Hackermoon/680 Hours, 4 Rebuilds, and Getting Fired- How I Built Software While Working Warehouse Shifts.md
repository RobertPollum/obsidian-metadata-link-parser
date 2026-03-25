---
title: "680 Hours, 4 Rebuilds, and Getting Fired: How I Built Software While Working Warehouse Shifts"
link: https://hackernoon.com/680-hours-4-rebuilds-and-getting-fired-how-i-built-software-while-working-warehouse-shifts?source=rss
author: Marcin "HCK" Firmuga
publish_date: 2026-01-16 12:00:12
saved_date: 2026-01-17 15:10:00
image: https://hackernoon.com/https://cdn.hackernoon.com/images/H7Dj25ThjiXhCwCop3SAL3gTTDx1-jh23c9h.png
tags: #startup #programming-journey #building-software #coding-journey #programming-beginner #pc-workman #how-i-rebuilt #hackernoon-top-story
---

![image](https://hackernoon.com/https://cdn.hackernoon.com/images/H7Dj25ThjiXhCwCop3SAL3gTTDx1-jh23c9h.png)

## There's a specific breed of tech content I've grown tired of.

**The kind where someone** "==built a SaaS in a weekend==" or "==went from idea to $10k MRR in 30 days==."

\\ The kind that makes building software look like a montage sequence: fast cuts, dramatic music, inevitable success. This is not that story.

![PC_Workman 1.5.7 - Expanded View Mode](https://cdn.hackernoon.com/images/H7Dj25ThjiXhCwCop3SAL3gTTDx1-ut03cub.jpeg)

\\

### This is about 680 hours of coding after warehouse shifts. Four complete rebuilds.

A laptop that **regularly hits 94°C.**

\\ And getting **fired** **three** **days** before **Christmas**. It's messier. **It's slower.**

\\ And I think it's closer to what building actually looks like for **most of us.**

## The Setup Nobody Talks About

**Nine months ago**, I moved from **Poland** to the **Netherlands**. Not for a startup. Not for a tech role.

\\ For a **warehouse job** - **order picker** at a distribution center.

\\ The kind of work where you walk **15-20 kilometer**s a day between shelves, **scanning barcodes**, and **loading pallets** onto **trucks**.

\\ ==My back hurt. My feet hurt.== My dreams of being a "real developer" felt very far away.

\\ ==But every night, after the shifts ended,== I'd open my laptop, a 2014 machine that sounded like a jet engine and regularly threatened to burn my desk, and I'd code.

### I was building PC Workman

**a system monitoring tool born from a simple frustration:**

> existing tools tell you your CPU is at 87%, but they don't tell you _\*why\*_.
> 
> **Which process? Which background app? Is it Chrome being Chrome again?**
> 
> **That Windows update running silently?**

\\ ![First UX Prototype version - xDDD](https://cdn.hackernoon.com/images/H7Dj25ThjiXhCwCop3SAL3gTTDx1-2026-01-16T17:00:11.206Z-iiaxe7xwp3kvuz3rnosigpn7)

\\ I wanted a tool that explains, not just displays. Simple concept.

\\ The execution would prove to be anything but.

### The First Rebuild: Loving Your Own Garbage.

### My first version was, objectively, terrible.

I didn't know it at the time. I was proud of it.

\\ I'd added emoji indicators everywhere because I thought they looked "**modern**." I'd built scrolling panels for every metric.

\\ I'd crammed in 15+ features because more features meant a better product, right? **Wrong**.

\\ Two weeks of daily use revealed everything.

\\ The emojis made process names unreadable. The scrolling was exhausting.

\\ The features competed for attention, and none of them won.

\\ I deleted almost everything I'd written. Fifteen thousand lines, gone.

\\ The lesson was painful but essential: "working" and "good" are not synonyms.

\\ Code that runs is not the same as code you'd actually want to use.

### **The Second Rebuild: The Architecture Trap Classic Overcorrection.**

**If my first version was too messy**, my second would be pristine.

\\ Event-driven architecture. Modular plugin system. Clean separation of concerns.

\\ All the things you read about in software engineering blogs.

![PC_Workman 1.5.7 - Minimalistic view Mode - First working feature of hck_GPT](https://cdn.hackernoon.com/images/H7Dj25ThjiXhCwCop3SAL3gTTDx1-nx13c36.gif.webp)

**The result looked like a mobile app…** a bad mobile app, running on a desktop. The structure was beautiful.

\\ The user experience was not. I also made my most expensive mistake during this phase.

\\ **I spent two weeks building automatic fan control.**

\\ Drag-and-drop curve editors. Real-time previews. Elegant code.

\\ **Then I ran proper safety tests and realized:** one wrong configuration could fry a user's GPU.

\\ I deleted the entire feature.

\\ **Two weeks of work, gone.**

\\ Twenty-nine features would meet the same fate before this project shipped.

### The Night Everything Changed

### 3 AM. Laptop screaming at 94°C.

**I'd just finished a 10-hour warehouse shift.** I was staring at my Git history - 200+ commits.

\\ Most of them said things like **"fix,"** or **"maybe this time,**" or **"why doesn't this work?"**

\\ And I asked myself a question I'd been avoiding: _\***What am I actually building**?\*_ **Not in a giving-up way.**

\\ In an honest, brutal assessment way. I was building a tool for people who want to understand their PC.

\\ But I was building it like someone trying to prove they could write code.

\\ Those are completely different motivations. They produce completely different products.

\\ That night, I scrapped the UI. Again.

### The Third Rebuild: The Right Question.

### I finally asked the right question…

**not "what features can I add?" but "what does someone actually need to see?" The answer was embarrassingly simple.**

CPU and RAM side by side. One glance, full picture. No scrolling.

\\ Gradient backgrounds for processes. Top consumer gets the darkest shade. Instant visual hierarchy without reading numbers.

\\ Click to investigate. Suspicious process? Click. Details.

\\ No menu navigation. I deleted 15,000 lines during this refactoring.

\\ **Went from 39,000 to 24,000. The product got better as I removed code.**

\\ That felt counterintuitive. It was true.

## December 22nd. Three days before Christmas.

[https://www.youtube.com/watch?v=zgSUqZQm9zY&lc=UgwDcoEGLMtejPJvlIx4AaABAg&embedable=true](https://www.youtube.com/watch?v=zgSUqZQm9zY&lc=UgwDcoEGLMtejPJvlIx4AaABAg&embedable=true)

### The agency called.

"Trial didn't work out." I was in temporary housing in a country that wasn't mine.

\\ **My dogs were in Poland. My family was in Poland. My laptop was dying. And my project was 70% complete.**

\\ **The logical response:** ~~panic, focus on survival, abandon the side projec~~t.

\\ **What I did**: started rebuild #4.

\\ Maybe that's dedication. ~~Maybe it's insanity~~. Probably both.

### What Constraints Actually Teach You.

### Here's what I learned during that rebuild-while-unemployed phase: Constraints aren't obstacles. They're filters.

Building on dying hardware meant every feature had to justify its RAM footprint.

\\ No bloat allowed. Every function earned its place or got cut.

\\ Building after exhausting shifts meant no time for elegant code that didn't solve real problems.

\\ Ship or sleep. No middle ground. Building alone meant every mistake was mine. Every win was proof I wasn't wasting time.

\\ No team to hide behind. The limitations didn't slow me down.

\\ They made the product better.

\\ ![](https://cdn.hackernoon.com/images/H7Dj25ThjiXhCwCop3SAL3gTTDx1-2026-01-16T17:00:11.209Z-jkgi4buadd8vthf0clbveuzm)

\\

### The Numbers Nobody Shares: 680+ hours coded.

**After warehouse shifts. Weekends. Holidays. 39,000 lines written. 24,000 kept. Almost 40% deleted. 4 complete UI rebuilds.**

29 features built and killed. 6 different approaches to GPU monitoring. 5 failed. 340+ cups of coffee. 94°C — highest laptop temperature during testing. It survived. Barely. ---

### What I Actually Learned: Motivation disappears.

Mine left around week 2. What stayed was stubbornness. "Working code" is a trap. My first version worked perfectly. It was also garbage to use. Delete more. The best code is often the code you don't ship. Constraints help more than resources. They force focus. Show up when it's not fun. That's the only difference between shipped and abandoned.

### Current Status: PC Workman.

**Because I didn't quit.** I don't know if this story has a happy ending yet.

\\ I'm still in the middle of it.

\\ But I know this: I'm closer to shipping something real than I've ever been.

\\ And I learned that the hard way = through 680 hours, 4 rebuilds, a dying laptop, and getting fired three days before Christmas.

\\ **If you're building something alone and it feels painfully slow, I have no magic advice. Just this: that feeling is normal. That's what building actually looks like. Keep going.**