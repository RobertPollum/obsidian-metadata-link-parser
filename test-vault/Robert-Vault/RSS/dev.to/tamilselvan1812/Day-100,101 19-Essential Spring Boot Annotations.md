---
title: "Day-100,101 19-Essential Spring Boot Annotations"
link: https://dev.to/tamilselvan1812/day-101-19-essential-spring-boot-annotations-232h
author: Tamilselvan K
publish_date: 2025-09-24 03:18:58
saved_date: 2026-01-17 15:09:03
tags: #webdev #programming #java #springboot
---


## 1.@SpringBootApplication

-   Marks the main class of a Spring Boot application.
-   Enables auto-configuration,component scanning, and configuration setup.

```
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}
```

## 2.@RestController

-   Marks a class as a REST API controller.
-   Combines @Controller + @ResponseBody, so responses are returned as JSON.

```
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello Spring Boot!";
    }
}
```

## 3.@Controller

-   Marks a class as a Spring MVC controller.
-   Used for serving web pages or templates (like Thymeleaf).

```
@Controller
public class PageController {
    @GetMapping("/home")
    public String homePage() {
        return "home"; // returns home.html
    }
}
```

## 4.@GetMapping

-   Maps HTTP GET requests to a controller method.

```
@GetMapping("/users")
public List<User> getUsers() { ... }
```

## 5.@PostMapping

-   Maps HTTP POST requests to a method.

```
@PostMapping("/users")
public User createUser(@RequestBody User user) { ... }
```

## 6.@PutMapping

-   Maps HTTP PUT requests to a method for updating resources.

```
@PutMapping("/users/{id}")
public User updateUser(@PathVariable Long id, @RequestBody User user) { ... }
```

## 7.@DeleteMapping

-   Maps HTTP DELETE requests to a method for deleting resources.

```
@DeleteMapping("/users/{id}")
public void deleteUser(@PathVariable Long id) { ... }
```

## 8.@Autowired

-   Automatically injects Spring-managed beans.

```
@Autowired
private UserService userService;
```

## 9.@Service

-   Marks a class as a service layer bean containing business logic.

```
@Service
public class UserService { ... }
```

## 10.@Repository

-   Marks a class as a data access layer (DAO).
-   Supports exception translation for database operations.

```
@Repository
public interface UserRepository extends JpaRepository<User, Long> { }
```

## 11.@Component

-   Generic annotation for any Spring-managed bean.

```
@Component
public class Utility { ... }
```

## 12.@Entity

-   Marks a class as a JPA entity mapping to a database table.

```
@Entity
public class User { ... }
```

## 13.@ Id

-   Marks the primary key in a JPA entity.

```
@Id
private Long id;
```

## 14.@GeneratedValue

-   Configures **automatic generation** of primary key values (e.g., auto-increment).

```
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

## 15.@Configuration

-   Marks a class as a source of bean definitions.

```
@Configuration
public class AppConfig { ... }
```

## 16.@ Bean

-   Declares a bean inside a configuration class; managed by Spring.

```
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

## 17.@RequestBody

-   Binds HTTP request body (JSON) to a Java object.

```
@PostMapping("/users")
public User createUser(@RequestBody User user) { ... }
```

## 18.@PathVariable

-   Binds a URI path variable to a method parameter.

```
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) { ... }
```

## 19.@RequestParam

-   Binds query parameters or form data to a method parameter.

```
@GetMapping("/users")
public List<User> getUsers(@RequestParam int page, @RequestParam int size) { ... }
```

### Conclusion

For freshers, mastering these 19 annotations is enough to handle most Spring Boot interview questions. They cover:

-   Application setup
-   REST controllers
-   Dependency injection
-   Service & repository layers
-   JPA / database mapping
-   Request handling