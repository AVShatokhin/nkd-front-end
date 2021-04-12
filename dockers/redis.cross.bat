docker rm nkd-redis
docker run --name nkd-redis -d -p 6379:6379 redis