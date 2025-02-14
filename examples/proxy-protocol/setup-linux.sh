#!/bin/bash

if [ "$(id -u)" -ne 0 ] ; then
	echo "❌ Run me as root"
	exit 1
fi

DNF=$(which dnf)
APT=$(which apt)

if [ -n "$DNF" ] ; then
	dnf install -y haproxy
elif [ -n "$APT" ] ; then
	apt install -y haproxy
fi

cp haproxy.cfg /etc/haproxy
sed -i "s/*:8080/*:80/g" /etc/haproxy/haproxy.cfg
sed -i "s/*:8443/*:443/g" /etc/haproxy/haproxy.cfg
sed -i "s/bunkerweb/127.0.0.1/g" /etc/haproxy/haproxy.cfg
systemctl stop bunkerweb
systemctl stop haproxy
if [ -f /lib/systemd/system/haproxy.service ] ; then
	sed -i 's/^BindReadOnlyPaths/#BindReadOnlyPaths/' /lib/systemd/system/haproxy.service
	systemctl daemon-reload
fi
systemctl start haproxy

echo "hello" > /var/www/html/index.html
