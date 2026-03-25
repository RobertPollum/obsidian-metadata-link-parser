---
title: "CES 2026: Nvidia's Updated DLSS Makes Games Run Worse on Older GPUs"
link: https://lifehacker.com/tech/ces-2026-nvidias-updated-dlss-makes-games-run-worse-on-older-gpus?utm_medium=RSS
author: Michelle Ehrhardt
publish_date: 2026-01-06 23:40:22
saved_date: 2026-01-17 15:08:44
image: https://lifehacker.com/imagery/articles/01KEAXR80B8MFEJT0H9RHJ2Y5F/hero-image.jpg
tags: #Tech
---

![image](https://lifehacker.com/imagery/articles/01KEAXR80B8MFEJT0H9RHJ2Y5F/hero-image.jpg)

Unless you run an AI data center, Nvidia's announcements this CES have been more on the quiet end. There were updates to GeForce Now cloud streaming and its DLSS upscaling tech, but no new graphic cards. That's fine—it's normal for Nvidia to have a quiet year on consumer tech every now and then, and the RTX 50-series GPUs just came out last year. Unfortunately, it turns out those DLSS updates are actually making games run _worse_ on older GPUs.

The new version of DLSS, called DLSS 4.5, is pretty great when it works. It already makes lighting appear far more realistic even when ray tracing or HDR isn't being used, and in the spring, it will introduce dynamic frame generation, which can adjust how many AI frames are inserted into your game on the fly, so that it doesn't waste compute producing more frames than necessary, or than your monitor can produce. I saw examples of both of these use cases in person at CES, and as someone who mostly plays without upscaling when I can, I was impressed enough that I might want to get a new GPU and make the swap.

And I stress that "new GPU" part. Unfortunately, DLSS 4.5 only seems to work best on Nvidia's newest cards. It released in beta for all Nvidia GeForce RTX cards yesterday, but gamers on older RTX 3000-series cards are already reporting issues. According to a report from X user [Mostly Positive Reviews](https://x.com/mpr_reviews/status/2008449637200367930 "open in a new window") (via [Tom's Hardware](https://www.tomshardware.com/pc-components/gpus/community-tests-confirm-dlss-4-5-yields-20-percent-performance-loss-on-older-rtx-30-and-20-series-gpus-compared-to-dlss-4-0-nvidia-warnings-ring-true-following-rollout "open in a new window")), users on the Nvidia GeForce RTX 3080 Ti GPU could see up to a 24% dip in performance in _Cyberpunk 2077_, and a 14% drop in _The Last of Us Part 2_. Those are just a few examples, but others in the comments posted their own headaches, [as did users on Reddit](https://www.reddit.com/r/hardware/comments/1q5hdfy/dlss_45_sr_preset_m_seems_to_incur_a_huge_perf/ "open in a new window").

That's not a small issue. The RTX 3080 Ti might be a few generations behind, but it was near the top of the line when it was current. More importantly, according to Steam's own data, the RTX 3060 is currently the [most common graphics card on Steam](https://store.steampowered.com/hwsurvey/videocard/ "open in a new window"), and it's weaker than the RTX 3080 Ti. And technically, DLSS 4.5 is available for the even weaker RTX 2000-series, which are bound to run into even more severe problems.

So where's this massive performance loss coming from, and what can you do about it? Likely, it has to do with the new AI transformer model powering DLSS, which [Nvidia said](https://www.nvidia.com/en-us/geforce/news/dlss-4-5-dynamic-multi-frame-gen-6x-2nd-gen-transformer-super-res/ "open in a new window") was built with RTX 40-series and RTX 50-series cards in mind. While you can use DLSS 4.5 with an older GPU, it doesn't seem like it's intended.

Thankfully, if you decided to try out DLSS 4.5 on an older card and you don't like what you're seeing, you're not stuck with it. Currently, public DLSS 4.5 implementation is in beta, and needs to be applied to games by choosing either the "Model M" or "Model L" preset in the Nvidia app (under "Latest" and "Custom," respectively). Choosing another model, like Model K, should get you back to normal. When DLSS 4.5 gets a full release on January 13, I assume this will get even simpler.

Still, it's not a great look that most Nvidia gamers can't use its exciting new feature. Because it can be reversed, it doesn't break anything, but it also shows that Nvidia is starting to leave all but its most loyal GPU customers behind. And as someone who mostly only uses upscaling while on weaker hardware like the Steam Deck, what I find especially weird is that upscaling is already all about using software to improve performance when you're lacking raw power. That should theoretically make gamers with weaker cards the target audience.

![GeForce Now app on Amazon Fire TV](https://lifehacker.com/imagery/articles/01KEAXR80B8MFEJT0H9RHJ2Y5F/images-1.fill.size_2000x1125.v1767760820.jpg)

Credit: Michelle Ehrhardt

But it's not all doom and gloom for my fellow cheap gamers. Alongside DLSS 4.5, [Nvidia also announced](https://blogs.nvidia.com/blog/geforce-now-ces-2026/ "open in a new window") a native Linux client for Nvidia GeForce Now, alongside a native Amazon Fire TV app. That extends the cloud gaming platform to even more users, and because GeForce Now has a free tier, it's a pretty sweet deal. Play it right, say by getting a Fire TV on sale and loading up a free game, and you could game using Nvidia's latest GPUs on the big screen while [spending less than $20](https://lifehacker.com/tech/amazon-fire-tv-stick-hd-1080p-sale). Sure, you might have to deal with some latency and video compression while doing it—as is the tradeoff with cloud gaming—but as DLSS 4.5 shows, even using local hardware comes with its own problems.