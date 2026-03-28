FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads/medical-images uploads/documents uploads/avatars logs

EXPOSE 5000

CMD ["node", "server.js"]
