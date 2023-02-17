FROM node:lts-alpine3.17

RUN apk update \
    && apk add git

WORKDIR /nft_bridge_backend

COPY . .

RUN yarn install

EXPOSE 8331

CMD ["yarn", "dev"]
