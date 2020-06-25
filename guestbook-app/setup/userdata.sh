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
sudo yum install -y git

# Deploy code
cd /opt
sudo mkdir guestbook
cd guestbook/
sudo git clone https://github.com/alfallouji/LIVE-CODING.git

# Copy config file
sudo cp /opt/guestbook/LIVE-CODING/guestbook-app/conf/guestbook.json.default /opt/guestbook/LIVE-CODING/guestbook-app/conf/guestbook.json

# Install npm packages
sudo chown ec2-user:ec2-user /opt/guestbook/ -R
cd /opt/guestbook/LIVE-CODING/guestbook-app/
npm install

chmod +x /opt/guestbook/LIVE-CODING/guestbook-app/setup/start.sh
sudo cp /opt/guestbook/LIVE-CODING/guestbook-app/setup/guestbook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable guestbook.service
sudo systemctl start guestbook

sudo amazon-linux-extras install nginx1.12 -y
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak ## backup
sudo cp /opt/guestbook/LIVE-CODING/guestbook-app/setup/nginx.conf /etc/nginx/nginx.conf

# Start the service
sudo systemctl enable nginx
sudo systemctl restart nginx

EOF

chown ec2-user:ec2-user /tmp/subscript.sh && chmod a+x /tmp/subscript.sh
sleep 1; su - ec2-user -c "/tmp/subscript.sh"
