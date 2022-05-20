---
layout: post
title: "How to Use OpenFeign to Call External APIs in Java"
subtitle: "Communicate with RESTful APIs with simple functional interfaces"
background: '/img/posts/openfeign-part-1/background-travis-yewell-unsplash.jpg'
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
- Go to [start.spring.io](https://start.spring.io) and create a new Spring Boot project.
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

- Go to [rapidapi.com](https://rapidapi.com) and sign up for an account.
- Visit the [Shazam API page](https://rapidapi.com/apidojo/api/shazam/)
- Subscribe to the API
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


## Step 4: Configure your OpenFeign Client
Great! Now the project is set up and we can start creating the Feign Clients to call the external API.

- Create a package under `src/main/java/com/omaryaya/openfeigndemo` called `feign_clients`.
- Create a interface called `ShazamClient`.

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


@FeignClient(name = "shazam-client", url = "https://shazam.p.rapidapi.com")
public interface ShazamClient {

    String API_HOST_HEADER_NAME = "X-RapidAPI-Host";
    String API_KEY_HEADER_NAME = "X-RapidAPI-Key";

    @GetMapping("/search")
    Map<String, Object> search(@RequestHeader(name = API_HOST_HEADER_NAME) String apiHostHeader,
                  @RequestHeader(name = API_KEY_HEADER_NAME) String apiKeyHeader,
                  @RequestParam("params") Map<String, String> params);
```

- Now that your Feign client has been configured, we need to write the API that will call the Shazam OpenFeign client & retrieve results.

## Step 5: Write our API & Service logic
So far, we configured our application to be able to call Shazam API through RapidAPI to retrieve top songs of our favorite artist. However, we have not invoked the API yet. In this step, we'll create an API endpoint that takes the artist name as query parameter and returns their top songs.

### Create MusicService.java

- Under the root package, create a `src/main/java/com/omaryaya/openfeigndemo/services` directory.
- Create a `MusicService.java` file under `services` and add the following code:

```java
import com.omaryaya.openfeigndemo.feign_clients.ShazamClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MusicService {

    private static final String API_HOST_HEADER_VALUE = "shazam.p.rapidapi.com"; // <-- Or replace with your host name
    private static final String API_KEY = "YOUR_API_KEY"; // <-- replace with your API key

    @Autowired
    private ShazamClient shazamClient;

    public Map<String, Object> retrieveTopSongs(String artist) {
        Map<String, String> params = new HashMap<>();
        // fill default values
        params.put("offset", "0");
        params.put("limit", "10");

        // add artist
        params.put("term", artist);

        // Call Shazam API
        return shazamClient.search(API_HOST_HEADER_VALUE, API_KEY, params);
    }
}
```

### Create MusicController.java

- Under the root package, create a `src/main/java/com/omaryaya/openfeigndemo/controllers` directory.
- Create a `MusicController.java` file under `src/main/java/com/omaryaya/openfeigndemo/controllers` and add the following code:

```java
import com.omaryaya.openfeigndemo.service.MusicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/music")
public class MusicController {

    @Autowired
    private MusicService musicService;

    @GetMapping("")
    public Map<String, Object> getMusic(@RequestParam String artist) {
        return musicService.retrieveTopSongs(artist);
    }
}
```

### Rerun your application
```bash
gradle bootRun
```
or
```bash
./gradlew bootRun
```

## Step 5: View Your Results
To call our API & supply our artist name, we will use Postman. Here is how typical request & response should look like:
![Postman Configuration](/img/posts/openfeign-part-1/postman-req-res.png)
*Postman Request & Response Example*


*Bonus: You can try to use different terms to retrieve different results, or play around with API parameters to get more/less hits.*

<br />
<br />

Please feel free to tweet me [@OmarYayaa](https://twitter.com/OmarYayaa) if you have any questions.