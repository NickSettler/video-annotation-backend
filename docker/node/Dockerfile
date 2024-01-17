FROM node:21-alpine

WORKDIR /app

RUN apk --no-cache add --virtual builds-deps build-base python3 ffmpeg

COPY package.json .
COPY yarn.lock .
COPY nest-cli.json .
COPY tsconfig.json .
COPY tsconfig.build.json .

RUN npm i -g typeorm

RUN yarn install
