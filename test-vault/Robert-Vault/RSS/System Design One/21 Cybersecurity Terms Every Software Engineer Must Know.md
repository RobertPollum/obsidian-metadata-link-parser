---
title: 21 Cybersecurity Terms Every Software Engineer Must Know
link: https://newsletter.systemdesign.one/p/cybersecurity-fundamentals
author: Neo Kim
publish_date: 2026-01-12 07:03:25
saved_date: 2026-01-17 15:10:02
image: https://substack-post-media.s3.amazonaws.com/public/images/a934d195-2ebd-498f-8383-5a201603636e_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/a934d195-2ebd-498f-8383-5a201603636e_1280x720.png)

Get my system design playbook for FREE on newsletter signup:

-   _[Share this post](https://newsletter.systemdesign.one/p/cybersecurity-fundamentals/?action=share) & I'll send you some rewards for the referrals._
    

* * *

Cybersecurity used to feel like something only a few people in the office cared about.

Not anymore…

Every engineer writes code that touches users, data, and money. One small gap in logic can expose an entire system. And it happens faster than most people expect.

-   A simple auth[1](#footnote-1) flaw.
    
-   A weak token check[2](#footnote-2).
    
-   A missed validation deep in a backend path.
    

These things look minor when you’re building features… They don’t feel dangerous.

But attackers think in patterns.

They look for the smallest crack, then push until it opens wide.

That’s why engineers can’t write code with a “someone else will secure it” mindset. Instead, think like the person trying to break what you built.

What comes next is a short security handbook for engineers…

It’s designed to help you think more clearly while you’re building. You’ll learn how small decisions add up, where systems usually weaken, and how to spot risk early instead of reacting later.

If you write code that touches users, data, or money, these ideas will shape how you design and ship software. They help you build systems that stay steady under real-world pressure.

Read it with an open mind.

That’s often enough to level up your engineering.

Onward.

* * *

### [Passbolt: Password and Secrets Manager Built for Modern Software Teams (Sponsor)](https://hubs.li/Q03W1x1j0)

[

![](https://substackcdn.com/image/fetch/$s_!vWKx!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d759409-53c4-4067-9324-7f706b740eca_3240x1080.png)



](https://hubs.li/Q03W1x1j0)

Passbolt is built first for modern IT teams, yet simple enough for everyone.

With **[Passbolt](https://hubs.li/Q03W1x1j0)**, you can:

-   Share credentials securely and granularly (per item, per person, per version)
    
-   Enforce encryption on the client side (servers never see your secret)
    
-   Keep full audit logs of who did what
    
-   Make rotation mandatory when access is revoked
    
-   Integrate secrets into CI/CD workflows
    
-   Deploy on your own stack (or using their EU cloud)
    
-   Stay fully open source, with 15+ published audits
    

If your team still passes around credentials the old way, this is your sign to fix it.

[Try Passbolt for FREE](https://hubs.li/Q03W1x1j0)

* * *

I want to introduce [Saed Farah](https://www.linkedin.com/in/saedf/) as a guest author.

[

![](https://substackcdn.com/image/fetch/$s_!4mue!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feb065244-6ec8-4ef5-a3dc-0ae991e136e6_1024x538.png)



](https://www.linkedin.com/in/saedf/)

**[Saed Farah](https://www.linkedin.com/in/saedf/)** is a Senior Security Engineer at Google and a well-known voice in the cloud security and DevSecOps community. He is also a Kubestronaut and writes extensively about real-world security engineering, cloud infrastructure, and career growth in tech.

Saed’s journey into tech is anything but conventional. He is entirely self-taught and has worked his way up through roles including IT Support Specialist, Technical Specialist, Sales Engineer, Junior and Senior DevOps Engineer, before eventually joining Google.

Along the way, he also held non-tech roles, including working as a doorman and selling mobile phones, experiences that shaped his grounded and practical perspective on careers in technology.

You can follow Saed and explore his work here:

-   **[Instagram](https://www.instagram.com/saedctl)**
    
-   [LinkedIn](https://www.linkedin.com/in/saedf/)
    
-   **[Newsletter](https://secengweekly.substack.com/)**
    

* * *

## **The Foundations**

Let’s dive in!

### 1\. Attack Surface

[

![](https://substackcdn.com/image/fetch/$s_!0sK0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1da4882-7017-457f-8a79-a7b65738b5d3_777x376.png)



](https://substackcdn.com/image/fetch/$s_!0sK0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1da4882-7017-457f-8a79-a7b65738b5d3_777x376.png)

An attack surface is the full set of places where an attacker can interact with your system. Most engineers think it’s only the login page or a few public APIs.

In reality, it’s everything the system touches.

-   Endpoints.
    
-   Webhooks[3](#footnote-3).
    
-   Upload flows.
    
-   Background jobs.
    
-   Message queues[4](#footnote-4).
    
-   Third-party callbacks.
    

Even old features nobody remembers.

Each new feature creates another place where something might be missed. The risk grows quietly because these changes happen across sprints, teams, and deadlines.

A small logic gap in one corner of the codebase is enough for someone skilled to walk through.

Good engineering teams map their attack surface often, remove dead paths, and treat every new feature as a new door that needs to be locked before release.

### **2\. Threat Model**

[

![](https://substackcdn.com/image/fetch/$s_!M3Zo!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff92cbbe3-5006-422f-8e76-c1e3ae352d74_781x367.png)



](https://substackcdn.com/image/fetch/$s_!M3Zo!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff92cbbe3-5006-422f-8e76-c1e3ae352d74_781x367.png)

A threat model is a way to ask one simple question:

> _“If someone wanted to break this system, how would they do it?”_

-   You start by listing what needs protection.
    
-   Then you list who might try to attack it.
    
-   After that, you look at every entry point and imagine how each one can be abused.
    

This exercise slows you down usefully… Instead of thinking like a feature builder, you think like someone who wants to cause damage.

STRIDE[5](#footnote-5) helps because it gives you a pattern to follow:

-   Spoofing,
    
-   Tampering,
    
-   Repudiation,
    
-   Information disclosure,
    
-   Denial of service,
    
-   Elevation of privilege.
    

These six ideas cover most real attacks you will face.

A good threat model changes how you write code. You stop trusting defaults and start questioning everything.

### **3\. CIA Triad**

[

![](https://substackcdn.com/image/fetch/$s_!_h8I!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3956161d-730d-488a-bd5b-16b7fdf49e66_777x370.png)



](https://substackcdn.com/image/fetch/$s_!_h8I!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3956161d-730d-488a-bd5b-16b7fdf49e66_777x370.png)

> Almost every security decision goes back to three simple ideas: _confidentiality, integrity, and availability._

If something breaks, one of these usually takes the hit:

1.  **Confidentiality** means data is seen only by the people who are allowed to see it. Lose this, and you have leaks, exposure, and headlines.
    
2.  **Integrity** means the data stays unchanged. If someone can alter values, switch IDs, or modify a record without detection, the entire system becomes unreliable.
    
3.  **Availability** means your system stays reachable when it matters. A slow service, a blocked queue, or a failed cluster can be just as damaging as a data leak.
    

The CIA triad is not a checklist… It’s a lens.

It helps you judge decisions fast and see where the system is weak before someone else does.

* * *

## **Identity and Access**

Let’s keep going!

### **4\. Authentication**

[

![](https://substackcdn.com/image/fetch/$s_!HQcV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3f17eccc-0686-4247-ac48-5c268df5b178_788x395.png)



](https://substackcdn.com/image/fetch/$s_!HQcV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3f17eccc-0686-4247-ac48-5c268df5b178_788x395.png)

> Authentication answers the first question any system needs to ask:
> 
> _“Who are you?”_

The common methods include:

-   Passwords
    
-   Multi-factor prompts[6](#footnote-6)
    
-   Passkeys[7](#footnote-7)
    
-   OAuth logins[8](#footnote-8)
    
-   Single sign-on for large orgs
    

The trouble usually lies in how passwords are handled.

-   Storing them in plain text.
    
-   Using weak hashing.
    
-   Forgetting to rotate secrets[9](#footnote-9).
    

Even token systems fail when teams treat access tokens as permanent keys rather than temporary proof.

A good system protects secrets, rotates them frequently, and never trusts a single factor. The goal is simple. Make it hard for anyone to pretend to be someone else, even if one layer gets exposed.

### **5\. Authorisation**

[

![](https://substackcdn.com/image/fetch/$s_!TXg9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faea11d47-6076-465a-93ff-e1e5718fb05e_774x345.png)



](https://substackcdn.com/image/fetch/$s_!TXg9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faea11d47-6076-465a-93ff-e1e5718fb05e_774x345.png)

> Once you know who someone is, the next question is simple:
> 
> _What can you do here?_

This is where authorisation steps in…

Two common models drive this:

1.  Role-based access control (**RBAC**), where users get permission sets based on their job.
    
2.  Attribute-based access control (**ABAC**), where rules depend on user traits, system state, or resource details.
    

Most breaches happen here, not in authentication.

The classic example is Insecure Direct Object Reference (**IDOR**).

A user changes an ID in a URL and suddenly sees data they shouldn't. Broken access control also shows up in hidden admin endpoints, weak object checks, and trust in client-side logic.

Strong authorisation means checking permissions at every step and treating every action as something that must be earned, not assumed.

> NOTE: Want to read more on this?
> 
> Look up “NIST RBAC” for role-based models and “OWASP IDOR” for real-world access control failures.

### **6\. Least Privilege**

[

![](https://substackcdn.com/image/fetch/$s_!I6hO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fac1c673b-083b-4af9-b464-e702a52003c7_776x381.png)



](https://substackcdn.com/image/fetch/$s_!I6hO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fac1c673b-083b-4af9-b464-e702a52003c7_776x381.png)

Least privilege is the idea that every user, service, and internal tool should have only the minimum access needed to do their job.

Nothing more.

Nothing extra.

But why so?

-   An overpowered internal dashboard becomes dangerous if a single account gets compromised.
    
-   A microservice with broad database access rights can cause damage if a bug or exploit lets someone execute unsafe queries.
    
-   A Lambda function[10](#footnote-10) with full admin rights can turn a minor misconfiguration into a complete system breach.
    

Attackers love over-permissioned systems…

It gives them room to move sideways and escalate. Least privilege cuts off that movement.

Good teams review permissions often, trim them down, and treat every permission as a potential entry point.

* * *

## **Core Defenses**

Ready for the best part?

### **7\. Encryption (Symmetric and Asymmetric)**

[

![](https://substackcdn.com/image/fetch/$s_!Oc_D!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe1377495-5aeb-4f91-9f23-b27ce10f3142_864x286.png)



](https://substackcdn.com/image/fetch/$s_!Oc_D!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe1377495-5aeb-4f91-9f23-b27ce10f3142_864x286.png)

Encryption protects data by turning readable text into something unreadable without the right key.

Two approaches to encryption usually dominate systems today:

**1\. Symmetric encryption**

One key is used for both locking and unlocking the data.

AES (Advanced Encryption Standard) is the common choice in modern systems. It is a fast, well-tested symmetric cipher used almost everywhere today.

_Use case:_ encrypting files, tokens, database fields, and anything that needs high performance without too much overhead.

**2\. Asymmetric encryption**

Two keys are used: a public key to lock the data and a private key to unlock it. RSA (Rivest–Shamir–Adleman) is a common example.

_Use case:_ secure key exchange, digital signatures, and verifying identity.

What engineers often get wrong:

-   Storing keys on GitHub
    
-   Hard-coding keys inside the source code
    
-   Keeping private keys on application servers
    

A leaked key brings the entire system down.

Encryption is strong only when the keys stay protected.

### **8\. Hashing**

[

![](https://substackcdn.com/image/fetch/$s_!jJN-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F29ee6317-25cd-40c1-bce1-4352cc4b072b_779x266.png)



](https://substackcdn.com/image/fetch/$s_!jJN-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F29ee6317-25cd-40c1-bce1-4352cc4b072b_779x266.png)

Hashing takes an input and produces a fixed-length output.

It cannot be reversed. And that is the entire point.

This is why hashing is used for passwords and integrity checks.

For passwords, use:

-   bcrypt[11](#footnote-11)
    
-   scrypt[12](#footnote-12)
    
-   Argon2[13](#footnote-13)
    

These functions slow down brute-force attempts.

That slowdown protects your users.

Hashing is not encryption because you can never unlock the original value. This is why storing hashed passwords is safe even if the database leaks, as long as strong hash functions are used.

Old hash algorithms like MD5 and SHA-1 are no longer safe!

They produce patterns attackers can crack in seconds with cheap hardware.

If you see them in a codebase, replace them before anything else.

### **9\. TLS/HTTPS**

[

![](https://substackcdn.com/image/fetch/$s_!Erhk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe50d535e-28b3-41e2-98eb-c9e84d4bc376_745x293.png)



](https://substackcdn.com/image/fetch/$s_!Erhk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe50d535e-28b3-41e2-98eb-c9e84d4bc376_745x293.png)

TLS (Transport Layer Security) is the protocol that protects data as it moves over the network.

When you see HTTPS, it usually means two things are happening:

1.  The server is proving it is the server you expect.
    
2.  The data is encrypted, so nobody can read or modify it while it travels.
    

Certificates make this trust possible.

Your browser checks them before sending anything sensitive. If the certificate is fake, expired, or signed by an unknown source, the browser blocks the connection.

A **man-in-the-middle attack** occurs when someone sits between you and the server, pretending to be both sides. TLS helps prevent this by validating certificates and creating a secure tunnel that outsiders cannot tamper with.

With TLS in place, logins, tokens, and cookies are much safer on the network than they would be on plain HTTP.

* * *

## **Network-Level Security**

Let’s dive in!

### **10\. Firewall**

[

![](https://substackcdn.com/image/fetch/$s_!g5_g!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffbb18d88-3ead-4f61-bbdc-e5d268062b3e_1600x548.png)



](https://substackcdn.com/image/fetch/$s_!g5_g!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffbb18d88-3ead-4f61-bbdc-e5d268062b3e_1600x548.png)

A firewall filters traffic before it reaches your system… Think of it as a guard that decides what gets in and what gets blocked.

There are a few layers to this:

1.  Network firewalls check IPs, ports, and protocols. Example: only allow traffic on port 443.
    
2.  Web application firewalls look deeper into requests. They block SQL injection[14](#footnote-14), XSS patterns[15](#footnote-15), and abnormal payloads.
    
3.  Cloud rule sets add another layer by tying access to identity, region, or service type.
    

Firewalls stop a lot of noise. Port scans. Random bots. Known malicious patterns.

> But they fail when the rules are too open:
> 
> _A single “allow all” entry wipes out the entire benefit._

Strong teams keep rules tight and review them often.

### **11\. Zero Trust**

[

![](https://substackcdn.com/image/fetch/$s_!tYqk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbe34cdad-9324-495d-a78c-3301c17d09d1_766x340.png)



](https://substackcdn.com/image/fetch/$s_!tYqk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbe34cdad-9324-495d-a78c-3301c17d09d1_766x340.png)

> Zero trust works on one simple idea: trust nothing by default.

Every request must prove itself, even if it comes from inside the company network.

Key points:

-   Identity matters more than location
    
-   Every action is verified
    
-   Internal networks are treated like the public internet
    

Google pushed this culture shift with BeyondCorp[16](#footnote-16).

They moved from “once you’re in the office, you’re trusted” to “every request must earn trust.” It changed how companies think about internal attacks, phishing, and compromised laptops.

Zero trust closes a blind spot… Attackers often enter through a stolen laptop or an employee’s exposed key.

With zero trust, that first step doesn’t automatically give them access to the rest of the system.

### **12\. VPN**

[

![](https://substackcdn.com/image/fetch/$s_!alc_!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff854218-e3a4-40ab-9b2d-c0e82608f667_774x344.png)



](https://substackcdn.com/image/fetch/$s_!alc_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff854218-e3a4-40ab-9b2d-c0e82608f667_774x344.png)

> A Virtual Private Network (**VPN**) creates a private tunnel between a device and the company network.

It solves one problem well: letting remote workers access internal systems safely.

But it comes with limits:

-   Once someone is in, they often have access to far more than they need
    
-   A stolen VPN key gives attackers the same access as an actual employee
    
-   Internal systems can be exposed if VPN rules are poorly configured
    

This is why many teams still rely on VPNs but combine them with other layers:

-   Short-lived access tokens
    
-   Network segmentation
    
-   Device checks
    

VPNs are useful, but they are only one part of a security plan.

On their own, they mostly move the gate instead of reducing how much damage someone can do if they slip through.

* * *

## **Application-Level Risks**

Let’s keep going!

### **13\. SQL Injection**

[

![](https://substackcdn.com/image/fetch/$s_!PDML!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5117178-e393-4daf-a5a4-056582dde6e7_766x339.png)



](https://substackcdn.com/image/fetch/$s_!PDML!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5117178-e393-4daf-a5a4-056582dde6e7_766x339.png)

SQL injection occurs when user input becomes part of a raw query.

An attacker changes the input in a way that alters the query itself. This can expose data, modify records, or wipe entire tables.

The safest fix is simple:

-   Use parametrised queries[17](#footnote-17)
    
-   Never build SQL strings by hand
    
-   Treat all input as untrusted
    

Many engineers think Object Relational Mapper[18](#footnote-18) (ORMs) protect them by default... Some do. Some don’t.

Plenty of large companies have been breached because a single query used string concatenation inside a rarely touched service.

An example: attackers added OR 1=1 to a login field, bypassing the entire auth check.

SQL injection is old, but it survives because busy teams take shortcuts.

### **14\. Cross-Site Scripting (XSS)**

[

![](https://substackcdn.com/image/fetch/$s_!L7pr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F25d1ba69-a66d-4305-87b0-03c67d3a6314_774x339.png)



](https://substackcdn.com/image/fetch/$s_!L7pr!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F25d1ba69-a66d-4305-87b0-03c67d3a6314_774x339.png)

XSS[19](#footnote-19) lets attackers run their own script on someone else’s browser.

There are three common forms:

1.  Reflected: the script comes from the user’s input and returns in the response
    
2.  Stored: script is saved in the database and hits every user who loads that data
    
3.  DOM based: the script appears through client-side code that handles input incorrectly
    

> The fix is simple: escape your output.

Not your input, but your output.

Escaping turns unsafe characters into safe ones before rendering. If you rely only on input sanitising, something will slip through.

XSS leads to stolen cookies, fake actions, and complete account takeovers.

### **15\. Cross-Site Request Forgery (CSRF)**

[

![](https://substackcdn.com/image/fetch/$s_!Vd1U!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba3068b3-1ac3-4745-8500-4464cc2795df_766x333.png)



](https://substackcdn.com/image/fetch/$s_!Vd1U!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba3068b3-1ac3-4745-8500-4464cc2795df_766x333.png)

CSRF[20](#footnote-20) tricks a user’s browser into performing an action they didn’t mean to perform.

For example, a hidden form that submits a money transfer while the user is logged in. The browser automatically sends cookies, so the action appears real.

Protection methods:

-   CSRF tokens that must match
    
-   Same site cookies, so cross-site requests don’t include session data
    
-   Requiring re-authentication for sensitive actions
    

Modern browsers help a lot, but not all systems use the right cookie settings.

A single misconfigured session cookie can allow attackers to perform actions on behalf of real users.

### **16\. Server Side Request Forgery (SSRF)**

[

![](https://substackcdn.com/image/fetch/$s_!FUzk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49979b6d-052e-406f-9130-84d4a87632ec_773x330.png)



](https://substackcdn.com/image/fetch/$s_!FUzk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49979b6d-052e-406f-9130-84d4a87632ec_773x330.png)

SSRF[21](#footnote-21) happens when your server fetches a URL provided by the user.

If the fetch is not restricted, the attacker points it to internal addresses instead of public ones. This is how attackers reach cloud metadata services. Those endpoints often return temporary access keys.

A short URL fetch can turn into control over your cloud account.

Common causes:

-   Server-side URL previews
    
-   Image processing features
    
-   Webhooks that fetch external data
    

To prevent this, block internal IP ranges, restrict allowed protocols, and avoid raw URL fetches based on user input. SSRF looks small in code reviews, but becomes massive the moment it touches cloud infrastructure.

* * *

## **Modern Infrastructure Security**

Ready for the next technique?

### **17\. IAM (Identity and Access Management)**

[

![](https://substackcdn.com/image/fetch/$s_!ujLa!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b381c15-cc94-4c67-80f9-26b6a6b82f8f_769x336.png)



](https://substackcdn.com/image/fetch/$s_!ujLa!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b381c15-cc94-4c67-80f9-26b6a6b82f8f_769x336.png)

IAM controls who can do what inside your cloud account.

In AWS, this usually means policies attached to users, roles, and service accounts. The power of IAM lies in its precision. The danger lies in how easy it is to misconfigure.

Common issues:

-   Wildcard permissions like `s3: or ec2:`
    
-   Services running with admin-level rights
    
-   Temporary roles that become permanent
    
-   Trust policies that allow assume role abuse
    

Some of the biggest breaches in the last decade came from IAM mistakes, not fancy exploits.

One exposed key. One overpowered role. One forgotten policy.

Good IAM setups follow least privilege and review permissions often, especially for automated services.

### **18\. Secrets Management**

[

![](https://substackcdn.com/image/fetch/$s_!ufs3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f82fe7-b75b-4787-8de3-3c69db5b23c3_766x315.png)



](https://substackcdn.com/image/fetch/$s_!ufs3!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f82fe7-b75b-4787-8de3-3c69db5b23c3_766x315.png)

> Secrets are anything that gives access to something else: _Tokens, API keys, passwords, certificates._

Storing them in environment variables or inside code is risky. One log line, one crash report, or one compromised machine is enough to expose everything.

Better options include:

-   AWS Secrets Manager[22](#footnote-22)
    
-   Secret vaults[23](#footnote-23) like HashiCorp Vault
    
-   Encrypted parameters backed by KMS
    

These tools securely store secrets, automatically rotate them, and track access.

Rotation matters because even a well-protected secret becomes dangerous if it leaks and stays valid for months. A strong secrets setup assumes every machine can fail and protects secrets even in that event.

### **19\. Container Security**

[

![](https://substackcdn.com/image/fetch/$s_!yFVF!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14356568-824f-4b77-a479-a6cf4f63824f_768x336.png)



](https://substackcdn.com/image/fetch/$s_!yFVF!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14356568-824f-4b77-a479-a6cf4f63824f_768x336.png)

Containers[24](#footnote-24) are lightweight, but they come with risks that many teams ignore.

Good practices include:

-   Writing minimal Dockerfiles with only the required packages
    
-   Scanning dependencies for vulnerabilities
    
-   Running containers without root privileges
    
-   Using runtime isolation tools
    

Running containers as root is one of the biggest mistakes:

_“If someone breaks out of the container, they gain root access to the host.”_

Another common mistake is using heavy base images filled with outdated libraries.

Each extra package becomes another risk. Container security is about reducing what runs inside them and limiting what happens if something breaks.

* * *

## **Defensive Engineering**

### **20\. Rate Limiting**

[

![](https://substackcdn.com/image/fetch/$s_!06pr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5290d5aa-00f2-44f4-83c9-32dab3bffb4b_1530x670.png)



](https://substackcdn.com/image/fetch/$s_!06pr!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5290d5aa-00f2-44f4-83c9-32dab3bffb4b_1530x670.png)

Rate limiting controls how many requests a user or IP address can make in a time period.

It’s one of the simplest defenses, and one of the most effective. It stops brute-force attacks, credential stuffing, scraping, and API abuse.

The main techniques are:

-   Token bucket
    
-   Leaky bucket
    
-   Fixed window counters
    
-   Rate limits behind reverse proxies like Nginx or API gateways[25](#footnote-25)
    

Example: if someone tries 500 login attempts in 30 seconds, rate limiting blocks them before the password checks even run.

Without rate limits, every endpoint becomes a target for automated attacks.

### **21\. Logging and Monitoring**

[

![](https://substackcdn.com/image/fetch/$s_!mtMT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7dbccd9f-3f5a-4eef-9729-6f48e9b5a468_783x342.png)



](https://substackcdn.com/image/fetch/$s_!mtMT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7dbccd9f-3f5a-4eef-9729-6f48e9b5a468_783x342.png)

Logs tell you what happened when you weren’t looking. When an attack happens, logs become your last and strongest line of defense.

Tools and sources include:

-   Centralised logs
    
-   SIEM platforms[26](#footnote-26) (Security Information and Event Management)
    
-   CloudTrail[27](#footnote-27) for AWS actions
    
-   Audit logs of sensitive operations
    

Good monitoring is proactive.

You watch for unusual patterns:

-   A sudden spike in failed logins
    
-   A new IP hitting the admin endpoints
    
-   A service making calls it had never made before
    

Breaches rarely appear as dramatic warnings.

They appear as small hints hidden in logs. Teams that take logs seriously catch issues early… Teams that ignore them learn the hard way.

* * *

## **Conclusion**

Security is not something you hand off to another team.

It sits at the heart of every decision you make as an engineer. Each line of code, each API, each permission, each feature you ship creates new paths for someone curious or malicious to explore.

The terms you just read give you the foundation you need to think more clearly. They help you see how an attacker moves, how systems break, and how tiny mistakes become large failures at scale.

The next step is simple:

-   Look at the projects you already maintain.
    
-   Check the places where trust is assumed.
    
-   Check the places where input flows freely.
    
-   Check the parts that haven't been reviewed in months.
    

You will find weak spots. Every system has them.

That awareness is where security begins.

* * *

👋 I’d like to thank **[Saed](https://www.linkedin.com/in/saedf/)** for writing this newsletter!

Remember to explore his work here:

-   **[Instagram](https://www.instagram.com/saedctl)**
    
-   [LinkedIn](https://www.linkedin.com/in/saedf/)
    
-   **[Newsletter](https://secengweekly.substack.com/)**
    

He writes extensively about real-world security engineering, cloud infrastructure, and career growth in tech.

* * *

I launched **Design, Build, Scale** (newsletter series exclusive to PAID subscribers).

[

![](https://substackcdn.com/image/fetch/$s_!jG0C!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F63fca468-adce-4713-97a0-203c35bc1c60_1200x630.png)



](https://newsletter.systemdesign.one/subscribe?yearly=true)

When you upgrade, you’ll get:

-   **High-level architecture of real-world systems.**
    
-   Deep dive into how popular real-world systems actually work.
    
-   **How real-world systems handle scale, reliability, and performance.**
    

10x the results you currently get with 1/10th of your time, energy, and effort.

**👉 [CLICK HERE TO ACCESS DESIGN, BUILD, SCALE!](https://newsletter.systemdesign.one/subscribe?yearly=true)**

* * *

If you find this newsletter valuable, share it with a friend, and subscribe if you haven’t already. There are [group discounts](http://newsletter.systemdesign.one/subscribe?group=true), [gift options](http://newsletter.systemdesign.one/subscribe?gift=true), and [referral rewards](https://newsletter.systemdesign.one/leaderboard) available.

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

* * *

[

![Author Neo Kim; System design case studies](https://substackcdn.com/image/fetch/$s_!bEFk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f94ab8c-0d67-4775-992e-05e09ab710db_320x320.png "Author Neo Kim; System design case studies")



](https://www.linkedin.com/in/nk-systemdesign-one/)

**👋 Find me on [LinkedIn](https://www.linkedin.com/in/nk-systemdesign-one/) | [Twitter](https://x.com/intent/follow?screen_name=systemdesignone) | [Threads](https://www.threads.net/@systemdesignone) | [Instagram](https://www.instagram.com/systemdesignone/)**

* * *

**Want to reach 200K+ tech professionals at scale?** 📰

If your company wants to reach 200K+ tech professionals, [advertise with me](https://newsletter.systemdesign.one/p/sponsorship).

* * *

Thank you for supporting this newsletter.

You are now 200,001+ readers strong, very close to 201k. Let’s try to get 201k readers by 21 January. Consider sharing this post with your friends and get rewards.

Y’all are the best.

[

![system design newsletter](https://substackcdn.com/image/fetch/$s_!6oWl!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png "system design newsletter")



](https://substackcdn.com/image/fetch/$s_!6oWl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png)

[Share](https://newsletter.systemdesign.one/p/cybersecurity-fundamentals?utm_source=substack&utm_medium=email&utm_content=share&action=share)

[Read more](https://newsletter.systemdesign.one/p/cybersecurity-fundamentals)