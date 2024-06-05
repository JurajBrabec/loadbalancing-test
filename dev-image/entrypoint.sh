#!/bin/ash

# Set SSH password
echo root:${SSH_PASSWORD:-password} | sudo chpasswd

# Run ssh server
/usr/sbin/sshd