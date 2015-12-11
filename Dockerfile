FROM resin/raspberrypi2-node:0.10.22

RUN apt-get -q update \
  && apt-get -y install libav-tools

RUN mkdir -p /usr/src/app && ln -s /usr/src/app /app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN DEBIAN_FRONTEND=noninteractive JOBS=MAX npm install --unsafe-perm

CMD npm start

