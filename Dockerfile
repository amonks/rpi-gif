FROM shaunmulligan/arch-armv6h-resin

MAINTAINER Andrew Monks <a@monks.co>

# RUN mkdir -p /data/downloads \
#   && mkdir -p /app/transmission/

# ADD settings.json /app/transmission/settings.json
# ADD bootstrap.sh /app/bootstrap.sh
# ADD start.sh /app/start.sh
# ADD mount.sh /app/mount.sh

# RUN pacman -Sy --noconfirm transmission-cli

# VOLUME /data/downloads

# EXPOSE 9091
# EXPOSE 12345

# CMD /app/bootstrap.sh

