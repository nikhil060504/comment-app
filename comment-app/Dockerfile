# FROM node:20-alpine
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --legacy-peer-deps

# COPY . .
# RUN chmod +x node_modules/.bin/nest
# RUN npm run build
# ENV NODE_OPTIONS=--max-old-space-size=2048
# CMD ["npm", "run", "start:prod"]


FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN chmod +x node_modules/.bin/nest

RUN npm run build

# Prevent heap crash on Render
ENV NODE_OPTIONS=--max-old-space-size=2048

CMD ["npm", "run", "start:prod"]


