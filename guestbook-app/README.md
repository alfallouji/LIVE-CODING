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

 * Add service to systemd (depending on where you have installed the app, you may have to edit paths of the guestbook.service before)
 
        $ sudo cp guestbook.service /etc/systemd/system/
        $ sudo systemctl daemon-reload
        $ sudo systemctl enable guestbook.service
        $ sudo systemctl start guestbook

 * Reload deamon and start service
 
        $ sudo systemctl daemon-reload
        $ sudo systemctl restart guestbook.service       

 * Read logs from the service

        $ journalctl -u guestbook

## Run 
 * Build

        $ npm install

 * Configure (update db settings if needed)

        $ cp conf/guestbook.json.default conf/guestbook.json
        # Edit conf/guestbook.json, set the database connection

 * Run it manually

        $ PORT=8080 bin/www
        # Then open URL http://Replace_IP:8080 (to test the nodejs app directly)
        # or open URL http://Replace_IP/ (to test it via nginx)

 * Run it via systemd
 
         $ sudo systemctl start guestbook.service       
