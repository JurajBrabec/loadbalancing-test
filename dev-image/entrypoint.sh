#!/bin/bash
echo "DEV Image"

# Add group write permissions to $HOME folder to be able to delete old files when Openshift user ID changes again
echo "Reseting permissions for ${HOME}"

chown -R openshift:root ${HOME} >/dev/null 2>&1
chmod -R 775 ${HOME} >/dev/null 2>&1

echo "Starting daemon $(date)"

# Create daemon process
while true
do
sleep 1
done