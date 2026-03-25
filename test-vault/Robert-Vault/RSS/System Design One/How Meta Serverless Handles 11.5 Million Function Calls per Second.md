---
title: How Meta Serverless Handles 11.5 Million Function Calls per Second
link: https://newsletter.systemdesign.one/p/serverless-architecture
author: Neo Kim
publish_date: 2025-10-15 06:02:46
saved_date: 2026-01-17 15:10:05
image: https://substack-post-media.s3.amazonaws.com/public/images/ebbad081-9993-4288-8cc0-a5546c4899c2_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/ebbad081-9993-4288-8cc0-a5546c4899c2_1280x720.png)

Download my system design playbook for FREE on newsletter signup:

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

* * *

_This post outlines serverless architecture. You will find references at the bottom of this page if you want to go deeper._

-   _[Share this post](https://newsletter.systemdesign.one/p/serverless-architecture/?action=share) & I'll send you some rewards for the referrals._
    

_I created the block diagrams using [Eraser](https://app.eraser.io/auth/sign-up?ref=neo)._

Once upon at Meta, engineers wrote infrastructure code whenever they launched new services.

And some services did a ton of concurrent processing during peak traffic. (Think of scheduling notifications or thumbnail creation.)

Yet a pre-allocated infrastructure doesn’t scale dynamically.

So they decided to set up a function as a service (**[FaaS](https://en.wikipedia.org/wiki/Function_as_a_service)**)[1](#footnote-1).

[

![serverless architecture](https://substackcdn.com/image/fetch/$s_!akKB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcab76f2e-2d7f-41a5-b940-fecf7e219bb8_1372x349.png "serverless architecture")



](https://substackcdn.com/image/fetch/$s_!akKB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcab76f2e-2d7f-41a5-b940-fecf7e219bb8_1372x349.png)

A FaaS is the serverless way to scale with increasing load.

It lets engineers focus only on writing code and handles infrastructure deployment automatically. Thus improving the engineer’s productivity.

Imagine FaaS as a job queue, but managed by someone else.

Onward.

* * *

### [Vision Agents: Build Real-Time Video + Audio Intelligence. Open Source. Open Platform. (Sponsor)](https://github.com/GetStream/Vision-Agents?utm_source=newsletter&utm_medium=referral&utm_content=&utm_campaign=neo)

[

![](https://substackcdn.com/image/fetch/$s_!_Wke!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc4661065-2c40-4ab3-97d7-db7e7557c8a2_1999x1125.png)



](https://github.com/GetStream/Vision-Agents?utm_source=newsletter&utm_medium=referral&utm_content=&utm_campaign=neo)

**[Vision Agents](https://github.com/GetStream/Vision-Agents?utm_source=newsletter&utm_medium=referral&utm_content=&utm_campaign=neo)** is a framework for building real-time, multimodal AI that can see, hear, and respond in milliseconds.

Built for developers who want to bring true intelligence to live video without being locked into a single model or transport provider.

-   Open Source: Fork it, read it, improve it.
    
-   Open Platform: Works with Stream Video or any WebRTC-based SDK.
    
-   Flexible Providers: Plug in OpenAI Realtime, Gemini Live, or your favorite STT/TTS and vision models.
    

Fully open, extensible, and ready for your next AI project.

[⭐ Explore the Vision Agents Repo](https://github.com/GetStream/Vision-Agents?utm_source=newsletter&utm_medium=referral&utm_content=&utm_campaign=neo)

* * *

It’s possible to build a hyperscale FaaS by adding many servers and putting a load balancer in front.

But this approach creates new problems.

Let’s dive in:

#### 1\. **Cost Efficiency**

Restarting a server is better than keeping it idle for low costs.

Yet a load balancer keeps servers running even if idle.

[

![](https://substackcdn.com/image/fetch/$s_!oPGc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa9e9281e-a00a-4007-8de8-259c9378d4b5_650x413.png)



](https://substackcdn.com/image/fetch/$s_!oPGc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa9e9281e-a00a-4007-8de8-259c9378d4b5_650x413.png)

Besides:

-   Idle functions use up memory[2](#footnote-2) if kept warm[3](#footnote-3).
    
-   81% of functions get invoked at most once per minute.[4](#footnote-4)
    
-   And most functions run for less than a minute on average.
    

So this approach would cause high costs and waste computing resources. While an under-provisioned server would make a slow system.

[

![](https://substackcdn.com/image/fetch/$s_!PvvZ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F25817e47-1416-49fc-a94c-68194de195b5_491x274.png)



](https://substackcdn.com/image/fetch/$s_!PvvZ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F25817e47-1416-49fc-a94c-68194de195b5_491x274.png)

They run functions in separate [Linux processes](https://tldp.org/LDP/tlk/kernel/processes.html) for data isolation within the worker[5](#footnote-5). An idle Linux process doesn’t consume many resources.

But:

-   144 servers idle for 10 minutes → 1 server day WASTED.
    
-   144 servers idle for 10 minutes → 1 extra machine → same THROUGHPUT[6](#footnote-6).
    
-   At Meta’s scale[7](#footnote-7), they’d need 33,400 extra servers to achieve the same THROUGHPUT.
    

So it’s necessary to reduce server idle time. Otherwise, they’d lose money on hardware costs.

#### 2\. Latency

Servers crash. Also autoscaling[8](#footnote-8) adds new servers with varying traffic.

The creation of a new virtual machine to handle a request is called a **cold start**[9](#footnote-9).

[

![](https://substackcdn.com/image/fetch/$s_!4H_m!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5af955a0-cb65-42b1-8a28-dc6321da9ce2_632x179.png)



](https://substackcdn.com/image/fetch/$s_!4H_m!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5af955a0-cb65-42b1-8a28-dc6321da9ce2_632x179.png)

Yet a cold start takes extra time[10](#footnote-10) before it can serve the first request because it’s necessary to:

1.  Start the virtual machine.
    
2.  Download the container image and function code.
    
3.  Initialize the container.
    
4.  Initialize the language runtime and function code.
    
5.  Do just-in-time (**JIT**) compilation[11](#footnote-11).
    

[

![](https://substackcdn.com/image/fetch/$s_!a1h1!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcd2a3f52-7762-496b-97af-2a2fc46ba8d7_674x377.png)



](https://substackcdn.com/image/fetch/$s_!a1h1!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcd2a3f52-7762-496b-97af-2a2fc46ba8d7_674x377.png)

Also if the container gets shut down because a function isn’t used for a period, then it has a cold start problem again. Put simply, an early shutdown of the container causes latency because of re-initialization[12](#footnote-12).

#### 3\. Availability

Load spikes[13](#footnote-13) occur.

And this could overload the services that the function is calling. (Thus affecting system availability.)

[

![](https://substackcdn.com/image/fetch/$s_!6ORA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1da8b13d-c1ec-47f0-a2fd-ee18dc315516_878x190.png)



](https://substackcdn.com/image/fetch/$s_!6ORA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1da8b13d-c1ec-47f0-a2fd-ee18dc315516_878x190.png)

Also there might be high variance[14](#footnote-14) in load. So it’s necessary to:

-   Scale the serverless routing layer ([discovery](https://systemdesign.one/what-is-service-discovery/)).
    
-   Process the functions reliably without causing retry storms[15](#footnote-15).
    

Besides handling errors gracefully during function execution is important.

Let’s keep going!

* * *

## How Serverless Works

Building a serverless platform with high CPU utilization and low latency is hard.

So smart engineers at Meta used simple techniques to solve it.

Here’s how they built a hyperscale distributed operating system (XFaaS):

### 1\. Cold Start

They run functions on a server called the **worker**.

And categorizes those workers into namespaces based on programming language. This ensures that each worker gets only compatible code and executes faster.

Also this technique gives extra security through physical isolation.

[

![](https://substackcdn.com/image/fetch/$s_!XiSR!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0ba53b62-d11d-4cec-8ace-9bc22bdb4d81_638x474.png)



](https://substackcdn.com/image/fetch/$s_!XiSR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0ba53b62-d11d-4cec-8ace-9bc22bdb4d81_638x474.png)

While a worker within a namespace can run any function written in that language to reduce cold start. This is called the **universal worker model**.

Yet each server doesn’t run every function, but only a subset of them. This approach keeps the JIT-compiled code cache small and efficient.

Also they form **locality groups** within a namespace by grouping workers that run the _same_ functions often. This approach reduces memory usage and improves caching through better JIT code reuse.

Repeated downloads increase latency and waste network bandwidth.

So they **pre-push** the function code and container images onto the server’s [SSDs](https://en.wikipedia.org/wiki/Solid-state_drive). This avoids repeated downloads and keeps an always-active runtime.

[

![](https://substackcdn.com/image/fetch/$s_!8Uy0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7a92be5-120f-433e-80a5-325c5535529f_637x377.png)



](https://substackcdn.com/image/fetch/$s_!8Uy0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7a92be5-120f-433e-80a5-325c5535529f_637x377.png)

Besides they do **cooperative JIT compilation** for faster execution of functions. It means only specific workers compile new function code. Then those workers send the compiled code to ALL workers. Thus preventing redundant compilation overhead.

Ready for the next technique?

### 2\. Backend Service Protection

There’s a risk of overloading the backend services that the function is calling during a load spike.

So they protect those services using **backpressure**\-based throttling.

[

![](https://substackcdn.com/image/fetch/$s_!Cey_!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F875dea4f-ffcf-471a-b7be-56e5bff2e422_1318x778.png)



](https://substackcdn.com/image/fetch/$s_!Cey_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F875dea4f-ffcf-471a-b7be-56e5bff2e422_1318x778.png)

Here’s how it works:

-   They use a [technique](https://en.wikipedia.org/wiki/Additive_increase/multiplicative_decrease) similar to TCP congestion control for throttling.
    
-   Rate limiter throttles requests upon a backpressure signal from the backend service. For example, they track error, latency, and capacity.
    
-   And then slowly increases the requests to those backend services.
    
-   On congestion detection, it throttles requests again.
    

Yet it throttles only the functions that call backend services for performance.

[

![](https://substackcdn.com/image/fetch/$s_!9J1g!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5ecfd0b-e34a-4346-a450-3f9b1fcc318f_989x290.png)



](https://substackcdn.com/image/fetch/$s_!9J1g!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5ecfd0b-e34a-4346-a450-3f9b1fcc318f_989x290.png)

Besides it’s necessary to control the number of concurrent functions calling a backend service to prevent overload.

So they start with fewer concurrent function requests. This gives backend services enough time to warm up their cache and handle the load.

### 3\. Peak Traffic

It’s necessary to prevent a function from using up the resources during peak traffic.

So they assign a limit to how many times a function can run or how many resources it can use. After a function reaches that limit, it’s throttled.

[

![](https://substackcdn.com/image/fetch/$s_!8riK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F765ec669-fc70-4b28-89f6-2c1a0189d63d_1808x594.png)



](https://substackcdn.com/image/fetch/$s_!8riK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F765ec669-fc70-4b28-89f6-2c1a0189d63d_1808x594.png)

Also they distribute function execution across data centers to distribute the load evenly. And delay the low-priority functions until low-traffic hours[16](#footnote-16). Put simply, they run specific functions only when there’s enough free server capacity.

Besides most services are stateless and replicated for scalability and fault tolerance. While stateful services are partitioned and replicated.

Ready for the best part?

[Read more](https://newsletter.systemdesign.one/p/serverless-architecture)