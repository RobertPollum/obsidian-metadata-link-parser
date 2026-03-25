---
title: "Day-94,95 Understanding Servlets, JSP, Annotations and CORS"
link: https://dev.to/tamilselvan1812/day-9495-understanding-servlets-jsp-annotations-and-cors-2k6j
author: Tamilselvan K
publish_date: 2025-09-18 03:11:57
saved_date: 2026-01-17 15:09:04
tags: #webdev #programming #java #springboot
---


## Servlets: Backend Logic and Request Handling

A Servlet is a Java program that runs on a server and handles HTTP requests and responses. Servlets are part of the Java EE (Jakarta EE) ecosystem and are primarily responsible for backend logic.

-   Definition: A Servlet is a Java class that processes requests and generates responses.
-   Role: Manages business logic and request handling.

## JSP (Java Server Pages): Presentation Layer

JSP is used for the presentation layer of an application.

-   Definition: JSP combines HTML and Java code.
-   Role: Used to display dynamic content (UI part).
-   Difference from Servlets: While Servlets usually handle business logic, JSP focuses on presentation.

### Annotations

-   Java Annotations provide metadata (example: [@override](https://dev.to/override)).
-   Spring Boot Annotations reduce boilerplate code, handle Dependency Injection (DI), configure REST APIs, ORM, security, and more.

## CORS (Cross-Origin Resource Sharing)

CORS is a security feature in browsers that controls cross-origin requests.

-   Same-Origin Policy: By default, browsers block requests from different origins.
-   Cross-Origin Requests: If your React app runs on port 3000 and Spring Boot backend runs on 8080, the browser blocks the request without CORS configuration.
-   Solution: Add @CrossOrigin annotation in your Spring Boot REST controller.
-   Prevents malicious cross-site data access.
-   Allows safe communication between frontend (React) and backend (Spring Boot).

## Example Workflow: React + Spring Boot

1.  React app runs at localhost:3000.
2.  Spring Boot backend runs at localhost:8080.
3.  Without CORS, the browser blocks the request.
4.  Adding @CrossOrigin allows cross-origin communication.