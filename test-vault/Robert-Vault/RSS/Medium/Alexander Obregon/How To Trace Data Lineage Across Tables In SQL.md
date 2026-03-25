---
title: How To Trace Data Lineage Across Tables In SQL
link: "https://medium.com/@AlexanderObregon/how-to-trace-data-lineage-across-tables-in-sql-5ffcba37d645?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-13 15:56:16"
saved_date: "2026-01-17 15:09:42"
image: "https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png)

![](https://cdn-images-1.medium.com/max/900/0*7DaJp8s5KhKIcxwN.png)

[Image Source](https://commons.wikimedia.org/wiki/File:Sql_data_base_with_logo.png)

Data platforms pull information from many sources and move it through several layers before it reaches reports or downstream services. People who work with orders, invoices, customer records, or shipment tracking need a reliable way to trace how a single value travels across tables. That trail is commonly called data lineage. SQL gives you tools to follow a value step by step, from its origin table through joins, staging layers, and history tables, so you can figure out where a field came from and how it changed over time.

_I publish free articles like this daily, this was originally posted on my_ [_SQL section on Substack_](https://alexanderobregon.substack.com/s/sql) _where you’ll find my whole series._ [_My Substack_](https://alexanderobregon.substack.com/) _also includes weekly recaps if you’d like to keep up with everything I’m publishing._

### Core Ideas For SQL Data Lineage

In SQL, data lineage work starts with tables, rows, and columns that stand for real world events. Orders, invoices, customers, and shipments all sit in their own tables, commonly backed by primary id columns that stay stable through the life of a record. Those identifiers act as anchors for lineage queries. Joins then reconnect related rows that describe the same order at different stages, so a query can walk from one table to the next and tell a complete story. Column names and constraints help readers see which columns match, while foreign id columns give the database a formal description of those links.

#### Parent Child Relationships

Parent child relationships appear any time one record holds broad context and many records hold smaller details. An order header captures who placed the order, when it occurred, and what status it currently has. Order item rows fill in the individual products, quantities, and prices. Shipment rows attach tracking data when the order moves through fulfillment. Data lineage queries rely on those relationships to reconnect parents and children for a single business case such as a customer call or a disputed invoice.

Relational databases link those tables with foreign id columns. Child tables store the parent identifier in a column that points back to the header row. This layout makes lineage queries mechanical, because a join simply matches shared identifiers.

Take this example table definitions for an order flow:

CREATE TABLE orders (  
    order\_id       BIGINT PRIMARY KEY,  
    customer\_id    BIGINT NOT NULL,  
    created\_at     TIMESTAMP NOT NULL,  
    status         VARCHAR(20) NOT NULL  
);  
  
CREATE TABLE order\_items (  
    item\_id        BIGINT PRIMARY KEY,  
    order\_id       BIGINT NOT NULL,  
    product\_id     BIGINT NOT NULL,  
    quantity       INTEGER NOT NULL,  
    unit\_price     NUMERIC(10, 2) NOT NULL,  
    FOREIGN KEY (order\_id) REFERENCES orders(order\_id)  
);  
  
CREATE TABLE shipments (  
    shipment\_id    BIGINT PRIMARY KEY,  
    order\_id       BIGINT NOT NULL,  
    carrier\_code   VARCHAR(20) NOT NULL,  
    tracking\_code  VARCHAR(50) NOT NULL,  
    shipped\_at     TIMESTAMP NOT NULL,  
    FOREIGN KEY (order\_id) REFERENCES orders(order\_id)  
);

These tables line up around order\_id as the common business identifier. Any lineage query that starts at shipments can join back to orders and order\_items to answer questions about what left the warehouse, which customer it served, and how revenue breaks down across products.

Most lineage queries begin with a concrete starting point such as a tracking code, an order id, or a customer id. From there a series of joins can expand the picture around that starting point.

Typical query that traces from a tracking code back to items in the order:

SELECT  
    s.tracking\_code,  
    o.order\_id,  
    o.customer\_id,  
    o.created\_at,  
    o.status,  
    oi.item\_id,  
    oi.product\_id,  
    oi.quantity,  
    oi.unit\_price  
FROM shipments s  
JOIN orders o  
    ON o.order\_id = s.order\_id  
JOIN order\_items oi  
    ON oi.order\_id = o.order\_id  
WHERE s.tracking\_code = '1Z9999999999999999';

Result rows from this query give a compact lineage view. One group of columns describes the shipment, a second group describes the order header, and the remainder describe each line item tied to that order. Support analysts can read that output and trace how a single tracking number maps to a customer purchase.

Parent child relationships also help when multiple levels exist between a business entity and its final representation. Some schemas use an address table that holds reusable addresses, with both customers and orders pointing to those rows. Lineage then needs to cross two foreign id columns instead of one.

Let’s look at this table layout with a shared address table:

CREATE TABLE addresses (  
    address\_id     BIGINT PRIMARY KEY,  
    street\_line1   VARCHAR(200) NOT NULL,  
    city           VARCHAR(100) NOT NULL,  
    state\_code     CHAR(2) NOT NULL,  
    postal\_code    VARCHAR(20) NOT NULL  
);  
  
CREATE TABLE customers (  
    customer\_id      BIGINT PRIMARY KEY,  
    name             VARCHAR(200) NOT NULL,  
    billing\_addr\_id  BIGINT,  
    shipping\_addr\_id BIGINT,  
    FOREIGN KEY (billing\_addr\_id) REFERENCES addresses(address\_id),  
    FOREIGN KEY (shipping\_addr\_id) REFERENCES addresses(address\_id)  
);  
  
ALTER TABLE orders  
    ADD COLUMN shipping\_addr\_id BIGINT,  
    ADD CONSTRAINT fk\_orders\_shipping\_addr  
        FOREIGN KEY (shipping\_addr\_id) REFERENCES addresses(address\_id);

Queries that trace an order across these tables can connect shipment data, order headers, customers, and address records to answer questions about where a parcel went and which address records fed that shipment label.

#### Join Routes Across Systems

Lineage work rarely stops at one database schema. Data from an order system may be copied into a staging schema, fed into a warehouse, and aggregated into reporting tables. Every step that preserves a common identifier lets SQL queries reconnect the chain from a heavily summarized report all the way back to raw transactional data.

One way to think about these layers is that raw tables are the landing zone where data first arrives, warehouse tables hold the cleaned and standardized version of that data, and fact tables are the ones that reporting queries hit most of the time. Order identifiers move through those layers as data loaders transform text fields, map external ids to internal ones, and compute metrics such as revenue.

Starter table set for a three layer flow:

CREATE TABLE raw\_orders (  
    source\_order\_id   BIGINT,  
    customer\_ref      VARCHAR(50),  
    order\_timestamp   TIMESTAMP,  
    status\_text       VARCHAR(50),  
    load\_batch\_id     BIGINT  
);  
  
CREATE TABLE dw\_orders (  
    order\_id          BIGINT PRIMARY KEY,  
    customer\_id       BIGINT NOT NULL,  
    occurred\_at       TIMESTAMP NOT NULL,  
    status\_code       VARCHAR(20) NOT NULL,  
    load\_batch\_id     BIGINT NOT NULL  
);  
  
CREATE TABLE fact\_orders (  
    order\_id          BIGINT PRIMARY KEY,  
    order\_date        DATE NOT NULL,  
    customer\_id       BIGINT NOT NULL,  
    status\_code       VARCHAR(20) NOT NULL,  
    revenue\_amount    NUMERIC(12, 2) NOT NULL  
);

Raw tables usually land very close to what upstream systems send, so column names and types line up with external feeds. Warehouse tables align that data with internal reference data such as customer dimensions. Fact tables roll transactions into forms that suit dashboards and analytics queries.

To follow a single order from a reporting query back to original input, a lineage query can join across each stage.

Here is a query that links a fact row to its warehouse and raw predecessors:

WITH order\_fact AS (  
    SELECT \*  
    FROM fact\_orders  
    WHERE order\_id = 123456  
)  
SELECT  
    f.order\_id,  
    f.order\_date,  
    f.customer\_id,  
    f.status\_code,  
    f.revenue\_amount,  
    d.occurred\_at,  
    d.load\_batch\_id,  
    r.source\_order\_id,  
    r.customer\_ref,  
    r.order\_timestamp,  
    r.status\_text  
FROM order\_fact f  
JOIN dw\_orders d  
    ON d.order\_id = f.order\_id  
JOIN raw\_orders r  
    ON r.source\_order\_id = d.order\_id;

Result rows from this query tie the metric level record to its warehouse representation and then to the raw feed entry that first carried the order. Analysts can check whether a surprising metric came from a data issue in the raw feed, a mapping rule in the warehouse, or an aggregation rule in the fact table.

Join routes can also cross boundaries between functional systems. An order id may appear in a warehouse that models sales, a separate schema that models support tickets, and a marketing system that records campaigns. Shared identifiers let a query link those views without depending on a single monolithic schema.

Take this example join that follows an order into a support system:

CREATE TABLE support\_tickets (  
    ticket\_id        BIGINT PRIMARY KEY,  
    order\_id         BIGINT,  
    customer\_id      BIGINT NOT NULL,  
    opened\_at        TIMESTAMP NOT NULL,  
    status           VARCHAR(20) NOT NULL  
);  
  
SELECT  
    f.order\_id,  
    f.order\_date,  
    f.revenue\_amount,  
    t.ticket\_id,  
    t.opened\_at,  
    t.status AS ticket\_status  
FROM fact\_orders f  
LEFT JOIN support\_tickets t  
    ON t.order\_id = f.order\_id  
WHERE f.order\_id = 123456;

This type of query reveals whether high value orders tend to generate support activity. As long as systems share identifiers and those identifiers stay stable, SQL joins can retrace data lineage across layers and across business domains.

### Practical Lineage Query Patterns

Data lineage work usually starts with a concrete question. Someone wants to know how an order reached its current status, how a card charge ties back to an internal order id, or how a customer record evolved as edits came in. SQL answers those questions with repeatable query patterns. Status tables track progress through a workflow, identifier chains link separate systems, and history tables record old versions of a row instead of throwing them away. After those structures are in place, queries can trace real business stories in a way that other people on the team can read.

#### Tracing Order Status Across Tables

Status tracking revolves around two ideas. One table holds the current view of the order, and another table records every change that happened to that order. Lineage queries bridge those two tables, so a support engineer can see how a refund or shipment delay unfolded step by step.

Many schemas start with a core orders table that holds one row per order, then add an order\_status\_events table to record transitions. Each transition describes a move from one status to another at a specific timestamp, usually with some indication of who triggered the change.

Let’s look at a status event table:

CREATE TABLE order\_status\_events (  
    event\_id      BIGINT PRIMARY KEY,  
    order\_id      BIGINT NOT NULL,  
    old\_status    VARCHAR(20),  
    new\_status    VARCHAR(20) NOT NULL,  
    event\_time    TIMESTAMP NOT NULL,  
    actor\_id      BIGINT,  
    FOREIGN KEY (order\_id) REFERENCES orders(order\_id)  
);

The status transitions in this table are easier to read when joined back to the base order record. A query can pull the core fields from orders, then attach all status events in time order so the full story sits in one result set.

And here is a query that lists an order and its status history:

SELECT  
    o.order\_id,  
    o.customer\_id,  
    o.created\_at,  
    o.status AS current\_status,  
    e.event\_time,  
    e.old\_status,  
    e.new\_status,  
    e.actor\_id  
FROM orders o  
LEFT JOIN order\_status\_events e  
    ON e.order\_id = o.order\_id  
WHERE o.order\_id = 123456  
ORDER BY e.event\_time;

Here, the result rows give a time ordered feed for that order. Each row ties the order header data to one status change, and the final row aligns with the current status in the orders table. Analysts can scan this output to answer questions like how long it sat in a pending state or how many times it moved back to a review state.

Event tables also work well with window functions. A window function can compare each event with the previous one for the same order to compute durations or catch unusual back and forth moves. Functions such as LAG and LEAD avoid self joins and keep the query more compact.

Now let’s look at a query that measures time between status changes:

SELECT  
    order\_id,  
    event\_time,  
    old\_status,  
    new\_status,  
    LAG(event\_time) OVER (  
        PARTITION BY order\_id  
        ORDER BY event\_time  
    ) AS previous\_event\_time,  
    EXTRACT(  
        EPOCH FROM (  
            event\_time  
            - LAG(event\_time) OVER (  
                  PARTITION BY order\_id  
                  ORDER BY event\_time  
              )  
        )  
    ) AS seconds\_since\_previous  
FROM order\_status\_events  
WHERE order\_id = 123456  
ORDER BY event\_time;

This query gives a compact timeline that shows how long each status lasted. Columns such as seconds\_since\_previous can feed reports that look for orders stuck in one state too long or transitions that happen unusually quickly.

Some systems also capture a free text reason or code at each transition. That extra field becomes helpful for lineage, because it explains why a status changed and not only when it changed. A field like this can sit in the same event table:

ALTER TABLE order\_status\_events  
ADD COLUMN reason\_code VARCHAR(50),  
ADD COLUMN reason\_text TEXT;

Queries that include reason\_code and reason\_text give more context about approvals, fraud checks, backorders, or customer requests that drove the state changes.

#### Following Identifier Handoffs

Identifier handoffs happen when one system creates an id, passes that id to a second system, and that second system returns a new id. Data lineage ties those ids together so people can hop from one system view to another without guesswork. Payment flows give a good example. An internal order id ties to an internal payment id, which ties to a provider payment id, which then links to a bank reference or settlement id. Relational tables handle this with foreign id columns in the same way as parent child data, but the joins tend to span more domains. One table sits close to the ecommerce order, another sits near the payment provider integration, and a third table stores settlement details. Every table carries at least one column that points back to the previous hop.

Take this example that links an internal payment to provider and bank data:

CREATE TABLE payments (  
    payment\_id           BIGINT PRIMARY KEY,  
    order\_id             BIGINT NOT NULL,  
    provider\_payment\_id  VARCHAR(50) NOT NULL,  
    status               VARCHAR(20) NOT NULL,  
    created\_at           TIMESTAMP NOT NULL  
);  
  
CREATE TABLE provider\_settlements (  
    settlement\_id        BIGINT PRIMARY KEY,  
    provider\_payment\_id  VARCHAR(50) NOT NULL,  
    bank\_reference       VARCHAR(50) NOT NULL,  
    settled\_at           TIMESTAMP NOT NULL  
);  
  
SELECT  
    ps.bank\_reference,  
    ps.settled\_at,  
    p.provider\_payment\_id,  
    p.status AS payment\_status,  
    p.created\_at AS payment\_created\_at,  
    o.order\_id,  
    o.customer\_id,  
    o.status AS order\_status  
FROM provider\_settlements ps  
JOIN payments p  
    ON p.provider\_payment\_id = ps.provider\_payment\_id  
JOIN orders o  
    ON o.order\_id = p.order\_id  
WHERE ps.bank\_reference = 'BR-2024-12-000123';

The query here starts from a bank reference, hops to the provider payment row with a join on provider\_payment\_id, then hops again to the internal order. That chain ties a bank level event to a customer purchase. Support teams can answer refund questions, and finance teams can tie exported settlement files back to internal revenue reports.

#### Building Audit Trails With History Tables

History tables keep old versions of a record instead of overwriting them. Data lineage benefits from this, because a query can recreate the state of a customer record or product record at any point in time. Warehouses frequently model this as a table with effective dates that mark when each version started and when it stopped.

Customer history gives a common case. Customer details such as email, address, or status can change many times. Instead of tracking only the latest values, a history table holds one row per version. Two timestamps, valid\_from and valid\_to, describe the period where that version applied.

Here is a example of a customer history table:

CREATE TABLE customer\_history (  
    customer\_id      BIGINT NOT NULL,  
    version\_id       BIGINT NOT NULL,  
    name             VARCHAR(200) NOT NULL,  
    email            VARCHAR(200) NOT NULL,  
    status           VARCHAR(20) NOT NULL,  
    valid\_from       TIMESTAMP NOT NULL,  
    valid\_to         TIMESTAMP,  
    PRIMARY KEY (customer\_id, version\_id)  
);

Rows with a null valid\_to hold the latest version. Older rows keep previous names, emails, and statuses with their own validity ranges.

And this query lists every version for one customer:

SELECT  
    customer\_id,  
    version\_id,  
    name,  
    email,  
    status,  
    valid\_from,  
    valid\_to  
FROM customer\_history  
WHERE customer\_id = 98765  
ORDER BY valid\_from;

Results like this let auditors see how contact data changed over months or years. Each row captures an old state of the customer profile, and the timestamps explain when that state applied.

History tables gain even more value when joined with fact tables that carry date information. Suppose fact\_orders stores a row per order with an order\_date and customer\_id. A lineage query can join fact\_orders to customer\_history with a date range condition, so every order row lines up with the customer version that was active on that date.

Now let’s look at this query that joins facts to historical customer data:

SELECT  
    f.order\_id,  
    f.order\_date,  
    f.revenue\_amount,  
    c.name,  
    c.email,  
    c.status  
FROM fact\_orders f  
JOIN customer\_history c  
    ON c.customer\_id = f.customer\_id  
   AND f.order\_date >= c.valid\_from  
   AND (c.valid\_to IS NULL OR f.order\_date < c.valid\_to)  
WHERE f.order\_id = 123456;

This join aligns order activity with customer attributes that were valid on the order date. Analysts can answer questions about how much revenue came from customers in a certain status at a certain point in time, without being misled by later profile edits.

History tables need not be limited to customers. The same structure can track product catalog changes, pricing changes, or contract terms. In every case, data lineage queries become more precise, because a fact row links not just to a present day description, but to the exact description that applied when the event occurred.

### Conclusion

To put it simply, data lineage in SQL comes down to stable identifiers, well structured tables, and joins that walk across those links. Queries that follow an order through status events, payment ids, warehouse layers, and history tables give a concrete trail that can be read and checked. With these mechanics in place, people can answer where a value came from and how it changed, with SQL acting as a transparent record of how data moves through their systems.

1.  [_PostgreSQL Documentation on Queries_](https://www.postgresql.org/docs/current/queries.html)
2.  [_MySQL Reference for Join Operations_](https://dev.mysql.com/doc/refman/8.0/en/join.html)
3.  [_SQL Server Documentation on Joins_](https://learn.microsoft.com/en-us/sql/relational-databases/performance/joins?view=sql-server-ver17)

![](https://cdn-images-1.medium.com/max/306/0*AsLbWGGj9lamLrpP.png)

[Image Source](https://freesvg.org/mono-sql)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=5ffcba37d645)