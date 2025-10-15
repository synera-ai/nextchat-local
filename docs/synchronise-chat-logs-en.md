# Synchronize Chat Logs

## Prerequisites
- GitHub account
- Your own ChatGPT-Next-Web server setup
- [UpStash](https://upstash.com)

## Getting Started
1. Register for an UpStash account
2. Create a database

    ![Register and Login](./images/upstash-1.png)

    ![Create Database](./images/upstash-2.png)

    ![Select Server](./images/upstash-3.png)

3. Find the REST API, copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (⚠Important⚠: Don't leak the Token!)

   ![Copy](./images/upstash-4.png)

4. Copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your sync configuration, click **Check Availability**

    ![Sync 1](./images/upstash-5.png)

    If everything is fine, then it's successful

    ![Sync availability check completed](./images/upstash-6.png)

5. Success! 

   ![Great job~!](./images/upstash-7.png)