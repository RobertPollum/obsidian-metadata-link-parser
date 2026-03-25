---
title: "9 Python libraries that made me say, “why didn’t I learn this earlier?”"
link: https://towardsdev.com/9-python-libraries-that-made-me-say-why-didnt-i-learn-this-earlier-d130f6587826?source=rss----a648dc4ecb66---4
author: Bushrazaheer
publish_date: 2026-01-15 03:05:23
saved_date: 2026-01-17 15:09:54
image: https://cdn-images-1.medium.com/max/1024/0*nR8qEGgoJY0ZmP2u
tags: #coding #data-science #programming #artificial-intelligence #python
---

![image](https://cdn-images-1.medium.com/max/1024/0*nR8qEGgoJY0ZmP2u)

![](https://cdn-images-1.medium.com/max/1024/0*nR8qEGgoJY0ZmP2u)

Photo by [Lukas Blazek](https://unsplash.com/@goumbik?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

I had shipped production systems, debugged memory leaks at 2 a.m., and written enough Pandas to qualify for emotional damage compensation. My toolbox felt… complete.

Then, over the last year, I kept running into libraries that quietly changed how I work.

Not “cool GitHub stars” changed.  
I mean **“this would’ve saved me weeks of my life”** changed.

This article is a short list of those moments.

No beginner fluff. No print("Hello World") energy. Just tools that made me rethink how modern Python should be written.

> _“The best code is not the cleverest code. It’s the code you don’t have to write.” — John Ousterhout_

Let’s start.

### 1\. Polars — the DataFrame that finally scared Pandas

I love Pandas.

But I also love fast code, predictable memory usage, and not watching my laptop sound like a helicopter.

Polars is a DataFrame library written in Rust with lazy execution, query optimization, and multithreading baked in.

The first time I replaced a Pandas ETL job with Polars, runtime dropped from **42 seconds to 4.8 seconds**. Same machine. Same data.

Example:

import polars as pl  
df = pl.read\_csv("events.csv")  
result = (  
    df.filter(pl.col("country") == "US")  
      .group\_by("user\_id")  
      .agg(pl.col("revenue").sum().alias("total\_revenue"))  
      .sort("total\_revenue", descending=True)  
)  
print(result.head())

Why it hurts I didn’t learn it earlier:

-   Lazy execution plans (automatic optimization)
-   Real parallelism
-   Memory-efficient columnar engine

Pandas still has its place. But for large workloads, Polars feels like cheating.

### 2\. Pydantic v2 — data validation that feels illegal

I used to write defensive code like this:

if not isinstance(age, int):  
    ...

Then I met Pydantic.

Now I describe _what I want_, and let the library do the paranoia for me.

from pydantic import BaseModel, EmailStr  
class User(BaseModel):  
    id: int  
    name: str  
    email: EmailStr  
    is\_active: bool = True  
user = User(id="42", name="Ava", email="ava@example.com")  
print(user.id)  # 42 (auto-casted)

Pydantic v2 is significantly faster and more memory efficient than v1.

It’s the backbone of FastAPI, and for good reason:

-   Runtime type safety
-   Automatic casting
-   Clear error messages
-   Schema generation

Once you adopt it, raw dictionaries feel unsafe.

### 3\. Rich because logs shouldn’t look like 1998

Your terminal is not a text file.

Rich turns debugging into a visual experience:

from rich.console import Console  
from rich.table import Table  
console = Console()  
table = Table(title="Model Results")  
table.add\_column("Model")  
table.add\_column("Accuracy")  
table.add\_row("XGBoost", "0.921")  
table.add\_row("RandomForest", "0.903")  
console.print(table)

But that’s just the surface.

Rich gives you:

-   Syntax highlighting for tracebacks
-   Progress bars
-   Live updating dashboards
-   Pretty printing of nested objects

Once you use it, print() feels like using a flip phone.

### 4\. Tenacity retry logic done right

Every production system eventually talks to:

-   APIs that time out
-   Databases that blink
-   Networks that lie

I used to write ugly retry loops.

Tenacity made them disappear.

from tenacity import retry, stop\_after\_attempt, wait\_exponential  
@retry(stop=stop\_after\_attempt(5), wait=wait\_exponential(multiplier=1, min=2, max=10))  
def fetch\_data():  
    # call flaky API  
    ...  
fetch\_data()

You get:

-   Exponential backoff
-   Jitter
-   Custom retry conditions
-   Clean decorators

This is the kind of library you don’t notice… until it saves your production system at 3 a.m.

### 5\. Typer CLI tools that don’t feel like punishment

Argparse works.

But Typer feels like Python.

import typer  
app = typer.Typer()  
@app.command()  
def train(epochs: int, lr: float = 0.001):  
    print(f"Training for {epochs} epochs with lr={lr}")  
if \_\_name\_\_ == "\_\_main\_\_":  
    app()

You automatically get:

-   Help messages
-   Type validation
-   Auto-completion
-   Clean syntax

It’s built on Click and type hints, which is a combination I didn’t know I needed.

Now I build internal tools as CLIs by default.

### 6\. DuckDB SQL for people who hate setting up databases

DuckDB is an in-process analytical database.

Translation:  
You get SQL performance without running Postgres.

import duckdb  
con = duckdb.connect()  
con.execute("""  
    SELECT country, COUNT(\*)   
    FROM read\_csv\_auto('events.csv')  
    GROUP BY country  
""").fetchall()

You can:

-   Query CSV/Parquet files directly
-   Join DataFrames with SQL
-   Run analytics at insane speed

It’s SQLite for analytics.

And it changed how I explore data locally.

### 7\. Loguru logging without the ritual sacrifice

Python’s built-in logging works.

But configuring it feels like assembling IKEA furniture blindfolded.

Loguru:

from loguru import logger  
logger.add("app.log", rotation="10 MB")  
logger.info("Model training started")  
logger.warning("GPU temperature rising")

Done.

Features:

-   Structured logging
-   Log rotation
-   Better stack traces
-   Zero boilerplate

I replaced logging configs in three projects after discovering it.

No regrets.

### 8\. Watchfiles file watching that actually works

If you’ve ever built a hot-reloading system, you know pain.

Watchfiles is fast, cross-platform, and reliable.

from watchfiles import watch  
for changes in watch("src"):  
    print("Files changed:", changes)

Use cases:

-   Auto-retraining models
-   Rebuilding docs
-   Reloading services
-   Developer tooling

It’s the small library that makes your workflow feel modern.

### 9\. Orjson JSON serialization on steroids

JSON is everywhere.

So speed matters.

import orjson  
data = {"user": 123, "scores": \[1, 2, 3\]}  
json\_bytes = orjson.dumps(data)

Benchmarks regularly show:

-   5–10x faster than json
-   Lower memory usage
-   Correct handling of datetimes

When your API handles thousands of requests per second, this difference becomes very real money.

### A pattern I didn’t notice at first

All these libraries share something:

They remove friction.

Not by adding features.  
But by deleting boilerplate.

Deleting mental overhead.  
Deleting “I’ll refactor this later” code.

> _Pro tip: If a library removes more code than it adds, you’re probably looking at a long-term dependency._

### Final thought

I used to believe mastery meant memorizing syntax.

Now I think it means building a personal toolbox that quietly compounds your productivity.

If even one library from this list makes your next project simpler, faster, or less painful…

…then my past mistakes weren’t wasted after all.

> **_Want a pack of prompts that work for you and save hours?_** [**_click here_**](https://abdulahad28.gumroad.com/l/rwnlrm)

_Want more posts like this? Drop a “YES” in the comment, and I’ll share more coding tricks like this one._

_Want to support me? Give 50 claps on this post and follow me._

_Thanks for reading!_

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=d130f6587826)

* * *

[9 Python libraries that made me say, “why didn’t I learn this earlier?”](https://towardsdev.com/9-python-libraries-that-made-me-say-why-didnt-i-learn-this-earlier-d130f6587826) was originally published in [Towards Dev](https://towardsdev.com) on Medium, where people are continuing the conversation by highlighting and responding to this story.