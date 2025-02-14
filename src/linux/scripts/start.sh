#!/bin/bash

# Source the utils helper script
# shellcheck disable=SC1091
source /usr/share/bunkerweb/helpers/utils.sh

# Set the PYTHONPATH
export PYTHONPATH=/usr/share/bunkerweb/deps/python

# Display usage information
function display_help() {
    echo "Usage: $(basename "$0") [start|stop|reload]"
    echo "Options:"
    echo "  start:   Create configurations and start the bunkerweb service."
    echo "  stop:    Stop the bunkerweb service."
    echo "  reload:  Reload the bunkerweb service."
}

# Start the bunkerweb service
function start() {

    # Set the PYTHONPATH
    export PYTHONPATH=/usr/share/bunkerweb/deps/python

    log "SYSTEMCTL" "ℹ️" "Starting BunkerWeb service ..."

    setcap 'CAP_NET_BIND_SERVICE=+eip' /usr/sbin/nginx
    chown -R nginx:nginx /etc/nginx

    # Create dummy variables.env
    if [ ! -f /etc/bunkerweb/variables.env ]; then
        {
            echo "# remove IS_LOADING=yes when your config is ready"
            echo "IS_LOADING=yes"
            echo "SERVER_NAME="
            echo "DNS_RESOLVERS=9.9.9.9 149.112.112.112 8.8.8.8 8.8.4.4" # Quad9, Google
            echo "HTTP_PORT=80"
            echo "HTTPS_PORT=443"
            echo "API_LISTEN_IP=127.0.0.1"
        } > /etc/bunkerweb/variables.env
        chown root:nginx /etc/bunkerweb/variables.env
        chmod 660 /etc/bunkerweb/variables.env
        log "SYSTEMCTL" "ℹ️" "Created dummy variables.env file"
    fi

    # Create PID folder
    if [ ! -f /var/run/bunkerweb ] ; then
        mkdir -p /var/run/bunkerweb
        chown nginx:nginx /var/run/bunkerweb
    fi

    # Create TMP folder
    if [ ! -f /var/tmp/bunkerweb ] ; then
        mkdir -p /var/tmp/bunkerweb
        chown nginx:nginx /var/tmp/bunkerweb
    fi

    # Create LOG folder
    if [ ! -f /var/log/bunkerweb ] ; then
        mkdir -p /var/log/bunkerweb
        chown nginx:nginx /var/log/bunkerweb
    fi

    # Stop nginx if it's running
    stop

    # Generate temp conf for nginx
    # Default values
    declare -A defaults=(
        [DNS_RESOLVERS]="9.9.9.9 149.112.112.112 8.8.8.8 8.8.4.4" # Quad9, Google
        [API_LISTEN_IP]="127.0.0.1"
        [API_HTTP_PORT]="5000"
        [API_SERVER_NAME]="bwapi"
        [API_WHITELIST_IP]="127.0.0.0/8"
        [USE_REAL_IP]="no"
        [USE_PROXY_PROTOCOL]="no"
        [REAL_IP_FROM]="192.168.0.0/16 172.16.0.0/12 10.0.0.0/8"
        [REAL_IP_HEADER]="X-Forwarded-For"
        [HTTP_PORT]="80"
        [HTTPS_PORT]="443"
    )

    # File containing the environment variables
    env_file="/etc/bunkerweb/variables.env"

    # Load variables safely
    if [ -f "$env_file" ]; then
        while IFS='=' read -r key value; do
            # Skip empty lines and comments
            [[ -z "$key" || "$key" =~ ^# ]] && continue
            # Trim whitespace
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs)
            # Only process recognized keys
            if [[ -n "${defaults[$key]}" ]]; then
                # Set variable if defined and non-empty in the file
                [[ -n "$value" ]] && eval "${key}=\"$value\""
            fi
        done < "$env_file"
    fi

    # Assign default values for unset variables
    for key in "${!defaults[@]}"; do
        eval "value=\${${key}:-}"
        if [ -z "$value" ]; then
            eval "${key}=\"${defaults[$key]}\""
        fi
    done

    echo -ne "IS_LOADING=yes\nUSE_BUNKERNET=no\nSEND_ANONYMOUS_REPORT=no\nSERVER_NAME=\nDNS_RESOLVERS=${DNS_RESOLVERS}\nAPI_HTTP_PORT=${API_HTTP_PORT}\nAPI_LISTEN_IP=${API_LISTEN_IP}\nAPI_SERVER_NAME=${API_SERVER_NAME}\nAPI_WHITELIST_IP=${API_WHITELIST_IP}\nUSE_REAL_IP=${USE_REAL_IP}\nUSE_PROXY_PROTOCOL=${USE_PROXY_PROTOCOL}\nREAL_IP_FROM=${REAL_IP_FROM}\nREAL_IP_HEADER=${REAL_IP_HEADER}\nHTTP_PORT=${HTTP_PORT}\nHTTPS_PORT=${HTTPS_PORT}\n" > /var/tmp/bunkerweb/tmp.env
    chown root:nginx /var/tmp/bunkerweb/tmp.env
    chmod 660 /var/tmp/bunkerweb/tmp.env

    sudo -E -u nginx -g nginx /bin/bash -c "PYTHONPATH=/usr/share/bunkerweb/deps/python /usr/share/bunkerweb/gen/main.py --variables /var/tmp/bunkerweb/tmp.env --no-linux-reload"
    # shellcheck disable=SC2181
    if [ $? -ne 0 ] ; then
        log "SYSTEMCTL" "❌" "Error while generating config from /var/tmp/bunkerweb/tmp.env"
        exit 1
    fi
    # Start nginx
    log "SYSTEMCTL" "ℹ️" "Starting nginx ..."
    sudo -E -u nginx -g nginx /usr/sbin/nginx -e /var/log/bunkerweb/error.log
    # shellcheck disable=SC2181
    if [ $? -ne 0 ] ; then
        log "SYSTEMCTL" "❌" "Error while executing temp nginx"
        exit 1
    fi
    count=0
    while [ $count -lt 10 ] ; do
        check="$(curl -s -H "Host: healthcheck.bunkerweb.io" http://127.0.0.1:6000/healthz 2>&1)"
        # shellcheck disable=SC2181
        if [ $? -eq 0 ] && [ "$check" = "ok" ] ; then
            break
        fi
        count=$((count + 1))
        sleep 1
        log "SYSTEMCTL" "ℹ️" "Waiting for nginx to start ..."
    done
    if [ $count -ge 10 ] ; then
        log "SYSTEMCTL" "❌" "nginx is not started"
        exit 1
    fi
    log "SYSTEMCTL" "ℹ️" "nginx started ..."

    log "SYSTEMCTL" "ℹ️" "BunkerWeb service started ..."

    while [ -f /var/run/bunkerweb/nginx.pid ] ; do
        sleep 1
    done
}

function stop() {
    log "SYSTEMCTL" "ℹ️" "Stopping BunkerWeb service ..."

    pgrep nginx > /dev/null 2>&1
    # shellcheck disable=SC2181
    if [ $? -eq 0 ] ; then
        log "SYSTEMCTL" "ℹ️ " "Stopping nginx..."
        nginx -s stop
        # shellcheck disable=SC2181
        if [ $? -ne 0 ] ; then
            log "SYSTEMCTL" "❌" "Error while sending stop signal to nginx"
            log "SYSTEMCTL" "ℹ️ " "Stopping nginx (force)..."
            kill -TERM "$(cat /var/run/bunkerweb/nginx.pid)"
            # shellcheck disable=SC2181
            if [ $? -ne 0 ] ; then
                log "SYSTEMCTL" "❌" "Error while sending term signal to nginx"
            fi
        fi
    fi
    count=0
    while true ; do
        pgrep nginx > /dev/null 2>&1
        # shellcheck disable=SC2181
        if [ $? -ne 0 ] ; then
            break
        fi
        log "SYSTEMCTL" "ℹ️ " "Waiting for nginx to stop..."
        sleep 1
        count=$((count + 1))
        if [ $count -ge 20 ] ; then
            break
        fi
    done
    if [ $count -ge 20 ] ; then
        log "SYSTEMCTL" "❌" "Timeout while waiting nginx to stop"
        exit 1
    fi
    log "SYSTEMCTL" "ℹ️ " "nginx is stopped"

    log "SYSTEMCTL" "ℹ️" "BunkerWeb service stopped"
}

function reload()
{
    log "SYSTEMCTL" "ℹ️" "Reloading BunkerWeb service ..."

    pgrep nginx > /dev/null 2>&1
    # shellcheck disable=SC2181
    if [ $? -eq 0 ] ; then
        log "SYSTEMCTL" "ℹ️" "Reloading nginx ..."
        nginx -s reload
        # shellcheck disable=SC2181
        if [ $? -ne 0 ] ; then
            log "SYSTEMCTL" "❌" "Error while sending reload signal to nginx"
            log "SYSTEMCTL" "ℹ️" "Reloading nginx (force) ..."
            kill -HUP "$(cat /var/run/bunkerweb/nginx.pid)"
            # shellcheck disable=SC2181
            if [ $? -ne 0 ] ; then
                log "SYSTEMCTL" "❌" "Error while sending hup signal to nginx"
            fi
        fi
    else
        log "SYSTEMCTL" "❌" "nginx is not running"
        exit 1
    fi

    log "SYSTEMCTL" "ℹ️" "BunkerWeb service reloaded ..."
}

# List of different args
case $1 in
    "start")
    start
    ;;
    "stop")
    stop
    ;;
    "reload")
    reload
    ;;
    *)
    echo "Invalid option!"
    echo "List of options availables:"
    display_help
esac
