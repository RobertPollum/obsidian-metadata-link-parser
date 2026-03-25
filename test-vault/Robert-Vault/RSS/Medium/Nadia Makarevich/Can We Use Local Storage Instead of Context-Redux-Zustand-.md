---
title: Can We Use Local Storage Instead of Context-Redux-Zustand?
link: https://adevnadia.medium.com/can-we-use-local-storage-instead-of-context-redux-zustand-a3e9e19176e9?source=rss-bcdf0570e41c------2
author: Nadia Makarevich
publish_date: 2025-08-26 00:53:12
saved_date: 2026-01-17 15:09:47
image: https://cdn-images-1.medium.com/max/1024/1*2GLkCR_TGgOVIULDjgmtDQ.png
tags: #react #javascript #web-development #front-end-development
---

![image](https://cdn-images-1.medium.com/max/1024/1*2GLkCR_TGgOVIULDjgmtDQ.png)

![](https://cdn-images-1.medium.com/max/1024/1*2GLkCR_TGgOVIULDjgmtDQ.png)

I’ve recently got a question: “When to use Redux/Zustand/Context API and why are they actually needed in React? Why can’t local storage be used instead?”. I absolutely love questions like this. On the surface, the answer is simple: because they serve very different purposes.

That’s on the surface. But is it true? What makes their purposes so different? All of them are just storing data, are they not? Is it because React is doing something weird, and it would be okay to use in something like Svelte or Angular? Or is it the local storage itself that is problematic? Or maybe it’s not? Maybe it was problematic a long time ago, but not now?

After all, how great would it be to get rid of all those state management libraries and just leverage the native browser and language APIs, right?

Time to find out whether we can do that or not.

### Why Do We Need Context/Redux/Zustand

Let’s first talk about the purpose of Context/Redux/Zustand/etc. Why do we need them at all?

In React, everything revolves around state. We put data in state with hooks like useState or useReducer, render that data on the screen, and from time to time trigger state updates when we need to update the screen with new information. Usually, after a user interacts with the UI.

For simple state needs, “local” state, i.e., state that we control with the useState hook and that doesn't bleed outside of its component, is enough. Something like the isOpen state of a dropdown component. Only the dropdown itself will have access to it. Every other component won't care as long as the dropdown works.

const Dropdown = ({ children, trigger }) => {  
  // That's local state, only the Dropdown component knows about it  
  const \[isOpen, setIsOpen\] = useState();  
  
  return (  
    <>  
      <button onClick={() => setIsOpen(!isOpen)}>{trigger}</button>  
      {isOpen && children}  
    </>  
  );  
};

There are, however, use cases when the state needs to be _shared_ across different components. Something like a complicated set of filters that affects what is rendered in different places on the page. Or even something as simple as a “dark mode” theme, where there is one button to toggle it on and off in the corner of the app, but the isDarkMode value needs to be distributed to half of the components on the page.

In this case, we have a problem. React is strictly hierarchical: components can only share data via props/callbacks with their children/parents, never their siblings. So, in the case of theming, I can’t have a <ToggleTheme /> button that shares the current theme value with anyone other than its parent/children.

const App = () => {  
  return (  
    <>  
      {/\* This one has a local state with the isDarkMode state value \*/}  
      <ToggleTheme />  
      {/\* This one can't have access to the local state of ToggleTheme  
      and has no idea whether it's a light or dark theme. \*/}  
      <SomeBeautifulContentComponent />  
    </>  
  );  
};

To fix this, we have a technique called [“lifting state up”](https://react.dev/learn/sharing-state-between-components). Where the state moves to the closest common parent of the components that need it, and then is distributed via props. In our case, the App component:

const App = () => {  
  const \[isDarkMode, setIsDarkMode\] = useState(false);  
  
  return (  
    <>  
      {/\* Now ToggleTheme doesn't have state, it receives only props \*/}  
      <ToggleTheme  
        isDarkMode={isDarkMode}  
        onClick={() => setIsDarkMode(!isDarkMode)}  
      />  
      {/\* This one now has access to the theme value \*/}  
      <SomeBeautifulContentComponent isDarkMode={isDarkMode} />  
    </>  
  );  
};

This pattern, however, causes its own problems. The first problem is unnecessary re-renders, which is a [huge topic on its own](https://www.developerway.com/tags/re-renders).

The second problem is the bloated API of every component in the hierarchy. Even this simple change exploded the previously trivial code in complexity. But what if I needed a complicated object in state and multiple ways to update isolated slices of this state? And pass different slices to different components deeper down in the hierarchical tree?

The code would become unreadable and unmanageable very, very soon. And half of the components will be just passing data around without using it. This problem is called “prop drilling”.

To escape prop drilling, we need solutions like [Context](https://react.dev/learn/passing-data-deeply-with-context). With Context, we can extract everything state-related into its own component, and then access values and callbacks where they are needed _directly_. It’s like trying to move a piano from the 16th floor to the ground: you can either take the stairs and slowly but surely drag it from floor to floor. Or, you can just throw it off the balcony take the lift and skip all the floors in between.

The API of the App will return to where it was before, with the exception of one additional component that now holds the isDarkMode state and Context:

const App = () => {  
  return (  
    {/\* This one controls the isDarkMode state and distributes it via Context \*/}  
    <ThemeProvider>  
      {/\* This one uses isDarkMode from Context directly \*/}  
      <ToggleTheme />  
      {/\* This one also has access to isDarkMode via Context \*/}  
      <SomeBeautifulContentComponent />  
    </ThemeProvider>  
  );  
};

[Play around with this example](https://codesandbox.io/p/sandbox/context-vs-props-drilling-wynx85?file=%2Fsrc%2FApp.tsx%3A17%2C23) — it has two apps, one with props drilling, another with Context. To get a sense of both solutions.

Every other state management library, like Redux, Zustand, etc, solves exactly the same problem. They are just slightly different in their advantages/disadvantages and implementation. But the idea of avoiding prop drilling and organizing state into something more coherent is the main purpose of all of them.

What’s the difference, and how to choose between them, is its own topic and deserves its own article. So maybe later. For now, it’s time to focus on Local Storage.

### Why Do We Need Local Storage

Until this moment, we were operating within React itself and JavaScript as a result. Or, what I mean by this is we’re operating within the browser’s JavaScript runtime. All the variables that we created anywhere, be it state or not, will be gone as soon as the user closes the browser tab or even refreshes the web page.

Unless, of course, we want to prevent that and take some additional steps to _persist_ it somewhere more long-term. This is when we need some external data storage solutions, from full-on databases to JSON files. Or Local Storage.

[Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is a simple way to store and access data more permanently than a page’s short life. Everything you put into Local Storage will live there as long as the user’s _browser itself_ exists, not just a loaded tab. If you close the tab accidentally and then return to the page, the data will still be there.

The data there is scoped per _domain_. I.e., your website can control its own data, but nothing else. And no one else can control your data either.

You can store everything in local storage as long as it can be converted into a string. Next time you visit your favorite website, open DevTools in Chrome, navigate to the “Application” tab, open the “Local storage” tab, and take a peek at the data.

![](https://cdn-images-1.medium.com/max/1024/0*wRkDoQ5aonolZWAB.png)

You’ll see all sorts of things there: analytics data, metrics, theming, various tokens, tracking consents, and who knows what else.

Let’s take theming again as an example. It’s usually not something you’d want to introduce a backend and login for, especially for a simple website. But also, it’s not something you’d want the user to select every time they load your website. The solution: store the user’s preference in local storage and retrieve it from there on every page load rather than resetting it to the default value.

The Local Storage API is probably the simplest thing in JavaScript and React land. There isn’t even anything to say about it, it’s nothing more than “save item”, “get item”, “delete item”, “clear allthethings”. That’s it.

// Save theme in local storage  
localStorage.setItem("theme", "dark");  
  
// Extract theme from local storage  
const theme = localStorage.getItem("theme");  
  
// Delete theme from local storage  
localStorage.removeItem("theme");  
  
// Wipe the entire storage  
localStorage.clear();

On React’s side, we’d typically extract that value from Local Storage at the very beginning of the app:

const theme = localStorage.getItem("theme");

Put it in Context/Redux/Zustand, so that the theme can be accessed everywhere:

// Create Theme Context Provider, Zustand storage, Redux storage, etc  
const ThemeContext = createContext('light');  
  
const ThemeProvider = ({ children }) => {  
  // Extract from Local Storage and put it into memory for further React access  
  const theme = localStorage.getItem("theme");  
  
  return (  
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>  
  );  
};  
  
// Use it in App  
const App = () => {  
  return <ThemeProvider>{/\*... // the rest of the app\*/}</ThemeProvider>;  
};

Create a useTheme hook:

const useTheme = () => useContext(ThemeContext);

And then use it everywhere as any other shared state value:

// Various components that use the "theme" value from Context/Redux/Zustand  
const Button = () => {  
  const theme = useTheme();  
  
  return ... // button's implementation  
}  
  
const Navigation = () => {  
  const theme = useTheme();  
  
  return ... // navigation's implementation  
}

You see? Context and Local Storage have completely different purposes!

🤔

🤨

🤔

Or do they? Why can’t I just read from the Local Storage inside the useTheme hook? What was the point of introducing Context here? Why can't I do something like this and simplify the implementation?

const Button = () => {  
  const theme = localStorage.getItem("theme");  
  
  return ... // button's implementation  
}

Or, if we want to go fancy, why can’t we rewrite the useTheme hook instead? The Button wouldn't even have to know about Local Storage in this case:

// Why aren't we doing this? Why introduce Context?  
const useTheme = () => {  
  return localStorage.getItem("theme");  
};  
  
// Button wouldn't even have to know  
const Button = () => {  
  const theme = useTheme();  
  
  return ... // button's implementation  
}

No Context and related complexities, no Redux/Zustand, and the need to learn yet another library, the API is simple. What’s stopping us?

Plenty of reasons!

### “No” to Local Storage: Product Reasons

Sometimes, we simply don’t want the “persistent” effect of Local Storage, simple as that.

Yes, theming is something that should stay on page reload. But something like an expanded drawer, an opened modal dialog, or a “checked” checkbox probably should not. In fact, we’d probably _expect_ that a page reload would clear everything and give us the “default” page experience. Everything else will feel like a bug.

In this case, we’d mostly use Redux/Context/Zustand for most of the state concerns. And Local Storage can be responsible for things that we need to persist explicitly, like theming. Otherwise, we’d have to come up with a way to re-initialize everything in Local Storage on every page load, which would add complexity rather than remove it.

### “No” to Local Storage: Syncing with React

But let’s assume that from a product perspective, we indeed want to persist most of the state that we usually put into Redux/Context/Zustand. In this case, we still have an issue to solve: how to connect Local Storage to React.

Because when I implemented the “theming” above, I slightly lied to you. The way it’s currently presented, it will never work. Or, to be precise, it will work _weirdly_. One thing is missing there: clicking on the button should toggle the dark mode on and off.

const ToggleThemeButton = () => {  
  return (  
    <button  
      onClick={() => {  
        // We need to toggle the theme here  
      }}  
    >  
      Dark mode on/off  
    </button>  
  );  
};

If I call localStorage.setItem("theme", ...), it won't work.

// This is not going to work!  
const ToggleThemeButton = () => {  
  const theme = localStorage.getItem("theme");  
  
  return (  
    <button  
      onClick={() => {  
        // Just changes local storage value  
        // React can't pick it up  
        localStorage.setItem("theme", theme === "dark" ? "light" : "dark");  
      }}  
    >  
      Dark mode on/off  
    </button>  
  );  
};

Doing that will update the Local Storage value, true enough. So, on page refresh, the theme value will be read from the storage, and dark/light mode will switch. But it won’t switch _when we click the button_.

To make it properly interactive, we need to inform React that something has changed and it needs to update the UI. We need to trigger a _re-render_. If you have no idea what re-render is or why we need it to update anything in React, I have [a ton of resources](https://www.developerway.com/tags/re-renders) on the topic, including [a book](https://advanced-react.com/), half of which is dedicated to re-renders and what triggers them.

But the gist of it is: we need to trigger a _re-render_ to update anything in React. And the _only_ way to trigger it is to change state. Be it via useState & useReducer hooks, external libraries like Redux/Zustand, or even useSyncExternalStore. Basically, we need to connect the external system, i.e., Local Storage, to the React lifecycle in order to see any changes.

The simplest, “naive” way would be to include state into the useTheme hook:

const useTheme = () => {  
  // extract the initial value  
  const initialTheme = localStorage.getItem("theme") || "light";  
  // save it into state  
  const \[theme, setTheme\] = useState(initialTheme);  
  
  const toggleTheme = () => {  
    const newTheme = theme === "dark" ? "light" : "dark";  
    // when toggleTheme is called, set the new value both in state  
    // and in local storage  
    setTheme(newTheme);  
    localStorage.setItem("theme", newTheme);  
  };  
  
  return {  
    theme,  
    toggleTheme,  
  };  
};

We’d have the initial value extracted from Local Storage and put into the state. And a toggleTheme callback, inside of which we'd change the local state and then "mirror" that value back into Local Storage.

There is a problem with it, however. The “source of truth” here is the local state, with Local Storage used only during the initialization of the app. The local state is, well, _local_. It’s not shared in any way between different components. If I used that useTheme in two different places, I'd have two independent copies of that state. As a result, they will become out of sync with each other as soon as I trigger toggleTheme from any of them.

The behavior in this case will be pretty wacky 🤪 Check [out the example here](https://codesandbox.io/p/sandbox/local-storage-with-state-zyhfqj?file=%2Fsrc%2FApp.tsx), try to press the button, and then reload the page.

We’re back to the need to share state between different React components. I.e., we’re back to Context/Redux/Zustand.

The implementation, in this case, will move to the ThemeProvider (or Zustand/Redux equivalent):

// The entire implementation just moved to the provider  
const ThemeProvider = ({ children }) => {  
  const initialTheme = localStorage.getItem("theme") || "light";  
  const \[theme, setTheme\] = useState(initialTheme);  
  
  const toggleTheme = () => {  
    const newTheme = theme === "dark" ? "light" : "dark";  
    setTheme(newTheme);  
    localStorage.setItem("theme", newTheme);  
  };  
  
  return (  
    // In real life, don't forget to memoize the value here!  
    <ThemeContext.Provider value={{ theme, toggleTheme }}>  
      {children}  
    </ThemeContext.Provider>  
  );  
};

With the useTheme hook going back to extracting what it needs from React rather than Local Storage:

// Or Redux/Zustand equivalent  
const useTheme = () => useContext(ThemeContext);

[Here’s the working implementation](https://codesandbox.io/p/sandbox/local-storage-with-context-rrgqyt).

Does this mean that just React sucks, and Local Storage is a perfectly good state management solution if only it weren’t for React? 🤔

Actually, no 😉 Not this time. Local Storage has many more downsides outside of React that make its usage problematic for any state-management-related purpose.

### “No” to Local Storage: Listening to Change Event

First of all, what will happen if some other part of the app, whether it’s React or not, updates the “theme” value in Local Storage manually, outside of the React lifecycle? It could easily happen if the app is in the process of migrating from one framework to React (or vice versa). Or just by an oversight.

The values rendered in the UI and saved in Local Storage will become out of sync again, exactly the same as we just saw above. [Check out the example here](https://codesandbox.io/p/sandbox/local-storage-with-reset-3l9hdy?file=%2Fsrc%2FApp.tsx). For a “proper” solution, we need to listen to the changes in Local Storage itself and push them back to React when they happen.

This is not React, but raw JavaScript territory: we need to find an event to listen to and then add an event listener for that event with [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener). Quick googling reveals that there is a [“storage”](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event#syntax) event that is fired when the Local Storage is updated. So in theory, this should be easy:

const ThemeProvider = ({ children }) => {  
  // everything else stays the same  
  
  useEffect(() => {  
    // listening for all "storage" events  
    window.addEventListener("storage", (event) => {  
      // making sure that it's "theme" that was updated  
      if (event.key === "theme") {  
        // updating the React part as well  
        setTheme(event.newValue);  
      }  
    });  
  
    return ... // don't forget to clean up the event listener here  
  }, \[\]);  
  
};

All we need to do is add a useEffect inside our ThemeProvider, listen for the storage event with addEventListener, and update the state via setTheme. React will pick it up from here and update the UI with the correct values.

Except that it doesn’t work. [See for yourself](https://codesandbox.io/p/sandbox/local-storage-with-reset-and-listener-c3ytzr?file=%2Fsrc%2Ftheme-context.tsx) 😬.

If you’ve never worked with Local Storage before, debugging this might break your brain. Because the syntax and the usage are absolutely correct. And if you tend to skim the text part of the docs and read only code examples, as I do, it might take you a while to figure out why this is happening.

Because the answer is actually [in the docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event), in the very first paragraph 😅 It’s just easy to miss it. “The event is _not_ fired on the window that made the change”. Which means that the code example above works, but only if you open two tabs in parallel. If you click the “change storage value” in one tab, you’ll see that the value has changed _in another tab_. Just not in the tab that triggered the update.

This gives us some glorious opportunities to sync data _between_ tabs, but leaves a bit of a head-scratcher on what to do with the current tab. There are ways, of course, to deal with it if there is a real need.

The easiest way would be just to say that this behavior is not supported and ignore it 😅 It is, after all, quite a rare edge case.

We could also dispatch an event in the current tab manually when the update to the local storage is triggered. Something like this:

const e = new StorageEvent('storage', {  
  key: "theme",  
  newValue: value,  
  ... // other necessary properties  
});  
window.dispatchEvent(e);

Or even [patch the native implementation](https://stackoverflow.com/a/75465391), if there is a _really_ big need to support non-native behavior.

For our theming example, I went with the manual dispatch as the easiest option. [Play around with it here](https://codesandbox.io/p/sandbox/local-storage-with-reset-and-listener-fixed-6mpy44?file=%2Fsrc%2FApp.tsx).

This behavior can be a bit of a bummer if you really want to replace Redux/Context/Zustand with Local Storage. But let’s assume it’s a non-issue: we’re confident that no part of the app can change the storage value without our consent.

There are still other issues to consider that again have nothing to do with React itself. Server support, for example. Or lack thereof.

### “No” to Local Storage: SSR and Server Components

Anything that is stored in Local Storage won’t be available on the server. It’s a _browser_ API, after all. If you try to access localStorage directly while in the server environment, you'll get a "localStorage is not defined" error.

You’d have to either opt out of SSR for the parts of the app that use Local Storage, or render those parts with some sensible defaults and then override them with the values from Local Storage.

If SSR is important to you, this is something to keep in mind.

### “No” to Local Storage: Key-Value and Strings

Another thing to keep in mind is that Local Storage is a very simple key-value storage, and it’s global for your _entire domain_, **forever**. Every single page, every single external library that you install, will share the same global space as long as the browser lives. Could be years!

You need to be really careful with naming things in these conditions. Prepare to invent your own namespacing system. Otherwise, something accidentally overrides something, and your entire app crashes and glitches.

On top of that, the “value” part in this pairing is a **string** only. No booleans, no arrays, no objects. Say goodbye to your default type safety and prepare to convert everything back and forth. [Zod](https://zod.dev/) will become your best friend (although it already should be).

### “No” to Local Storage: Error Handling

Dealing with Local Storage means that you need to be very conscious of your error handling and monitoring. Namely, you need to have them 😅. Because Local Storage can throw and destroy your entire app.

First of all, you’re going to use JSON.parse(...) (or an equivalent in [Zod](https://zod.dev/)) a lot with Local Storage. Remember that you can [only store strings](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage#description) there? If you want to store some complicated state objects, they would first have to be [stringified](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) and then [parsed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) back. And JSON.parse(...) is really finicky and wants only syntactically correct JSON. Otherwise, it throws.

// This will destroy your entire app  
// if the value in storage is not a valid JSON  
const myState = JSON.parse(localStorage.getItem("my-state"));

Parsing our theme value by mistake (i.e., JSON.parse("dark")) will wreck your app. Strings are not valid JSON!

Second, it can throw a [SecurityError](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage#securityerror) if a user configures certain security policies. Don't ask which ones, I've never done it, but it's theoretically possible.

And lastly, did you know that Local Storage has a limit? 😉 No more than 5 MB is allowed. Anything more, and a QuotaExceededError will be thrown.

Granted, it’s pretty hard to exceed 5 MB of data. Unless, of course, you use it for something more than storing occasional string values, like the state of the entire app with backups. Or introduce a “memory” leak of sorts by accident, where you often store unique data and never clean it up (think timestamped analytics values). Rare, but also possible.

Good luck trying to explain to your non-technical users that they need to clear their local storage over the phone while you’re desperately working on a fix.

### “Yes” to Local Storage

To summarize: it’s actually possible to use Local Storage as state management and ditch the explicit usage of Redux/Zustand/Context. The solution, however, will be more complicated, more fragile, prone to throwing errors if not implemented correctly, and will have to use Redux/Zustand/Context underneath anyway. 😅 So there is no point, really, unless you have a pressing “product” need for data persistence.

What is Local Storage good for, though?

Form data backup, for instance. If you have a complicated form that users need to fill out, it would be a good idea to save the data periodically in Local Storage. So that you can instantly restore it in case they accidentally close the page.

As a mini-backend, in case you don’t want to bother with the real backend. Theming is a perfect example. Also, all sorts of no-login browser-only games. Some “nice to haves” in the UI, like remembering which tab was open or whether the side navigation is expanded or not.

To implement really cool things related to communication between different tabs. Like real-time editing, notifications, or something else entirely different and mind-blowingly impressive. Remember that incredibly cool [“merging gas giants”](https://www.youtube.com/watch?v=aKPkYY-CYuw) demo from a few years back? [Powered by Local Storage!](https://github.com/bgstaal/multipleWindow3dScene)

Just don’t use it as a replacement for shared state: we have Redux/Zustand/Context for that. We just need to figure out now what the difference is between them and how to choose the correct tool. But about that — in the next article 😉

_Originally published at_ [_https://www.developerway.com_](https://www.developerway.com/posts/local-storage-instead-of-context)_. The website has more articles like this._ 😉

_Take a look at the_ [_Advanced React book_](https://advanced-react.com/) _to take your React knowledge to the next level._

[_Subscribe to the newsletter_](https://www.developerway.com/)_,_ [_connect on LinkedIn_](https://www.linkedin.com/in/adevnadia/) _or_ [_follow on Twitter_](https://twitter.com/adevnadia) _or_ [_Bluesky_](https://bsky.app/profile/adevnadia.bsky.social) _to get notified as soon as the next article comes out._

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=a3e9e19176e9)