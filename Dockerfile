FROM node:23-alpine

WORKDIR /build
COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 4000

CMD ["npm", "run", "prod"]

