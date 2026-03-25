---
title: "I Studied How Top 0.1% Engineering Teams Do Code Reviews"
link: https://newsletter.systemdesign.one/p/code-review-best-practices
author: Neo Kim
publish_date: 2025-11-15 04:35:39
saved_date: 2026-01-17 15:10:04
image: https://substack-post-media.s3.amazonaws.com/public/images/55f5464a-1e63-472c-a6fa-8d58539c2561_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/55f5464a-1e63-472c-a6fa-8d58539c2561_1280x720.png)

1.  Keep pull requests SMALL, so they’re easy to understand and review. Plus, small pull requests create fewer problems later.
    
2.  Watch for duplicate & dead code. Remove unused code and abstract logic to avoid duplication.
    

Get my system design playbook on newsletter signup for FREE:

3.  Good tests prevent regressions and show how code should work. So verify whether the new code has “sufficient” test coverage.
    

[

![](https://substackcdn.com/image/fetch/$s_!UsO0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3dcbf10f-aafb-40ef-ba98-ea7d90bc050e_3547x2550.jpeg)



](https://substackcdn.com/image/fetch/$s_!UsO0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3dcbf10f-aafb-40ef-ba98-ea7d90bc050e_3547x2550.jpeg)

4.  Choose the correct reviewer for each change: code owners or domain experts can quickly catch domain-specific issues. If you assign many reviewers,,, ensure each understands their responsibilities to prevent delays.
    
5.  Write clear pull request descriptions that explain the “what” and “why” of changes. Also, link relevant tickets and attach screenshots that help reviewers understand the context.
    

[

![](https://substackcdn.com/image/fetch/$s_!F6J7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9e22f09e-8a78-4cfc-8003-dba7122147c7_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!F6J7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9e22f09e-8a78-4cfc-8003-dba7122147c7_1080x1080.png)

6.  Use a code review CHECKLIST. It could cover design, readability, security, testing, and so on. This ensures consistency in reviews and reduces the chances of missing common issues.
    
7.  Automate easy parts. Use tests, linters, and static analysis to catch errors and style issues. This way, reviewers can focus on logic & architecture.
    

* * *

[

![](https://substackcdn.com/image/fetch/$s_!Pvyy!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbef9f0b7-b6e9-49ab-b162-4c9b1313d5d1_1200x628.png)



](https://coderabbit.link/neo-oct)

I’m happy to partner with **[CodeRabbit](https://coderabbit.link/neo-oct)** on this newsletter. Code reviews usually delay feature deliveries and overload reviewers. And I genuinely believe CodeRabbit solves this problem.

[Try CodeRabbit](https://coderabbit.link/neo-oct)

* * *

8.  Use review metrics to find “bottlenecks”. Measure: review time and bug rates, and pull request size. Then adjust the process based on data to improve speed without sacrificing quality.
    
9.  Review quickly… but don’t rush! The goal is to improve code health, not just quick approvals.
    
10.  Keep reviews SHORT. It’s hard to stay focused after reading 100+ lines of code. If the change is big, break it up into smaller parts or focus on one section at a time to give effective feedback.
     

[

![](https://substackcdn.com/image/fetch/$s_!Pjxp!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa0870735-185c-43b3-a11a-c3490b0b762b_2400x1254.png)



](https://x.com/girayozil/status/306836785739210752?lang=en)

11.  Get early feedback on big features to save time later. This helps to catch issues early and makes reviews more manageable.
     
12.  Ask for a review ONLY after tests & builds pass. This prevents wasting the reviewer’s time on broken code. Besides, it signals the code is stable enough to review.
     
13.  Use review tools effectively to save time - threaded comments, suggested edits, and templates, and so on. The correct setup makes reviews smoother.
     
14.  Watch out for potential bugs & logic mistakes that tests might miss. Think about “race conditions or extreme inputs”. Human reviewers can often spot bugs that automated tests miss, especially in complex logic.
     
     I’ll send you some rewards for the referrals.
     
     [Share](https://newsletter.systemdesign.one/p/code-review-best-practices?utm_source=substack&utm_medium=email&utm_content=share&action=share)
     
15.  Encourage ALL team members to take part in code reviews. And don’t let the same people handle all reviews. Rotation spreads knowledge and avoids burnout.
     
16.  You can’t review code effectively if you don’t understand what it does. So read the code carefully and run it locally if necessary.
     

[

![](https://substackcdn.com/image/fetch/$s_!QrI7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd2b8f9ca-fdcf-4b79-86c8-59316c019481_3300x3300.jpeg)



](https://www.instagram.com/theworkplacecomics/)

17.  Keep the feedback within the “scope”. If you notice any issues outside the scope of the change, log them separately. This keeps reviews constructive and prevents endless delays.
     
18.  Review in layers: design then details. This approach helps you catch both major and minor issues efficiently.
     
19.  Compare the implementation with the requirements. Ensure it handles acceptance criteria and edge cases and error conditions correctly.
     
     [
     
     ![](https://substackcdn.com/image/fetch/$s_!40Uk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5b98bc81-5ba0-4812-b0fc-7062d86ea519_1080x1080.png)
     
     
     
     ](https://substackcdn.com/image/fetch/$s_!40Uk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5b98bc81-5ba0-4812-b0fc-7062d86ea519_1080x1080.png)
     
20.  Enforce coding standards for CONSISTENCY. Suggest refactoring if the logic is hard to follow.
     
21.  Use AI tools to summarize changes or find issues. It saves time! But use those as a helper... and not a replacement for human reviews.
     

* * *

[

![](https://substackcdn.com/image/fetch/$s_!IVbI!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F072e8c1c-10f6-494a-9b1a-e12a712d30b1_2828x1556.png)



](https://github.com/ScoopInstaller/Extras/pull/15266)

Guess what? When you open a pull request, **[CodeRabbit](https://coderabbit.link/neo-oct)** can generate a summary of code changes for the reviewer. It helps them quickly understand complex changes and assess the impact on the codebase. Speed up the code review process.

[Try CodeRabbit](https://coderabbit.link/neo-oct)

* * *

22.  Set clear “guidelines” for how reviews get approved. For example, have at least two reviewers for critical code changes.
     
23.  Consider how code performs at scale in “performance-critical” areas. Look out for things that might cause slowdowns in critical paths - unnecessary loops and so on. Remember: fixing issues is easier during review than in production.
     
24.  Use reviews as an opportunity to share KNOWLEDGE and grow together. Share tips and best practices, especially with junior engineers.
     
     [
     
     ![](https://substackcdn.com/image/fetch/$s_!mSX9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7ec45406-8015-4d28-95fd-316a0795f78d_716x580.jpeg)
     
     
     
     ](https://mikeorganisciak.com/archive/)
     
25.  Ensure the code handles errors “gracefully”. Functions must deal with null inputs or external call failures without crashing. Good error handling makes the system robust & easy to debug.
     
26.  Adjust practices to fit your team’s needs. What works at one company might not work for another. Keep experimenting until you find your ideal flow.
     
     I’ll send you some rewards for the referrals.
     
     [Share](https://newsletter.systemdesign.one/p/code-review-best-practices?utm_source=substack&utm_medium=email&utm_content=share&action=share)
     
27.  Always review with the bigger picture in mind. Think about how the change interacts with the codebase. And consider cross-cutting concerns: performance, concurrency, and backward compatibility.
     
28.  It’s better to clarify… than to assume. So ask clarifying questions when something is unclear about the change. A simple question can prevent misunderstandings or reveal missing requirements.
     
29.  If possible, run the code locally, especially for complex & critical code changes. Seeing it in action can reveal issues that reading won’t.
     

[

![](https://substackcdn.com/image/fetch/$s_!IO9H!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c184db4-a4d2-48d0-95fd-e72f226893fb_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!IO9H!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c184db4-a4d2-48d0-95fd-e72f226893fb_1080x1080.png)

30.  Focus on code correctness & clarity,,, not personal style. If an issue is purely stylistic and not covered by a guideline, consider letting it pass or marking it as a nitpick. Remember, reviews are about improving the codebase.
     
31.  Suggest a solution when pointing out a problem. If a function is complex, propose breaking it into smaller functions or using a design pattern. Reviews are most valuable when they teach… not just criticize.
     
32.  Consider whether the documentation requires any updates because of the change. An API change may need changes to the API docs or the README file. Ensure everything remains accurate and complete.
     

[

![](https://substackcdn.com/image/fetch/$s_!2yz9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F87c4ed64-54d7-463d-b47b-c53c91072048_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!2yz9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F87c4ed64-54d7-463d-b47b-c53c91072048_1080x1080.png)

33.  Treat code review as a “team effort”, not a fight. Focus on making the product better rather than proving someone wrong. A friendly tone makes feedback easier to accept.
     
34.  Mention explicitly which comments are essential & which are optional. Label important fixes separately from small “nice-to-have” ideas. This helps the author to prioritize and stay focused.
     

* * *

[

![](https://substackcdn.com/image/fetch/$s_!tHi0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccbf27ab-cea5-4105-81c0-4fe848b50c7e_1456x880.webp)



](https://coderabbit.link/neo-cli)

Bet you didn’t know… **[CodeRabbit CLI](https://coderabbit.link/neo-cli)** brings instant code reviews directly to your terminal, seamlessly integrating with Claude Code, Cursor CLI, and other AI coding agents. While they generate code, CodeRabbit ensures it’s production-ready - catching bugs, security issues, and AI hallucinations before they hit your codebase.

[Install CodeRabbit CLI](https://coderabbit.link/neo-cli)

* * *

35.  Involve a neutral third party in disagreements over CRITICAL issues - ask a tech lead or architect. Also, create a follow-up task if the problem is outside the current scope.
     
36.  Explain the “why” behind your feedback. Understanding the reason behind feedback helps others learn. This way, they’re less likely to repeat the issue.
     
37.  Secure code protects users and the business. So always think about SECURITY. Be cautious of weak data validation, exposed data, or improper error handling.
     
38.  Be open to discussion when opinions differ. Ask for the author’s reasoning and listen before insisting. Talking through disagreements often leads to better solutions.
     

[

![](https://substackcdn.com/image/fetch/$s_!DNa_!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1ef682a-2a7f-40dc-854e-c6353561470f_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!DNa_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1ef682a-2a7f-40dc-854e-c6353561470f_1080x1080.png)

39.  Point out what’s done well too… it motivates people to keep doing it. Keep a balance between criticism and appreciation for high morale.
     
40.  Don’t use code reviews for PERFORMANCE EVALUATIONS! Reviews exist to improve code, not to measure people. When engineers feel safe, they write better code & review honestly.
     
41.  Respond to feedback with curiosity,,, not defensiveness. Treat comments as learning opportunities.
     
42.  Having another set of eyes helps catch mistakes. So make sure someone else reviews “every” change. Even small changes benefit from peer review.
     

[

![](https://substackcdn.com/image/fetch/$s_!5wT0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb45bcd24-3181-44f0-89f1-0bbfce38c4a9_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!5wT0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb45bcd24-3181-44f0-89f1-0bbfce38c4a9_1080x1080.png)

I could go on and on and on.

But if those 42 ways aren’t enough to 10x your code reviews, then probably anything else I say will go in one ear and right out the other.

As far as AI code reviews to catch bugs, security flaws, and performance issues _as_ you write code?

That’s why [CodeRabbit](https://coderabbit.link/neo-ide) exists.

It brings real-time, AI code reviews straight into VS Code, Cursor, and Windsurf.

**👉 [Install CodeRabbit in VSCode for FREE](https://coderabbit.link/neo-ide)**

* * *

If you find this newsletter valuable, share it with a friend, and subscribe if you haven’t already. There are [group discounts](http://newsletter.systemdesign.one/subscribe?group=true), [gift options](http://newsletter.systemdesign.one/subscribe?gift=true), and [referral rewards](https://newsletter.systemdesign.one/leaderboard) available.

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

* * *

[

![Author Neo Kim; System design case studies](https://substackcdn.com/image/fetch/$s_!bEFk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f94ab8c-0d67-4775-992e-05e09ab710db_320x320.png "Author Neo Kim; System design case studies")



](https://www.linkedin.com/in/nk-systemdesign-one/)

**👋 Find me on [LinkedIn](https://www.linkedin.com/in/nk-systemdesign-one/) | [Twitter](https://x.com/intent/follow?screen_name=systemdesignone) | [Threads](https://www.threads.net/@systemdesignone) | [Instagram](https://www.instagram.com/systemdesignone/)**

* * *

**Want to advertise in this newsletter?** 📰

If your company wants to reach a 190K+ tech audience, [advertise with me](https://newsletter.systemdesign.one/p/sponsorship).

* * *

Thank you for supporting this newsletter.

You are now 190,001+ readers strong, very close to 191k. Let’s try to get 191k readers by 21 November. Consider sharing this post with your friends and get rewards.

Y’all are the best.

[

![system design newsletter](https://substackcdn.com/image/fetch/$s_!6oWl!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png "system design newsletter")



](https://substackcdn.com/image/fetch/$s_!6oWl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png)

[Share](https://newsletter.systemdesign.one/p/code-review-best-practices?utm_source=substack&utm_medium=email&utm_content=share&action=share)