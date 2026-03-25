---
title: Bellman Ford Cycle Detection in Java
link: "https://medium.com/@AlexanderObregon/bellman-ford-cycle-detection-in-java-063fa1c8c1a4?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-07 16:05:09"
saved_date: "2026-01-17 15:09:43"
image: "https://cdn-images-1.medium.com/max/328/0*l97vC1QkxR8Sivxt.png"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/328/0*l97vC1QkxR8Sivxt.png)

![](https://cdn-images-1.medium.com/max/328/0*l97vC1QkxR8Sivxt.png)

[Image Source](https://www.oracle.com/java/java-affinity/logos/)

Working with weighted graphs can be easier when you have a way to follow how edge weights pull totals down during repeated passes. Bellman Ford builds that flow through small relaxation steps that pull numbers toward their real values. As the rounds move on, any edge that still lowers a total points to something deeper inside the graph. That drop exposes a cycle with a negative sum. Knowing how the updates behave across the full run helps build a sense for how the graph reacts to those weight shifts and why cycle detection falls naturally out of that process.

_I publish free articles like this daily, if you want to support my work and get access to exclusive content and weekly recaps, consider subscribing to my_ [_Substack_](https://alexanderobregon.substack.com/)_._

### Graph Structure and Relaxation Logic

Graph work can feel scattered at first, yet structure starts forming once weighted edges sit in a layout built for repeated passes. Bellman Ford works well with a plain edge list because the algorithm moves through that list over and over, letting the focus stay on how totals drop as weights press them down. Small updates across connected vertices build toward stable values, and this early stage sets the ground for spotting trouble later.

#### Graph Data Shape for Clear Passes

Weighted graphs work best when the structure stays light enough for repeated sweeps. The easiest starting point tends to be a plain list of edges, because Bellman Ford circles through the same edge entries again and again. Each item carries a source, a target, and a weight. That small trio gives the algorithm everything it needs to evaluate how far a total can fall during a pass. Keeping those three fields in a class keeps the code readable, and Java handles these small objects with no trouble on large inputs.

class Edge {  
    int source;  
    int target;  
    int weight;  
  
    Edge(int source, int target, int weight) {  
        this.source = source;  
        this.target = target;  
        this.weight = weight;  
    }  
}

You could store these edges inside an ArrayList and handle thousands of connections without slowing down.

Sometimes a record cuts down on boilerplate, though the basic class still ends up being more flexible when you want to expand things later.

record EdgeRecord(int source, int target, int weight) {}

Record syntax keeps the code shorter when you only need the three values. Class-based edges leave room for growth if you want extra fields or helper functions during practice. Either option keeps the storage flat, and that flat layout works well with the passes Bellman Ford relies on. Nothing gets nested or tucked inside deeper structures, which helps the relaxation logic stay the main focus once the updates begin.

#### How a Relaxation Step Nudges a Total

Relaxation forms the small action that drives the whole method. Every round checks the full edge list and watches for any spot where the sum from the source through the edge weight lowers the current stored total for the target. That small drop carries the value closer to a stable number. Many students discover that this part feels steady and predictable, which makes Bellman Ford easier to follow compared to more complex graph routines.

if (distance\[e.source\] + e.weight < distance\[e.target\]) {  
    distance\[e.target\] = distance\[e.source\] + e.weight;  
}

The update ties math and code together in a direct way. The algorithm compares two integers and lowers the target when the source route offers a better number. That is the entire heart of relaxation, no heavier structure or unusual trick is needed to grasp how it works.

Some learners find more comfort when they see the full relaxation loop tied to the number of vertices.

for (int i = 0; i < vertices - 1; i++) {  
    for (Edge e : edges) {  
        if (distance\[e.source\] != Integer.MAX\_VALUE  
                && distance\[e.source\] + e.weight < distance\[e.target\]) {  
            distance\[e.target\] = distance\[e.source\] + e.weight;  
        }  
    }  
}

That loop helps introduce an important idea. Many vertices start unreachable, and the guard against Integer.MAX\_VALUE keeps the algorithm from adding a weight to a value that represents infinity. Early passes bring reachable vertices into play. Later passes trim the totals by working through new routes uncovered along the way. Small drops during these sweeps form the step by step movement that shapes the values toward stability.

Bellman Ford depends on this motion. When the relaxation stage finally settles, the graph holds steady. When something keeps pulling values downward, trouble is waiting deeper inside the structure. This rhythm of passes and updates sets the stage for the cycle detection work that follows later in the article.

### Detecting Negative Cycles Through Overdue Changes

Cycle detection rests on a small observation about how Bellman Ford behaves when things stay normal. Repeated passes bring distance values closer to a stable point. When no negative cycle is reachable from the chosen source vertex, the relaxation rounds settle down after the expected count. Later passes shouldn’t change anything, and a drop at that stage points to a loop that keeps dragging the total lower.

#### Why Extra Passes Catch Runaway Drops

Extra passes create a chance to watch for drops that shouldn’t happen. Bellman Ford plans for n minus one rounds when the graph holds n vertices. Those passes give every path enough time to settle. A graph with no negative cycle reachable from the source reaches a steady point where values stay fixed during further checks. Relaxation falls quiet at that stage because every reachable distance has already found its lowest number.

boolean dropFound = false;  
  
for (Edge e : edges) {  
    int from = e.source;  
    int to = e.target;  
    int w = e.weight;  
  
    if (distance\[from\] != Integer.MAX\_VALUE  
            && distance\[from\] + w < distance\[to\]) {  
        dropFound = true;  
        break;  
    }  
}

This sweep repeats the same relaxation idea but acts as a final stress test. Any drop after everything should have stabilized carries real meaning. That drop pulls attention to a path that loops in a harmful direction. More passes only deepen the fall, so this early discovery keeps the check small and direct. No extra data structures or scanning shortcuts are needed. The signal arrives through the same movement that built the valid totals earlier.

#### How Distance Arrays React to a Cycle

Distance arrays behave in a predictable way when no negative cycle is reachable from the source. Early values start high, and later passes drop those values where needed. Stability arrives near the end of the planned rounds. Negative cycles break that pattern. Values tied to vertices near the cycle keep dropping through late rounds, and the fall will not stop because the cycle creates a route that keeps undercutting previous totals.

edges.add(new Edge(1, 2, -3));  
edges.add(new Edge(2, 1, 1));

Cycles like this between vertex 1 and vertex 2 drop the total every time the algorithm circles through those edges. That run, which should reach stability, instead keeps moving the number downward. Watching the array change across late passes exposes that motion. When the extra sweep catches another drop, the array tells a story about travel through a loop with a negative total.

Different graphs reveal this in different ways. Some show large drops, others show repeated tiny cuts. Either way, that late movement points to trouble. Distance arrays that never reach a stopping point fit the picture of an unwanted loop pulling totals further down without limit.

#### Tracking Vertex Updates for Better Clarity

Cycle detection doesn’t always stop at yes or no. Sometimes it helps to know which vertices land close to the cycle. Tracking those updates gives more context when the graph grows large. Second passes after the cycle check can gather the vertices touched by late drops. That extra scan keeps the attention on the area where the issue forms.

List<Integer> touched = new ArrayList<>();  
  
for (Edge e : edges) {  
    int from = e.source;  
    int to = e.target;  
    int w = e.weight;  
  
    if (distance\[from\] != Integer.MAX\_VALUE  
            && distance\[from\] + w < distance\[to\]) {  
        touched.add(to);  
    }  
}

That list forms a small map of the trouble spots. It won’t reconstruct the full loop, yet it gives a sense of where the distances refuse to settle. Learners in a classroom or engineers digging into a larger graph can follow those numbers to find the region pulling the totals down. This technique sits outside the core Bellman Ford rules but remains a helpful extension when extra clarity is needed. It also keeps the logic grounded in the same relaxation mechanics without shifting to unrelated tools.

#### Full Java Example That Combines Everything

Pulling the cycle detection steps into a short runnable example creates a stronger picture of the full flow. This version holds the edge list, distance handling, relaxation rounds, and late detection pass. A basic graph helps make the signal visible:

import java.util.\*;  
  
public class CycleScan {  
  
    static class Edge {  
        int source;  
        int target;  
        int weight;  
  
        Edge(int s, int t, int w) {  
            source = s;  
            target = t;  
            weight = w;  
        }  
    }  
  
    public static void main(String\[\] args) {  
  
        int vertices = 3;  
        int\[\] distance = new int\[vertices\];  
        Arrays.fill(distance, Integer.MAX\_VALUE);  
        distance\[0\] = 0;  
  
        List<Edge> edges = new ArrayList<>();  
        edges.add(new Edge(0, 1, 4));  
        edges.add(new Edge(1, 2, -6));  
        edges.add(new Edge(2, 1, 2));  
  
        for (int i = 0; i < vertices - 1; i++) {  
            for (Edge e : edges) {  
                if (distance\[e.source\] != Integer.MAX\_VALUE  
                        && distance\[e.source\] + e.weight < distance\[e.target\]) {  
                    distance\[e.target\] = distance\[e.source\] + e.weight;  
                }  
            }  
        }  
  
        boolean cycleFlag = false;  
  
        for (Edge e : edges) {  
            if (distance\[e.source\] != Integer.MAX\_VALUE  
                    && distance\[e.source\] + e.weight < distance\[e.target\]) {  
                cycleFlag = true;  
                break;  
            }  
        }  
  
        if (cycleFlag) {  
            System.out.println("Cycle found with negative total");  
        } else {  
            System.out.println("No negative cycle detected");  
        }  
    }  
}

The code follows the idea that late drops reveal a loop pulling values down. Relaxation rounds serve as preparation, and the extra sweep signals the trouble. All of this happens through the same numeric checks that shaped the earlier passes, allowing the cycle to reveal itself through the movement of the totals rather than any special trick bolted on later.

### Conclusion

Cycle detection in Bellman Ford grows naturally out of how the relaxation process behaves during its final rounds. Values settle when the graph stays free of trouble, and late drops expose deeper issues without extra machinery. Negative loops interrupt that progress and keep pulling numbers lower, and the extra sweep exposes that motion through the same mechanics that shaped the earlier passes. This blend of repeated checks and basic comparisons gives the method its strength and keeps the entire cycle detection phase grounded in how the graph reacts to weight pressure.

1.  [_Java Language Specification_](https://docs.oracle.com/javase/specs/)
2.  [_Java_](https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html) [_Arrays Class Reference_](https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html)
3.  [_Java Collections Framework Guide_](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/)
4.  [_Java Tutorials on Data Structures_](https://docs.oracle.com/javase/tutorial/collections/)
5.  [_Graph Theory Basics from Princeton Algorithms Text_](https://algs4.cs.princeton.edu/40graphs/)

**Thanks for reading! If you found this helpful, highlighting, clapping, or leaving a comment really helps me out.**

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=063fa1c8c1a4)