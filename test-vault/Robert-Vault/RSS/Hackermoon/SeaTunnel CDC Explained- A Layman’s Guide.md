---
title: "SeaTunnel CDC Explained: A Layman’s Guide"
link: https://hackernoon.com/seatunnel-cdc-explained-a-laymans-guide?source=rss
author: William Guo
publish_date: 2026-01-17 12:00:11
saved_date: 2026-01-17 15:09:59
image: https://hackernoon.com/https://cdn.hackernoon.com/images/1xYF9Q2MEDQRYXBY7nlDViaH7ED3-jt03fqq.png
tags: #apache-seatunnel #open-source #big #seatunnel-cdc #data-science #seatunnel-cdc-explained #what-is-seatunnel-cdc #hackernoon-top-story
---

![image](https://hackernoon.com/https://cdn.hackernoon.com/images/1xYF9Q2MEDQRYXBY7nlDViaH7ED3-jt03fqq.png)

Based on recent practices in production environments using SeaTunnel CDC (Change Data Capture) to synchronize scenarios such as Oracle, MySQL, and SQL Server, and combined with feedback from a wide range of users, I have written this article to help you understand the process by which SeaTunnel implements CDC. The content mainly covers the three stages of CDC: Snapshot, Backfill, and Incremental.

## The Three Stages of CDC

The overall CDC data reading process can be broken down into three major stages:

1.  Snapshot (Full Load)
2.  Backfill
3.  Incremental

## 1\. Snapshot Stage

The meaning of the Snapshot stage is very intuitive: take a snapshot of the current database table data and perform a full table scan via JDBC.

\\ Taking MySQL as an example, the current binlog position is recorded during the snapshot:

```javascript
SHOW MASTER STATUS;
```

| File | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set | |----|----|----|----|----| | binlog.000011 | 1001373553 | | | |

\\ SeaTunnel records the File and Position as the **low watermark**.

> Note: This is not just executed once, because SeaTunnel has implemented its own split cutting logic to accelerate snapshots.

\\

### MySQL Snapshot Splitting Mechanism (Split)

Assuming the global parallelism is 10:

-   SeaTunnel will first analyze all tables and their primary key/unique key ranges and select an appropriate splitting column.
    
-   It splits based on the maximum and minimum values of this column, with a default of `snapshot.split.size = 8096`.
    
-   Large tables may be cut into hundreds of Splits, which are allocated to 10 parallel channels by the enumerator according to the order of subtask requests (tending toward a balanced distribution overall).
    
    ![](https://cdn.hackernoon.com/images/1xYF9Q2MEDQRYXBY7nlDViaH7ED3-2026-01-17T17:00:06.724Z-oypgu1eitmt1pze3d3vuwtlf)
    

**Table-level sequential processing (schematic):**

```javascript
// Processing sequence:
// 1. Table1 -> Generate [Table1-Split0, Table1-Split1, Table1-Split2]
// 2. Table2 -> Generate [Table2-Split0, Table2-Split1]
// 3. Table3 -> Generate [Table3-Split0, Table3-Split1, Table3-Split2, Table3-Split3]
```

\\ **Split-level parallel allocation:**

```javascript
// Allocation to different subtasks:
// Subtask 0: [Table1-Split0, Table2-Split1, Table3-Split2]
// Subtask 1: [Table1-Split1, Table3-Split0, Table3-Split3]
// Subtask 2: [Table1-Split2, Table2-Split0, Table3-Split1]
```

\\ Each Split is actually a query with a range condition, for example:

```javascript
SELECT * FROM user_orders WHERE order_id >= 1 AND order_id < 10001;
```

\\ **Crucial:** Each Split separately records its own low watermark/high watermark.

\\ **Practical Advice:** Do not make the `split_size` too small; having too many Splits is not necessarily faster, and the scheduling and memory overhead will be very large.

## 2\. Backfill Stage

**Why is Backfill needed?** Imagine you are performing a full snapshot of a table that is being frequently written to. When you read the 100th row, the data in the 1st row may have already been modified. If you only read the snapshot, the data you hold when you finish reading is actually "inconsistent" (part is old, part is new).

\\ **The role of Backfill is to compensate for the "data changes that occurred during the snapshot" so that the data is eventually consistent.**

\\ The behavior of this stage mainly depends on the configuration of the `exactly_once` parameter.

### 2.1 Simple Mode (`exactly_once = false`)

This is the default mode; the logic is relatively simple and direct, and it does not require memory caching:

![](https://cdn.hackernoon.com/images/1xYF9Q2MEDQRYXBY7nlDViaH7ED3-2026-01-17T17:00:06.728Z-tsi8marssfn7n437ud8z9ewp)

-   **Direct Snapshot Emission:** Reads snapshot data and sends it directly downstream without entering a cache.
-   **Direct Log Emission:** Reads Binlog at the same time and sends it directly downstream.
-   **Eventual Consistency:** Although there will be duplicates in the middle (old A sent first, then new B), as long as the downstream supports idempotent writes (like MySQL's `REPLACE INTO`), the final result is consistent.

### 2.2 Exactly-Once Mode (`exactly_once = true`)

This is the most impressive part of SeaTunnel CDC, and it is the secret to guaranteeing that data is "never lost, never repeated." It introduces a **memory buffer (Buffer)** for deduplication.

\\ **Simple Explanation:** Imagine the teacher asks you to count how many people are in the class right now (Snapshot stage). However, the students in the class are very mischievous; while you are counting, people are running in and out (data changes). If you just count with your head down, the result will definitely be inaccurate when you finish.

![](https://cdn.hackernoon.com/images/1xYF9Q2MEDQRYXBY7nlDViaH7ED3-2026-01-17T17:00:06.733Z-b2660t3twfzd4i76y2d3qtw7)

SeaTunnel does it like this:

1.  **Take a Photo First (Snapshot):** Count the number of people in the class first and record it in a small notebook (memory buffer); don't tell the principal (downstream) yet.
2.  **Watch the Surveillance (Backfill):** Retrieve the surveillance video (Binlog log) for the period you were counting.
3.  **Correct the Records (Merge):**

-   If the surveillance shows someone just came in, but you didn't count them -> add them.
-   If the surveillance shows someone just ran out, but you counted them in -> cross them out.
-   If the surveillance shows someone changed their clothes -> change the record to the new clothes.

1.  **Submit Homework (Send):** After correction, the small notebook in your hand is a perfectly accurate list; now hand it to the principal.

\\ **Summary for Beginners:** `exactly_once = true` means **"hold it in and don't send it until it's clearly verified."**

-   **Benefit:** The data received downstream is absolutely clean, without duplicates or disorder.
-   **Cost:** Because it must be "held in," it needs to consume some memory to store the data. If the table is particularly large, memory might be insufficient.

### 2.3 Two Key Questions and Answers

**Q1: Why is** `case READ: throw Exception` written in the code? Why aren't there READ events during the Backfill stage?

-   The `READ` event is defined by SeaTunnel itself, specifically to represent "stock data read from the snapshot."
-   The Backfill stage reads the database's Binlog. Binlog only records "additions, deletions, and modifications" (INSERT/UPDATE/DELETE) and never records "someone queried a piece of data."
-   Therefore, if you read a `READ` event during the Backfill stage, it means the code logic is confused.

\\ **Q2: If it's placed in memory, can the memory hold it? Will it OOM?**

-   **It's not putting the whole table into memory:** SeaTunnel processes by **splits**.
-   **Splits are small:** A default split has only 8096 rows of data.
-   **Throw away after use:** After processing a split, send it, clear the memory, and process the next one.
-   **Memory occupancy formula ≈ : Parallelism × Split size × Single row data size.**

### 2.4 Key Detail: Watermark Alignment Between Multiple Splits

This is a very hidden but extremely important issue. If not handled well, **it will lead to data being either lost or repeated.**

\\ **Plain Language Explanation:** The Fast/Slow Runner Problem: Imagine two students (Split A and Split B) are copying homework (Backfill data).

-   Student A (fast): Copied to page 100 and finished at 10:00.
-   Student B (slow): Copied to page 200 and just finished at 10:05.

\\ Now, the teacher (Incremental task) needs to continue teaching a new lesson (reading Binlog) from where they finished copying. Where should the teacher start?

\\

-   If starting from page 200: Student B is connected, but the content Student A missed between pages 100 and 200 (what happened between 10:00 and 10:05) is completely lost.
-   If starting from page 100: Student A is connected, but Student B will complain: "Teacher, I already copied the content from page 100 to 200!" This leads to repetition.

\\ SeaTunnel's Solution: Start from the earliest and cover your ears for what you've already heard: SeaTunnel adopts a **"Minimum Watermark Starting Point + Dynamic Filtering"** strategy:

1.  **Determine the Start (care for the slow one):** The teacher decides to start from **page 100 (the minimum watermark among all splits)**.
2.  **Dynamic Filtering (don't listen to what's been heard):** While the teacher is lecturing (reading Binlog), they hold a list: `{ A: 100, B: 200 }`.

-   When the teacher reaches page 150:
-   Look at the list; is it for A? 150 > 100, A hasn't heard it, record it (send).
-   Look at the list; is it for B? 150 < 200, B already copied it, skip it directly (discard).

1.  **Full Speed Mode (everyone has finished hearing):** When the teacher reaches page 201 and finds everyone has already heard it, they no longer need the list.
    
    ![快慢跑问题英文](https://cdn.hackernoon.com/images/1xYF9Q2MEDQRYXBY7nlDViaH7ED3-2026-01-17T17:00:06.734Z-p3ueusgvhzgvxwil6jf84zvx)
    

**Summary in one sentence:** With `exactly_once`: The incremental stage strictly filters according to the combination of "starting offset + split range + high watermark."

\\ Without`exactly_once`: The incremental stage becomes a simple "sequential consumption from a certain starting offset."

## 3\. Incremental Stage

After the Backfill (for `exactly_once = true`) or Snapshot stage ends, it enters the pure incremental stage:

-   **MySQL:** Based on binlog.
-   **Oracle:** Based on redo/logminer.
-   **SQL Server:** Based on transaction log/LSN.
-   **PostgreSQL:** Based on WAL.

\\ SeaTunnel's behavior in the incremental stage is very close to native Debezium:

-   Consumes logs in offset order.
-   Constructs events like INSERT/UPDATE/DELETE for each change.
-   When `exactly_once = true`, the offset and split status are included in the checkpoint to achieve "exactly-once" semantics after failure recovery.

## 4\. Summary

The core design philosophy of SeaTunnel CDC is to find the perfect balance between **"Fast" (parallel snapshots)** and **"Stable" (data consistency).**

\\ Let's review the key points of the entire process:

-   **Slicing (Split) is the foundation of parallel acceleration:** Cutting large tables into small pieces to let multiple threads work at the same time.
-   **Snapshot is responsible for moving stock:** Utilizing slices to read historical data in parallel.
-   **Backfill is responsible for sewing the gaps:** This is the most critical step. It compensates for changes during the snapshot and eliminates duplicates using memory merging algorithms to achieve Exactly-Once.
-   **Incremental is responsible for real-time synchronization:** Seamlessly connecting to the Backfill stage and continuously consuming database logs.

\\ Understanding this trilogy of **"Snapshot -> Backfill -> Incremental"** and the coordinating role of **"Watermarks"** within it is to truly master the essence of SeaTunnel CDC.

\\