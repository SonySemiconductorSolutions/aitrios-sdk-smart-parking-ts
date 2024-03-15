FROM node:18-bullseye

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
RUN npm install react-scripts@^5.0.1 sass@^1.70.0 -g

COPY --chown=node:node server ./server
COPY --chown=node:node web ./web

WORKDIR /usr/src/app/web
RUN npm install

WORKDIR /usr/src/app/server
RUN npm install
RUN npm run build-ui

USER node

# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 8080
CMD [ "node", "server.js" ]