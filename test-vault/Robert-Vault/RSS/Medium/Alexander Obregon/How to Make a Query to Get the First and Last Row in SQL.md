---
title: How to Make a Query to Get the First and Last Row in SQL
link: "https://medium.com/@AlexanderObregon/how-to-make-a-query-to-get-the-first-and-last-row-in-sql-2fa51f0fe083?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-09 17:18:46"
saved_date: "2026-01-17 15:09:42"
image: "https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png)

![](https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png)

[Image Source](https://commons.wikimedia.org/wiki/File:Sql_data_base_with_logo.png)

Retrieving boundary rows from a table comes up in real work all the time. You may need the very first row ever inserted, the latest status row for each user, or the earliest order recorded in a day. SQL engines provide two main tools for this kind of query. One tool is sorting with a limit on how many rows come back. You also have the ROW\_NUMBER window function, which marks rows in an ordered sequence so you can filter for the ones you care about. These two tools follow predictable rules that stay stable across current database engines, with only small changes in exact syntax from vendor to vendor.

_I publish free articles like this daily, and I have a_ [_SQL section on Substack_](https://alexanderobregon.substack.com/s/sql) _where you’ll find my whole series._ [_My Substack_](https://alexanderobregon.substack.com/) _also includes weekly recaps if you’d like to keep up with everything I’m publishing._

### Boundary Rows From a Table

Queries that fetch the very first or very last row in a table show up in real systems constantly. Common needs include pulling the earliest row ever inserted, getting the latest status record for a process table, or selecting the first event recorded on a particular day. All of those cases follow the same idea. Data is ordered by a column that represents time or sequence, then the result is cut down so that only the leading row in that order remains. Current SQL engines give that behavior through ORDER BY combined with different limit syntaxes such as LIMIT, TOP, or FETCH FIRST, with minor variations between vendors.

#### Earliest Row With ORDER BY

To get the earliest row from a table, queries rely on ordering in ascending order on the column that carries time or sequence information. That column can be a timestamp, a date, or an identity column that grows as rows are inserted. After the rows are ordered, the query limits the output to one row, so only the row at the start of the ordered result survives.

In PostgreSQL or MySQL, a query for the earliest order time usually looks like this:

SELECT order\_id,  
       customer\_id,  
       order\_timestamp,  
       total\_amount  
FROM orders  
ORDER BY order\_timestamp ASC  
LIMIT 1;

This query asks the engine to scan the orders table, sort rows by order\_timestamp from the smallest value upward, then return only the first row found in that sorted order. When no index supports that sort, the database can perform a full scan and sort. When an index on order\_timestamp is present, many engines can read the index entries from low to high and stop as soon as the first row is located, which avoids sorting the entire table in memory.

SQL Server offers similar behavior through the TOP clause, and a comparable query there can look like this:

SELECT TOP (1)  
       order\_id,  
       customer\_id,  
       order\_date,  
       total\_amount  
FROM dbo.Orders  
ORDER BY order\_date ASC;

That statement returns a single row with the smallest order\_date value from dbo.Orders. If the clustered index is on order\_date, or there is a nonclustered index whose leading column is order\_date, the storage layout already lines up with the sort order, so the engine can reach the first row with minimal extra work.

Standard SQL syntax includes FETCH FIRST for limiting rows, used by engines such as DB2, Oracle, and PostgreSQL:

SELECT order\_id,  
       customer\_id,  
       order\_timestamp,  
       total\_amount  
FROM orders  
ORDER BY order\_timestamp ASC  
FETCH FIRST 1 ROW ONLY;

This version expresses the same intention as LIMIT 1. Rows are sorted from oldest to newest by order\_timestamp, then the database returns just the first row.

Sometimes tables do not carry explicit timestamps, and an identity column such as order\_id stands in as an insertion sequence. When that column increases as records are created, the earliest row can be read by ordering on the identity column and limiting to a single result:

SELECT TOP (1)  
       order\_id,  
       customer\_id,  
       created\_at  
FROM dbo.EventLog  
ORDER BY order\_id ASC;

That query assumes that lower order\_id values correspond to earlier inserts, which is how identity columns are defined in SQL Server and auto increment columns in MySQL and MariaDB. When gaps exist in the sequence, the lowest value still belongs to the first inserted row that remains in the table.

#### Last Row With ORDER BY Plus Limit

Getting the most recent row from a table mirrors the logic used for the earliest row, but with descending order on the sort column. Instead of placing the oldest value at the top, the engine orders rows from highest timestamp or identity value down to the lowest, then trims the result to one row.

In PostgreSQL or MySQL, a query for the latest order can look like this:

SELECT order\_id,  
       customer\_id,  
       order\_timestamp,  
       total\_amount  
FROM orders  
ORDER BY order\_timestamp DESC  
LIMIT 1;

This statement returns a single row whose order\_timestamp is greater than or equal to all others. An index on order\_timestamp helps here as well. When the index is in ascending order, some engines still can satisfy a descending request by scanning the index from the end backward. Others build a temporary structure sorted in descending order, but the logical result stays the same as long as the sort order is defined.

In SQL Server, the equivalent query uses TOP with descending order:

SELECT TOP (1)  
       order\_id,  
       customer\_id,  
       order\_date,  
       total\_amount  
FROM dbo.Orders  
ORDER BY order\_date DESC;

Only the row with the largest order\_date comes back. If several rows share exactly the same latest timestamp, the database is free to return any one of them, because ORDER BY only specifies sort priority, not which row breaks ties. To make the result stable for tied values, an extra expression can be added, such as the column that uniquely identifies the row.

A tie breaking example looks like this:

SELECT TOP (1)  
       order\_id,  
       customer\_id,  
       order\_date,  
       total\_amount  
FROM dbo.Orders  
ORDER BY order\_date DESC,  
         order\_id DESC;

Now rows are ordered by order\_date first, then by order\_id within equal dates. That order means the row with the latest order\_date and the highest order\_id in that date group always wins. This rule keeps the result consistent when several rows share the same boundary timestamp.

Aggregate queries can return the maximum or minimum value in a column without returning a full row. Take a query such as:

SELECT MAX(order\_timestamp) AS latest\_order\_timestamp  
FROM orders;

That returns a single scalar value that tells you the boundary timestamp. To retrieve the complete row that holds that maximum or minimum value, the scalar result must be related back to the base table, either through a join on the boundary value or through a window function that links row data and aggregate values in one statement.

### Per Group Boundary Rows With ROW\_NUMBER

Queries that need one row per logical group show up in real databases all the time. Typical cases include grabbing the first order per customer, the most recent reading per device, or the latest status row per ticket. A group here is any set of rows that share a common value such as customer id, account id, or ticket id. Window functions in SQL were added to handle exactly this kind of requirement in a single pass through the data, and ROW\_NUMBER sits at the center of many solutions for boundary rows.

ROW\_NUMBER assigns a running index inside each group after the database orders rows based on columns you pick. With the right ordering, the row that carries index 1 becomes either the earliest or latest row in that group, and a filter on that index trims the result to the boundary row for every group. This logic works in SQL Server, PostgreSQL, MySQL 8 and later, Oracle, and major cloud warehouses such as BigQuery and Snowflake.

#### How ROW\_NUMBER Works In SQL

ROW\_NUMBER is a window function that returns an integer starting at 1 for the first row in a window and increasing by 1 for each following row. Windows are defined with an OVER clause that can include PARTITION BY and ORDER BY. PARTITION BY slices the result into groups with matching values, and ORDER BY sets a sequence inside each of those groups. The numbering restarts at 1 for every partition.

A basic example in SQL Server or PostgreSQL that ranks orders per customer looks like this:

SELECT  customer\_id,  
        order\_id,  
        order\_timestamp,  
        total\_amount,  
        ROW\_NUMBER() OVER (  
            PARTITION BY customer\_id  
            ORDER BY order\_timestamp ASC  
        ) AS order\_index  
FROM    orders;

This query reads rows from orders, splits them into partitions by customer\_id, then orders rows in each partition from the earliest order\_timestamp to the latest. The first order for a customer gets order\_index = 1, the second order gets 2, and so on. The numbering is local to each customer, so different customers have their own row with order\_index = 1.

Window functions take part in a defined logical order inside the query. They are evaluated after FROM, WHERE, and GROUP BY, but before a final ORDER BY in the outer query runs. That sequence means filters in the WHERE clause and joins already took effect before ROW\_NUMBER runs, so the function only sees rows that survived earlier steps. It also means a later filter in an outer query can safely reference the ROW\_NUMBER output. Window functions can use several partitioning and sorting expressions at the same time. A query could partition by both customer\_id and order\_year, then order by order\_timestamp inside that combined group. That construct still restarts numbering for every partition, only now the partition corresponds to a customer in a given year instead of a customer across all time.

#### Earliest Row Per Group With ROW\_NUMBER

To get the earliest row per group, the window definition orders rows in ascending order on a time or sequence column, and the outer query keeps only rows with ROW\_NUMBER equal to 1. That combination yields exactly one earliest row for every group that appears in the table.

One common form in SQL Server, PostgreSQL, or MySQL 8 and later looks like this:

WITH ranked\_orders AS (  
    SELECT  customer\_id,  
            order\_id,  
            order\_timestamp,  
            total\_amount,  
            ROW\_NUMBER() OVER (  
                PARTITION BY customer\_id  
                ORDER BY order\_timestamp ASC, order\_id ASC  
            ) AS order\_index  
    FROM    orders  
)  
SELECT  customer\_id,  
        order\_id,  
        order\_timestamp,  
        total\_amount  
FROM    ranked\_orders  
WHERE   order\_index = 1;

The common table expression named ranked\_orders computes ROW\_NUMBER for every order grouped by customer\_id. Ordering by order\_timestamp in ascending order places the earliest order for that customer first. The extra order\_id column in the ordering acts as a tiebreaker so that when two rows share the same timestamp, the row with the smaller order\_id consistently receives order\_index = 1. The outer query then filters to rows where order\_index equals 1, which yields the earliest order row per customer.

Database engines can process this query in various internal ways, but the logical effect stays consistent. Many optimizers take advantage of an index on (customer\_id, order\_timestamp, order\_id) to walk through rows in an order that already matches the window definition. That plan lowers the amount of sorting work needed, particularly for larger tables, while still producing the same rows.

Similarly, the idea applies when groups are defined by some other column such as account\_id or device\_id. The following PostgreSQL query returns the first reading per device from a sensor table:

WITH ranked\_readings AS (  
    SELECT  device\_id,  
            reading\_id,  
            reading\_time,  
            reading\_value,  
            ROW\_NUMBER() OVER (  
                PARTITION BY device\_id  
                ORDER BY reading\_time ASC, reading\_id ASC  
            ) AS reading\_index  
    FROM    sensor\_readings  
)  
SELECT  device\_id,  
        reading\_id,  
        reading\_time,  
        reading\_value  
FROM    ranked\_readings  
WHERE   reading\_index = 1;

Only the earliest reading per device appears in the final result set, even if a device has thousands of readings inside the table.

Some engines provide alternative ways to express earliest row per group, such as correlated subqueries or lateral joins. PostgreSQL can write a per customer earliest order query like this:

SELECT  c.customer\_id,  
        o.order\_id,  
        o.order\_timestamp,  
        o.total\_amount  
FROM    customers AS c  
CROSS JOIN LATERAL (  
    SELECT  order\_id,  
            order\_timestamp,  
            total\_amount  
    FROM    orders AS o  
    WHERE   o.customer\_id = c.customer\_id  
    ORDER BY order\_timestamp ASC, order\_id ASC  
    LIMIT 1  
) AS o;

The lateral join runs the inner query once for every row from customers. That inner query filters by customer\_id, orders each customer’s orders from earliest to latest, then keeps only the top row. The end result matches the ROW\_NUMBER version, although the surface syntax is different.

#### Latest Row Per Group With ROW\_NUMBER

Latest row per group queries follow the same structure as earliest row per group, but the order direction changes. Instead of ascending order on the time or sequence column, descending order is used so that the freshest row appears first inside every partition. A filter on ROW\_NUMBER = 1 then returns those boundary rows.

Let’s look at a statement that returns the most recent order per customer in engines such as SQL Server, PostgreSQL, and MySQL 8 and later:

WITH ranked\_orders AS (  
    SELECT  customer\_id,  
            order\_id,  
            order\_timestamp,  
            total\_amount,  
            ROW\_NUMBER() OVER (  
                PARTITION BY customer\_id  
                ORDER BY order\_timestamp DESC, order\_id DESC  
            ) AS order\_index  
    FROM    orders  
)  
SELECT  customer\_id,  
        order\_id,  
        order\_timestamp,  
        total\_amount  
FROM    ranked\_orders  
WHERE   order\_index = 1;

Ordering by order\_timestamp in descending order makes the most recent order for each customer land at row number 1 inside its partition. The tiebreaker on order\_id in descending order selects the latest identifier within equal timestamps, which gives consistent results when several orders share the same boundary time. This style works for many tables that store state history. A status tracking table might hold multiple entries for each support ticket with a changed\_at timestamp and a status value. To grab the current status per ticket, the query can partition by ticket\_id, order by changed\_at descending, and filter to ROW\_NUMBER = 1. A sensor history table can similarly use device\_id and reading\_time to keep only the last reading per device.

Other window functions can also expose boundary values per group. FIRST\_VALUE and LAST\_VALUE can read a column value from the start or end of a window without discarding rows, which is helpful when every row needs access to both the current value and the group boundary value. For single row per group results, ROW\_NUMBER remains a common choice because a simple filter on its output reduces the set to exactly one row per partition.

### Conclusion

Boundary row queries work because SQL has two reliable building blocks for ordering and selection. ORDER BY paired with row limiting returns one earliest or latest row from a full table by sorting on a time or sequence column, then trimming the result set to a single row. Grouped boundary queries use ROW\_NUMBER with PARTITION BY to restart numbering per group and ORDER BY inside the window to decide which row becomes number 1, then a filter keeps only those rows. Tie breakers added to the sort order keep results consistent when multiple rows share the same timestamp.

1.  [_PostgreSQL ORDER BY Query Documentation_](https://www.postgresql.org/docs/current/queries-order.html)
2.  [_PostgreSQL Window Functions Guide_](https://www.postgresql.org/docs/current/functions-window.html)
3.  [_SQL Server ROW\_NUMBER Function Reference_](https://learn.microsoft.com/sql/t-sql/functions/row-number-transact-sql)
4.  [_SQL Server TOP Clause Reference_](https://learn.microsoft.com/sql/t-sql/queries/top-transact-sql)
5.  [_MySQL 8 Window Functions Reference_](https://dev.mysql.com/doc/refman/8.0/en/window-functions.html)
6.  [_Oracle Analytic Functions Reference_](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Analytic-Functions.html)

![](https://cdn-images-1.medium.com/max/306/0*AsLbWGGj9lamLrpP.png)

[Image Source](https://freesvg.org/mono-sql)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=2fa51f0fe083)