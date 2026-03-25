---
title: 21 Frontend System Design Concepts for Software Engineers
link: https://newsletter.systemdesign.one/p/frontend-system-design
author: Neo Kim
publish_date: 2025-11-11 04:58:42
saved_date: 2026-01-17 15:10:04
image: https://substack-post-media.s3.amazonaws.com/public/images/f4bf7078-9dfa-4bf9-a47b-13a7dcd6d756_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/f4bf7078-9dfa-4bf9-a47b-13a7dcd6d756_1280x720.png)

Get my system design playbook for FREE on newsletter signup:

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

-   _[Share this post](https://newsletter.systemdesign.one/p/frontend-system-design/?action=share) & I'll send you some rewards for the referrals._
    

* * *

If you’re coming from the backend, you probably think the frontend is just “HTML, CSS, maybe some JavaScript.” But honestly? Modern frontend engineering has grown into something much closer to backend system design.

Just like your APIs need to be fast, scalable, and reliable, frontend apps also have to handle millions of users, load content quickly, and stay observable and secure.

This newsletter is a quick introduction to frontend system design.

We’ll take concepts you already know from the backend, like caching, deployment pipelines, observability, and security, and see how they apply in the browser.

By the end, you’ll see that the frontend isn’t just about buttons and forms. It’s about building systems that run right in the user’s browser.

Onward.

* * *

### [Supercharge AI Coding With Your Team’s Context (Sponsored)](https://getunblocked.com/?utm_source=systemdesign&utm_medium=email&utm_campaign=landing)

[

![](https://substackcdn.com/image/fetch/$s_!SLlU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda084dba-1ba8-4c0f-a887-94360275bd08_2800x1692.png)



](https://getunblocked.com/?utm_source=systemdesign&utm_medium=email&utm_campaign=landing)

Your AI tools are only as good as the context they have. **[Unblocked](https://getunblocked.com/?utm_source=systemdesign&utm_medium=email&utm_campaign=landing)** connects your code, docs, and conversations so Cursor, Claude, and Copilot finally understand your system like your best engineer.

[Start a free trial](https://getunblocked.com/?utm_source=systemdesign&utm_medium=email&utm_campaign=landing)

* * *

I want to introduce [Shefali Jangid](https://x.com/Shefali__J) as a guest author.

[

![](https://substackcdn.com/image/fetch/$s_!9raK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Facd58707-3a96-4850-a5f0-6e3bd8429d06_1200x630.png)



](https://x.com/Shefali__J)

She’s a web developer, technical writer, and content creator with a love for frontend architecture and building things that scale.

Check out her work and socials:

-   [Shefali.dev](https://shefali.dev/)
    
-   [GitHub](https://github.com/WebdevShefali)
    
-   [Twitter](https://x.com/Shefali__J)
    

You’ll often find her writing about web development, sharing UI tips, and building tools that make developers’ lives easier.

* * *

## **Rendering & Delivery Models**

One of the first things to understand is how webpages reach your users.

The way you build and load them affects how fast, reliable, and smooth your site feels. You can pre-build pages, render them on the server, build them in the browser, or mix these approaches.

Building web pages works much like a server handles API responses. The trade-offs change depending on when and where the HTML gets generated.

Let’s start with pre-built pages and move to fully dynamic ones. We’ll see how each affects speed, scalability, and content freshness.

### **1 Static Site Generation (SSG)**

Before SSG, websites worked in two fundamental ways. The server either built the page for every request, or the browser built it on the client side. That means:

-   Every request needed work to generate the page.
    
-   Pages could get slow if many people visit at once.
    
-   Caching was tricky, so scaling was hard.
    

SSG solves this by pre-building the HTML when you deploy your site. The system can fetch data during the build process, even for pages with dynamic content, which means all content is baked into static HTML files before any user visits them.

During the build process, the framework executes data-fetching code, queries your database, and generates complete HTML files for each route. The framework then uploads them to your CDN or hosting provider.

When users request a page, they receive a fully formed HTML document immediately, without waiting for server-side processing or client-side data fetching.

This makes SSG super fast for users because there’s no rendering delay. The trade-off is that if your content changes, you’ll need to rebuild and redeploy to update the static files, which is why SSG works best for content that doesn’t change frequently.

It’s like preparing API responses in advance; the hard work is done before anyone asks.

[

![](https://substackcdn.com/image/fetch/$s_!TVnQ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5e0f5ca9-d510-4c4e-90f5-f2f4540f6a9b_2222x777.png)



](https://substackcdn.com/image/fetch/$s_!TVnQ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5e0f5ca9-d510-4c4e-90f5-f2f4540f6a9b_2222x777.png)

**Why it matters:**

-   Pages load super fast.
    
-   Easy to handle millions of users.
    
-   SEO is better because pages get fully rendered from the start.
    

**Use case:**

Documentation sites, marketing landing pages, or personal blogs where content updates happen through deployments, not user actions.

### **2 Incremental Static Regeneration (ISR)**

Static Site Generation (SSG) is fast, but what if your content changes frequently? Rebuilding the whole site every time would be a pain.

That’s where Incremental Static Regeneration (ISR) comes in.

Pages are still pre-built, but they can update automatically without a full redeploy.

You just set a revalidation time; after that period, the next visitor triggers a background rebuild of that specific page on the server, not a full deployment. The old version loads instantly, so users don’t wait. After regeneration, the new version replaces the cached one. This occurs per page, not site-wide, allowing you to set different revalidation intervals for individual pages.

It’s like cached API responses with an expiry timer; users might glimpse an older version until it’s refreshed, but the update happens quietly behind the scenes.

[

![](https://substackcdn.com/image/fetch/$s_!JZ0g!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7e342437-67ac-47e3-b3f4-35fa0c59c43f_2222x742.png)



](https://substackcdn.com/image/fetch/$s_!JZ0g!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7e342437-67ac-47e3-b3f4-35fa0c59c43f_2222x742.png)

**Why it matters:**

-   Just as fast as SSG, but the content stays fresh.
    
-   Perfect for dynamic websites like blogs or e-commerce sites.
    
-   Works with CDNs, so updates happen without downtime.
    

**Use case:**

E-commerce product pages where most content (e.g., descriptions or images) is static, but some parts, like prices or stock info, update occasionally.

ISR keeps the page fresh without full redeploys, while real-time data, such as live prices, can come from APIs.

### **3 Server-Side Rendering (SSR)**

Server-Side Rendering (SSR) works the other way around: the server builds the page for each request. It fetches the data, generates the HTML, and sends it to the user.

Unlike Static Site Generation (SSG), which is great for mostly static pages, SSR is useful when content needs to stay fresh or personalised. For example, dashboards, user profiles, or live feeds. Because the system generates pages in real time, they always display the latest data instead of relying on pre-built files.

Think of it like a regular API endpoint; everything gets computed on demand.

[

![](https://substackcdn.com/image/fetch/$s_!d1KP!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F460d29a1-f3d4-46d9-96f5-17d1570f0b17_2222x795.png)



](https://substackcdn.com/image/fetch/$s_!d1KP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F460d29a1-f3d4-46d9-96f5-17d1570f0b17_2222x795.png)

**Why it matters:**

-   Keeps content fresh and easy to personalise.
    
-   Perfect for pages that need real-time data or personalised content.
    

**Note:** Under heavy traffic, SSR can slow down because it builds each page on demand, but caching can help balance load and speed.

**Use case:**

Social media feeds, admin dashboards, or user-specific pages where content varies by session.

### **4 Client-Side Rendering (CSR)**

CSR means the browser does most of the work instead of the server. The server sends only a basic HTML page and some JavaScript. The browser then loads the data and builds the page on the fly.

This approach is useful when you need rich interactivity, real-time updates, or pages that change often based on user actions - things that static or server-rendered pages can’t handle easily.

Think of it like sending raw JSON and letting the client put it together.

[

![](https://substackcdn.com/image/fetch/$s_!jV36!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fecaf5033-0fa6-4209-b91e-0c6b2645e8b8_2222x764.png)



](https://substackcdn.com/image/fetch/$s_!jV36!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fecaf5033-0fa6-4209-b91e-0c6b2645e8b8_2222x764.png)

**Note:** The first page load can be slower because the browser needs to download and run JavaScript before showing the content. Since pages get built in the browser, search engines might not see them immediately, so you might need extra setup like pre-rendering or server-side rendering for better SEO.

**Why it matters:**

-   Reduces pressure on the server.
    
-   Makes the app more interactive and responsive.
    
-   Works best for apps people use for a long time, like dashboards or editors.
    

**Use case:**

Complex apps like Figma, Notion, or Google Docs, where the app is highly interactive and users stay on the page for extended sessions.

### **5 Hybrid Rendering**

Sometimes, one approach just isn’t enough.

Different parts of your app might have different needs. For example, some pages stay mostly the same, while others need fresh or personalised data. That’s where hybrid rendering comes in.

It mixes different strategies:

-   Server-side rendering (SSR) for pages that need live or personalised content,
    
-   Static site generation (SSG) for pages that rarely change,
    
-   And client-side rendering (CSR) for sections with lots of interactivity.
    

Think of it like combining pre-computed API responses with on-demand endpoints - all in the same system.

[

![](https://substackcdn.com/image/fetch/$s_!gByI!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3e097d75-d6e9-438d-9d48-3592e0d277d7_2222x1231.png)



](https://substackcdn.com/image/fetch/$s_!gByI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3e097d75-d6e9-438d-9d48-3592e0d277d7_2222x1231.png)

**Why it matters:**

-   You get the best of everything: speed, fresh content, and interactivity.
    
-   Allows you to choose the right approach for each page or component.
    
-   Reduces overloading the server while keeping content dynamic where needed.
    

**Use case:**

Large-scale apps like e-commerce platforms often combine different rendering strategies:

-   The homepage and category pages use static generation for speed.
    
-   Product pages use incremental static regeneration to keep content fresh.
    
-   User account pages use server-side rendering for personalised data.
    
-   The shopping cart uses client-side rendering for real-time updates without page reloads.
    

### **6 Content Delivery Networks (CDNs) & Edge Delivery**

No matter which rendering method you choose, serving content efficiently is super important. CDNs keep copies of your static files on servers worldwide. This lets users download them from a nearby location instead of your main server.

This is especially useful for global audiences. For example, when someone in India visits a site hosted in the US, the CDN delivers the content from a local server, making it load much faster.

Edge rendering takes this idea a step further. Instead of just serving static files, it can actually run code or build pages at the edge, closer to the user, which reduces latency even more.

Think of it like having caches and compute nodes near your users, so requests go to a nearby server instead of your main database.

[

![](https://substackcdn.com/image/fetch/$s_!zV8l!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fec91e87f-86de-43b0-a4fd-a7f6c96fcbf8_2222x825.png)



](https://substackcdn.com/image/fetch/$s_!zV8l!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fec91e87f-86de-43b0-a4fd-a7f6c96fcbf8_2222x825.png)

**Why it matters:**

-   Faster load times everywhere.
    
-   Easy to scale to millions of users.
    
-   Works perfectly with SSG, ISR, SSR, or hybrid setups.
    

**Use case:**

Any globally distributed application. Media sites like The New York Times use CDNs to serve articles instantly worldwide.

* * *

## **Performance & Optimisation**

Now that you understand how your pages get rendered, the next obvious question is, “_How quickly do they actually load?_”

Even the most beautiful app can be frustrating if it takes too long to open or lags while being used. In frontend system design, speed really matters.

Let’s dive in!

### **7 Web Performance Metrics**

To really understand your app’s speed, there are a few key metrics you should watch closely:

-   **TTFB (Time to First Byte):** The time it takes for your browser to get the first piece of data back from the server or CDN after making a request.
    
-   **FCP (First Contentful Paint):** The moment when something first appears on the screen, like text, an image, or a button, so the user knows the page is loading.
    
-   **LCP (Largest Contentful Paint):** The time it takes for the main part of the page, like a large image or headline, to fully appear on the screen.
    
-   **CLS (Cumulative Layout Shift):** It measures how much the page layout jumps around while loading, like when text or buttons suddenly shift because images or ads are still loading.
    

These are basically the frontend versions of response time, throughput, and latency in backend systems. It’s important to keep a close eye on them; users can notice even minor delays of a few hundred milliseconds.

[

![](https://substackcdn.com/image/fetch/$s_!g9z9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8c33f370-32ca-4a57-b187-f71dbd7d6483_2222x1360.png)



](https://substackcdn.com/image/fetch/$s_!g9z9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8c33f370-32ca-4a57-b187-f71dbd7d6483_2222x1360.png)

**Why it matters:**

-   You can spot slow pages before users even notice.
    
-   Improves engagement and reduces bounce rates.
    
-   Helps guide your optimisations for a smoother experience.
    

**Use case:**

E-commerce sites must optimise for LCP (product images) and CLS (avoid layout shifts during checkout). News sites focus on FCP to show headlines quickly.

### **8 Lazy Loading**

Of course, fast pages aren’t just about metrics; they’re also about smart resource management.

Not everything on a page needs to load immediately. Lazy loading means loading heavy assets, like images, videos, or big components, only when they’re actually needed.

This works by using techniques like the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) or conditional imports, which tell the browser to fetch those resources only when they come into view or are triggered by user interaction.

It’s like fetching extra data from an API only when the user asks for it.

[

![](https://substackcdn.com/image/fetch/$s_!Z970!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4d9b42f4-7fa4-4ab1-afa6-9481d99482bf_2222x825.png)



](https://substackcdn.com/image/fetch/$s_!Z970!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4d9b42f4-7fa4-4ab1-afa6-9481d99482bf_2222x825.png)

**Why it matters:**

-   Cuts down the initial load time.
    
-   Makes the pages feel faster and smoother.
    
-   Saves bandwidth for users who don’t need everything immediately.
    

**Use case:**

Image-heavy sites like Pinterest or Instagram use lazy loading extensively; images below the fold don’t load until you scroll.

### **9 Service Workers & Caching**

Once you’ve optimised loading, you can make your app faster and more reliable using service workers and caching.

Service workers are background scripts that run in a separate thread from your main web page. They can intercept network requests and cache important files or data, helping your app load faster and even work offline.

Think of them as a smart middle layer between the browser and the network; if something is already cached, it’s served instantly instead of being fetched again.

[

![](https://substackcdn.com/image/fetch/$s_!R0l9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9e53e2bc-9448-4ec2-89f4-3299fd4d8cf0_2222x830.png)



](https://substackcdn.com/image/fetch/$s_!R0l9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9e53e2bc-9448-4ec2-89f4-3299fd4d8cf0_2222x830.png)

**Why it matters:**

-   Speeds up repeat visits.
    
-   Reduces the load on servers.
    
-   Keeps apps usable even with poor or no internet connection.
    

**Use case:**

Progressive Web Apps like Twitter Lite or Starbucks PWA, which cache core UI and recent content, so users can browse even on unstable mobile networks.

* * *

## **Data & State Management**

Once your UI loads quickly, the next step is to think about the data behind it.

In real apps, this data (also called state) can come from different places:

-   Some live inside a single component (a reusable piece of the UI, like a button),
    
-   Some are shared across the app,
    
-   And others come from APIs.
    

How you manage this state can make or break your app’s speed, reliability, and scalability.

### **10 State Management (Local, Global, Server Cache)**

-   **Local state:** data that lives inside a single component, used for things like toggles, forms, or small interactions. It’s simple to manage and doesn’t add much complexity.
    
-   **Global state:** data that’s shared across multiple components or pages, like user info or theme settings. Tools like [Redux](https://redux.js.org/), [Zustand](https://zustand-demo.pmnd.rs/), or [React Context](https://react.dev/learn/passing-data-deeply-with-context) help manage it.
    
-   **Server cache:** stores frequently used API data on the client so the app doesn’t have to fetch it again and again, making it faster and reducing server load.
    

Think of it like database caching: by deciding where data should live, you can make your app more responsive, reliable, and easier to scale.

[

![](https://substackcdn.com/image/fetch/$s_!59Zh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd02164e2-f4a5-4c68-9438-e1157cbbdef5_2222x866.png)



](https://substackcdn.com/image/fetch/$s_!59Zh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd02164e2-f4a5-4c68-9438-e1157cbbdef5_2222x866.png)

**Why it matters:**

-   Keeps your app responsive.
    
-   Reduces unnecessary API calls.
    
-   Makes scaling smoother as your app grows.
    

**Use case:**

Local state for a modal’s open/closed status. Global state for theme preference (dark mode) that affects every component. Server-side cache for user profile data displayed by multiple components.

### **11 API Caching with Expiration**

Caching doesn’t stop at the component level. You can store API responses in memory, [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (a browser database for larger data)_,_ or [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (for smaller key-value data)_,_ and set expiration rules to make sure data stays fresh.

It’s like having a Redis cache server, but right in the browser instead of on your server.

[

![](https://substackcdn.com/image/fetch/$s_!Gx9K!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F71ad33ac-a04f-4c06-8b8d-78d9e2912675_2222x866.png)



](https://substackcdn.com/image/fetch/$s_!Gx9K!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F71ad33ac-a04f-4c06-8b8d-78d9e2912675_2222x866.png)

**Why it matters:**

-   Keeps data up-to-date for users.
    
-   Reduces repeated server requests.
    
-   Makes your app feel faster.
    

**Use case:**

A news app might cache articles for a few minutes so users can read offline, while comments refresh more often to stay up to date. Similarly, a SaaS dashboard could cache chart data while the user is on the page, then refresh it when they come back later.

### **12 GraphQL vs REST (Reducing Over/Under-Fetching)**

How you fetch data also affects performance.

-   **REST:** Can sometimes send too much data or not enough, making your app fetch extra information or require additional requests.
    
-   **GraphQL:** A query language for APIs that lets the client ask for exactly the data it needs, avoiding extra or missing information. This avoids over-fetching or under-fetching data and helps reduce unnecessary requests.
    

It’s like how you optimise database queries on the backend to make them faster and use less bandwidth, but this happens on the frontend.

GraphQL sits between the client and the server as one endpoint. The client asks for exactly the data it needs, and the server’s GraphQL layer collects that data from databases or other APIs, then sends back a clean, organised response.

This way, you make one flexible request instead of several REST calls, making it faster and more data-efficient.

[

![](https://substackcdn.com/image/fetch/$s_!7DjY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F38830cad-cd8e-4637-8e70-99bc0b4b3ca3_2222x866.png)



](https://substackcdn.com/image/fetch/$s_!7DjY!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F38830cad-cd8e-4637-8e70-99bc0b4b3ca3_2222x866.png)

**Why it matters:**

-   Saves bandwidth, especially on mobile networks.
    
-   Reduces unnecessary requests.
    
-   Simplifies client-side data handling.
    

**Use case:**

GraphQL works best for complex apps that need data from many places at once, like GitHub. One GraphQL query can get a pull request, comments, and author info in a single request instead of several REST calls. While REST is simpler and great for apps with stable data, like blogs or public APIs that rely on caching.

### **13 Pagination Strategies (Cursor vs Offset)**

Loading large lists or tables all at once can be heavy. Pagination helps break the data into manageable chunks.

-   **Offset pagination:** Uses page numbers or record counts (like `?page=2` or `?offset=20`) to fetch data. It’s simple and works well for lists that don’t change often. But the list order shifts if new items are added or old ones are removed. This can make the same offset return different items, leading to duplicates or missing entries.
    

-   **Cursor pagination:** Uses a pointer to mark where the last item ended, so the next request starts right after it. It’s more reliable for live or frequently updated data (social feeds or chat messages) because it keeps track of the exact position in the dataset. That means even if new items are added or removed while you’re scrolling, you won’t see duplicates or miss entries.
    

[

![](https://substackcdn.com/image/fetch/$s_!Ih_7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6566e28b-94ca-40fc-be79-eaeb5da69c83_2222x867.png)



](https://substackcdn.com/image/fetch/$s_!Ih_7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6566e28b-94ca-40fc-be79-eaeb5da69c83_2222x867.png)

**Why it matters:**

-   Handles large datasets efficiently.
    
-   Prevents slowdowns and performance bottlenecks.
    
-   Keeps dynamic lists reliable and consistent.
    

**Use case:**

-   **Offset pagination:** best for data tables with stable data and clear page numbers, such as admin panels or product catalogs.
    
-   **Cursor pagination**: ideal for infinite scroll feeds like social media timelines, notification lists, or any real-time list where items are frequently added or removed.
    

### **14 Real-Time Data & Networking (WebSockets, SSE, Polling)**

Finally, some apps need live updates, like chat apps, dashboards, or notifications. How you handle real-time data matters.

-   **WebSockets:** Let the client and server send messages to each other in real time, both ways, without constantly asking for updates.
    
-   **Server-Sent Events (SSE):** The server can push updates to the client in real time, but communication only goes one way, from server to client.
    
-   **Polling:** The client regularly asks the server for updates. It’s simple to set up, but it can put more load on the server.
    

It’s like building event-driven systems on the backend, but here it happens in the browser.

[

![](https://substackcdn.com/image/fetch/$s_!jvDd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F42e264b6-d346-4364-9ab3-7de21ed90562_2222x1140.png)



](https://substackcdn.com/image/fetch/$s_!jvDd!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F42e264b6-d346-4364-9ab3-7de21ed90562_2222x1140.png)

**Why it matters:**

-   Supports live dashboards, chat, and notifications.
    
-   Improves interactivity and user engagement.
    
-   Allows you to choose the right strategy for your app’s needs.
    

**Use case:**

-   **WebSockets:** chat apps (Slack), multiplayer games, collaborative editing (Google Docs).
    
-   **SSE:** live notifications, stock tickers, server logs streaming to a dashboard.
    
-   **Polling:** simple use cases like checking for new emails or status updates.
    

* * *

## **Architecture & Scalability**

As your app grows, managing complexity becomes just as important as writing features. Frontend architecture isn’t just about code; it’s about building systems that are maintainable, scalable, and predictable.

### **15 Micro Frontends**

When multiple teams work on the same app, things can get messy fast.

Micro frontends let each team build and deploy their part of the app separately. For example, one team handles the dashboard while another builds the settings page. Technically, the app is divided into smaller frontend projects that are combined at runtime to work as one seamless app.

A module federation feature (for example, in tools like [Webpack](https://webpack.js.org/concepts/module-federation/)) lets these separate projects share code (like components or utilities) directly in the browser, without rebuilding or duplicating code across projects.

[

![](https://substackcdn.com/image/fetch/$s_!-5Ac!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F41ca0485-f4a0-4d11-809d-660033f0ac45_2222x1205.png)



](https://substackcdn.com/image/fetch/$s_!-5Ac!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F41ca0485-f4a0-4d11-809d-660033f0ac45_2222x1205.png)

**Why it matters:**

-   Teams can develop features faster and in parallel.
    
-   Reduces duplicated code across bundles.
    
-   Supports independent deployment cycles, so updates don’t block each other.
    

**Use case:**

Large enterprises with multiple teams working on different product areas. For example, big companies like [Zalando, IKEA, DAZN, and Spotify use micro-frontends](https://micro-frontends-deep-dive.pages.dev/case-studies) so each team can build and release their part of the app on their own.

### **16 Component-Based Architecture & Design Systems**

Components are the building blocks of your app. A design system ensures these components stay consistent and reusable across teams and projects.

It’s like having reusable backend modules or libraries, but for your UI.

[

![](https://substackcdn.com/image/fetch/$s_!XHLT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fbbc1b9-8d38-4606-932d-0b4aa49187f3_2222x1235.png)



](https://substackcdn.com/image/fetch/$s_!XHLT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fbbc1b9-8d38-4606-932d-0b4aa49187f3_2222x1235.png)

**Why it matters:**

-   Makes the UI predictable and easier to maintain.
    
-   Encourages code reuse across pages and projects.
    
-   Helps teams scale efficiently without creating chaos.
    

**Use case:**

-   Used by companies with many products or teams to keep design consistent, like [Shopify’s Polaris](https://shopify.dev/docs/api/app-home/polaris-web-components) or [IBM’s Carbon](https://carbondesignsystem.com), which are open-source design systems containing ready-to-use UI components, styles, and guidelines.
    
-   Even small startups benefit: a shared set of 10–20 components (like buttons and modals) helps teams build faster and keep the UI consistent.
    

### **17 Build & Deployment Pipelines (CI/CD for Frontend)**

Frontend apps also benefit from CI/CD (Continuous Integration and Continuous Deployment) pipelines, just like backend services. These pipelines automatically handle steps like building the app, running tests, and deploying updates.

In simple terms, every time you push code, CI/CD tools check that nothing breaks and then safely release the latest version, making deployments faster, more reliable, and less manual.

[

![](https://substackcdn.com/image/fetch/$s_!Q_LW!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3b628351-f91a-464c-88e7-bf3be0d56080_2222x683.png)



](https://substackcdn.com/image/fetch/$s_!Q_LW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3b628351-f91a-464c-88e7-bf3be0d56080_2222x683.png)

**Why it matters:**

-   Minimises human errors during deployment.
    
-   Enables fast, reliable releases.
    
-   Makes scaling and frequent updates much smoother.
    

**Use case:**

Works for any app with regular updates, from small teams auto-deploying to Vercel to big companies like Netflix releasing thousands of times a day. It keeps updates fast, safe, and reliable.

* * *

## **User Experience & Reliability**

Your users don’t care about your architectures or caching strategies; they just want the app to be fast, reliable, and easy to use.

### **18 Accessibility (a11y) & Mobile-First Design**

Accessibility and mobile-first design aren’t just design principles; they’re system-level considerations. Accessibility ensures your app’s UI and code structure work for everyone, including people using assistive technologies.

Mobile-first design forces you to build efficient layouts, load lighter assets, and prioritize key features, all of which influence performance, scalability, and overall frontend architecture.

[

![](https://substackcdn.com/image/fetch/$s_!Xap9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcae84cbb-6a1f-4848-8360-69828a8554e4_2222x803.png)



](https://substackcdn.com/image/fetch/$s_!Xap9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcae84cbb-6a1f-4848-8360-69828a8554e4_2222x803.png)

**Why it matters:**

-   Reaches more users.
    
-   Makes your app easier and more pleasant to use.
    
-   Ensures a consistent experience across devices.
    

**Use case:**

Government sites (accessibility is legally required in many countries), e-commerce, and content platforms. Mobile-first is essential for apps in developing markets where mobile is the main or only device.

### **19 Progressive Web Apps (PWAs) & Offline-First**

Progressive Web Apps (PWAs) are web apps that behave like native apps. They can work offline, send notifications, and even be installed on a device.

They use a few key technologies:

-   Service workers run in the background to cache important files like HTML, CSS, and API responses.
    
-   A web app manifest defines how the app looks and behaves when installed.
    
-   And HTTPS keeps everything secure.
    

Together, these make the app fast, reliable, and installable.

[

![](https://substackcdn.com/image/fetch/$s_!uT-V!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23f6f436-e1b9-4b0d-b919-8a8fa7dfd09a_2222x938.png)



](https://substackcdn.com/image/fetch/$s_!uT-V!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23f6f436-e1b9-4b0d-b919-8a8fa7dfd09a_2222x938.png)

**Why it matters:**

-   Users can access your app anywhere.
    
-   Reduces load on servers.
    
-   Improves reliability and user trust.
    

**Use case:**

Apps where offline access is valuable: Twitter Lite, Starbucks PWA, field service apps, and news apps.

### **20 Security Basics (XSS, CSRF, CSP, Authentication)**

Speed means nothing without security. Frontend isn’t just about the UI; it’s also the first line of defence for your app.

-   **XSS (Cross-Site Scripting):** Stop attackers from injecting malicious scripts into your app.
    
-   **CSRF (Cross-Site Request Forgery):** Protect your forms and actions that change data from being triggered by attackers without the user’s consent.
    
-   **CSP (Content Security Policy):** A rule set that helps prevent malicious scripts from running in your app.
    
-   **Authentication:** Make sure user tokens and sessions are stored and handled securely in the browser.
    

[

![](https://substackcdn.com/image/fetch/$s_!hdbV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1d587c1-c993-4412-80d7-534261a9dd0d_2222x721.png)



](https://substackcdn.com/image/fetch/$s_!hdbV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1d587c1-c993-4412-80d7-534261a9dd0d_2222x721.png)

**Why it matters:**

-   Protects your users and their data.
    
-   Prevents common attacks before they reach the backend.
    
-   Builds trust and helps with compliance.
    

**Use case:**

Any app handling sensitive data. Financial apps need strict CSP and token handling. Social platforms must prevent XSS to avoid account takeovers. E-commerce sites need CSRF protection on checkout to prevent unauthorised purchases.

### **21 Observability & Error Monitoring (Client-Side)**

Even if everything works well, things can still break in production. That’s why observability is important.

Frontend errors are just like 500 errors in your backend; they happen. Monitoring tools like [Sentry](https://sentry.io/welcome/) or [LogRocket](https://logrocket.com/) help you track:

-   **JS exceptions:** errors that happen in your JavaScript code while the app is running.
    
-   **Performance bottlenecks:** parts of your app that slow it down or make it lag.
    
-   **User interactions leading to errors:** actions by users that trigger bugs or crashes in your app.
    

These tools add a small script to your app. When something breaks, it collects information like the error message, what the user was doing, and browser details. Then it sends that data to the tool’s server, where you can see and fix the issue from your dashboard.

[

![](https://substackcdn.com/image/fetch/$s_!i8i2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F60c5cc73-3d9a-4cda-97af-c89970335199_2222x721.png)



](https://substackcdn.com/image/fetch/$s_!i8i2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F60c5cc73-3d9a-4cda-97af-c89970335199_2222x721.png)

**Why it matters:**

-   Detects and resolves issues faster.
    
-   Keeps your app stable and performant.
    
-   Improves the overall user experience and trust.
    

**Use case:**

Used in production apps with real users. SaaS teams track errors right after deployment, e-commerce sites watch checkout issues, and session replay tools help support teams see what confused users without extra bug reports.

* * *

## **Conclusion**

Frontend system design is basically backend system design, just happening in the user’s browser.

Every choice you make, like rendering method, caching strategy, state management, architecture, and security, affects speed, scalability, and reliability.

So next time you’re building a frontend, ask yourself:

-   **Where should computation happen?** On the server, in the client’s browser, or at the edge?
    
-   **When does the data need to be up-to-date?** Prebuilt, cached, or real-time?
    
-   **How can we keep the app fast and reliable?** Lazy loading, smart caching, or micro frontends?
    
-   **How do we scale this?** Can the architecture handle 10x traffic? 100x?
    
-   **How do we maintain this?** Will new developers understand the architecture? Can teams work independently?
    

Think of your frontend as a distributed system. Treat it that way, and your users will get an app that’s fast, smooth, and seamless, exactly what they expect.

* * *

👋 I’d like to thank **[Shefali](https://x.com/Shefali__J)** for writing this newsletter!

Plus, don’t forget to check out her work and socials:

-   [Shefali.dev](https://shefali.dev/)
    
-   [GitHub](https://github.com/WebdevShefali)
    
-   [Twitter](https://x.com/Shefali__J)
    

You’ll often find her writing about web development, sharing UI tips, and building tools that make developers’ lives easier.

* * *

🚨 **Design, Build, Scale** 🚨

I’m excited to let you know we’re launching Design, Build, Scale!

(3-part newsletter series that breaks down popular interview questions.)

Exclusive to PAID members...

Here are a few of the things you’ll get:

-   **High-level architecture of real-world case studies.**
    
-   Deep dive into how popular real-world systems actually work.
    
-   **How real-world systems handle scale, reliability, and performance.**
    
-   10x the results you currently get with 1/10th of your time, energy, and effort.
    

Start Date: November 2025

👉 **[Click here to join](https://newsletter.systemdesign.one/subscribe?yearly=true)** (takes 60 seconds)

* * *

If you find this newsletter valuable, share it with a friend, and subscribe if you haven’t already. There are [group discounts](http://newsletter.systemdesign.one/subscribe?group=true), [gift options](http://newsletter.systemdesign.one/subscribe?gift=true), and [referral bonuses](https://newsletter.systemdesign.one/leaderboard) available.

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

Thank you for supporting this newsletter.

You are now 180,001+ readers strong, very close to 181k. Let’s try to get 181k readers by 21 November. Consider sharing this post with your friends and get rewards.

Y’all are the best.

[

![system design newsletter](https://substackcdn.com/image/fetch/$s_!6oWl!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png "system design newsletter")



](https://substackcdn.com/image/fetch/$s_!6oWl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png)

[Share](https://newsletter.systemdesign.one/p/frontend-system-design?utm_source=substack&utm_medium=email&utm_content=share&action=share)

* * *

-   Block diagrams created with [Eraser](https://app.eraser.io/auth/sign-up?ref=neo)