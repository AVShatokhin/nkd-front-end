docker stop nkd-ch
docker rm nkd-ch
docker run -d --name nkd-ch --ulimit nofile=262144:262144 --volume=d:/projects/nkd-ch-database/:/var/lib/clickhouse yandex/clickhouse-server
