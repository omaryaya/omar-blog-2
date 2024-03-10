---
layout: post
title: "How to solve Leetcode Time Based Key-Value Store - Leetcode 981"
subtitle: "Clean Code Binary Search Solution in Java with detailed explanation and complexity analysis."
description: "Clean Code Binary Search Solution in Java with detailed explanation and complexity analysis."
background: '/img/posts/lc-981-time-based-key-value-store/debagni-sarkhel-GmXx2wTH0bE-unsplash.jpg'
image: '/img/posts/lc-981-time-based-key-value-store/debagni-sarkhel-GmXx2wTH0bE-unsplash.jpg'
---
# Content
{:.no_toc}
* Table of Contents
{:toc}

## Intro
If you are not familiar with this problem already, please check it out ->  [LeetCode-981. Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/).

Let's dive in!

## Problem Description

Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.

Implement the `TimeMap` class:

- `TimeMap()` Initializes the object of the data structure.
- `void set(String key, String value, int timestamp)` Stores the key key with the value value at the given time timestamp.
- `String get(String key, int timestamp)` Returns a value such that set was called previously, with timestamp_prev <= timestamp. If there are multiple such values, it returns the value associated with the largest timestamp_prev. If there are no values, it returns "".


# Intuition

In the Java world, the way I would think about solving this problem is a 3-Dimensional Map. We not only need to keep a key-value pair, we also need to track it versus time.

The key does not change with time, but the value does. So we need to have a list of values for a given key at different timestamps.

### Real-world example
This could be a very good application for a weather app. The key would be the city name, and the values would be the temperature on a given day.

Example:
```
set("berlin", "15", 1);
set("paris", "17", 1);
set("london", "9", 2);
set("paris", "19", 2);
get("berlin", 1); // get weather for Berlin @ 1 = {"15"}
set("paris", "12", 6);
get("paris", 3); // no value for Paris @ 3, closest is @ 2 ={"19"}
set("berlin", "17", 2);
set("london", "10", 4);
get("london", 10); // no value for London @ 10, closest is @ 4 ={"10"}
set("london", "3", 5);
```

According to the problem description, `get()` should return "***a value such that set was called previously, with timestamp_prev <= timestamp***", which is why we returned the value @ 2 for Paris and @ 4 for London.

# Approach
<!-- Describe your approach to solving the problem. -->
### Non-optimized
We will create a Map whose key is city name and its value is a List containing the pair of value & timestamp. With each `get()` call, we loop through all the values for the given key, until we get the one at the closest timestamp.

`Map<String, List<Pair<Integer, String>>> lookup;`

With every `get()` call, we will go through all the timestamps, so the time complexity will be O(n) where `n` is the number of values for a given key.

## Optimized
However, if we sort those values based on their timestamps, we could easily perform binary search, so the complexity becomes O(`log(n)`).

The preferred data structure in Java for binary search is the `TreeMap`. So our `lookup` will become:

`Map<String, TreeMap<Integer, String>> lookup;`

#### What happens when `set()` is called?
- Get the sorted list of values for a given key with their corresponding timestamps
- Add a new entry to the sorted list
- Update the `lookup` table with the new data


#### What happens when `get()` is called?
- Get the sorted list of values for a given key if it exists in the `lookup` table
- Perform a binary search to find the closest timestamp
- Return the value at the closest timestamp
- If no value is found, return an empty string


# Complexity
- Time complexity:
  O(1) to get the key from the map (in our example, city), then O(`log(n)`) to get the value at a given timestamp.

So overall time complexity is O(`log(n)`).

- Space complexity:
  We are not using any "EXTRA" space. The data is stored in the same object that we query, so the space complexity is O(1).

# Code
```java
class TimeMap {

    Map<String, TreeMap<Integer, String>> lookup;
    
    public TimeMap() {
        lookup = new HashMap<>();
    }
    
    
    public void set(String key, String value, int timestamp) {
        TreeMap<Integer, String> sortedValuesForKey = lookup.getOrDefault(key, new TreeMap<>());
        sortedValuesForKey.put(timestamp, value);
        lookup.put(key, sortedValuesForKey);
    }

    public String get(String key, int timestamp) {
        if(!lookup.containsKey(key)) return "";
        
        TreeMap<Integer, String> sortedValuesForKey = lookup.get(key);
        Integer closestTimestamp = sortedValuesForKey.floorKey(timestamp);
        
        if(closestTimestamp == null) return "";

        return sortedValuesForKey.getOrDefault(closestTimestamp, "");
    }
}
```

I hope you enjoyed this post.

Let me know what you'd like me to talk about in future articles by [tweeting me](https://twitter.com/omaryayaa)