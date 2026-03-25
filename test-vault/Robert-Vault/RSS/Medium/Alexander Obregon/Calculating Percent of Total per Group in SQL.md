---
title: Calculating Percent of Total per Group in SQL
link: "https://medium.com/@AlexanderObregon/calculating-percent-of-total-per-group-in-sql-556984499c78?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-17 17:44:56"
saved_date: "2026-01-19 07:03:06"
image: "https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png)

![](https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png)

[Image Source](https://commons.wikimedia.org/wiki/File:Sql_data_base_with_logo.png)

Needing to know the percent of a total comes up all across analytics work. Sales reports need each product’s share of revenue. Monitoring tables need each service’s share of total traffic. Operational dashboards need each status value’s share of all records for a day. SQL handles this with two main tools. One tool sums values for each group. The other divides each row’s value by that group sum. Database systems support this method with window functions or with subqueries, and both stay within SQL standards used in engines like PostgreSQL, SQL Server, MySQL, MariaDB, and Oracle.

_I publish free articles like this daily, this was originally posted on my_ [_SQL section on Substack_](https://alexanderobregon.substack.com/s/sql) _where you’ll find my whole series._ [_My Substack_](https://alexanderobregon.substack.com/) _also includes weekly recaps if you’d like to keep up with everything I’m publishing._

### How Percent of Total Works in Groups

Percent of total rests on a tight link between individual rows and the larger group that those rows belong to. Each row carries a numeric value, such as revenue or count of events. Groups collect related rows under a shared label, such as department, status, product, or region. That percent of total number tells how large one row’s value is in relation to the sum for its group, expressed on a scale from zero to one hundred. SQL does not have a native percent type for this. The database only works with numeric expressions, so a percent is stored as a fraction such as 0.27 or as 27.00 after multiplication by one hundred and optional formatting.

#### Group Totals With Row Values

Every percent of total calculation needs two things side by side. One is the value from the current row. The other is the total for the group that row belongs to. Groups come from any column that makes sense for the question at hand. Departments, product categories, status codes, regions, and customer segments all fall into this area. When the goal is percent of total per department, the query groups by department. When the goal is percent of total per product, the query groups by product.

Aggregation functions turn raw rows into group summaries. SQL offers SUM, COUNT, AVG, MIN, and MAX for this. Percent of total runs through SUM, because the denominator in the fraction is always some kind of total. That total can be a sum of money, a sum of units, or a sum of row counts. The numerator is a row level value such as a single sale amount or a derived count for that row.

Many people start by writing a basic grouped query. Suppose a sales table stores an order\_id, a region, and a numeric amount. Such a query that produces one total for each region looks like this.

SELECT  
    region,  
    SUM(amount) AS region\_total  
FROM sales  
GROUP BY region;

This result has one row per region, with a total amount in the region\_total column. Later, percent of total calculations reuse these totals but bring them back next to individual sales rows. The same idea works with counts instead of sums, which is common when a table tracks events or visits.

SELECT  
    status,  
    COUNT(\*) AS status\_count  
FROM support\_tickets  
GROUP BY status;

That aggregation counts how many tickets fall into each status. Later steps can compare a single ticket or a slice of tickets to these group totals.

Real tables usually carry more columns than those needed for percent of total. Fact tables in analytics systems can hold timestamps, foreign keys, and many descriptive attributes. Queries that focus on percent of total tend to pick one measure column such as amount or duration and one or more grouping columns. Extra columns may still appear in the select list for context, as long as they do not break the GROUP BY rules in that database.

#### Percent Of Total Formula In SQL

At a math level percent of total for one row uses three numbers. The row value stands in the numerator. The group total stands in the denominator. The fraction between them is multiplied by one hundred to express a percent. Written as an expression it looks like this:

row\_value / group\_total\_value \* 100

SQL engines follow their own rules for division and casting when that expression runs. If both numerator and denominator are integers, some engines perform integer division and cut off the fractional part. Queries that need a decimal percent usually cast at least one input to a decimal type, numeric type, or floating type so the fraction comes out as a non integer number.

PostgreSQL, MySQL, SQL Server, MariaDB, and Oracle all have ways to cast values and round output. Most queries that report percents add rounding and some protection against division by zero as well. One typical example for salary share per department looks similar to this next query below, taken in a PostgreSQL style.

SELECT  
    employee\_id,  
    department\_id,  
    salary,  
    SUM(salary) OVER (PARTITION BY department\_id) AS department\_total,  
    ROUND(  
        CAST(salary AS DECIMAL(18, 4))  
        / NULLIF(SUM(salary) OVER (PARTITION BY department\_id), 0)  
        \* 100,  
        2  
    ) AS percent\_of\_department  
FROM employees;

This query keeps both the row salary and the department total in the result, which lets the percent be computed in place. The SUM call inside the OVER clause treats all rows with the same department\_id as a partition and repeats the total for each of them. The NULLIF call turns a zero total into a NULL value so division by zero does not raise an error. The ROUND function then trims the output to two decimal places, which is common for reporting.

Other engines follow similar logic with small differences. SQL Server, MySQL, and MariaDB handle the OVER (PARTITION BY group\_column) structure for windowed SUM calls. Some of them prefer CAST(salary AS DECIMAL(18,2)) or a related expression in the numerator, so that division always uses decimal math. Oracle supports window functions and numeric casting in its own syntax family. Percent of total can also be stored as a fraction instead of multiplying by one hundred. In that case the expression stops at salary / department\_total, and the client code or reporting layer can handle the percent formatting. That choice depends on how the data will be consumed later and how rounding should behave across chained calculations.

#### Common Data Shapes For Percent Of Total

Many data sets carry natural groupings that work well with percent of total. One frequent form is a single table that holds events or transactions, with one column that identifies the measure and another that identifies the group. Sales tables with product\_id and amount fit this idea. Basic queries that prepare totals per product start here:

SELECT  
    product\_id,  
    SUM(amount) AS product\_total  
FROM sales  
GROUP BY product\_id;

That query leaves out the row level detail, which may be fine for a pure summary. When percent of total per sale is needed, later queries bring in both the row amounts and these product totals.

One common form uses a dimension such as country, category, or status. Percent of total becomes handy when there is interest in the share of each country within global revenue, or the share of each status within all tickets. The same GROUP BY structure applies.

SELECT  
    country,  
    SUM(amount) AS country\_total  
FROM sales  
GROUP BY country;

Time based data introduces a third form. Fact tables regularly record timestamps for orders, log entries, or sensor readings. Queries that want percent of total within a day or within a month derive time buckets from that timestamp column and use those buckets as groups. PostgreSQL can sum revenue per day with a query like this.

SELECT  
    DATE(order\_timestamp) AS order\_date,  
    SUM(amount) AS daily\_total  
FROM sales  
GROUP BY DATE(order\_timestamp)  
ORDER BY order\_date;

That result carries one row per day with a daily total. Later queries can compare each row in sales to its day’s total, or compare each day’s total to a month total, by following the same idea with a different grouping expression such as DATE\_TRUNC('month', order\_timestamp).

Across all these forms the same elements appear again and again. There is a measure such as amount, quantity, or duration. There is a grouping column or expression that collects related rows. There is a query that brings the row values and those group totals into the same result so that a percent of total expression can run for every row.

### Percent of Total in Real Queries

Dashboards, exports, and ad hoc reports all call for numbers that say how big one slice is compared to its whole. SQL engines support this through two main query styles. One style uses window functions so group sums and row values stay in a single pass across the data. Second style builds group totals in a subquery or common table expression, then joins those totals back to detailed rows. Both routes work in current releases of PostgreSQL, MySQL, MariaDB, SQL Server, and Oracle, with only small syntax changes from product to product.

#### Window Functions For Percent Of Total

Window functions let aggregate functions such as SUM work across a frame of rows while still returning one result row for each input row. Clause OVER marks the frame, and PARTITION BY inside that clause groups rows that share the same partition value. For percent of total queries that partition usually lines up with the group whose total forms the denominator, while ordering inside the frame is usually left out because the total does not depend on row order.

Many reporting tables store data that is already summarized at a useful level such as revenue per product and month. Let’s say we are working with a table monthly\_product\_revenue with columns order\_month, product\_id, and revenue. Querying percent of total per month with window functions can look like this.

SELECT  
    order\_month,  
    product\_id,  
    revenue,  
    SUM(revenue) OVER (PARTITION BY order\_month) AS month\_revenue,  
    ROUND(  
        CAST(revenue AS DECIMAL(18, 4))  
        / NULLIF(SUM(revenue) OVER (PARTITION BY order\_month), 0)  
        \* 100,  
        2  
    ) AS percent\_of\_month  
FROM monthly\_product\_revenue  
ORDER BY order\_month, product\_id;

That query keeps all rows from monthly\_product\_revenue in the result and adds two extra columns. One holds the month total and the other holds the percent share of that month for each product. Single scan over the table produces both details and totals, which fits reporting screens that show every product with its contribution.

Some reports compare each row both to a group total and to a grand total across the entire data set. Window functions handle this by adding a second SUM without PARTITION BY, so the frame for that second aggregate covers all rows. Percent of total per month and percent of total across all months can live side by side as in the next query.

SELECT  
    order\_month,  
    product\_id,  
    revenue,  
    SUM(revenue) OVER (PARTITION BY order\_month) AS month\_revenue,  
    SUM(revenue) OVER () AS grand\_revenue,  
    ROUND(  
        CAST(revenue AS DECIMAL(18, 4))  
        / NULLIF(SUM(revenue) OVER (PARTITION BY order\_month), 0)  
        \* 100,  
        2  
    ) AS percent\_of\_month,  
    ROUND(  
        CAST(revenue AS DECIMAL(18, 4))  
        / NULLIF(SUM(revenue) OVER (), 0)  
        \* 100,  
        2  
    ) AS percent\_of\_grand\_total  
FROM monthly\_product\_revenue;

Grand total window omits PARTITION BY, so every row sees the same grand\_revenue value. Reports that let readers compare a row within each month and also against the entire time span benefit from having both percents in one result set.

Window based percent of total logic is not limited to revenue tables. Any metric that groups naturally, such as page views per site section or transactions per customer, can sit inside a similar structure. As long as the database provides support for window functions, queries of this sort can run. PostgreSQL, SQL Server, Oracle, and MySQL from version 8.0 onward all implement window functions based on the SQL standard, and MariaDB includes similar support.

#### Subqueries For Percent Of Total

Subqueries and common table expressions come in when a database lacks window functions or when a query author prefers to keep group totals in an earlier step. Group totals live in one query result, and detailed rows join to those totals in a later query. That flow also matches how many reporting tools build SQL behind the scenes for percent based calculations.

Common table expressions give a very direct way to express that two step process. Think again about monthly revenue per product, where table monthly\_product\_revenue holds columns order\_month, product\_id, and revenue. Group totals for each month can be computed in a common table expression, then joined back to the base table so every row has its month total beside its own revenue.

WITH month\_totals AS (  
    SELECT  
        order\_month,  
        SUM(revenue) AS month\_revenue  
    FROM monthly\_product\_revenue  
    GROUP BY order\_month  
)  
SELECT  
    r.order\_month,  
    r.product\_id,  
    r.revenue,  
    t.month\_revenue,  
    ROUND(  
        CAST(r.revenue AS DECIMAL(18, 4))  
        / NULLIF(t.month\_revenue, 0)  
        \* 100,  
        2  
    ) AS percent\_of\_month  
FROM monthly\_product\_revenue AS r  
JOIN month\_totals AS t  
  ON r.order\_month = t.order\_month;

The first part of that statement groups by order\_month and produces one row per month with its total revenue. Second part brings every row from monthly\_product\_revenue back, fills in the matching month total from month\_totals, and calculates percent of total with division and multiplication by one hundred.

Queries on engines that do not support common table expressions place the grouped query directly inside a subquery in the FROM clause instead of writing WITH month\_totals AS (). Structure of the logic stays the same, with an aggregated query that returns one row per group and a join that connects each detailed row to its group row. Percent of total then follows directly from the fraction revenue / month\_revenue \* 100.

### Conclusion

Percent of total queries rest on a small set of mechanics that link each row to a group sum. Window functions keep group totals next to detail rows, while subqueries and common table expressions calculate those totals separately and join them back in. After you pick the measure column, the grouping column, and a reliable way to sum per group, the rest is casting, dividing, and rounding that fraction into a percent that works across reporting queries and database engines.

1.  [_PostgreSQL Window Functions Documentation_](https://www.postgresql.org/docs/current/functions-window.html)
2.  [_MySQL 8.0 Window Functions Guide_](https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html)
3.  [_SQL Server_](https://learn.microsoft.com/sql/t-sql/queries/select-over-clause-transact-sql) [_OVER Clause Reference_](https://learn.microsoft.com/sql/t-sql/queries/select-over-clause-transact-sql)
4.  [_MariaDB Window Functions Overview_](https://mariadb.com/kb/en/window-functions/)
5.  [_Oracle Analytic Functions Guide_](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Analytic-Functions.html)

![](https://cdn-images-1.medium.com/max/306/0*AsLbWGGj9lamLrpP.png)

[Image Source](https://freesvg.org/mono-sql)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=556984499c78)