FROM node:17.9.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
RUN npm install react-scripts sass -g

COPY server ./server
COPY web ./web

WORKDIR /usr/src/app/web
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/server
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 8080
CMD [ "node", "server.js" ]