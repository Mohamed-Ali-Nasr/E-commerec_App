FROM node:20.17.0 as base



FROM  base as development

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

CMD [ "npm", "run","start:dev" ]



FROM base as production

WORKDIR /app

COPY package*.json .

RUN npm i --only=production

COPY . .

CMD [ "npm", "run","start:prod" ]