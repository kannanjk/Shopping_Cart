FROM node

WORKDIR /app/first

COPY package.json .

RUN npm install

COPY . . 

EXPOSE 3000

CMD [ "npm","start" ]