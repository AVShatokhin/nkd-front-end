docker stop nkd-redis
docker rm nkd-redis
docker run --name nkd-redis -d -p 6379:6379 -v d:/projects/nkd-front-end/dockers/redis:/usr/local/etc/redis redis:latest /usr/local/etc/redis/redis.conf