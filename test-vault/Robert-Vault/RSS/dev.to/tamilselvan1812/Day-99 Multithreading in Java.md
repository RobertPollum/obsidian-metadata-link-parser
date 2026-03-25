---
title: Day-99 Multithreading in Java
link: https://dev.to/tamilselvan1812/day-99-multithreading-in-java-iik
author: Tamilselvan K
publish_date: 2025-09-23 05:19:35
saved_date: 2026-01-17 15:09:03
tags: #webdev #programming #java
---


Multithreading is the process of executing multiple threads simultaneously.

-   A thread is the smallest unit of execution.
-   Java provides strong multithreading support via the Thread class and Runnable interface.
-   It helps in better CPU utilization and improved application performance.

## Ways to Create a Thread

There are two main ways to create a thread in Java:

### **a) Extending the Thread Class**

```
class MyThread extends Thread {
    public void run() {
        System.out.println("Thread running using Thread class!");
    }
}

public class ThreadDemo {
    public static void main(String[] args) {
        MyThread t1 = new MyThread();
        t1.start(); // Start the thread
    }
}
```

### **b) Implementing the Runnable Interface**

```
class MyRunnable implements Runnable {
    public void run() {
        System.out.println("Thread running using Runnable interface!");
    }
}

public class RunnableDemo {
    public static void main(String[] args) {
        Thread t1 = new Thread(new MyRunnable());
        t1.start();
    }
}
```

## Thread Lifecycle

A thread passes through these states:

New → Runnable → Running → Waiting → Terminated

-   New: Thread object created but not started.
-   Runnable: Thread is ready to run but waiting for CPU scheduling.
-   Running: Thread is currently executing.
-   Waiting/Timed Waiting: Thread is paused temporarily.
-   Terminated: Thread has finished execution.

## Common Thread Methods

1.  start() → begin thread execution
2.  run() → contains the logic of the thread
3.  sleep(ms) → pause thread for given milliseconds
4.  join() → wait for a thread to finish
5.  isAlive() → check if thread is running

## Synchronization

When multiple threads access a shared resource, race conditions may occur.

-   synchronized keyword ensures that only one thread can access a resource at a time.

### Conclusion

-   Threads allow concurrent execution.
-   Two ways to create threads: Thread class & Runnable interface.
-   Use synchronization to prevent race conditions.
-   Multithreading is widely used in games, web servers, and real-time applications.