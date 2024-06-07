#!/bin/bash

# change default bash for current user id in passwd file
echo "DEV Image - Changing default shell for current user ID in passwd file"
usermod -s /bin/bash $(whoami)
cat /etc/passwd | grep $(whoami)

echo "DEV Image - Starting daemon"
# Create daemon process
while true
do
sleep 1
done