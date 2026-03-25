---
title: "Senior Rails Decisions Explained: How I Think About Architecture, Code & Production Issues"
link: https://python.plainenglish.io/senior-rails-decisions-explained-how-i-think-about-architecture-code-production-issues-609d6f0633dc?source=rss----78073def27b8---4
author: Vaishnavi Ganeshkar
publish_date: 2026-01-17 14:24:43
saved_date: 2026-01-17 15:09:43
image: https://cdn-images-1.medium.com/max/800/0*yidXNRFjB-U0Huox.png
tags: #software-development #ruby #backend #software-engineering #ruby-on-rails
---

![image](https://cdn-images-1.medium.com/max/800/0*yidXNRFjB-U0Huox.png)

![](https://cdn-images-1.medium.com/max/800/0*yidXNRFjB-U0Huox.png)

Rails tutorials teach syntax.  
Experience teaches **judgment**.

The difference between a junior and a senior Rails developer isn’t how many gems they know — it’s **how they decide what _not_ to do**.

This post explains **how I make key Rails decisions in real production systems**, covering architecture, business logic, technology choices, code reviews, and production debugging.

### 1\. When I Choose a Monolith vs Microservices

### The junior instinct

> _“The app might grow — let’s use microservices.”_

### The senior question

> _“What problem are we solving_ today_?”_

### ❌ When microservices hurt

-   Small teams
-   Rapid iteration
-   Shared domain models
-   Frequent schema changes
-   Tight business coupling

Microservices amplify:

-   Deployment complexity
-   Debugging difficulty
-   Data inconsistency
-   Cognitive load

### ✅ My default: Modular monolith

app/  
  domains/  
    billing/  
    onboarding/  
    reporting/

Billing::Charge.call(user)

### Why this scales

-   Clear boundaries
-   One deployment
-   One database
-   Easy future extraction

### 🚦 When I do choose microservices

-   Independent scaling needs
-   Separate deploy cadence
-   Regulatory or data isolation
-   Multiple autonomous teams

> **_Rule:_** _Don’t pay distributed systems costs until you_ must_._

### 2\. How I Decide Where Business Logic Lives

### ❌ Common mistake: Everything in models

class Order < ApplicationRecord  
  def checkout!  
    calculate\_total  
    charge\_card  
    send\_invoice  
  end  
end

This couples:

-   Persistence
-   Workflow
-   Side effects

### ✅ My decision framework

![](https://cdn-images-1.medium.com/max/307/1*WVy_sHXu41MkgnAEGzSX2A.png)

### Example: Proper separation

class Orders::Checkout  
  def self.call(order)  
    Pricing::Calculate.call(order)  
    Payments::Charge.call(order)  
    Invoices::Send.call(order)  
  end  
end

Orders::Checkout.call(order)

> **_Models describe state. Services describe behavior._**

### 3\. When I Say No to New Tech in Rails

### ❌ Common overengineering

-   GraphQL for CRUD
-   Kafka without scale
-   Event sourcing too early
-   React for admin dashboards
-   Redis as a database

### My evaluation checklist

I ask:

1.  Is the current solution failing?
2.  Is the problem proven or hypothetical?
3.  Will this slow onboarding?
4.  Can we remove it easily?

If not — **I say no**.

### Example: Hotwire vs React

<%= turbo\_frame\_tag "orders" do %>  
  <%= render @orders %>  
<% end %>

Most Rails apps don’t need React.  
They need **faster feedback loops**.

### 4\. How I Review Rails Pull Requests

I don’t start by reading code.

### Step 1: Understand intent

-   What problem is this solving?
-   Is it necessary _now_?

### Step 2: Look for red flags

after\_commit :sync\_external\_system

🚩 Hidden side effects  
🚩 Callbacks doing work  
🚩 Massive diffs  
🚩 New gems without justification

### Step 3: Ask senior questions

-   Can this fail safely?
-   Is this testable?
-   Is this explicit?
-   Is this reversible?

### Good PR example

Orders::SyncExternal.call(order)

Explicit. Testable. Safe.

### 5\. How I Debug Production Rails Issues

Production debugging is where seniors shine.

### Step 1: Observe before acting

-   Logs
-   Metrics
-   Error rates
-   Latency

### Step 2: Reproduce safely

Rails.logger.info(order.attributes)

Never guess. **Measure.**

### Step 3: Find the bottleneck

Common culprits:

-   N+1 queries
-   Missing indexes
-   Background jobs blocking threads
-   Memory leaks
-   Connection pool exhaustion

### Example: Fixing N+1

Order.includes(:user).find\_each

### Step 4: Fix the root cause

-   Not the symptom
-   Not the alert
-   The _reason_ it failed

### Senior Rails Mental Models

Here’s what guides my decisions:

-   Explicit > Clever
-   Simple > Flexible
-   Boring > Fancy
-   Today’s problem > Hypothetical future
-   Understand > Abstract

Rails rewards **discipline**, not complexity.

### Final Thoughts

Senior Rails work isn’t about new tools.  
It’s about **judgment, restraint, and clarity**.

The best Rails apps:

-   Change safely
-   Scale gradually
-   Onboard quickly
-   Fail predictably

And that comes from decisions — not gems.

### Got Questions? Let’s Make Them the Next Post 👇

If you disagree with any decision — or want a deeper dive — drop it in the comments.

Rails gets better when we share **experience**, not just tutorials.

Thanks for reading — see you in the next one 🚀

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=609d6f0633dc)

* * *

[Senior Rails Decisions Explained: How I Think About Architecture, Code & Production Issues](https://python.plainenglish.io/senior-rails-decisions-explained-how-i-think-about-architecture-code-production-issues-609d6f0633dc) was originally published in [Python in Plain English](https://python.plainenglish.io) on Medium, where people are continuing the conversation by highlighting and responding to this story.