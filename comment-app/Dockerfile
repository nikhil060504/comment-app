FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN chmod +x node_modules/.bin/nest
RUN npm run build
CMD ["node", "dist/main.js"]
