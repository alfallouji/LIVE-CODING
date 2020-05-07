# Guestbook App

## Credits
This code mainly comes from this repository https://github.com/ysl/guestbook - with very small changes.

## Environment
 * Ubuntu 14.04
 * Node.js
 * MySQL

## Install necessary package
 * Node.js

        $ sudo apt-get -y install nodejs npm
        $ sudo ln -s /usr/bin/nodejs /usr/bin/node

 * MySQL client

        $ sudo apt-get -y install mysql-client

## Setup database
 * Create database

        $ mysql -h localhost -u root -p -e "CREATE DATABASE demo"

 * Create schema

        $ mysql -h localhost -u root -p demo < database/schema_init.sql

## Setup Nginx as reverse proxy
  * Deploy nginx using apt-get 
        $ sudo apt-get -y install nginx
        
  * Configure nginx.conf (update /etc/nginx/nginx.conf)
  
        location / {
           proxy_pass http://127.0.0.1:8080;
        }
        
  * Add nginx to systemctl 
        $ sudo systemctl enable nginx
        $ sudo systemctl restart nginx  
  
## Install guestbook as a systemd service
    * Set execution permission
        $ cd guestbook-app/setup
        $ chmod +x start.sh

    * Add service to systemd
        $ sudo cp guestbook.service /etc/systemd/system/
        $ sudo systemctl daemon-reload
        $ sudo systemctl enable guestbook.service
        $ sudo systemctl start guestbook

    * Reload deamon and start service
        $ sudo systemctl daemon-reload
        $ sudo systemctl restart guestbook.service       

## Run
 * Build

        $ npm install

 * Configure

        $ cp conf/guestbook.json.default conf/guestbook.json
        # Edit conf/guestbook.json, set the database connection

 * Run

        $ bin/www
        # Then open URL http://localhost:3000
