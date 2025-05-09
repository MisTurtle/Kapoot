FROM node:23-alpine

WORKDIR /build
COPY package*.json ./

RUN npm install

COPY . .
RUN chmod +x /build/docker_entrypoint.sh

EXPOSE 8000

CMD ["/build/docker_entrypoint.sh"]

