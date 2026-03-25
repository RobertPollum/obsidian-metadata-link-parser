---
title: "Day-102,103 Connecting Spring Boot with PostgreSQL Database"
link: https://dev.to/tamilselvan1812/day-102103-connecting-spring-boot-with-postgresql-database-3nkm
author: Tamilselvan K
publish_date: 2025-10-01 02:47:00
saved_date: 2026-01-17 15:09:03
tags: #webdev #programming #java #springboot
---


## 1\. Add Dependencies for PostgreSQL and JPA

In pom.xml, add the following dependencies. If you use Spring Initializr, you can directly select Spring Data JPA, PostgreSQL Driver, and Spring Web.  

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

## 2\. Configure Database Connection in application.properties

Provide database connection details in the application.properties file.  

```
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=postgres
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

Replace mydb, postgres, and yourpassword with your actual PostgreSQL database name, username, and password.

## 3\. Create an Entity Class

Entities in JPA represent tables in the database. Below is a simple Student entity.  

```
package com.payilagam.DB_connection.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Student {

    @Id
    private int id;
    private String name;
    private int age;
    private int marks;

    public Student() {}

    public Student(int id, String name, int age, int marks) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.marks = marks;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
}
```

## 4\. Create a Repository Interface

Spring Data JPA provides CRUD operations by extending jpaRepository.  

```
package com.payilagam.DB_connection.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.payilagam.DB_connection.entity.Student;

public interface StudentRepo extends JpaRepository<Student, Integer> {
}
```

## 5\. Insert Data Automatically Using a Controller

In this example, instead of exposing REST APIs, we will insert data automatically at startup using @PostConstruct.  

```
package com.payilagam.DB_connection.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.payilagam.DB_connection.entity.Student;
import com.payilagam.DB_connection.repository.StudentRepo;

import jakarta.annotation.PostConstruct;

@Component
public class StudentController {

    @Autowired
    private StudentRepo studentRepo;

    @PostConstruct
    public void display() {
        Student s = new Student(1, "Tamil", 30, 95);
        studentRepo.save(s);
        System.out.println("Student saved into PostgreSQL database.");
    }
}
```

When the Spring Boot application starts, the display() method executes automatically, creates a Student object, and saves it into the PostgreSQL database.

## 6\. Run and Verify

1.  Start PostgreSQL and ensure the database exists.
2.  Run the Spring Boot application.
3.  Check the console logs. Hibernate will generate an SQL insert statement similar to the one below:

```
insert into student (age, marks, name, id) values (30, 95, 'Tamil', 1)
```

4.Verify in PostgreSQL using a query:  

```
select * from student;
```

You should see the inserted student record.

## Conclusion

1.  Add dependencies for PostgreSQL and JPA
2.  Configure database connection in application.properties
3.  Create an entity class
4.  Create a repository interface
5.  Insert data automatically using @PostConstruct in a controller