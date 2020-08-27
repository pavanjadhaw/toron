FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npm run build

EXPOSE 4000

CMD [ "npm", "start"]
