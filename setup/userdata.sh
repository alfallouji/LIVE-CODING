#!/bin/bash

echo "Deploying app"

# Setup packages and apps
sudo yum update -y

cat > /tmp/subscript.sh << EOF
# Install node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
echo 'export NVM_DIR="/home/ec2-user/.nvm"' >> /home/ec2-user/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> /home/ec2-user/.bashrc
 
# Dot source the files to ensure that variables are available within the current shell
. /home/ec2-user/.nvm/nvm.sh
. /home/ec2-user/.bashrc
nvm install node

currentNode="\$(nvm which current)"
sudo ln -s \$currentNode /usr/bin/node

# Setup db
sudo yum install -y git mysql mariadb-server

# Deploy code
cd /opt
sudo mkdir dev
cd dev/
sudo git clone https://github.com/alfallouji/DEV-WORKSHOP.git

# Copy config file
sudo cp /opt/dev/DEV-WORKSHOP/guestbook-nodejs/conf/guestbook.json.default /opt/dev/DEV-WORKSHOP/guestbook-nodejs/conf/guestbook.json

# Install npm packages
sudo chown ec2-user:ec2-user /opt/dev/ -R
cd /opt/dev/DEV-WORKSHOP/guestbook-nodejs/
npm install

# Deploy DB and schema
sudo systemctl start mariadb
sudo mysqladmin -u root password "chips"
sudo mysql -h localhost -u root -pchips -e "CREATE DATABASE demo"
sudo mysql -h localhost -u root -pchips demo < database/schema_init.sql

# Start the app
nohup sudo /opt/dev/DEV-WORKSHOP/guestbook-nodejs/bin/www > /tmp/server.log 2>&1 &
EOF
 
chown ec2-user:ec2-user /tmp/subscript.sh && chmod a+x /tmp/subscript.sh
sleep 1; su - ec2-user -c "/tmp/subscript.sh"