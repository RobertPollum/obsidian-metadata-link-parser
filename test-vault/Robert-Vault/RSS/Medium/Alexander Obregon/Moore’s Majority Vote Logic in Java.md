---
title: Moore’s Majority Vote Logic in Java
link: "https://medium.com/@AlexanderObregon/moores-majority-vote-logic-in-java-4faf2e55bbff?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-08 16:58:51"
saved_date: "2026-01-17 15:09:43"
image: "https://cdn-images-1.medium.com/max/328/0*l97vC1QkxR8Sivxt.png"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/328/0*l97vC1QkxR8Sivxt.png)

![](https://cdn-images-1.medium.com/max/328/0*l97vC1QkxR8Sivxt.png)

[Image Source](https://www.oracle.com/java/java-affinity/logos/)

Many data problems boil down to finding a value that turns up more than half the time in a sequence. Moore’s Majority Vote logic helps with that by working in two passes through the data. On the first pass, a running counter pushes one candidate forward or knocks it back as values come in, and on the second pass a plain frequency check confirms whether that candidate truly dominates the sequence. At the end of the article we will also walk through LeetCode 169 Majority Element and see how the same mechanics lead to a Java solution that matches the problem’s rules.

_I publish free articles like this daily, this was originally posted on my_ [_Java and JVM section on Substack_](https://alexanderobregon.substack.com/s/java?utm_source=substack&utm_medium=menu)_._ [_My Substack_](https://alexanderobregon.substack.com/) _also includes weekly recaps if you’d like to keep up with everything I’m publishing._

### How the Candidate Rises to the Top

First pass through the data builds a kind of running election. Counter starts neutral, then every new element either adds support to the current candidate or takes some away. Matches raise the counter and keep the current candidate in front, while different values pull the counter down and chip away at that lead. Reaching zero means the current candidate has no net support left, so the next element steps in as the new candidate and the tally starts again from one. Value that appears in more than half of the positions keeps gaining support faster than its opponents can cancel it, so it survives these cycles and remains in place at the end of the sweep.

#### How the Counter Responds to Each Value

Core state for the first pass fits in two variables called candidate and count. Counter value starts at zero. When count is zero, the next element from the array becomes the new candidate and count jumps to one. Matching elements raise count. Different elements push count downward. Any time the counter falls back to zero, the next element gets a fresh chance to stand as candidate. That cycle repeats across the entire sequence.

public static Integer findCandidate(int\[\] nums) {  
    Integer candidate = null;  
    int count = 0;  
  
    for (int n : nums) {  
        if (count == 0) {  
            candidate = n;  
            count = 1;  
        } else if (n == candidate) {  
            count += 1;  
        } else {  
            count -= 1;  
        }  
    }  
  
    return candidate;  
}

This findCandidate method touches every element a single time, keeps its work in two small variables, and returns a candidate when the array has elements or null when the array is empty. Matches feed the counter, mismatches drain it, and the reset at zero keeps the method from holding on to a weak candidate for too long.

Short traces can show us how the state moves as values arrive. Logging code keeps the same rules but prints candidate and counter values as the sweep moves forward.

public static void traceCandidate(int\[\] nums) {  
    Integer candidate = null;  
    int count = 0;  
  
    for (int n : nums) {  
        if (count == 0) {  
            candidate = n;  
            count = 1;  
        } else if (n == candidate) {  
            count += 1;  
        } else {  
            count -= 1;  
        }  
  
        System.out.println(  
            "value=" + n  
            + ", candidate=" + candidate  
            + ", count=" + count  
        );  
    }  
}

The call to traceCandidate on a short array exposes resets at count == 0, shows how repeated values push the counter upward, and records how scattered values pull that number back toward zero. Line by line, the sweep behaves like a small voting machine built out of integers.

#### Why the Candidate Survives the Sweep

Majority elements have a natural advantage in this process. For every pair where a majority value meets a different value, the counter treats them as a match and a mismatch that balance each other out. Any value that appears more than half the time has more matches than there are possible mismatches against it. Those extra matches survive any cancellations and keep the counter from staying at zero forever.

When the true majority value shows up very early, that value tends to become the first strong candidate, the counter climbs as more copies appear, and short bursts of other values only nibble away at that count. Even if the majority value appears later in the array, stretches of that value still build the counter back up after earlier candidates have come and gone. Mismatching elements can drag the counter down, but they never outnumber the majority in total, so they cannot erase every influence of that majority value.

This small driver code calls findCandidate on an example array and prints the result:

public static void demoSweep() {  
    int\[\] nums = {2, 1, 2, 3, 2, 2};  
    Integer candidate = findCandidate(nums);  
    System.out.println("Candidate after sweep = " + candidate);  
}

Array in demoSweep holds four copies of value 2 and two other values. Sequence of matches and mismatches that flows through findCandidate leaves 2 as the final candidate because no other value can cancel so many matches. That behavior carries over to longer arrays as well. Any value that truly holds more than half the positions survives the pairwise cancellations and emerges from the sweep as the only number that still has enough backing from the counter.

### How the Confirmation Step Works

Confirmation logic turns a candidate from the first pass into a verified majority value. Candidate selection can succeed even when no true majority exists, because the counter rules always leave something in place at the end of the sweep. Frequency counting across the same data set settles that uncertainty. One pass chooses, another pass measures, and together they give a result that matches the majority definition of more than half of all positions.

#### Why a Second Pass Matters

Candidate search only guarantees that no value could defeat the final candidate under the local rules of the counter. That guarantee differs from the majority condition, which requires strictly more than half of all positions. A second pass checks that condition in direct form by counting how many times the candidate appears and comparing that count with the length of the array.

One compact implementation in Java looks like this:

public static Integer majorityElement(int\[\] nums) {  
    Integer candidate = findCandidate(nums);  
    if (candidate == null) {  
        return null;  
    }  
  
    int tally = 0;  
    for (int n : nums) {  
        if (n == candidate) {  
            tally += 1;  
        }  
    }  
  
    if (tally > nums.length / 2) {  
        return candidate;  
    }  
    return null;  
}

This majorityElement method separates selection from confirmation in a clear way. First call to findCandidate gives a candidate from the voting sweep, then the loop counts exact matches, and the final condition checks whether the tally passes the majority bar.

Many workflows need only a yes or no verdict without storing the majority value itself. A helper that reports whether any majority exists can sit on top of the same steps:

public static boolean hasMajority(int\[\] nums) {  
    Integer candidate = findCandidate(nums);  
    if (candidate == null) {  
        return false;  
    }  
  
    int tally = 0;  
    for (int n : nums) {  
        if (n == candidate) {  
            tally += 1;  
        }  
    }  
  
    return tally > nums.length / 2;  
}

Applications that only care whether a majority appears at all can call hasMajority and branch on the boolean result, while code that needs the value itself can keep using majorityElement. Both rely on the same logical structure, with a first phase that selects and a second phase that measures.

#### How Data Layout Affects the Uphill Climb

Order of elements in the array has a strong effect on how the counter moves during the first pass, even though it does not change the final condition checked in the second pass. Clusters of the majority value raise the counter quickly, scattered placements of that value cause more resets, and alternating stretches of different values create long sequences of cancellations. The second pass does not depend on this history, but the way the first pass behaves can still matter for intuition, debugging, and performance tracing.

Arrays that carry the same multiset of values but in different layouts give the same majority decision after confirmation. That fact comes from the definition of majority as a global frequency property. Candidate selection can vary between layouts, yet any candidate that survives the sweep and passes the frequency test must share the same count relative to the total length.

let’s look at a short driver code that compares layouts makes this more concrete:

public static void compareLayouts() {  
    int\[\] clustered  = {3, 3, 3, 1, 2, 3, 3};  
    int\[\] scattered  = {3, 1, 3, 2, 3, 3, 3};  
    int\[\] alternating = {3, 1, 3, 1, 3, 1, 3};  
  
    Integer majorityClustered   = majorityElement(clustered);  
    Integer majorityScattered   = majorityElement(scattered);  
    Integer majorityAlternating = majorityElement(alternating);  
  
    System.out.println("clustered majority   = " + majorityClustered);  
    System.out.println("scattered majority   = " + majorityScattered);  
    System.out.println("alternating majority = " + majorityAlternating);  
}

Driver compareLayouts sends three arrays with the same majority count into majorityElement and prints the result for each layout. Counter movements inside findCandidate follow different paths across these inputs, yet the final majority decisions match, because the second pass depends only on how many times the candidate appears in each full array.

#### Where Majority Vote Patterns Fit

Moore’s voting logic, paired with a confirmation step, fits naturally in places where memory is tight or data volumes are large and only a single value needs attention. Streams of sensor readings, event logs from services, batched telemetry, and per user or per device traces are common examples. Code can scan one segment at a time, track a candidate and counter for that segment, and run the confirmation step without building extra maps or auxiliary arrays.

Workloads that compute per group majorities adopt the same structure but scope it to groups. Data pipelines that group rows by customer, region, device, or session can run candidate selection and confirmation for one group at a time. Each group then carries its own candidate, tally, and length. That design keeps per group state small while still enforcing the majority rule.

Some algorithms that need heavy frequency statistics treat majority checks as quick filters. Systems that scan streams can tag any segment where some value dominates, then forward only those segments to more expensive analysis. That combination of candidate sweep and confirmation works as a fast front gate in that setting and trims the work handed to later stages while still honoring the mathematical definition of a majority value.

### LeetCode #169 Majority Element

Now let’s have some fun and take everything we went over and apply it to a LeetCode problem. The [Majority Element LeetCode 169 problem](https://leetcode.com/problems/majority-element/description/) asks for the element that appears more than half the time in an integer array and states that such a value always exists. That description lines up perfectly with Moore’s majority vote logic. One sweep can track a candidate with a counter, and that candidate can then be treated as the majority for this specific problem because the input contract guarantees that some value truly dominates the array. The mechanics we went over from earlier on counters and cancellations carry over here, adapted to the exact method signature that LeetCode expects, and a separate confirmation pass can be optionally added when inputs do not guarantee a majority.

Here is the Java solution code that applies Moore’s majority vote logic inside the Solution is:

class Solution {  
    public int majorityElement(int\[\] nums) {  
        int candidate = 0;  
        int count = 0;  
  
        for (int n : nums) {  
            if (count == 0) {  
                candidate = n;  
                count = 1;  
            } else if (n == candidate) {  
                count += 1;  
            } else {  
                count -= 1;  
            }  
        }  
  
        return candidate;  
    }  
}

Now Let’s break that down:

class Solution {  
    public int majorityElement(int\[\] nums) {

Online judges like LeetCode provide this Default Solution class and the majorityElement method as the default Java wrapper for the problem. Runner code on their side creates an instance of Solution and calls majorityElement, passing in the nums array that holds all input values, then checks the returned int against the expected majority element.

        int candidate = 0;

Variable candidate holds the current guess for the majority value while the loop runs. Initial value 0 is only a placeholder; it will be overwritten as soon as count reaches zero and the loop reads its first element. Many solutions set this starting value to any integer because the algorithm always assigns a real candidate from the array before relying on it.

        int count = 0;

Variable count tracks how much support the current candidate has. Zero means there is no active candidate and the next element should be adopted. Positive values mean the current candidate has that many more supporters than opponents so far. Logic in the loop only ever adds or subtracts one from this variable, so it moves gradually as the algorithm scans across nums.

        for (int n : nums) {

This enhanced for loop walks through every value in nums. Variable n holds the current element during each step. Reading this line as “for each number n inside the array nums” matches how the loop behaves. Every body line below this one runs once for every element in the array, always in order from left to right.

            if (count == 0) {

The first branch checks whether there is an active candidate. Condition count == 0 means no candidate has net support at this moment, because all previous matches and mismatches have canceled out. That is the moment when the algorithm is allowed to pick a new candidate from the stream of values.

                candidate = n;

Here, this line sets the candidate to the current value n. Whatever integer sits at this position in the array now becomes the new favorite. From this point on, later values either support or oppose this candidate until the counter returns to zero.

                count = 1;

We then make a counter starts at 1 after candidate is set. That number represents a single vote in favor of the new candidate from the value just read. No other values have been processed with this candidate yet, so support level is exactly one.

            } else if (n == candidate) {

This second branch handles the case where there is already a candidate and the current number n matches it. Condition n == candidate means the new value agrees with the current choice for majority, so support should grow. Only one of the branches in this set will run for each element, so a value that reaches this line will always have a nonzero count and equal candidate.

                count += 1;

This support counter increases by one when a new value agrees with candidate. This records an extra vote for the same value and strengthens its position. Large clusters of the same value push count higher and higher through this line, which helps that value stay in place as the current candidate across many loop iterations.

            } else {

In the final branch, we cover the remaining case, where there is an active candidate and the current value n does not equal it. That situation counts as a vote against the candidate from some other value in the array. Both of the earlier conditions failed, so this block only runs when count is not zero and n differs from candidate.

                count -= 1;

Support counter drops by one when a value disagrees with the candidate. That drop models a cancellation between one supporter and one opponent. Pairs of different values remove influence from both sides, and net support for the candidate shrinks. When enough mismatches arrive in a row, count can fall all the way back to zero, which opens the door for a new candidate on a later iteration.

            }  
        }

Closing braces end the if block and the for loop. When we reach this point, every value in nums has been processed, all local conflicts between supporters and opponents have been resolved through increments and decrements of count, and the variable candidate holds the value that survived this cancellation process. For this LeetCode problem, problem rules guarantee that this survivor is the true majority element.

        return candidate;

With this, the method returns the final candidate as the answer. Java sends this integer back to the caller inside the online judge, which compares it with the expected majority for the test case. Majority vote logic proves that when a majority value exists, the candidate that survives the pass is exactly that majority. That property makes it safe to return candidate without a second pass on LeetCode 169.

    }  
}

The last two braces close the majorityElement method and the Solution class. Everything related to solving the problem lives between these braces. Java compiler treats Solution as a complete type that contains one public method for this particular problem, and LeetCode runs that method on many arrays to check that the majority element is computed correctly.

Moore’s majority vote idea in Java works by keeping a running candidate and a count as the array is scanned from left to right. When count is zero, the next number becomes the new candidate, matches add one to count, and different numbers subtract one, so values that do not appear very frequently cancel out while a true majority value keeps pulling the counter back up until it survives at the end. That survivor is returned as the answer to the LeetCode problem because the input always contains a value that appears more than half of the time. Big O notation describes the running time as O(n), which means that if the array has n numbers, the method looks at each number exactly a single time and the work grows in direct proportion to how many numbers there are. In Big O notation, the extra memory use as O(1), which means the method keeps only a couple of integer variables no matter how large the array becomes, so memory use stays flat even as the input grows.

### Conclusion

Moore’s majority vote logic turns a stream of values into a series of small contests where a candidate gains or loses support through a single counter. First sweep through an array lets matches raise the counter and mismatches lower it until one value survives these cancellations, and a second sweep can confirm whether that value appears more than half the time. Java code that follows this pattern keeps state in just a few integers and touches every element a fixed number of times, which gives linear running time and constant extra memory while still matching the formal majority definition used in problems like LeetCode 169.

1.  [_LeetCode Majority Element Problem_](https://leetcode.com/problems/majority-element/)
2.  [_Java Language Specification_](https://docs.oracle.com/javase/specs/)
3.  [_Java Collections and Arrays Guide_](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/index.html)

**Thanks for reading! If you found this helpful, highlighting, clapping, or leaving a comment really helps me out.**

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=4faf2e55bbff)