FROM node:18.19

# install build deps
RUN apk add python3 py3-pip build-base

# install deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# build ts files
COPY ./src ./src
COPY tsconfig.json ./
RUN npm install typescript --save-dev
RUN npm run tsc
CMD ["npm run register"]

CMD ["node", "./build/index.js"]
