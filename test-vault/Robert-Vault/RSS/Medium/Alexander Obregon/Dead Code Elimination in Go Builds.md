---
title: Dead Code Elimination in Go Builds
link: "https://medium.com/@AlexanderObregon/dead-code-elimination-in-go-builds-119555fad1fd?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-11 17:02:15"
saved_date: "2026-01-17 15:09:42"
image: "https://cdn-images-1.medium.com/max/756/1*8o4XZbC9qXVWSH7UMjvL-w.png"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/756/1*8o4XZbC9qXVWSH7UMjvL-w.png)

![](https://cdn-images-1.medium.com/max/756/1*8o4XZbC9qXVWSH7UMjvL-w.png)

[Image Source](https://go.dev/)

Code that never runs in Go builds still takes space in binaries and can make long term maintenance harder. Go toolchain runs several stages that track reachability of functions and variables, remove work that has no effect on results, and trim data no part of the executable ever reads. Dead code elimination starts at the compiler, which turns Go source into an intermediate form and prunes unreachable instructions inside functions. Later, the linker walks through reachable symbols for the whole build and drops functions that can never run. The Go ecosystem also includes a separate deadcode tool that scans source with a call graph and reports functions that no entry point can reach.

_I publish free articles like this daily, and this was originally posted on my_ [_Golang section on Substack_](https://alexanderobregon.substack.com/s/golang) _where you’ll find my whole series._ [_My Substack_](https://alexanderobregon.substack.com/) _also includes weekly recaps if you’d like to keep up with everything I’m publishing._

### Compiler View Of Dead Code In Go

The compiler sits at the front of the toolchain and handles dead code at a very local level. Source files get parsed, type checked, and lowered into an internal graph based form before any machine code appears. That internal form lets the compiler track how values move through branches and loops, so it can erase work that never has any effect on results. Unreachable branches, unused temporary values, and stores to variables that never get read fall away during these passes, long before the linker looks at whole functions.

Work happens package by package. Each package turns into object files that contain machine code for its functions and metadata for later stages. Dead instructions and dead basic blocks disappear inside that package as SSA passes run, but functions that never get called still exist at this point. Reachability across packages belongs to the linker. Compiler view focuses on what happens inside a single function body and how values inside that function either feed later computation or stop mattering.

#### Dead Code In Go SSA Form

Go compiler transforms each function into SSA form before any serious optimization runs. SSA form gives every intermediate value a single assignment point and organizes control flow into basic blocks. Within that structure, an optimizer can answer questions about reachability and variable use in a precise way. Branches guarded by constant conditions, computations that feed values nobody reads, and stores whose results never reach observable behavior all become candidates for removal.

Source like this is common in real projects:

package main  
  
func flagExample(x int) int {  
    const debug = false  
  
    if debug {  
        x = x + 10  
    }  
  
    return x  
}

Compiler evaluates the debug constant long before final code generation. SSA form for flagExample still contains a conditional block at first, but after constant folding the branch whose condition can never be true becomes unreachable. That basic block and the x = x + 10 computation drop out of the function. Generated machine code behaves as if the if debug line never existed, yet the source stays readable for humans who want a toggle.

Dead code in SSA also comes from values that have no live uses. Arithmetic on temporary variables that never influence a store, a branch, or a function call can vanish completely. A more arithmetic heavy example looks like this:

package main  
  
func compute(a, b int) int {  
    t1 := a \* 4  
    t2 := b \* 5  
    t3 := t1 + t2  
    t4 := t3 \* 2   // never used  
    return t3  
}

SSA graph for compute assigns each t value once and tracks where it flows. Value t4 never feeds any later operation or return, so the multiplication by 2 serves no purpose. Dead code elimination in the SSA pass removes that multiply and the t4 name entirely. Fewer instructions reach the assembler, but the observable behavior of compute stays the same.

Control flow graphs gain from SSA based removal as well. When a branch condition leads into a block that performs only dead work, that whole branch can collapse. Loops whose bodies simplify to no side effects can vanish or shrink to minimal checks. Debug output and logging that is guarded behind constant flags turn into dead basic blocks once those flags resolve at compile time. This keeps source flexible while avoiding extra work in release builds. Compiler pieces that handle SSA live inside the cmd/compile/internal/ssa subtree of the Go repository. That area holds passes for constant propagation, common subexpression elimination, dead code elimination, and related work. Each pass runs over a function, reads the SSA graph, and either removes nodes or rewrites them into cheaper forms. Dead code removal runs after other simplifications so that any new opportunities exposed by earlier steps can be taken advantage of in the same optimization pipeline.

#### Liveness Analysis For Go Variables

Liveness analysis answers a direct question at every point in a function body. For each instruction, some set of variables must still hold meaningful values, because those values can be read later along some execution path. Anything not in that set at that point is dead with respect to future computation. That idea drives both code removal and stack map construction for garbage collection.

Stack variables in Go carry a bit more structure than local scalars in many older toolchains. Go runtime needs to know which stack slots contain pointers at each garbage collection safe point, so the collector can trace objects correctly. Compiler runs liveness over the SSA graph and produces information that maps safe points back to live pointer sets. This data gets stored in function metadata and read by the garbage collector whenever it pauses goroutines.

Code with unused locals gives a good sense of how liveness and dead code intersect:

package main  
  
func worker(n int) int {  
    value := n \* 2  
    tmp := n \* 3  
  
    if n > 10 {  
        return value  
    }  
  
    return value + 1  
}

Variable tmp never influences control flow or the return value. Liveness analysis sees that tmp is never read after its assignment, so its storage does not contribute to any live set. SSA based dead code elimination then removes the n \* 3 computation and the write into tmp. Generated code no longer allocates stack space for that variable, and the garbage collector does not need to track it.

Garbage collection safe points interact tightly with liveness. Every function compiled with stack maps has designated points where the runtime can stop execution and start tracing. At those positions, liveness data tells the collector which stack slots and registers currently hold pointers. Any local variable that lost all future uses before that step disappears from those maps. Values that only hold integers or floating numbers also drop from GC data, because they cannot refer to heap objects.

Compiler liveness system connects with escape analysis as well. Escape analysis decides whether a value can stay on the stack or must move to the heap. Both analyses work over graphs that describe variable use across the function and its callees. Flags such as -gcflags=-m ask the compiler to print escape diagnostics, and go tool compile -live prints liveness details. Those outputs help advanced developers study how their code interacts with stack maps and garbage collection, though regular day to day workflow does not require reading them.

### Linker Reachability In Go Builds

The linker step looks at the whole Go build rather than a single package. Object files from all compiled packages arrive with symbols for functions, globals, and runtime support code. Linker cmd/link then walks from known entry roots and decides which symbols stay and which ones drop out as dead code. That global view lets it remove entire functions that no caller can reach, even if those functions were fully compiled earlier. Reachability work happens on symbols, not on source text. Each function body is represented as a text symbol in the link graph, and the linker maintains a list of these symbols in structures such as Textp. A pass named deadcode visits roots like main.main, init functions, and required runtime pieces, then traces calls and references to mark further symbols as reachable. Anything in Textp that never gets marked can be removed from the final binary.

#### Dead Code Elimination During Linking

Go linker treats certain symbols as starting points. These include main.main, all package init functions, and symbols that the runtime marks as mandatory. References from those roots to other functions and globals form edges in a reachability graph. Indirect calls, interface method calls, and calls recorded through relocation entries in object files all feed that graph. When traversal finishes, only marked symbols are kept.

Some symbols in Textp have zero length. Compiler can emit such entries when an SSA optimization pass removes an entire function body. Those symbols still exist so that references in metadata do not break, yet they have no machine code attached. Linker deadcode pass skips these zero sized symbols because there is nothing left to place in the binary for them.

Take this small example with unused helpers:

package main  
  
import "fmt"  
  
func main() {  
    fmt.Println(square(3))  
}  
  
func square(n int) int {  
    return n \* n  
}  
  
func unusedHelper(n int) int {  
    return n \* 10  
}

Reachability graph for this code starts at main.main. That function calls square, so both main.main and square stay marked. Function unusedHelper never receives an edge in the graph, so the linker can safely drop its text symbol. Source still holds the helper, but the compiled binary has no machine code for it.

Reflection changes reachability rules. Go reflection package can call methods by names known only at runtime, which means the linker cannot always see explicit call edges. Methods reflect.Value.Method, reflect.Type.Method, and reflect.Type.MethodByName support that behavior. To avoid dropping methods that might be used through reflection, linker logic marks exported methods of reachable types whenever reflective entry points appear in the call graph.

This small reflective example helps show the effect visually:

package main  
  
import (  
    "fmt"  
    "reflect"  
)  
  
type worker struct{}  
  
func (worker) Run() {  
    fmt.Println("running")  
}  
  
func main() {  
    w := worker{}  
    v := reflect.ValueOf(w)  
    m := v.MethodByName("Run")  
    m.Call(nil)  
}

Code above calls Run only through MethodByName. Direct call edges from main to worker.Run never appear in the object files. Linker sees use of reflective method lookup and treats exported methods on reachable types more conservatively. worker.Run stays in the binary even though the call is not visible as a regular static reference.

Go issue tracker has open discussions about flags and GODEBUG settings that could tighten method trimming while still keeping reflection support in place. Those proposals sit in front of the same reachability machinery already described. Build tags live alongside this system as well. Code wrapped in a //go:build expression that does not match current build constraints never reaches compilation, so linker never sees it at all. Dead code elimination during linking only applies to functions that passed through compilation and then turned out to be unreachable from any entry root.

#### Data Removed From Go Binaries

Dead code elimination cuts machine code for unreachable functions. Size of the text segment shrinks, and the binary does less work at runtime. Go toolchain also offers options that strip metadata such as symbol tables and debug information without touching reachability decisions.

Linker flag -w omits the DWARF symbol table. DWARF records map machine addresses back to file names, line numbers, and variable locations. Debuggers and profilers rely on that information to present human readable stacks and breakpoints. Linker flag -s omits the symbol table and debug information, and it implies -w unless -w=0 is set. Binary size drops, but tooling that relies on symbols and line info has less to work with.

Command line usage sits inside go build through -ldflags:

go build ./cmd/server  
  
go build -ldflags="-s -w" -o server\_stripped ./cmd/server

First command produces a normal binary with full debug metadata. Second command sends -s -w to the linker and writes output into server\_stripped. Reachability result is identical in both builds. Any function that the linker marked reachable remains in each binary, and any function that dead code elimination removed is absent from both. Only metadata surrounding that code changes.

Some developers also call platform strip tools on top of -s -w. External strippers can remove more low level metadata that Go linker left in place. That can lead to even smaller binaries on certain platforms, yet can interfere with Go specific tools that expect certain sections to exist. Dead code elimination still happens in the same way before these extra passes run.

#### Deadcode Tool For Unreachable Functions

Go team maintains a deadcode command in golang.org/x/tools that looks for unreachable functions at the source level. While linker works on object files and symbols, deadcode operates on Go packages and module graphs. It loads code, performs Rapid Type Analysis, builds a call graph starting from main, and marks all functions reachable through direct calls, interface method calls, and certain reflective edges. Any function that never becomes reachable appears in the output report.

Installation uses go install and places the binary in the module aware GOBIN or GOPATH/bin directory.

go install golang.org/x/tools/cmd/deadcode@latest

Invocation usually points deadcode at a module root or package pattern.

deadcode ./...

Tool runs analysis and prints names of functions that no entry point can reach, grouped by package path. That output gives developers candidates for removal or further inspection.

Let’s look at a short example with extra helper code to help understand how deadcode sees the same unreachable function that the linker would discard:

package main  
  
import "fmt"  
  
func main() {  
    fmt.Println(greet("world"))  
}  
  
func greet(name string) string {  
    return "hello " + name  
}  
  
func neverUsed() {  
    fmt.Println("unused")  
}

Compiler builds all three functions into object files. Linker then starts from main.main, follows the call to greet, and never reaches neverUsed. Dead code elimination removes neverUsed from the final executable. deadcode sees the same call structure at the source level and reports neverUsed as unreachable.

Rapid Type Analysis lets deadcode track interface use and some reflective calls more closely than a naive static pass. Methods reached through interface values still count as live when calls pass through interface variables. Certain reflective entry points become edges in the call graph as well, which avoids false positives in cases where reflection is part of normal control flow. Tool output still needs human review, because functions in a shared library may be unused in one module yet required in another that reuses the same codebase.

The editor support through gopls already flags unused private functions inside a single package, yet stops at that boundary. deadcode spans packages, dependencies, and the full entry graph rooted at main. That wider view makes deadcode a useful companion to linker reachability and compiler level diagnostics when searching for dead code in large Go codebases.

### Conclusion

Go dead code elimination comes from a chain of concrete steps rather than a single feature. Compiler SSA passes trim unreachable branches, unused values, and stack slots, while liveness and escape analysis prepare stack maps that let the garbage collector see exactly which pointers matter at each safe point. Linker reachability then walks symbols from entry points and erases whole functions that have no callers, with reflection and build tags influencing what remains. The Deadcode tool adds a source level view on top of that, so developers can see which parts of the codebase no longer matter even before the linker strips them from the final binary.

1.  [_Go Compiler Documentation_](https://pkg.go.dev/cmd/compile)
2.  [_Go Linker Documentation_](https://pkg.go.dev/cmd/link)
3.  [_Go Garbage Collector Guide_](https://go.dev/doc/gc-guide)
4.  [_Go Reflect Package Documentation_](https://pkg.go.dev/reflect)
5.  [_Deadcode Tool Reference_](https://pkg.go.dev/golang.org/x/tools/cmd/deadcode)
6.  [_Go SSA Backend Article_](https://go.dev/src/cmd/compile/internal/ssa/README)

**Thanks for reading! If you found this helpful, highlighting, clapping, or leaving a comment really helps me out.**

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=119555fad1fd)