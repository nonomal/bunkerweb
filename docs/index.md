# Introduction

## Overview

<figure markdown>
  ![Overview](assets/img/intro-overview.svg){ align=center, width="800" }
  <figcaption>Make your web services secure by default !</figcaption>
</figure>

BunkerWeb is a next-generation and open-source Web Application Firewall (WAF).

Being a full-featured web server (based on [NGINX](https://nginx.org/) under the hood), it will protect your web services to make them "secure by default". BunkerWeb integrates seamlessly into your existing environments ([Linux](integrations.md#linux), [Docker](integrations.md#docker), [Swarm](integrations.md#swarm), [Kubernetes](integrations.md#kubernetes), …) and is fully configurable (don't panic, there is an [awesome web UI](web-ui.md) if you don't like the CLI) to meet your own use-cases . In other words, cybersecurity is no more a hassle.

BunkerWeb contains primary [security features](advanced.md#security-tuning) as part of the core but can be easily extended with additional ones thanks to a [plugin system](plugins.md).

## Why BunkerWeb ?

<p align="center">
    <iframe style="display: block;" width="560" height="315" data-src="https://www.youtube-nocookie.com/embed/oybLtyhWJIo" title="BunkerWeb overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

- **Easy integration into existing environments** : Seamlessly integrate BunkerWeb into various environments such as Linux, Docker, Swarm, Kubernetes and more. Enjoy a smooth transition and hassle-free implementation.

- **Highly customizable** : Tailor BunkerWeb to your specific requirements with ease. Enable, disable, and configure features effortlessly, allowing you to customize the security settings according to your unique use case.

- **Secure by default** : BunkerWeb provides out-of-the-box, hassle-free minimal security for your web services. Experience peace of mind and enhanced protection right from the start.

- **Awesome web UI** : Take control of BunkerWeb more efficiently with the exceptional web user interface (UI). Navigate settings and configurations effortlessly through a user-friendly graphical interface, eliminating the need for the command-line interface (CLI).

- **Plugin system** : Extend the capabilities of BunkerWeb to meet your own use cases. Seamlessly integrate additional security measures and customize the functionality of BunkerWeb according to your specific requirements.

- **Free as in "freedom"** : BunkerWeb is licensed under the free [AGPLv3 license](https://www.gnu.org/licenses/agpl-3.0.en.html), embracing the principles of freedom and openness. Enjoy the freedom to use, modify, and distribute the software, backed by a supportive community.

- **Professional services** : Get technical support, tailored consulting and custom development directly from the maintainers of BunkerWeb. Visit the [BunkerWeb Panel](https://panel.bunkerweb.io/?utm_campaign=self&utm_source=doc#pro) for more information.

## Security features

Explore the impressive array of security features offered by BunkerWeb. While not exhaustive, here are some notable highlights:

- **HTTPS** support with transparent **Let's Encrypt** automation : Easily secure your web services with automated Let's Encrypt integration, ensuring encrypted communication between clients and your server.

- **State-of-the-art web security** : Benefit from cutting-edge web security measures, including comprehensive HTTP security headers, prevention of data leaks, and TLS hardening techniques.

- Integrated **ModSecurity WAF** with the **OWASP Core Rule Set** : Enjoy enhanced protection against web application attacks with the integration of ModSecurity, fortified by the renowned OWASP Core Rule Set.

- **Automatic ban** of strange behaviors based on HTTP status code : BunkerWeb intelligently identifies and blocks suspicious activities by automatically banning behaviors that trigger abnormal HTTP status codes.

- Apply **connections and requests limit** for clients : Set limits on the number of connections and requests from clients, preventing resource exhaustion and ensuring fair usage of server resources.

- **Block bots** with **challenge-based verification** : Keep malicious bots at bay by challenging them to solve puzzles such as cookies, JavaScript tests, captcha, hCaptcha, reCAPTCHA or Turnstile, effectively blocking unauthorized access.

- **Block known bad IPs** with external blacklists and DNSBL : Utilize external blacklists and DNS-based blackhole lists (DNSBL) to proactively block known malicious IP addresses, bolstering your defense against potential threats.

- **And much more...** : BunkerWeb is packed with a plethora of additional security features that go beyond this list, providing you with comprehensive protection and peace of mind.

To delve deeper into the core security features, we invite you to explore the [security tuning](advanced.md#security-tuning) section of the documentation. Discover how BunkerWeb empowers you to fine-tune and optimize security measures according to your specific needs.

## Demo

<p align="center">
    <iframe style="display: block;" width="560" height="315" data-src="https://www.youtube-nocookie.com/embed/ZhYV-QELzA4" title="Fooling automated tools and scanners" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

A demo website protected with BunkerWeb is available at [demo.bunkerweb.io](https://demo.bunkerweb.io/?utm_campaign=self&utm_source=doc). Feel free to visit it and perform some security tests.

## Web UI

<p align="center">
    <iframe style="display: block;" width="560" height="315" data-src="https://www.youtube-nocookie.com/embed/tGS3pzquEjY" title="BunkerWeb web UI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

BunkerWeb offers an optional [user interface](web-ui.md) to manage your instances and their configurations. An online read-only demo is available at [demo-ui.bunkerweb.io](https://demo-ui.bunkerweb.io/?utm_campaign=self&utm_source=doc), feel free to test it by yourself.

## BunkerWeb Cloud

Don't want to self-host and manage your own BunkerWeb instance(s) ? You might be interested into BunkerWeb Cloud, our fully managed SaaS offer for BunkerWeb.

Try our [BunkerWeb Cloud beta offer for free](https://panel.bunkerweb.io/order/bunkerweb-cloud/14?utm_source=doc&utm_campaign=self) and get access to :

- Fully managed BunkerWeb instance hosted in our cloud
- All BunkerWeb features including PRO ones
- Monitoring platform including dashboards and alerts
- Technical support to assist you in the configuration

You will find more information about BunkerWeb Cloud in the [FAQ page](https://panel.bunkerweb.io/knowledgebase/55/BunkerWeb-Cloud?utm_source=doc&utm_campaign=self) of the BunkerWeb panel.

## PRO version

When using BunkerWeb you have the choice of the version you want to use : open-source or PRO.

Whether it's enhanced security, an enriched user experience, or technical monitoring, the BunkerWeb PRO version will allow you to fully benefit from BunkerWeb and respond to your professional needs.

Be it in the documentation or the user interface, the PRO features are annotated with a crown <img src="assets/img/pro-icon.svg" alt="crow pro icon" height="32px" width="32px"> to distinguish them from those integrated into the open-source version.

You can upgrade from the open-source version to the PRO one easily and at any time you want. The process is pretty straightforward :

- Claim your [free trial on the BunkerWeb panel](https://panel.bunkerweb.io/?utm_campaign=self&utm_source=doc)
- Once connected to the client area, copy your PRO license key
- Paste your private key into BunkerWeb using the [web UI](web-ui.md#upgrade-to-pro) or [specific setting](settings.md#pro)

Do not hesitate to visit the [BunkerWeb panel](https://panel.bunkerweb.io/knowledgebase?utm_campaign=self&utm_source=doc) or [contact us](https://panel.bunkerweb.io/contact.php?utm_campaign=self&utm_source=doc) if you have any question regarding the PRO version.

## Professional services

Get the most of BunkerWeb by getting professional services directly from the maintainers of the project. From technical support to tailored consulting and development, we are here to assist you in the security of your web services.

You will find more information by visiting the [BunkerWeb Panel](https://panel.bunkerweb.io/?utm_campaign=self&utm_source=doc), our dedicated platform for professional services.

Don't hesitate to [contact us](https://panel.bunkerweb.io/contact.php?utm_campaign=self&utm_source=doc) if you have any question, we will be more than happy to respond to your needs.

## Ecosystem, community and resources

Official websites, tools and resources about BunkerWeb :

- [**Website**](https://www.bunkerweb.io/?utm_campaign=self&utm_source=doc) : get more information, news and articles about BunkerWeb
- [**Panel**](https://panel.bunkerweb.io/?utm_campaign=self&utm_source=doc) : dedicated platform to order and manage professional services (e.g. technical support) around BunkerWeb
- [**Documentation**](https://docs.bunkerweb.io) : technical documentation of the BunkerWeb solution
- [**Demo**](https://demo.bunkerweb.io/?utm_campaign=self&utm_source=doc) : demonstration website of BunkerWeb, don't hesitate to attempt attacks to test the robustness of the solution
- [**Web UI**](https://demo-ui.bunkerweb.io/?utm_campaign=self&utm_source=doc) : online read-only demo of the web UI of BunkerWeb
- [**Configurator**](https://config.bunkerweb.io/?utm_campaign=self&utm_source=doc) : user-friendly tool to help you configure BunkerWeb
- [**Threatmap**](https://threatmap.bunkerweb.io/?utm_campaign=self&utm_source=doc) : live cyber attack blocked by BunkerWeb instances all around the world

Community and social networks :

- [**Discord**](https://discord.com/invite/fTf46FmtyD)
- [**LinkedIn**](https://www.linkedin.com/company/bunkerity/)
- [**Twitter**](https://twitter.com/bunkerity)
- [**Reddit**](https://www.reddit.com/r/BunkerWeb/)
