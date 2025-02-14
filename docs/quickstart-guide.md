# Quickstart guide

!!! info "Prerequisites"

    We expect that you're already familiar with the [core concepts](concepts.md) and you have followed the [integrations instructions](integrations.md) for your environment.

    This quickstart guide assumes that BunkerWeb is accessible from the Internet and you have configured at least two domains : one for the web UI and another one for your web service.

    **System requirements**

    The minimum recommended specifications for BunkerWeb are a machine with 2 (v)CPUs and 4 GB of RAM. Please note that this should be sufficient for testing environments or setups with very few services.  

    For production environments with many services to protect, we recommend at least 4 (v)CPUs and 16 GB of RAM. Resources should be adjusted based on your use case, network traffic, and potential DDoS attacks you may face.  

    It is highly recommended to enable global loading of CRS rules (by setting the `USE_MODSECURITY_GLOBAL_CRS` parameter to `yes`) if you are in environments with limited RAM or in production with many services. More details can be found in the [advanced usages](advanced.md#running-many-services-in-production) section of the documentation.

This quickstart guide will help you to quickly install BunkerWeb and secure a web service using the web User Interface.

Protecting existing web applications already accessible with the HTTP(S) protocol is the main goal of BunkerWeb : it will act as a classical [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy) with extra security features.

See the [examples folder](https://github.com/bunkerity/bunkerweb/tree/v1.6.0/examples) of the repository to get real-world examples.

## Basic setup

=== "Linux"

    Please ensure that you have **NGINX 1.26.3 installed before installing BunkerWeb**. For all distributions, except Fedora, it is mandatory to use prebuilt packages from the [official NGINX repository](https://nginx.org/en/linux_packages.html). Compiling NGINX from source or using packages from different repositories will not work with the official prebuilt packages of BunkerWeb. However, you have the option to build BunkerWeb from source.

    === "Debian"

        The first step is to add NGINX official repository :

        ```shell
        sudo apt install -y curl gnupg2 ca-certificates lsb-release debian-archive-keyring && \
        curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
        | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null && \
        echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
        http://nginx.org/packages/debian `lsb_release -cs` nginx" \
        | sudo tee /etc/apt/sources.list.d/nginx.list
        ```

        You should now be able to install NGINX 1.26.3 :

        ```shell
        sudo apt update && \
        sudo apt install -y nginx=1.26.3-1~$(lsb_release -cs)
        ```

        !!! warning "Testing/dev version"
            If you use the `testing` or `dev` version, you will need to add the `force-bad-version` directive to your `/etc/dpkg/dpkg.cfg` file before installing BunkerWeb.

            ```shell
            echo "force-bad-version" | sudo tee -a /etc/dpkg/dpkg.cfg
            ```

        And finally install BunkerWeb 1.6.0 :

        ```shell
        curl -s https://repo.bunkerweb.io/install/script.deb.sh | sudo bash && \
        sudo apt update && \
        sudo -E apt install -y bunkerweb=1.6.0
        ```

        To prevent upgrading NGINX and/or BunkerWeb packages when executing `apt upgrade`, you can use the following command :

        ```shell
        sudo apt-mark hold nginx bunkerweb
        ```

    === "Ubuntu"

        The first step is to add NGINX official repository :

        ```shell
        sudo apt install -y curl gnupg2 ca-certificates lsb-release ubuntu-keyring && \
        curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
        | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null && \
        echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
        http://nginx.org/packages/ubuntu `lsb_release -cs` nginx" \
        | sudo tee /etc/apt/sources.list.d/nginx.list
        ```

        You should now be able to install NGINX 1.26.3 :

        ```shell
        sudo apt update && \
        sudo apt install -y nginx=1.26.3-1~$(lsb_release -cs)
        ```

        !!! warning "Testing/dev version"
            If you use the `testing` or `dev` version, you will need to add the `force-bad-version` directive to your `/etc/dpkg/dpkg.cfg` file before installing BunkerWeb.

            ```shell
            echo "force-bad-version" | sudo tee -a /etc/dpkg/dpkg.cfg
            ```

        And finally install BunkerWeb 1.6.0 :

        ```shell
        curl -s https://repo.bunkerweb.io/install/script.deb.sh | sudo bash && \
        sudo apt update && \
        sudo -E apt install -y bunkerweb=1.6.0
        ```

        To prevent upgrading NGINX and/or BunkerWeb packages when executing `apt upgrade`, you can use the following command :

        ```shell
        sudo apt-mark hold nginx bunkerweb
        ```

    === "Fedora"

        !!! info "Fedora Update Testing"
            If you can't find the NGINX version listed in the stable repository, you can enable the `updates-testing` repository :

            === "Fedora 41"
                ```shell
                sudo dnf config-manager setopt updates-testing.enabled=1
                ```
            === "Fedora 40"
                ```shell
                sudo dnf config-manager --set-enabled updates-testing
                ```

        Fedora already provides NGINX 1.26.3 that we support :

        ```shell
        sudo dnf install -y nginx-1.26.3
        ```

        And finally install BunkerWeb 1.6.0 :

        ```shell
        curl -s https://repo.bunkerweb.io/install/script.rpm.sh | sudo bash && \
        sudo dnf makecache && \
        sudo -E dnf install -y bunkerweb-1.6.0
        ```

        To prevent upgrading NGINX and/or BunkerWeb packages when executing `dnf upgrade`, you can use the following command :

        ```shell
        sudo dnf versionlock add nginx && \
        sudo dnf versionlock add bunkerweb
        ```

    === "RedHat"

        The first step is to add NGINX official repository. Create the following file at `/etc/yum.repos.d/nginx.repo` :

        ```conf
        [nginx-stable]
        name=nginx stable repo
        baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
        gpgcheck=1
        enabled=1
        gpgkey=https://nginx.org/keys/nginx_signing.key
        module_hotfixes=true

        [nginx-mainline]
        name=nginx mainline repo
        baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
        gpgcheck=1
        enabled=0
        gpgkey=https://nginx.org/keys/nginx_signing.key
        module_hotfixes=true
        ```

        You should now be able to install NGINX 1.26.3 :

        ```shell
        sudo dnf install nginx-1.26.3
        ```

        And finally install BunkerWeb 1.6.0 :

        ```shell
        sudo dnf install -y epel-release && \
        curl -s https://repo.bunkerweb.io/install/script.rpm.sh | sudo bash && \
        sudo dnf check-update && \
        sudo -E dnf install -y bunkerweb-1.6.0
        ```

        To prevent upgrading NGINX and/or BunkerWeb packages when executing `dnf upgrade`, you can use the following command :

        ```shell
        sudo dnf versionlock add nginx && \
        sudo dnf versionlock add bunkerweb
        ```

=== "Docker"

    Here is the full docker compose file that you can use, please note that we will later connect the web service to the `bw-services` network :

    ```yaml
    x-bw-env: &bw-env
      # We use an anchor to avoid repeating the same settings for both services
      API_WHITELIST_IP: "127.0.0.0/8 10.20.30.0/24" # Make sure to set the correct IP range so the scheduler can send the configuration to the instance
      DATABASE_URI: "mariadb+pymysql://bunkerweb:changeme@bw-db:3306/db" # Remember to set a stronger password for the database

    services:
      bunkerweb:
        # This is the name that will be used to identify the instance in the Scheduler
        image: bunkerity/bunkerweb:1.6.0
        ports:
          - "80:8080/tcp"
          - "443:8443/tcp"
          - "443:8443/udp" # For QUIC / HTTP3 support
        environment:
          <<: *bw-env # We use the anchor to avoid repeating the same settings for all services
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-services

      bw-scheduler:
        image: bunkerity/bunkerweb-scheduler:1.6.0
        environment:
          <<: *bw-env
          BUNKERWEB_INSTANCES: "bunkerweb" # Make sure to set the correct instance name
          SERVER_NAME: ""
          MULTISITE: "yes"
          UI_HOST: "http://bw-ui:7000" # Change it if needed
        volumes:
          - bw-data:/data # This is used to persist the cache and other data like the backups
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-db

      bw-ui:
        image: bunkerity/bunkerweb-ui:1.6.0
        environment:
          <<: *bw-env
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-db

      bw-db:
        image: mariadb:11
        environment:
          MYSQL_RANDOM_ROOT_PASSWORD: "yes"
          MYSQL_DATABASE: "db"
          MYSQL_USER: "bunkerweb"
          MYSQL_PASSWORD: "changeme" # Remember to set a stronger password for the database
        volumes:
          - bw-db:/var/lib/mysql
        restart: "unless-stopped"
        networks:
          - bw-db

    volumes:
      bw-data:
      bw-db:


    networks:
      bw-universe:
        name: bw-universe
        ipam:
          driver: default
          config:
            - subnet: 10.20.30.0/24 # Make sure to set the correct IP range so the scheduler can send the configuration to the instance
      bw-services:
        name: bw-services
      bw-db:
        name: bw-db
    ```

=== "Docker autoconf"

    Here is the full docker compose file that you can use, please note that we will later connect the web service to the `bw-services` network :

    ```yaml
    x-ui-env: &bw-ui-env
      # We anchor the environment variables to avoid duplication
      AUTOCONF_MODE: "yes"
      DATABASE_URI: "mariadb+pymysql://bunkerweb:changeme@bw-db:3306/db" # Remember to set a stronger password for the database

    services:
      bunkerweb:
        image: bunkerity/bunkerweb:1.6.0
        ports:
          - "80:8080/tcp"
          - "443:8443/tcp"
          - "443:8443/udp" # For QUIC / HTTP3 support
        labels:
          - "bunkerweb.INSTANCE=yes" # We set the instance label to allow the autoconf to detect the instance
        environment:
          AUTOCONF_MODE: "yes"
          API_WHITELIST_IP: "127.0.0.0/8 10.20.30.0/24"
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-services

      bw-scheduler:
        image: bunkerity/bunkerweb-scheduler:1.6.0
        environment:
          <<: *bw-ui-env
          BUNKERWEB_INSTANCES: ""
          SERVER_NAME: ""
          API_WHITELIST_IP: "127.0.0.0/8 10.20.30.0/24"
          MULTISITE: "yes"
          UI_HOST: "http://bw-ui:7000" # Change it if needed
        volumes:
          - bw-data:/data # This is used to persist the cache and other data like the backups
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-db

      bw-autoconf:
        image: bunkerity/bunkerweb-autoconf:1.6.0
        depends_on:
          - bw-docker
        environment:
          <<: *bw-ui-env
          DOCKER_HOST: "tcp://bw-docker:2375"
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-docker
          - bw-db

      bw-docker:
        image: tecnativa/docker-socket-proxy:nightly
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock:ro
        environment:
          CONTAINERS: "1"
          LOG_LEVEL: "warning"
        networks:
          - bw-docker

      bw-ui:
        image: bunkerity/bunkerweb-ui:1.6.0
        environment:
          <<: *bw-ui-env
          TOTP_SECRETS: "mysecret" # Remember to set a stronger secret key (see the Prerequisites section)
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-db

      bw-db:
        image: mariadb:11
        environment:
          MYSQL_RANDOM_ROOT_PASSWORD: "yes"
          MYSQL_DATABASE: "db"
          MYSQL_USER: "bunkerweb"
          MYSQL_PASSWORD: "changeme" # Remember to set a stronger password for the database
        volumes:
          - bw-db:/var/lib/mysql
        restart: "unless-stopped"
        networks:
          - bw-db

    volumes:
      bw-data:
      bw-db:

    networks:
      bw-universe:
        name: bw-universe
        ipam:
          driver: default
          config:
            - subnet: 10.20.30.0/24
      bw-services:
        name: bw-services
      bw-docker:
        name: bw-docker
      bw-db:
        name: bw-db
    ```

=== "Kubernetes"

    The recommended way to install Kubernetes is to use the Helm chart available at `https://repo.bunkerweb.io/charts` :

    ```shell
    helm repo add bunkerweb https://repo.bunkerweb.io/charts
    ```

    You can then use the `bunkerweb` helm chart from that repository :

    ```shell
    helm install mybw bunkerweb/bunkerweb --namespace bunkerweb --create-namespace
    ```

    Once installed, you can get the IP address of the `LoadBalancer` to setup your domains :

    ```shell
    kubectl -n bunkerweb get svc mybw-external -o=jsonpath='{.status.loadBalancer.ingress[0].ip}'
    ```

=== "Swarm"

    !!! warning "Deprecated"
        The Swarm integration is deprecated and will be removed in a future release. Please consider using the [Kubernetes integration](integrations.md#kubernetes) instead.

        **More information can be found in the [Swarm integration documentation](integrations.md#swarm).**

    Here is the full docker compose stack file that you can use, please note that we will later connect the web service to the `bw-services` network :

    ```yaml
    x-ui-env: &bw-ui-env
      # We anchor the environment variables to avoid duplication
      SWARM_MODE: "yes"
      DATABASE_URI: "mariadb+pymysql://bunkerweb:changeme@bw-db:3306/db" # Remember to set a stronger password for the database

    services:
      bunkerweb:
        image: bunkerity/bunkerweb:1.6.0
        ports:
          - published: 80
            target: 8080
            mode: host
            protocol: tcp
          - published: 443
            target: 8443
            mode: host
            protocol: tcp
          - published: 443
            target: 8443
            mode: host
            protocol: udp # For QUIC / HTTP3 support
        environment:
          SWARM_MODE: "yes"
          API_WHITELIST_IP: "127.0.0.0/8 10.20.30.0/24"
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-services
        deploy:
          mode: global
          placement:
            constraints:
              - "node.role == worker"
          labels:
            - "bunkerweb.INSTANCE=yes"

      bw-scheduler:
        image: bunkerity/bunkerweb-scheduler:1.6.0
        environment:
          <<: *bw-ui-env
          BUNKERWEB_INSTANCES: ""
          SERVER_NAME: ""
          API_WHITELIST_IP: "127.0.0.0/8 10.20.30.0/24"
          MULTISITE: "yes"
          USE_REDIS: "yes"
          REDIS_HOST: "bw-redis"
          UI_HOST: "http://bw-ui:7000" # Change it if needed
        volumes:
          - bw-data:/data # This is used to persist the cache and other data like the backups
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-db

      bw-autoconf:
        image: bunkerity/bunkerweb-autoconf:1.6.0
        environment:
          <<: *bw-ui-env
          DOCKER_HOST: "tcp://bw-docker:2375"
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-docker
          - bw-db

      bw-docker:
        image: tecnativa/docker-socket-proxy:nightly
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock:ro
        environment:
          CONFIGS: "1"
          CONTAINERS: "1"
          SERVICES: "1"
          SWARM: "1"
          TASKS: "1"
          LOG_LEVEL: "warning"
        networks:
          - bw-docker
        deploy:
          placement:
            constraints:
              - "node.role == manager"

      bw-ui:
        image: bunkerity/bunkerweb-ui:1.6.0
        environment:
          <<: *bw-ui-env
          TOTP_SECRETS: "mysecret" # Remember to set a stronger secret key (see the Prerequisites section)
        restart: "unless-stopped"
        networks:
          - bw-universe
          - bw-db

      bw-db:
        image: mariadb:11
        environment:
          MYSQL_RANDOM_ROOT_PASSWORD: "yes"
          MYSQL_DATABASE: "db"
          MYSQL_USER: "bunkerweb"
          MYSQL_PASSWORD: "changeme" # Remember to set a stronger password for the database
        volumes:
          - bw-db:/var/lib/mysql
        restart: "unless-stopped"
        networks:
          - bw-db

      bw-redis:
        image: redis:7-alpine
        networks:
          - bw-universe

    volumes:
      bw-db:
      bw-data:

    networks:
      bw-universe:
        name: bw-universe
        driver: overlay
        attachable: true
        ipam:
          config:
            - subnet: 10.20.30.0/24
      bw-services:
        name: bw-services
        driver: overlay
        attachable: true
      bw-docker:
        name: bw-docker
        driver: overlay
        attachable: true
      bw-db:
        name: bw-db
        driver: overlay
        attachable: true
    ```

## Complete the setup wizard

!!! tip "Accessing the setup wizard"

    You can access the setup wizard by browsing the `https://your-fqdn-or-ip-addresss/setup` URI of your server.

### Create an Administrator account

You should see a setup page just like this one :
<figure markdown>
  ![Setup Wizard landing page](assets/img/ui-wizard-step1.png){ align=center }
  <figcaption>Setup Wizard landing page</figcaption>
</figure>

Once you're on the setup page, you can enter the **administrator username, email, and password** and click on the "Next" button.

### Configure the Reverse Proxy and HTTPS

The next step will ask you to enter the **server name** (domain / fqdn) that the web UI will use. You can also choose to enable **Let's Encrypt** or use a **custom certificate**.

<figure markdown>
  ![Setup Wizard step 2](assets/img/ui-wizard-step2.png){ align=center }
  <figcaption>Setup Wizard step 2</figcaption>
</figure>

### Overview of your settings

The last step will give you an overview of the settings you've entered. You can click on the "Setup" button to complete the setup.

<figure markdown>
  ![Setup Wizard final step](assets/img/ui-wizard-step3.png){ align=center }
  <figcaption>Setup Wizard final step</figcaption>
</figure>


## Accessing the web interface

You can now access the web interface by browsing to the domain you configured in the previous step and the URI if you changed it (default is `https://your-domain/`).

<figure markdown>
  ![Web interface login page](assets/img/ui-login.png){ align=center }
  <figcaption>Web interface login page</figcaption>
</figure>

You can now log in with the administrator account you created during the setup wizard.

<figure markdown>
  ![Web interface home](assets/img/ui-home.png){ align=center }
  <figcaption>Web interface home</figcaption>
</figure>

## Creating a new service

=== "Web UI"

    You can create a new service by navigating to the `Services` section of the web interface and clicking on the `➕ Create new service` button.

    Their are multiple ways of creating a service using the web interface :

    * The **Easy mode** will guide you through the process of creating a new service.
    * The **Advanced mode** will allow you to configure the service with more options.
    * The **Raw mode** will allow you to enter the configuration directly like editing the `variables.env` file.

    !!! tip "Draft service"

        You can create a draft service to save your progress and come back to it later. Just click on the `🌐 Online` button to toggle the service to draft mode.

    === "Easy mode"

        In this mode, you can choose among the available templates and fill in the required fields.

        <figure markdown>
          ![Web interface create service easy](assets/img/ui-create-service-easy.png){ align=center }
          <figcaption>Web interface create service easy</figcaption>
        </figure>

        * To navigate between the different plugins, you can use the dropdown menu on the top left corner of the page.
        * Once you've selected the template, you can fill in the required fields and follow the instructions to create the service.
        * Once you're done configuring the service, you can click on the `💾 Save` button to save the configuration.

    === "Advanced mode"

        In this mode, you can configure the service with more options while seeing all the available settings from all the different plugins.

        <figure markdown>
          ![Web interface create service advanced](assets/img/ui-create-service-advanced.png){ align=center }
          <figcaption>Web interface create service advanced</figcaption>
        </figure>

        * To navigate between the different plugins, you can use the dropdown menu on the top left corner of the page.
        * Each setting has a small piece of information that will help you understand what it does.
        * Once you're done configuring the service, you can click on the `💾 Save` button to save the configuration.

    === "Raw mode"

        In this mode, you can enter the configuration directly like editing the `variables.env` file.

        <figure markdown>
          ![Web interface create service RAW](assets/img/ui-create-service-raw.png){ align=center }
          <figcaption>Web interface create service RAW</figcaption>
        </figure>

        * Once you're done configuring the service, you can click on the `💾 Save` button to save the configuration.

    🚀 Once you've saved the configuration, you should see your new service in the list of services.

    <figure markdown>
      ![Web interface services page](assets/img/ui-services.png){ align=center }
      <figcaption>Web interface services page</figcaption>
    </figure>

    If you wish to edit the service, you can click on the service name or the `📝 Edit` button.

=== "Linux variables.env file"

    We will assume that you followed the [Basic setup](#__tabbed_1_5) and you have the Linux integration running on your machine.

    You can create a new service by editing the `variables.env` file located in the `/etc/bunkerweb/` directory.

    ```shell
    nano /etc/bunkerweb/variables.env
    ```

    You can then add the following configuration :

    ```shell
    SERVER_NAME=www.example.com
    MULTISITE=yes
    www.example.com_USE_REVERSE_PROXY=yes
    www.example.com_REVERSE_PROXY_URL=/
    www.example.com_REVERSE_PROXY_HOST=http://myapp:8080
    ```

    You can then reload the `bunkerweb-scheduler` service to apply the changes.

    ```shell
    systemctl reload bunkerweb-scheduler
    ```

=== "Docker"

    We will assume that you followed the [Basic setup](#__tabbed_1_1) and you have the Docker integration running on your machine.

    You must then have a network called `bw-services` so you can connect your existing application and configure BunkerWeb:

    ```yaml
    services:
      myapp:
    	  image: nginxdemos/nginx-hello
    	  networks:
    	    - bw-services

    networks:
      bw-services:
        external: true
        name: bw-services
    ```

    After that, you can create manually add the service in the docker compose file that you created in the previous step.

    ```yaml
    ...

    services:
      ...
      bw-scheduler:
        ...
        environment:
          ...
          SERVER_NAME: "www.example.com" # When using the Docker integration, you can set the configuration directly in the scheduler, make sure to set the correct domain name
          MULTISITE: "yes" # Enable multisite mode so you can add multiple services
          www.example.com_USE_REVERSE_PROXY: "yes"
          www.example.com_REVERSE_PROXY_URL: "/"
          www.example.com_REVERSE_PROXY_HOST: "http://myapp:8080"
          ...
    ```

    You can then restart the `bw-scheduler` service to apply the changes.

    ```shell
    docker compose down bw-scheduler && docker compose up -d bw-scheduler
    ```

=== "Docker autoconf labels"

    We will assume that you followed the [Basic setup](#__tabbed_1_2) and you have the Docker autoconf integration running on your machine.

    You must then have a network called `bw-services` so you can connect your existing application and configure BunkerWeb with labels :

    ```yaml
    services:
      myapp:
    	  image: nginxdemos/nginx-hello
    	  networks:
    	    - bw-services
    	  labels:
    	    - "bunkerweb.SERVER_NAME=www.example.com"
    	    - "bunkerweb.USE_REVERSE_PROXY=yes"
    	    - "bunkerweb.REVERSE_PROXY_URL=/"
    	    - "bunkerweb.REVERSE_PROXY_HOST=http://myapp:8080"

    networks:
      bw-services:
        external: true
        name: bw-services
    ```

    Doing so will automatically create a new service with the provided labels as configuration.

=== "Kubernetes annotations"

    We will assume that you followed the [Basic setup](#__tabbed_1_4) and you have the Kubernetes stack running on your cluster.

    Let's assume that you have a typical Deployment with a Service to access the web application from within the cluster :

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: app
      labels:
    	app: app
    spec:
      replicas: 1
      selector:
    	matchLabels:
    	  app: app
      template:
    	metadata:
    	  labels:
    		app: app
    	spec:
    	  containers:
    	  - name: app
    		image: nginxdemos/nginx-hello
    		ports:
    		- containerPort: 8080
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: svc-app
    spec:
      selector:
    	app: app
      ports:
    	- protocol: TCP
    	  port: 80
    	  targetPort: 8080
    ```

    Here is the corresponding Ingress definition to serve and protect the web application :

    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: ingress
      annotations:
        bunkerweb.io/DUMMY_SETTING: "value"
    spec:
      rules:
        - host: www.example.com
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                  name: svc-app
                  port:
                    number: 80
    ```

=== "Swarm labels"

    !!! warning "Deprecated"
        The Swarm integration is deprecated and will be removed in a future release. Please consider using the [Docker autoconf integration](#__tabbed_2_2) instead.

        **More information can be found in the [Swarm integration documentation](integrations.md#swarm).**

    We will assume that you followed the [Basic setup](#__tabbed_1_3) and you have the Swarm stack running on your cluster and connected to a network called `bw-services` so you can connect your existing application and configure BunkerWeb with labels :

    ```yaml
    services:
      myapp:
        image: nginxdemos/nginx-hello
        networks:
          - bw-services
        deploy:
          placement:
            constraints:
              - "node.role==worker"
          labels:
          - "bunkerweb.SERVER_NAME=www.example.com"
          - "bunkerweb.USE_REVERSE_PROXY=yes"
          - "bunkerweb.REVERSE_PROXY_URL=/"
          - "bunkerweb.REVERSE_PROXY_HOST=http://myapp:8080"

    networks:
      bw-services:
        external: true
        name: bw-services
    ```

## Going further

Congratulations! You've just installed BunkerWeb and secured your first web service. Please note that BunkerWeb is capable of much more, whether it comes to security or integrations with other systems and solutions. Here's a list of resources and actions that may help you continue to deepen your knowledge of the solution:

- Join the Bunker community: [Discord](https://discord.com/invite/fTf46FmtyD), [LinkedIn](https://www.linkedin.com/company/bunkerity/), [GitHub](https://github.com/bunkerity), [X](https://x.com/bunkerity)
- Check out the [official blog](https://www.bunkerweb.io/blog?utm_campaign=self&utm_source=doc)
- Explore [advanced use cases](advanced.md) in the documentation
- [Get in touch with us](https://panel.bunkerweb.io/contact.php?utm_campaign=self&utm_source=doc) to discuss your organization's needs
