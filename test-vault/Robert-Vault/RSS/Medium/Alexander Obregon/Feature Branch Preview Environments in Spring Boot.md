---
title: Feature Branch Preview Environments in Spring Boot
link: "https://medium.com/@AlexanderObregon/feature-branch-preview-environments-in-spring-boot-a7a7bf3c1a06?source=rss-4f9731d3205------2"
author: Alexander Obregon
publish_date: "2026-01-16 18:02:43"
saved_date: "2026-01-17 15:09:42"
image: "https://cdn-images-1.medium.com/max/900/1*o5FmjKTPdJTbhGE2MIjo6w.jpeg"
tags: null
article_processed: true
---

![image](https://cdn-images-1.medium.com/max/900/1*o5FmjKTPdJTbhGE2MIjo6w.jpeg)

![](https://cdn-images-1.medium.com/max/900/1*o5FmjKTPdJTbhGE2MIjo6w.jpeg)

[Image Source](https://spring.io/projects/spring-boot)

Giving each feature branch its own short-lived backend instance lets reviewers click through real screens, call real APIs, and catch integration problems early in the lifecycle. Instead of everyone pushing changes into a single shared staging server, every pull request triggers automation that builds a Spring Boot image from that branch, deploys it to an isolated environment, and connects it to database resources reserved for that preview so behavior stays tied to one set of changes. That arrangement keeps configuration, dependencies, and schema updates aligned with the feature under review, while URLs and credentials are generated on demand so product owners, QA, and developers can test, gather feedback, and verify integrations in a browser before any merge to long lived environments.

_I publish free articles like this daily, if you want to support my work and get access to exclusive content and weekly recaps, consider subscribing to my_ [_Substack_](https://alexanderobregon.substack.com/)_._

### What Feature Branch Preview Environments Do

Preview environments sit between a developer workstation and shared staging and give every feature branch its own isolated stack. Instead of pushing many branches into one shared test server, each branch leads to a dedicated copy of the Spring Boot service with its own container image, deployment entry in the orchestrator, and configuration that points at separate database schemas or database instances. That layout keeps data produced by one branch from leaking into tests for another branch and helps reviewers connect behavior directly to the code under review.

These environments follow the same lifecycle as the branch that created them. When a developer opens a branch or a pull request, automation builds a new image, pushes it to a registry, and starts a deployment in the shared cluster for that branch alone. When the branch receives more commits, the same chain of actions rebuilds and redeploys the preview so testers always see the latest version of that feature. When the branch closes, the system tears down the deployment, routes, and supporting infrastructure so capacity returns to the pool for future work.

From a reviewer’s point of view, the result is a dedicated URL for that branch that connects a frontend or API client to a real backend running the code under test. Login flows, data entry, and integration points with message brokers or caches all run against that branch instance. That makes it much easier to trace a bug report back to a specific commit in the feature branch, because no other branches share the same process or database schema.

#### Typical Workflow From Commit To Preview

Feature branch previews follow a repeatable path from source control to a running Spring Boot service. Developers push commits to branches in Git or create pull requests that target the main line of development. The continuous integration service detects that event and starts a build that compiles the Spring Boot project, runs tests, and produces a JAR or directly builds a container image. That image is tagged with branch metadata, such as the branch name and commit hash, then stored in a container registry.

After the image is available, deployment automation reads the branch information and decides how to map it to an environment name, namespace, and host name. Many setups create a namespace in Kubernetes that matches a normalized branch name, then create a deployment and service in that namespace for the preview. The system also prepares configuration and credentials, so the branch instance has its own datasource, queues, and secrets. When those resources come online, an ingress or load balancer entry ties a host name to that preview deployment and the environment becomes ready for review.

Status feedback flows back into the pull request. The Git provider can display checks that report on build success, test results, and the URL of the preview environment. Reviewers open that URL to run through feature flows, while logs and metrics from the preview instance feed into the same observability stack that serves staging and production. This gives engineers a place to look at request traces, SQL queries, and JVM metrics for that specific branch before any merge.

Something that shows up early in many projects is the need for consistent naming rules across systems. Registries, clusters, and DNS services handle different character sets and length limits, so branch names from Git cannot always be used directly as namespace names or host names. A small utility helps apply the same transformation from Git branch names to environment identifiers across every part of the toolchain.

Take this helper for preview environment names based on branch names:

import java.util.Locale;  
  
public final class PreviewEnvNames {  
  
    private static final int DNS\_LABEL\_MAX = 63;  
  
    private PreviewEnvNames() {  
    }  
  
    public static String environmentNameForBranch(String branchName) {  
        if (branchName == null) {  
            branchName = "";  
        }  
  
        String normalized = branchName  
                .toLowerCase(Locale.ROOT)  
                .replaceAll("\[^a-z0-9-\]", "-")  
                .replaceAll("-{2,}", "-")  
                .replaceAll("^-+", "")  
                .replaceAll("-+$", "");  
  
        if (normalized.isEmpty()) {  
            return "preview";  
        }  
  
        String result = "preview-" + normalized;  
  
        if (result.length() > DNS\_LABEL\_MAX) {  
            result = result.substring(0, DNS\_LABEL\_MAX);  
            result = result.replaceAll("-+$", "");  
        }  
  
        return result;  
    }  
}

This helper keeps the format of environment names consistent across deployments, monitoring dashboards, and registry tags, which makes it easier to connect logs and metrics back to the branch that produced them. A Git hook, deployment script, or CI job can call this utility or apply the same transformation rules so that names stay in sync in every system that needs them.

#### Core Building Blocks In A Spring Boot Context

Spring Boot fits preview environments well because configuration, health checks, and startup behavior can all be steered by external input such as environment variables and profile flags. Preview instances usually run in a container that holds the same JAR built from the feature branch as any other environment, and the differences come from configuration, secrets, and connected services. That lets the preview match production behavior closely while still giving every branch its own space.

Profiles provide one of the basic tools for this structure. Many projects keep dev, test, and prod profiles and add a dedicated preview profile for feature branches. The preview profile can use connection strings that target branch specific schemas, sampling rules for logging that make it easier to trace requests, and security settings that allow test credentials but still keep data isolated from staging and production.

Lets look at a example configuration for a preview profile in a Spring Boot properties file:

spring.profiles.active=preview  
  
spring.datasource.url=jdbc:postgresql://${DB\_HOST}:${DB\_PORT}/${DB\_NAME}  
spring.datasource.username=${DB\_USER}  
spring.datasource.password=${DB\_PASS}  
  
management.endpoints.web.exposure.include=health,info,metrics  
management.endpoint.health.probes.enabled=true  
  
logging.level.root=INFO  
logging.level.com.example.preview=DEBUG

This configuration connects the preview instance to a PostgreSQL database whose host, port, and name come from environment variables, so the deployment system can pick different values for each branch. Actuator endpoints provide health, info, and metrics data that monitoring dashboards can scrape for that preview environment, while logging levels give extra detail on application specific code without overwhelming log storage.

Branch specific metadata can also be surfaced through a lightweight controller so testers and developers see which build and configuration they are talking to. That reduces confusion when several previews exist for similar features or bug fixes.

Now, lets look at this controller for exposing preview environment metadata:

@RestController  
@RequestMapping("/preview-info")  
public class PreviewInfoController {  
  
    @Value("${spring.profiles.active:unknown}")  
    private String activeProfile;  
  
    @Value("${PREVIEW\_ENV\_NAME:local}")  
    private String previewEnvName;  
  
    @Value("${GIT\_COMMIT\_SHA:unknown}")  
    private String gitCommitSha;  
  
    @GetMapping  
    public Map<String, String> info() {  
        Map<String, String> result = new HashMap<>();  
        result.put("profile", activeProfile);  
        result.put("environment", previewEnvName);  
        result.put("commit", gitCommitSha);  
        return result;  
    }  
}

This endpoint lets a reviewer or QA engineer confirm that a browser session or API client talks to the correct preview instance, with a direct link back to the Git commit and active profile. API tests and frontend tests can call this endpoint at the start of a run and record the values so any future bug report has exact details about the code that produced it.

Database migrations tie into this scheme as well. Tools such as Flyway or Liquibase work well with preview environments, because each branch can apply schema changes to its own database or schema without disturbing other branches. A migration job runs against the DB\_NAME value specific to that preview and logs appear in the same observability stack as the application logs, which helps engineers trace any schema related issues that show up during review.

Spring Boot also integrates with container lifecycles in a predictable way, so readiness and liveness probes on preview pods can lean on Actuator health checks. That makes it easier for the orchestrator to decide when a preview instance is ready for traffic and when it should be restarted, which keeps branch specific environments stable enough for testers to run through their scenarios.

### Setting Up Preview Environments For Spring Boot

Most Spring Boot feature branch previews run on a stack that combines Spring Boot 3, Java 17 or 21, container images, Kubernetes, and a continuous integration service such as GitHub Actions or GitLab CI. The same delivery pipeline that promotes artifacts to staging or production can drive these branch environments, with branch names, commit identifiers, and environment specific configuration passed in as parameters.

That arrangement keeps the delivery model consistent. Source code in Git moves through a build, produces an artifact and container image, then lands in a runtime environment. For preview environments, the runtime is shorter lived and tied to one branch, but the steps in the chain match what happens for long lived environments, which makes behavior easier to reason about for developers and operations staff.

#### Containerizing The Spring Boot Service

Preview environments work best when the Spring Boot service is packaged in a way that can run many copies side by side. Container images fit that need, because containers run predictably across developer machines, shared preview clusters, and production clusters and can be tagged per branch in a registry.

Many Spring Boot projects built with Maven rely on a two stage Dockerfile so that compilation happens in one image and the final runtime image stays smaller and focused on running the application.

Take this Dockerfile layout for a Spring Boot preview image:

\# Build stage  
FROM eclipse-temurin:21-jdk AS build  
WORKDIR /workspace  
  
COPY mvnw .  
COPY .mvn .mvn  
COPY pom.xml .  
RUN ./mvnw dependency:go-offline  
  
COPY src src  
RUN ./mvnw -DskipTests package  
  
\# Runtime stage  
FROM eclipse-temurin:21-jre  
WORKDIR /app  
  
COPY --from=build /workspace/target/app-0.0.1-SNAPSHOT.jar app.jar  
  
ENV SPRING\_PROFILES\_ACTIVE=preview  
EXPOSE 8080  
ENTRYPOINT \["java", "-jar", "app.jar"\]

This Dockerfile compiles the application with a JDK image, copies the resulting JAR into a smaller JRE image, sets SPRING\_PROFILES\_ACTIVE to preview, and exposes port 8080. CI jobs can pass different tags for the image name so that each branch receives its own image entry in the registry while still following this layout.

Some developers prefer to rely on Spring Boot’s spring-boot-maven-plugin and bootBuildImage support so that Cloud Native Buildpacks handle image creation. That removes the Dockerfile from the project and shifts base image management into the buildpack stack.

Here is a Maven configuration for bootBuildImage in a preview scenario:

<build>  
    <plugins>  
        <plugin>  
            <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-maven-plugin</artifactId>  
            <configuration>  
                <image>  
                    <name>ghcr.io/my-org/my-app:${docker.image.tag}</name>  
                </image>  
            </configuration>  
        </plugin>  
    </plugins>  
</build>

That configuration lets the CI job set docker.image.tag from a branch slug or pull request number, and the plugin produces a container image with the tag attached, ready to be pulled by the preview deployment.

Spring Boot properties round out this setup by steering connections and behavior from the environment. A single JAR can use JDBC URLs, credentials, ports, and feature flags supplied through environment variables, which makes it natural to vary behavior per branch without code changes.

#### Automating Preview Builds In CI

Preview environments become practical when builds and deployments run automatically based on branch activity in Git. Continuous integration services watch repository events, run builds, and pass branch specific metadata into later steps that build images and deploy to the cluster.

GitHub Actions provides an event model that works well here. Pull request events can trigger a job that compiles the Spring Boot project, runs tests, builds a container image tagged with the branch name, and pushes that image to a container registry so that later deployment jobs can pull it.

Take this GitHub Actions workflow for preview image builds:

name: Preview Environment  
  
on:  
  pull\_request:  
    types: \[opened, synchronize, reopened\]  
  
jobs:  
  build-and-publish:  
    runs-on: ubuntu-latest  
  
    env:  
      IMAGE\_NAME: ghcr.io/my-org/my-app  
  
    steps:  
      - name: Checkout source  
        uses: actions/checkout@v4  
  
      - name: Set up JDK  
        uses: actions/setup-java@v4  
        with:  
          distribution: temurin  
          java-version: '21'  
  
      - name: Build application  
        run: ./mvnw package  
  
      - name: Build image  
        run: |  
          BRANCH\_SLUG=$(echo "${GITHUB\_HEAD\_REF}" \\  
            | sed 's/\[^A-Za-z0-9\_.-\]/-/g' \\  
            | sed 's/^\[.-\]\\+//;s/\[.-\]\\+$//' \\  
            | cut -c1-128)  
          docker build \\  
            -t "${IMAGE\_NAME}:${BRANCH\_SLUG}" .  
  
      - name: Push image  
        run: |  
          BRANCH\_SLUG=$(echo "${GITHUB\_HEAD\_REF}" \\  
            | sed 's/\[^A-Za-z0-9\_.-\]/-/g' \\  
            | sed 's/^\[.-\]\\+//;s/\[.-\]\\+$//' \\  
            | cut -c1-128)  
          echo "${{ secrets.GHCR\_TOKEN }}" \\  
            | docker login ghcr.io -u my-org --password-stdin  
          docker push "${IMAGE\_NAME}:${BRANCH\_SLUG}"

This workflow reads source code from the branch, compiles it with Maven, builds a Docker image, and tags the image with a branch slug that replaces slashes with dashes. After the push step finishes, a separate stage or job can apply Kubernetes manifests that reference that tag, creating or updating the preview environment for that branch.

Teardown fits into CI as well. A second workflow can trigger when the pull request closes, calling a script that removes the preview namespace, ingress rules, and any branch specific database schemas. That keeps the cluster from keeping discarded previews and data around for long periods after the branch merges.

Build metadata from the CI system is also helpful inside the running Spring Boot service. Environment variables can hold the commit SHA, preview environment name, and pull request number, so that a status endpoint can report details about the running build.

The deployment manifest can pull values from CI variables so the container starts with build metadata in its environment:

env:  
  - name: GIT\_COMMIT\_SHA  
    value: "${GIT\_COMMIT\_SHA}"  
  - name: PREVIEW\_ENV\_NAME  
    value: "${PREVIEW\_ENV\_NAME}"  
  - name: SPRING\_PROFILES\_ACTIVE  
    value: "preview"

Application code that reads these values can return them from a small controller, which gives testers and developers an easy way to see which commit and preview environment handled a request when a bug appears in a branch environment.

#### Provisioning Per Branch Infrastructure

Short lived environments that match feature branches need more than a container and an image tag. Each preview usually receives a slice of the surrounding infrastructure so that its traffic, data, logs, and metrics remain separate from other branches.

Kubernetes namespaces provide a useful grouping point for that work. Namespaces can isolate deployments, services, secrets, config maps, and ingress definitions in a way that makes creation and deletion manageable. A naming rule that combines a prefix with a normalized branch name helps keep those namespaces easy to match with branch names.

Database resources add another layer of isolation. Some setups create full managed database instances for each branch through services such as Amazon RDS or Cloud SQL. Other setups share a database server and assign one schema per preview. Both strategies pursue the same goal, which is to let a preview environment create, update, and delete data without interfering with data for other branches or long lived environments.

Spring Boot works with either layout through its datasource configuration and migration support. Flyway or Liquibase migrations can run against the schema assigned to the preview, where the JDBC URL for that branch references a schema or database name constructed from the preview environment name.

Database URLs can also carry preview identifiers by building the database name from the environment name and a short prefix:

spring.datasource.url=jdbc:postgresql://${DB\_HOST}:5432/app\_${PREVIEW\_ENV\_NAME}  
spring.datasource.username=${DB\_USER}  
spring.datasource.password=${DB\_PASS}

This configuration line builds the database name from a prefix and the preview environment name, which makes it easier to match database instances or schemas to namespaces and image tags when it is time to remove them.

Routing ties HTTP traffic to the correct branch instance. In Kubernetes, ingress controllers map host names to services. Preview creation steps can add an ingress entry pointing a host such as login-feature.preview.example.com to the service in the branch namespace. A DNS controller such as ExternalDNS can watch these ingress objects and create DNS records so the host names resolve on the network used by reviewers.

Shared infrastructure such as Kafka clusters or Redis instances can also be partitioned logically by prefixing topic names, queue names, or cache keys with the preview environment name. That way multiple preview environments share the same backing service process but still have isolated data streams.

Kafka topics can use the preview environment name as a prefix so each branch writes to its own set of topics:

app.kafka.topic-prefix=${PREVIEW\_ENV\_NAME}  
app.kafka.orders-topic=${app.kafka.topic-prefix}.orders

This property layout turns PREVIEW\_ENV\_NAME into a prefix on topic names so that orders traffic from one branch stays separate from orders traffic in other previews or long lived environments.

Teardown flows mirror creation flows and usually run from the same CI service. When a branch closes or a pull request merges, an automation step can delete the namespace, drop the database schema or managed instance tied to that preview, remove ingress entries, and let DNS records expire or be removed. Some clusters also run scheduled jobs that look for namespaces or schemas that have not seen recent activity and remove those, so that unused previews do not occupy capacity for long.

### Conclusion

Feature branch preview environments for Spring Boot apps turn Git events into short lived, branch specific backends that testers and reviewers can exercise through real HTTP traffic. Builds in CI produce container images, Kubernetes namespaces host isolated deployments, and configuration plugs in branch specific database schemas, queues, and routing so behavior stays tied to the code under review. With that pipeline in place, every pull request gets a reproducible environment for experiments and bug reports, while teardown jobs reclaim namespaces and data stores when work merges, keeping the setup practical for day to day use.

1.  [_Spring Boot Reference Documentation_](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
2.  [_Spring Boot Actuator Documentation_](https://docs.spring.io/spring-boot/docs/2.0.x/actuator-api/html/)
3.  [_Spring Boot Maven Plugin Reference_](https://docs.spring.io/spring-boot/docs/3.1.3/maven-plugin/reference/htmlsingle/)
4.  [_GitHub Actions Documentation_](https://docs.github.com/en/actions)
5.  [_Kubernetes Namespaces Guide_](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
6.  [_Dockerfile Reference_](https://docs.docker.com/reference/dockerfile/)
7.  [_Redgate Flyway Documentation_](https://documentation.red-gate.com/fd)
8.  [_Liquibase Migration Documentation_](https://docs.liquibase.com/)
9.  [_Cloud Native Buildpacks Documentation_](https://buildpacks.io/docs/)

**Thanks for reading! If you found this helpful, highlighting, clapping, or leaving a comment really helps me out.**

![](https://cdn-images-1.medium.com/max/276/1*7LCQHSwaBMSQIyaz83xAWg.png)

[Spring Boot](https://icons8.com/icon/90519/spring-boot) icon by [Icons8](https://icons8.com/)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=a7a7bf3c1a06)