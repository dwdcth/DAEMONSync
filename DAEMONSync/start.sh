#!/bin/sh
NAME=daemonsync
DAEMON=/var/DAEMONSync/$NAME
PIDFILE=/var/run/$NAME.pid
LOGFILE=/var/DAEMONSync/DTMediaSyncSvc.log
start-stop-daemon --start --quiet --background --pidfile $PIDFILE --exec $DAEMON
touch $LOGFILE
tail -f $LOGFILE
