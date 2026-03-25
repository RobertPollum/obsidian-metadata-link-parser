---
title: "Day-104 Understanding JPA, Hibernate, and JpaRepository in Spring Boot"
link: https://dev.to/tamilselvan1812/day-104-understanding-jpa-hibernate-and-jparepository-in-spring-boot-1l04
author: Tamilselvan K
publish_date: 2025-10-10 23:27:55
saved_date: 2026-01-17 15:09:03
tags: #webdev #programming #java #springboot
---


When working with databases in Java-based applications, managing data persistence efficiently is important. Spring Boot simplifies this process using JPA and Hibernate, making CRUD operations seamless with minimal boilerplate code.

### What is JPA?

JPA (Java Persistence API) is a standard specification provided by Java for Object Relational Mapping (ORM).  
It allows developers to map Java objects to database tables and perform database operations using Java code instead of SQL queries.

#### Key Features of JPA:

-   Defines how Java objects are stored and retrieved from relational databases.
-   Provides annotations to map classes and fields to database tables and columns.
-   Simplifies data access through high-level APIs.
-   Works with different ORM providers like Hibernate, EclipseLink, etc.

#### Common JPA Annotations:

-   `@Entity` – Marks a class as a JPA entity.
-   `@Id` – Defines the primary key.
-   `@Table` – Maps the class to a specific database table.
-   `@Column` – Maps a field to a table column.

### What is Hibernate?

Hibernate is the implementation of the JPA specification.  
While JPA defines the rules, Hibernate provides the actual functionality to interact with the database.

#### Hibernate Features:

-   Implements all JPA features.
-   Provides advanced ORM capabilities like:
    
    -   **Caching** – Improves performance by reducing database hits.
    -   **Lazy Loading** – Loads related data only when required.
-   Allows writing queries using:
    
    -   **JPQL (Java Persistence Query Language)**
    -   **Native SQL**

### JpaRepository in Spring Boot

Spring Data JPA provides the JpaRepository interface, which extends CrudRepository and PagingAndSortingRepository.  
It comes with built-in methods for CRUD and query operations — no need to write SQL manually.

### Common JpaRepository Built-in Methods

Method

Description

`save()`

Insert or update an entity.

`findById()`

Find an entity by its primary key.

`findAll()`

Retrieve all entities.

`deleteById()`

Delete an entity using its primary key.

`delete()`

Delete a specific entity.

`count()`

Get total number of records.

`existsById()`

Check if an entity exists by its primary key.

### Custom Query Methods

Apart from built-in methods, Spring Data JPA also allows custom query methods by following a simple naming convention.

#### Examples:

```
List<Student> findByName(String name);
List<Student> findByAge(int age);
List<Student> findByNameAndMarks(String name, int marks);
```

Spring Boot automatically generates the SQL queries for these methods based on their names.