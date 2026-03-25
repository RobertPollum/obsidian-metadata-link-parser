---
title: Day-91 Map in Java
link: https://dev.to/tamilselvan1812/day-91-map-in-java-2ke6
author: Tamilselvan K
publish_date: 2025-09-05 23:03:49
saved_date: 2026-01-17 15:09:04
tags: #webdev #programming #java
---


In Java, the Map interface is one of the most powerful data structures that allows us to store data in key-value pairs. Unlike a List or Set, a Map does not allow duplicate keys, but values can be duplicated.

## Key Points About Map

-   A Map stores data in key-value pairs.
-   Keys are unique(no duplicates allowed).
-   Values can be duplicated.
-   Each key maps to exactly one value.
-   Commonly used implementations:
    
    -   **HashMap**
    -   **LinkedHashMap**
    -   **TreeMap**

## Comparison of HashMap, LinkedHashMap, and TreeMap

Feature

HashMap

LinkedHashMap

TreeMap

**Order**

No order

Insertion order

Sorted order (by keys)

**Null Key**

Allowed (only one)

Allowed (only one)

Not allowed

**Null Values**

Allowed

Allowed

Allowed

**Speed**

Fast `O(1)`

Fast `O(1)`

Slower `O(log n)`

## Commonly Used Map Methods

-   `put(key, value)` → Adds or updates a key-value pair
-   `get(key)` → Returns the value for a given key
-   `remove(key)` → Removes a key and its value
-   `containsKey(key)` → Checks if the map contains a specific key
-   `containsValue(value)` → Checks if a specific value exists
-   `keySet()` → Returns a set of all keys
-   `values()` → Returns a collection of all values
-   `entrySet()` → Returns a set of key-value pairs (Map.Entry objects)

\-

## Example : MapDemo

```
package collectiondemo;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.TreeMap;

public class MapDemo {

    public static void main(String[] args) {

        // HashMap: Stores items in key-value pairs (No specific order)
        HashMap<Integer, String> h1 = new HashMap<>();
        h1.put(10, "Tamil");
        h1.put(20, "Selvan");
        h1.put(30, "kts");
        System.out.println("HashMap: " + h1);

        // LinkedHashMap: Maintains insertion order
        LinkedHashMap<Integer, String> h2 = new LinkedHashMap<>();
        h2.put(2, "Selvan");
        h2.put(1, "Tamil");
        h2.put(3, "kts");
        System.out.println("LinkedHashMap: " + h2);

        // TreeMap: Stores keys in sorted order
        TreeMap<Integer, String> h3 = new TreeMap<>();
        h3.put(2, "Selvan");
        h3.put(3, "kts");
        h3.put(1, "Tamil");
        System.out.println("TreeMap: " + h3);

        // Demonstrating methods
        System.out.println("Get key 1: " + h3.get(1)); 

        h3.remove(1);
        System.out.println("After remove(1): " + h3);

        System.out.println("Contains key 1? " + h3.containsKey(1));
        System.out.println("Contains value 'kts'? " + h3.containsValue("kts"));

        System.out.println("Keys: " + h3.keySet());
        System.out.println("Values: " + h3.values());
        System.out.println("Entries: " + h3.entrySet());

        // Iterating through TreeMap
        for (Integer i : h3.keySet()) {
            System.out.println("Key: " + i + " Value: " + h3.get(i));
        }
    }
}
```

## Output

```
HashMap: {20=Selvan, 10=Tamil, 30=kts}
LinkedHashMap: {2=Selvan, 1=Tamil, 3=kts}
TreeMap: {1=Tamil, 2=Selvan, 3=kts}
Get key 1: Tamil
After remove(1): {2=Selvan, 3=kts}
Contains key 1? false
Contains value 'kts'? true
Keys: [2, 3]
Values: [Selvan, kts]
Entries: [2=Selvan, 3=kts]
Key: 2 Value: Selvan
Key: 3 Value: kts
```

## Conclusion

-   **HashMap** is best when you just need fast access without caring about order.
-   **LinkedHashMap** is useful when you want to preserve the **insertion order**.
-   **TreeMap** is helpful when you need keys in **sorted order**.