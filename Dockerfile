FROM node:21-alpine
WORKDIR /home/app

ARG SKIP_ENV_VALIDATION=true
ENV SKIP_ENV_VALIDATION=true

COPY package.json .
COPY package-lock.json .
COPY prisma/ .

RUN npm i

COPY . .

RUN npm run build
CMD npm start