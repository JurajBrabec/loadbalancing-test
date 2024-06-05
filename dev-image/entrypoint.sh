#!/bin/ash

# Set SSH password
echo root:${SSH_PASSWORD:-password} | chpasswd

# Run ssh server
/usr/sbin/sshd