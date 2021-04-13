# nkd-front-end
Диагностический WEB-интерфейс оператора для редуктора НКД

dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
dnf install docker-ce
systemctl enable docker
systemctl start docker
adduser webmaster
dnf install git
cd /home/webmaster
git clone https://github.com/AVShatokhin/nkd-front-end.git
mkdir /home/webmaster/db-etc
mkdir /home/webmaster/db
копируем config.json в /home/webmaster/nkd-front-end/nkd-front/config/
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
source ~/.bash_profile
nvm install v14.16.1
cd /home/webmaster/nkd-front-end/nkd-front
dnf install gcc gcc-c++ make python2
npm install
/etc/hostname <- nkd.gtlab.pro
reboot
cd /home/webmaster/nkd-front-end/dockers
./redis.cross.bat
./my.linux
./phpmyadmin.cross.bat
 После этого на 8080 доступ к базе данных
 Идём туда и заводим базу данных "nkd", портируем туда базу данных из бэкапа
портируем туда юзера для доступа к субд следующим запросом:
GRANT USAGE ON *.* TO `nkd-user`@`%` IDENTIFIED BY PASSWORD '*65BE80B3C62E39E3FFC4DD02CAD5BD3141FDDD2F';
GRANT ALL PRIVILEGES ON `nkd`.* TO `nkd-user`@`%` WITH GRANT OPTION;
./nodejs.linux
