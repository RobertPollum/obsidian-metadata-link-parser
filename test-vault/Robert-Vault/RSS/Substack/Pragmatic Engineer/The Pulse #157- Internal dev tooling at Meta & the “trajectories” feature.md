---
title: "The Pulse #157: Internal dev tooling at Meta & the “trajectories” feature"
link: https://newsletter.pragmaticengineer.com/p/the-pulse-157-internal-dev-tooling
author: Gergely Orosz
publish_date: 2025-12-18 12:28:12
saved_date: 2026-01-17 15:09:32
image: https://substack-post-media.s3.amazonaws.com/public/images/916cb7ff-df63-4f58-b765-271698b29cd7_420x300.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/916cb7ff-df63-4f58-b765-271698b29cd7_420x300.png)

Before we start, two things:

-   **Check out our new MCP report!** Elin and I have done something experimental: create a more detailed report than even our MCP deepdive was. If you’d like to get deeper into the MCP ecosystem, [check out the report](https://newsletter.pragmaticengineer.com/i/40654455/reports). Feel free to give feedback, as we’d like to do more of these if there’s enough interest to justify the intensive research involved. _This is the most detailed report on this topic that we know about._
    
-   **The Pragmatic Summit [speaker list](https://www.pragmaticsummit.com/) is nearly finalized.** Speakers confirmed in the past few weeks include some names you may know as guests on the Pragmatic Engineer podcast: [Chip Huyen](https://newsletter.pragmaticengineer.com/p/ai-engineering-with-chip-huyen), [Martin Fowler](https://newsletter.pragmaticengineer.com/p/martin-fowler), [Nicole Forsgren](https://newsletter.pragmaticengineer.com/p/developer-productivity-with-dr-nicole), and [Kent Beck](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent). I’ll share the detailed agenda in early January. The event takes place on 11 February, in San Francisco. [Apply here](https://www.pragmaticsummit.com/) to secure a spot.
    

_The Pulse is a series covering events, insights, and trends within Big Tech and startups._

Today, we cover:

1.  **Internal dev tooling at Meta & “trajectories.”** An overview of three different internal AI-coding tools which devs at Meta use. Also, the company has started sharing the prompts which devs make when generating code – and it’s pretty controversial.
    
2.  **GitHub upsets devs by charging for self-hosted CI/CD.** GitHub Actions is notoriously slow and unreliable. But instead of improving the service, GitHub sought to charge by the minute for using third-party CI/CD solutions. That didn’t go down well with devs.
    
3.  **Industry Pulse.** Warsaw on track to become the “tech capital of the EU,” hiring juniors could actually be “profitable” thanks to AI tools, GitHub is working on stacked diffs, non-devs use LLMs for more coding tasks, Cursor migrates CMS to Markdown, OpenAI gets rid of 6-month vesting cliff, and more.
    
4.  **“Apple Tax” alive in Japan.** A US court rejected Apple’s appeal, and the iPhone maker can no longer ban alternative in-app payments or impose junk fees on third-party payments… in the US. Meanwhile in Japan, Apple is pulling the same trick that got it in trouble in the US.
    

## 1\. Internal dev tooling at Meta & “trajectories”

An interesting detail about Meta that I learnt from chatting with two current software engineers there: last week, the social media giant rolled out a feature allowing devs to see the AI prompt history on diffs (internal lingo for pull requests) in review. And this new feature launch is causing some controversy in the workplace!

[Read more](https://newsletter.pragmaticengineer.com/p/the-pulse-157-internal-dev-tooling)