FROM node:13-alpine

WORKDIR /code

ADD package*.json ./
ADD app ./

RUN npm install

ENTRYPOINT ["node", "app/index.js"]
