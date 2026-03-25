---
title: "System Design Interview: Design Airbnb"
link: https://newsletter.systemdesign.one/p/airbnb-system-design
author: Neo Kim
publish_date: 2026-01-15 05:31:13
saved_date: 2026-01-17 15:10:02
image: https://substack-post-media.s3.amazonaws.com/public/images/fac466e9-137d-411d-aace-2160f80a7e3a_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/fac466e9-137d-411d-aace-2160f80a7e3a_1280x720.png)

Get my system design playbook for FREE on newsletter signup:

-   _[Share this post](https://newsletter.systemdesign.one/p/airbnb-system-design/?action=share) & I'll send you some rewards for the referrals._
    
-   _Block diagrams created using [Eraser](https://app.eraser.io/auth/sign-up?ref=neo)._
    

* * *

A hotel booking system like Booking.com or Airbnb is a common system design interview question.

It looks simple, right until it breaks in the worst way.

Two users click “Book” on the last available room in the same second. Your API does a `SELECT` check, so both requests see availability, and you charge two credit cards for one room. Next, you’re dealing with refunds, angry customers, and a system that can’t be trusted.

And that’s not a bug… That’s the default outcome if you don’t design it correctly.

This is why Airbnb and Booking.com aren’t just “tables + endpoints”.

Most developers jump straight into boxes and arrows without understanding the actual problems. They miss concurrency[1](#footnote-1) traps, forget double booking[2](#footnote-2), and can’t explain tradeoffs.

> In this newsletter, we’ll design it the way interviews and real traffic demand: with strong consistency for inventory, fast reads for search, and clear tradeoffs for caching and scaling.

But before we design anything, let’s zoom out, define the real problem, and lay out the approach step by step.

Onward.

* * *

### [Find out why 150K+ engineers read The Code twice a week (Partner)](https://codenewsletter.ai/subscribe?utm_source=nl_ad_system)

[

![](https://substackcdn.com/image/fetch/$s_!w80U!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe30ba00c-653e-421b-af50-f5b48536f36b_1271x699.jpeg)



](https://codenewsletter.ai/subscribe?utm_source=nl_ad_system)

Tech moves fast, but you’re still playing catch-up?

That’s exactly why 150K+ engineers working at Google, Meta, and Apple read [The Code](https://codenewsletter.ai/subscribe?utm_source=nl_ad_system) twice a week.

Here’s what you get:

-   **Curated tech news that shapes your career** \- Filtered from thousands of sources so you know what’s coming 6 months early.
    
-   **Practical resources you can use immediately** - Real tutorials and tools that solve actual engineering problems.
    
-   **Research papers and insights decoded** - We break down complex tech so you understand what matters.
    

All delivered twice a week in just 2 short emails.

**Sign up and get access to the Ultimate Claude code guide to ship 5X faster.**

[Join 150K+ Engineers](https://codenewsletter.ai/subscribe?utm_source=nl_ad_system)

(Thanks for partnering on this post and sharing the ultimate [claude code guide](https://codenewsletter.ai/subscribe?utm_source=nl_ad_system).)

* * *

I want to reintroduce [Hayk Simonyan](https://linkedin.com/in/hayksimonyan) as a guest author.

[

![](https://substackcdn.com/image/fetch/$s_!IuO8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb7b32914-3c35-4318-9bbb-79d41a466417_1200x630.png)



](https://youtube.com/@hayk.simonyan)

He’s a senior software engineer specializing in helping developers break through their career plateaus and secure senior roles.

If you want to master the essential system design skills and land senior developer roles, I highly recommend checking out Hayk’s **[YouTube channel](https://youtube.com/@hayk.simonyan)**.

His approach focuses on what top employers actually care about: system design expertise, advanced project experience, and elite-level interview performance.

* * *

Let’s dive in!

## **What You’ll Learn**

-   Design Requirements - How to scope the system
    
-   Back of the Envelope Calculations[3](#footnote-3) - Math that proves you understand scale
    
-   High-Level Design - System components and architecture
    
-   API Design - RESTful endpoints
    
-   Data Model - Schema decisions that matter
    
-   Handling Concurrency - Real approaches that work in production
    
-   Scaling the System - What happens when you hit real traffic
    
-   Handling Failures and Edge Cases - Problems that break systems
    

* * *

## **Design Requirements**

Every well-architected system design starts with constraints.

If you skip this step, everything that follows is guesswork.

### **Clarifying Questions**

Here are some clarifying questions we’ll ask about the design requirements.

-   **Scale**:
    
    -   How many hotels?
        
    -   How many rooms in total?
        
    -   Single chain or platform like Booking.com?
        
-   **Payment timing**:
    
    -   Pay at booking or check-in?
        
-   **Booking channels**:
    
    -   Web only?
        
    -   Mobile apps?
        
    -   Phone reservations?
        
-   **Cancellation**:
    
    -   Can users cancel?
        
    -   What’s the policy?
        
-   **Overbooking**[4](#footnote-4):
    
    -   Do we support it? (Hotels typically allow 5-10% overbooking)
        
-   **Dynamic pricing**:
    
    -   Does the room price change based on demand/date?
        

With these constraints clarified, we can now define what the system must actually do.

### **Functional Requirements**

-   **Hotel Management**: Admins can add, update, and remove hotels and room types. They adjust pricing and inventory[5](#footnote-5).
    
-   **Search & Discovery**: Users can search for hotels by location, dates, guest count, price range, and amenities.
    
-   **Reservation Flow**: Users can book rooms, view reservations, and cancel bookings. The system should prevent double bookings.
    
-   **Payment Processing**: Integrate with payment gateways. And handle failures gracefully.
    
-   **Notifications**: Send confirmations for bookings, cancellations, and payments.
    

Functional requirements define behavior, while non-functional requirements determine whether the system can withstand real traffic.

### **Non-Functional Requirements**

-   **Strong Consistency**: Two users cannot book the same room for the same dates. Non-negotiable.
    
-   **High Concurrency**: Handle thousands of users trying to book the same hotel simultaneously.
    
-   **Low Latency**: Search results under 500ms. Booking confirmation in 2-3 seconds.
    
-   **High Availability**: 99.9%+ uptime.
    
-   **Scalability**: Scale horizontally without redesigning the system.
    

Now that we know what the system must support, let’s start with back-of-the-envelope calculations.

* * *

## **Back of the Envelope Calculations**

Booking Holdings reported over 1.1 billion room nights[6](#footnote-6) in 2024.

Let’s turn that into usable numbers:

### **Assumptions**

-   Room nights per year: 1.1 billion
    
-   Average stay: 2 nights per booking
    
-   Days per year: 365
    

### **Daily Reservations and TPS**

**Bookings per year:**

-   1.1B room nights / 2 nights per booking ≈ 550M bookings/year
    

**Bookings per day:**

-   550M / 365 ≈ 1.5M bookings/day
    

**Bookings per second (TPS**[7](#footnote-7)**):**

-   1.5M / 86,400 ≈ 17 bookings/second
    

**At Booking.com scale:**

-   ~1.5 million bookings per day
    
-   ~17 bookings per second on average
    

### **Traffic Funnel and Read QPS**

Similarweb shows ~516.5 million visits per month to booking.com with about 7.56 pages per visit.

**Visits per day:**

-   516.5M / 30 ≈ 17M visits per day
    

**Visits per second:**

-   17M / 86,400 ≈ 200 visits per second
    

_If we assume around 5 backend reads per visit (search queries, availability checks, pricing):_

-   Backend read QPS[8](#footnote-8) ≈ 200 visits/s × 5 ≈ 1,000 read requests per second
    

**Key insights**:

-   This is strongly read-heavy.
    
-   You handle around 1,000 read QPS and only ~17 write TPS.
    
-   Your architecture should optimize for reads while keeping writes consistent.
    

### **Storage Estimation**

For the inventory table, tracking availability by room type and date.

**Assume:**

-   Average hotel occupancy: 70%
    
-   Room nights sold per year: 1.1B
    

**Total annual capacity:**

-   1.1B / 0.7 ≈ 1.57B room nights/year
    

**Total rooms on the platform:**

-   1.57B / 365 ≈ 4.3M rooms
    

If an average hotel has 50 rooms:

-   ~85,000 hotels globally
    

Room type inventory table rows:

-   Hotels: ~85,000
    
-   Average room types per hotel: 10
    
-   Horizon: 2 years = 730 days
    

Rows:

-   85,000 × 10 × 730 ≈ 620M rows
    

Assuming each row is around 100 bytes:

-   Storage ≈ 620M × 100 bytes ≈ 62 GB of raw data
    

**Reality check**:

With indexes (typically 2-3x table size), related tables (reservations, hotels, guests), you’re looking at 500GB+ total.

So you need a proper ‘sharding and indexing strategy’.

* * *

## **High-Level Design**

With the scale and data size understood, we can design an architecture that actually fits these numbers…

We’re using a service-oriented architecture with clear boundaries, but keeping “tightly coupled” data on the same database.

### **Core Components**

[

![](https://substackcdn.com/image/fetch/$s_!I8Be!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe657d908-5270-4bc2-b54c-dbdd9e7b4dc3_1600x1049.png)



](https://substackcdn.com/image/fetch/$s_!I8Be!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe657d908-5270-4bc2-b54c-dbdd9e7b4dc3_1600x1049.png)

**Client Layer**

-   Web and mobile apps
    
-   CDN for static assets (images, JavaScript, hotel photos)
    

**API Gateway**

-   Single entry point
    
-   Authentication, rate limiting, request routing
    
-   Load balancing across service instances
    

**Services**

-   **Hotel Service**: Hotel and room information. Mostly static, heavily cacheable.
    
-   **Rate Service**: Room pricing by date. Dynamic pricing based on demand.
    
-   **Reservation Service**: Handles booking logic, inventory checks, and reservation creation/cancellation. This is where concurrency matters.
    
-   **Payment Service**: Integrates with payment gateways. Updates the reservation status.
    
-   **Notification Service**: Sends emails and push notifications.
    
-   **Search Service**: Manages Elasticsearch[9](#footnote-9) integration for hotel discovery.
    

**Data Layer**

-   **PostgreSQL**: Primary transactional store. ACID guarantees[10](#footnote-10).
    
-   **Redis**: Cache for hot data.
    
-   **Elasticsearch**: Search functionality (full-text, geospatial, filtering).
    

### **Why This Architecture?**

Once services and boundaries are clear, the next step is defining how clients and services interact…

> At this scale, a pure monolith or a full microservices setup would be suboptimal.

A single monolith simplifies transactions but becomes hard to scale and deploy independently. Full microservices with separate databases introduce distributed transactions and consistency problems that don’t exist at this traffic level.

This design uses service-level separation with shared transactional data for tightly coupled domains (reservations + inventory). It maintains deployment flexibility while preserving strong consistency where it matters most.

Each service owns its domain and scales independently.

Hotel Service might need 10 instances for search traffic, while Reservation Service only needs 3 since booking TPS is low.

**Critical decision**:

Reservation and inventory data live in the same database.

This lets us use local ACID transactions instead of distributed transactions. We have service-level separation at the application layer, but shared data for tightly coupled entities.

This is pragmatic.

Distributed transactions add massive complexity for minimal benefit here. The alternative (separate DBs with saga patterns or 2PC) is overkill when you can keep related data together.

**Alternative:**

Split reservations and inventory into separate databases and coordinate with Saga patterns[11](#footnote-11) or Two-Phase Commit[12](#footnote-12) (**2PC**).

2PC provides strong consistency but adds latency, blocking, and failure complexity. A coordinator failure can stall the system.

Saga patterns avoid locking but introduce eventual consistency[13](#footnote-13), compensating actions, and complex failure handling. This is risky for user-facing booking flows where “eventually consistent” means angry users.

At ~17 write TPS, the added complexity is not justified… Local ACID transactions are simpler, safer, and faster.

* * *

## **API Design**

RESTful APIs for all operations:

#### **Hotel APIs (Admin)**

-   `GET /v1/hotels/{id}` - Get hotel details
    
-   `POST /v1/hotels` - Add a new hotel (admin only)
    
-   `PUT /v1/hotels/{id}` - Update hotel info (admin only)
    
-   `DELETE /v1/hotels/{id}` - Remove hotel (admin only)
    

#### **Room Type APIs (Admin)**

-   `GET /v1/hotels/{id}/rooms/{id}` - Get room type details
    
-   `POST /v1/hotels/{id}/rooms` - Add room type (admin only)
    
-   `PUT /v1/hotels/{id}/rooms/{id}` \- Update room type (admin only)
    
-   `DELETE /v1/hotels/{id}/rooms/{id}` \- Delete room type (admin only)
    

#### **Reservation APIs**

-   `GET /v1/reservations` - Get the user’s reservation history
    
-   `GET /v1/reservations/{id}` - Get specific reservation details
    
-   `POST /v1/reservations` - Create a new reservation
    
-   `DELETE /v1/reservations/{id}` - Cancel reservation
    

#### **Search API**

-   `GET /v1/search`
    
-   Parameters: location, checkIn, checkOut, guests, beds, priceRange
    
-   Returns: available hotels and room types
    

### **Critical Detail for Reservations**

`POST /v1/reservations` request includes an idempotency key[14](#footnote-14):

[

![](https://substackcdn.com/image/fetch/$s_!ax2W!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2d1b2b74-6169-4544-8e2d-68a5814e2c47_1097x652.png)



](https://substackcdn.com/image/fetch/$s_!ax2W!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2d1b2b74-6169-4544-8e2d-68a5814e2c47_1097x652.png)

This `reservationId` is generated on the frontend and prevents double bookings when users click submit many times.

APIs define behavior, but the data model determines whether the system can enforce correctness.

Let’s keep going!

* * *

## **Data Model**

> Here’s a critical insight:

[Read more](https://newsletter.systemdesign.one/p/airbnb-system-design)