#!/bin/bash

if [ "$(id -u)" -ne 0 ] ; then
	echo "❌ Run me as root"
	exit 1
fi

if id www-data > /dev/null 2>&1 ; then
	user="www-data"
elif id apache > /dev/null 2>&1 ; then
	user="apache"
else
	echo "❌ No PHP user found"
	exit 1
fi
curl https://wordpress.org/latest.tar.gz -Lo /tmp/wordpress.tar.gz
tar -xzf /tmp/wordpress.tar.gz -C /tmp
cp -r /tmp/wordpress/* /var/www/html
chown -R $user:nginx /var/www/html
find /var/www/html -type f -exec chmod 0640 {} \;
find /var/www/html -type d -exec chmod 0750 {} \;
