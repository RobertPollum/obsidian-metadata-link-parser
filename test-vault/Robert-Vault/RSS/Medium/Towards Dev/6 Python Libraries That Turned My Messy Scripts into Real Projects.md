---
title: 6 Python Libraries That Turned My Messy Scripts into Real Projects
link: https://towardsdev.com/6-python-libraries-that-turned-my-messy-scripts-into-real-projects-58c71adc5274?source=rss----a648dc4ecb66---4
author: Bushrazaheer
publish_date: 2026-01-15 03:05:25
saved_date: 2026-01-17 15:09:54
image: https://cdn-images-1.medium.com/max/1024/0*Ky30bl50_HIyRbkh
tags: #technology #data-science #artificial-intelligence #programming #python
---

![image](https://cdn-images-1.medium.com/max/1024/0*Ky30bl50_HIyRbkh)

![](https://cdn-images-1.medium.com/max/1024/0*Ky30bl50_HIyRbkh)

Photo by [Boitumelo](https://unsplash.com/@writecodenow?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

Four years ago, most of my Python projects looked the same: a single file named final\_v3\_really\_final.py, held together by print statements and hope. They worked… until they didn’t.

The turning point wasn’t a new framework or a fancy IDE. It was discovering a handful of libraries that quietly changed how I _think_ about building software.

Not “how do I use this cool tech?”  
But:

> _“What problem am I solving, and how do I make the solution survive contact with reality?”_

Below are six libraries that repeatedly upgraded my weekend scripts into projects I could ship, maintain, and explain to other engineers without apologizing first.

I still use all of them.

### 1\. Typer Because CLI tools shouldn’t feel like punishment

Every serious project eventually needs a command line interface. For years, I avoided it or copy-pasted fragile argparse boilerplate.

Then I met **Typer**.

It builds beautiful CLIs directly from type hints. No ceremony. No archaeology.

import typer  
app = typer.Typer()  
@app.command()  
def train(model: str, epochs: int = 10, lr: float = 0.001):  
    print(f"Training {model} for {epochs} epochs at lr={lr}")  
if \_\_name\_\_ == "\_\_main\_\_":  
    app()

-   Auto-generated help pages
-   Type validation
-   Bash completion
-   Clean code

Suddenly my scripts had interfaces. And interfaces turn experiments into tools.

**Pro tip:** “If a script needs documentation, it probably needs a CLI.”

### 2\. Pydantic The library that taught me to distrust my own data

Most bugs I debug in production are not algorithmic. They’re data-shaped.

Wrong types. Missing fields. Slightly malformed JSON from “reliable” APIs.

Pydantic fixes this by forcing reality to be explicit.

from pydantic import BaseModel, EmailStr  
class User(BaseModel):  
    id: int  
    email: EmailStr  
    is\_active: bool = True  
payload = {"id": "12", "email": "admin@example.com"}  
user = User(\*\*payload)  
print(user)

It converts types, validates inputs, and fails loudly when something is wrong.

The psychological effect is bigger than the technical one:

You stop hoping your data is correct.  
You start **requiring** it.

That single shift saved me more debugging hours than any profiler ever did.

### 3\. Rich Because logs are also a user interface

If your program runs longer than 30 seconds, logs become your UI.

Plain text logs are fine… until they aren’t.

**Rich** adds structure:

-   Tables
-   Progress bars
-   Syntax highlighting
-   Tracebacks that actually help

from rich.console import Console  
from rich.progress import track  
import time  
console = Console()  
for step in track(range(20), description="Processing data"):  
    time.sleep(0.1)  
console.print("\[bold green\]Done without emotional damage.\[/bold green\]")

I started noticing something odd:

When logs look professional, I treat the project as professional.

And so do clients.

### 4\. SQL Model When your database stops being “that other thing”

I love SQLAlchemy.  
I also fear it.

**SQLModel** sits on top of it and combines:

-   SQLAlchemy’s power
-   Pydantic’s validation
-   A syntax that doesn’t feel like a legal contract

from sqlmodel import SQLModel, Field, create\_engine, Session  
class Article(SQLModel, table=True):  
    id: int | None = Field(default=None, primary\_key=True)  
    title: str  
    views: int = 0  
engine = create\_engine("sqlite:///db.sqlite")  
SQLModel.metadata.create\_all(engine)  
with Session(engine) as session:  
    session.add(Article(title="Hello databases"))  
    session.commit()

Now:

-   My API models
-   My validation layer
-   My database schema

…are the **same object**.

That alone removes an entire category of bugs.

### 5\. httpx The first HTTP client I actually enjoy using

Most modern projects talk to something over the network.

APIs. Microservices. LLM providers. Payment gateways.

requests is great. But async changes everything.

**httpx** handles both sync and async cleanly.

import httpx  
import asyncio  
async def fetch():  
    async with httpx.AsyncClient() as client:  
        r = await client.get("https://httpbin.org/json")  
        return r.json()  
data = asyncio.run(fetch())  
print(data\["slideshow"\]\["title"\])

This is where messy scripts grow up:

Concurrency without chaos.  
Retries. Timeouts. Proper error handling.

You stop writing “demo code” and start writing systems.

### 6\. Prefect When “just run the script” is no longer enough

The final transformation usually happens when:

-   Jobs fail at 3 AM
-   You forget to run something
-   Or your laptop becomes the weakest link

That’s where workflow orchestration comes in.

**Prefect** lets you define pipelines that are:

-   Observable
-   Retryable
-   Schedulable
-   Recoverable

from prefect import flow, task  
@task(retries=3)  
def extract():  
    return \[1, 2, 3\]  
@task  
def transform(data):  
    return \[x \* 10 for x in data\]  
@task  
def load(data):  
    print("Saved:", data)  
@flow  
def pipeline():  
    load(transform(extract()))  
pipeline()

This is the moment a script becomes infrastructure.

### The pattern I didn’t notice at first

None of these libraries are flashy.

They don’t promise “10x productivity” or “AI magic.”

They do something more important:

They add **structure where chaos used to live**.

-   Typer → structure for humans
-   Pydantic → structure for data
-   Rich → structure for feedback
-   SQLModel → structure for persistence
-   httpx → structure for networking
-   Prefect → structure for time

Stack enough structure, and reliability emerges.

### One last thought

A quote I keep taped near my monitor:

> _“Programs are meant to be read by humans and only incidentally executed by machines.” Harold Abelson_

Messy scripts optimize for the machine.

Real projects optimize for the next human who has to touch the code.  
Often, that human is you… three months later, with coffee in one hand and regret in the other.

> **_Want a pack of prompts that work for you and save hours?_** [**_click here_**](https://abdulahad28.gumroad.com/l/rwnlrm)

_Want more posts like this? Drop a “YES” in the comment, and I’ll share more coding tricks like this one._

_Want to support me? Give 50 claps on this post and follow me._

_Thanks for reading!_

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=58c71adc5274)

* * *

[6 Python Libraries That Turned My Messy Scripts into Real Projects](https://towardsdev.com/6-python-libraries-that-turned-my-messy-scripts-into-real-projects-58c71adc5274) was originally published in [Towards Dev](https://towardsdev.com) on Medium, where people are continuing the conversation by highlighting and responding to this story.