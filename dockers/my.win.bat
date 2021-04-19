docker stop nkd-db
docker rm nkd-db
docker run -it -d -e MYSQL_ROOT_PASSWORD=13454678qwerty -v d:/projects/nkd-my-database-lib/:/var/lib/mysql -v d:/projects/nkd-my-database-config/:/etc/mysql/conf.d -p 3306:3306 --name nkd-db mariadb:10
