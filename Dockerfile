FROM node:20

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml .
RUN corepack enable
RUN yarn install
COPY . .
RUN yarn build

CMD ["yarn", "start:fly"]

