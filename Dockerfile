FROM node:21-alpine
WORKDIR /home/app
COPY package.json .
COPY package-lock.json .
COPY prisma/ .
RUN npm i
COPY . .
RUN npm run build
CMD npm start