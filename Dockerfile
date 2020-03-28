FROM node:13-alpine

WORKDIR /code

ADD package*.json ./
ADD ./app ./app

RUN npm install

ENTRYPOINT ["node", "app/server.js"]
