---
title: Existential React questions and a perfect Modal Dialog
link: https://adevnadia.medium.com/existential-react-questions-and-a-perfect-modal-dialog-8a8b1dbcff6d?source=rss-bcdf0570e41c------2
author: Nadia Makarevich
publish_date: 2024-12-04 21:09:39
saved_date: 2026-01-17 15:09:47
image: https://cdn-images-1.medium.com/max/1000/1*JfiR3bPBHFQws09y4Mg-zQ.png
tags: #software-development #reactjs #front-end-development #react #javascript
---

![image](https://cdn-images-1.medium.com/max/1000/1*JfiR3bPBHFQws09y4Mg-zQ.png)

![](https://cdn-images-1.medium.com/max/1000/1*JfiR3bPBHFQws09y4Mg-zQ.png)

What do you think is the most complicated thing in React? Re-renders? Context? Portals? Concurrency?

Nope.

The hardest part of React is everything _non-React_ around it. The answer to the question “How do those things listed above work?” is straightforward: it’s just a matter of following the algorithm and taking notes. The result will be definitive and always the same (if you trace it down correctly). It’s just science and facts.

But what about “What makes a component _good_?” or “What is the right way to implement… (something)?” or even “Should I use a library or build my own solution?” The only factually correct answer here is “It depends.” It happens to be the least helpful one.

I wanted to find something better than this for the new article. But since there can’t be simple answers and universal solutions for those types of questions, the article turned out to be more of a walk-through of my thought process rather than “this is the answer, do it always.” Hope it’s still useful.

So, what it takes to move a feature from an idea to a production-ready solution? Let’s try to implement a simple Modal Dialog and see. What can possibly be complicated about that one? 😉

### Step 1: Start with the simplest solution

Let’s start with what is sometimes known as a “spike” — the simplest possible implementation that can help explore potential solutions and gather further requirements. I know that I’m implementing a modal dialog. Let’s assume I have a pretty design like this:

![](https://cdn-images-1.medium.com/max/918/0*cesB5tQzR5LoF0Mv.png)

A dialog is basically an element on the screen that appears when something like a button is clicked. So that’s exactly where I’ll start.

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpen(true)}>  
        Click me  
      </button>  
      {isOpen ? (  
        <div className="dialog">some content</div>  
      ) : null}  
    </>  
  );  
}

State, a button that listens for clicks, and a future dialog that is shown when the state is true. Dialog is also supposed to have a “close” action:

<button  
  className="close-button"  
  onClick={() => setIsOpen(false)}  
\>  
  Close  
</button>

It also has a “backdrop” — a clickable semi-transparent div that overlays the content and triggers the modal’s disappearance when clicked.

<div  
  className="backdrop"  
  onClick={() => setIsOpen(false)}  
\></div>

All together:

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpen(true)}>  
        Click me  
      </button>  
      {isOpen ? (  
        <>  
          <div  
            className="backdrop"  
            onClick={() => setIsOpen(false)}  
          ></div>  
          <div className="dialog">  
            <button  
              className="close-button"  
              onClick={() => setIsOpen(false)}  
            >  
              Close  
            </button>  
          </div>  
        </>  
      ) : null}  
    </>  
  );  
}

I also usually add decent styles early on. Seeing the feature I’m implementing appear on the screen with the same look as it is supposed to helps me think. Plus, it can inform the layout of the feature, which is exactly what will happen with this dialog.

Let’s quickly add CSS for the backdrop - it's nothing special, just a semi-transparent background on a div with position: fixed that takes the entire screen:

.backdrop {  
  background: rgba(0, 0, 0, 0.3);  
  position: fixed;  
  top: 0;  
  left: 0;  
  width: 100%;  
  height: 100%;  
}

The dialog is slightly more interesting since it needs to be positioned in the middle of the screen. There are 1001 ways to achieve that in CSS, of course, but my favorite and probably the simplest one is this:

.dialog {  
  position: fixed;  
  left: 50%;  
  top: 50%;  
  transform: translate(-50%, -50%);  
}

We use a “fixed” position to escape from the layout constraints, add 50% left and top to move the div in the middle-ish, and transform it back by 50%. The left and top will be calculated relative to the screen, and the transform will be relative to the width/height of the div itself, so as a result, it will appear right in the middle regardless of its width or width of the screen.

The last bit of CSS in this step is to properly style the dialog itself and the “close” button. Not going to copy-paste it here, the actual styles are not that important, just take a look at the example:

### Step 2: stop, ask questions and think

Now that I have a rough implementation of the feature, it’s time to make it “real.” To do that, we need to understand in detail what exactly we’re trying to solve here and for whom. Technically speaking, we should understand that _before_ coding anything, so quite often, this step should be **Step 1**.

Is this dialog part of a prototype that needs to be implemented as quickly as possible, shown to the investors once, and never used again? Or maybe it’s part of a generic library that you’re going to publish on npm and open source? Or maybe it’s part of the design systems that your 5,000-person organization will use? Or is it part of the internal tooling for your small 3-person team and nothing else? Or maybe you work for something like TikTok, and this dialog will be part of the web app available only on mobile? Or maybe you work for an agency that writes apps for the government only?

Answering those questions sets the direction of what to do next when it comes to coding.

If it’s just a prototype to be used once, it might be good enough already.

If it’s going to be open-sourced as part of a library, it needs to have a very good general-purpose API that any developer in the world can use and understand, lots of tests, and good documentation.

The dialog that is part of the design systems of a 5,000-person org needs to adhere to the organization’s design guidelines and might be restricted in what external dependencies are brought into the repo. So, you might need to implement many things from scratch rather than doing npm install new-fancy-tool.

The dialog of an agency that builds for the government probably needs to be the most accessible and regulations-compliant dialog in the universe. Otherwise, the agency might lose the government contracts and go bankrupt.

And so on and so on.

For the purpose of this article, let’s assume that the dialog is part of a fresh, currently in-progress redesign of an existing large commercial website with thousands of users from all over the world daily. The redesign is so in progress that the only design with the dialog I got is this:

![](https://cdn-images-1.medium.com/max/918/0*BGcCA4W1NH-kLGCI.png)

The rest will come later, the designers are swamped. Also, I’m part of the permanent team that does the re-design and maintains the website going forward, not an external contractor hired for a single project.

In this case, having only this picture and knowing about our company’s goal gives me enough information to make reasonable assumptions and implement 90% of the dialog. The rest of the 10% can be fine-tuned later.

Those are the assumptions I can make based on the information above:

-   The existing website has thousands of users daily from all over the world, so I need to ensure the dialog, at the very least, works on both large and mobile screens, as well as different browsers. Ideally, I need to check existing analytics to be absolutely sure, but it’s a pretty safe bet.
-   More than one developer is writing code for this, and the code is here to stay. The website is large and already has thousands of users; it’s not a quick prototype for the investors. So, I need to make sure that the code is readable, the API makes sense, it is usable and maintainable, and it doesn’t have obvious foot guns.
-   The company cares about its image and the quality of its website — otherwise, why would they do a redesign at all? (Let’s assume positive intent here 😅). That means that a certain level of quality is expected, and I need to think ahead and anticipate common scenarios and edge cases, even if they are not part of the current design yet.
-   Many users likely mean that not all of them exclusively use the mouse to interact with the website. The dialog must also be available via keyboard interactions and maybe even assistive technology like screen readers.
-   A large existing codebase (it’s a re-design, remember!) means that there are likely restrictions on the external dependencies I can bring for this feature. Any external dependency comes at a cost, especially in large and old codebases. For the purpose of the article, let’s assume that I can use an external library, but I would need to have a good rationale for this.
-   Finally, more designs are coming, so I need to anticipate which way it can go from the design and user point of view and make sure the code can handle it early on.

### Step 3: solidify the Modal Dialog API

Now that I know the requirements and have reasonable guesses, I can make the actual dialog component. First of all, from this code:

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpen(true)}>  
        Click me  
      </button>  
      {isOpen ? (  
        <>  
          <div  
            className="backdrop"  
            onClick={() => setIsOpen(false)}  
          ></div>  
          <div className="dialog">  
            <button  
              className="close-button"  
              onClick={() => setIsOpen(false)}  
            >  
              Close  
            </button>  
          </div>  
        </>  
      ) : null}  
    </>  
  );  
}

I absolutely need to extract the dialog portion into a reusable component — there will be plenty of dialog-based features to implement.

const ModalDialog = ({ onClose }) => {  
  return (  
    <>  
      <div className="backdrop" onClick={onClose}></div>  
      <div className="dialog">  
        <button className="close-button" onClick={onClose}>  
          Close  
        </button>  
      </div>  
    </>  
  );  
};

The dialog will have an onClose prop - it will notify the parent component when the "close" button or the backdrop is clicked. The parent component will then still have the state and render the dialog like this:

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpen(true)}>  
        Click me  
      </button>  
      {isOpen ? (  
        <ModalDialog onClose={() => setIsOpen(false)} />  
      ) : null}  
    </>  
  );  
}

Now, let’s look at the design again and think about dialogs some more:

![](https://cdn-images-1.medium.com/max/918/0*38eoe_UtunZhcHcT.png)

There clearly will be some “ **footer**” part of the dialog with action buttons. Most likely there will be plenty of variations of those buttons — one, two, three, aligned to the left, right, with space in between, etc. Also, this dialog doesn’t have a **header**, but it’s very, very likely that it might have — dialogs with some header are a pretty common pattern. There will absolutely be a **content** area here with completely random content — from just confirmation text to forms to interactive experiences to very long “terms and conditions” scrollable texts that no one reads.

Finally, the **size**. The dialog in the design is tiny, just a confirmation dialog. Large forms or long texts won’t fit there. So, considering the information we gathered in Step 2, it’s pretty safe to assume that the size of the dialog will need to be changed. At this moment, considering that the designers likely have design guidelines, we can assume that we’ll have three variations of the dialog: “small,” “medium,” and “large.”

All of this means we need to have props on the ModalDialog: footer and header will be just regular props that accept ReactNode, size will be just a union of strings, and the content area, as the main part, will go into children:

type ModalDialogProps = {  
  onClose: () => void;  
  footer?: ReactNode;  
  header?: ReactNode;  
  children: ReactNode;  
  size: 'small' | 'medium' | 'large';  
};  
  
const ModalDialog = ({  
  onClose,  
  size,  
  header,  
  footer,  
  children,  
}: ModalDialogProps) => {  
  // control the size here  
  const className = \`dialog ${size}\`;  
  return (  
    <>  
      <div className="backdrop" onClick={onClose}></div>  
      <div className={className}>  
        <button className="close-button" onClick={onClose}>  
          Close  
        </button>  
        {header}  
        {children}  
        {footer}  
      </div>  
    </>  
  );  
};

We’ll control the size of the dialog with an additional className coming from the props. In real life, it will highly depend on the styling solution that is used in the repo though.

However, in this variant, the dialog is just too flexible — pretty much anything can go everywhere. In the footer, for example, most of the time, we can expect just a button or two, nothing more. And those buttons would have to be consistently arranged everywhere throughout the website. We need to have a wrapper that aligns them:

<div className="footer">{footer}</div>

Same with the content — at the very least, it would need some padding around it and the scrolling ability. And the header might need some styles for the text. So the layout turns into this:

const ModalDialog = ({  
  onClose,  
  size,  
  header,  
  footer,  
  children,  
}) => {  
  const className = \`dialog ${size}\`;  
  return (  
    <>  
      <div className="backdrop" onClick={onClose}></div>  
      <div className={className}>  
        <button className="close-button" onClick={onClose}>  
          Close  
        </button>  
        <div className="header">{header}</div>  
        <div className="content">{children}</div>  
        <div className="footer">{footer}</div>  
      </div>  
    </>  
  );  
};

But unfortunately, we can’t _guarantee_ that. It’s highly probable that, at some point, someone would want to have something more in the footer other than buttons. Or some of the dialogs would need to have a header on a sold background. Or sometimes, the content won’t need paddings.

What I’m leading to here is that we’d need to be able to style the header/content/footer part someday. And probably sooner than expected.

We could, of course, just pass that configuration with props and have something like headerClassName, contentClassName, and footerClassName props. And for some cases, it could be okay, actually. But for something like the nice dialog for the nice redesign, we could do better.

A really neat way to solve this problem is to extract our header/content/footer into components of their own, like this:

const DialogFooter = ({ children }) => {  
  return <div className="footer">{children}</div>;  
}

and revert the ModalDialog code to the code without the wrappers:

const ModalDialog = ({  
  onClose,  
  size,  
  header,  
  footer,  
  children,  
}) => {  
  const className = \`dialog ${size}\`;  
  return (  
    <>  
      <div className="backdrop" onClick={onClose}></div>  
      <div className={className}>  
        <button className="close-button" onClick={onClose}>  
          Close  
        </button>  
        {header}  
        {children}  
        {footer}  
      </div>  
    </>  
  );  
};

That way, in the parent app, if I want to have the default design for the dialog parts, I’d use those tiny components:

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpen(true)}>  
        Click me  
      </button>  
      {isOpen ? (  
        <ModalDialog  
          onClose={() => setIsOpen(false)}  
          header={<DialogHeader>Header</DialogHeader>}  
          footer={<DialogFooter>Footer</DialogFooter>}  
          size="medium"  
        >  
          <DialogContent>Content</DialogContent>  
        </ModalDialog>  
      ) : null}  
    </>  
  );  
}

And if I wanted to have something completely custom, I would implement a new component with its own custom styles without messing with the ModalDialog itself:

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      ...  
      <ModalDialog  
        onClose={() => setIsOpen(false)}  
        header={<CustomHeader>Header</CustomHeader>}  
        footer={<CustomFooter>Footer</CustomFooter>}  
        size="medium"  
      >  
        <SomethingElse>Content</SomethingElse>  
      </ModalDialog>  
      ...  
    </>  
  );  
}

For that matter, I don’t even need the header and footer prop anymore. I can just pass the DialogHeader and DialogFooter to the children, simplify the ModalDialog even more, and have an even nicer API with the same level of flexibility while having consistent design everywhere.

The parent component will then look like this:

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpen(true)}>  
        Click me  
      </button>  
      {isOpen ? (  
        <ModalDialog  
          onClose={() => setIsOpen(false)}  
          size="medium"  
        >  
          <DialogHeader>Header</DialogHeader>  
          <DialogContent>Content</DialogContent>  
          <DialogFooter>Footer</DialogFooter>  
        </ModalDialog>  
      ) : null}  
    </>  
  );  
}

And the dialog’s API will look like this:

export const ModalDialog = ({  
  onClose,  
  size,  
  children,  
}) => {  
  const className = \`dialog ${size}\`;  
  return (  
    <>  
      <div className="backdrop" onClick={onClose}></div>  
      <div className={className}>  
        <button className="close" onClick={onClose}>  
          Close  
        </button>  
        {children}  
      </div>  
    </>  
  );  
};  
  
export const DialogFooter = ({ children }) => {  
  return <div className="footer">{children}</div>;  
};  
  
export const DialogHeader = ({ children }) => {  
  return <div className="header">{children}</div>;  
};  
  
export const DialogContent = ({ children }) => {  
  return <div className="content">{children}</div>;  
};

I’m pretty happy with it so far. It’s flexible enough to extend in any way the design might require, but it’s also clear and sensible enough to implement a consistent UI across the entire app easily.

Here’s the live example to play around with:

### Step 4: performance and re-renders

Now that the Modal’s API is in decent enough shape, it’s time to address the obvious foot gun I implemented. If you’ve read enough of my articles, you probably have been screaming loudly, “what r u doing??? Re-renders!!” for the last ten minutes 😅 And of course, you’re right:

export default function Page() {  
  const \[isOpen, setIsOpen\] = useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpen(true)}>  
        Click me  
      </button>  
      {isOpen ? (  
        <ModalDialog  
          onClose={() => setIsOpen(false)}  
          size="medium"  
        >  
          <DialogHeader>Header</DialogHeader>  
          <DialogContent>Content</DialogContent>  
          <DialogFooter>Footer</DialogFooter>  
        </ModalDialog>  
      ) : null}  
    </>  
  );  
}

The Page component here has state. Every time the modal is open or closed, the state will change, and it will cause a re-render of the entire component and everything inside. While yes, "premature optimization is the root of all evil," and yes, don't optimize performance before actually measuring it, in this case, we can safely ignore the conventional wisdom.

For two reasons. First, I know for a fact that there will be lots of modals scattered throughout the app. It’s not a one-time hidden feature that no one is going to use. So, the chances that someone will put a state somewhere where it shouldn’t be with an API like this are quite high. And second, it doesn’t take much time and effort to prevent the re-renders problem from ever occurring in the first place. Just 1 minute of effort, and we won’t need to think about the performance here at all.

All we need to do is to encapsulate state and introduce the idea of an “uncontrolled component”:

export const ModalDialog = (props) => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  
  return (  
    <>  
      {isOpen ? (  
        <BaseModalDialog  
          {...props}  
          onClose={() => setIsOpen(false)}  
        />  
      ) : null}  
    </>  
  );  
};

Where the BaseModalDialog is exactly the same dialog we had before, I just renamed it.

And then pass a component that is supposed to trigger the dialog as a trigger prop:

export const ModalDialog = ({  
  // add the prop here  
  trigger,  
  ...props  
}) => {  
  const \[isOpen, setIsOpen\] = useState(false);  
  
  return (  
    <>  
      <!-- render trigger here -->  
      <span onClick={() => setIsOpen(!isOpen)}>{trigger}</span>  
      {isOpen ? (  
        <BaseModalDialog {...props} onClose={() => setIsOpen(false)} />  
      ) : null}  
    </>  
  );  
};

The Page component then will look like this:

export default function Page() {  
  return (  
    <>  
      <-- other stuff relevant to the page -->  
      <ModalDialog  
        trigger={<button>Click me</button>}  
        size="medium"  
      >  
        <DialogHeader>Header</DialogHeader>  
        <DialogContent>Content</DialogContent>  
        <DialogFooter>Footer</DialogFooter>  
      </ModalDialog>  
    </>  
  );  
}

No more state inside Page, no more potentially dangerous re-renders.

An API like this should cover 95% of the use cases since, most of the time, a user would need to click on something for the dialog to appear. In rare situations when a dialog needs to appear independently, for example, on a shortcut or as part of the onboarding, I can still use the BaseModalDialog and deal with the state manually.

### Step 5: dealing with edge cases and accessibility

The API of the ModalDialog component is pretty solid from the React perspective, but the job is nowhere near done. Considering the must-haves I gathered in Step 2, I still need to fix a few more issues.

**Issue 1**: I’m wrapping the trigger into an additional span - in certain cases, that might break the layout of a page. I need to get rid of the wrapper somehow.

**Issue 2**: If I render the dialog inside an element that creates a new [Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context), the modal will appear underneath some elements. I need to render it inside a [Portal](https://www.developerway.com/posts/positioning-and-portals-in-react), not directly inside the layout like I’m doing now.

**Issue 3**: Keyboard access is pretty bad at the moment. When a [properly implemented](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) modal dialog opens, the focus should jump inside. When it’s closed — the focus should return to the element that triggered the dialog. When the dialog is open, the focus should be “trapped” inside, and the elements outside should not be focusable. Pressing the ESC button should close the dialog. None of this is implemented at the moment.

Issues 1 and 2 are slightly annoying but can be solved relatively fast. Issue 3, however, is a massive pain to do manually. Plus, surely it’s a solved problem — every dialog everywhere would need this functionality.

The combination of “massive pain to do by myself” + “looks like surely a solved problem” is where I would look for an existing library.

Considering all the pre-work I already did, choosing the right one is easy now.

I could go for any existing UI component libraries like Ant Design or Material UI and use a dialog from there. But if the re-design doesn’t use them, adjusting their designs to the ones I need will bring more pain than they solve. So it’s an instant NO for this case.

I could use one of the “headless” UI libraries like [Radix](https://www.radix-ui.com/themes/docs/components/dialog) or [React Aria](https://react-spectrum.adobe.com/react-aria/). Those implement the functionality like state and trigger and all the accessibility but leave the design to the consumer. While looking at their API, I would need to double-check that they allow me to control the state of the dialog if I really need it for the cases where I want to trigger the dialog manually (they do).

If, for some reason, I can’t use the headless libraries, I would at least try to use a library that handles the [focus trap](https://github.com/focus-trap/focus-trap) functionality.

For the sake of the article, let’s assume that I can bring any library that I want. In this case, I’ll go with [Radix](https://www.radix-ui.com/primitives) — it’s very easy to use, and the [API of the dialog](https://www.radix-ui.com/primitives/docs/components/dialog) looks very similar to what I already implemented, so refactoring should be a breeze.

We would need to change the API of the dialog itself a bit:

export const ModalDialog = ({  
  trigger,  
  size,  
  ...props  
}) => {  
  const className = \`dialog ${size}\`;  
  return (  
    <Dialog.Root {...props}>  
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>  
      <Dialog.Portal>  
        <Dialog.Overlay className="backdrop" />  
        <Dialog.Content className={className}>  
          {props.children}  
          <Dialog.Close asChild>  
            <button className="close" aria-label="Close">  
              <CloseIcon />  
            </button>  
          </Dialog.Close>  
        </Dialog.Content>  
      </Dialog.Portal>  
    </Dialog.Root>  
  );  
};

It’s pretty much the same as I had before. Only, instead of divs everywhere, I use Radix primitives.

The uncontrolled dialog usage doesn’t change at all:

export default function Page() {  
  return (  
    <>  
      <ModalDialog  
        trigger={  
          <button>  
            open uncontrolled non-standard dialog  
          </button>  
        }  
        size="medium"  
      >  
        <DialogHeader>Header</DialogHeader>  
        <DialogContent>Content</DialogContent>  
        <DialogFooter>  
          <button>confirm</button>  
          <button>deny</button>  
        </DialogFooter>  
      </ModalDialog>  
    </>  
  );  
}

And controlled dialog changes slightly — I would need to pass props to it instead of conditional rendering:

export default function Page() {  
  // still able to control state if I need  
  const \[isOpenStandard, setIsOpenStandard\] =  
    useState(false);  
  return (  
    <>  
      <button onClick={() => setIsOpenStandard(true)}>  
        open controlled standard dialog  
      </button>  
      <ModalDialog  
        size="medium"  
        // just need to pass that state here  
        open={isOpenStandard}  
        // and listen for the change here  
        onOpenChange={() => {  
          setIsOpenStandard(false);  
        }}  
      >  
        <DialogHeader>Header</DialogHeader>  
        <DialogContent>Content</DialogContent>  
        <DialogFooter>  
          <button>confirm</button>  
          <button>deny</button>  
        </DialogFooter>  
      </ModalDialog>  
    </>  
  );  
}

Check out the example below and try to use the keyboard to navigate. Everything works as I need it, how cool is that?

As a bonus, Radix also handles the Portal issue, and it doesn’t wrap triggers in a span. I don’t have edge cases to solve anymore, so I can move on to the last step.

### Step 6: final polish

The feature is still not done! 😅 The dialog looks and feels pretty solid now, so I’m not going to change anything major in its implementation at this stage. But it still needs a few things to be considered “perfect” dialog for the use case I’m solving.

**One**: the very first things the designers will ask me to do, if they haven’t yet, is to add a subtle animation for when the dialog opens. Would need to anticipate it and remember [how to do animations in React](https://www.developerway.com/posts/intro-to-css-animations-for-react-devs).

**Two**: I would need to add max-width and max-height to the dialog so that on small screens it still looks decent. And think about how it would look like on very large screens.

**Three**: I would need to talk to the designers about how the dialog should behave on mobile. Chances are they will ask me to make it a slide-in panel that takes most of the screen regardless of the size of the dialog.

**Four**: I would need to introduce at least DialogTitle and DialogDescription components - Radix will ask to use them for accessibility purposes.

**Five**: Tests! The dialog is here to stay and will be maintained by other people, so tests are pretty much mandatory in this case.

And probably tons of other small things I forgot now which will come up later. Not to mention implementing the actual designs for the dialog’s content.

### A few more thoughts

If you replace the “dialog” above with “SomeNewFeature,” this is more or less the algorithm I use for implementing pretty much everything new.

Quick [“spike”](https://en.wikipedia.org/wiki/Spike_\(software_development\)) of the solution(s) → gather requirements for the feature → make it work → make it performant → make it complete → make it perfect.

For something like the actual dialog, which I’ve implemented hundreds of times by now, I’ll do the first step in 10 seconds in my head and start with Step 2 right away.

For something very complicated and unknown, Step 1 might be longer and involve exploring different solutions and libraries right away.

Something not exactly unknown, just a “regular feature we need to do,” might skip Step 1 as there might be nothing to explore.

Quite often, especially in the “agile” environments, it will be more of a spiral than a straight line, where requirements are provided incrementally and often change, and we’re returning to the first two steps regularly.

Hope this type of article was useful! 💪🏼 Let me know if you’d want to have more content like this or would rather prefer the usual “how things work” stuff.

And looking forward to hearing how this process is different in y’all heads 😅

_Originally published at_ [_https://www.developerway.com_](https://www.developerway.com/posts/hard-react-questions-and-modal-dialog)_. The website has more articles like this._ 😉

_Take a look at the_ [_Advanced React book_](https://advanced-react.com/) _to take your React knowledge to the next level._

[_Subscribe to the newsletter_](https://www.developerway.com/)_,_ [_connect on LinkedIn_](https://www.linkedin.com/in/adevnadia/) _or_ [_follow on Twitter_](https://twitter.com/adevnadia) _to get notified as soon as the next article comes out._

And btw, one last thing: if you’re starting a new project soon and don’t have a designer and the time to polish the design experience like described — I recently spent hours and hours (and hours) implementing a new library of UI components for this case. It has copy-pastable components and common patterns, Radix and Tailwind, dark mode, accessibility, and mobile support out-of-the-box. Including the perfect modal dialog above! 😅

Give it a try: [https://www.buckets-ui.com/](https://www.buckets-ui.com/)

![](https://cdn-images-1.medium.com/max/1024/0*obb7DGVsb849PD9j.png)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=8a8b1dbcff6d)