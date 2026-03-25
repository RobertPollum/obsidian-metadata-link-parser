---
title: "Tailwind vs Linaria: Performance Investigation"
link: https://adevnadia.medium.com/tailwind-vs-linaria-performance-investigation-c2753594cd8f?source=rss-bcdf0570e41c------2
author: Nadia Makarevich
publish_date: 2025-04-24 22:13:05
saved_date: 2026-01-17 15:09:47
image: https://cdn-images-1.medium.com/max/1024/1*XhiYwT8pDxqjoXVLYKBa5Q.png
tags: #web-performance #javascript #react #tailwind-css #frontend
---

![image](https://cdn-images-1.medium.com/max/1024/1*XhiYwT8pDxqjoXVLYKBa5Q.png)

![](https://cdn-images-1.medium.com/max/1024/1*XhiYwT8pDxqjoXVLYKBa5Q.png)

What’s your position on Tailwind? Love or hate? Seems to be no in-between for that one. Even if you’ve never used it, you probably heard of it by now. It’s the [second most popular UI framework](https://2023.stateofcss.com/en-US/css-frameworks/) out there after all, and the source of lots of hype in certain corners of the internet.

One of Tailwind’s big selling points that I keep seeing is that it’s The Best for performance these days. This got me curious. We have all the modern approaches, the rise of build-time CSS solutions, and even the good old CSS modules, and Tailwind wins over all of them?

So, of course, I had to investigate, compare it with something modern, and see for myself. But make no mistake — this is not just a simple comparison of two CSS solutions. This is a proper detective story, with its ups and downs, hidden clues, plot twists, side quests, and a satisfying ending. And in the process, we’ll finally put the theoretical knowledge from the [last](https://www.developerway.com/posts/initial-load-performance) [three](https://www.developerway.com/posts/client-side-rendering-flame-graph) [articles](https://www.developerway.com/posts/ssr-deep-dive-for-react-developers) to some good practical use.

So don’t read this article to find out what is better for your next project, Tailwind or not Tailwind. Read it to test your performance intuition, practice performance reasoning, investigate assumptions, ask questions, and get answers. And to have some fun!

### Setting up the investigation

We’re going to practice our performance investigation skills a lot this time, so you’d need to know what is initial load, how to measure it, how to read a performance flame graph, what the difference is between CSR (client-side rendering) and SSR (server-side rendering), and how to find that difference on the graph. If you skipped the previous articles and feel slightly fuzzy on those topics, you might want to start there first:

1.  [Initial load performance for React developers: investigative deep dive](https://www.developerway.com/posts/initial-load-performance)
2.  [Client-Side Rendering in Flame Graphs](https://www.developerway.com/posts/client-side-rendering-flame-graph)
3.  [SSR Deep Dive for React Developers](https://www.developerway.com/posts/ssr-deep-dive-for-react-developers)

We’re going to investigate the difference in performance between [Tailwind](https://tailwindcss.com/) and [Linaria](https://linaria.dev/). Tailwind, you already know. And Linaria has been getting quite a lot of traction since styled components went into [maintenance mode](https://opencollective.com/styled-components/updates/thank-you) recently. We’ll cover why Linaria is a good choice for this comparison a bit further.

Typically, investigations like this would be performed on small synthetic examples. Like rendering a styled button on a page a million times. Personally, I try to avoid those examples. Because, while measurements like this have their value and can provide easy-to-compare numbers, they tell me absolutely nothing about the real world. In the real world, no one renders a million buttons on the same page.

So I want to avoid buttons here and try to measure a real app. Normally, it’s almost impossible. You’d need to have a large enough app to be considered at least semi-real-world. Which is already days, if not weeks, of work. And then you need to re-implement this app _again_, in exactly the same way, only with the different framework/solution you want to measure.

Fortunately, this is not the case today. First of all, I already have quite a large app to play around with. For the previous article, the [SSR deep dive](https://www.developerway.com/posts/ssr-deep-dive-for-react-developers), I implemented a fully styled, beautiful app with three pages: Login, Dashboard, and Settings. All with different CSS, different layouts, and lots of components. And it’s in Tailwind already. It’s not the largest app in the world, but it should be good enough for the purpose.

All I need to do now is to refactor the app from Tailwind to Linaria. Which is, thanks to my good smart friend [Claude](https://claude.ai/), is almost trivial these days, if you don’t mind some occasional hiccups and botched dark mode. Which I’m totally fine with for the purpose of this exercise. Less than an hour of work, and the entire app is in Linaria instead of Tailwind. What a crazy world we live in!

Now, I just need to start measuring stuff. For the rest of the article, all measurements are:

-   In “production” mode on a pre-built app.
-   Performed in the latest Chrome version with 6x CPU slowdown and Slow 4G Network throttling.
-   A median of 3 measurements, to eliminate the random fluctuations.

You can download the original “baseline” [repo with Tailwind](https://github.com/developerway/ssr-deep-dive) and the [AI-converted Linaria version](https://github.com/developerway/tailwind-vs-linaria-investigation) now.

### Why Linaria vs Tailwind: reasoning and initial assumptions

But before measuring anything, we need to understand what exactly we’re trying to measure. Or, more precisely, what exactly we’re trying to prove with those measurements, and why.

#### Why Linaria?

To understand that, we need to remember that underneath every website we see in the browser, regardless of which framework was used to create it, are just three things: HTML, JS, and CSS.

When we first access the website, the browser will download some HTML as the immediate response, extract from that HTML links to the CSS files, wait for them, and only when it has both of them together, it will be ready to render _something_ on the screen. This is called “critical path”, which we covered in detail in the [Initial load performance](https://www.developerway.com/posts/initial-load-performance) article.

So, the size of the initial HTML and CSS determines _initial load performance,_ i.e., how long the user has to wait to see something meaningful on the screen.

“Normally”, we’ll style our HTML with CSS classes. In React, it’s the className property, which is converted to class when the page is served to the browser.

// somewhere in React code  
<button className="my-button">I'm a button</button>  
  
// converted to HTML at some point  
<button class="my-button">I'm a button</button>  
  
// somewhere in a separate CSS file  
.my-button {  
  display: flex;  
  background: red;  
  padding: 1rem;  
  // all other button's CSS  
}

However, for many historical reasons that are out of the scope of this article, writing “raw” CSS is a massive pain. This is where a myriad of tools and frameworks come in, all united by the single goal: to make the dev experience for writing CSS tolerable.

[Linaria](https://linaria.dev/) (and other similar frameworks), for example, among other things, allows you to write your CSS inside your React code:

// somewhere in React code - no separate CSS file!  
const myButtonCss = css\`  
  display: flex;  
  background: red;  
  padding: 1rem;  
  // all other button's CSS  
\`;  
  
const MyApp = () => {  
  return (  
    <button className={myButtonCss}>I'm a button</button>  
  );  
};

Then, during the **_build_** step, this CSS is extracted from all the React files, merged together into a regular CSS file, and the className is replaced with a made-up name:

// somewhere in the final CSS file  
.blaBla123 {  
  display: flex;  
  background: red;  
  padding: 1rem;  
  // all other button's CSS  
}  
  
// somewhere in JS/HTML  
<button class="blaBla123">I'm a button</button>

If you want to see how it looks in practice, it’s a good time to download the [“Linaria” app](https://github.com/developerway/tailwind-vs-linaria-investigation) we’re going to measure.

Install and build it:

npm install  
npm run build

And take a peek into the dist folder. You'll see the index.html file that references an index CSS file from the assets folder. Inside the CSS file, you'll see a bunch of weird classes - all of those are generated during the npm run build step. You can see how it looks in the "real" code in almost every React file. For example, [the Login page](https://github.com/developerway/tailwind-vs-linaria-investigation/blob/main/frontend/pages/login.tsx) has lots of them.

This is why I used Linaria: it’s just a modern way to write the “traditional” CSS. If you don’t like it, you can replace it with any build-time solution, including CSS modules, with essentially the same result.

#### What’s up with Tailwind?

Tailwind, at its core, is the same — it also hooks up to the build system and produces a “raw” CSS file. If you download the [“Tailwind baseline” project](https://github.com/developerway/ssr-deep-dive) that we compare to Linaria, and install/build it, you’ll see the same result: the index.html file in the dist folder that references an index CSS file from assets.

The developer-facing part, however, is very different. Instead of allowing you to write “regular” CSS in some improved way, like Linaria does, Tailwind completely hides it under a bunch of “utilities” classes. Each class would correspond to one (or more, but usually one) CSS value.

For example, display: flex would correspond to flex class, padding: 1rem to p-4 class, background: red to something like bg-red-500, and so on. As a result, the Linaria-style button from above, with Tailwind, would be written like this with the same result:

// there is no visible CSS here! Just a bunch of standard class names  
const MyApp = () => {  
  return (  
    <button className="flex p-4 bg-red-500">  
      I'm a button  
    </button>  
  );  
};

In theory, this increases the re-use of CSS by . If I want to introduce a completely different component that has nothing to do with a button, but happens to have the same display, padding, and background, in more "traditional" CSS solutions, I'd have to copy all of those styles.

// somewhere far away from the Button  
const somethingDifferentCss = css\`  
  display: flex;  
  background: red;  
  padding: 1rem;  
  // all other very different CSS props  
\`;  
  
const MyApp = () => {  
  return (  
    <div className={somethingDifferentCss}>  
      I'm something different  
    </div>  
  );  
};

There is no sane way to reuse them. As a result, there could be a lot of repetition in the CSS file.

With Tailwind, I’ll use exactly the same class names on this completely different component:

// exactly the same classes on a completely different component  
const MyApp = () => {  
  return <div className="flex p-4 bg-red-500">I'm something different</button>  
}

The CSS file, in this case, will stay as small as it can possibly be and will grow at a much slower pace than any “traditional” framework.

The downside here, however, is that **_classNames_** become long. Veeeeeeerery long sometimes. Compare, for example, how the code of the Login page looks when it’s written in [Linaria](https://github.com/developerway/tailwind-vs-linaria-investigation/blob/main/frontend/pages/login.tsx#L152) vs [Tailwind](https://github.com/developerway/ssr-deep-dive/blob/main/frontend/pages/login.tsx#L15).

#### What we’re measuring

So, TL;DR; from the above: Tailwind tends to make CSS smaller and HTML larger. And we already know that the size of CSS and HTML can directly [affect initial load performance](https://www.developerway.com/posts/initial-load-performance).

So this is what I want to measure today:

-   How much smaller?
-   How much larger?
-   How much will the initial load change, and in which direction?

If you haven’t done it already, now is the time to download and install the [Tailwind baseline project](https://github.com/developerway/ssr-deep-dive) and its [conversion to Linaria](https://github.com/developerway/tailwind-vs-linaria-investigation).

### Measuring the change in assets

The easiest thing to measure here is the size of the assets produced. So let’s start with that.

Run npm run build on both projects and write down the numbers.

![](https://cdn-images-1.medium.com/max/918/1*4TYKFalnbtI-Dgkfm_zBxA.png)

The HTML size didn’t change at all, which is the very first lesson here. I forgot that we can render our app on [the client](https://www.developerway.com/posts/client-side-rendering-flame-graph) and on [the server](https://www.developerway.com/posts/ssr-deep-dive-for-react-developers), and the performance picture will be very different depending on the rendering method. I would need to test both of them.

The almost-zero HTML size is a clear indication that this app is [Client-Side Rendered](https://www.developerway.com/posts/client-side-rendering-flame-graph), those have just an empty div as HTML. Look into dist/index.html for both projects to see that they are indeed almost empty.

CSS is smaller by 13% with Tailwind, which is great, and indeed confirms our assumption. JavaScript is slightly larger, which, considering that all the long class names are buried in the JavaScript file, since we’re writing React, is understandable. And also confirms our assumption in a way.

To measure the HTML increase, I need to render the React code on the server and save that as static files. Luckily, I already had a script from the last time that does exactly that, so it’s not a problem. Just run npm run build:ssg for both projects, it will generate three HTML pages: index, login, and settings - one for each page. They will show up in the dist folder.

Find them there and write down their size:

![](https://cdn-images-1.medium.com/max/1024/1*GQeG0443MEW0ZyTC25dwZg.png)

The results are very interesting. Tailwind indeed exploded the HTML size in some cases. The Settings page more than doubled its size! Try comparing them between projects side-by-side to figure out why — it’s a ton of fun.

And since we have those numbers, it’s time to make an educated guess about the result. What do you think those changes in numbers will do for the initial load performance? Will it go up or down? Write it down!

We’re going to be measuring [**LCP**](https://web.dev/articles/lcp) (Largest Contentful Paint) number for the Settings page, to make it simpler.

The logical assumption here would be:

-   In the “Client” mode, it will probably be slightly less for the Tailwind website, since the CSS file is smaller.
-   In the SSR mode, it will probably go up for Tailwind. Surely, the 162% increase in the initial HTML will be very visible and will counteract the 13% CSS improvement.

Curious, was your assumption different? If yes, time to find out who’s right!

### Measuring LCP in Client mode

Clean the dist folder and rebuild the project again, to get rid of the HTML pages we generated earlier. Then, inside your Tailwind-based project, serve the website like this:

npm run preview

Then, open the website in Chrome, in incognito mode or guest profile, to eliminate the influence of installed plugins. Navigate to “Settings”, open the Performance panel in the Dev Tools, set 6x CPU throttling and Slow 4G network, enable the “disable cache” checkbox, and hit “Reload and Record”.

Write down the LCP number. Then do the same for the Linaria-based project and put the numbers into the table. For me, the results are this:

![](https://cdn-images-1.medium.com/max/826/1*MSgNODuEV6T1kfSj9sdBhA.png)

Hmmmm. Zero gains from the CSS reduction. That is slightly disappointing. Plus, one of my predictions is wrong already 😭 I wonder why it happened?

The answer to this should be apparent if you look at the entire performance picture, not just the LCP number. If you’ve never read those graphs before, it’s time to pause and read [the guide on this topic](https://www.developerway.com/posts/client-side-rendering-flame-graph) first.

Both of the profiles are pretty much identical and look like this:

![](https://cdn-images-1.medium.com/max/1024/0*m6qAx-7yP2aaLQTG.png)

At first, there is an almost non-existent HTML download on the left in the “Network” section. The HTML file for the CSR is almost empty, so that checks out. Then, the download of CSS and JS files is triggered. CSS is render-blocking, as confirmed by the red corner, but the JS file is non-blocking. So technically, it shouldn’t influence the initial render.

And it wouldn’t, if we had at least _something_ in our HTML file. However, it’s empty. The browser has nothing to render — everything that we’d want to put on the screen is hidden inside the JS file. So we have no choice but to wait until it’s ready. Only after it’s downloaded, compiled, and executed do we see the beautiful Settings page, and the LCP metric is triggered.

So the JavaScript size is the bottleneck here, not CSS or HTML. And since it barely changed between the two projects (3% is nothing for those sizes), we see exactly zero difference between Tailwind and Linaria here.

The only time when the CSS size will make a difference is when the JS is not in the picture. Which means it’s either completely slimmed down with code splitting/lazy loading, or when the HTML is not empty. I.e., the website is SSR.

Let’s measure the CSS loading times and add them to the table to get the full picture.

![](https://cdn-images-1.medium.com/max/1024/1*LPACfVlGscwm0Wh6kbL8zQ.png)

Lol, there’s still no difference. To understand why, take a closer look at the structure of the CSS bar. The actual “download time” part there is that tiny solid block at the very end. Which is just around 70ms long. The rest is latency.

Not to mention that we don’t actually transfer all those 50-ish KB. If you look at the Network panel, you’ll see something like this:

![](https://cdn-images-1.medium.com/max/1024/0*3BuqHIZnGU0a3SF0.png)

We have compression enabled by default for our local web server, and hopefully, your production server as well. The difference in this case in CSS is around 1KB between Tailwind and Linaria. No wonder it’s not visible.

Let’s try to run the same measurements with **Network throttling** set to **3G**:

![](https://cdn-images-1.medium.com/max/1024/1*UJc3xnSXFTkHYtAfg73m4w.png)

And the measurements are still identical. Looks like the CSS needs to be _much_ larger to notice anything. We’re talking about megabytes, not our measly 50-ish KB.

Okay, so exactly zero impact on performance so far. But that’s CSR. What about SSR?

### Measuring LCP in SSR mode

For SSR, the size of the initial HTML matters. Considering that the difference between the two versions here is 160%, I would expect to see it reflected in the performance numbers.

The easiest way to measure this is to generate the static pages again. We don’t really need the “server” to be dynamic to measure the HTML download time.

So generate them for each project:

npm run build:ssg

Run again:

npm run preview

And record the performance again. This time, the profile will be different:

![](https://cdn-images-1.medium.com/max/1024/0*0QZxbMuhJr15MrCd.png)

At first, there will be some proper HTML download, followed by the same JS and CSS bars. But then, after the CSS is finished, you’ll see the Layout block in the “main” section, followed by the LCP metric. HTML was pre-generated, CSS is available, and the browser can show the page without waiting for the JS.

Write down the numbers again, including the HTML download time.

![](https://cdn-images-1.medium.com/max/1024/1*1fqJsLpJk-StRHk-RT2ZRw.png)

Funny how identical the numbers are, despite the raw HTML size being so different, right?

That’s compression again. Text-based values, like CSS and especially HTML, with lots of repeating values, compress [_really_ well](https://web.dev/articles/optimizing-content-efficiency-optimize-encoding-and-transfer#text_compression_with_compression_algorithms).

So the verdict here: the more non-Tailwind CSS or Tailwind HTML you have, the more repetitive it will be, and the better the compression will be. To actually see something meaningful, the difference between files needs to be really drastic, and the values probably should be in megabytes, not kilobytes.

Although I suspect that if your product grows to this size, you’ll probably have better ways to noticeably improve its performance, like code splitting and lazy loading. Switching to a different CSS framework will be at the very bottom of the effort/gain list.

### Measuring INP

Until this moment, I had measured only the initial load performance. The interaction performance was slightly forgotten. This is because both of the solutions produce your normal CSS in the end, and the styling for both projects is pretty much identical. So, I don’t anticipate that anything can be different in that area.

However, this is just an assumption, and since all of my assumptions until now turned out to be incorrect, I definitely should check that one out.

To do that, I can measure what is known as [INP](https://web.dev/articles/inp). I.e., Interaction to Next Paint metric. To achieve what I want to achieve, I don’t even need to know any details about that metric. All I really need to see is whether it’s the same (I assume it will be) or not.

To do that, open the Performance panel in Chrome and interact with the page. Don’t record anything, and clean up any recording that you have there. You should see a picture like this:

![](https://cdn-images-1.medium.com/max/1024/0*g7DxcYNsKpYUBL2e.png)

There will be an overall number, the longest interaction. And then the stream of interactions underneath — it records everything that you do on a page.

Let’s, for example, record three things:

-   How long does it take to navigate between the “Settings” page and “Login” (click on the logo to get there).
-   How long does it take to open a “…” menu on the Home page.
-   In the “mobile” view, how long does it take to open the sidebar drawer by clicking on the “hamburger” menu.

I’ll record the initial click for each of those. It seems to be the longest. And then the average value afterward. I’ll also be recording them with a “low-tier” CPU throttling setting, otherwise the numbers are way too small.

![](https://cdn-images-1.medium.com/max/546/0*NDR7bWDRld3BmVnk.png)

Here are the results.

![](https://cdn-images-1.medium.com/max/1024/1*fnHNqTWN7GaiF0FcQ83RWQ.png)

Which is… weird. It seems like navigating to another page is more or less the same between the projects. But opening dropdowns and drawers seems to be noticeably slower in Tailwind? 🤔 Could it be some random fluctuation? Those INP numbers were really unstable compare to the network numbers.

To be absolutely sure, I run the measurements again on 20x CPU and an endless number of times. The absolute numbers still fluctuated greatly, but the trend was consistent: the Tailwind-based menus and drawers are slower.

![](https://cdn-images-1.medium.com/max/1024/0*A9MdNjB7ipkoLKHp.png)

This was an absolute table-flip moment for me. Not only every single one of my assumptions turned out to be wrong during this investigation. But the latest result just doesn’t make sense. The UI is the same, the produced DOM elements are the same, styling is the same except for a few broken colors here and there. There is no possible way that result can be so different! WHAT IS GOING ON??

Let’s think logically. First of all, I need to record the full performance profile for this interaction — maybe there is clue there. Click the “Record” button in the Performance profile, open the menu, stop the recording. Easy.

The result looks like this:

![](https://cdn-images-1.medium.com/max/1024/0*-0nky39A6cGv0t3o.png)

The exact names of functions here are jibberish, of course, and most of it is probably React internals. But it doesn’t really matter since I know already [how to interpret](https://www.developerway.com/posts/client-side-rendering-flame-graph) graphs like this. The important thing here is the longest bars at the bottom of a “flame” — those are the bottlenecks. In this case, there are two of them, both named “Recalculate style”.

Both the Tailwind and Linaria projects have exactly the same overall structure, with exactly the same long “Recalculate style” bars. Only in the case of the Tailwind project, those bars are **twice** as long. 85ms + 72ms for the Tailwind project and 48ms + 40ms for Linaria.

Okay, so what exactly is this “Recalculate style” task? [Quick googling reveals](https://developer.chrome.com/docs/devtools/performance/selector-stats) that this is when the browser iterates through DOM elements on a page and, you guessed it, recalculates their styles. It happens when something changes on a page, like an element is added or an attribute changes. So it makes a lot of sense that the browser does it when the dropdown opens: a new element is added.

What doesn’t make sense is why it would be different for exactly the same dropdown? Even more reading shows that I can record which selectors were involved in this operation and how long it took. This seems like something helpful, let’s try it!

Turning on the “Enable CSS selector stats” checkbox (it’s hidden inside the Settings cog in the Performance panel), recording the same interaction, and peeking into the Selector stats tab at the bottom. For the Tailwind project:

![](https://cdn-images-1.medium.com/max/1024/0*zHmAHvswGIXlb-Wq.png)

and Linaria:

![](https://cdn-images-1.medium.com/max/1024/0*fwWMgakLOXF61c0Y.png)

When sorted by “Match count”, which is how many times the browser tried to apply a particular selector, it’s very visible that the Tailwind project had twice as many attempts for ::after, ::before and \* selectors as Linaria. Plus, there is a :backgrop selector that is just not present in the Linaria project.

This seems like a very likely reason for the difference. Clicking on the links in the Style Sheet table reveals that the Tailwind-based project has this in its CSS file:

\*, :before, :after {  
    --tw-border-spacing-x: 0;  
    --tw-border-spacing-y: 0;  
    // bunch of other --tw-prefixed stuff  
}  
  
::backdrop {  
    --tw-border-spacing-x: 0;  
    --tw-border-spacing-y: 0;  
     // bunch of other --tw-prefixed stuff  
}

Where \* is a ["universal" selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Universal_selectors), i.e., it's applied to _every_ DOM node. [The same story](https://developer.mozilla.org/en-US/docs/Web/CSS/::before) is with :before, :after and [probably](https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop) :backdrop.

The Linaria-based project doesn’t have any of those.

So theoretically, looks like it’s very possible that the slowdown happens because of the additional selectors. I just need to verify it. The easiest way to do it is to copy-paste them manually to the pre-built index.css file of the Linaria project. The one inside dist/assets folder.

Then refresh the page, measure the same interaction, and voila! It’s as slow as in the Tailwind project! 🎉 I can do a little dance here 💃🏻

The final step, before I can close this investigation, is to figure out where those selectors come from. There is nothing like this [in the styles](https://github.com/developerway/ssr-deep-dive/blob/main/src/index.css#L1) I wrote, so it has to come from Tailwind itself.

And indeed, a simple process of elimination proves that it’s hidden inside @tailwind base; import. Non-fixable on my side in a sane way, it's an essential part of the framework.

### Results of the investigation

So, to summarise, what exactly did I discover during this investigation?

Tailwind, indeed, makes CSS smaller and HTML/JS larger. The CSS decrease for my project was 13%, the JS increase was 3%, and HTML varied from page to page: 4%, 70%, 162%.

Those increases and decreases affected initial load performance in **_exactly zero_** way.

But interestingly enough, the performance of some interactions is _worse_ with Tailwind, which was totally unexpected.

Does this mean that Tailwind is not a good choice for performance-conscious people? Absolutely not. It’s totally fine, same as Linaria.

This slight degradation of interaction performance is, first of all, a bit of an edge case and likely can be improved by rewriting the JavaScript part of it. Recalculating styles was not the only thing in that profile.

Secondly, it was still in the “green” zone even for the “low-tier mobile” simulation. Only when I decreased the CPU to 20x did it become red. So I’d say it’s something to keep an eye on if you’re writing apps primarily for customers on very old phones and very bad network connections. But for the rest of us, it’s unlikely to be a blocker for anything.

So, to answer the question from the beginning: what to choose for your new project, Tailwind or Linaria? Choose whichever dev experience you like the most. Or which is better maintained. Or which changes its API less. Or whichever is not owned by an Evil Corp of the month. Or any other reason you use to evaluate new libraries and frameworks.

From a performance perspective, you’re likely fine with both of them for a very long time.

_Originally published at_ [_https://www.developerway.com_](https://www.developerway.com/posts/tailwind-vs-linaria-performance)_. The website has more articles like this._ 😉

_Take a look at the_ [_Advanced React book_](https://advanced-react.com/) _to take your React knowledge to the next level._

[_Subscribe to the newsletter_](https://www.developerway.com/)_,_ [_connect on LinkedIn_](https://www.linkedin.com/in/adevnadia/) _or_ [_follow on Twitter_](https://twitter.com/adevnadia) _or_ [_Bluesky_](https://bsky.app/profile/adevnadia.bsky.social) _to get notified as soon as the next article comes out._

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=c2753594cd8f)