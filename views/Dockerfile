FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY dashboard.js ./
COPY error.ejs ./views/
COPY index.ejs ./views/
COPY dashboard.ejs ./views/
EXPOSE 3005
CMD [ "node", "dashboard.js" ]

