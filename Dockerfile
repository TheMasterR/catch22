FROM node:13-alpine

WORKDIR /app

ADD package*.json ./
ADD app ./

RUN npm install

ENTRYPOINT ["node", "app/index.js"]
