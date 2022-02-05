---
layout: post
title: "5 steps to Use Mongock for MongoDB Changelogs"
subtitle: "Powerful Java Tool for Microservices & Distributed Environments NoSQL Data Migrations"
background: '/img/posts/mongock-nosql-changelogs/markus-spiske-Skf7HxARcoc-unsplash.jpg'
---
# Content
{:.no_toc}
* Table of Contents
{:toc}

<br />

## Intro
If you find yourself often having to run scripts on your MongoDB to keep your data in sync, this article might be for you. We will talk about [Mongock](https://mongock.io/), a Java-based migration tool as *part of your application code* for Distributed environments (Source: [Official Mongock Docs](https://docs.mongock.io/)). I will go through how to set up & configure Mongock to run at startup with your SpringBoot app.

## Prerequisites & Who This Article is For
I recommend having a Java Spring Boot app that connects to MongoDB up & running to get the best out of this tutorial.

This article is for you if:
- Your app is built with Java, Spring, & Mongodb.  
- You want to migrate data in a distributed environment and/or microservices architecture.


## What we will do
We will work on a demo application to migrate your users' data to support new fields. Assume you had an application that had the following `Users` table structure:

```javascript
{
    "_id": "ObjectID()"
    "username": "johndoe",
    "fullName": "John Doe",
    "dob" : "1990-01-01",
    "..."
}
```

Now you want to add `firstName` and `lastName` fields to your object model for personalization. We will write a utility method to generate `firstName` and `lastName` based on the user's `fullName`, so our object model will look like this:

```java
class User {
    private Long id;
    private String username;
    private String fullName;
    private String firstName;
    private String lastName;
    private Date dob;

    // ...
}
```

For simplicity, we will ignore users who had multiple spaces in their name and would only focus on full names formatted as "**_FirstName LastName_**". Of course, you'll need to take into account the different formats for the data you want to migrate. 


## Step 1: Configurations

- Go to your `build.gradle` file and add the following lines to include Mongock in your app:


_Note: The latest Mongock version when writing this article was `"5.0.32"`. Feel free to use later versions if this one seems outdated._

```gradle
implementation "io.mongock:mongock:5.0.32"
implementation "io.mongock:mongock-springboot:5.0.32"
implementation "io.mongock:mongodb-springdata-v3-driver:5.0.32"
```

- Go to your app's main class (e.g., `SpringApplication.java`) and enable Mongock

```java
import io.mongock.runner.springboot.EnableMongock;
// ... Your Imports

@SpringBootApplication
@EnableMongock  // <---- Add this line
public class SpringApplication implements CommandLineRunner {
    // Do your magic
}
```

## Step 2: Create Changelogs Directory

Create a folder in your app directory to include the changelog classes (e.g., `com.demo.app.changelogs`)

## Step 3: App Startup Scan

You need to tell your application to scan the directory created in [Step 2](#step-2-create-changelogs-directory) at startup. To do so, head to your **`application.yaml`** (or **`application.properties`**) file and add the following:

`application.yaml`
```yml
# mongock
mongock:
  migration-scan-package: com.demo.app.changelogs 
```
Alternatively, `application.properties`
```properties
# mongock
mongock.migration-scan-package='com.demo.app.changelogs'
```

## Step 4: Migration Code


We will create a class called `FirstLastNameChangelog.java` in the directory we created in [Step 2](#step-2-create-changelogs-directory). This class will include the business logic necessary to fill the `firstName` & `lastName` fields in the `User.java` class. Here is our algorithm:

1. Count the total number of users at the beginning of execution
2. Fetch users in batches (e.g., limit 100)
3. For each batch:
   1. For each user in the batch:
      1. Compute the `firstName` and `lastName` properties from the `fullName` property by using `String.split()`
      2. Set the fields in the User object.
      3. Persist the object to the database.
      4. Increment successful count or log errors/exceptions.
4. Log the number of successful updates & compare it with the expected number calculated in step 1.

```java
import io.mongock.api.annotations.ChangeUnit;
import io.mongock.api.annotations.Execution;
import io.mongock.api.annotations.RollbackExecution;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.data.mongodb.core.query.Criteria.where;


@ChangeUnit(id="FirstLastNameChangelog", order = "1", author = "omaryaya")
public class FirstLastNameChangelog {

    Logger logger = LoggerFactory.getLogger(FirstLastNameChangelog.class);
    AtomicInteger successfulUserUpdatesCounter = new AtomicInteger();

    @Execution
    public void setFirstAndLastNameToUsers(MongoTemplate mongoTemplate) {
        Query query = new Query(
            where("fullName").ne(null)
            .andOperator(where("firstName").is(null),
                         where("lastName").is(null))
        );

        query.fields().include("_id", "fullName");

        long usersWithoutFirstAndLastName = mongoTemplate.count(query, User.class);
        query.limit(100); // set after counting all users to avoid always getting 100 as the maximum number of users


        List<User> users = mongoTemplate.find(query, User.class);
        while(users != null || users.getSize() != 0) {
            users.forEach(user -> {
                try {
                    Criteria criteria = where("_id").is(user.getId());
                    setNamesForUser(user);
                    String[] names = splitNamesForUser(user);
                    String firstName = names[0], lastName = names[1];
                    Update update = new Update()
                                        .set("firstName", firstName)
                                        .set("lastName", lastName);
                    mongoTemplate.findAndModify(new Query(criteria), update, User.class);
                    successfulUserUpdatesCounter.getAndIncrement();
                } catch (Exception ex) {
                    logger.error(String.format("Faield to set firstName & lastName for user with id %s", user.getId()), ex);
                }
            });

            users = mongoTemplate.find(query, User.class);
        }

        logger.info("First and last names set for {} users out of {} total.", successfulUserUpdatesCounter,  usersWithoutFirstAndLastName);

    }

    private String[] splitNamesForUser(User user) {
        if(user.getFullName() == null || user.getFullName().isEmpty() || !user.getFullName().contains(" ")) {
            throw new ParseNameException("Failed to parse the user's name");
        }
        return user.getFullName().split(" ");
    }

    @RollbackExecution
    public void rollback() {
        // Our change is backward-compatible; we don't need to implement a rollback mechanism.
    }

}

```

## Step 5: Validate
Congratulations, the changelog is done! When you run your application, Mongock will run at startup & will update your Users table. Check your database to ensure that the `firstName` and `lastName` properties have been filled, and check your application logs to see how many users have been successfully updated.


<br />
<br />

Please feel free to tweet me [@OmarYayaa](https://twitter.com/OmarYayaa) if you have any questions.