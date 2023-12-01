FROM node:18-alpine
WORKDIR /home/app

ARG SKIP_ENV_VALIDATION=${SKIP_ENV_VALIDATION}
ENV SKIP_ENV_VALIDATION=${SKIP_ENV_VALIDATION}

COPY package.json .
COPY package-lock.json .
COPY prisma/ .

RUN npm i

COPY . .

RUN npm run build
CMD npm start