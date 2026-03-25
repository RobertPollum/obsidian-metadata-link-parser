---
title: "Day-89,90 Understanding Set in Java"
link: https://dev.to/tamilselvan1812/day-89-understanding-set-in-java-5hfd
author: Tamilselvan K
publish_date: 2025-09-02 04:27:38
saved_date: 2026-01-17 15:09:04
tags: #webdev #programming #java #sql
---


In Java, the Set interface is part of the Collections Framework and is used to store a collection of unique elements. Unlike List, a Set does not allow duplicate values and does not support accessing elements by index.

There are three commonly used implementations of Set:

-   **HashSet** → Stores unique elements, does not guarantee order.
-   **LinkedHashSet** → Stores unique elements while maintaining insertion order.
-   **TreeSet** → Stores unique elements in sorted order (ascending by default).

## Comparison Table

Feature

HashSet

LinkedHashSet

TreeSet

**Order**

No order

Maintains insertion order

Maintains sorted order

**Duplicates**

Not allowed

Not allowed

Not allowed

**Null values**

Allows 1 null

Allows 1 null

Not allowed

**Underlying DS**

Hash table (HashMap)

Hash table + Linked list

Red-Black Tree

**Performance**

O(1) add/search/remove

O(1) add/search/remove

O(log n) add/search/remove

**Use case**

When order is not needed

When insertion order needed

When sorted data is needed

## Example

Let’s look at a practical example using HashSet, LinkedHashSet, and TreeSet.  

```
package collectiondemo;

import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.TreeSet;

public class SetDemo {
    public static void main(String[] args) {

        // HashSet -> unique elements, no order
        HashSet h1 = new HashSet();
        h1.add(5);
        h1.add(2);
        h1.add(6);
        h1.add(2);
        h1.add("hii");
        System.out.println("HashSet: " + h1);

        // LinkedHashSet -> unique elements, insertion order
        LinkedHashSet h2 = new LinkedHashSet();
        h2.add(5);
        h2.add(2);
        h2.add(6);
        h2.add(2);
        h2.add("hii");
        System.out.println("LinkedHashSet: " + h2);

        // TreeSet -> unique elements, sorted order
        TreeSet h3 = new TreeSet();
        h3.add(5);
        h3.add(2);
        h3.add(6);
        h3.add(2);
        System.out.println("TreeSet: " + h3);

        // Iteration using for-each
        System.out.println("\nIterating HashSet using for-each:");
        for (Object obj : h1) {
            System.out.println(obj);
        }

        // Iteration using Iterator
        System.out.println("\nIterating HashSet using Iterator:");
        Iterator it = h1.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }
    }
}
```

## Output Example

```
HashSet: [2, 5, 6, hii]
LinkedHashSet: [5, 2, 6, hii]
TreeSet: [2, 5, 6]

Iterating HashSet using for-each:
2
5
6
hii

Iterating HashSet using Iterator:
2
5
6
hii
```

## Key Takeaways

-   Use HashSet when you only need unique elements and don’t care about order.
-   Use LinkedHashSet when you need unique elements and want to preserve insertion order.
-   Use TreeSet when you need unique elements in sorted order.
-   Iteration can be done using for-each or Iterator.