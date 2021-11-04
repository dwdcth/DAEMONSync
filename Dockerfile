FROM  bitnami/minideb:jessie

RUN apt-get update && apt-get install g++-multilib procps -o APT::Install-Suggests=0 -o APT::Install-Recommends=0 -y &&  rm -rf /var/lib/apt/lists/*

ADD ./DAEMONSync/ /var/DAEMONSync/

WORKDIR /var/DAEMONSync
RUN chmod +x /var/DAEMONSync/start.sh
CMD /var/DAEMONSync/start.sh
