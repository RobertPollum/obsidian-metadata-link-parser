---
title: How AI will change software engineering – with Martin Fowler
link: https://newsletter.pragmaticengineer.com/p/martin-fowler
author: Gergely Orosz
publish_date: 2025-11-19 12:09:43
saved_date: 2026-01-17 15:09:33
image: https://substackcdn.com/image/fetch/$s_!-41Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png
tags: 
---

![image](https://substackcdn.com/image/fetch/$s_!-41Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png)

### Stream the latest episode

**Listen and watch now on [YouTube](https://youtu.be/CQmI4XKTa0U), [Spotify](https://open.spotify.com/episode/03VWcQdjsAmaemnnQQVbUc), and [Apple](https://podcasts.apple.com/us/podcast/the-pragmatic-engineer/id1769051199).** See the episode transcript at the top of this page, and timestamps for the episode at the bottom.

### **Brought to You by**

[

![](https://substackcdn.com/image/fetch/$s_!-41Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png)



](https://substackcdn.com/image/fetch/$s_!-41Z!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png)

•⁠ **[Statsig](http://statsig.com/pragmatic)** ⁠ — ⁠ The unified platform for flags, analytics, experiments, and more. AI-accelerated development isn’t just about shipping faster: it’s about measuring whether, what you ship, actually delivers value. This is where modern experimentation with Statsig comes in. [Check it out.](http://statsig.com/pragmatic)

•⁠ **[Linear](https://linear.app/pragmatic?utm_source=gergely&utm_medium=newsletter&utm_campaign=pragmatic-engineer)** ⁠ — ⁠ The system for modern product development. I had a jaw-dropping experience when I dropped in for the weekly “Quality Wednesdays” meeting at Linear. Every week, every dev fixes at least one quality isse, large or small. Even if it’s one pixel misalignment, [like this one](https://x.com/GergelyOrosz/status/1970855759639425349?s=20). I’ve yet to see a team obsess this much about quality. Read more about [how Linear does Quality Wednesdays](https://linear.app/now/quality-wednesdays?utm_source=gergely&utm_medium=newsletter&utm_campaign=pragmatic-engineer) – it’s fascinating!

—

### **In this episode**

Martin Fowler is one of the most influential people within software architecture, and the broader tech industry. He is the Chief Scientist at Thoughtworks and the author of _[Refactoring](https://www.amazon.com/Refactoring-Improving-Existing-Addison-Wesley-Signature/dp/0134757599)_ and _[Patterns of Enterprise Application Architecture](https://www.amazon.com/Patterns-Enterprise-Application-Architecture-Martin/dp/0321127420)_, and several other books. He has spent decades shaping how engineers think about design, architecture, and process, and regularly publishes on his blog, [MartinFowler.com](http://martinfowler.com).

In this episode, we discuss how AI is changing software development: the shift from deterministic to non-deterministic coding; where generative models help with legacy code; and the narrow but useful cases for vibe coding. Martin explains why LLM output must be tested rigorously, why refactoring is more important than ever, and how combining AI tools with deterministic techniques may be what engineering teams need.

We also revisit the origins of the Agile Manifesto and talk about why, despite rapid changes in tooling and workflows, the skills that make a great engineer remain largely unchanged.

### **Interesting quotes from the episode**

On what non-determinism introduced by LLMs will mean for software engineering:

> Gergely: “Is this the first time we’re seeing a tool that is so wide to certain software engineering that is non-deterministic?”
> 
> Martin: “It’s a whole new way of thinking. It’s got some interesting parallels to other forms of engineering.
> 
> **In other forms of engineering, you think in terms of tolerances.** My wife’s a structural engineer. She always thinks in terms of what are the tolerances, how much extra stuff do I have to do beyond what the math tells me because I need it for tolerances. Because I mostly know what the properties of wood or concrete or steel are, but I’ve got to go for the worst case.
> 
> We need probably some of that kind of thinking ourselves.
> 
> **What are the tolerances of the non-determinism that we have to deal with?** We need to realize that we can’t skate too close to the edge because otherwise we’re going to have some bridges collapsing. And I suspect we’re going to do that, particularly on the security side.
> 
> We’re going to have some noticeable crashes. I fear because people have got skated way too close to the edge in terms of the non-determinism of the tools they’re using.

On how many big companies are “complicated messes,” because of humans.

> Martin: “I remember chatting with somebody who had joined an established bank. They joined from a startup and one of their jobs was to modernize the bank.
> 
> **Their comment was: ‘now that I’ve been here three years, I think I can** _**understand**_ **the problem.** I’ve got some idea of what I can do, what can be done. But it just takes you that long to just really understand where you are in this new landscape because it’s big and it’s been around a long time.’
> 
> Companies are complicated — and often not logical because they are built by humans, not by computers. And there’s all sorts of history in there because all sorts of things happened because so-and-so met so-and-so and had it around with so-and-so, and all of these things kind of percolate over time. And this vendor came in here, and that was popular over here, and then the person who liked this vendor got moved to a different part of the organization. Somebody else came in who wanted a different vendor.
> 
> And all of this stuff builds up over time to a complicated mess. And any big company is going to have that kind of complicated mess**.** It’s very hard to not get that situation.”

### **The Pragmatic Engineer deepdives relevant for this episode**

-   [Vibe coding as a software engineer](https://newsletter.pragmaticengineer.com/p/vibe-coding-as-a-software-engineer)
    
-   [The AI Engineering stack](https://newsletter.pragmaticengineer.com/p/the-ai-engineering-stack)
    
-   [AI Engineering in the real world](https://newsletter.pragmaticengineer.com/p/ai-engineering-in-the-real-world)
    
-   [What changed in 50 years of computing](https://newsletter.pragmaticengineer.com/p/what-changed-in-50-years-of-computing?utm_source=publication-search)
    

### **Timestamps**

([00:00](https://www.youtube.com/watch?v=CQmI4XKTa0U)) Intro

([01:50](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=110s)) How Martin got into software engineering

([07:48](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=468s)) Joining Thoughtworks

([10:07](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=607s)) The Thoughtworks Technology Radar

([16:45](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=1005s)) From Assembly to high-level languages

([25:08](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=1508s)) Non-determinism

([33:38](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=2018s)) Vibe coding

([39:22](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=2362s)) StackOverflow vs. coding with AI

([43:25](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=2605s)) Importance of testing with LLMs

([50:45](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=3045s)) LLMs for enterprise software

([56:38](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=3398s)) Why Martin wrote Refactoring

([1:02:15](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=3735s)) Why refactoring is so relevant today

([1:06:10](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=3970s)) Using LLMs with deterministic tools

([1:07:36](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=4056s)) Patterns of Enterprise Application Architecture

([1:18:26](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=4706s)) The Agile Manifesto

([1:28:35](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=5315s)) How Martin learns about AI

([1:34:58](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=5698s)) Advice for junior engineers

([1:37:44](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=5864s)) The state of the tech industry today

([1:42:40](https://www.youtube.com/watch?v=CQmI4XKTa0U&t=6160s)) Rapid fire round

### **References**

**Where to find Martin Fowler:**

• X: [https://x.com/martinfowler](https://x.com/martinfowler)

• LinkedIn: [https://www.linkedin.com/in/martin-fowler-com](https://www.linkedin.com/in/martin-fowler-com)

• Website: [https://martinfowler.com](https://martinfowler.com)

**Mentions during the episode:**

• The code migration tool mentioned in the episode: OpenRewrite https://www.thoughtworks.com/radar/tools/openrewrite

• UK Atomic Energy Authority: [https://www.gov.uk/government/organisations/uk-atomic-energy-authority](https://www.gov.uk/government/organisations/uk-atomic-energy-authority)

• Books by Jim Odell: [https://www.amazon.com/stores/James-J.-Odell/author/B001HMPDVG](https://www.amazon.com/stores/James-J.-Odell/author/B001HMPDVG)

• Thoughtworks: [https://www.thoughtworks.com](https://www.thoughtworks.com)

• TDD, AI agents and coding with Kent Beck: [https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent)

• Extreme Programming: [https://martinfowler.com/bliki/ExtremeProgramming.html](https://martinfowler.com/bliki/ExtremeProgramming.html)

• Software architecture with Grady Booch: [https://newsletter.pragmaticengineer.com/p/software-architecture-with-grady-booch](https://newsletter.pragmaticengineer.com/p/software-architecture-with-grady-booch)

• Thoughtworks Technology Radar: [https://www.thoughtworks.com/radar](https://www.thoughtworks.com/radar)

• Rebecca Parsons on LinkedIn: [https://www.linkedin.com/in/dr-rebecca-parsons](https://www.linkedin.com/in/dr-rebecca-parsons)

• Conversation: LLMs and Building Abstractions: [https://martinfowler.com/articles/convo-llm-abstractions.html](https://martinfowler.com/articles/convo-llm-abstractions.html)

• James Lewis on LinkedIn: [https://www.linkedin.com/in/james-lewis-microservices](https://www.linkedin.com/in/james-lewis-microservices)

• Cursor: [https://cursor.com](https://cursor.com)

• Resharper: [https://www.jetbrains.com/resharper](https://www.jetbrains.com/resharper)

• The Learning Loop and LLMs: [https://martinfowler.com/articles/llm-learning-loop.html](https://martinfowler.com/articles/llm-learning-loop.html)

• Godot: [https://godotengine.org](https://godotengine.org)

• Stackoverflow: [https://stackoverflow.com](https://stackoverflow.com)

• Inside Linear’s Engineering Culture: [https://newsletter.pragmaticengineer.com/p/linear](https://newsletter.pragmaticengineer.com/p/linear)

• Waterfall model: [https://en.wikipedia.org/wiki/Waterfall\_model](https://en.wikipedia.org/wiki/Waterfall_model)

• _Refactoring: Improving the Design of Existing Code_: [https://www.amazon.com/Refactoring-Improving-Existing-Addison-Wesley-Signature/dp/0134757599](https://www.amazon.com/Refactoring-Improving-Existing-Addison-Wesley-Signature/dp/0134757599)

• Ralph Johnson on LinkedIn: [https://www.linkedin.com/in/ralphejohnson](https://www.linkedin.com/in/ralphejohnson)

• John Brant on LinkedIn: [https://www.linkedin.com/in/john-brant-80b87056](https://www.linkedin.com/in/john-brant-80b87056)

• Don Roberts: [https://refactory.com/don-roberts](https://refactory.com/don-roberts)

• Adam Tornhill’s website: [https://www.adamtornhill.com](https://www.adamtornhill.com)

• _Patterns of Enterprise Application Architecture_: [https://www.amazon.com/Patterns-Enterprise-Application-Architecture-Martin/dp/0321127420](https://www.amazon.com/Patterns-Enterprise-Application-Architecture-Martin/dp/0321127420)

• _Patterns of Distributed Systems_: [https://www.amazon.com/gp/product/0138221987](https://www.amazon.com/gp/product/0138221987)

• Jim Highsmith on LinkedIn: [https://www.linkedin.com/in/jhighsmith](https://www.linkedin.com/in/jhighsmith)

• Bob Martin on LinkedIn: [https://www.linkedin.com/in/robert-martin-7395b0](https://www.linkedin.com/in/robert-martin-7395b0)

• How Claude Code is built: [https://newsletter.pragmaticengineer.com/p/how-claude-code-is-built](https://newsletter.pragmaticengineer.com/p/how-claude-code-is-built)

• Birgitta Böckeler on LinkedIn: [https://www.linkedin.com/in/birgittaboeckeler](https://www.linkedin.com/in/birgittaboeckeler)

• Simon Willison’s Weblog: [https://simonwillison.net](https://simonwillison.net)

• Applying Domain-Driven Design and Patterns: With Examples in C# and .NET: [https://www.amazon.com/Applying-Domain-Driven-Design-Patterns-Examples-ebook/dp/B0054KOKQQ](https://www.amazon.com/Applying-Domain-Driven-Design-Patterns-Examples-ebook/dp/B0054KOKQQ)

• Expert Generalists: [https://martinfowler.com/articles/expert-generalist.html](https://martinfowler.com/articles/expert-generalist.html)

• Ruby: [https://www.ruby-lang.org](https://www.ruby-lang.org)

• Smalltalk: [https://en.wikipedia.org/wiki/Smalltalk](https://en.wikipedia.org/wiki/Smalltalk)

• _Thinking Fast and Slow_: [https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555](https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555)

• _The Power Broker: Robert Moses and the Fall of New York_: [https://www.amazon.com/Power-Broker-Robert-Moses-Fall/dp/0394720245](https://www.amazon.com/Power-Broker-Robert-Moses-Fall/dp/0394720245)

• _The Path to Power (The Years of Lyndon Johnson, Volume 1)_: [https://www.amazon.com/Path-Power-Years-Lyndon-Johnson/dp/0679729453](https://www.amazon.com/Path-Power-Years-Lyndon-Johnson/dp/0679729453)

• _Concordia_: [https://boardgamegeek.com/boardgame/124361/concordia](https://boardgamegeek.com/boardgame/124361/concordia)

—

Production and marketing by [Pen Name](https://penname.co/).