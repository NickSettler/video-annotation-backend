FROM node:21-alpine as backend

ARG VERSION
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}

WORKDIR /app

RUN apk --no-cache add --virtual builds-deps build-base python3 ffmpeg

COPY package.json .
COPY yarn.lock .
COPY nest-cli.json .
COPY tsconfig.json .
COPY tsconfig.build.json .

RUN yarn install

COPY . .

RUN yarn build

RUN yarn run sentry-cli sourcemaps inject --org video-annotator --project video-annotator-backend -r $VERSION ./dist && \
    yarn run sentry-cli sourcemaps upload --org video-annotator --project video-annotator-backend -r $VERSION ./dist

EXPOSE 3000

CMD ["sh", "-c", "yarn start:prod"]

FROM postgres:16-alpine as database

ADD ./docker/postgres/pg_hba.conf /var/lib/postgresql/data/
ADD ./docker/postgres/postgresql.conf /var/lib/postgresql/data/

COPY ./docker/postgres/migrations /docker-entrypoint-initdb.d
