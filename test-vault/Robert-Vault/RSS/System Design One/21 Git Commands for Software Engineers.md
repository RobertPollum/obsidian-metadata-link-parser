---
title: 21 Git Commands for Software Engineers
link: https://newsletter.systemdesign.one/p/commands-in-git
author: Neo Kim
publish_date: 2025-11-06 05:05:58
saved_date: 2026-01-17 15:10:04
image: https://substack-post-media.s3.amazonaws.com/public/images/7653424e-5c6e-45dd-81af-291961e04e25_1280x720.png
tags: 
---

![image](https://substack-post-media.s3.amazonaws.com/public/images/7653424e-5c6e-45dd-81af-291961e04e25_1280x720.png)

Download my system design playbook for FREE on newsletter signup:

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

-   _[Share this post](https://newsletter.systemdesign.one/p/commands-in-git/?action=share) & I'll send you some rewards for the referrals._
    

* * *

Some of these are basic, and some are pretty advanced. ALL of them are super useful to anyone who writes code.

Curious to know how many were new to you:

1.  git init
    
2.  git status
    
3.  git branch
    
4.  git checkout
    
5.  git diff
    
6.  git diff HEAD
    
7.  git add
    
8.  git commit
    
9.  git stash
    
10.  git fetch
     
11.  git pull
     
12.  git merge
     
13.  git rebase
     
14.  git push
     
15.  git tag
     
16.  git reset
     
17.  git revert
     
18.  git cherry-pick
     
19.  git bisect
     
20.  git log
     
21.  git blame
     

For each, I’ll share:

-   The command
    
-   A common mistake (I’ve made!)
    
-   And why it matters
    

Here are some **concepts** to understand before you get started:

-   Working directory: files you’re currently editing.
    
-   Staging area: a collection of changes prepared for the next commit.
    
-   Local repository: full project history stored on your local machine.
    
-   Remote repository: shared version of the project hosted on a server, such as GitHub or GitLab.
    

Let’s go.

## 1\. git init

> Create a new Git repository in the current directory.

#### **Common mistake**

Running it inside an existing repository. This can be confusing and break Git commands as it’ll create nested repositories. So check if you’re already inside a repository using `git status`.

[

![](https://substackcdn.com/image/fetch/$s_!WEMW!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5099e91-fa17-4d3d-8962-645b7cdbaf84_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!WEMW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5099e91-fa17-4d3d-8962-645b7cdbaf84_1080x1080.png)

#### Why it matters

Git won’t track changes until you initialize a repository. So it’s your first step towards version controlling the files.

Now that you’ve set up a repository, let’s check its current status before going further.

## 2\. git status

> Display the current state of the working directory and staging area. This shows which changes are staged, unstaged, or untracked.

#### Common mistake

Not running it enough. This could cause some files to be overlooked or confusion about what’s added and committed. So run it often to stay aware of the repository’s state.

#### Why it matters

It tells you what needs to be done - for example, what to add or commit. Plus, you can avoid surprises by viewing every change and new file.

## 3\. git branch

> List, create, or delete branches in your repository.

#### **Common mistake**

Assuming it switches branches when you create a new one. For example,

```
git branch new-feature
```

This creates a branch, but doesn’t automatically switch to it. You stay on your current branch unless you run:

```
git checkout new-feature
```

#### Why it matters

You can work on various features or bug fixes without affecting the main code using branches. Besides, branches keep your work “organized and separated”, so you can experiment safely.

* * *

[

![](https://substackcdn.com/image/fetch/$s_!-o6d!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed4a21bf-7d21-49da-9e74-948502359cab_1456x728.webp)



](https://coderabbit.link/neo-oct)

I’m happy to partner with **[CodeRabbit](https://coderabbit.link/neo-oct)** on this newsletter. Code reviews usually delay feature deliveries and overload reviewers. And I genuinely believe CodeRabbit solves this problem.

[Try CodeRabbit](https://coderabbit.link/neo-oct)

* * *

## 4\. git checkout

> Switch to a different branch, or restore files from a specific commit.

#### **Common mistake**

Switching between branches without committing or stashing your changes first. This can cause merge conflicts or prevent the switch altogether.

#### Why it matters

It lets you switch between branches, try out features, or view past code. All without losing your place. Plus, it allows you to restore specific files from an earlier commit.

(In newer versions, try `git switch` for clarity!)

## 5\. git diff

> Show the difference between two versions of your files, commits, or branches.

#### **Common mistake**

Assuming it shows all changes, but shows only UNSTAGED ones. If you want to view staged changes as well, run:

```
git diff --staged
```

#### Why it matters

It helps you catch mistakes and understand changes before committing or merging them.

## 6\. git diff HEAD

> Shows the difference between the working directory and the last commit (**HEAD**).

#### **Common mistake**

Assuming it shows only unstaged changes compared to the last commit. But it shows both STAGED and UNSTAGED changes.

TL;DR:

-   `git diff`: shows only unstaged changes.
    
-   `git diff --staged`: shows only staged changes.
    
-   `git diff HEAD`: shows everything that changed since the last commit.
    

#### Why it matters

It ensures you don’t accidentally skip reviewing any changes before committing!

Now that you’ve reviewed the changes... the next step is to save them to the local repository.

## 7\. git add

> Add changes from the working directory to the staging area.

#### **Common mistake**

Running “`git add .`” without checking what’s included. This might stage unwanted files or incomplete changes. Instead, you can stage specific files or lines using “`git add -p`”.

[

![](https://substackcdn.com/image/fetch/$s_!jsWk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F34a3fd4b-d8ef-49e2-8eda-858a893f4838_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!jsWk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F34a3fd4b-d8ef-49e2-8eda-858a893f4838_1080x1080.png)

Did you know?

-   `git add .` → Adds all changes in the current directory and its sub-folders. But if you’re in a sub-folder, it won’t include files in parent directories.
    
-   `git add *` → Adds only non-hidden files in the current directory. For example, it skips those starting with a dot, like .env or .gitignore.
    
-   `git add :` → Adds all changes from the repository root, including hidden files. It works from any directory in the project and is the safest way to add everything.
    

#### Why it matters

It lets you decide what to include in the next commit. Put simply, your commit might include nothing or miss important changes if you use it wrong.

* * *

Did you know? **[CodeRabbit](https://coderabbit.link/neo-ide)** brings real-time, AI code reviews straight into VS Code, Cursor, and Windsurf.

[

![](https://substackcdn.com/image/fetch/$s_!qzSH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feeef9a7c-ed97-40e9-b48b-18e8d1b9d98d_1600x814.png)



](https://coderabbit.link/neo-ide)

Use it to catch bugs, security flaws, and performance issues _as_ you write code.

[Install CodeRabbit in VS Code for free](https://coderabbit.link/neo-ide)

* * *

## 8\. git commit

> Record staged changes in the local repository as a new snapshot.

#### **Common mistake**

Committing changes:

-   Without reviewing staged files,
    
-   Without a clear commit message.
    

This makes the commit history hard to understand.

[

![](https://substackcdn.com/image/fetch/$s_!UO_C!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F699b552e-9195-4e1f-90b1-1d7c2b3bbe02_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!UO_C!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F699b552e-9195-4e1f-90b1-1d7c2b3bbe02_1080x1080.png)

#### Why it matters

A commit is the fundamental unit of work in Git; it records what changed and why. Good commit messages[1](#footnote-1) make debugging, reviewing, and collaboration easier.

Yet if you get interrupted before committing and need to switch tasks, you can temporarily save your current work. Let’s find out how…

## 9\. git stash

> Temporarily save uncommitted changes so you can work on something else.

#### **Common mistake**

Assuming it saves all changes, including new (untracked) files. But in reality, it stash only TRACKED files. So if you’ve new files, those remain in your working directory and won’t be part of the stash.

You also risk losing untracked files if you then delete or clean your workspace. If you want to stash untracked files, run:

```
git stash -u
```

[

![](https://substackcdn.com/image/fetch/$s_!2-Sw!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F00d838d5-add4-489a-b548-08b91e1e9379_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!2-Sw!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F00d838d5-add4-489a-b548-08b91e1e9379_1080x1080.png)

#### Why it matters

It lets you pause work on a feature and switch branches without losing progress. This can be handy for quickly cleaning your workspace for a code review or hotfix. You can then return later and resume where you left off[2](#footnote-2).

Once you’re back to working on your project, sync the changes your team made while you were busy.

Let’s see how!

## 10\. git fetch

> Download changes from a remote repository without merging them into your code.

#### **Common mistake**

Assuming it automatically updates your branch, which it doesn’t. You still need to merge or rebase afterward.

[

![](https://substackcdn.com/image/fetch/$s_!M0y8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0145deb6-a481-452b-abca-93889276fc0c_2400x1254.png)



](https://x.com/fesshole/status/1772963034882810345)

#### Why it matters

It’s the safest way to review incoming changes[3](#footnote-3) before deciding to MERGE them locally.

## 11\. git merge

> Combine changes from one branch onto another.

#### **Common mistake**

Git will prompt you to resolve conflicts manually before completing the merge. But if you leave merge conflicts unresolved, it can create messy code and errors.

[

![](https://substackcdn.com/image/fetch/$s_!FqYv!,w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5084ee39-496e-4dec-877b-c06663262383_1200x630.gif)



](https://makeagif.com/gif/git-merge-hQ_a-Rhttps://makeagif.com/gif/git-merge-hQ_a-R)

Source: [makeagif](https://makeagif.com/gif/git-merge-hQ_a-R)

#### Why it matters

This is essential for collaboration on a project. It allows team members to work in parallel and integrate their changes.

Remember, a clean merge history makes tracking and debugging easier later on.

## 12\. git pull

> Equal to running git fetch followed by git merge.

#### **Common mistake**

Running it without reviewing changes can create conflicts. Plus, if you pull with uncommitted changes, it can create hard-to-resolve merge conflicts. Or even overwrite your local changes.

[

![](https://substackcdn.com/image/fetch/$s_!XgDJ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F845ea085-0469-48e0-b819-c984ef9a1412_640x518.jpeg)



](https://www.nasserjunior.com/)

Source: [nasserjunior.com](https://www.nasserjunior.com/)

#### Why it matters

It keeps your branch up to date with your team’s latest work.

## 13\. git rebase

> Re-apply commits from one branch onto another.

#### **Common mistake**

Rebasing rewrites commit history. So if you rebase a public branch that others are working on, its history no longer matches theirs. This can create confusing conflicts and broken pull requests. Plus, it could result in data loss if commits get dropped accidentally during the process.

If you want to clean up commit history and rebase with care, run this:

```
git rebase -i
```

[

![](https://substackcdn.com/image/fetch/$s_!pY2S!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7b3d9b02-ed23-401a-9b3b-7812f5dbce11_625x625.png)



](https://kevin-stafford.weebly.com/)

Source: [kevin-stafford.weebly.com](https://kevin-stafford.weebly.com/)

#### Why it matters

It avoids merge commits. So you can integrate updates from the main branch onto the feature branch without cluttering the history[4](#footnote-4). As a result, you have:

-   Clean and linear commit history,
    
-   Easy to understand branch evolution and pull requests.
    

Now that your local repository is up to date with the team’s work, let’s find out how you can share your changes with others.

## 14\. git push

> Upload commits from the local repository to a remote one.

#### **Common mistake**

Pushing without first pulling the latest changes from the remote repository. This can cause conflicts or reject the push operation altogether. So always pull and then RESOLVE any conflicts before pushing. This keeps the history clean and consistent across the repository.

[

![](https://substackcdn.com/image/fetch/$s_!pnO-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe648e4f9-5d23-4c5f-b0ee-f9794e03ad98_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!pnO-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe648e4f9-5d23-4c5f-b0ee-f9794e03ad98_1080x1080.png)

#### Why it matters

It’s how your commits become part of the shared project and keep the team aligned.

* * *

[

![](https://substackcdn.com/image/fetch/$s_!IVbI!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F072e8c1c-10f6-494a-9b1a-e12a712d30b1_2828x1556.png)



](https://github.com/ScoopInstaller/Extras/pull/15266)

Guess what? When you open a pull request, **[CodeRabbit](https://coderabbit.link/neo-oct)** can generate a summary of code changes for the reviewer. It helps them quickly understand complex changes and assess the impact on the codebase. Speed up the code review process.

[Try CodeRabbit](https://coderabbit.link/neo-oct)

* * *

## 15\. git tag

> Marks a specific commit with a label, often to represent a release version.

#### **Common mistake**

Forgetting to push tags to the remote. This means your team members won’t see those version labels in the repository. And this can create confusion about releases or version tracking. So after tagging, run this:

```
#push all tags
git push --tags

OR

#push a specific tag
git push origin <tag>
```

Don’t forget to confirm your tags are on the remote if you use them for deployment or release tracking.

#### Why it matters

It helps you label releases and milestones in the project history. Plus, tags make the deployment and distribution of releases easier.

Mistakes happen. Git provides powerful commands to fix the problems. Let’s see those next...

## 16\. git reset

> Undo changes by moving the current branch to a specific commit. Also optionally update the staging area and working directory.

#### **Common mistake**

Running it carelessly can make you lose hours of work without an easy recovery. For example, you’ll permanently lose your uncommitted changes by running this:

```
git reset --hard
```

Instead, do these for a safe undo…[5](#footnote-5)

-   If you want to undo a commit but keep the changes staged, run this:
    

```
git reset --soft
```

-   If you want to undo a commit and move changes back to your working directory, run this:
    

```
git reset —-mixed
```

#### Why it matters

It lets you fix mistakes without creating new commits. This means you’ve full control over what your branch includes.

## 17\. git revert

> Create a new commit to reverse the changes from an earlier commit.

#### **Common mistake**

Assuming it removes a commit from history. Instead, it creates a new commit to undo previous changes.

Here are 2 heuristics you should know:

-   If you want to undo changes on a SHARED branch (safely), run this:
    

```
git revert
```

-   If you want to remove a commit from a LOCAL branch that hasn’t been pushed yet, run this:
    

```
git reset
```

[

![](https://substackcdn.com/image/fetch/$s_!hW1L!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15d6cf09-d104-477f-b9b6-1076ff77c3cb_2400x1254.png)



](https://x.com/shubhamganu/status/1324378884461137922)

#### Why it matters

Reverting is the safe way to undo a commit on a shared branch. It fixes mistakes from past commits without rewriting history. This way, everyone’s copies stay in sync, and you’ve a correction record.

## 18\. git cherry-pick

> Apply a specific commit from another branch onto your current branch.

#### **Common mistake**

Cherry-picking the same commit more than once or onto the wrong branch. This can duplicate changes and create conflicts.

Here’s what you should do instead:

-   Check the commit hash and current branch before cherry-picking.
    
-   Use `git log` or `git reflog`[6](#footnote-6) to check if the commit already exists.
    

#### Why it matters

It lets you apply bug fixes or backport changes without merging the entire branch. This gives you precise control over what changes move where.

## 19\. git bisect

> Finds the commit that introduced a bug by binary searching through the commit history.

#### **Common mistake**

After running `git bisect`, Git puts you in a detached `HEAD` state. If you forget to reset, you may continue working without being on a real branch. This can lead to confusion or lost commits.

#### Why it matters

It saves you time by speeding up the debugging process. Instead of checking every commit one by one, it finds the commit that caused the bug in a few steps.

If you want to collaborate effectively, you’ve got to better understand your project history. And know who made which changes. Onward.

* * *

[

![](https://substackcdn.com/image/fetch/$s_!tHi0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccbf27ab-cea5-4105-81c0-4fe848b50c7e_1456x880.webp)



](https://coderabbit.link/neo-cli)

Bet you didn’t know… **[CodeRabbit CLI](https://coderabbit.link/neo-cli)** brings instant code reviews directly to your terminal, seamlessly integrating with Claude Code, Cursor CLI, and other AI coding agents. While they generate code, CodeRabbit ensures it’s production-ready - catching bugs, security issues, and AI hallucinations before they hit your codebase.

[Install CodeRabbit CLI](https://coderabbit.link/neo-cli)

* * *

## 20\. git log

> Show the commit history of the current branch.

#### **Common mistake**

Not knowing how to exit the log viewer. If you want to quit and return to the command line, press `q`.

#### Why it matters

The log is a record of all changes; it includes information about who made which changes and when. This helps you understand the context behind a change or debug a failure.

## 21\. git blame

> Show who last changed each line of a file and when.

#### **Common mistake**

Misusing it to point fingers can damage team trust and overlook the actual reasons behind a change. Instead, you should:

-   Use it to understand code history and ask better questions.
    
-   Combine it with `git log` or `git show`[7](#footnote-7) to understand the full context of a change.
    

Remember, it’s meant to help understand code history, not to place guilt on someone.

[

![](https://substackcdn.com/image/fetch/$s_!h27J!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdfd78628-e662-46de-8ed4-0d2d17c08c53_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!h27J!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdfd78628-e662-46de-8ed4-0d2d17c08c53_1080x1080.png)

#### Why it matters

It lets you figure out why part of the code is the way it is, or find when a bug first appeared. Plus, it shows you who changed each line and which commit introduced the change. This provides context and can point you to the right person to ask about it.

## Final words

These 21 commands are the foundation of Git. Once you understand them, everything else is just a variation or combination.

[

![](https://substackcdn.com/image/fetch/$s_!Cbgq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3cc839e1-a064-4761-85aa-fdc5840b194b_1080x1080.png)



](https://substackcdn.com/image/fetch/$s_!Cbgq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3cc839e1-a064-4761-85aa-fdc5840b194b_1080x1080.png)

If I missed something, just let me know in the comments 👇

[Leave a comment](https://newsletter.systemdesign.one/p/commands-in-git/comments)

* * *

If you find this newsletter valuable, share it with a friend, and subscribe if you haven’t already. There are [group discounts](http://newsletter.systemdesign.one/subscribe?group=true), [gift options](http://newsletter.systemdesign.one/subscribe?gift=true), and [referral bonuses](https://newsletter.systemdesign.one/leaderboard) available.

[Subscribe now](https://newsletter.systemdesign.one/subscribe?)

* * *

[

![Author Neo Kim; System design case studies](https://substackcdn.com/image/fetch/$s_!bEFk!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f94ab8c-0d67-4775-992e-05e09ab710db_320x320.png "Author Neo Kim; System design case studies")



](https://www.linkedin.com/in/nk-systemdesign-one/)

**👋 Find me on [LinkedIn](https://www.linkedin.com/in/nk-systemdesign-one/) | [Twitter](https://x.com/intent/follow?screen_name=systemdesignone) | [Threads](https://www.threads.net/@systemdesignone) | [Instagram](https://www.instagram.com/systemdesignone/)**

* * *

**Want to advertise in this newsletter?** 📰

If your company wants to reach a 180K+ tech audience, [advertise with me](https://newsletter.systemdesign.one/p/sponsorship).

* * *

Thank you for supporting this newsletter.

You are now 180,001+ readers strong, very close to 181k. Let’s try to get 181k readers by 10 November. Consider sharing this post with your friends and get rewards.

Y’all are the best.

[

![system design newsletter](https://substackcdn.com/image/fetch/$s_!6oWl!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png "system design newsletter")



](https://substackcdn.com/image/fetch/$s_!6oWl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e739087-a910-4643-be36-997b6dd5b4af_800x500.png)

[Share](https://newsletter.systemdesign.one/p/commands-in-git?utm_source=substack&utm_medium=email&utm_content=share&action=share)

[1](#footnote-anchor-1)

Some tips for writing good commit messages:

-   Use the imperative tone - e.g., “Fix bug” instead of “Fixed bug.”
    
-   Keep it short and specific.
    
-   Explain why, not just what - give context when necessary.
    

[2](#footnote-anchor-2)

Use `git stash apply` to reapply your stashed changes without removing them from the stash. So you can reuse them later if needed.

[3](#footnote-anchor-3)

Remember this:

-   git fetch - refresh
    
-   git pull - download changes
    
-   git commit - save changes locally
    
-   git push - upload changes
    

[4](#footnote-anchor-4)

I usually rebase my feature branch onto the main and then merge it.

[5](#footnote-anchor-5)

`git reflog` shows a history of all recent changes to your branches, so you can find and recover commits not in `git log`. If you mess up a Git command (a bad reset, rebase, or checkout), `git reflog` lets you see where your branch or HEAD used to be. This way, you can recover lost commits by checking out or resetting to a previous state.

[6](#footnote-anchor-6)

`git reflog` shows a record of all recent changes to HEAD. For example, you check out a branch, make a commit, run a reset, or use cherry-pick. Even if a commit no longer appears in git log, it’s still visible in `git reflog`.

[7](#footnote-anchor-7)

`git show` displays the details of a specific commit, including the commit message, author, date, and the code changes.