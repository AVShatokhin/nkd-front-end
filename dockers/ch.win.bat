docker stop nkd-ch
docker rm nkd-ch
docker run -d --name nkd-ch --ulimit nofile=262144:262144 -v d:/projects/nkd-front-end/dockers/ch.etc:/etc/clickhouse-server/ --volume=d:/projects/nkd-ch-database/:/var/lib/clickhouse -p 8123:8123 -p 9000:9000 yandex/clickhouse-server
