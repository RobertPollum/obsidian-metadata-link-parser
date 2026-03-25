---
title: A Big Tech AI Security Engineer’s Guide to LLM Privacy (Guest Post)
link: https://www.secretsofprivacy.com/p/a-big-tech-ai-security-engineers-guide-to-llm-privacy
author: ToxSec
publish_date: 2025-11-04 21:08:23
saved_date: 2026-01-17 15:09:31
image: https://substack-post-media.s3.amazonaws.com/public/images/342074fe-aa76-4106-adee-31704c46778f_420x320.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/342074fe-aa76-4106-adee-31704c46778f_420x320.png)

AI can be a truly amazing tool.

It’s also a privacy headache, as we’ve noted over the years (for new readers, see our compilation at the end of this post or [click here](https://www.secretsofprivacy.com/i/177371139/further-reading-on-ai-and-privacy) to jump straight to it).

What complicates things is most of us are unclear on what AI tools do with our data. It’s like a big black hole unless you’re an insider.

Well, to help clear this all up, we enlisted an insider. We’re pleased to bring you this guest post from a new writer we discovered on Substack who knows the technical side of the AI space firsthand.

He goes by the name and is an Amazon cybersecurity engineer focused on AI security with an active CISSP. He was also formerly at the NSA and is an ex–defense software developer. He has an M.S. in Cybersecurity Engineering (UW) on top of all that.

In his post, you’ll learn the following:

-   What “we don’t train on this” does (and doesn’t) mean.
    
-   The three places your data lives.
    
-   Fast fixes
    

As we’re fond of saying, small privacy upgrades compound. They key is knowing which upgrades to focus on so you get the highest ROI. Use this guide to tighten your settings and shrink your digital trail, all without quitting the tools you rely on.

And be sure to give a follow on Substack and subscribe to his newsletter.

[Subscribe now](https://www.secretsofprivacy.com/subscribe?)

* * *

## TL;DR: YOUR AI PAPER TRAIL

Deleting your history is a privacy placebo. In this post, I’ll show you:

1.  the three places your data actually lives,
    
2.  who can see it, and
    
3.  the simple habits to shrink your digital footprint for good.
    

As a general rule, never confuse “we don’t train on this” with “we don’t collect this.”

## What Actually Happens When I Hit ‘Enter’?

When you type a prompt and hit ‘Enter’, your first interaction is with the Chat History. This is the list of conversations saved in your sidebar. It’s a great feature; you can pick up where you left off, and the AI remembers the context from that specific thread.

Here’s the problem: it feels private. It looks and acts like a personal document, and this creates a powerful illusion of security.

It’s not.

Think of your chat history like the “Sent” folder in your email. Deleting a message from your “Sent” folder doesn’t pull it back from the recipient’s inbox. It just deletes your copy.

In the same way, deleting a chat from your history only removes it from your view. The company (the recipient) still has its copy, which lives in a completely different place: their backend logs.

## Are My Conversations Secretly Becoming ‘Training Data’?

This is the most confusing part for most users. The myth is that every word you type is instantly fed back into the AI’s “brain.” The reality is more complicated and breaks down into two distinct “paper trails.”

**Backend Logs**: This is the immediate risk. When you send a prompt, it gets saved to a temporary log. This isn’t for training. It’s for “abuse monitoring” and “safety.” This is the data that human contractors are most likely to see, especially if your chat is flagged for any reason. Most companies retain these logs for a set period, often 30 days, before deleting them. This is your most “active” and exposed data.

**Training Data**: This is the future risk. If you don’t opt-out of data sharing, your conversations are flagged for a different pipeline. At a later date, they are “anonymized” and bundled into a massive dataset. This dataset is then used to train a future version of the model.

That “anonymized” tag is tricky. Removing your name and email is simple, but what about the core content of your chats? If you paste in your company’s secret marketing plan or describe a unique personal situation, that data is no longer anonymous. It’s now part of the model’s knowledge.

## Who is Reading My ‘Paper Trail’?

**The Company (AI Trainers & Safety Teams)**: When your chat is flagged for abuse, or even as part of a random quality check, a human contractor may read your conversation. This is often a low-paid worker reviewing thousands of chats for context, to see why the AI gave a harmful or strange answer.

**The Government (Subpoenas)**: AI companies are subject to the same laws as any other tech provider. If they receive a valid legal request or subpoena, they must hand over the data they have. And as we’ve established, they collect logs even if you’ve opted out of training.

**The Attacker (Breaches)**: This is the biggest risk. Every tech company is a target. When an AI company gets breached, the prize isn’t just a list of user emails. It’s a goldmine of their users’ most intimate thoughts, confidential work documents, and private data.

[Share](https://www.secretsofprivacy.com/p/a-big-tech-ai-security-engineers-guide-to-llm-privacy?utm_source=substack&utm_medium=email&utm_content=share&action=share)

## How Can I Shrink My Digital Footprint?

**Opt-Out Immediately**: This is the single most important step. Go into your AI tool’s Settings > Data Controls. Find the toggle that says “Improve the model for everyone” or “Use my data for training” and turn it off. This stops your chats from being added to the training data pipeline.

[

![](https://substackcdn.com/image/fetch/$s_!Wpog!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23661ee7-cb10-41ea-a4dc-e9f566b23815_620x475.png)



](https://substackcdn.com/image/fetch/$s_!Wpog!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23661ee7-cb10-41ea-a4dc-e9f566b23815_620x475.png)

If you don’t want to help improve the LLM, toggle this option to “off”

**Use ‘Incognito’ Modes**: Most platforms now offer a “temporary chat” or “incognito” mode. When you use this, the chat won’t be saved to your history and it won’t be used for training. However, it is still collected for 30-day safety and abuse logs. It’s better, but it’s not invisible.

[

![](https://substackcdn.com/image/fetch/$s_!LBop!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff5ebdc13-d49b-4a1d-841a-9c9462c4ddcc_485x392.png)



](https://substackcdn.com/image/fetch/$s_!LBop!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff5ebdc13-d49b-4a1d-841a-9c9462c4ddcc_485x392.png)

ChatGPT now has a “temporary chat” feature for new chats.

**The “Data Minimization” Habit**: This is the most powerful habit. Treat an LLM like a public forum, not a private diary. Before you paste that block of text, redact the PII (Personally Identifiable Information). Change names, remove addresses, and delete confidential company info. Give the AI only the data it needs to answer the question.

**The ‘Enterprise’ Shield**: If you use an AI tool through your work, you are likely protected. Most paid enterprise and business plans have a contractual guarantee that your data will never be used for training. The company is selling a service, not harvesting your data.

## Is Real LLM Privacy Even Possible?

No, not in the way most of us want. If you are using a service on someone else’s computer (which is what cloud AI is), you are leaving a trace.

But privacy isn’t a binary switch; _**it’s a spectrum of control**_.

The goal isn’t to stop using these revolutionary tools. The goal is to stop oversharing by default. It’s to use them with intention, understanding the data bargain you’re striking every time you hit ‘Enter’. You can’t be anonymous, but you can be deliberate.

[Subscribe now](https://www.secretsofprivacy.com/subscribe?)

## Frequently Asked Questions

### **Q: Is deleting my chat history the same as opting out of training?**

A: No. Deleting your chat history only removes it from your view. The company may still retain backend logs for a period, and unless you explicitly opt out, that data might have already been flagged for future training datasets.

### Q: If I pay for ChatGPT Plus, is my data private?

A: Not automatically. Paying gives you access to the model, but you are still subject to the same data logging and training policies unless you manually go into your settings and opt out of training.

### Q: What is the single best thing I can do for my LLM privacy?

A: Go into your account settings on every AI tool you use and find the data controls. Turn off the setting that says “Improve the model for everyone” or “Use my data for training.” This is the single most effective step.

_Special thanks to Secrets of Privacy for the opportunity to guest post and share their audience! I hope to see some of you over at [ToxSec](https://www.toxsec.com/) where I write about AI and security research!_

## Friendly Ask

If you found this post on AI helpful or informative, chances are your friends and family will as well. Please share it with them to help spread awareness.

[Share](https://www.secretsofprivacy.com/p/a-big-tech-ai-security-engineers-guide-to-llm-privacy?utm_source=substack&utm_medium=email&utm_content=share&action=share)

* * *

_Looking for help with a privacy issue or privacy concern? Chances are we’ve covered it already or will soon. Follow us on [X](https://twitter.com/secretsofprivac) and [LinkedIn](https://www.linkedin.com/company/secrets-of-privacy/) for updates on this topic and other internet privacy related topics._

* * *

##### **Disclaimer:** None of the above is to be deemed legal advice of any kind. These are \*opinions\* written by a privacy and tech attorney with years of working for, with and against Big Tech and Big Data. And this post is for informational purposes only and is not intended for use in furtherance of any unlawful activity. This post may also contain affiliate links, which means that at no additional cost to you, we earn a commission if you click through and make a purchase.

## Further Reading on AI and Privacy

[Subscribe now](https://www.secretsofprivacy.com/subscribe?)