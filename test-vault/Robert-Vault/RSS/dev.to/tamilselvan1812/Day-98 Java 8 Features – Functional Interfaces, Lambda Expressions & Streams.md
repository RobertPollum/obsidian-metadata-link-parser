---
title: "Day-98 Java 8 Features – Functional Interfaces, Lambda Expressions & Streams"
link: https://dev.to/tamilselvan1812/day-98-java-8-features-functional-interfaces-lambda-expressions-streams-1b3
author: Tamilselvan K
publish_date: 2025-09-23 05:15:34
saved_date: 2026-01-17 15:09:03
tags: #webdev #programming #java
---


Java 8 introduced functional programming concepts to the language, making code more concise, readable, and powerful. Three of the most important features are:

-   **Functional Interfaces**
-   **Lambda Expressions**
-   **Streams API**

## Functional Interfaces

A functional interface is an interface with a single abstract method (SAM).

-   They enable lambda expressions and method references.
-   Common functional interfaces:
    
    -   Predicate → test a condition
    -   Consumer → consume input
    -   Function → transform input
    -   Supplier → provide values

### Example Code – Functional Interface

```
public class FunctionalInterfaceDemo {

    public static void main(String[] args) {

        Predicate<Integer> isEven = n -> n % 2 == 0;

        System.out.println(isEven.test(10));        // true
        System.out.println(isEven.test(15));        // false
    }
}

```

## Lambda Expressions

A lambda expression is a short way to represent an anonymous function.

-   It reduces boilerplate code.
-   Syntax:

```
  (parameters) -> expression  
  (parameters) -> { statements }  
```

### Example Code – Lambda Expression

```
public class LambdaDemo {
    public static void main(String[] args) {
           List<String> names = new ArrayList<>();
           names.add("Alice");
           names.add("Bob");
           names.add("Charlie");

           System.out.println(names); 


      names.forEach(name -> System.out.println(name.toUpperCase()));   // Iterate using forEach and lambda
       }
}
```

## Streams API

A Stream is a sequence of elements supporting functional-style operations.

-   Used for filtering, mapping, reducing, and collecting data.
-   Works with collections easily.

### Common Methods:

1.  filter() – filter elements by condition
2.  map() – transform elements
3.  forEach() – iterate elements
4.  collect() – gather results into List/Set/Map
5.  reduce() – combine into a single result

### Example Code – Streams

```
public class StreamsDemo {
    public static void main(String[] args) {

        List<Integer> numbers = new ArrayList<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
        numbers.add(4);
        numbers.add(5);
        numbers.add(6);


        List<Integer> result = numbers.stream()
                                      .filter(n -> n % 2 == 0)           // Filter even numbers
                                      .map(n -> n * 2)                   //  double them
                                      .collect(Collectors.toList());     // collect to a new list

        System.out.println(result); 
    }
}

```

### Conclusion

-   Functional Interfaces allow concise coding patterns.
-   Lambdas replace anonymous classes with cleaner syntax.
-   Streams bring the power of functional programming to data processing.