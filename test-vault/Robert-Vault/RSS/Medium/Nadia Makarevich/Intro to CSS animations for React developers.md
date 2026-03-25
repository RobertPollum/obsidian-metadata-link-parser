---
title: Intro to CSS animations for React developers
link: https://adevnadia.medium.com/intro-to-css-animations-for-react-developers-d42efc197f1f?source=rss-bcdf0570e41c------2
author: Nadia Makarevich
publish_date: 2024-10-04 04:58:33
saved_date: 2026-01-17 15:09:47
image: https://cdn-images-1.medium.com/max/1000/0*kIPEYshrXz49BGPs.png
tags: #css #front-end-development #javascript #frontend #react
---

![image](https://cdn-images-1.medium.com/max/1000/0*kIPEYshrXz49BGPs.png)

![](https://cdn-images-1.medium.com/max/1000/0*kIPEYshrXz49BGPs.png)

How do y’all feel about CSS animations? Unless you’re a big CSS connoisseur, I suspect you’re like me, and the answer will be, “I copy-paste snippets with some magic inside from all over the internet and hope it works 😅.”

Time to change that! Today, let’s simplify CSS animations in our React apps. “React apps” is key here, btw 😉. Doing animations in React properly involves not only knowing about the CSS part but also understanding the React lifecycle and how it renders and updates DOM elements.

And in the process, let’s implement some cool and useful stuff like expandable search field, smooth hover and focus transitions, cards that “pop” slightly, and a few variations of drawers that can slide in and out of the screen.

### Expandable search field with CSS transition

Let’s start with the simplest case. Have you ever seen a search field that expands when you click or tab to it? I want that!

And it’s pretty easy to achieve. All we need is for an input field to have a width property and then change it to another width on :focus. Input field itself:

<input type="text" className="search-input" placeholder="Search..." />

Its CSS:

.search-input {  
  ...  
  width: 5rem;  
  
  &:focus {  
    width: 20rem;  
  }  
}

This will change the width of the search field from 5 to 20 rem when the input is focused. However, the transition to the new width will be instantaneous, nothing fancy.

To fix this, we need the [CSS transition](https://developer.mozilla.org/en-US/docs/Web/CSS/transition) property. The API, at first glance, is a bit complicated. But in short, it’s a property that tells the browser how to _transition_ a style from one value to another gradually when that value changes.

All we need is to add a transition to the search that declares _what_ to transition and _how fast_, and we're good:

.search-input {  
  ...  
  transition: width 300ms;  
}

Now, when the width property changes for any reason, like us changing it on focus, the transition between values will take 300ms and will be silky smooth.

Check it out in the code example below.

### Improving hover and focus on buttons with CSS transition

We’re not limited to just width with transitions, by the way. Almost any CSS property can be transitioned. For example, when implementing buttons, we typically change their background on hover and add a ring on focus:

.button {  
  ...  
  background: #ffd7d5;  
  
  &:hover {  
    background: #e2a9a7;  
  }  
  
  &:focus {  
    box-shadow: 0 0 0 2px #f95e5a;  
  }  
}

These effects, again, will be instantaneous. To make them smooth, we can add a transition to both background and box-shadow:

.button {  
  transition: background 300ms, box-shadow 300ms;  
}

or even use all and make sure absolutely anything that changes in a button is transitioned:

.button {  
  transition: all 300ms;  
}

Now, hover and focus have an animated effect to them, check it out:

### Tabs: triggering transitions with React state change

Let’s finally do some React now. In React, when we need to change something on the screen, we change the state. For example, if I were implementing something like tabs, I would store the name of the current tab in the state and assign the isActive property to the selected tab button:

export default function App() {  
  const \[active, setActive\] = useState("first");  
  return (  
    <>  
      <div className="button-group">  
        <Button  
          isActive={active === "first"}  
          onClick={() => setActive("first")}  
        >  
          First  
        </Button>  
        ...  
      </div>  
    </>  
  );  
}

In Button, I'd change the styling of the button based on the isActive prop:

const Button = ({ isActive, onClick, children }: ButtonProps) => {  
  return (  
    <button className={isActive ? "active" : "normal"} onClick={onClick}>  
      {children}  
    </button>  
  );  
};

With CSS being something like this:

button {  
  ...  
  &.active {  
     background: #e2a9a7;  
   }  
  
   &.normal {  
     background: #ffd7d5;  
   }  
}

How do I make the transition between normal and active background smooth with this setup?

Well, actually, in exactly the same way as we did it with hover:

button {  
  transition: all 200ms;  
}

For transitions to work, it doesn’t really matter _where_ the change is coming from. All that matters is that a DOM element is rendered on the screen with one value in the “transitioned” property, and then this value is _updated_ in any way.

As we know, when React re-renders an element (i.e., Button) due to state change, it updates its DOM rather than destroying and re-creating it from scratch. So first, the button is rendered with the normal class and it receives the background style from it. Second, when the state changes and the button receives the isActive="true" prop, it's re-rendered, and it receives the active class instead of normal. The background style _changes_ on the existing button's DOM element from one value to another. The browser is smart enough to make the transition work.

However, what will happen if, for some reason, that button is forced to re-mount? We can easily imitate this by creating the Button component inside the App component:

export default function App() {  
  const \[active, setActive\] = useState("first");  
  
  // creating the button inside - don't do this in real apps!  
  const Button = () => ...  
  
  return (  
    <>  
      <div className="button-group">  
        <Button  
          isActive={active === "first"}  
          onClick={() => setActive("first")}  
        >  
          First  
        </Button>  
        ...  
      </div>  
    </>  
  );  
}

In this case, on every state update, all the mounted buttons will _unmount_ first. Their DOM elements and all of their styles will be destroyed, and the new DOM elements will be re-created from scratch. There will be no changes in the styles of existing DOM elements. As a result, transitions won’t work. Yet another reason to never create components inside other components.

See for yourself here:

If you’re not sure why this unmounting happens, I wrote a few deep dives on the topic, for example: [https://www.developerway.com/posts/reconciliation-in-react](https://www.developerway.com/posts/reconciliation-in-react) . Or watch my YouTube video course, it covers it in detail: [https://www.youtube.com/playlist?list=PL6dw1BPCcLC4n-4o-t1kQZH0NJeZtpmGp](https://www.youtube.com/playlist?list=PL6dw1BPCcLC4n-4o-t1kQZH0NJeZtpmGp).

### Making cards larger on hover with transform and transition

Transitions are not limited to just our regular colors or dimensions. They do real miracles when combined with transform - another CSS property that is rarely used to build interfaces but is invaluable when it comes to animations.

Imagine I render a gallery of cards on the screen:

<div className="card-group">  
  <a href="#" className="card">  
    <img src="url" alt="Happy life" />  
  </a>  
  ...  
  // more cards  
</div>

And I want to make a card slightly “pop” on hover, make it a bit bigger. How?

I could, of course, just make the width of a card slightly larger:

.card {  
  width: 8rem;  
  
  &:hover {  
    width: 9rem;  
  }  
}

But that change will make all other cards move since I’m changing the layout of the gallery that way, making the entire gallery janky. I could try to mitigate it with negative margins, but that’s quite complicated and fragile.

A much better solution is to use transform on the card and scale it a bit:

.card {  
  ...  
  
  &:hover {  
    transform: scale(1.04);  
  }  
}

transform allows us to scale, rotate, or move elements on the screen [without modifying the underlying layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms) of the page and disrupting the normal document flow. If I apply transform to any of the cards, everything around it will be rendered as if the card is still there, completely untransformed.

In theory, I can make that card fly around the page, rotate in the process, jump around every corner, and then return it back if I want to, and the rest of the page won’t notice or care. But let’s not go wild here and restrict ourselves to making the card slightly scaled and moving it a bit up:

.card {  
  ...  
  
  &:hover {  
    transform: scale(1.04) translateY(1rem);  
  }  
}

Then, add a transition to make the behavior smooth:

.card {  
  transition: all 300ms;  
  
  &:hover {  
    transform: scale(1.04) translateY(1rem);  
  }  
}

Maybe even add a bit of a delay to prevent the cards from moving around when moving the mouse over them fast:

.card {  
  transition: all 300ms;  
  transition-delay: 200ms;  
  
  &:hover {  
    transform: scale(1.04) translateY(1rem);  
  }  
}

The end result is basically perfection:

### Implementing sliding drawer with simple transition

Enough of the minor hover effects. Now, it’s time to get real and implement something more complicated. Let’s implement something that pretty much every website needs these days: a drawer that can slide in from outside the screen when needed and then slide back out when dismissed.

We’ll have an app, a state for the drawer’s “openness”, a button that triggers that state, and the drawer itself:

const App = () => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  
  return (  
    <>  
      <button onClick={() => setIsOpen(!isOpen)}>  
        toggle drawer  
      </button>  
      {isOpen ? <div className="drawer open">... drawer content</div> : null}  
    </>  
  );  
};

This is pretty standard code. When the state is true, we render the drawer; when it’s false, we remove it. (Notice a catch here? 😉 Keep reading!)

Now, onto the CSS. We’ll have two classes: a normal drawer for when the drawer is closed, and open for when it's, obviously, open. We'll position the drawer at the right end of the screen:

.drawer {  
  width: 22rem;  
  height: 100vh;  
  position: fixed;  
  top: 0;  
  right: 0;  
}

Move it outside the screen with the transform property:

.drawer {  
  ...  
  transform: translateX(24rem);  
}

And transform it back to 0 when the drawer has the .open class:

.drawer {  
  ...  
  transform: translateX(24rem);  
  
  &.open {  
    transform: translateX(0);  
  }  
}

The drawer here will appear instantly, which makes sense — we haven’t added any transition yet.

Let’s add it:

.drawer {  
  ...  
  transition: transform 600ms;  
}

And we should be good!

Except we’re not 😢. The animation doesn’t happen. The drawer still appears instantly. Do you know why, without looking at the solution?

The answer is here:

const App = () => {  
  ...  
  
  return (  
    <>  
      ...  
      {isOpen ? <div className="drawer open">... drawer content</div> : null}  
    </>  
  );  
};

Remember we discussed mounting/unmounting when we were implementing tabs?

When the isOpen state changes to true, we're mounting the drawer from scratch. When it switches back to false, we're unmounting and deleting it. There is no transition of CSS properties! The transform property is applied only once - when the drawer opens and mounts.

To fix this, we need to make sure that the open class is added or removed from the drawer that is always mounted. This forces React to update the div styles, which will trigger the transition:

const App = () => {  
  ...  
  
  return (  
    <>  
      ...  
      <div className={\`drawer ${isOpen ? 'open' : ''}\`}>... drawer content</div>  
    </>  
  );  
};

Now, the drawer finally works as intended! Check it out, nice and smooth:

There is, however, one caveat in this animated miracle. Hope you noticed it already.

When we switched to manipulating class names rather than unmounting the drawer, we did a terrible thing: we now always render the entire drawer content when the page is loaded.

For a tiny “how do you like my article” drawer with a single button, that might be okay. For a large app with multiple heavy drawers, that could slow it down badly. Especially if you’re fetching some data there — all the requests will be fired as soon as the drawer is mounted.

What I need is a way to animate that drawer right when it’s mounted without waiting for a transition. This brings me to the last piece of that animated puzzle: [CSS animation property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations) and keyframes.

### Implementing sliding drawer with animation and keyframes

The CSS animation property allows us to apply transitions to an element without waiting for any state changes or hover events. Right after it's mounted - exactly what we need.

It consists of two parts. First is the animation [property itself](https://developer.mozilla.org/en-US/docs/Web/CSS/animation), which allows us to configure which animation to apply to an element and all the other necessary parameters like the duration or delay of the animation. More or less the same as the transition property.

For our drawer, it could look like this:

.drawer {  
  &.slide-in {  
    animation: slidein 600ms;  
  }  
  
  &.slide-out {  
    animation: slideout 600ms;  
  }  
}

The .slide-in class has the animation property that applies the slidein animation with a 600ms duration. The same goes for .slide-out, only the animation name is slideout.

The second part is to describe what those named animations should do. This is the job of [keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes). Keyframes allow us to implement very granular and complicated movements, but the simplest version is just to define from and to. This will transition styles on an element from one value to another.

@keyframes slidein {  
  from {  
    transform: translateX(24rem);  
  }  
  
  to {  
    transform: translateX(0);  
  }  
}

This is our slidein animation - it transforms the drawer from behind the screen to visibility. Exactly the same as we did in the first drawer.

The slideout will be the same, only in reverse.

@keyframes slideout {  
  from {  
    transform: translateX(0);  
  }  
  
  to {  
    transform: translateX(24rem);  
  }  
}

And the final step is to apply those class names to our drawer:

const App = () => {  
  ...  
  
  return (  
    <>  
      ...  
      {isOpen ? (  
        <div className={\`drawer ${isOpen ? "slide-in open" : "slide-out"}\`}>  
          ... drawer content  
        </div> : null  
      }  
    </>  
  );  
};

Notice that isOpen prevents the drawer from rendering when it's false - exactly what I needed. And it actually works, the drawer opens with animation without being pre-rendered! 🎉

With one caveat — the slide-out animation didn't happen. The drawer just disappears instantly. This actually might be fine for a lot of use cases, so here's the working example to play around with:

However, if you want the full experience, with the drawer sliding out with animation as well, we need to fix it. I hope, at this point, you have a good understanding of how all of this works and can instantly point out why it happens.

The problem lies in unmounting: when we flip the isOpen state to false, React instantly removes the drawer from the DOM. The animation just doesn't have a chance to run 🥺.

To fix this, we need to introduce a “transitional” state — so that we can keep the drawer mounted while the animation is running and unmount it when it’s done.

We’ll have the state itself:

const \[isAnimating, setIsAnimating\] = useState(false);

We’ll add a ref and assign it to the drawer so that we can listen for animation-related events:

const drawerRef = useRef<HTMLDivElement>(null);  
  
...  
  
<div className={\`drawer ...}\`} ref={drawerRef}>  
  ... drawer content  
</div>

Add event listeners for [animationcancel](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event) and [animationend](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event) events to catch when the animation is done:

useEffect(() => {  
  drawerRef.current?.addEventListener("animationcancel", () => {  
    setIsAnimating(false);  
  });  
  drawerRef.current?.addEventListener("animationend", () => {  
    setIsAnimating(false);  
  });  
}, \[drawerRef.current\]);

Flip the isAnimating state to true when we open/close the drawer:

<button  
  className="button"  
  onClick={() => {  
    setIsOpen(!isOpen);  
    setIsAnimating(true);  
  }}  
\>  
  toggle the drawer  
</button>

And finally, keep the drawer mounted while the animation is running, i.e., isAnimating is true:

const App = () => {  
  ...  
  
  return (  
    <>  
      ...  
      {isOpen || isAnimating ? (... /\* drawer here \*/) : null  
      }  
    </>  
  );  
};

Phew! That’s a lot of stuff, but finally, we have a perfect drawer with slide-in and slide-out animation. Check it out here:

By the way, do you know what we just did? We implemented a very rudimentary version of the [react-transition-group](https://github.com/reactjs/react-transition-group) library 😅. So, we might as well just use it instead of trying to manage additional state and events manually.

### Implementing sliding drawer with react-transition-group

[react-transition-group](https://github.com/reactjs/react-transition-group) is a library that encapsulates the logic of tracking the animation state into a few components. For our drawer, we can use the [Transition](https://reactcommunity.org/react-transition-group/transition) component. It does pretty much what we did in the previous step. Only in addition, it manages when the transition starts and gives us that state in the form of a component with good old [render props](https://legacy.reactjs.org/docs/render-props.html).

We’d still need our isOpen state and the ref we'll attach to the animated element:

const App = () => {  
  const ref = useRef(null);  
  const \[isOpen, setIsOpen\] = useState(false);  
}

But that’s pretty much it. The rest of the code is to render the Transition component and the drawer inside:

<Transition  
  nodeRef={ref}  
  timeout={600}  
  in={isOpen}  
  mountOnEnter  
  unmountOnExit  
\>  
  {() => {  
    return (  
      <div  
        ref={ref}  
        className={\`drawer ${  
          isOpen ? "open-animated" : "close-animated"  
        }\`}  
      >  
        ...drawer content  
      </div>  
    );  
  }}  
</Transition>

The important things in this code are:

-   in - this is where we'd send our state that controls the drawer's visibility.
-   mountOnEnter and unmountOnExit - these will make sure that our drawer mounts/unmounts when it's open/close. So that we don't end up with an always-rendered drawer from the very first example.
-   nodeRef={ref} - don't forget to pass the ref from the div here as well.

🎉 And it just works!

Check it out here:

Pretty cool what’s possible today, right? Hope now you’ll be able to organize and lead a “CSS Animations Appreciation Society” in your company. Or at least be able to implement nice animated elements easily and show off in front of your colleagues 💪🏼.

_Originally published at_ [_https://www.developerway.com_](https://www.developerway.com/posts/intro-to-css-animations-for-react-devs)_. The website has more articles like this._ 😉

_Take a look at the_ [_Advanced React book_](https://advanced-react.com/) _to take your React knowledge to the next level._

[_Subscribe to the newsletter_](https://www.developerway.com/)_,_ [_connect on LinkedIn_](https://www.linkedin.com/in/adevnadia/) _or_ [_follow on Twitter_](https://twitter.com/adevnadia) _to get notified as soon as the next article comes out._

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=d42efc197f1f)