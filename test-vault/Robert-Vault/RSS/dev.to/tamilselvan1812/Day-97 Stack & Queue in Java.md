---
title: "Day-97 Stack & Queue in Java"
link: https://dev.to/tamilselvan1812/day-97-stack-queue-in-java-1mab
author: Tamilselvan K
publish_date: 2025-09-23 05:10:23
saved_date: 2026-01-17 15:09:04
tags: #webdev #programming #java
---


#### **1\. Stack (LIFO – Last In, First Out)**

-   A Stack follows the principle of Last In, First Out (LIFO).
-   Think of a stack of plates: the last plate placed on top is the first one to be removed.

**Common Methods in Stack:**

1.  push() – add an element
2.  pop() – remove top element
3.  peek() – see top element without removing
4.  isEmpty() – check if stack is empty

**Example Code (Stack Demo):**  

```
import java.util.Stack;

public class StackDemo {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();

        stack.push(10);
        stack.push(20);
        stack.push(30);

        System.out.println("Top element: " + stack.peek()); // 30
        System.out.println("Removed: " + stack.pop()); // 30
        System.out.println("Is stack empty? " + stack.isEmpty());
    }
}
```

#### **2\. Queue (FIFO – First In, First Out)**

-   A Queue follows the principle of First In, First Out (FIFO).
-   Think of a ticket counter queue: the first person in line is the first to be served.

**Common Methods in Queue:**

1.  offer() – add element
2.  poll() – remove front element
3.  peek() – see front element
4.  isEmpty() – check if queue is empty

**Example Code (Queue Demo):**  

```
import java.util.LinkedList;
import java.util.Queue;

public class QueueDemo {
    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedList<>();

        queue.offer(10);
        queue.offer(20);
        queue.offer(30);

        System.out.println("Front element: " + queue.peek()); // 10
        System.out.println("Removed: " + queue.poll()); // 10
        System.out.println("Is queue empty? " + queue.isEmpty());
    }
}
```

#### Conclusion

-   Stack is best when you need reverse order processing (Undo operations, DFS, expression evaluation).
-   Queue is best when you need sequential order processing (Task scheduling, BFS, request handling).