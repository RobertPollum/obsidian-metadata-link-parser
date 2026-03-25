---
title: How React Compiler Performs on Real Code
link: https://adevnadia.medium.com/how-react-compiler-performs-on-real-code-5241110febc5?source=rss-bcdf0570e41c------2
author: Nadia Makarevich
publish_date: 2024-12-12 02:27:37
saved_date: 2026-01-17 15:09:47
image: https://cdn-images-1.medium.com/max/1000/1*Jwn97eb8wBNS6omL_sHHsQ.png
tags: #web-development #software-development #frontend-development #react #performance
---

![image](https://cdn-images-1.medium.com/max/1000/1*Jwn97eb8wBNS6omL_sHHsQ.png)

![](https://cdn-images-1.medium.com/max/1000/1*Jwn97eb8wBNS6omL_sHHsQ.png)

The article follows the content and the structure of the talk I gave at “React Advanced” conference. If you prefer watching rather than reading, check it out: [How React Compiler Performs On React Code](https://www.youtube.com/watch?v=T-rHmWSZajc)

1.  [The problem of re-renders and memoization in React](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#973b)
2.  [React Compiler 🚀 to the rescue](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#197d)
3.  [React Compiler on simple examples](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#0695)
4.  [React Compiler on the real app](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#26e7)
5.  [Initial load performance and the React Compiler](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#ed40)
6.  [Interactions performance and React Compiler](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#be0e)
7.  [Can React Compiler catch all re-renders?](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#c3bb)
8.  [Quick summary](https://medium.com/@adevnadia/how-react-compiler-performs-on-real-code-5241110febc5#0787)

In the last few years, one of the biggest sources of excitement and anticipation in the React community has been a tool known as React Compiler (previously React Forget). And for a good reason. The central premise of the Compiler is that it will improve the overall performance of our React apps. And as a nice consequence — that we’ll never have to worry about re-renders, memoization, and useMemo and useCallback hooks.

But what’s the problem with React’s performance in the first place? And why do half of the devs desperately want to forget about memoization and those hooks? And how realistic is this promise?

This is what the article tries to answer. It summarises the problem the Compiler is trying to solve, how it is solved without the Compiler, and how the Compiler works on real code — I run it on an app that I’ve been working on for a while and measured the result of that.

### The problem of re-renders and memoization in React

So, what exactly is the problem here?

Most of the React apps out there are written to show some interactive UI (User Interface) to the user. When the user interacts with the UI, we usually want to update the page with some new information derived from that interaction. To do this in React, we trigger what is known as _re-render_.

![](https://cdn-images-1.medium.com/max/1024/0*rSU6XDavZDZhj4U4.png)

Re-renders in React normally are _cascading_. Every time a re-render of a component is triggered, it triggers a re-render of every nested component inside, which triggers the re-render of every component inside, and so on and so forth, until the end of the React components tree is reached.

![](https://cdn-images-1.medium.com/max/1024/0*UdCfBcAmxvn7y3XY.gif)

Normally, this is not something to worry about — React is pretty fast these days. However, if those downstream re-renders affect some heavy components or components that just re-render too much, this might cause performance problems. The app will become slow.

![](https://cdn-images-1.medium.com/max/1024/0*HQA863xC2iFJ0Cqs.png)

One way to fix this slowness is to stop the chain of re-renders from happening.

![](https://cdn-images-1.medium.com/max/1024/0*xwqJfOqLuy79dp04.png)

We have multiple techniques to do that — [moving state down](https://www.developerway.com/posts/react-re-renders-guide#part3.2), [passing components as props](https://www.developerway.com/posts/react-re-renders-guide#part3.3), extracting state into Context-like solution to bypass props drilling, to name a few. And memoization, of course.

Memoization starts with [React.memo](https://react.dev/reference/react/memo) — a higher-order component was given to us by the React team. To make it work, all we need to do is wrap our original component with it and render the “memoized” component in its place.

// memoize a slow component here  
const VerySlowComponentMemo = React.memo(VerySlowComponent);  
  
const Parent = () => {  
  // trigger re-render somewhere here  
  
  // render the memoized component in place of the original  
  return <VerySlowComponentMemo />;  
};

Now, when React reaches this component in the tree, it will stop and check whether its props have changed. If none of the props change, the re-renders will be stopped. However, if even one single prop has changed, React will continue with re-renders as if no memoization happened!

That means that for the memo to work properly, we need to make sure that all props stay _exactly the same_ between re-renders.

For primitive values, like strings and booleans, it’s easy: we don’t need to do anything other than just not changing those values.

const VerySlowComponentMemo = React.memo(VerySlowComponent);  
  
const Parent = () => {  
  // trigger re-render somewhere here  
  
  // "data" string between re-renders stays the same  
  // so memoization will work as expected  
  return <VerySlowComponentMemo data="123" />;  
};

Non-primitive values, like objects, arrays, and functions, however, need some help.

React uses referential [equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) to check for anything between re-renders. And if we declare those non-primitives inside the component, they will be re-created on every re-render, reference to them will change, and memoization won’t work.

const VerySlowComponentMemo = React.memo(VerySlowComponent);  
  
const Parent = () => {  
  // trigger re-render somewhere here  
  
  // "data" object is re-created with every re-render  
  // memoization is broken here  
  return <VerySlowComponentMemo data={{ id: "123" }} />;  
};

To fix this, we have two hooks: useMemo and useCallback. Both of those will preserve the reference between re-renders. useMemo is typically used with objects and arrays, and useCallback with functions. Wrapping props into those hooks is what we usually know as "memoizing props".

const Parent = () => {  
  // reference to { id:"123" } object is now preserved  
  const data = useMemo(() => ({ id: "123" }), \[\]);  
  // reference to the function is now preserved  
  const onClick = useCallback(() => {}, \[\]);  
  
  // props here don't change between re-renders anymore  
  // memoization will work correctly  
  return (  
    <VerySlowComponentMemo  
      data={data}  
      onClick={onClick}  
    />  
  );  
};

Now, when React encounters the VerySlowComponentMemo component in the render tree, it will check whether its props have changed, will see that none of them have, and will skip its re-renders. The app is not slow anymore.

This is a very much simplified explanation, but it’s quite complex already. To make the situation even worse, if we pass those memoized props through a chain of components, it becomes even more complicated — any change to them would require tracing those chains back and forth to make sure the reference is not lost in between.

As a result, it’s easier just not to do it at all or memoize everything everywhere just in case. Which, in turn, turns our beautiful code into an incomprehensible and unreadable mess of useMemo and useCallback.

![](https://cdn-images-1.medium.com/max/1024/0*8d5pN0Wk9_UsrmCm.png)

Solving this situation is the React Compiler’s main promise.

### React Compiler 🚀 to the rescue

[React Compiler](https://react.dev/learn/react-compiler) is a Babel plugin developed by the React core team, with the [Beta version released](https://react.dev/blog/2024/10/21/react-compiler-beta-release) in October 2024.

During build time, it tries to convert the “normal” React code into the code where components, their props, and the dependencies of hooks are memoized by default. The end result is the “normal” React code that behaves as if everything is wrapped in memo, useMemo, and useCallback.

![](https://cdn-images-1.medium.com/max/1024/0*u0XLwcYvp1nSGTv6.png)

Almost! In reality, it does much more complicated conversions and tries to adjust to the code as efficiently as possible. For example, something like this:

function Parent() {  
  
  const data = { id: "123" };  
  const onClick = () => {  
  
  };  
  
  return <Component onClick={onClick} data={data} />  
}

Will be transformed into this:

function Parent() {  
  const $ = \_c(1);  
  let t0;  
  if ($\[0\] === Symbol.for("react.memo\_cache\_sentinel")) {  
    const data = {  
      id: "123",  
    };  
    const onClick = \_temp;  
    t0 = <Component onClick={onClick} data={data} />;  
    $\[0\] = t0;  
  } else {  
    t0 = $\[0\];  
  }  
  return t0;  
}  
function \_temp() {}

Notice how onClick is cached as a \_temp variable, but data is just moved inside the if statement. You can play around with it some more in the [Compiler Playground.](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEACgIYwKY4AUAlEcADqYtFFyFg5EAmZOMkQC8jInl7IiTEAEYATAGYZRAL4BuFmw5cehAMIAbPHADWIovREA+Rto1biRSjljEAPPogBbAA6EqPUwjE1NhYANjM1U+ATJw-kEYgHprFlUWEFUgA)

The mechanics of how it works are fascinating, so if you want to know more, there are a few videos by the React core team available, such as the [Deep dive into the Compiler talk](https://www.youtube.com/watch?v=0ckOUBiuxVY&t=9309s&ab_channel=ReactConf).

For the purpose of this article, however, I am more interested in whether our expectations from the Compiler match the reality and whether it’s ready for use by the broader public like me.

The main questions that immediately come to mind for almost everyone when they hear about “the Compiler will memoize everything”:

-   **What about initial load performance?** One of the big arguments against “memoizing everything by default” has always been that it can negatively affect it since React has to do much more stuff in advance when everything is memoized
-   **Will it have a positive performance impact** at all? How much of a problem re-renders really are?
-   **Can it really catch all re-renders?** JavaScript is notorious for being fluid and ambiguous. Is the Compiler smart enough to really catch everything? Is it true that we’ll never have to think about memoization and rerenders ever again?

To answer those questions, I run the Compiler on a few synthetic examples, just to make sure it actually works, and then run it on a few pages of an app I’m working on.

### React Compiler on simple examples

The **first example** is this.

const SimpleCase = () => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  
  return (  
    <div>  
      <button onClick={() => setIsOpen(!isOpen)}>toggle</button>  
      {isOpen && <Dialog />}  
      <VerySlowComponent />  
    </div>  
  );  
};

I have a component with a dialog, a state for this dialog, a button that can open it, and a VerySlowComponent somewhere underneath. Let's say it takes 500ms to rerender it.

Normal React behavior would be to re-render everything when the state changes. As a result, the dialog pops up with a delay because of the slow component. If I wanted to fix it with memoization, I’d have to wrap the slow component into memo:

const VerySlowComponentMemo = React.memo(VerySlowComponent);  
  
const SimpleCase = () => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  
  return (  
    <div>  
      <button onClick={() => setIsOpen(!isOpen)}>toggle</button>  
      {isOpen && <Dialog />}  
      <VerySlowComponentMemo />  
    </div>  
  );  
};

Let’s instead enable the Compiler for the code. First of all, I see this in the React Dev Tools:

![](https://cdn-images-1.medium.com/max/558/0*C57TaU6COO2ZtMGm.png)

That means that the Button and VerySlowComponent are memoized by the Compiler. And if I add a console.log inside the VerySlowComponent, it's not triggered when I change state. That means that the memoization indeed works, works correctly, and the performance problem here is fixed. When I trigger the dialog, it pops up without a delay.

![](https://cdn-images-1.medium.com/max/724/0*F-X7QxNj8FOYfUmq.gif)

In the **second example**, I added more props to the slow component:

const SimpleCase = () => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  
  return (  
    <div>  
      <button onClick={() => setIsOpen(!isOpen)}>toggle</button>  
      {isOpen && <Dialog />}  
      // add "data" and "onClick" props  
      <VerySlowComponent data={{ id: "123" }} onClick={() => {}} />  
    </div>  
  );  
};

Manually, I’d need to memoize using all three tools: memo, useMemo, and useCallback.

const SimpleCase = () => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  const data = useMemo(() => ({ id: "123" }), \[\]);  
  const onClick = useCallback(() => {}, \[\]);  
  
  return (  
    <div>  
      <button onClick={() => setIsOpen(!isOpen)}>toggle</button>  
      {isOpen && <Dialog />}  
      <VerySlowComponentMemo data={data} onClick={onClick} />  
    </div>  
  );  
};

The Compiler performed flawlessly here again, and the result was the same as in the first example: everything is memoized correctly, and the Dialog pops up without a delay.

In the **third example,** I passed another component as children to the slow component like this:

const SimpleCase = () => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  
  return (  
    <div>  
      <button onClick={() => setIsOpen(!isOpen)}>toggle</button>  
      {isOpen && <Dialog />}  
  
      <!-- Acceps Child now -->  
      <VerySlowComponent>  
        <Child />  
      </VerySlowComponent>  
    </div>  
  );  
};

Do you know, off the top of your head, how to memoize that thing correctly? Most people would think it’s this:

const VerySlowComponentMemo = React.memo(VerySlowComponent);  
const ChildMemo = React.memo(Child);  
  
const SimpleCase = () => {  
  
  return (  
    <div>  
      ...  
      <VerySlowComponentMemo>  
        <ChildMemo />  
      </VerySlowComponentMemo>  
    </div>  
  );  
};

Which is, unfortunately, incorrect. The tree-like syntax here is nothing more than syntax sugar for children prop. The code example above can easily be re-written to be this:

const VerySlowComponentMemo = React.memo(VerySlowComponent);  
const ChildMemo = React.memo(Child);  
  
const SimpleCase = () => {  
  
  return (  
    <div>  
      ...  
      <VerySlowComponentMemo children={<ChildMemo />} />  
    </div>  
  );  
};

Also, <ChildMemo /> here is again nothing more than syntax sugar for an Element, which is a result of React.createElement function call, which is an object with type property pointing to the ChildMemo function:

const VerySlowComponentMemo = React.memo(VerySlowComponent);  
const ChildMemo = React.memo(Child);  
  
const SimpleCase = () => {  
  
  return (  
    <div>  
      ...  
      <VerySlowComponentMemo children={{ type: ChildMemo }} />  
    </div>  
  );  
};

What we have here, unfortunately, is a non-memoized object as a prop to the memoized component. Memoization doesn’t work, and VerySlowComponentMemo will re-render with every state change.

The correct way to memoize this example is to do it as any other object:

const VerySlowComponentMemo = React.memo(VerySlowComponent);  
const ChildMemo = React.memo(Child);  
  
const SimpleCase1 = () => {  
  const children = useMemo(() => <ChildMemo />, \[\]);  
  
  return (  
    <div>  
      ...  
      <VerySlowComponentMemo>  
        {children}  
      </VerySlowComponentMemo>  
    </div>  
  );  
};

The result of enabling the Compiler on the non-memoized third example was exactly the same as before: the Compiler managed to memoize it correctly, the performance problem was fixed.

That is three out of three for the Compiler so far. 🏆🏆🏆

But small examples like that are “easy.” To test the Compiler properly, I run it on a [real app](https://www.buckets-ui.com/) I’ve been working on for a while.

### React Compiler on the real app

The app is completely new, fully typescriptified, has no legacy code, only hooks, and everything is the latest best practices (more or less). It has a landing page, a few internal pages, and is around 15k lines of code. Not the largest app ever, but good enough for a proper test, I’d say.

Before turning on the compiler, I ran the [health check and the eslint](https://react.dev/learn/react-compiler) rules provided by the React team. That’s the health check results:

Successfully compiled 361 out of 363 components.  
  
Found no usage of incompatible libraries.

And I had zero eslint rules violations.

I used [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) to measure initial load and interaction performance. Everything is measured on production build in the “mobile” mode with the CPU slowed down 4 times. And I ran all the tests 5 times and extracted the average.

Time to answer the questions.

### Initial load performance and the React Compiler

The very first page I measured was the “landing” page of the app. Those are the stats before enabling the Compiler:

![](https://cdn-images-1.medium.com/max/1008/0*vc3C2g4GFZHdUrBV.png)

Enabling the Compiler and making sure it works:

![](https://cdn-images-1.medium.com/max/508/0*oBQHJK7Igjb580T0.png)

And measuring the result:

![](https://cdn-images-1.medium.com/max/1024/0*V819MH8s7nvACYiM.png)

The first picture is before, the second is after. As you can see, the results are pretty much identical.

To be sure, I ran it on a few more pages, and the results were more or less the same. Some numbers would increase a little, some would even decrease. Nothing drastic.

I think I can add another win to the Compiler (🏆🏆🏆🏆) and answer the first question I was investigating: **the Compiler seems to have minimal to no impact on the initial load**. So that’s good. It doesn’t make things worse despite memoizing everything.

### Interactions performance and React Compiler

#### Measuring the first page

To measure the interaction performance, I started with a “component” page. On this page, I’m showing a preview of React components for the UI components library I’m working on. The preview can be anything from a button to an entire page. I measured the preview of a “Settings” page.

The preview page has “light” and “dark” mode toggle. As you can see below, toggling the mode causes the preview to re-render — the green lines indicate that.

![](https://cdn-images-1.medium.com/max/710/0*JIjRcc1NhXkTXA-i.gif)

The performance of this interaction before and after the Compiler looks like this:

![](https://cdn-images-1.medium.com/max/1024/0*obzwxC6s__zCPkYL.png)

Total blocking time dropped from 280ms to literally zero with the Compiler enabled!

This is very impressive. But it also made me curious: how exactly this happened? What did I do so wrong in the code?

The code for this page looks like this:

export default function Preview() {  
  const renderCode = useRenderCode();  
  const darkMode = useDarkMode();  
  
  return (  
    <div  
      className={merge(  
        darkMode === "dark" ? "dark bg-buGray900" : "bg-buGray25",  
      )}  
    >  
      <LiveProvider  
        code={renderCode.trim()}  
        language="tsx"  
      >  
        <LivePreview />  
      </LiveProvider>  
    </div>  
  );  
}

The LiveProvider block is the thing that renders the entire "Settings" component passed to it as a string. I literally have here one of the simple examples I explored at the beginning - a Very Slow Component ( LiveProvider) with a few props.

The Compiler managed to pick this up, which is very cool. But also, it feels a bit like cheating 😅 A more common scenario would be to have a bunch of small to medium-sized components everywhere. So, I measured the next page, which feels a bit closer to it.

#### Measuring second page

On the next page, I have a bunch of components in the header, some footer, and a list of Cards in between. In the header, there are a few “quick filters”: Button, Input Field, Checkbox. When I select the Button, I see the list of all the Cards that have Button inside. When I enable the Checkbox — the list is updated with additional cards that also have a Checkbox inside.

Without memoization, the entire page, including the very long list of cards, re-renders.

![](https://cdn-images-1.medium.com/max/624/0*8y_vUPI3rkVcXD52.gif)

The performance of adding Checkbox cards to the already existing list before and after the Compiler looks like this.

![](https://cdn-images-1.medium.com/max/1024/0*E6ud3Cz08j2x7kB-.png)

The blocking number dropped from 130 ms to 90 ms. Still pretty good and much more realistic! However, if all re-renders on that page had been eliminated, I would’ve expected the numbers to drop much more. Adding just a few cards to an already existing list should’ve been almost instantaneous.

I checked the re-renders situation here, and unfortunately — yes. While most of the re-renders have been eliminated, the cards themselves, which happen to be the heaviest on the page, still re-render.

![](https://cdn-images-1.medium.com/max/1024/0*fzt_HBPfUekhj20S.gif)

Checking the code again — and it’s a mystery. Because the code is the most standard code you’ll see in React. Just map over an array of data and render GalleryCard item inside.

{data?.data?.map((example) => {  
    return (  
      <GalleryCard  
        href={\`/examples/code-examples/${example.key}\`}  
        key={example.key}  
        title={example.name}  
        preview={example.previewUrl}  
      />  
    );  
  })}

The very first thing that I do when debugging Compiler issues is to re-implement memoization with the classic tools. In this case, all I need to do is to wrap the card in React.memo, and if the code is good, the existing cards should stop re-rendering and that would mean that the Compiler bailed on this component for some reason.

// somewhere before  
const GalleryCardMemo = React.memo(GalleryCardMemo);  
  
// somewhere in render function  
{data?.data?.map((example) => {  
  return (  
    <GalleryCardMemo  
      href={\`/examples/code-examples/${example.key}\`}  
      key={example.key}  
      title={example.name}  
      preview={example.previewUrl}  
    />  
  );  
})}

Which doesn’t happen.

That means that the Compiler is not at fault — something is deeply wrong with the code itself.

As we already know, if even a single prop changes on a memoized component, then the memoization won’t work, and re-render will happen. So, something must be wrong with the props. Upon closer examination, all of them turned out to be primitive strings except for this one: example.previewUrl. This turned out to be an object:

{  
  light: "/public/light/...",  
  dark: "/public/dark/...",  
};

So, the object changes its reference between re-renders, then. But how? it’s coming from a data variable, which in turn comes from querying a REST endpoint with the [React Query library](https://tanstack.com/query/latest):

const { data } = useQuery({  
  queryKey: \["examples", elements.join(",")\],  
  queryFn: async () => {  
    const json = await fetch(\`/examples?elements=${elements.join(",")}\`);  
    const data = await json.json();  
  return data;  
},  
});

React Query caches the data that is returned from queryFn based on the key provided in the queryKey. Looks like, in my case, I'm changing the key based on the selected element by joining the elements array. So if only the Button is selected, the key will be button, if the Checkbox is added to the list, the key turns into button,checkbox.

So my theory here is that React Query thinks of those two keys and the data returned for them as completely different data arrays. This makes a lot of sense to me — I haven’t indicated to it in any way that those arrays are the same and can be just updated.

So what happens, I suspect, is that when the key changes from button to button,checkbox the query library fetches the new data and returns it as a completely new array with all the objects inside having completely new references. As a result, the memoized GalleryCard component receives a new reference for one of its non-primitive props, memoization for it doesn't work, and it still re-renders, even though the data is technically the same.

It’s very easy to verify this: I just need to turn that object into primitive props to get rid of the changing reference.

{data?.data?.map((example) => {  
  return (  
    <GalleryCardMemo  
      href={\`/examples/code-examples/${example.key}\`}  
      key={example.key}  
      title={example.name}  
      // pass primitives values instead of the entire object  
      previewLight={example.previewUrl.light}  
      previewDark={example.previewUrl.dark}  
    />  
  );  
})}

And indeed, all re-renders stopped completely after I’ve done it!

Final step: measure it to see how much of an impact my change actually had.

![](https://cdn-images-1.medium.com/max/1024/0*U2VbAv7mxOOjOyAa.png)

Boom! Blocking time dropped to zero, Interaction to Next Paint more than halved. It’s a 🎤 drop situation, I feel. The Compiler improved the performance a little bit, but I did it much better ✌🏼 💪🏼

I think this can answer the second most common question: can the Compiler have an impact on interaction performance? The answer: it can, it’s noticeable but varies from page to page, and humans are still better at it if they really try.

### Can React Compiler catch all re-renders?

Time to answer the final question. Is the Compiler smart enough to really catch everything? We already seen that the answer here is probably a no.

But to test it a bit more, I collected a list of the most noticeable re-renders in my app and checked how many re-renders were still present after I enabled the Compiler.

I identified 9 cases of noticeable re-renders, situations like “the entire drawer re-renders when tabs change” and so on. This is the end result. Out of 9 cases:

-   I had **two** where all re-renders were completely 100% fixed
-   **two** where not a single one of them was fixed
-   and the rest were somewhere in between, like in the investigation above.

The cases where nothing was fixed were the Compiler bailed out from the component because of this line, by the way:

const filteredData = fuse.search(search);

Just this line alone. I never even used the filteredData variable anywhere. fuse here is an external fuzzy search library. So, the most likely reason for this behavior is that the library is doing something incompatible with the compiler, and this is out of my control.

So the answer to whether the Compiler can catch absolutely every re-render is clear here. It’s a definite no. There will always be some external dependency that is just plain incompatible with the Compiler itself or with the memoization rules.

Or there will be some weird legacy code that the Compiler doesn’t know how to process.

Or the code that I had, which is not exactly _wrong_ per se but just not fine-tuned for memoization.

### Quick summary

Let’s quickly summarise the results of the investigation and the outcome.

![](https://cdn-images-1.medium.com/max/1024/0*MEILuWinv0JyMk56.png)

-   **Initial load performance** — I saw no negative impact.
-   **Interactions performance** — they improved, some of them a lot, some of them a little.
-   **Can it catch all re-renders** — no, and it never will.

Does it mean that the answer to the question “Can we forget about memoization soon?” is a “no”? Not necessarily! It depends.

If the performance of your app is not the most important thing in the world, or if it’s “okay-ish, could be better, but I couldn’t be bothered”, enabling the Compiler will likely make it slightly better or even good enough at a low cost. The definition of “good enough” will be up to you. But I suspect that for most people, turning on the Compiler and forgetting about memoization will be enough.

However! If “good enough” is not so good for you, and you need to squeeze **every millisecond** out of your app, welcome back to the manual memoization.

For you, the answer will be no — you can’t forget them. Sorry. You’d have to know everything that we need to know now, plus on top of that — what the Compiler does and how. So your job will become slightly harder.

But I think there will be very few of you who would _actually_ need to know all of this.

And if you want to be one of those people, I wrote [lots of articles](https://www.developerway.com/tags/performance) on the topic, [released a bunch of YouTube videos,](https://www.youtube.com/playlist?list=PL6dw1BPCcLC4n-4o-t1kQZH0NJeZtpmGp) and even [wrote a book](https://advanced-react.com/), half of which is dedicated to re-renders and how to get rid of them. Check them out 😉

_Originally published at_ [_https://www.developerway.com_](https://www.developerway.com/posts/how-react-compiler-performs-on-real-code)_. The website has more articles like this._ 😉

_Take a look at the_ [_Advanced React book_](https://advanced-react.com/) _to take your React knowledge to the next level._

[_Subscribe to the newsletter_](https://www.developerway.com/)_,_ [_connect on LinkedIn_](https://www.linkedin.com/in/adevnadia/) _or_ [_follow on Twitter_](https://twitter.com/adevnadia) _or_ [_Bluesky_](https://bsky.app/profile/adevnadia.bsky.social) _to get notified as soon as the next article comes out._

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=5241110febc5)