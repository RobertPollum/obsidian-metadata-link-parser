---
title: I Inherited a Codebase With No Tests. And No Comments. And No Documentation.
link: https://medium.com/javarevisited/i-inherited-a-codebase-with-no-tests-and-no-comments-and-no-documentation-95dd0c784e0c?source=rss----d3a191ac6ed---4
author: Devrim Ozcay
publish_date: 2026-01-17 09:37:57
saved_date: 2026-01-17 15:09:57
image: https://cdn-images-1.medium.com/max/1024/1*-z8bZnnRqQyluesuc8wTOA.png
tags: #technology #coding #programming #software-engineering #software-architecture
---

![image](https://cdn-images-1.medium.com/max/1024/1*-z8bZnnRqQyluesuc8wTOA.png)

![](https://cdn-images-1.medium.com/max/1024/1*-z8bZnnRqQyluesuc8wTOA.png)

#### The archaeology of understanding production code written by developers who left 3 years ago

Monday morning. 9:23 AM. Coffee still hot.

My manager drops a Slack message: “Hey, can you take over the payment service? Previous dev left last week.”

Sure. How hard could it be?

I clone the repo. Open the main file.

2,847 lines. One file. No comments. Function names like processData(), handleStuff(), doTheThing().

I check for tests.

Zero.

I look for documentation.

There’s a README. It says: “Payment Service — handles payments.”

Thanks. Really helpful.

The previous developer? Unreachable. Left for a startup in Berlin. Phone off. Slack deactivated.

I was alone with 2,847 lines of someone else’s trauma.

### Week 1: The Panic Phase

First thing I did? Run the service locally.

It didn’t start.

Missing environment variables. Which ones? Good question. Let me just guess.

I found a .env.example file. It had 3 variables. Production had 47.

I started reverse-engineering environment variables by reading the code and hoping I guessed right.

String apiKey = System.getenv("PAYMENT\_API\_KEY");  
if (apiKey == null) {  
    // This runs in production. No fallback. Just null.  
    apiKey = "";  
}

Empty string as a fallback for an API key. In production. For a payment service.

Jesus Christ.

After 6 hours of trial and error, I got it running locally. Sort of. It crashed every 10 minutes, but at least it started.

### Week 2: The “Don’t Touch Anything” Phase

Production was running. Users were paying. Money was moving.

I didn’t understand how, but it worked.

My job was to add a new feature: support for a second payment provider.

Simple, right?

I started reading the code. Really reading it.

Here’s what I found:

public void processPayment(Order order) {  
    // Step 1: validate  
    if (order.getAmount() > 0) {  
        // Step 2: charge  
        boolean success = chargeCard(order);  
        if (success) {  
            // Step 3: ???  
            updateDatabase(order);  
            sendEmail(order);  
            logPayment(order);  
            doSomethingElse(order); // what is this  
        }  
    }  
}

That doSomethingElse() function? 300 lines. No comments. Called from 47 different places.

What does it do? I don’t know. Does anyone know? Probably not.

Can I delete it? Absolutely not.

So I did what every developer does in this situation: I didn’t touch it.

I spent two weeks reading code, taking notes, drawing diagrams, and being absolutely terrified of breaking production.

The turning point came when I found this:

// TODO: fix this before launch  
if (order.getStatus().equals("pending")) {  
    // temporary hack  
    Thread.sleep(5000);  
}  
\`\`\`  
  
"Before launch." This service has been in production for 3 years.  
\## Week 3: The First Bug  
Friday. 4:37 PM.  
PagerDuty goes off. Payment failures spiking. 47 failed transactions in 10 minutes.  
I check logs.  
\`\`\`  
NullPointerException at PaymentService.java:1247

Line 1247. I scroll to it.

String customerId = order.getCustomer().getId();

Apparently, sometimes order.getCustomer() is null. Who knew?

Not me. Not the logs. Not the previous developer.

I added a null check. Deployed. Failures stopped.

But here’s the thing: I have no idea _why_ getCustomer() was null. What edge case triggers this? Under what conditions?

The code doesn’t tell me. The logs don’t tell me. The tests don’t exist to tell me.

I just fixed a symptom. The disease is still there, somewhere, waiting.

This is when I started understanding the real problem: **working code isn’t the same as understood code.**

### Month 2: Building a Mental Model (The Hard Way)

I couldn’t keep fixing bugs blindly. I needed to understand this system.

So I started building my own documentation. In Notion. Just for me.

**What I documented:**

-   Every function and what it actually does (not what it’s named)
-   Side effects I discovered (database writes, API calls, emails sent)
-   Failure modes I’d seen in production
-   Environment variables and what breaks without them

This took forever. But after a month, I had a 40-page document that explained more than the entire codebase ever did.

I also started adding tests. Not comprehensive tests. Survival tests.

@Test  
public void testPaymentDoesntExplodeWithNullCustomer() {  
    Order order = new Order();  
    order.setCustomer(null); // this happens in production  
      
    // if this doesn't throw, we're good  
    service.processPayment(order);  
}

These weren’t good tests. They were “please God don’t let this break again” tests.

But they caught 3 bugs before production did. So they worked.

Around this time, I realized I wasn’t the only one dealing with this nightmare. I started documenting the patterns I was seeing — not just in this codebase, but in every legacy system I’d touched. That became the foundation for what I now call [The Backend Failure Playbook](https://devrimozcay.gumroad.com/l/menhx) — real incidents, real failures, and the fixes that actually worked when documentation didn’t exist.

### Month 3: The Refactoring Trap

By month 3, I was confident. I understood the system. I knew where the bodies were buried.

Time to refactor, right?

I picked the worst function. The 300-line doSomethingElse() monster. I was gonna clean this up.

I spent a week rewriting it. Split it into 12 smaller functions. Added comments. Added tests. It was beautiful.

I deployed to staging. Everything worked.

I deployed to production.

**Everything broke.**

Turns out, buried in line 247 of that horrible function was this:

if (order.getAmount() > 1000) {  
    // large order - needs manual review  
    flagForReview(order);  
}

I’d moved this logic to a different function. The function still ran. But the timing changed.

In the old code, it ran BEFORE the payment was charged.

In my refactored code, it ran AFTER.

Now large orders were getting charged, then flagged, then refunded. Our fraud team was manually reviewing transactions that had already gone through.

Chaos.

I rolled back. Apologized to the team. Felt like an idiot.

**The lesson:** In legacy code, the _order_ of operations matters as much as the operations themselves. And you won’t know the order matters until you break it.

### Month 4: The Breakthrough

Here’s what finally worked:

**1\. I stopped trying to understand everything at once.**

I focused on one flow at a time. New payment? I traced that path through the code. Refund? Different path. Each flow got its own documentation.

**2\. I added logging everywhere.**

If I didn’t understand why something happened, I logged it. Eventually, patterns emerged.

**3\. I wrote “characterization tests.”**

Not tests that verify correct behavior. Tests that verify _current_ behavior — even if that behavior is wrong.

@Test  
public void testCurrentBehaviorWithNullCustomer() {  
    // Currently, this returns null and logs nothing  
    // This is probably wrong, but it's what production does  
    Order order = new Order();  
    order.setCustomer(null);  
      
    String result = service.processPayment(order);  
    assertNull(result); // this is what currently happens  
}

When I refactored, these tests told me if I changed behavior. Even accidentally.

**4\. I created a glossary.**

The code used terms like “transaction,” “payment,” “charge,” and “order” interchangeably. I documented what each term actually meant in this system.

This alone prevented 80% of misunderstandings.

When I finally got the system stable enough to think clearly, I started researching how to prevent this mess in the first place. That’s when I put together the [Spring Boot Production Checklist](https://devrimozcay.gumroad.com/l/fmcerf) — the things I wish the previous developer had checked before leaving.

### The Patterns I Keep Seeing

After inheriting this codebase and talking to dozens of other developers in the same situation, here are the patterns:

**Legacy code isn’t old code. It’s code nobody understands.**

You can have 6-month-old code that’s legacy because the only person who understood it left.

**The absence of tests isn’t the biggest problem. The absence of intent is.**

Tests tell you _what_ the code does. Comments tell you _why_. Without “why,” you’re guessing.

**“Working in production” doesn’t mean “correct.”**

This payment service had been running for 3 years with bugs that nobody noticed because they were rare or subtle.

**Rewriting is tempting. Refactoring is dangerous. Both can fail.**

The real solution? Incremental understanding. Document, test, fix, repeat.

**Nobody _plans_ to write unmaintainable code.**

The previous developer wasn’t malicious. They were probably rushed, under pressure, or dealing with changing requirements. Legacy code is what happens when short-term thinking meets long-term reality.

### What I’d Do Differently

If I inherited this codebase again, here’s my strategy:

**Week 1: Don’t code. Just read.**

-   Map the main flows
-   Document unknowns
-   Talk to anyone who’s touched this code

**Week 2–3: Add observability before changing anything.**

-   Logging
-   Metrics
-   Error tracking
-   This is your safety net

**Week 4: Write characterization tests for critical paths.**

-   Document current behavior
-   Even if it’s wrong
-   These tests prevent accidental changes

**Month 2: Start small fixes.**

-   Fix bugs
-   Add comments as you go
-   Build trust with the codebase

**Month 3+: Refactor incrementally.**

-   One function at a time
-   With tests
-   With staging validation
-   With rollback plans

The resources that helped me survive this weren’t tutorials. They were battle-tested guides from people who’d been in the trenches. I kept the [Spring Boot Troubleshooting guide](https://devrimozcay.gumroad.com/l/spring-boot-troubleshooting) open constantly — not for setup help, but for debugging production mysteries when the code gave no hints.

### The Uncomfortable Truth

Most production code is like this.

Not documented. Not tested. Not understood.

Maintained by developers who are terrified to touch it, guessing at requirements, and praying their changes don’t break something.

This isn’t a failure of individual developers. It’s a failure of process, deadlines, and priorities.

Code gets written under pressure. Then that developer leaves. Then someone new inherits it. And the cycle continues.

The real question isn’t “how do I fix this legacy code?”

It’s “how do I avoid creating the next one?”

**The answer:**

-   Write comments explaining _why_, not _what_
-   Write tests that document behavior
-   Write documentation that future-you can understand
-   Write code assuming you’ll quit next week

Because one day, you will quit. Or get promoted. Or move teams.

And someone else will inherit your code.

Be kinder to them than your predecessor was to you.

### 6 Months Later

I’m still maintaining this payment service.

I’ve added 147 tests. I’ve documented 80% of the flows. I’ve refactored the worst functions.

Is it perfect? No.

Do I understand it? Mostly.

Would I still be scared to make changes? A little.

But it’s better. And it’s not going to be a nightmare for the next person who inherits it.

At least, I hope not.

### What Actually Helped Me

Look, inheriting undocumented code isn’t unique to me. It’s basically the standard developer experience.

After going through this hell and talking to other engineers dealing with the same nightmare, I documented the patterns that actually helped:

For Java/Spring systems specifically, I keep [Grokking the Spring Boot Interview](https://gumroad.com/a/134347923/hrUXKY) nearby — not for interview prep, but because it explains _why_ Spring does certain things. That “why” is what missing documentation never tells you.

When I’m stuck debugging bizarre production behavior, the [Production Engineering Cheatsheet](https://devrimozcay.gumroad.com/l/production-engineering-cheatsheet) has saved me more times than I can count. It covers the fundamentals nobody documents until systems break.

For all my products organized by category (backend, testing, deployment, interview prep), check out my f[ull catalog](http://devrimozcay.gumroad.com) — these came from years of hitting the same problems repeatedly and finally writing down what actually worked.

### About me and what I’m working on

I’m an engineer and entrepreneur who has spent years building and operating real production systems — and dealing with what happens when they fail.

I’ve been on the receiving end of late-night incidents, unclear root causes, risky releases, and systems that only make sense to one or two people in the team. I’m now working on turning those painful, expensive experiences into tools and practices that help teams detect, understand, and prevent production failures before they turn into incidents.

If your team is struggling with late detection, recurring incidents, unclear failure modes, or fragile release processes, I’d genuinely love to hear what you’re dealing with and what’s been hardest to solve.

**Reach out:**

-   📧 [Substack](https://substack.com/@devrimozcay1):

**Follow along:** [X](https://x.com/devrimozcy)

### One last thing.

I’m actively talking to teams who are dealing with problems like:

-   services slowly eating memory until they crash
-   rising cloud costs nobody understands anymore
-   incidents that feel “random” but keep repeating
-   systems that only one or two people truly understand

If any of this sounds like your team, I’d genuinely love to hear what you’re dealing with.

I’m not selling anything here — I’m trying to understand where teams are struggling most so I can build better tools and practices around it.

You can reach me through any of the links above.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=95dd0c784e0c)

* * *

[I Inherited a Codebase With No Tests. And No Comments. And No Documentation.](https://medium.com/javarevisited/i-inherited-a-codebase-with-no-tests-and-no-comments-and-no-documentation-95dd0c784e0c) was originally published in [Javarevisited](https://medium.com/javarevisited) on Medium, where people are continuing the conversation by highlighting and responding to this story.