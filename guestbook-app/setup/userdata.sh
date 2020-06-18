#!/bin/bash

### TODO: Place this script on S3 
# Change the userdata script to download this script from S3 (aws cli or wget)
# Or use curl https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/guestbook-app/setup/userdata.sh | bash
# Arguments:
# - Transmit the REGION (Default: eu-west-1) with Cloudformation/CDK as argument 1 of the script
# Example:
# /bin/bash userdata.sh eu-west-1

DEFAULT_REGION=eu-west-1
REGION=${1:-$DEFAULT_REGION}

PROJECT_REPOSITORY=https://github.com/alfallouji/LIVE-CODING.git


## Redirect journalctl logs to syslog
sed -i 's/#ForwardToSyslog=yes/ForwardToSyslog=yes/g' /etc/systemd/journald.conf
systemctl restart systemd-journald


## Create a rsyslog rule for guestbook app
echo ":syslogtag, startswith, \"guestbook\" /var/log/guestbook.log
& stop" > /etc/rsyslog.d/99-guestbook.conf

systemctl restart rsyslog

## Install CloudWatch Agent
AWSLOGS_BIN=/usr/sbin/awslogsd
if [ ! -f ${AWSLOGS_BIN} ]; then
        yum -y install awslogs
fi
## Install AWS Config file
echo "[general]
state_file = /var/lib/awslogs/agent-state

[/var/log/cloud-init-output.log]
file = /var/log/cloud-init-output.log
buffer_duration = 5000
log_group_name = guestbook-instance-var-log-cloud-init-output
log_stream_name = {instance_id}
datetime_format = %b %d %H:%M:%S
initial_position = start_of_file

[/var/log/guestbook.log]
file = /var/log/guestbook.log
buffer_duration = 5000
log_group_name = guestbook-app-var-log-guestbook
log_stream_name = {instance_id}
datetime_format = %b %d %H:%M:%S
initial_position = start_of_file
" > /etc/awslogs/awslogs.conf

## Change Cloudwatch logs region:
sed -i "s/region = us-east-1/region = ${REGION}/g" /etc/awslogs/awscli.conf

systemctl enable awslogsd
systemctl start awslogsd

NODE_BIN=/usr/bin/node
GIT_BIN=/usr/bin/git

if [ ! -f ${NODE_BIN} ]; then
        ### Install NodeJS Repository
        curl -s https://rpm.nodesource.com/setup_12.x | bash

        ### Install dependencies
        yum -y install nodejs
fi

## Install Git
if [ ! -f ${GIT_BIN} ]; then
        yum -y install git
fi

# Clone the project
PROJECT_DIRECTORY=/opt/guestbook
if [ ! -d ${PROJECT_DIRECTORY} ]; then
        chown ec2-user:ec2-user /opt
        su ec2-user -c "git clone ${PROJECT_REPOSITORY} ${PROJECT_DIRECTORY}"
        su ec2-user -c "cd ${PROJECT_DIRECTORY}/guestbook-app/ && npm install"
fi

## Install the guest book service
GUESTBOOK_SYSTEMD_SERVICE=/etc/systemd/system/guestbook.service

if [ -f ${GUESTBOOK_SYSTEMD_SERVICE} ]; then
        rm -fr ${GUESTBOOK_SYSTEMD_SERVICE}
fi
install --owner root --group root --mode 0644 ${PROJECT_DIRECTORY}/guestbook-app/setup/guestbook.service ${GUESTBOOK_SYSTEMD_SERVICE}


## Activate the service at startup
systemctl daemon-reload
systemctl enable guestbook
systemctl start guestbook