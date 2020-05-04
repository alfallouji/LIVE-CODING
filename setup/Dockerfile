FROM amazonlinux:latest

RUN yum update -y
RUN yum install shadow-utils.x86_64 sudo -y
RUN yum install -y git mysql
RUN yum install -y gcc-c++ make
RUN curl -sL https://rpm.nodesource.com/setup_12.x | sudo -E bash -
RUN yum install -y nodejs

RUN useradd -m -s /bin/bash ec2-user
RUN echo "user ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/user && \
    chmod 0440 /etc/sudoers.d/user

#RUN mkdir /opt/demo/
RUN chown ec2-user:ec2-user /home/ec2-user -R

USER ec2-user

RUN echo "Deploying app"

# Install node
#RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
#RUN echo 'export NVM_DIR="/home/ec2-user/.nvm"' >> /home/ec2-user/.bashrc
#RUN echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> /home/ec2-user/.bashrc

# Dot source the files to ensure that variables are available within the current shell
#RUN . /home/ec2-user/.nvm/nvm.sh
#RUN . /home/ec2-user/.bashrc
RUN cd /home/ec2-user/
#CMD ["nvm install node"]

#CMD [currentNode="$(nvm which current)"]
#CMD ["ln -s $currentNode /usr/bin/node"]

# Deploy code
#RUN cd /opt/demo/
RUN git clone https://github.com/alfallouji/DEV-WORKSHOP.git /home/ec2-user/DEV-WORKSHOP

# Copy config file
RUN cp /home/ec2-user/DEV-WORKSHOP/guestbook-nodejs/conf/guestbook.json.default /home/ec2-user/DEV-WORKSHOP/guestbook-nodejs/conf/guestbook.json

# Install npm packages
#RUN chown ec2-user:ec2-user /opt/demo/ -R
USER root
RUN npm install /home/ec2-user/DEV-WORKSHOP/guestbook-nodejs/

# Start the app
RUN nohup /home/ec2-user/DEV-WORKSHOP/guestbook-nodejs/bin/www > /tmp/server.log 2>&1 &

#move this task definition
#chown ec2-user:ec2-user /tmp/subscript.sh && chmod a+x /tmp/subscript.sh
#sleep 1; su - ec2-user -c "/tmp/subscript.sh"
