---
layout: post
title: "How to Use OpenFeign to Call External APIs in Java"
subtitle: "Communicate with RESTful APIs with simple functional interfaces"
background: '/img/posts/mongock-nosql-changelogs/markus-spiske-Skf7HxARcoc-unsplash.jpg'
---
# Content
{:.no_toc}
* Table of Contents
{:toc}

<br />

## Intro
If you are lucky enough to work in a microservices-based environment, you will come across the need to communicate with internal or external services using RESTful APIs. This article will introduce you to [OpenFeign](https://spring.io/projects/spring-cloud-openfeign) and how to use it efficiently.

## Prerequisites & Who This Article is For
This article is for beginner to intermediate developers who have a basic understanding of Java and Spring Boot.


## What we will do
We will create an app that queries [Shazam](https://shazam.com) for our favorite artists (in this article, Coldplay) through [RapidAPI](https://rapidapi.com) and display their top songs.

_Note: If you already have the APIs that you need to call, you can skip to [Step 3](#step-3-configure-your-application)._


## Step 1: Create Spring Project
- Go to start.spring.io and create a new Spring Boot project.
- Select the following configurations:
![Spring Initializr Configuration](/img/posts/openfeign-part-1/spring_initializr.png)


- Here's how your `build.gradle` dependencies should look like:

```gradle
dependencies {
	implementation 'org.springframework.cloud:spring-cloud-starter-openfeign'
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

- Build & Run your project.
    
```bash
gradle bootRun
```
or
```bash
./gradlew bootRun
```


- You should see the following output:
![App Running](/img/posts/openfeign-part-1/app_started.png)

## Step 2: Sign Up for RapidAPI
This step is optional. If you already have an account, or if your external API is ready, you can skip this step.

- Go to rapidapi.com and sign up for an account.
- Visit the [Shazam API page](https://rapidapi.com/apidojo/api/shazam/)
- Copy the following fields:
```
'X-RapidAPI-Host'
'X-RapidAPI-Key'
```
![RapidAPI](/img/posts/openfeign-part-1/rapidapi.png)


## Step 3: Configure Your Application

In order to be able to use OpenFeign in our project, we will need to use the `@EnableFeignClients` annotation.
Your Main class should look like this:

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class OpenfeigndemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(OpenfeigndemoApplication.class, args);
	}

}
```


## Step 4: Call Your APIs
Great! Now the project is set up and we can start creating the Feign Clients to call the external API.

- Create a package under `src/main/java/com/omaryaya/openfeigndemo` called `feign_clients`.
- Create a interface called `ShazamClient` with the following structure:

```java
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "shazam-api")
public interface ShazamProxy {
}
```

- As you recall from step 2, the external API we are trying to call uses GET with the following attributes:
``` json
{
  "method": "GET",
  "url": "https://shazam.p.rapidapi.com/search",
  "params": {
    "term": "Coldplay",
    "offset": "0",
    "limit": "10"
  },
  "headers": {
    "X-RapidAPI-Host": "shazam-api.p.rapidapi.com",
    "X-RapidAPI-Key": "YOUR_API_KEY"
  }
}
```

So here's the corresponding FeignClient configuration:
```java
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@FeignClient(name = "shazam-client", url = "https://shazam.p.rapidapi.com/search")
public interface ShazamClient {
    
    String API_KEY_HEADER = "X-RapidAPI-Key";
    String API_HOST_HEADER = "X-RapidAPI-Host";
    String API_KEY = "YOUR_API_KEY"; // <-- replace with your API key

    @GetMapping("/shazam/search")
    String search(@RequestHeader(value = API_HOST_HEADER) String apiHostHeader,
                  @RequestHeader(value = API_KEY_HEADER) String apiKeyHeader,
                  @RequestParam("params") Map<String, String> params);
}
```

- Now that your Feign client has been configured, we need to call it using 

## Step 5: Print Your Results

<br />
<br />

Please feel free to tweet me [@OmarYayaa](https://twitter.com/OmarYayaa) if you have any questions.