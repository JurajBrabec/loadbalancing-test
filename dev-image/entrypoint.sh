#!/bin/bash
echo "DEV Image"

# Add group write permissions to persistent volume folders to be able to delete old files when Openshift user ID changes again
echo "Reseting permissions for home"
chown -R openshift:root ${HOME} # >/dev/null 2>&1
chmod -R g+w ${HOME} # >/dev/null 2>&1
echo "Reseting permissions for repository"
chmod -R g+w ${HOME}/../excalibur-v4 # >/dev/null 2>&1
echo "Reseting permissions for volumes"
chmod -R g+w ${HOME}/../volumes # >/dev/null 2>&1

echo "Starting daemon $(date)"

# Create daemon process
while true
do
sleep 1
done