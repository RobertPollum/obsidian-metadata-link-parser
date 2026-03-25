---
title: "Day-105 Building a Full-Stack Student Management System with React, Spring Boot, and PostgreSQL"
link: https://dev.to/tamilselvan1812/building-a-full-stack-student-management-system-with-react-spring-boot-and-postgresql-4igb
author: Tamilselvan K
publish_date: 2025-10-17 07:25:27
saved_date: 2026-01-17 15:09:03
tags: #webdev #programming #java #react
---


Managing student records manually can be time-consuming — from adding new students to updating and deleting their details. This project demonstrates how to build a Student Management Web Application using React for the frontend, Spring Boot for the backend, and PostgreSQL as the database.

The application performs complete CRUD operations (Create, Read, Update, Delete) with persistent data storage.

## Tech Stack Used

Frontend : React (JavaScript)  
Backend : Spring Boot (Java)  
Database : PostgreSQL  
API Communication: REST API (Axios)

## Project Goal

To create a simple, user-friendly web app that allows:

-   Adding new student details
-   Viewing all students in a table
-   Editing student details
-   Deleting student by name
-   Storing data permanently in PostgreSQL

## Project Structure

```
StudentManagement/
│── demo/         → Spring Boot backend
│── my-app/       → React frontend
```

## Backend – Spring Boot + PostgreSQL

The backend handles all data operations — fetching, adding, updating, and deleting student records.

### 1\. Student Model

```
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int age;
    private int marks;
}
```

### 2\. Repository Layer

```
public interface StudentRepository extends JpaRepository<Student, Long> {

    Student findByName(String name);
}
```

### 3\. Controller Layer

```
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentRepository repo;

    @GetMapping("/")
    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    @PostMapping("/students")
    public Student addStudent(@RequestBody Student student) {
        return repo.save(student);
    }

    @PutMapping("/students/byName/{name}")
    public Student updateStudent(@PathVariable String name, @RequestBody Student updated) {
        Student s = repo.findByName(name);
        s.setName(updated.getName());
        s.setAge(updated.getAge());
        s.setMarks(updated.getMarks());
        return repo.save(s);
    }

    @DeleteMapping("/students/byName/{name}")
    public String deleteStudent(@PathVariable String name) {
        repo.deleteByName(name);
        return "Deleted successfully";
    }
}
```

### 4\. Database Configuration

In `application.properties`:  

```
spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.hibernate.show-sql=true
spring.datasource.url=jdbc:postgresql://localhost:5432/studentdb
spring.datasource.username=postgres
spring.datasource.password=your password
```

## Frontend – React

The React frontend provides a clean interface for managing students and interacts with the backend using Axios.

### 1\. StudentTable Component

Displays the list of students and allows editing or deleting.  

```
function StudentTable() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  const fetchStudents = () => {
    axios.get("http://localhost:8080/")
      .then((res) => setStudents(res.data))
      .catch((err) => console.log("Error fetching students", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteByName = (name) => {
    axios.delete(`http://localhost:8080/students/byName/${name}`)
      .then(() => fetchStudents())
      .catch((err) => console.log("Error deleting student", err));
  };

  const handleEditByName = (student) => {

    navigate("/addStudent", { state: { student } });                   // Navigate to StudentForm and pass student object as state
  };

  return (
    <div>
      <h2>Student List</h2>
      <button type="button" onClick={() => navigate("/addStudent")}>Add Student</button>

      <table border="1">
        <thead>
          <tr>

            <th>Name</th>
             <th>Age</th>
            <th>Marks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>

              <td>{s.name}</td>
              <td>{s.age}</td>
              <td>{s.marks}</td>
              <td>
                <button type="button" onClick={() => handleDeleteByName(s.name)}>Delete</button>
                <button type="button" onClick={() => handleEditByName(s)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2\. StudentForm Component

Used to add or edit a student record.  

```
function StudentForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [marks, setMarks] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [oldName, setOldName] = useState(null);

  useEffect(() => {
    if (location.state?.student) {
      const { student } = location.state;
      setName(student.name);
      setAge(student.age);
      setMarks(student.marks);
      setOldName(student.name);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { name, age: parseInt(age), marks: parseInt(marks) };

    if (oldName)
      axios.put(`http://localhost:8080/students/byName/${oldName}`, data)
        .then(() => navigate("/"));
    else
      axios.post("http://localhost:8080/students", data)
        .then(() => navigate("/"));
  };

  return (
    <div>
      <h2>{oldName ? "Edit Student" : "Add Student"}</h2>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" required />
        <input value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Marks" required />
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate("/")}>Cancel</button>
      </form>
    </div>
  );
}
```

## How Frontend and Backend Communicate

1.  React uses Axios to send HTTP requests (GET, POST, PUT, DELETE).
2.  Spring Boot exposes REST endpoints for each CRUD operation.
3.  JPA handles all database operations with PostgreSQL.

Example endpoints:

-   POST /students → Adds a new student
-   GET / → Fetches all students
-   PUT /students/byName/{name} → Updates student details
-   DELETE /students/byName/{name} → Deletes student

## What I Learned

-   Connecting React with Spring Boot using Axios
-   Integrating PostgreSQL with JPA
-   Implementing complete CRUD operations
-   Understanding how REST APIs link frontend and backend
-   Designing a clean and responsive React interface