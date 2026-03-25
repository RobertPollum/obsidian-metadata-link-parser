---
title: Our Rate Limiter Failed. Bots Cost Us $18K in 6 Hours.
link: https://medium.com/javarevisited/our-rate-limiter-failed-bots-cost-us-18k-in-6-hours-4b8a83b448db?source=rss----d3a191ac6ed---4
author: Devrim Ozcay
publish_date: 2026-01-17 09:38:00
saved_date: 2026-01-17 15:09:57
image: https://cdn-images-1.medium.com/max/498/1*-2NCEKUYAl1A7fu_QJ0YxQ.png
tags: #python #software-development #microservices #programming #software-engineering
---

![image](https://cdn-images-1.medium.com/max/498/1*-2NCEKUYAl1A7fu_QJ0YxQ.png)

![](https://cdn-images-1.medium.com/max/498/1*-2NCEKUYAl1A7fu_QJ0YxQ.png)

#### **Why Redis-based rate limiting isn’t enough — and the production nightmare that taught me how APIs actually get abused**

Look, I need to tell you about the worst Saturday morning of my career.

2:47 AM. Phone buzzing. AWS billing alert.

“Current charges: $4,200. Projected monthly: $68,000.”

I thought it was a bug. Our normal monthly AWS bill was around $800.

It wasn’t a bug.

By 8 AM, we’d burned through $18,000 in API credits, database queries, and compute time.

All because our rate limiter — the thing that was supposed to protect us — didn’t actually work when it mattered.

### How We Fucked Up

We had a typical SaaS API. Users could query our data through REST endpoints. We charged based on API calls.

Simple rate limiting strategy:

-   100 requests per minute per API key
-   Redis to track counts
-   Block requests over the limit

Standard stuff. Everyone does it this way.

Our implementation looked like this:

def check\_rate\_limit(api\_key: str) -> bool:  
    key = f"rate\_limit:{api\_key}"  
    count = redis.incr(key)  
      
    if count == 1:  
        redis.expire(key, 60)  # 1 minute window  
      
    return count <= 100

Clean. Simple. **Completely insufficient.**

We tested it. It worked fine in development. We deployed it six months ago. Never had issues.

Until Saturday.

### What Actually Happened

Someone — we still don’t know who — found our API documentation. Created 500 free trial accounts. Wrote a script.

That script hit our API with 500 concurrent connections per account.

**That’s 250,000 requests per minute.**

Our rate limiter saw each API key individually. Each one was under the 100 req/min limit. So everything passed through.

The API calls were expensive. Each one hit our database, called external services, did some processing. We were paying for:

-   Database read/write operations
-   External API calls (we paid per request)
-   Compute time
-   Data transfer

Our costs went vertical.

By the time I woke up and checked the alerts, we’d served 6.4 million API requests in under 6 hours.

**Most of them from the same IP addresses. All free trial accounts.**

### The Panic

First thing I did? Shut down the API entirely.

Bad move.

Our paying customers immediately started complaining. Support tickets flooding in. “Your service is down, we need this for production.”

Great. Now we have two problems:

-   Bots draining our money
-   Legitimate users locked out

I turned the API back on. Added a hacky IP-based block for the bot IPs I could identify.

**They switched IPs. Immediately.**

Turns out, they were rotating through a massive proxy pool. Blocking IPs was like playing whack-a-mole with infinite moles.

The costs kept climbing.

### What We Tried (That Didn’t Work)

**Attempt 1: Lower the rate limit**

Changed from 100 req/min to 10 req/min.

Result: Legitimate users got blocked. Bots still got through because they had 500 API keys.

**Attempt 2: Block by user-agent**

The bots were using python-requests/2.28.0 as their user agent.

I blocked it.

They changed to random browser user agents. Then started rotating through hundreds of different ones.

**Attempt 3: CAPTCHA on signup**

Added hCaptcha to prevent new free trial signups.

Too late. They already had 500 accounts.

**Attempt 4: Require credit card for free trial**

Would’ve worked, but we couldn’t implement this fast enough. Our payment provider integration would take days to modify.

The bots kept running.

### The Real Fix (What Actually Worked)

At 11 AM, I was exhausted, stressed, and desperate.

I called my former coworker who’d dealt with API abuse at scale. He walked me through what actually stops bots.

### Fix 1: Multi-layer rate limiting

Don’t just limit by API key. Limit by **everything**:

def check\_rate\_limit(request) -> bool:  
    limits = \[  
        ("api\_key", request.api\_key, 100, 60),      # 100/min per key  
        ("ip", request.ip, 200, 60),                 # 200/min per IP  
        ("user\_id", request.user\_id, 1000, 60),      # 1000/min per user  
        ("global", "all", 10000, 60),                # 10k/min globally  
    \]  
      
    for limit\_type, identifier, max\_requests, window in limits:  
        key = f"rate\_limit:{limit\_type}:{identifier}"  
        count = redis.incr(key)  
          
        if count == 1:  
            redis.expire(key, window)  
          
        if count > max\_requests:  
            return False  
      
    return True

This immediately slowed them down. They could rotate API keys and IPs, but couldn’t exceed the global limit.

### Fix 2: Cost-based limiting

Not all API calls cost the same. Some hit the database hard. Some call expensive external APIs.

We added **cost tracking**:

ENDPOINT\_COSTS = {  
    "/api/search": 10,        # Expensive  
    "/api/user/profile": 1,   # Cheap  
    "/api/analytics": 50,     # Very expensive  
}  
  
def check\_cost\_limit(api\_key: str, endpoint: str) -> bool:  
    cost = ENDPOINT\_COSTS.get(endpoint, 5)  
    key = f"cost\_limit:{api\_key}"  
      
    total\_cost = redis.incrby(key, cost)  
      
    if total\_cost == cost:  # First request  
        redis.expire(key, 3600)  # 1 hour window  
      
    # Free tier: 1000 cost units per hour  
    return total\_cost <= 1000

The bots were hammering our most expensive endpoints. This stopped them cold.

### Fix 3: Behavior analysis

Real users don’t make 100 identical requests per minute. Bots do.

I added simple pattern detection:

def check\_bot\_behavior(api\_key: str, endpoint: str) -> bool:  
    key = f"behavior:{api\_key}"  
      
    # Track last 100 requests  
    redis.lpush(key, f"{endpoint}:{time.time()}")  
    redis.ltrim(key, 0, 99)  
    redis.expire(key, 600)  
      
    requests = redis.lrange(key, 0, 99)  
      
    # If 90% of requests are identical, probably a bot  
    if len(requests) >= 50:  
        unique\_endpoints = len(set(r.split(':')\[0\] for r in requests))  
        if unique\_endpoints < 5:  # Less than 5 unique endpoints  
            return False  
      
    return True

This caught the bots that got past rate limits. They were hitting the same endpoint repeatedly with slightly different parameters.

### Fix 4: Temporary account suspension

If an account trips multiple red flags, suspend it temporarily:

def should\_suspend(api\_key: str) -> bool:  
    violations = \[  
        redis.get(f"rate\_limit\_violation:{api\_key}"),  
        redis.get(f"cost\_limit\_violation:{api\_key}"),  
        redis.get(f"bot\_behavior:{api\_key}"),  
    \]  
      
    violation\_count = sum(1 for v in violations if v)  
      
    if violation\_count >= 2:  
        redis.setex(f"suspended:{api\_key}", 3600, "1")  # 1 hour  
        return True  
      
    return False

Legitimate users rarely trip even one violation. Bots trip multiple.

### The Aftermath

By 3 PM Saturday, the bots were stopped.

Final damage:

-   $18,347 in AWS charges
-   6 hours of downtime/degraded service
-   47 support tickets from angry customers
-   One very tired engineer (me)

Monday morning, I had to explain to our CEO why we burned $18K in a weekend.

That conversation sucked.

But we learned. Hard.

### What I Wish I’d Known Before

**1\. Redis rate limiting is a starting point, not a solution**

Everyone uses Redis for rate limiting because it’s fast and simple. But it’s not enough by itself.

You need multiple layers. IP limits, user limits, global limits, cost limits.

**2\. Free trials attract abuse**

Our “no credit card required” free trial was a feature. To attackers, it was an invitation.

After this incident, we added:

-   Email verification (with delay)
-   Phone verification for high-tier trials
-   Gradual limit increases (start at 10 req/min, increase to 100 over time)
-   Credit card requirement for certain features

**3\. Monitor costs in real-time**

We had billing alerts set at $5K. By the time they triggered, we’d already burned through thousands.

Now we have:

-   Hourly cost alerts
-   Per-endpoint cost tracking
-   Anomaly detection on usage patterns

I actually built a small monitoring setup after this incident. If your team is dealing with similar issues around API abuse or cost spikes, I documented the whole pattern in [The Backend Failure Playbook](https://devrimozcay.gumroad.com/l/menhx) — it covers this type of failure and nine others we’ve hit in production.

**4\. Bots are smarter than you think**

They rotate IPs. They randomize user agents. They distribute load to stay under limits. They find your most expensive endpoints.

You’re not fighting a script. You’re fighting someone who studied your API and found the weak spots.

**5\. The damage isn’t just financial**

We lost customer trust. We looked incompetent. Our security posture was questioned.

The $18K hurt. The reputation damage hurt more.

### How We Prevent This Now

Current setup:

**Layer 1: Edge protection**

-   Cloudflare in front of everything
-   Bot detection at the CDN level
-   Geographic restrictions for suspicious regions

**Layer 2: Application rate limiting**

-   Multi-dimensional limits (IP, user, key, global)
-   Cost-based limiting per endpoint
-   Dynamic limits based on account age and behavior

**Layer 3: Behavior analysis**

-   Pattern detection for bot-like behavior
-   Anomaly detection on request patterns
-   Automatic temporary suspension for suspicious accounts

**Layer 4: Financial safeguards**

-   Real-time cost tracking
-   Per-customer cost limits
-   Circuit breakers that shut down expensive operations
-   Hourly AWS cost alerts

**Layer 5: Human review**

-   Automated flagging of suspicious accounts
-   Manual review of high-volume free trials
-   Regular audit of top API consumers

It’s paranoid. It’s over-engineered. It’s also never happened again.

### The Uncomfortable Truth

Rate limiting is security theater until bots test it.

Most rate limiting implementations I see (including ours before this) are designed to handle mistakes, not attacks.

They stop users who accidentally write infinite loops. They don’t stop attackers who studied your API for weaknesses.

The difference matters.

If you’re running an API with free trials, here’s what I’d recommend:

**Do this now:**

1.  Add IP-based rate limiting on top of key-based limiting
2.  Track costs per endpoint, not just request counts
3.  Set up real-time cost alerts (not just monthly)
4.  Add email/phone verification to free trials
5.  Monitor for repeated identical requests (bot pattern)

**Do this soon:**

1.  Implement behavior analysis
2.  Add automatic suspension for suspicious accounts
3.  Require payment method for trials (even if you don’t charge)
4.  Build cost circuit breakers for expensive operations
5.  Review your most expensive endpoints and add extra protection

For the detailed implementation of these patterns, I keep a [production-focused API security checklist](https://devrimozcay.gumroad.com/l/fmcerf) that covers rate limiting, cost control, and the other security layers that actually matter in production.

**Do this eventually:**

1.  Build internal tools for abuse detection
2.  Create runbooks for incident response
3.  Set up automated cost forecasting
4.  Implement gradual limit increases for new accounts

Don’t wait for the $18K wake-up call.

### One Last Thing About Costs

After this incident, I got obsessed with understanding where our money actually went.

Turns out, we were overpaying for a lot of things. Not just because of bots — because we didn’t understand our own infrastructure costs.

The rate limiter incident was the symptom. The real problem was that we had no visibility into what things actually cost.

We fixed that too. But that’s a different story.

**Real talk:** If your team is dealing with weird cost spikes, API abuse, or systems that occasionally just… misbehave in production, I’m collecting these kinds of stories.

I’ve seen too many backend systems fail for the same reasons — and too many teams learn the hard way.

So I turned those incidents into a practical field manual: real failures, root causes, fixes, and prevention systems. No theory. No fluff. Just production.

👉 [The Backend Failure Playbook — How real systems break and how to fix them](https://devrimozcay.gumroad.com/l/menhx)

And if you’re curious about the other stuff I’ve built from these painful lessons, everything’s organized by category [here](http://devrimozcay.gumroad.com):

**Your turn:** Have you dealt with API abuse? What stopped it? Or are you still vulnerable and just don’t know it yet?

Drop a comment. I’m genuinely curious what’s working (or not working) for other teams.

### About me and what I’m working on

I’m an engineer and entrepreneur who has spent years building and operating real production systems — and dealing with what happens when they fail.

I’ve been on the receiving end of late-night incidents, unclear root causes, risky releases, and systems that only make sense to one or two people in the team. I’m now working on turning those painful, expensive experiences into tools and practices that help teams detect, understand, and prevent production failures before they turn into incidents.

If your team is struggling with late detection, recurring incidents, unclear failure modes, or fragile release processes, I’d genuinely love to hear what you’re dealing with and what’s been hardest to solve.

**Follow along:**

-   [Substack](https://substack.com/@devrimozcay1):

### One last thing.

I’m actively talking to teams who are dealing with problems like:

-   Services slowly eating memory until they crash
-   Rising cloud costs nobody understands anymore
-   Incidents that feel “random” but keep repeating
-   Systems that only one or two people truly understand

If any of this sounds like your team, I’d genuinely love to hear what you’re dealing with.

I’m not selling anything here — I’m trying to understand where teams are struggling most so I can build better tools and practices around it.

You can reach me on any of the platforms above.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=4b8a83b448db)

* * *

[Our Rate Limiter Failed. Bots Cost Us $18K in 6 Hours.](https://medium.com/javarevisited/our-rate-limiter-failed-bots-cost-us-18k-in-6-hours-4b8a83b448db) was originally published in [Javarevisited](https://medium.com/javarevisited) on Medium, where people are continuing the conversation by highlighting and responding to this story.