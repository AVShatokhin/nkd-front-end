docker stop nkd-phpmyadmin
docker rm nkd-phpmyadmin
docker run -it -d -e MYSQL_ROOT_PASSWORD=13454678qwerty -e PMA_HOST=nkd-db --link nkd-db -p 8080:80 --name nkd-phpmyadmin phpmyadmin
