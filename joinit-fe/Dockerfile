FROM node:22-alpine

WORKDIR /joinit

COPY package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]