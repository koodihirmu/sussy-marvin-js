# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
RUN npm install --os=linux --libc=musl --cpu=x64 sharp
RUN apk add imagemagick
RUN apk add texlive-full
CMD ["npm", "run", "main"]
EXPOSE 80
