#!/bin/sh
exec openbox-session || echo "Openbox failed" >> /var/log/tornlinux-x.log
