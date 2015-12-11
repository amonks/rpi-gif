# debian node rpi

FROM resin/raspberrypi2-node

MAINTAINER Andrew Monks <a@monks.co>

ADD bootstrap.sh /app/bootstrap.sh

CMD /app/bootstrap.sh

