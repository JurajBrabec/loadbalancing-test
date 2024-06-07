#!/bin/bash

# default bash for current user id in passwd file
echo "DEV Image - Default shell for current user ID in passwd file"
# usermod -s /bin/bash $(whoami)
cat /etc/passwd | grep $(whoami)

echo "DEV Image - Reseting permissions"
chown -R openshift:root /opt/code-base; chmod -R 775 /opt/code-base

echo "DEV Image - Starting daemon"
# Create daemon process
while true
do
sleep 1
done