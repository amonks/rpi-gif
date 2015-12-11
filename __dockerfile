# debian node rpi

FROM resin/raspberrypi2-node

MAINTAINER Andrew Monks <a@monks.co>

WORKDIR /app

ONBUILD COPY . /app
ONBUILD RUN npm install --unsafe-perm

CMD ["./bootstrap.sh", "&&", "npm", "start"]

