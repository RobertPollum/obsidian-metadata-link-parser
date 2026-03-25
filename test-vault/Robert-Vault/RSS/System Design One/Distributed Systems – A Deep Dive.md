---
title: Distributed Systems – A Deep Dive
link: https://newsletter.systemdesign.one/p/distributed-systems
author: Neo Kim
publish_date: 2025-12-04 09:10:57
saved_date: 2026-01-17 15:10:03
image: https://substack-post-media.s3.amazonaws.com/public/images/6962381b-ea47-4240-9134-5d45d98a284c_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/6962381b-ea47-4240-9134-5d45d98a284c_1280x720.png)

Get my system design playbook for FREE on newsletter signup:

-   _[Share this post](https://newsletter.systemdesign.one/p/distributed-systems/?action=share) & I'll send you some rewards for the referrals._
    

* * *

Distributed systems aren’t just a concept; they’re the invisible machinery holding our digital world together.

Every time you send a message, book a taxi, or stream a song, dozens of nodes across the world work together to make it look simple. But simplicity on the surface hides chaos underneath.

We’ll see how these systems serve millions globally while maintaining control over the chaos.

But first, let’s understand why we need distributed systems…

* * *

### [The AI Agent for production-grade codebases (sponsor)](https://www.augmentcode.com/?utm_source=systemdesign&utm_medium=newsletter)

[

![](https://substackcdn.com/image/fetch/$s_!O7f5!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9377721d-1539-4d2f-bd53-df0daccef548_1600x900.png)



](https://www.augmentcode.com/?utm_source=systemdesign&utm_medium=newsletter)

Augment Code’s powerful AI coding agent and industry-leading context engine meet professional software developers exactly where they are, delivering production-grade features and deep context into even the largest and gnarliest codebases.

With [Augment Code](https://www.augmentcode.com/?utm_source=systemdesign&utm_medium=newsletter) you can:

-   Index and navigate millions of lines of code
    
-   Get instant answers about any part of your codebase
    
-   Automate processes across your entire development stack
    

**👉 [BUILD WITH AI AGENT THAT GETS YOU, YOUR TEAM, AND YOUR CODEBASE](https://www.augmentcode.com/?utm_source=systemdesign&utm_medium=newsletter)**

* * *

I want to introduce **[Sahil Sarwar](https://www.linkedin.com/in/sahilsarwar1/)** as a guest author.

[

![](https://substackcdn.com/image/fetch/$s_!kovI!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffa356309-9aad-40d0-a82c-36c98bf5cea7_1200x630.png)



](https://www.linkedin.com/in/sahilsarwar1/)

He’s a software engineer at **Confluent**, passionate about distributed systems, system internals, and the philosophy behind designing large-scale systems.

-   [Substack](https://sahilserver.substack.com/)
    
-   [LinkedIn](https://www.linkedin.com/in/sahilsarwar1/)
    

Connect with him if you’re interested in deep dives into distributed systems, infrastructure, and the mindset behind technical design.

* * *

## Why Distributed Systems?

Traditionally, software systems ran on a single machine.

But as the internet became popular, we realized a single machine might be insufficient at scale. That’s how the idea of vertical and horizontal scaling came in…

### 1 Vertical Scaling

A simple way to scale is by adding:

-   more CPU,
    
-   more memory,
    
-   faster processors.
    

However, it’s impossible to scale vertically forever because of hardware limitations & cost effectiveness.

### 2 Horizontal Scaling

Instead of relying on one powerful server,

> _“What if many small servers shared the work?”_

And those servers coordinate to act as one unit. That’s the key idea behind a DISTRIBUTED SYSTEM.

[

![](https://substackcdn.com/image/fetch/$s_!M9Hh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9efc1b98-b793-48a3-ba24-865497ec5824_1600x957.png)



](https://substackcdn.com/image/fetch/$s_!M9Hh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9efc1b98-b793-48a3-ba24-865497ec5824_1600x957.png)

## What are Distributed Systems?

When you hear “distributed systems”, you might think of buzzwords like clusters, microservices, or Kubernetes…

But the core idea is actually simple:

> A distributed system is a group of independent servers that work together and appear to the user as one system.

Each server has its own CPU, memory, and processes.

They communicate over a network to achieve one shared goal. There’s no shared RAM, no shared global clock, and no single machine that “knows everything.”

These features define distributed systems:

**No Shared Memory**

-   Each node works independently and can’t directly read another machine’s variables.
    
-   All communication happens through messages sent over the network.
    
-   We need idempotency[1](#footnote-1), retry logic, and consensus algorithms[2](#footnote-2) to maintain system correctness even when messages are lost or fail.
    

**No Global Clock**

-   There is no universal time across machines.
    
-   Clocks drift, and network delays make timing unpredictable.
    
-   This makes it difficult to determine the exact order in which events occurred.
    

To solve this, we use [logical time](https://aeron.io/docs/distributed-systems-basics/logical-clocks/):

_Lamport Clocks_

> If timestamp _a_ is less than _b_, then event _a_ happened before event _b_ in logical order.

_Vector Clocks_

> Extend Lamport clocks by tracking event counts from every node, allowing systems to detect concurrency and understand ordering across many processes.

**Message Communication**

-   Nodes communicate using protocols such as [gRPC](https://grpc.io/)[3](#footnote-3), [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Session)[4](#footnote-4), [Kafka events](https://kafka.apache.org/)[5](#footnote-5), and so on.
    
-   Messages may not arrive, may arrive late, may be duplicated, or may even arrive out of order.
    
-   A distributed system stays correct not because communication is perfect, but because it handles failures gracefully.
    

Let’s keep going…

* * *

## Distributed Systems in Real Life

Distributed systems aren’t just theory - they’re everywhere, and in everything that we use:

-   **Google Search**: a massive network of crawlers, indexers, and ranking nodes running across many data centers.
    
-   **Netflix**: region-wide services for streaming, recommendations, authentication, video transcoding, and content delivery.
    
-   **DynamoDB & Cassandra**: distributed key–value stores that replicate data across nodes for availability and scale.
    
-   **Kafka**: distributed, fault-tolerant event log for asynchronous communication.
    
-   **Stripe**: event-driven architectures built on reliable messaging and idempotent operations.
    

* * *

## Distributed vs Decentralized vs Parallel Systems

These three terms sound similar, but they describe different designs…

### 1 Distributed Systems

A distributed system is a group of independent nodes that work together to present themselves as a single, logical system.

Examples:

-   [Google Spanner](https://cloud.google.com/spanner) (globally distributed database)
    
-   [Apache Kafka](https://kafka.apache.org/) (distributed log system)
    

There is often a “leader or a control plane” responsible for managing consistency, replication, and communication between nodes.

### 2 Decentralized Systems

A decentralized system removes or minimizes the need for a single point of control.

Examples:

-   Bitcoin and Ethereum (blockchain networks)
    
-   BitTorrent (peer-to-peer file sharing)
    

Each node operates more autonomously, and coordination occurs through peer-to-peer consensus, not central orchestration.

### 3 Parallel Systems

They run multiple computations simultaneously, but on a single machine or a tightly coupled cluster with shared memory.

They typically have:

-   One global clock,
    
-   A shared memory space.
    

**Examples:**

-   GPU workloads
    
-   Multithreaded programs
    
-   High-performance computing clusters
    

### TL;DR

-   Distributed systems: loosely coupled, message-passing, reliability-oriented
    
-   Decentralized systems: trustless, peer-based, no central authority
    
-   Parallel systems: tightly coupled, shared memory, performance-oriented
    

If many machines need to work together, they must communicate and share state efficiently.

The next question then is:

> _“How do machines communicate effectively at scale?”_

* * *

## Communication in Distributed Systems

When machines communicate in a distributed system, all interactions occur over a network. And networks come with their own set of messy realities.

Onward.

### 1 Network Realities

By default, the network is unreliable… Messages can:

-   Be lost: never reach the destination
    
-   Be duplicated: delivered more than once
    
-   Be corrupted: bits flipped during transit
    
-   Arrive out of order: later messages come before earlier ones
    
-   Experience latency: unpredictable delays
    

Designing a distributed system is really about expecting the WORST and still making the system work.

As Murphy’s law states:

> _“If something can go wrong, it will go wrong.”_

### 2 TCP: Reliability Layer

Distributed systems rely heavily on TCP[6](#footnote-6) because it provides:

-   Reliable delivery: data gets delivered reliably, or the sender is notified of failure
    
-   Ordering: packets arrive in the order they were sent
    
-   Error checking: corrupted packets are detected and retransmitted
    

[

![](https://substackcdn.com/image/fetch/$s_!FylA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2f71cb39-e7c6-4fe5-83b7-54c57e17ac6f_1600x686.png)



](https://substackcdn.com/image/fetch/$s_!FylA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2f71cb39-e7c6-4fe5-83b7-54c57e17ac6f_1600x686.png)

TCP establishes this connection via a 3-way handshake:

1.  SYN: Client says, _“I want to connect.”_
    
2.  SYN-ACK: Server replies, _“Got it, ready to proceed.”_
    
3.  ACK: Client confirms, _“Great, let’s begin.”_
    

### 3 TLS: Security Layer

You can consider TCP as a “mailman” and TLS[7](#footnote-7) as the envelope with a lock and signature. TLS ensures:

-   Encryption[8](#footnote-8): nobody can read the data
    
-   Authentication: you know who you’re talking to
    
-   Integrity: messages can’t be altered without detection
    

[

![](https://substackcdn.com/image/fetch/$s_!0O62!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa53bfe58-6776-4449-9396-365c94f0501a_1600x622.png)



](https://substackcdn.com/image/fetch/$s_!0O62!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa53bfe58-6776-4449-9396-365c94f0501a_1600x622.png)

During the TLS handshake, both sides:

-   Choose cipher suites
    
-   Agree on the TLS version
    
-   Verify the server’s TLS certificate
    
-   Generate session keys for encrypted communication
    

Reliability loses its meaning if someone can intercept or tamper with the data. In modern systems, every RPC and network call should use TLS.

> If servers spread worldwide, how do they find each other?

### 4 DNS: Finding the Right Node

That’s where DNS (Domain Name System) comes in:

-   It resolves human-readable names to IP addresses.
    
-   And acts as a basic service discovery[9](#footnote-9) mechanism.
    

[

![](https://substackcdn.com/image/fetch/$s_!Hbpk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F83ff49cf-9b3d-4210-abc1-02f0a30bcb8e_1600x1164.png)



](https://substackcdn.com/image/fetch/$s_!Hbpk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F83ff49cf-9b3d-4210-abc1-02f0a30bcb8e_1600x1164.png)

In large distributed systems, DNS is usually layered with service registries or load balancers. But at the core, you always need a way to translate a name into a network endpoint.

Communication alone is not enough… For a distributed system to function as a single, coherent system, the nodes must also coordinate their actions.

And that brings us to the next major challenge: coordination.

* * *

Share this post & earn rewards for referrals.

[Share](https://newsletter.systemdesign.one/p/distributed-systems?utm_source=substack&utm_medium=email&utm_content=share&action=share)

* * *

## Coordination Challenges in Distributed Systems

Once machines start working together, they need to stay in sync. Yet coordinating many nodes creates new problems.

Let’s look at the key challenges:

### 1 Failure Detection

Determining whether a machine has failed may seem simple… but it’s not.

> “If a node doesn’t respond, is it dead, or just slow?”

Distributed systems usually detect failures using these two ways:

-   Heartbeat mechanism
    
    -   Heartbeat messages are small signals that nodes send to each other to show they are still alive.
        
    -   These messages serve as health checks, enabling each node to determine whether its peers are functioning properly or have failed.
        
-   Gossip protocol
    
    -   Each node regularly sends a small “I am alive” message to others.
        
    -   System considers the node dead if these messages stop for too long.
        
    -   Like real gossip, nodes share what they know with others.
        

These techniques help to detect failures in a noisy, unreliable network.

[

![](https://substackcdn.com/image/fetch/$s_!3yG6!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3f4ba4a0-5a5e-4f9e-9042-ad12131b342e_1920x1794.gif)



](https://substackcdn.com/image/fetch/$s_!3yG6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3f4ba4a0-5a5e-4f9e-9042-ad12131b342e_1920x1794.gif)

But you’ve got to find a balance between speed and accuracy:

-   Check often → false positives (you think a node failed when it hasn’t)
    
-   Check slowly → system reacts late to real failures
    

> If machines are spread around the world, it becomes hard to know which event happened first between two different servers.

So let’s read the solution to this problem:

### 2 Event Ordering and Timing

If we use `time.Now()` to decide “which event happened when,” we run into issues:

Each machine has its own local clock… and these clocks can drift[10](#footnote-10).

Because of this, it is almost impossible to keep all clocks perfectly in sync across many machines.

In distributed systems, we rarely care about the exact timestamp. What we really need to know is which event happened first.

To solve this, we use algorithms called “logical clocks”.

#### Lamport Clocks

Lamport clocks use a simple counter on each machine:

-   Each process starts with a counter at 0
    
-   For every local event, increase the counter: `LC = LC + 1`
    
-   When sending a message, attach the current counter value
    
-   When receiving a message, update the counter to:  
    `LC = max(local LC, received LC) + 1`
    

Example:

Consider two machines - M1 and M2.

-   M1 sends a message with `LC = 5`
    
-   M2 receives it when its own clock is `LC = 3`
    
-   So M2 updates its clock to `max(3, 5) + 1 = 6`
    

From the above interactions:

-   Send event has LC = 5
    
-   Receive event has LC = 6
    

This keeps the correct order[11](#footnote-11): send < receive.

It tells you what happened before what… but not if two events were independent… so it cannot detect concurrency.

Let’s understand why:

-   M1 has `LC = 5` and does event A → `LC(A) = 6`
    
-   M2 has `LC = 2` and does event B → `LC(B) = 3`
    

These two events are independent; there is no communication between the machines.

But Lamport clocks say `3 < 6`, so it looks like B happened before A, even though they were concurrent. So Lamport clocks only show ordering, not concurrency.

Vector clocks fix this problem!

#### Vector Clocks

They extend the idea on which Lamport’s clocks are based:

“What if every machine knows every other machine’s order?”

If there are N machines, the vector keeps N entries, and each entry tracks that machine’s event count, M\[i\].

This means:

-   Every event carries a snapshot of what that machine knows about others’ state.
    
-   When a machine receives a message, it merges the knowledge using element-wise maximum.
    

This gives each machine a partial history of the entire system.

With vector clocks, a system can tell:

-   Which event happened first,
    
-   Whether two events happened at the same time (concurrently).
    

In a distributed system, we need a single source of truth for all operations… so it helps to have one machine act as the leader.

Let’s dive in!

### 3 Leader Election

The leader becomes the source of truth, and the other machines (followers) replicate its state.

But if all servers share the same design, how can we determine which server qualifies to become the “leader”?

Algorithms like Raft[12](#footnote-12) solve this in a clean and predictable way:

-   All nodes start as followers.
    
-   If no leader is found, the followers enter a candidate state to become the leader.
    
-   Voting occurs, and the node that gets the most votes becomes the leader.
    

Once elected, the leader coordinates updates, and followers replicate its log.

[

![](https://substackcdn.com/image/fetch/$s_!BQMd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c66f378-1059-491d-aa55-215bf0de48f8_1600x883.png)



](https://substackcdn.com/image/fetch/$s_!BQMd!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c66f378-1059-491d-aa55-215bf0de48f8_1600x883.png)

Raft is popular because it’s simple, has well-defined states (follower, candidate, leader), and provides strong safety guarantees. It’s used in many distributed databases and consensus systems.

### 4 Data Replication and Consistency

Maintaining data consistency across many machines is one of the most challenging problems in distributed systems.

Because data is stored on different nodes, every write must be replicated to other nodes to ensure consistency.

But not all systems need the same level of strictness… different consistency models exist depending on what the application needs:

**Linearizability**

-   Every operation looks instant and globally ordered.
    
-   Readers always see the latest write.
    
-   This is the strictest model and is expensive at scale because every operation requires coordination across machines.
    
-   Plus, it often adds latency.
    

**Sequential Consistency**

-   Each node’s operations appear in order, but different nodes may see different global orders.
    
-   It's easier to achieve than linearizability.
    
-   Writes can be done locally first and then replicated asynchronously to others.
    

**Eventual Consistency**

-   If no new writes occur, all replicas will eventually converge on the same value.
    
-   Used in high-availability systems like DynamoDB and Cassandra.
    
-   You trade immediate correctness for higher availability and better partition tolerance.
    

#### CAP Theorem

These consistency choices connect directly to the CAP theorem, which says a distributed system can only provide two out of three at the same time:

-   Consistency (C): Every read returns the latest write (or an error).
    
-   Availability (A): Every request gets a response (even if it’s outdated).
    
-   Partition Tolerance (P): The system keeps working even if the network breaks into parts.
    

So why not all three?

Network partitions (P) are common in distributed systems. When they occur, the system must choose between:

-   Consistency (C): Stop serving outdated data until the partition heals.
    

-   Availability (A): Serve whatever data is available, even if outdated.
    

Thus, a system can be CP, AP, or CA, but never all three at the same time. (There is always a tradeoff.)

Next, we look at scalability techniques… the reason distributed systems exist in the first place: to handle more load than a single machine ever could.

* * *

Get my system design playbook for FREE on newsletter signup:

* * *

## Scalability Techniques in Distributed Systems

[Read more](https://newsletter.systemdesign.one/p/distributed-systems)