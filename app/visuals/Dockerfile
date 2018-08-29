FROM node:10.9.0

WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm install

CMD ["npm", "start"]