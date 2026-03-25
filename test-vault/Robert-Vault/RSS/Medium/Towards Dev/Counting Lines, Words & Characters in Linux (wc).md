---
title: "Counting Lines, Words & Characters in Linux (wc)"
link: https://towardsdev.com/counting-lines-words-characters-in-linux-wc-11c2563755a8?source=rss----a648dc4ecb66---4
author: Nakul Mitra
publish_date: 2026-01-19 01:18:48
saved_date: 2026-01-19 07:02:54
image: https://cdn-images-1.medium.com/max/1024/1*CVqyZvbCjyEd9hBULPkKYA.png
tags: #devops #linux #software-development #linux-tutorial #software-engineering
---

![image](https://cdn-images-1.medium.com/max/1024/1*CVqyZvbCjyEd9hBULPkKYA.png)

![](https://cdn-images-1.medium.com/max/1024/1*CVqyZvbCjyEd9hBULPkKYA.png)

The wc command is one of the simplest yet most powerful text-processing tools in Linux. It is used to count lines, words, and characters in files or command output. Developers, system administrators, and DevOps engineers use it daily to analyze logs, datasets, and source code.

### What is wc?

wc stands for Word Count, but it does much more than just counting words.

By default, wc shows:

-   Number of lines
-   Number of words
-   Number of bytes (characters)
-   The file name

### Basic Syntax

wc \[options\] file

### Basic Usage

wc file.txt

Example output:

120   950   6840   file.txt

This means:

-   120 -> lines
-   950 -> words
-   6840 -> characters (bytes)

### Counting Only Lines (-l)

wc -l file.txt

This prints only the number of lines.

### Common Use Cases

-   Count log entries
-   Count rows in CSV files
-   Measure size of code files

Example:

grep "ERROR" server.log | wc -l

Counts how many error messages appear in the log.

### Counting Words (-w)

wc -w file.txt

This counts how many words are present.

### Use Cases

-   Analyzing documents
-   Counting records in structured text
-   Checking size of documentation

### Counting Characters (-c and -m)

wc -c file.txt

Counts total number of bytes.

wc -m file.txt

Counts actual characters (important for Unicode text).

Use -m when working with:

-   UTF-8
-   Multilingual text
-   Special symbols

### Using wc with Pipes

wc becomes extremely powerful when combined with other Linux commands using pipes (|).

### Count matching lines

grep "ERROR" app.log | wc -l

### Count files in a directory

ls | wc -l

### Count number of running processes

ps aux | wc -l

### Counting Multiple Files

wc file1.txt file2.txt

Output:

  20   150   900   file1.txt  
  30   200   1200  file2.txt  
  50   350   2100  total

Linux automatically shows a total at the bottom.

### Why Developers Use wc

wc is extremely useful for:

-   Checking log volume
-   Counting data rows
-   Measuring file sizes
-   Monitoring pipelines
-   Validating scripts
-   Estimating codebase size

It is widely used in:

-   DevOps
-   Backend development
-   Data processing
-   Shell scripting

### Summary Table

![](https://cdn-images-1.medium.com/max/511/1*pTlSXxScLpbb4BxinxrI6A.png)

### Final Notes

Although wc looks simple, it is one of the most powerful Linux text analysis tools when combined with commands like grep, cat, sort, and uniq. This makes it an essential skill for every Linux user, developer, and DevOps engineer.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=11c2563755a8)

* * *

[Counting Lines, Words & Characters in Linux (wc)](https://towardsdev.com/counting-lines-words-characters-in-linux-wc-11c2563755a8) was originally published in [Towards Dev](https://towardsdev.com) on Medium, where people are continuing the conversation by highlighting and responding to this story.