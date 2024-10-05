FROM node:22-alpine

WORKDIR /joinit

COPY package*.json ./

RUN npm install -g next
RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]