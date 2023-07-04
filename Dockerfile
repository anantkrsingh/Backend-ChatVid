FROM node:16.3.0-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 4040
CMD ["npm","start"]