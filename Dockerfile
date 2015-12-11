# debian node rpi

FROM resin/raspberrypi2-node

MAINTAINER Andrew Monks <a@monks.co>

RUN mkdir -p /app
WORKDIR /app

ONBUILD COPY . /app
ONBUILD RUN npm install --unsafe-perm

CMD ["./bootstrap.sh"]

