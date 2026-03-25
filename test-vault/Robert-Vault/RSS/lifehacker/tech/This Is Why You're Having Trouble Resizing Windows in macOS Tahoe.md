---
title: This Is Why You're Having Trouble Resizing Windows in macOS Tahoe
link: https://lifehacker.com/tech/this-is-why-you-are-having-trouble-with-windows-in-macos-tahoe?utm_medium=RSS
author: Jake Peterson
publish_date: 2026-01-12 13:30:57
saved_date: 2026-01-17 15:08:43
image: https://lifehacker.com/imagery/articles/01KESFZJPJ0ZR692131HZW8APJ/hero-image.jpg
tags: #Apple
---

![image](https://lifehacker.com/imagery/articles/01KESFZJPJ0ZR692131HZW8APJ/hero-image.jpg)

Apple's latest crop of updates was met with a bit of a mixed reaction. While some users love the new Liquid Glass design across iPhone, iPad, and Mac, [others decidedly do not](https://lifehacker.com/tech/how-to-undo-iphone-ios-26-liquid-glass)—which is likely what led Apple to introduce a [dedicated setting to control the intensity of the effect](https://lifehacker.com/tech/apple-will-finally-let-you-control-how-liquid-glass-looks). I'm partial to it, but I understand for some users, it's a tad too much, especially if it makes certain UI elements more difficult to see.

But Liquid Glass isn't the only thing Apple users have complained about, especially with regards to [macOS Tahoe](https://lifehacker.com/tech/coolest-barely-mentioned-features-macos-26-tahoe). Mac users reported [various problems with performance and stability](https://www.reddit.com/r/MacOS/comments/1osezx9/macos_tahoe_has_been_unbearably_slow_is_there/ "open in a new window") across macOS 26.0 and macOS 26.1, and have criticized design choices [like overly rounded corners](https://www.reddit.com/r/MacOS/comments/1o3zcak/why_are_the_corners_sooo_rounded_and_deep_on/ "open in a new window"). Myself, I held out on updating my M3 Pro Mac until macOS 26.2, where many of these issues appeared to be fixed, but my M1 iMac is still on macOS Sequoia for the time being. All that to say, macOS 26 hasn't had the smoothest start compared to some of Apple's previous Mac updates. If you've been noticing, for example, that your Mac's window management isn't as cooperative as it's been in the past, you're not alone. In fact, there seems to be a clear explanation for what's behind the issues.

## The issue with windows on macOS Tahoe

As with other versions of macOS, you can resize and adjust your Mac apps' windows by clicking and dragging from the bottom corners. The issue, however, is that as of Apple's newest update, it can be fairly difficult to grab the corner of the window. You might, instead, find you click on the bottom corner of the app or website instead, leading to unintended actions. Clicking the top right corner of Chrome, for example, will drag the whole app window, rather than resize it. Clicking the bottom left corner and dragging will start to highlight everything in the app window instead, perhaps sending you all around the screen as well.

If you slowly hover your cursor over the corner of the window, eventually you'll find a spot that turns your cursor into a resize icon, and you'll know you're good to click and drag to resize. But why is this so much more difficult to do quickly than it was in macOS Sequoia or beyond?

Norbert Heger, a software developer, seemingly has an answer. [In a blog post on Sunday](https://noheger.at/blog/2026/01/11/the-struggle-of-resizing-windows-on-macos-tahoe/ "open in a new window"), Heger explains that those rounded corners Apple designed for Tahoe are having a negative impact on the clickable area of the window. With a square corner, most of the clickable area—Heger says 62% of it—lies within the corner of the window itself. That gives users a relatively large area to click within the corner in order to grab onto the window, and a little bit of room outside the window to click, as well. But these new rounded corners don't seem to take that into consideration. Instead, they're relying on the same click area as before, but because there's less corner to work with now, the actual clickable area of the window is far less. Heger says about 75% of the clickable area now exists _outside_ the window itself, giving users just 25% to work with in the actual corner of the window.

If you're running macOS Tahoe, you can try this out for yourself right now: Move your cursor to the corner of the window, and wait for it to change into the resize icon. If you're hovering within the window itself, it won't change until you're _just_ about to move outside the window. You can keep going a bit, and see you can get pretty darn far outside the window before the cursor changes back.

![macos tahoe resize window](https://lifehacker.com/imagery/articles/01KESFZJPJ0ZR692131HZW8APJ/images-1.fill.size_2000x1299.v1768239076.jpg)

Why am I able to resize the window from outside the window, Apple? Credit: Lifehacker

This seems like a relatively easy fix on Apple's part, assuming they're aware of the issue. Maybe a patch will even make it into macOS 26.3. That said, the company has not publicly acknowledged the quirk, so it's anyone's guess. Until a potential fix, those of us on macOS Tahoe will just need to retrain our muscle memories around window resizing. For anyone who hasn't upgraded yet, you can simply carry on as usual.