FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p uploads/kyc_documents

EXPOSE 3002

CMD ["node", "src/app.js"]