---
title: Day-96 Inversion of control(IOC) and Dependency Injection in Spring
link: https://dev.to/tamilselvan1812/day-96-inversion-of-controlioc-and-dependency-injection-in-spring-34g
author: Tamilselvan K
publish_date: 2025-09-20 07:07:47
saved_date: 2026-01-17 15:09:04
tags: #webdev #programming #java #springboot
---


## What is Inversion of Control (IoC)?

Inversion of Control is a design principle where the control of object creation and dependency management is transferred from the application code to a container or framework.

In Spring, this container is called the IoC Container, which comes in two forms:

-   BeanFactory (basic)
-   ApplicationContext (advanced, with additional features)

## What is Dependency Injection (DI)?

Dependency Injection is one way of implementing IoC.

Instead of objects creating their own dependencies, the Spring container injects the required dependencies into them.

This makes the code:

-   Loosely Coupled → Easier to maintain and extend.
-   Testable → Since dependencies can be mocked or swapped easily.

## Types of Dependency Injection in Spring

Spring provides three main types of DI:

### Constructor Injection

Dependencies are provided through a class constructor. Best for mandatory dependencies.

### Setter Injection

Dependencies are set through setter methods. Useful for optional dependencies.

### Field Injection

Dependencies are injected directly into class fields using annotations like @Autowired. Convenient, but less preferred in large applications.

## Benefits of Using DI

-   Reduces boilerplate code for object creation.
-   Promotes loose coupling.
-   Simplifies unit testing with mock dependencies.
-   Improves maintainability and readability.