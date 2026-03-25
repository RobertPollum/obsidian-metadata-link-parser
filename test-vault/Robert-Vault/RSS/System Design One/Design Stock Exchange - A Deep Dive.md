---
title: Design Stock Exchange - A Deep Dive
link: https://newsletter.systemdesign.one/p/system-design-stock-exchange
author: Neo Kim
publish_date: 2025-12-11 04:01:10
saved_date: 2026-01-17 15:10:03
image: https://substack-post-media.s3.amazonaws.com/public/images/bbc948f6-4286-4d29-98d0-42703e9d4754_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/bbc948f6-4286-4d29-98d0-42703e9d4754_1280x720.png)

[

![](https://substackcdn.com/image/fetch/$s_!hhuY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc4e02bd3-d20e-4db8-9574-466d849a4492_1280x300.png)



](https://newsletter.systemdesign.one/subscribe?yearly=true)

-   _[Share this post](https://newsletter.systemdesign.one/p/system-design-stock-exchange/?action=share) & I'll send you some rewards for the referrals._
    

-   _Block diagrams created with [Eraser](https://app.eraser.io/auth/sign-up?ref=neo)._
    

Last month, I launched **[Design, Build, Scale](https://newsletter.systemdesign.one/subscribe?yearly=true)**… the newsletter series that will elevate your software engineering career.

This email (Part 3) is a little longer than the previous two, so I’ll get straight into it…

**TL;DR** of [Part 1](https://newsletter.systemdesign.one/p/stock-exchange-system-design) & [Part 2](https://newsletter.systemdesign.one/p/disruptor-pattern)!

**Key components of an exchange** **are**:

-   Broker - allows people to buy and sell stocks on the exchange.
    
-   Gateway - entry point for brokers to send BUY or SELL orders to the exchange.
    
-   Matching Engine - matches BUY and SELL orders to create trades.
    

[

![](https://substackcdn.com/image/fetch/$s_!PaDO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F20c30f84-629d-4f50-ad3a-f85a1a3811d0_1754x454.png)



](https://substackcdn.com/image/fetch/$s_!PaDO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F20c30f84-629d-4f50-ad3a-f85a1a3811d0_1754x454.png)

**Order Processing Workflow:**

1.  User creates a BUY or SELL order through the broker.
    
2.  Gateway validates the order: authentication, check request format & rate limiting.
    
3.  Then it forwards the request to the order manager. It performs risk checks using rules defined in the Risk Manager.
    
4.  Risk manager verifies whether the user’s wallet has sufficient funds. Plus, it freezes the required amount in the wallet to prevent double-spending.
    
5.  Order Manager sends the request to the Matching Engine.
    
6.  Matching Engine keeps an in-memory “order book” for each stock. It matches BUY and SELL orders based on price and time priority.
    
7.  After a match occurs, the Matching Engine creates two executions (fills). One for the buyer. One for the seller.
    
8.  Matching Engine distributes trade results as market data to clients through the Gateway. It uses UDP multicast[1](#footnote-1) for efficiency.
    

Most steps “before and after” matching run in parallel to BOOST throughput.

Onward.

* * *

## [Start building AI backends–Agents as microservices (Sponsor)](https://umami-production-286d.up.railway.app/q/7Q4fBDagX)

[

![](https://substackcdn.com/image/fetch/$s_!IRav!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb3dfdb3e-7cf9-4afa-b538-22733a25de0c_1084x261.webp)



](https://umami-production-286d.up.railway.app/q/7Q4fBDagX)

Chatbots and copilots are just the surface.

The real shift is happening underneath, where AI agents work behind the scenes, making smart decisions that developers used to hardcode.

**[AgentField](https://umami-production-286d.up.railway.app/q/7Q4fBDagX)** is the open-source control plane for that:

-   Run agents as services
    
-   Discover services/agents
    
-   Coordinate tasks asynchronously
    
-   Use cryptographic IAM and audit trails
    

Use it to build AI-native backends that can reason about orders, customers, payments, and incidents (while following the rules YOU set).

You focus on the logic. AgentField handles running it in production.

1.  **Explore the code on GitHub**: [https://github.com/Agent-Field/agentfield](https://umami-production-286d.up.railway.app/q/7Q4fBDagX)
    
    -   Try examples, test features, and ⭐ the repo if it helps!
        
2.  **New to AI backends?** Start here: [https://www.agentfield.ai/blog/posts/ai-backend](https://agentfield.ai/blog/posts/ai-backend/?utm_campaign=product_launch&utm_source=sys_design&utm_medium=newsletter&utm_id=sys_design-1&utm_content=blog-cta)
    
    -   See why autonomous backends are crucial for system design.
        
3.  **Want to run 1000s of agents?** Read this: [https://agentfield.ai/docs](https://agentfield.ai/docs/?utm_campaign=product_launch&utm_source=sys_design&utm_medium=newsletter&utm_id=sys_design-1&utm_content=docs-cta)
    
    -   Learn how to run agents safely at scale.
        

[⭐ STAR THE REPO](https://umami-production-286d.up.railway.app/q/7Q4fBDagX)

* * *

# FIX Protocol

Broker send orders to the gateway using the Financial Information eXchange (**FIX**) protocol (for institutional clients).

FIX is a text-based protocol. Although reliable, it’s slow because text parsing consumes CPU. Gateway uses a FIX engine to receive and send FIX messages.

You can build your own engine for ultra-low latency, or buy a pre-optimized commercial one.

[

![](https://substackcdn.com/image/fetch/$s_!COX4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F770cfe4a-0899-4242-9201-5deaf4cc9a1c_1666x292.png)



](https://substackcdn.com/image/fetch/$s_!COX4!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F770cfe4a-0899-4242-9201-5deaf4cc9a1c_1666x292.png)

Exchange streams market data using FIX Adapted for STreaming[2](#footnote-2) (**FAST**).

It’s much faster because it’s a binary, compressed version of FIX... binary encoding is compact and easy for CPUs to parse.

Many exchanges provide even faster binary protocols for high-frequency trading:

-   Integrated Trade Capture Handler (**ITCH**) - a fast market data feed
    
-   Order Unified Communication Handler (**OUCH**) - a fast order entry protocol
    

These avoid text parsing and are specifically designed for low-latency trading.

Let’s keep going!

* * *

# Gateway

It accepts connections from brokers and supports REST + WebSocket APIs[3](#footnote-3) (for retail traders).

Gateway could use Nginx server for HTTPS termination and WebSocket routing. Plus, exchange could run many gateway servers in parallel behind a load balancer for high availability.

[

![](https://substackcdn.com/image/fetch/$s_!FSuK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F60cf09c1-e9c9-45a5-860c-af2f839c455e_1657x718.png)



](https://substackcdn.com/image/fetch/$s_!FSuK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F60cf09c1-e9c9-45a5-860c-af2f839c455e_1657x718.png)

**Gateway:**

-   Tracks sequence numbers of each client,
    
-   Normalize and validate incoming messages,
    
-   Protects matching engine from malformed or abusive client traffic,
    
-   Uses TCP backpressure[4](#footnote-4) to slow down misbehaving or overloaded clients automatically,
    
-   Allows only ONE outstanding order per client to maintain strict, deterministic ordering.
    

**Exchanges used to have MANY gateways (some faster, some slower).**

But traders exploited this by:

-   Flooding slower gateways with junk orders to delay competitors,
    
-   Routing orders only through the fastest gateway (unfair advantage).
    

So modern exchanges use a SINGLE gateway for **all clients of the “same class”**.

[

![](https://substackcdn.com/image/fetch/$s_!xxcm!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b1c1912-ec0f-42e2-97b4-ca460cc0fa06_1196x318.png)



](https://substackcdn.com/image/fetch/$s_!xxcm!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b1c1912-ec0f-42e2-97b4-ca460cc0fa06_1196x318.png)

This means all clients in the same class (institutional clients, retail traders) have identical latency[5](#footnote-5). Thus ensuring fairness and reducing system load.

**Here’s how Gateway handles concurrency:**

-   Inbound (broker → gateway):
    
    -   Assigns one thread per TCP connection
        
    -   Parses messages and publishes them to a Disruptor ring buffer
        
    -   Disruptor efficiently distributes events to internal services (order manager, risk checks,...)
        

[

![](https://substackcdn.com/image/fetch/$s_!xiWh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa41f4ed8-56d6-422f-abb4-32b3366bf082_1109x638.png)



](https://substackcdn.com/image/fetch/$s_!xiWh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa41f4ed8-56d6-422f-abb4-32b3366bf082_1109x638.png)

-   Outbound (matching engine → broker):
    
    -   Outbound events come through the ring buffer
        
    -   Ring buffer dispatches events to subscribed services
        
    -   Each session has its own outbound handler thread
        
    -   If a client is slow, backpressure (ring buffer fills up) prevents system slowdowns
        

[

![](https://substackcdn.com/image/fetch/$s_!vXjq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2bdeb8f1-1457-4be6-84c1-82ebe36541ce_877x453.png)



](https://substackcdn.com/image/fetch/$s_!vXjq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2bdeb8f1-1457-4be6-84c1-82ebe36541ce_877x453.png)

NOTE: Inbound and outbound paths share no mutable state.

* * *

# Wallet

A wallet stores a user’s funds & assets for trading.

But there’s a risk of DOUBLE SPENDING if two orders from the same user arrive at once… and both threads try to read the “same” balance.

Example:

-   Thread A reads balance X and subtracts Y
    
-   Thread B reads balance X and subtracts Z
    

Here are three ways to prevent this problem:

#### 1 Mutex Locks

Only one thread updates the user’s balance at a time. This is safe, but it significantly slows down the system.

#### 2 ConcurrentHashMaps

They allow fast (parallel) reads/writes if keys fall into different segments. Yet it doesn’t protect the correctness of multi-step operations (`read → modify → write`).

#### 3 Database Row-Level Locking

Exchanges rely on SQL databases (like MySQL InnoDB) because they:

-   Support ACID (safe transactions)
    
-   Provide row-level locking, so two threads cannot update the same user’s balance at once
    

Plus, this approach makes the `read → modify → write` operations safer.

**Sample Database Schema**

-   `user_account (user_id, balance)`
    
-   `wallet (user_id, symbol, quantity)`
    
-   `stock (symbol, price)`
    

Tables can be sharded by `“user_id”` for performance.

**Data Structures**

-   account balance - `HashMap {user_id: balance}`
    
-   stock price - `HashMap {symbol: price}`
    

Ready for the next technique?

* * *

# Disruptor Pattern

Disruptor is a concurrency model that doesn’t use locks.

It’s built as a ring buffer (fixed-size circular array with up to 20 million slots).

Imagine the ring buffer as:

> _“super-fast, in-memory queue for passing events between threads.”_

Producers write events; consumers read them in order.

Each thread maintains its own sequence number, so there is no locking, blocking, or contention.

[

![](https://substackcdn.com/image/fetch/$s_!DB4N!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F687edd20-0652-4a9d-bf46-39c813ecb568_1818x695.png)



](https://substackcdn.com/image/fetch/$s_!DB4N!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F687edd20-0652-4a9d-bf46-39c813ecb568_1818x695.png)

A disruptor offers:

-   high throughput,
    
-   microsecond-level latency.
    

It’s excellent for workloads where many components must process the same event.

Here’s WHERE the stock exchange uses the disruptor:

#### 1 Gateway

Gateway publishes incoming orders to an input disruptor.

It allows many tasks to run in parallel (without blocking each other), such as:

-   journaling to disk
    
-   unmarshalling (parsing messages)
    
-   assigning global sequence numbers
    
-   replicating events to standby engines
    

Each step is independent; disruptor provides high throughput without locks.

[

![](https://substackcdn.com/image/fetch/$s_!pn_a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdc9fd3f6-a3fd-4df3-9145-d91b0a7d81d3_1109x1134.png)



](https://substackcdn.com/image/fetch/$s_!pn_a!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdc9fd3f6-a3fd-4df3-9145-d91b0a7d81d3_1109x1134.png)

#### 2 Order Manager

Order manager uses disruptors to broadcast events to various internal consumers, such as:

-   risk checks
    
-   routing logic
    
-   audit/journal writers
    
-   user balance service
    
-   sequence enforcement
    

Each consumer reads using its own sequence counter,,, so they never block each other.

#### 3 Market Data

Output disruptors take results and prepare them for network output:

-   execution reports
    
-   market data updates
    
-   client notifications via gateway
    

[

![](https://substackcdn.com/image/fetch/$s_!uW3B!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe6012430-4fd2-4698-8ce9-18ddf470dce3_1109x514.png)



](https://substackcdn.com/image/fetch/$s_!uW3B!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe6012430-4fd2-4698-8ce9-18ddf470dce3_1109x514.png)

Each topic (e.g., trades, market data) gets its own disruptor to avoid interference.

Ready for the best part?

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

* * *

[Read more](https://newsletter.systemdesign.one/p/system-design-stock-exchange)