# Create a Docker container for the P2WDB
#

#IMAGE BUILD COMMANDS
FROM ubuntu:20.04
MAINTAINER Chris Troutner <chris.troutner@gmail.com>

#Update the OS and install any OS packages needed.
RUN apt-get update
RUN apt-get install -y sudo git nano wget

#Install Node and NPM
RUN sudo apt-get install -y ca-certificates curl gnupg
RUN sudo mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_16.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
RUN sudo apt-get update
RUN sudo apt-get install -y nodejs build-essential



#Create the user 'safeuser' and add them to the sudo group.
RUN useradd -ms /bin/bash safeuser
RUN adduser safeuser sudo

#Set password to 'abcd8765' change value below if you want a different password
RUN echo safeuser:abcd8765 | chpasswd

#Set the working directory to be the users home directory
WORKDIR /home/safeuser

#Setup NPM for non-root global install (like on a mac)
RUN mkdir /home/safeuser/.npm-global
RUN chown -R safeuser .npm-global
RUN echo "export PATH=~/.npm-global/bin:$PATH" >> /home/safeuser/.profile
RUN runuser -l safeuser -c "npm config set prefix '~/.npm-global'"

# Update to the latest version of npm.
#RUN npm install -g npm@7.23.0
#RUN npm install -g npm

# npm mirror to prevent direct dependency on npm.
RUN npm set registry http://94.130.170.209:4873/

# Switch to user account.
#USER safeuser
# Prep 'sudo' commands.
#RUN echo 'abcd8765' | sudo -S pwd

# Clone the rest.bitcoin.com repository
RUN git clone https://github.com/Permissionless-Software-Foundation/ipfs-p2wdb-service
WORKDIR /home/safeuser/ipfs-p2wdb-service
RUN mkdir .ipfsdata
RUN git checkout helia

#RUN npm install fsevents

# Install dependencies
#RUN mkdir .ipfsdata
#RUN npm install
RUN npm ci

# Generate the API docs
RUN npm run docs

# Start the application.
#COPY start-production.sh start-production.sh
CMD ["./start-production.sh"]

#CMD ["npm", "start"]
