---
title: A guide for creating a ClickHouse cluster from scratch
link: https://towardsdev.com/a-guide-for-creating-a-clickhouse-cluster-from-scratch-4c6638fb5a06?source=rss----a648dc4ecb66---4
author: Abhinav Mallick
publish_date: 2026-01-19 01:17:28
saved_date: 2026-01-19 07:02:49
image: https://cdn-images-1.medium.com/max/514/1*6hA1cHmPHJH5X64jaPYQXA.png
tags: #distributed-systems #data-warehouse #data-analytics #clickhouse #cluster
---

![image](https://cdn-images-1.medium.com/max/514/1*6hA1cHmPHJH5X64jaPYQXA.png)

![](https://cdn-images-1.medium.com/max/514/1*6hA1cHmPHJH5X64jaPYQXA.png)

We will create a very minimal ClickHouse cluster using 3 VMs, 2 for ClickHouse Server and 1 for ClickHouse Keeper.

### Configuring VMs to create the CH cluster

### Install CH

**DO THE FOLLOWING ON EACH VM**

P.S The keeper node won’t have a data disk, so do create a folder clickhouse on the root folder and install CH there.

1.  SSH to the newly created VM
2.  sudo su
3.  Create the XFS disk [refer](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/attach-disk-portal?tabs=ubuntu) (optional, do it if you have added a data disk)
4.  Go inside the data directory, we will install ClickHouse inside this folder cd /data
5.  curl https://clickhouse.com/ | sh
6.  ./clickhouse install this will create symlinks to be used by the OS
7.  ./clickhouse server this will create the files and directories needed for ClickHouse in the current directory
8.  ctrl+c to stop the running instance, and verify if the files are created by doing ls

### Adding the ClickHouse installation to systemd

1.  cd /usr/lib/systemd/system
2.  touch clickhouse-server.service
3.  vi clickhouse-server.service
4.  Insert this:

\[Unit\]  
Description=ClickHouse Server (analytic DBMS for big data)  
Requires=network-online.target  
After=time-sync.target network-online.target  
Wants=time-sync.target  
\[Service\]  
Type=simple  
User=clickhouse  
Group=clickhouse  
Restart=always  
RestartSec=30  
RuntimeDirectory=clickhouse-server  
ExecStart=/usr/bin/clickhouse-server --config=/etc/clickhouse-server/config.xml --pid-file=/run/clickhouse-server/clickhouse-server.pid  
\# Minus means that this file is optional.  
EnvironmentFile=-/etc/default/clickhouse  
LimitCORE=infinity  
LimitNOFILE=500000  
CapabilityBoundingSet=CAP\_NET\_ADMIN CAP\_IPC\_LOCK CAP\_SYS\_NICE CAP\_NET\_BIND\_SERVICE  
\[Install\]  
WantedBy=multi-user.target

5\. systemctl status clickhouse-server this will show inactive  
6\. systemctl start clickhouse-server this should start the service  
7\. Add this service to boot, so that CH starts on VM start:  
systemctl enable clickhouse-server

8\. Verify:systemctl is-enabled clickhouse-server

### Creating the cluster

### Configuring the cluster topology

**THIS NEEDS TO BE DONE ON EACH SERVER NODE**

Quick tip: For Vim you can press / to go in search mode, for nano you can do ctrl+w

1.  vi /etc/clickhouse-server/config.xml This file is read-only, :wq! to save and quit vim.
2.  Enable listen\_host, this will enable the hosts to communicate. Uncomment this line:

<listen\_host>0.0.0.0</listen\_host>

3\. Go to the section for remote server config.

4\. Add the config for the cluster, and leave the default config:

        <cluster1>  
            <shard>  
                <replica>  
                    <host>x.x.x.x</host>  
                    <port>9000</port>  
                </replica>  
            </shard>  
            <shard>  
                <replica>  
                    <host>x.x.x.x</host>  
                    <port>9000</port>  
                </replica>  
            </shard>  
        </cluster1>

In our setup we are defining only shards, if we go for a replica in the future. We can define a replica using the <replica> key in the <shard>. This will set up data replication inside one shard. Also, set internal replication to true. The config will then look like this:

<cluster1>  
            <shard>  
                <internal\_replication>true</internal\_replication>  
                <replica>  
                    <host>x.x.x.x</host>  
                    <port>9000</port>  
                </replica>  
                <replica>  
                    <host>replica\_ip</host>  
                    <port>9000</port>  
                </replica>  
            </shard>  
            <shard>  
                <internal\_replication>true</internal\_replication>  
                <replica>  
                    <host>x.x.x.x</host>  
                    <port>9000</port>  
                </replica>  
                <replica>  
                    <host>replica\_ip</host>  
                    <port>9000</port>  
                </replica>  
            </shard>  
        </cluster1>

#### Verify this cluster inside ClickHouse

1.  clickhouse-client
2.  List the clusters

SELECT cluster FROM system.clusters

3\. It should list down cluster1, the count should be equal to the number of total replicas defined. In our case, we have one replica per shard and we have 2 shards. So, it should show cluster1 twice.

4\. Get the details:

SELECT  
    cluster,  
    shard\_num,  
    replica\_num,  
    host\_name,  
    port  
FROM system.clusters  
WHERE cluster = 'cluster1'  
ORDER BY  
    shard\_num ASC,  
    replica\_num ASC

This should show the cluster topology as defined. In our case:

┌─cluster──┬─shard\_num─┬─replica\_num─┬─host\_name───┬─port─┐  
│ cluster1 │         1 │           1 │ x.x.x.x     │ 9000 │  
│ cluster1 │         2 │           1 │ x.x.x.x     │ 9000 │  
└──────────┴───────────┴─────────────┴─────────────┴──────┘

Looks good!

### Configuring the keeper node

Clickhouse Keeper comes bundled with a ClickHouse server instance, just installing Clickhouse is sufficient to run clickhouse keeper. Adding the keeper configuration in the clickhouse-server config enables it for you.

1.  vi /etc/clickhouse-server/config.xml
2.  Enable listen\_host, this will enable the hosts to communicate. Uncomment this line:

<listen\_host>0.0.0.0</listen\_host>

3\. We are using only one keeper node to manage data. Add this config at the end, since there won’t be any existing dummy entry. Go to where the ClickHouse config ends </clickhouse> Add the following just before that:

-   NOTE: We are using port 9234 not 9444, this is done to ensure if there is any other process using port 9444 our keeper is not affected.

    <keeper\_server>  
        <tcp\_port>2181</tcp\_port>  
        <server\_id>1</server\_id>  
        <raft\_configuration>  
            <server>  
                <id>1</id>  
                <hostname>x.x.x.x</hostname>  
                <port>9234</port>  
            </server>  
        </raft\_configuration>  
    </keeper\_server>

-   In case we go for more than one keeper node we can define the config as follows, remember to put the server ID as unique for each keeper node.

    <keeper\_server>  
        <tcp\_port>2181</tcp\_port>  
        <server\_id>3</server\_id>  
        <raft\_configuration>  
            <server>  
                <id>1</id>  
                <hostname>x.x.x.x</hostname>  
                <port>9234</port>  
            </server>  
            <server>  
                <id>2</id>  
                <hostname>x.x.x.x</hostname>  
                <port>9234</port>  
            </server>  
            <server>  
                <id>3</id>  
                <hostname>x.x.x.x</hostname>  
                <port>9234</port>  
            </server>  
        </raft\_configuration>  
    </keeper\_server>

4\. Restart ClickHouse systemctl restart clickhouse-server

### Configuring the cluster

Almalinux tip: It has the firewall enabled. This will not allow routes from the nodes to be discovered.

1.  sentenforce 0 , disable security features
2.  systemctl stop firewalld
3.  systemctl disable firewalld

We need to tell the server nodes, where the keeper is. Do the following on each of the server nodes.

1\. vi /etc/clickhouse-server/config.xml

2\. Add the zookeeper config:

    <zookeeper>  
        <node index="1">  
            <host>x.x.x.x</host>  
            <port>2181</port>  
        </node>  
    </zookeeper>

-   In future, if we have more than one instance, we can define the config as:

    <zookeeper>  
        <node index="1">  
            <host>x.x.x.x</host>  
            <port>2181</port>  
        </node>  
        <node index="2">  
            <host>x.x.x.x</host>  
            <port>2181</port>  
        </node>  
        <node index="3">  
            <host>x.x.x.x</host>  
            <port>2181</port>  
        </node>  
    </zookeeper>

3\. Restart ClickHouse systemctl restart clickhouse-server

4\. Verify ClickHouse keeper config:

5\. clickhouse-client

select \* from system.zookeeper where path IN ('/', '/clickhouse')

6\. Add macro definition to the nodes:

    <macros>  
        <shard>01</shard>  
        <replica>01</replica>  
    </macros>

Change the number to 02 for the second replica, similarly for the second shard.

Verify using:

SELECT \*  
FROM system.macros

### Verifying the cluster setup

We will create a database and tables on one node and verify if it gets created on each of the nodes or not.

1.  Create a database on the cluster:

CREATE DATABASE test1 ON CLUSTER cluster

2\. Create a replicated table on this cluster:

CREATE TABLE test1.table1 ON CLUSTER cluster1  
(  
    \`x\` String  
)  
ENGINE = ReplicatedMergeTree('/clickhouse/tables/table1/{shard}', '{replica}')  
PRIMARY KEY x

3\. Create a distributed table on top of the above to manage this table on all the shards and replicas:

CREATE TABLE distributed\_test1 AS test1.table1  
ENGINE = Distributed(cluster1, test1, table1)

All of this can be executed on any of the nodes and verified on any other node.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=4c6638fb5a06)

* * *

[A guide for creating a ClickHouse cluster from scratch](https://towardsdev.com/a-guide-for-creating-a-clickhouse-cluster-from-scratch-4c6638fb5a06) was originally published in [Towards Dev](https://towardsdev.com) on Medium, where people are continuing the conversation by highlighting and responding to this story.