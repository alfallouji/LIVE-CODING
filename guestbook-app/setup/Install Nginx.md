# Install NGINX on Amazon Linux to act as reverse proxy

```
sudo yum install -y amazon-linux-extras
sudo amazon-linux-extras install nginx1.12
```

Then replace /etc/nginx/nginx.conf with the one in this repository

```
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak ## backup
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo systemctl enable nginx
sudo systemctl restart nginx
```
