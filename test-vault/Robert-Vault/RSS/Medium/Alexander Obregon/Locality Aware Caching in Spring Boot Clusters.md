---
title: Locality Aware Caching in Spring Boot Clusters
link: "https://medium.com/@AlexanderObregon/locality-aware-caching-in-spring-boot-clusters-dc54a5747224?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-10 16:41:12"
saved_date: "2026-01-17 15:09:42"
image: "https://cdn-images-1.medium.com/max/900/1*o5FmjKTPdJTbhGE2MIjo6w.jpeg"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/900/1*o5FmjKTPdJTbhGE2MIjo6w.jpeg)

![](https://cdn-images-1.medium.com/max/900/1*o5FmjKTPdJTbhGE2MIjo6w.jpeg)

[Image Source](https://spring.io/projects/spring-boot)

Clustered Spring Boot services talk a lot to remote databases, search engines, and third party APIs, so every trip that leaves the node adds a little extra delay. Caching cuts many of those trips, yet a basic shared cache still sends every lookup across the network. Locality aware caching keeps data close to where code runs, holds hot results in each node’s memory, and coordinates those caches so nodes do not repeat the same heavy fetch. That blend of local and shared views of the data keeps caches warm across the cluster instead of turning load spikes into a wave of duplicate work.

_I publish free articles like this daily, if you want to support my work and get access to exclusive content and weekly recaps, consider subscribing to my_ [_Substack_](https://alexanderobregon.substack.com/)_._

### Locality in Clustered Spring Boot Services

Locality in a cluster answers a basic question for every read. Does this node already have the data in its own memory, or does it need to reach across the network to somewhere else. Locality aware caching tries to keep the first answer true as often as possible, while still letting nodes share work through a common cache layer. That balance keeps latency low for hot data, reduces chattiness between services, and cuts down on duplicate queries that all do the same heavy work against a database or search cluster. Spring Boot helps here by standardizing cache access through its cache abstraction so application code can focus on what to cache instead of juggling client libraries all over the codebase.

#### What Cache Locality Means For a Cluster

Local cache access stays inside the same JVM as the controller or service method that needs the data. Memory reads happen through normal object references without any network calls or serialization. Spring Boot usually brings this to life with providers such as Caffeine or the default ConcurrentMapCacheManager, which hold entries in process. ConcurrentMapCacheManager is backed by a ConcurrentHashMap and does not provide built in expiration or size based eviction, so entries stay until removed or the process restarts. This form of locality matters in a cluster because every node runs its own copy of the cache and can serve repeated reads for the same keys without talking to any other process.

Remote cache access, on the other hand, flows through a network hop to a shared store such as Redis, Memcached, Hazelcast, or another grid that lives outside the application JVMs. That shared store keeps data in memory too, so reads still run much faster than a full database query, but those reads now pay for socket handling, serialization, and internal replication inside the cache cluster. Modern Redis clusters, for instance, support client side caching so that clients can keep frequently used values locally while still subscribing to invalidation messages from the server. Hazelcast near cache features provide a similar experience, where the client member keeps a small hot subset of a large distributed map in its own memory.

Many clustered systems blend both layers. Local caches act as the first stop. If a value is not present locally, the node turns to the distributed cache. If that second layer also misses, then the system drops down to the primary data source such as a relational database, a search index, or a third party API. That three step flow lets one node pay the cost of the heavy call, then share the result through the distributed cache. Later reads on the same key tend to hit the distributed cache first and then spread further into local caches as nodes handle more traffic for that data.

A minimal example with a pure local cache in Spring Boot uses the default concurrent map cache manager, configuration will look like this:

@Configuration  
@EnableCaching  
public class LocalCacheConfig {  
  
    @Bean  
    public CacheManager localCacheManager() {  
        return new ConcurrentMapCacheManager("customerById");  
    }  
}

Service code that relies on this local cache can be very compact, but still benefits from locality inside each node.

@Service  
public class CustomerService {  
  
    private final CustomerRepository customerRepository;  
  
    public CustomerService(CustomerRepository customerRepository) {  
        this.customerRepository = customerRepository;  
    }  
  
    @Cacheable(cacheNames = "customerById", cacheManager = "localCacheManager")  
    public Customer findCustomer(Long id) {  
        return customerRepository.findById(id).orElseThrow();  
    }  
}

Readers on that node now hit the cache for repeat calls with the same identifier, and only the first call falls through to the repository. Other nodes in the cluster still pay for their own initial lookups, because this configuration has no shared layer yet, but the example makes the locality idea concrete for one JVM.

Traffic patterns change how valuable locality becomes. Read heavy flows that hammer the same keys, such as feature flags or product metadata, lean heavily on local caches because those entries live in memory and respond quickly. Write heavy flows that update records frequently need shorter time to live settings or explicit invalidation so stale local values do not linger for too long. Latency budgets, consistency expectations, and the cost of a miss all play into how teams size those caches and how aggressively they expire entries.

#### Cache Layers Spring Boot Can Connect To

Spring Boot wraps cache access through the Spring Cache abstraction so application classes talk to annotations such as @Cacheable, @CachePut, and @CacheEvict, while configuration picks the actual provider. Core auto configuration detects libraries on the classpath and builds a matching CacheManager. With Caffeine present, Boot tends to favor a CaffeineCacheManager. With Redis libraries present, Boot can create a RedisCacheManager. That means engineers can swap in a new provider or add an extra layer without rewriting service methods.

Local caches usually sit closer to the service logic. Caffeine is a popular pick for this layer because it supports automatic eviction, size limits, and time based expiration with very low overhead. Redis, Hazelcast, or Memcached commonly serve as remote layers that keep a shared view for an entire cluster. Data grids such as Hazelcast and Infinispan add extra locality features like near cache and backup replicas that can place data near both the writer and the reader. Spring Boot ships starters for Redis and Hazelcast, and community starters cover other cache servers such as Infinispan or Memcached, so projects can still plug them into the same annotation driven cache model.

One common configuration introduces Redis as a distributed cache alongside local caches and can look like this:

@Configuration  
@EnableCaching  
public class RedisCacheConfig {  
  
    @Bean  
    public RedisConnectionFactory redisConnectionFactory() {  
        LettuceConnectionFactory connectionFactory =  
                new LettuceConnectionFactory("redis.example.internal", 6379);  
        connectionFactory.afterPropertiesSet();  
        return connectionFactory;  
    }  
  
    @Bean  
    public RedisCacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {  
        RedisCacheConfiguration cacheConfig =  
                RedisCacheConfiguration.defaultCacheConfig()  
                                       .entryTtl(Duration.ofMinutes(20));  
        return RedisCacheManager.builder(connectionFactory)  
                                .cacheDefaults(cacheConfig)  
                                .build();  
    }  
}

Service methods can point directly at this RedisCacheManager when they need cluster wide visibility for entries.

@Service  
public class PricingService {  
  
    private final PricingClient pricingClient;  
  
    public PricingService(PricingClient pricingClient) {  
        this.pricingClient = pricingClient;  
    }  
  
    @Cacheable(cacheNames = "priceBySku", cacheManager = "redisCacheManager")  
    public Money fetchPrice(String sku) {  
        return pricingClient.fetchCurrentPrice(sku);  
    }  
}

Those calls now use Redis as a remote layer. Locality at this point lives in the Redis cluster rather than inside every JVM, yet the Spring Boot service still benefits from short network trips to a cache instead of slow queries to a backing store.

Hazelcast offers a different flavor for locality when used as both cache provider and cluster coordinator. Spring Boot integrates with Hazelcast through its own starter and through the HazelcastInstance bean, which can back a HazelcastCacheManager. Hazelcast near cache lets each application node hold a local hot subset of an IMap while still keeping the full data set in the distributed map across the cluster. Configuration in Spring can express that idea in a compact way.

@Configuration  
@EnableCaching  
public class HazelcastCacheConfig {  
  
    @Bean  
    public Config hazelcastConfig() {  
        Config config = new Config();  
  
        MapConfig productsMap = new MapConfig("products");  
  
        EvictionConfig evictionConfig = new EvictionConfig()  
                .setMaxSizePolicy(MaxSizePolicy.ENTRY\_COUNT)  
                .setSize(5\_000);  
  
        NearCacheConfig nearCacheConfig = new NearCacheConfig();  
        nearCacheConfig.setTimeToLiveSeconds(600);  
        nearCacheConfig.setEvictionConfig(evictionConfig);  
  
        productsMap.setNearCacheConfig(nearCacheConfig);  
        config.addMapConfig(productsMap);  
  
        return config;  
    }  
  
    @Bean  
    public HazelcastInstance hazelcastInstance(Config hazelcastConfig) {  
        return Hazelcast.newHazelcastInstance(hazelcastConfig);  
    }  
  
    @Bean  
    public CacheManager hazelcastCacheManager(HazelcastInstance hazelcastInstance) {  
        return new HazelcastCacheManager(hazelcastInstance);  
    }  
}

This setup lets nodes query the products map through Spring’s cache abstraction and get local hits from the near cache on repeated access, while still sharing the base IMap across the cluster. Locality here comes from both the near cache running next to the code and from the distributed segment placement that Hazelcast uses under the covers.

Spring Boot does not enforce a single model for how many layers to place between service code and the ultimate data source. Projects can combine local caches, distributed caches, and features like near cache or client side caching according to their latency targets and traffic patterns. Locality aware design in these clusters grows out of these building blocks, and the cache abstraction gives a common way to plug them in without flooding service classes with provider specific APIs.

### Techniques For Locality Aware Caching

Locality in a Spring Boot cluster depends on more than one cache knob. Cache behavior comes from how layers are stacked, how requests flow through nodes, and how values get loaded when nobody has them yet. Techniques in this area focus on choosing where reads go first, how work gets shared across instances, and how caches warm up again after a restart or a sudden wave of traffic. Spring Boot does not lock you into a single model, so projects can line up the cache abstraction with different providers and routing rules that fit their traffic and latency needs.

#### Two Level Cache For Locality

Two level cache layouts pair a fast local layer in each JVM with a shared layer that spans the cluster. Getting local first and shared second behavior for one cache name calls for a custom Cache that checks local storage, then falls back to the shared store, then copies the shared value into local storage. CompositeCacheManager does not do that, because it returns the first cache it finds for a name and stops there. Spring Boot can support more than one CacheManager bean. CompositeCacheManager walks its delegate managers in order, asks each for a cache with a given name, and returns the first non null result. That pattern routes cache names to different providers, so one set of names can live in a Caffeine based manager and another set in a Redis backed manager, but a single cache name still maps to exactly one underlying cache.

Configuration that delivers a two level read path for one cache name can look like:

@Configuration  
@EnableCaching  
public class TieredCacheConfig {  
  
    @Bean  
    public CacheManager localCacheManager() {  
        CaffeineCacheManager caffeine = new CaffeineCacheManager("productById");  
        caffeine.setCaffeine(  
            Caffeine.newBuilder()  
                    .maximumSize(10\_000)  
                    .expireAfterWrite(Duration.ofMinutes(5))  
        );  
        return caffeine;  
    }  
  
    @Bean  
    public CacheManager remoteCacheManager(RedisConnectionFactory connectionFactory) {  
        RedisCacheConfiguration redisConfig =  
                RedisCacheConfiguration.defaultCacheConfig()  
                                       .entryTtl(Duration.ofMinutes(30));  
        return RedisCacheManager.builder(connectionFactory)  
                                .cacheDefaults(redisConfig)  
                                .build();  
    }  
  
    @Bean  
    public CacheManager tieredCacheManager(  
            CacheManager localCacheManager,  
            CacheManager remoteCacheManager  
    ) {  
        return new TieredCacheManager(localCacheManager, remoteCacheManager);  
    }  
  
    static final class TieredCacheManager implements CacheManager {  
  
        private final CacheManager local;  
        private final CacheManager remote;  
  
        TieredCacheManager(CacheManager local, CacheManager remote) {  
            this.local = local;  
            this.remote = remote;  
        }  
  
        @Override  
        public Cache getCache(String name) {  
            Cache localCache = local.getCache(name);  
            Cache remoteCache = remote.getCache(name);  
  
            if (localCache == null) {  
                return remoteCache;  
            }  
            if (remoteCache == null) {  
                return localCache;  
            }  
  
            return new TieredCache(name, localCache, remoteCache);  
        }  
  
        @Override  
        public Collection<String> getCacheNames() {  
            Set<String> names = new LinkedHashSet<>();  
            names.addAll(local.getCacheNames());  
            names.addAll(remote.getCacheNames());  
            return names;  
        }  
    }  
  
    static final class TieredCache implements Cache {  
  
        private final String name;  
        private final Cache local;  
        private final Cache remote;  
  
        TieredCache(String name, Cache local, Cache remote) {  
            this.name = name;  
            this.local = local;  
            this.remote = remote;  
        }  
  
        @Override  
        public String getName() {  
            return name;  
        }  
  
        @Override  
        public Object getNativeCache() {  
            return this;  
        }  
  
        @Override  
        public ValueWrapper get(Object key) {  
            ValueWrapper hit = local.get(key);  
            if (hit != null) {  
                return hit;  
            }  
  
            ValueWrapper shared = remote.get(key);  
            if (shared != null) {  
                local.put(key, shared.get());  
            }  
            return shared;  
        }  
  
        @Override  
        @SuppressWarnings("unchecked")  
        public <T> T get(Object key, Class<T> type) {  
            T hit = local.get(key, type);  
            if (hit != null) {  
                return hit;  
            }  
  
            T shared = remote.get(key, type);  
            if (shared != null) {  
                local.put(key, shared);  
            }  
            return shared;  
        }  
  
        @Override  
        public <T> T get(Object key, Callable<T> valueLoader) {  
            return local.get(key, () -> {  
                ValueWrapper shared = remote.get(key);  
                if (shared != null) {  
                    @SuppressWarnings("unchecked")  
                    T v = (T) shared.get();  
                    return v;  
                }  
                T loaded = valueLoader.call();  
                remote.put(key, loaded);  
                return loaded;  
            });  
        }  
  
        @Override  
        public void put(Object key, Object value) {  
            remote.put(key, value);  
            local.put(key, value);  
        }  
  
        @Override  
        public ValueWrapper putIfAbsent(Object key, Object value) {  
            ValueWrapper existing = remote.putIfAbsent(key, value);  
            if (existing == null) {  
                local.put(key, value);  
            }  
            return existing;  
        }  
  
        @Override  
        public void evict(Object key) {  
            remote.evict(key);  
            local.evict(key);  
        }  
  
        @Override  
        public void clear() {  
            remote.clear();  
            local.clear();  
        }  
    }  
}

Service logic can then target this cache manager for a local then shared read path on the same cacheNames value.

@Service  
public class CatalogService {  
  
    private final ProductClient productClient;  
  
    public CatalogService(ProductClient productClient) {  
        this.productClient = productClient;  
    }  
  
    @Cacheable(  
        cacheNames = "productById",  
        cacheManager = "tieredCacheManager",  
        sync = true  
    )  
    public Product fetchProduct(Long id) {  
        return productClient.fetchProductById(id);  
    }  
}

Flag sync = true asks Spring's cache layer to synchronize concurrent cache misses for the same identifier when the underlying cache supports it, so one thread loads the value while others wait. That option helps prevent a thundering herd of requests from all hitting the database when the first miss arrives.

Sometimes two level caches need different rules for write flows. Local caches may use short time to live values to reduce staleness risk, while the shared layer can keep data longer so that rarely accessed entries still benefit from warm cache contents. @CacheEvict and @CachePut can help coordinate changes, but making both levels react to a write usually needs a composite cache that talks to both tiers or separate eviction calls that touch each backing cache.

@Service  
public class InventoryService {  
  
    private final InventoryRepository inventoryRepository;  
  
    public InventoryService(InventoryRepository inventoryRepository) {  
        this.inventoryRepository = inventoryRepository;  
    }  
  
    @CacheEvict(  
        cacheNames = {"productById"},  
        cacheManager = "tieredCacheManager",  
        allEntries = true  
    )  
    public void deleteProduct(Long id) {  
        inventoryRepository.deleteById(id);  
    }  
}

This @CacheEvict call clears the productById cache for the current application instance so that reads on that node no longer see the deleted record. Local caches on other nodes still need time to live settings or an explicit invalidation channel if they hold the same entry in memory.

#### Routing Work For Cache Locality

Locality improves further when the same node tends to handle requests for the same group of cache identifiers. Routing rules at the edge or in a service mesh can push requests for one tenant, user, or region toward a stable subset of nodes. Those nodes then keep hot entries in their local caches, which leads to very fast reads for that slice of traffic. HTTP load balancers sometimes use cookie based affinity. Gateway adds a session cookie on the first request, then routes later requests with that cookie to the same backend node as long as it stays healthy. Spring Boot itself does not manage that routing, yet applications behind such a balancer benefit from higher cache hit rates on local caches. User specific lookups, preference records, or profile data stay in memory on the node that handles that user’s traffic.

Key based routing is another common tool for locality. Code or edge routing can hash on a tenant identifier or user identifier and send requests to a node group tied to that hash bucket. Consistent hashing libraries make that mapping stable even when nodes join or leave the cluster. Cache identifiers that include the same tenant value then tend to be served by caches that already hold related entries.

Spring WebFlux filter can tag requests with routing information based on headers, which later code can use when choosing a cache or log label.

@Component  
public class TenantTaggingFilter implements WebFilter {  
  
    @Override  
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {  
        String tenantId = exchange.getRequest()  
                                  .getHeaders()  
                                  .getFirst("X-Tenant-Id");  
  
        if (tenantId != null) {  
            exchange.getAttributes().put("tenantId", tenantId);  
        }  
  
        return chain.filter(exchange);  
    }  
}

Service methods downstream can read the tenantId attribute and include it in cache identifiers so that routing and caching line up.

Routing rules and locality do not have to be perfect. Even a partial bias where related requests land on the same small group of nodes can push hit rates up in local caches and reduce the work that falls back to the shared cache or the database.

#### Warming Caches Without Duplicate Heavy Fetches

Warm caches keep latency level during deploys, restarts, or traffic spikes. Locality aware caching pays attention to how warm up work runs so that one node does the expensive query or API call, then spreads the result to others instead of making every node pay the same cost.

Near cache preloaders help on systems that support them. Hazelcast Near Cache preloader writes the keys of Near Cache entries to disk at intervals and restores that key set when the client starts. Node that restarts after a deploy can then refill hot entries from the backing map and database by reading those keys again, which keeps frequently accessed data near the service methods that need it during rolling deploys.

Redis client side caching follows a different route. Clients keep a local cache of values fetched from Redis while subscribing to invalidation messages. Warm up routine can scan a list of popular identifiers stored in Redis or another store and read them early at startup. Client library fills both the local cache and its view of which identifiers are tracked, so later invalidations from Redis can update or evict those entries correctly.

Spring Boot services can also run scheduled jobs that load caches on purpose before real traffic faces cold start penalties. Basic scheme calls service methods that already have @Cacheable on them.

@Configuration  
@EnableScheduling  
public class SchedulingConfig {  
}  
  
@Component  
public class CacheWarmupJob {  
  
    private final CatalogService catalogService;  
  
    public CacheWarmupJob(CatalogService catalogService) {  
        this.catalogService = catalogService;  
    }  
  
    @Scheduled(fixedDelayString = "600000")  
    public void warmHotProducts() {  
        List<Long> hotProductIds = List.of(1L, 2L, 3L, 4L);  
        for (Long id : hotProductIds) {  
            catalogService.fetchProduct(id);  
        }  
    }  
}

Warm up work like this fills the tiered cache on whichever node runs the job, and other nodes can still benefit by reading from the shared layer when they miss locally.

Event driven warm up strategies avoid running heavy fetches on every node as caches refill. @EventListener delivers events inside one application context, so cross node warmup needs a shared message channel. One node can act as a loader, publish a message after a successful load, and other nodes can consume it and populate local caches from the shared cache.

@Component  
public class ProductWarmupListener {  
  
    private final CacheManager localCacheManager;  
  
    public ProductWarmupListener(CacheManager localCacheManager) {  
        this.localCacheManager = localCacheManager;  
    }  
  
    @KafkaListener(topics = "product-loaded")  
    public void handleProductLoaded(ProductLoadedMessage message) {  
        Cache cache = localCacheManager.getCache("productById");  
        if (cache != null) {  
            cache.put(message.id(), message.product());  
        }  
    }  
  
    public record ProductLoadedMessage(Long id, Product product) { }  
}

With this plan, the first node to miss pulls data from the database and publishes a product loaded message to a shared channel. Other nodes consume that message and fill their local caches from the shared cache without repeating the heavy work, which keeps total load on backing systems under control while still letting each node benefit from locality.

### Conclusion

Locality aware caching in Spring Boot clusters comes down to where data lives during a request and how nodes share the cost of loading it. Local caches in each JVM keep hot values in memory next to the code that needs them, while shared caches in Redis or Hazelcast give the cluster a common place to pick up work that has already been done. Two level cache managers, routing that steers related traffic toward the same nodes, and warmup flows that spread results through events or scheduled jobs all work on the same idea of turning one expensive fetch into many cheap reads. When those pieces line up, most lookups stay on the node that already has the data, backend systems see fewer repeated queries, and the cluster spends more time serving responses and less time waiting on slow calls.

1.  [_Spring Boot Caching Reference_](https://docs.spring.io/spring-boot/reference/io/caching.html)
2.  [_Spring Framework Cache Abstraction_](https://docs.spring.io/spring-framework/reference/integration/cache.html)
3.  [_Caffeine Cache Project_](https://github.com/ben-manes/caffeine)
4.  [_Redis Client Side Caching Guide_](https://redis.io/docs/latest/develop/reference/client-side-caching)
5.  [_Hazelcast Near Cache Overview_](https://docs.hazelcast.com/hazelcast/5.6/cluster-performance/near-cache)

**Thanks for reading! If you found this helpful, highlighting, clapping, or leaving a comment really helps me out.**

![](https://cdn-images-1.medium.com/max/276/1*7LCQHSwaBMSQIyaz83xAWg.png)

[Spring Boot](https://icons8.com/icon/90519/spring-boot) icon by [Icons8](https://icons8.com/)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=dc54a5747224)