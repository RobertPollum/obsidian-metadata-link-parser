---
title: These Popular Chrome Extensions Are Stealing Your AI Chats
link: https://lifehacker.com/tech/chrome-extension-stealing-ai-chats?utm_medium=RSS
author: Emily Long
publish_date: 2026-01-09 09:00:00
saved_date: 2026-01-17 15:08:43
image: https://lifehacker.com/imagery/articles/01KEF38R9Z7WSA2ND991PT9G9G/hero-image.jpg
tags: #Privacy
---

![image](https://lifehacker.com/imagery/articles/01KEF38R9Z7WSA2ND991PT9G9G/hero-image.jpg)

Hackers continue to find ways to sneak malicious extensions into the Chrome web store—[this time](https://thehackernews.com/2026/01/two-chrome-extensions-caught-stealing.html "open in a new window"), the two offenders are impersonating an add-on that allows users to have conversations with ChatGPT and DeepSeek while on other websites and exfiltrating the data to threat actors' servers.

## Beware these Chrome extensions

On the surface, the two extensions [identified by Ox Security researchers](https://www.ox.security/blog/malicious-chrome-extensions-steal-chatgpt-deepseek-conversations/ "open in a new window") look pretty benign. The first, named "Chat GPT for Chrome with GPT-5, Claude Sonnet & DeepSeek AI," has a Featured badge and 2.7K ratings with over 600,000 users. "AI Sidebar with Deepseek, ChatGPT, Claude and more" appears verified and has 2.2K ratings with 300,000 users.

However, these add-ons are actually sending AI chatbot conversations and browsing data directly to threat actors' servers. This means that hackers have access to plenty of sensitive information that users share with ChatGPT and DeepSeek as well as URLs from Chrome tabs, search queries, session tokens, user IDs, and authentication data. Any of this can be used to conduct identity theft, phishing campaigns, and even corporate espionage.

Researchers found that the extensions impersonate legitimate Chrome add-ons developed by AITOPIA that add a sidebar to any website with the ability to chat with popular LLMs. The malicious capabilities stem from a request for consent for “anonymous, non-identifiable analytics data." Threat actors are using Lovable, a web development platform, to host privacy policies and infrastructure, obscuring their processes.

Researchers also found that if you uninstalled one of the extensions, the other would open in a new tab in an attempt to trick users into installing that one instead.

## How to avoid malicious browser add-ons

If you've added AI-related extensions to Chrome, go to **chrome://extensions/** and look for the malicious impersonators. Hit **Remove** if you find them. As of this writing, the extensions identified by Ox no longer appear in the Chrome Web Store.

As [I've written about before](https://lifehacker.com/tech/malicious-firefox-extensions-are-draining-crypto-wallets), malicious extensions occasionally evade detection and gain approval from browser libraries by posing as legitimate add-ons, even earning "Featured" and "Verified" tags. Some threat actors playing the long game will convert extensions to malware [several years after launch](https://lifehacker.com/tech/spot-sleeper-browser-malware-extensions). This means you can't blindly trust ratings and reviews, even if they've been accrued over time.

To minimize risk, you should always [vet browser extensions carefully](https://lifehacker.com/netflix-party-and-four-other-chrome-extensions-that-a-1849479234) (even those that appear legit) for obvious red flags, like misspellings in the description and a large number of positive reviews accumulated in a short time. Head to Google or Reddit to see if anyone has identified the add-on as malicious or found any issues with the developer or source. Make sure you're downloading the _right_ extension—threat actors often try to confuse users with names that appear similar to popular add-ons.

Finally, you should regularly audit your extensions and remove those that aren't essential. Go to **chrome://extensions/** to see everything you have installed.