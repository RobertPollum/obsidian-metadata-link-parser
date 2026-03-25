---
title: "The history of servers, the cloud, and what’s next – with Oxide"
link: https://newsletter.pragmaticengineer.com/p/the-history-of-servers-the-cloud
author: Gergely Orosz
publish_date: 2025-12-17 12:01:13
saved_date: 2026-01-17 15:09:32
image: https://substackcdn.com/image/fetch/$s_!-41Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png
tags: 
---

![image](https://substackcdn.com/image/fetch/$s_!-41Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png)

### Stream the latest episode

**Listen and watch now on [YouTube](https://youtu.be/Kn_P9nG0zsA), [Spotify](https://open.spotify.com/episode/5VcMGmZa0nDWpWpaB6R5al), and [Apple](https://podcasts.apple.com/us/podcast/the-history-of-servers-the-cloud-and-whats-next-with-oxide/id1769051199?i=1000741712849).** See the episode transcript at the top of this page, and timestamps for the episode at the bottom.

### **Brought to You by**

[

![](https://substackcdn.com/image/fetch/$s_!-41Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png)



](https://substackcdn.com/image/fetch/$s_!-41Z!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47539dec-053b-4a4a-be04-e0c922840fe1_800x70.png)

•⁠ **[Statsig](http://statsig.com/pragmatic)** ⁠ — ⁠ The unified platform for flags, analytics, experiments, and more. Companies like Meta and Google had to build their own infrastructure for safer deployments and experimentation. Statsig makes this advanced tooling accessible to everyone. They have a generous free tier, a $50K startup program, and affordable enterprise plans. [Check it out.](http://statsig.com/pragmatic)

•⁠ **[Linear](https://linear.app/pragmatic?utm_source=gergely&utm_medium=newsletter&utm_campaign=pragmatic-engineer)** ⁠ — ⁠ The system for modern product development. We know that AI will be part of the software stack — in fact, it already is, today. To support AI agents, Linear they built an open API and SDK that lets any agent plug into your issue tracker. You can also connect popular agents like ike Cursor, GitHub Copilot, OpenAI Codex, and others. [Take a look at how Linear works with agents](https://linear.app/integrations/agents?utm_source=gergely&utm_medium=newsletter&utm_campaign=pragmatic-engineer).

### **In this episode**

How have servers and the cloud evolved in the last 30 years, and what might be next? Bryan Cantrill was a distinguished engineer at Sun Microsystems during both the Dotcom Boom and the Dotcom Bust. Today, he is the co-founder and CTO of Oxide Computer, where he works on modern server infrastructure.

In this episode of _The Pragmatic Engineer_, Bryan joins me to break down how modern computing infrastructure evolved. We discuss why the Dotcom Bust produced deeper innovation than the Boom, how constraints shape better systems, and what the rise of the cloud changed and did not change about building reliable infrastructure.

Our conversation covers early web infrastructure at Sun, the emergence of AWS, Kubernetes and cloud neutrality, and the tradeoffs between renting cloud space and building your own. We also touch on the complexity of server-side software updates, experimenting with AI, the limits of large language models, and how engineering organizations scale without losing their values.

If you want a systems-level perspective on computing that connects past cycles to today’s engineering decisions, this episode offers a rare long-range view.

### Interesting sections from the episode

**How the “Dotcom Bust” brought more tech creativity than the “Boom.”** As Bryan recalled ([starting at 14:53](https://youtu.be/Kn_P9nG0zsA?si=jfcd4IYgehc4xONL&t=893)), memories from the Dotcom Boom and Bust:

> “A boom can get you to care about things that you actually don’t care about. This is because in a boom, everyone is so financially driven that it’s hard not to become financially driven!
> 
> But \[the financial side\] is actually not why I got into this. So during the bust, I was definitely able to put a meal on my table and a roof over my head. But \[the Bust\] was a reminder about what’s important.
> 
> **We did better technical work in the Bust than in the Boom.** I think that’s because in the Bust it was like: okay, now we _really_ have to focus. We have fewer resources. These fewer resources actually force more creativity!
> 
> So all of the things that we did, certainly speaking at Sun and system software, so [ZFS](https://en.wikipedia.org/wiki/ZFS) filesystem\] and [DTrace](https://en.wikipedia.org/wiki/DTrace) \[dynamic tracing framework\] and [Service Manager Facility](https://www.oracle.com/it-infrastructure/technologies/howto-service-management-facility.html) \[unified service management framework in Solaris 10\], all these things that were really revolutionary for the operating system. All of these \[innovations\] happened in this same kind of post-Bust period of time, from 2001 to 2005.”

**How Jeff Bezos tricked everyone with AWS pricing.** Bryan was running a small competitor to AWS called Joyent, and so he knew something about AWS pricing that the rest of the world was yet to catch up to ([starting at 26:07](https://youtu.be/Kn_P9nG0zsA?si=ITEWi9anJ1zk16vU&t=1567))

> “Jeff Bezos is the apex predator of camitalism.
> 
> **The thing that was so impressive is they were able to give people the idea that this \[AWS\] was a terrible business.** In particular, they did not break out their financials. So everyone’s like: 'oh my God, what an awful business! They’re \[AWS is\] cutting the price every year. This is a classic ‘red ocean’. It’s bloody, you don’t want to compete.
> 
> At Joyent, we were actually competing head to head with AWS. We had a public cloud. And unlike AWS, we took the software that we had used to run the public cloud and made it available for people that wanted to run a cloud on-prem on their own hardware. So people that would buy Dell or HP or Super Micro, they would buy \[Joyent’s\] software and they would run it and get a cloud.
> 
> So we ran a public cloud and we knew what the economics of a public cloud were, namely _pretty_ good. Margins _were_ good! And so what we knew that Amazon wasn’t volunteering \[the price cuts.\]
> 
> **We knew is that AWS S3 was underwriting a war on big box retail, and that S3 was paying for your Prime shipping!**
> 
> So it was a genius move \[by Bezos.\]”

**Why Kubernetes might have become really popular, in part thanks to AWS.** Bryan, [starting at 27:42](https://youtu.be/Kn_P9nG0zsA?si=D09EL4MwLvtF-Lxx&t=1662):

> “There was a period of time when it felt like in order to be in the cloud \[business\] you have to implement every AWS API \[as a cloud provider\]. So there’s this idea that you had to be \[fully\] compatible with EC2. One reason it was thought that GCP and Azure could never compete with AWS was because they could never be API compatible.
> 
> Then, what starts in 2015 is Kubernetes. Part of that initial attraction to Kubernetes is that people wanted to get some optionality around their cloud — and they felt locked into AWS. They’re like ‘I’m not using all this stuff \[on AWS\]. I’m not using [Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html) \[PaaS for web applications\]. I’m not using [IoT Greenglass](https://aws.amazon.com/greengrass/) \[edge runtime and cloud for IoT services\]. I’m not using [Redshift](https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html) \[SQL-based cloud data warehouse\]. What I actually want is this kind of basic infrastructure.
> 
> **Kubernetes now gives me this layer upon which I can deploy and get some sort of** _**true**_ **cloud neutrality.** The early momentum behind Kubernetes \[felt like\] this around this idea of I need to have some optionality \[from AWS\].”

**Interesting: Oxide found it hard to hire hardware engineers who are principles-first**, and folks who can build hardware without a “reference design” available. Turns out, building a new type of computer like Oxide means creating hardware from scratch, instead of using “reference designs.” Many hardware engineers are simply not used to doing this:

> Bryan: “In computer \[hardware\] design in particular, the high-speed designs are so hard that \[electrical engineers\] got very accustomed to taking the reference designs. And it was harder to find folks who were willing to take a clean sheet of paper. Ultimately, we found them, and we’ve got an EE (electrical engineering) team that is extraordinary and absolutely fearless.
> 
> \[The EE engineers at Oxide\] didn’t spend their careers at Dell and HPE. They’re coming from \[the likes of\] GE Medical where they worked on CT systems.
> 
> Gergely: “It feels like such a different field. I would naively assume that if you’re building a computer, you’ll try to get electronics engineers who have built computers.
> 
> Bryan: “You would think! That was our \[initial\] thought as well. Then we discovered that we were not getting along with those engineers very well.
> 
> **We were just finding there’s a lot of friction because there wasn’t a real first-principles approach.** When you get to talk to folks that have been at Dell for a generation, for any design, they’re used to calling what’s called the FAE. FAE stands for the Field Applications Engineer for the voltage regulator. It’s like: ‘well the FAE gives me the design.’ So we ask: ‘Alright, well how do you know that it’s the _right_ design?’ So we went, alright, so let’s go hire that person \[who understands the actual design.\]”

Bryan initially struggled to find the “right” electrical engineers — until Bryan [shared in an article](https://oxide.computer/blog/compensation-as-a-reflection-of-values) that they paid everyone at Oxide a $175,000 base salary in 2021 (today, this number [is $235,000 today](https://oxide.computer/blog/oxides-compensation-model-how-is-it-going).) This article got shared inside hardware engineering circles, and suddenly they got standout electrical engineers applying — who often have not built computers before, but have been designing electrical equipmen and hardware from zero in other fields.

### **The Pragmatic Engineer deepdives relevant for this episode**

-   [Startups on hard mode: Oxide. Part 1: Hardware](https://newsletter.pragmaticengineer.com/p/oxide)
    
-   [Startups on hard mode: Oxide, Part 2: Software & Culture](https://newsletter.pragmaticengineer.com/p/oxide-part-2)
    
-   [Three cloud providers, three outages: three different responses](https://newsletter.pragmaticengineer.com/p/three-cloud-providers-three-outages)
    
-   [Inside Uber’s move to the Cloud](https://newsletter.pragmaticengineer.com/p/uber-move-to-cloud)
    
-   [Inside Agoda’s private Cloud](https://newsletter.pragmaticengineer.com/p/inside-agodas-private-cloud)
    

### **Timestamps**

([00:00](https://www.youtube.com/watch?v=Kn_P9nG0zsA)) Intro

([01:26](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=86s)) Computer science in the 1990s

([03:01](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=181s)) Sun and Cisco’s web dominance

([05:41](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=341s)) The Dotcom Boom

([10:26](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=626s)) From Boom to Bust

([15:32](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=932s)) The innovations of the Bust

([17:50](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=1070s)) The open source shift

([22:00](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=1320s)) Oracle moves into Sun’s orbit

([24:54](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=1494s)) AWS dominance (2010–2014)

([28:15](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=1695s)) How Kubernetes and cloud neutrality

([30:58](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=1858s)) Custom infrastructure

([36:10](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=2170s)) Renting the cloud vs. buying hardware

([45:28](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=2728s)) Designing a computer from first principles

([50:02](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=3002s)) Why everyone is paid the same salary at Oxide

([54:14](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=3254s)) Oxide’s software stack

([58:33](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=3513s)) The evolution of software updates

([1:02:55](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=3775s)) How Oxide uses AI

([1:06:05](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=3965s)) The limitations of LLMs

([1:11:44](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=4304s)) AI use and experimentation at Oxide

([1:17:45](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=4665s)) Oxide’s diverse teams

([1:22:44](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=4964s)) Remote work at Oxide

([1:24:11](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=5051s)) Scaling company values

([1:27:36](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=5256s)) AI’s impact on the future of engineering

([1:31:04](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=5464s)) Bryan’s advice for junior engineers

([1:34:01](https://www.youtube.com/watch?v=Kn_P9nG0zsA&t=5641s)) Book recommendations

### **References**

**Where to find Bryan Cantrill:**

• X: [https://x.com/bcantrill](https://x.com/bcantrill)

• LinkedIn: [https://www.linkedin.com/in/bryan-cantrill-b6a1](https://www.linkedin.com/in/bryan-cantrill-b6a1)

• Website: [https://bcantrill.dtrace.org](https://bcantrill.dtrace.org)

**Mentions during the episode:**

• Sun Microsystems: [https://en.wikipedia.org/wiki/Sun\_Microsystems](https://en.wikipedia.org/wiki/Sun_Microsystems)

• Oxide Computer: [https://oxide.computer](https://oxide.computer)

• Linux: [https://www.linux.org](https://www.linux.org)

• Haiku: [https://www.haiku-os.org](https://www.haiku-os.org)

• Gnu Hurd: [https://en.wikipedia.org/wiki/GNU\_Hurd](https://en.wikipedia.org/wiki/GNU_Hurd)

• Duke Nukem: [https://en.wikipedia.org/wiki/Duke\_Nukem](https://en.wikipedia.org/wiki/Duke_Nukem)

• Greg Papadopoulos: [https://en.wikipedia.org/wiki/Greg\_Papadopoulos](https://en.wikipedia.org/wiki/Greg_Papadopoulos)

• Dave Pacheco’s talk, as linked to in Bryan’s blog entry: [https://oxide.computer/blog/systems-software-in-the-large](https://oxide.computer/blog/systems-software-in-the-large)

• Gilded Age: [https://en.wikipedia.org/wiki/Gilded\_Age](https://en.wikipedia.org/wiki/Gilded_Age)

• 1950 Château d’Yquem: [https://www.wine-searcher.com/find/d+yquem+sauternes+bordeaux+france/1950](https://www.wine-searcher.com/find/d+yquem+sauternes+bordeaux+france/1950)

• Pets.com: [https://en.wikipedia.org/wiki/Pets.com](https://en.wikipedia.org/wiki/Pets.com)

• Webvan: [https://en.wikipedia.org/wiki/Webvan](https://en.wikipedia.org/wiki/Webvan)

• Jeff Bonwick on LinkedIn: [https://www.linkedin.com/in/jeff-bonwick-80b4b51](https://www.linkedin.com/in/jeff-bonwick-80b4b51)

• CFS: [https://en.wikipedia.org/wiki/Clustered\_file\_system](https://en.wikipedia.org/wiki/Clustered_file_system)

• SPARC: [https://en.wikipedia.org/wiki/SPARC](https://en.wikipedia.org/wiki/SPARC)

• X86: [https://en.wikipedia.org/wiki/X86](https://en.wikipedia.org/wiki/X86)

• LISA11 - Fork Yeah! The Rise and Development of illumos:

• Larry Ellison: [https://en.wikipedia.org/wiki/Larry\_Ellison](https://en.wikipedia.org/wiki/Larry_Ellison)

• Oxide’s blog entry on their $100M Series B: [https://oxide.computer/blog/our-100m-series-b](https://oxide.computer/blog/our-100m-series-b)

• Bryan Cantrill from Joyent on Manta: internet-facing object storage facility that features compute:

• Jeff Bezos on X: [https://x.com/JeffBezos](https://x.com/JeffBezos)

• Kubernetes: [https://kubernetes.io](https://kubernetes.io)

• How Kubernetes is Built with Kat Cosgrove: [https://newsletter.pragmaticengineer.com/p/how-kubernetes-is-built-with-kat](https://newsletter.pragmaticengineer.com/p/how-kubernetes-is-built-with-kat)

• Craig McLuckie on LinkedIn: [https://www.linkedin.com/in/craigmcluckie](https://www.linkedin.com/in/craigmcluckie)

• Cloud Native Computing Foundation: [https://www.cncf.io](https://www.cncf.io)

• _The Datacenter as a Computer: Designing Warehouse-Scale Machines_: [https://www.amazon.com/Datacenter-Computer-Designing-Warehouse-Scale-Architecture/dp/303100633X](https://www.amazon.com/Datacenter-Computer-Designing-Warehouse-Scale-Architecture/dp/303100633X)

• Startups on hard mode: Oxide. Part 1: Hardware: [https://newsletter.pragmaticengineer.com/p/oxide](https://newsletter.pragmaticengineer.com/p/oxide)

• Oxide’s Compensation Model: How is it Going?: [https://oxide.computer/blog/oxides-compensation-model-how-is-it-going](https://oxide.computer/blog/oxides-compensation-model-how-is-it-going)

• Gumroad: [https://gumroad.com](https://gumroad.com)

• Oxide on Github: [https://github.com/oxidecomputer](https://github.com/oxidecomputer)

• Omicron: [https://github.com/oxidecomputer/omicron](https://github.com/oxidecomputer/omicron)

• OxCon 2025: Update on Update:

• Intelligence is not Enough | Bryan Cantrill | Monktoberfest 2023:

• Richard Sutton’s on LLMs as a dead end:

• Liron reacts to “Intelligence Is Not Enough” by Bryan Cantrill:

• Smoke test: [https://en.wikipedia.org/wiki/Smoke\_testing\_(software)](https://en.wikipedia.org/wiki/Smoke_testing_\(software\))

• Python, Go, Rust, TypeScript and AI with Armin Ronacher: [https://newsletter.pragmaticengineer.com/p/python-go-rust-typescript-and-ai](https://newsletter.pragmaticengineer.com/p/python-go-rust-typescript-and-ai)

• Richard Sutton on X: [https://x.com/RichardSSutton](https://x.com/RichardSSutton)

• Rust: [https://rust-lang.org](https://rust-lang.org)

• Open Source LLMs with Simon Willison: [https://oxide-and-friends.transistor.fm/episodes/open-source-llms-with-simon-willison](https://oxide-and-friends.transistor.fm/episodes/open-source-llms-with-simon-willison)

• Founder Mode: [https://paulgraham.com/foundermode.html](https://paulgraham.com/foundermode.html)

• _Oxide and Friends_ episode, Reflecting on Founder Mode: [https://oxide-and-friends.transistor.fm/episodes/reflecting-on-founder-mode](https://oxide-and-friends.transistor.fm/episodes/reflecting-on-founder-mode)

• _The Soul of a New Machine_: [https://www.amazon.com/Soul-New-Machine-Tracy-Kidder/dp/0316491977](https://www.amazon.com/Soul-New-Machine-Tracy-Kidder/dp/0316491977)

• _Skunk Works: A Personal Memoir of My Years at Lockheed_: [https://www.amazon.com/Skunk-Works-Personal-Memoir-Lockheed/dp/0316743003](https://www.amazon.com/Skunk-Works-Personal-Memoir-Lockheed/dp/0316743003)

• _Steve Jobs & the Next Big Thing_: [https://www.amazon.com/Steve-Jobs-Next-Big-Thing/dp/0689121350](https://www.amazon.com/Steve-Jobs-Next-Big-Thing/dp/0689121350)

—

Production and marketing by [Pen Name](https://penname.co/).