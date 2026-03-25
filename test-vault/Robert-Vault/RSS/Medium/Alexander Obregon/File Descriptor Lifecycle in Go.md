---
title: File Descriptor Lifecycle in Go
link: "https://medium.com/@AlexanderObregon/file-descriptor-lifecycle-in-go-25a9bbc33bfc?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-15 15:23:46"
saved_date: "2026-01-17 15:09:42"
image: "https://cdn-images-1.medium.com/max/756/1*8o4XZbC9qXVWSH7UMjvL-w.png"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/756/1*8o4XZbC9qXVWSH7UMjvL-w.png)

![](https://cdn-images-1.medium.com/max/756/1*8o4XZbC9qXVWSH7UMjvL-w.png)

[Image Source](https://go.dev/)

Behavior of file descriptors in Go affects how every open file, socket, or pipe moves through a process, from the moment the operating system assigns a small integer handle until that handle returns to the pool or stops working because the process has reached its limit. Go ties these descriptors to objects in the standard library so they can be opened, tracked across I/O, reused by the kernel after close, and handled predictably when resources grow scarce.

_I publish free articles like this daily, and this was originally posted on my_ [_Golang section on Substack_](https://alexanderobregon.substack.com/s/golang) _where you’ll find my whole series._ [_My Substack_](https://alexanderobregon.substack.com/) _also includes weekly recaps if you’d like to keep up with everything I’m publishing._

### How File Descriptors Work in Go

Every running Go process on a Unix style system sits on top of the same file descriptor model that the operating system gives to C programs and shells. The runtime does not replace that model. It builds on it by wrapping the integer descriptors in Go values and adding safety checks, but the core idea still starts with small integers that index into a table owned by the process.

#### Process View of Descriptors

On Unix and similar systems, a file descriptor is a non-negative integer that points into a table the kernel keeps for each process. Entry 5 in that table, for example, refers to a single open file description in the kernel that holds the current offset, access mode, status flags, and a reference to the backing object such as a regular file, socket, pipe, or device node. Several descriptors in one process, or in different processes, can refer to the same open file description when duplication or inheritance happens, but each descriptor value itself is just a small integer.

When a Go binary starts from a shell, the operating system already has three descriptors assigned. Descriptor 0 is standard input, descriptor 1 is standard output, and descriptor 2 is standard error. The Go runtime keeps these values and exposes them as os.Stdin, os.Stdout, and os.Stderr, which wrap the existing descriptors instead of opening new ones. That means a Go command that prints to standard output is writing through descriptor 1 that the shell provided.

Every process has limits on how many descriptors it can hold at once. Typical Unix systems use a per-process limit such as RLIMIT\_NOFILE, with a soft value that normal calls respect and a hard value that only privileged operations can raise. There is also usually a global kernel bound on the total number of open file descriptions across the whole machine. When a limit is reached and the Go runtime asks the kernel to open a new file or socket, the kernel reports an error such as EMFILE for “too many open files” in that process or ENFILE when the system wide pool is exhausted. Go turns those into error values so normal code can see what happened.

Descriptor numbers are reused after close. When a Go process closes descriptor 7, that integer index becomes available for a later open or socket call. The kernel does not keep counts for specific numbers, it only needs a free entry in the current process table. That reuse means code that reads a descriptor value through File.Fd and stores the integer away has to be careful about lifetime. After the original \*os.File is closed and collected, the same descriptor number can belong to an unrelated file or socket.

Let’s look at a quick Go example to help connect these ideas:

package main  
  
import (  
 "fmt"  
 "os"  
)  
  
func main() {  
 fmt.Println("stdin fd:", os.Stdin.Fd())  
 fmt.Println("stdout fd:", os.Stdout.Fd())  
 fmt.Println("stderr fd:", os.Stderr.Fd())  
  
 f, err := os.Open("data.txt")  
 if err != nil {  
  panic(err)  
 }  
 defer f.Close()  
  
 fmt.Println("data.txt fd:", f.Fd())  
}

This program prints the descriptor numbers for the three standard streams, then opens data.txt and prints the descriptor used for that file in the same process. Running it a few times usually reveals that the first three lines stay at 0, 1, and 2, while the descriptor for data.txt takes the lowest free value at that moment.

Descriptor reuse can be seen with a small variation:

package main  
  
import (  
 "fmt"  
 "os"  
)  
  
func main() {  
 f1, err := os.Open("first.log")  
 if err != nil {  
  panic(err)  
 }  
 fmt.Println("first.log fd:", f1.Fd())  
 f1.Close()  
  
 f2, err := os.Open("second.log")  
 if err != nil {  
  panic(err)  
 }  
 fmt.Println("second.log fd:", f2.Fd())  
 f2.Close()  
}

On many systems the two descriptor values printed end up the same, because the kernel reuses the slot freed by closing first.log when second.log opens immediately afterward. That behavior reflects the descriptor table layout and helps explain why stale integer file descriptors cause bugs when their lifetimes are not tied to the Go values that own them.

#### Go Wrapper Structures for Files

Go code normally works with \*os.File values instead of raw descriptor integers. That File type wraps the descriptor and holds extra fields that track the name, I/O state, and internal poll structures that link the descriptor to the runtime. Standard constructors such as os.Open, os.Create, and os.OpenFile call into the operating system with open or an equivalent function, then build a File around the returned descriptor.

This small example shows that pattern from the surface level:

package main  
  
import (  
 "fmt"  
 "os"  
)  
  
func main() {  
 f, err := os.Create("log.txt")  
 if err != nil {  
  panic(err)  
 }  
 defer f.Close()  
  
 \_, err = f.WriteString("hello from Go\\n")  
 if err != nil {  
  panic(err)  
 }  
  
 info, err := f.Stat()  
 if err != nil {  
  panic(err)  
 }  
 fmt.Println("name:", info.Name())  
 fmt.Println("size:", info.Size())  
}

This asks the runtime to create a file, writes a short line, then calls Stat on the File. The descriptor value sits inside the File struct and travels through all those calls without the caller needing to see or manage the integer directly.

Inside the standard library, that File struct owns a field of an internal type usually named something like fd which is based on the internal/poll.FD type. That internal type stores the system descriptor as an integer on Unix or as a handle on Windows, along with status bits, deadline data, locking fields, and bookkeeping that lets the runtime know when I/O is in progress. Networking types in the net package embed the same FD type, so sockets, pipes, and regular files follow a similar pattern for read and write calls.

The os package also provides a path from a raw descriptor to a File. That path is useful when code obtains a descriptor from somewhere other than os.Open. A example is a process that receives an inherited descriptor from a parent or from a file descriptor passing mechanism. The constructor os.NewFile supports that case:

package main  
  
import (  
 "fmt"  
 "os"  
)  
  
func main() {  
 // Pretend fd 3 was handed to this process by its parent.  
 fd := uintptr(3)  
  
 f := os.NewFile(fd, "inherited")  
 if f == nil {  
  fmt.Println("fd was not valid")  
  return  
 }  
 defer f.Close()  
  
 buf := make(\[\]byte, 64)  
 n, err := f.Read(buf)  
 if err != nil {  
  panic(err)  
 }  
 fmt.Printf("read %d bytes: %q\\n", n, buf\[:n\])  
}

This style of code wraps an existing descriptor in a File so that normal Read, Write, and Close calls can apply. The os package does not open a new descriptor in this case. It trusts that the integer refers to a real resource in the current process and attaches the same internal polling and state management as it would for a descriptor it opened itself.

Go exposes the descriptor value back out through the Fd method on File. That method returns a uintptr copy of the descriptor and leaves ownership with the File. Code that calls Fd can pass the integer to system specific functions, pass it into other libraries, or log it for debugging. The File still owns lifecycle duties, so Close on the File should remain the standard way to release the resource. Keeping the File value reachable while the descriptor is in use ensures that finalizers and internal bookkeeping do not close it early.

### Runtime Management of File Descriptors

Runtime behavior around file descriptors in Go centers on how goroutines block on I/O, how the netpoller waits for readiness, and how the runtime tracks state so that close calls, deadlines, and descriptor reuse stay consistent. Network sockets and other pollable descriptors run through the polling machinery, while many regular files go straight through system calls without readiness events, because disk I/O on common platforms usually returns quickly when data is available.

### Netpoller Integration with Descriptors

Go uses an internal netpoller that sits on top of epoll on Linux, kqueue on BSD and macOS, and I/O Completion Ports on Windows. One or more runtime threads call these kernel interfaces and wait there while the kernel tracks which descriptors are ready for read or write operations. When data arrives or space opens up in a socket buffer, the kernel reports that to the poller, and the runtime wakes goroutines that had been waiting.

Descriptors that participate in nonblocking I/O have polling records inside the runtime, usually named pollDesc in the source. Those records remember which kind of event matters for a given descriptor, store deadlines, keep a sequence number to separate old events from new ones, and hold references to goroutines that are asleep on that descriptor. When a goroutine calls Read or Write on a socket and the kernel says the operation would block, the runtime registers interest in the right event and parks the goroutine until the netpoller sees a change.

A short client example gives a simplified view of how a socket ends up under netpoller control:

package main  
  
import (  
 "fmt"  
 "net"  
)  
  
func main() {  
 conn, err := net.Dial("tcp", "example.com:80")  
 if err != nil {  
  panic(err)  
 }  
 defer conn.Close()  
  
 \_, err = conn.Write(\[\]byte("GET / HTTP/1.0\\r\\nHost: example.com\\r\\n\\r\\n"))  
 if err != nil {  
  panic(err)  
 }  
  
 buf := make(\[\]byte, 128)  
 n, err := conn.Read(buf)  
 if err != nil {  
  panic(err)  
 }  
 fmt.Println(string(buf\[:n\]))  
}

This client asks the runtime to connect and then issues a request, and reads can cause the goroutine to sleep while the netpoller waits for response data from the remote host.

Regular files do not always use the same path. On many Unix systems a plain file read returns right away unless the operation hits unusual conditions, so the runtime can call straight into the system without adding that descriptor to the readiness set. The os and net packages hide this split, so code written against Read and Write sees a single I/O model, while the runtime selects either a direct call or netpoller integration based on the type of descriptor.

#### Closing Files plus Reference Tracking

Internal structures that wrap file descriptors in Go carry flags and counters that help the runtime decide when it is safe to call the kernel close function. The internal/poll.FD type holds the raw descriptor, a mutex that guards concurrent access, fields that track whether reads or writes are allowed, and a reference count that tracks active I O operations and close coordination so Close() can return while the real close(2) waits for in flight work to finish.

When code calls Close on a \*os.File or on a net.Conn, control passes down to that internal FD value. The close logic marks the descriptor as closing, cancels waits in the polling layer, and decrements the reference count. At the point where the last reference is gone, the runtime issues the actual close system call and returns that descriptor slot to the operating system. Later calls to Read or Write on the same Go value see an error such as ErrClosed, which signals that the descriptor is no longer valid.

Finalizers sit in the background as a safety net. The os package attaches a finalizer to many File values so that if a file becomes unreachable without an explicit Close, the garbage collector can eventually call an internal close helper and free the descriptor. The exact moment that happens depends on garbage collection cycles and reachability, so explicit Close calls remain the main tool for managing descriptors that count toward process and system limits.

Take this short code fragment shows the life of a shared file handle visually:

f, err := os.Create("shared.log")  
if err != nil {  
 panic(err)  
}  
  
// other goroutines write to f here  
  
err = f.Close()  
if err != nil {  
 panic(err)  
}  
  
\_, err = f.WriteString("after close\\n")  
if err != nil {  
 fmt.Println("expected error:", err)  
}

This fragment shows the sequence where a file is created, used by other goroutines, closed, and then written again, and that last write hits an error because the internal state now marks the descriptor as closed.

#### Handling Descriptor Exhaustion

Descriptor exhaustion connects the Go runtime to operating system limits. Every open file, socket, and pipe for a process consumes one entry in the descriptor table that the kernel keeps for that process, and that table has a fixed capacity. On Unix style systems the capacity is controlled by RLIMIT\_NOFILE, which has a soft value for ordinary code and a hard value that only privileged calls can raise. The kernel also tracks a global cap on all open file descriptions across the machine, such as the fs.file-max setting on Linux.

Go calls such as os.Open, net.Dial, and net.Listen end up in system calls like open, socket, and accept. When the per-process limit is reached, those system calls return EMFILE, which Go reports as an error whose message usually includes the text too many open files. When the system as a whole runs out of file descriptions, calls can fail with ENFILE, which points to pressure across processes rather than a single Go service. Two broad patterns lead to exhaustion in Go code. One is a leak where descriptors are opened and never closed, so the count only grows. The other is a workload that legitimately needs more concurrent descriptors than the current limit allows, such as a server with many active network clients or many open log files. Both patterns result in system calls that try to allocate fresh descriptors and receive EMFILE or ENFILE instead.

A short loop makes a leak very visible:

package main  
  
import (  
 "fmt"  
 "os"  
)  
  
func main() {  
 var files \[\]\*os.File  
  
 for {  
  f, err := os.Open("data.bin")  
  if err != nil {  
   fmt.Println("open error:", err)  
   break  
  }  
  files = append(files, f)  
 }  
}

This small main function keeps opening the same file and holds every \*os.File value in a slice without calling Close, so descriptor use keeps increasing until the kernel returns a failure such as too many open files.

Network servers run into related issues if connections are accepted and left open for long periods without matching Close calls. Limits can be raised through RLIMIT\_NOFILE and system configuration when that fits operational needs, but application code still has to return descriptors to the operating system when work with that resource ends so the process does not gradually run out of descriptors.

### Conclusion

File descriptor behavior in Go comes from a tight link between the kernel’s integer handles and the runtime’s wrappers, schedulers, and limits. The operating system hands out numbers that point into per-process tables, Go wraps those numbers in os.File and net types backed by internal/poll.FD, and the netpoller arranges for goroutines to sleep and wake as I/O becomes possible. Close paths, reference tracking, and finalizers decide when a descriptor really returns to the kernel pool, while operating system limits and error codes such as EMFILE and ENFILE mark the boundaries for how many descriptors a process or a whole machine can hold. Having a clearer view of that life cycle makes it easier to open, use, and release files and sockets in Go without drifting into leaks or surprise failures when limits are reached.

1.  [_Go os Package Documentation_](https://pkg.go.dev/os)
2.  [_Go net Package Documentation_](https://pkg.go.dev/net)
3.  [_Go syscall Package Documentation_](https://pkg.go.dev/syscall)
4.  [_Linux man page open_](https://man7.org/linux/man-pages/man2/open.2.html)
5.  [_Linux man page epoll_](https://man7.org/linux/man-pages/man7/epoll.7.html)

**Thanks for reading! If you found this helpful, highlighting, clapping, or leaving a comment really helps me out.**

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=25a9bbc33bfc)