FROM shaunmulligan/arch-armv6h-resin

MAINTAINER Andrew Monks <a@monks.co>

RUN echo gpu-mem=128 > /boot/config.txt \
  && echo start_file=start_x.elf > /boot/config.txt \
  && echo fixup_file=fixup_x.dat > /boot/config.txt

