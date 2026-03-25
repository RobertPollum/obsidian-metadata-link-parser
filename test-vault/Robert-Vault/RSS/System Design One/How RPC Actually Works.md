---
title: How RPC Actually Works
link: https://newsletter.systemdesign.one/p/how-rpc-works
author: Neo Kim
publish_date: 2025-10-29 07:03:09
saved_date: 2026-01-17 15:10:04
image: https://substack-post-media.s3.amazonaws.com/public/images/6952f430-02f4-4dbb-8054-20b9dc33b9d0_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/6952f430-02f4-4dbb-8054-20b9dc33b9d0_1280x720.png)

Download my system design playbook for FREE on newsletter signup:

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

* * *

_This post outlines how RPC works._

-   _[Share this post](https://newsletter.systemdesign.one/p/how-rpc-works/?action=share) & I'll send you some rewards for the referrals._
    

How do hundreds of internal services at a company like Netflix or Google talk to each other? And that too, at millions of times per minute?

A standard REST API, while great for public use, often creates too much overhead for this internal, high-speed chatter. Because it typically uses text-based formats like JSON. While easy for humans to read, it’s inefficient for services that need to have millions of conversations per day.

Instead, these services need to talk in a language that is incredibly compact and fast for computers to process. Plus, they need a pre-agreed set of rules, like a shared blueprint, that guarantees both sides know exactly how to talk to each other without errors.

And most importantly, it should offer a good developer experience without sacrificing performance.

Modern applications use many distributed services. Yet this creates a core challenge:

How to achieve extreme machine-to-machine efficiency? A function call across a network should feel as simple as a local one.

The answer is Remote Procedure Call **(RPC**). It’s a protocol designed for high-performance internal communication.

Onward.

* * *

I want to introduce [Ashutosh](https://x.com/asmah2107) as a guest author.

[

![](https://substackcdn.com/image/fetch/$s_!0L4q!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe57d1a9-d1c6-471d-a558-15c78a1deb63_1200x630.png)



](https://x.com/asmah2107)

He’s a software engineer at YouTube, ex-Google Search, and Microsoft Azure.

-   [Substack](https://ashutoshmaheshwari.substack.com)
    
-   [LinkedIn](https://www.linkedin.com/in/asmah0798/)
    
-   [Twitter](https://x.com/asmah2107)
    
-   [YouTube](https://www.youtube.com/@ashutoshmaheshwari)
    

Connect with him if you want to get deep dives into system design, AI, and software engineering.

* * *

### [Meet Dex, an AI-Powered Recruiter for Software Engineers (Sponsored)](https://meetdex.ai/landing-swe-linkedin?seg=351&utm_source=Newsletter&utm_medium=Paid&utm_campaign=SystemDesign)

[

![](https://substackcdn.com/image/fetch/$s_!amck!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F35bb79c4-5a6e-4487-b41e-e86d1511eef2_512x256.png)



](https://meetdex.ai/landing-swe-linkedin?seg=351&utm_source=Newsletter&utm_medium=Paid&utm_campaign=SystemDesign)

**[Dex](https://meetdex.ai/landing-swe-linkedin?seg=351&utm_source=Newsletter&utm_medium=Paid&utm_campaign=SystemDesign)** is a conversational AI and career matchmaker that works on behalf of each person. You spend 15-20 minutes on the phone with him, talking about your experience, your ambitions, and your non-negotiables.

Dex then scans thousands of roles and companies to identify the most interesting and compatible opportunities.

Once we’ve found a match, **[Dex](https://meetdex.ai/landing-swe-linkedin?seg=352&utm_source=Newsletter&utm_medium=Paid&utm_campaign=SystemDesign)** connects you to hiring managers and even helps you prep for interviews.

Thousands of exceptional engineers have already signed up, and we’re partnered with many of the UK’s leading start-ups, scale-ups, hedge funds, and tech companies.

Don’t waste another day at a job you hate. Speak with Dex today.

[Try for Free](https://meetdex.ai/landing-swe-linkedin?seg=353&utm_source=Newsletter&utm_medium=Paid&utm_campaign=SystemDesign)

* * *

## What Is a Remote Procedure Call

Let’s dive in!

RPC is a protocol that allows a function call to cross from one program’s address space into another. This frees the developer from manually managing the raw network connection points (**sockets**) or translating data into a sendable format (**serialization**).

When your code calls a function like `math.sqrt(9)`, you aren’t concerned with the complex algorithm running inside the math library. You simply trust its public API and know the function’s signature.

RPC extends this exact concept across the network.

The client application gets a stub object - a local proxy that mirrors the remote service’s API. But its methods contain only the logic to forward the call over the network. When you call a function on this stub, it handles all the complex network communication behind the scenes to execute the code on the server.

[

![](https://substackcdn.com/image/fetch/$s_!MJ8U!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf829ce3-62f6-44b9-acae-909601a5c8d3_1986x362.png)



](https://substackcdn.com/image/fetch/$s_!MJ8U!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf829ce3-62f6-44b9-acae-909601a5c8d3_1986x362.png)

So, a call like `result = paymentService.charge(userId, amount)` doesn’t call the payment logic directly. Instead, it calls a local proxy method, which then makes a remote operation. This makes the remote call feel like a simple local library call.

Before we go further, let’s understand this first:

* * *

## How Remote Procedure Call Works

#### 1\. Client Stub (The Local Representative)

Your code doesn’t call the remote service directly. Instead, it talks to the _stub_ - a local representative whose only job is to act as a stand-in for the remote service.

It has the same methods you want to use, for example, “`.charge()”`. But its real purpose is to kick off the remote communication process.

#### 2\. Marshaling (Packing the Message)

The stub takes the parameters you provided, like `userId`, `amount` and marshals them.

Marshaling is a fancy word for serializing. It means converting the data from a programming language format to a standardized format, so you can send it over the network.

Think of it as neatly packing your instructions into a universal shipping container that any server in the world can open. This format is often JSON or a more compact, faster format like [Protocol Buffers](https://protobuf.dev/overview/).

[

![](https://substackcdn.com/image/fetch/$s_!p_gz!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b4e832a-7b45-4578-9386-1f554e365273_1535x1028.png)



](https://substackcdn.com/image/fetch/$s_!p_gz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b4e832a-7b45-4578-9386-1f554e365273_1535x1028.png)

#### 3\. Network Journey

The client then sends this packed message across the network to the server, using efficient protocols like [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2). This is the “remote” part of the call.

#### 4\. Server Skeleton

On the server, a “skeleton” is listening. It’s the counterpart of the client stub.

Its job is to receive the incoming message and unmarshal (or deserialize) it. Imagine unpacking the shipping container back into a data format the server can understand.

The skeleton then calls the actual service method with this unpacked data.

#### 5\. Return Path

After the server finishes its work, the entire process happens in reverse.

The skeleton marshals the return value, for example, `{success: true}`. Then sends it back across the network, and the client stub unmarshals it.

After that, the line of code that made the original call receives the result.

Next, I’ll walk you through different RPC failure scenarios and approaches to handle them.

* * *

## Handling Failures in Remote Procedure Call

In a distributed system, the network might be unreliable.

Connections drop. Services slow down. Failures occur.

A robust RPC implementation isn’t just about successful calls, but also about gracefully handling failures. Here are some strategies:

#### 1\. Timeouts (Don’t Wait Forever)

A timeout is a simple deadline.

Whenever the client makes a request, it starts a timer. If it doesn’t receive a response before the timer runs out, it gives up on the call.

[

![](https://substackcdn.com/image/fetch/$s_!ddgN!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08d4b562-e645-40e5-9e8c-4a1192c2d374_1627x489.png)



](https://substackcdn.com/image/fetch/$s_!ddgN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08d4b562-e645-40e5-9e8c-4a1192c2d374_1627x489.png)

_Why it’s critical_: Without timeouts, your application could get stuck waiting indefinitely for a response from a slow or dead service. This would tie up resources, such as threads or memory, and could eventually freeze your entire application. Timeouts are the first line of defense to protect the client’s health.

#### 2\. Retries (If at First Call Doesn’t Succeed)

Many network errors are transient: a temporary glitch that quickly resolves itself.

Sometimes, a server might take too long to respond, or a network packet might get lost in transit. In these cases, it makes sense to retry the failed request automatically.

[

![](https://substackcdn.com/image/fetch/$s_!xPl7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6cebb5e-ce3a-4376-a1c3-55a6b9b8ac6f_1627x484.png)



](https://substackcdn.com/image/fetch/$s_!xPl7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6cebb5e-ce3a-4376-a1c3-55a6b9b8ac6f_1627x484.png)

_Important Caveat (Idempotency)_: Yet retries can be dangerous if the same request causes side effects each time it runs. An operation is idempotent if performing it many times has the same effect as doing it once.

For example,

-   Safe to Retry (Idempotent): Getting a user’s account balance. Doing it again won’t change the system’s state.
    
-   Dangerous to Retry (Not Idempotent): Charging a user’s credit card. Retrying it might cause duplicate payments.
    

So developers must design their systems with idempotency safeguards, such as unique transaction IDs, to retry safely.

#### 3\. Circuit Breakers (Protecting the System)

When a service fails or slows down, sending it more requests will only make things worse.

A circuit breaker is a smart pattern that prevents this from happening.

If the client notices many failed calls to a service, the circuit breaker “trips” and stops sending requests to that service for a short time. During this period, any new calls fail instantly instead of being sent over the network.

[

![](https://substackcdn.com/image/fetch/$s_!8k96!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6a7f337-7a66-4520-aa51-c3fdc7c080df_1627x484.png)



](https://substackcdn.com/image/fetch/$s_!8k96!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6a7f337-7a66-4520-aa51-c3fdc7c080df_1627x484.png)

_Why it’s critical:_ Circuit breakers prevent cascading failures. They give the failing service time to recover. And keep the client from wasting time and resources on calls that are likely to fail.

#### 4\. Deadline Propagation (Don’t Start Work You Can’t Finish)

A single user request often triggers a chain of calls between several services. For example, Service A calls B, and B calls C.

If the original request has a total timeout of 500ms, and Service A already uses 300ms. Then there’s no point in Service C starting a task that takes another 400ms because the client would have already stopped waiting.

[

![](https://substackcdn.com/image/fetch/$s_!wsxM!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F46262b81-f56a-4f1a-807b-eee21d6fd5a8_1627x464.png)



](https://substackcdn.com/image/fetch/$s_!wsxM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F46262b81-f56a-4f1a-807b-eee21d6fd5a8_1627x464.png)

_Deadline propagation_ fixes this by passing the remaining time limit along with every call. So each service knows the remaining time and can decide whether it can finish its part before the deadline.

_Why it’s critical:_ This approach prevents wasted work and keeps the system fast and responsive. Services can “fail fast” instead of doing long operations for a request that’s already too late to matter.

Like every technology, RPC isn’t perfect; it has some strengths, but also tradeoffs to watch out for. Let’s keep going!

* * *

## RPC: The Good, the Bad, and the Ugly

#### Advantages

-   Simple programming model: You can call remote functions just like local ones, which makes your code cleaner and simpler.
    
-   High performance: RPC uses compact, binary formats that computers can process quickly.
    
-   Strong typing: Because both sides share a strict contract, it often detects mistakes early before they cause problems.
    
-   Language interoperability: Client and server can use different programming languages and still communicate smoothly.
    

#### Disadvantages

-   Tight coupling: If the server’s API changes, the client usually needs to update too, which can slow down development.
    
-   Less discoverable than REST: You can’t easily test or browse RPC APIs without the specific contract files.
    
-   Requires specialized tooling: You need special tools to generate the code for the client and server.
    
-   Abstraction hides network realities: Because remote calls look like local ones, developers might forget they’re dealing with the network and forget to handle timeouts or errors properly.
    

Now let’s look at how RPC actually works in real-world systems and the challenges of running it at scale.

* * *

## RPC in the Real World

Using RPC in real systems comes with several practical challenges. Here are four common ones developers need to handle:

#### **1\. Service Discovery (How Do Services Find Each Other?)**

In modern systems, servers are always changing; they’re added, removed, or restarted, often getting new IP addresses.

But you can’t just hardcode a server’s location in your code. So how does a client know where to send its request?

That’s where _service discovery_ comes in.

_Analogy:_ Think of it like a live, self-updating contact list. You don’t need to remember your friend’s exact home address. Instead, you simply look up their name in your contact list to find the latest address.

_How it works:_ A central registry (like [Consul](https://developer.hashicorp.com/consul) or [Zookeeper](https://zookeeper.apache.org/)) keeps track of all healthy, running services and their locations. So when a client wants to talk to the Payment Service, it asks the registry, “Where can I find it?”.

The registry then returns a list of healthy servers, and the client picks one to send the RPC call.

#### **2\. API Evolution (How Do You Update Services Without Breaking Everything?)**

When a service adds a new feature, it might need to change a function’s parameters. Things can break if clients do not update right away; this is because of tight coupling.

The solution is _backward compatibility_.

_Analogy:_ Think of a survey form you’ve sent out. You can safely add a new optional question; old forms still work. But if you delete a question or make a new one required, all old forms become invalid.

_How it works:_ RPC frameworks like [gRPC](https://grpc.io/) follow strict rules for updating APIs. For example, you can safely add optional fields, but you shouldn’t remove or change existing ones. This allows new versions of a service to run smoothly while older clients keep working.

#### **3\. Streaming (More Than Just Request and Response)**

RPC doesn’t limit itself to the “one request, one response” model.

Modern frameworks like gRPC support _streaming_, where data flows continuously between client and server.

_Analogy:_ A regular RPC call is like sending a text message and getting one reply. A streaming RPC is like a live phone call or video stream; both sides can exchange information in real time.

_How it works:_

-   Server Streaming: Client sends one request and gets back a stream of responses (e.g., subscribing to live updates).
    
-   Client Streaming: Client sends a stream of messages and gets back one response (e.g., uploading a large file).
    
-   Bidirectional Streaming: Both client and server can send messages at any time (e.g., a real-time chat).
    

#### **4\. Error Handling & Status Codes (Communicating What Went Wrong)**

When something fails, the client needs more detail than just an “it failed” message. So it can take the necessary steps.

That’s where _status codes_ come in.

Just like HTTP status codes (404 Not Found, 403 Forbidden, 500 Internal Server Error), RPC frameworks have their own standardized codes:

-   `NOT_FOUND`,
    
-   `PERMISSION_DENIED`,
    
-   `INVALID_ARGUMENT`,
    
-   `UNAVAILABLE`.
    

_How it works:_ By returning a specific error code, the server tells the client what to do next.

-   Retry the call if the service was temporarily unavailable.
    
-   Report a user input error if the argument was invalid.
    
-   Or stop trying if it's impossible to fix the problem automatically.
    

Now that we’ve seen RPC in real-world systems, let’s look at how it compares to other communication patterns.

* * *

## Choosing the Right Communication Pattern

-   RPC ([gRPC](https://grpc.io/), [Thrift](https://thrift.apache.org/)): Best for high-performance internal microservices.
    
-   REST: Ideal for public APIs and resource-oriented operations.
    
-   [GraphQL](https://graphql.org/): Great for client-specific data fetching requirements.
    
-   Message Queues: Perfect for asynchronous, decoupled workflows.
    

### The Bottom Line

RPC hides most of the network details, but it doesn’t make them disappear; you still need to design for failures.

While gRPC with Protocol Buffers has become the new standard for fast, reliable communication between internal services.

Remember, a successful RPC setup depends on supporting systems. So service discovery, tracing, and monitoring are necessary to keep everything running smoothly.

* * *

👋 I’d like to thank **[Ashutosh](https://x.com/asmah2107)** for writing this newsletter!

Plus, don’t forget to connect with him on:

-   [Substack](https://ashutoshmaheshwari.substack.com)
    
-   [LinkedIn](https://www.linkedin.com/in/asmah0798/)
    
-   [Twitter](https://x.com/asmah2107)
    
-   [YouTube](https://www.youtube.com/@ashutoshmaheshwari)
    

He offers good deep dives into system design, AI, and software engineering.

* * *

Subscribe to get simplified case studies delivered straight to your inbox:

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

* * *

[

![Author Neo Kim; System design case studies](https://substackcdn.com/image/fetch/$s_!bEFk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f94ab8c-0d67-4775-992e-05e09ab710db_320x320.png "Author Neo Kim; System design case studies")



](https://www.linkedin.com/in/nk-systemdesign-one/)

**👋 Find me on [LinkedIn](https://www.linkedin.com/in/nk-systemdesign-one/) | [Twitter](https://x.com/intent/follow?screen_name=systemdesignone) | [Threads](https://www.threads.net/@systemdesignone) | [Instagram](https://www.instagram.com/systemdesignone/)**

* * *

**Want to advertise in this newsletter?** 📰

If your company wants to reach a 180K+ tech audience, [advertise with me](https://newsletter.systemdesign.one/p/sponsorship).

* * *

**Shoutout of the week 👏**

-   [State of AI Code Review Tools in 2025](https://www.devtoolsacademy.com/blog/state-of-ai-code-review-tools-2025/) — Why have AI code review tools gone mainstream? Their benefits and more.
    

* * *

Thank you for supporting this newsletter.

You are now 180,001+ readers strong, very close to 181k. Let’s try to get 181k readers by 31 October. Consider sharing this post with your friends and get rewards.

Y’all are the best.

[

![system design newsletter](https://substackcdn.com/image/fetch/$s_!6oWl!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png "system design newsletter")



](https://substackcdn.com/image/fetch/$s_!6oWl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png)

[Share](https://newsletter.systemdesign.one/p/how-rpc-works?utm_source=substack&utm_medium=email&utm_content=share&action=share)

* * *

-   Block diagrams created with [Eraser](https://app.eraser.io/auth/sign-up?ref=neo)