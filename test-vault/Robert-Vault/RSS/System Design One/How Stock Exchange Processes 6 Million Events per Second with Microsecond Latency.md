---
title: How Stock Exchange Processes 6 Million Events per Second with Microsecond Latency
link: https://newsletter.systemdesign.one/p/disruptor-pattern
author: Neo Kim
publish_date: 2025-11-29 06:10:23
saved_date: 2026-01-17 15:10:03
image: https://substack-post-media.s3.amazonaws.com/public/images/d4ff87d8-0b84-4024-8aba-9f5456168600_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/d4ff87d8-0b84-4024-8aba-9f5456168600_1280x720.png)

[

![](https://substackcdn.com/image/fetch/$s_!hhuY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc4e02bd3-d20e-4db8-9574-466d849a4492_1280x300.png)



](https://newsletter.systemdesign.one/subscribe?yearly=true)

-   _[Share this post](https://newsletter.systemdesign.one/p/disruptor-pattern/?action=share) & I’ll send you some rewards for the referrals._
    
-   _I created block diagrams for this newsletter using [Eraser](https://app.eraser.io/auth/sign-up?ref=neo)._
    

This month, I launched **[Design, Build, Scale](https://newsletter.systemdesign.one/subscribe?yearly=true)**… the newsletter series that will elevate your software engineering career.

This is Part 2 of how a stock exchange works.

Let’s start with a **TL;DR of** **[Part 1](https://newsletter.systemdesign.one/p/stock-exchange-system-design)**!

[

![](https://substackcdn.com/image/fetch/$s_!PaDO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F20c30f84-629d-4f50-ad3a-f85a1a3811d0_1754x454.png)



](https://substackcdn.com/image/fetch/$s_!PaDO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F20c30f84-629d-4f50-ad3a-f85a1a3811d0_1754x454.png)

Three key components of an exchange are:

-   Broker - allows people to buy and sell stocks on the exchange.
    
-   Gateway - entry point for brokers to send BUY or SELL orders to the exchange.
    
-   Matching Engine - a component that matches BUY and SELL orders to create trades.
    

A stock market reduces latency by avoiding unnecessary services in the critical path.

BUT… threads have to pass events efficiently to achieve “ultra-low” latency at scale.

Examples:

-   New order event,
    
-   Risk check event,
    
-   Cancel order event,
    
-   Trade execution event,
    
-   Market data update event,
    
-   Replication or Journal event.
    

So the [concurrency model](https://newsletter.systemdesign.one/p/concurrency-is-not-parallelism) matters!

Onward.

* * *

### [EverMemOS—The Next-Generation AI Memory System (Sponsor)](https://evermind.ai/)

[

![](https://substackcdn.com/image/fetch/$s_!6lyV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Febdd9fc5-36a0-4e9c-89f2-d5f1ce39c8b4_7680x4320.jpeg)



](https://evermind.ai/)

Most AI agents forget everything after a session—making them inconsistent, hard to debug, and impossible to scale.

Inspired by human brain memory mechanisms, **[EverMemOS](https://evermind.ai/)** provides an open-source memory OS that supports 1-on-1 conversation scenarios and complex multi-agent workflows. As reported, EverMemOS achieved 92.4% on LoCoMo and 82% on LongMemEval-S, both SOTA results of the two benchmarks.

Later this year, EverMind will launch the cloud service version, offering enterprise users advanced technical support, persistent storage, and scalable infrastructure.

If you’re building agentic apps, EverMemOS gives you the memory layer you’ve been missing.

[👉 Explore EverMemOS](https://github.com/EverMind-AI)

* * *

Most system design goo-roos think using locks, or queues, or message brokers is enough.

They’re WRONG…

Here’s why:

### 1 Locking

There are two key locking models:

-   Pessimistic,
    
-   Optimistic.
    

**Pessimistic locking**

A thread acquires a lock before touching shared data. So other threads must wait until the lock gets released. This means only one thread can update the shared data at a time.

[

![](https://substackcdn.com/image/fetch/$s_!xD1g!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F852700d1-b0c9-4dea-9f15-97fd99a4d144_1295x793.png)



](https://substackcdn.com/image/fetch/$s_!xD1g!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F852700d1-b0c9-4dea-9f15-97fd99a4d144_1295x793.png)

But on a stock exchange:

-   Many threads try to read or update the same data at scale.
    
-   And locks force them to wait in line, which causes latency spikes.
    
-   More threads → more blocking → much SLOWER.
    
-   Even a single lock can slow down a thread by 10x, and with many threads, performance could drop 100x.
    
-   Besides, there’s also a risk of deadlock[1](#footnote-1) if two threads wait on each other.
    

So this approach wouldn’t work for a stock exchange.

**Optimistic locking**

It doesn’t use traditional locks; instead, it uses compare-and-swap (**CAS**) to detect conflicts.

[

![](https://substackcdn.com/image/fetch/$s_!ZAz-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4d937b1c-b20f-4921-8fbc-7ded85d10249_1295x793.png)



](https://substackcdn.com/image/fetch/$s_!ZAz-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4d937b1c-b20f-4921-8fbc-7ded85d10249_1295x793.png)

Here’s how:

1.  A thread reads shared data + its version.
    
2.  Then it writes new data only if the original version hasn’t changed in the meantime.
    

If another thread updates it first, the write fails, and the thread has to RETRY.

This technique works well when conflicts are rare,,, but on a stock exchange:

-   Many threads try to change hot data (sequence counters, and so on).
    
-   Thus CAS failures become more frequent, and spin + retry loops waste CPU.
    

So performance weakens at scale.

### 2 Traditional Queues (ArrayBlockingQueue)

A Queue has:

-   Head (where consumers read from)
    
-   Tail (where producers write to)
    

Yet when there are many threads at once:

-   Consumers compete to update the head,
    
-   Producers compete to update the tail.
    

[

![](https://substackcdn.com/image/fetch/$s_!3M35!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdce7ad16-b6de-47e8-87d6-7ae2900e63d8_1158x625.png)



](https://substackcdn.com/image/fetch/$s_!3M35!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdce7ad16-b6de-47e8-87d6-7ae2900e63d8_1158x625.png)

This creates contention and forces locking or other synchronization techniques… which slows everything down.

Plus, head, tail, and size variables are often on the same CPU cache line[2](#footnote-2).

> NOTE: A CPU reads and writes memory in chunks (usually 64 bytes) called **cache lines**, not single variables.

So there’s a risk of **false sharing**[3](#footnote-3) when:

-   Two threads update different variables
    
-   And those variables live on the same cache line
    

[

![](https://substackcdn.com/image/fetch/$s_!LAj8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b5e4ad2-00f3-411d-a1a4-c465c0fb3162_1045x765.png)



](https://substackcdn.com/image/fetch/$s_!LAj8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b5e4ad2-00f3-411d-a1a4-c465c0fb3162_1045x765.png)

Even though the threads aren’t sharing data (i.e., no locks), the hardware thinks they’re, causing:

-   massive slowdowns
    
-   constant cache invalidations
    

This is a performance problem for traditional queues under high concurrency.

Also, a queue is often:

-   Full (because producers are fast)
    
-   Or empty (because consumers are fast)
    

So producers/consumers constantly fight over the same memory region. And this causes contention.

[

![](https://substackcdn.com/image/fetch/$s_!LjPz!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee28a2b4-1349-43fc-a0c5-e18ca6d3ae17_1017x549.png)



](https://substackcdn.com/image/fetch/$s_!LjPz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee28a2b4-1349-43fc-a0c5-e18ca6d3ae17_1017x549.png)

Besides, in some implementations, reads may require writes when consumed. This also causes contention.

### 3 Message Brokers

Message brokers like Kafka and RabbitMQ are built for general messaging... NOT for microsecond latency.

They introduce extra overhead because of:

-   serialization,
    
-   buffering,
    
-   network hops.
    

Plus, their queues use locks and background threads, which add jitter.

So they’re too slow for a stock exchange!

Then how do you achieve “ultra-low” latency at SCALE?

* * *

_**Reminder: this is a teaser of the subscriber-only newsletter series, exclusive to my golden members.**_

[

![](https://substackcdn.com/image/fetch/$s_!jG0C!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F63fca468-adce-4713-97a0-203c35bc1c60_1200x630.png)



](https://newsletter.systemdesign.one/subscribe?yearly=true)

When you upgrade, you’ll get:

-   **High-level architecture of real-world systems.**
    
-   Deep dive into how popular real-world systems actually work.
    
-   **How real-world systems handle scale, reliability, and performance.**
    

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

[Read more](https://newsletter.systemdesign.one/p/disruptor-pattern)