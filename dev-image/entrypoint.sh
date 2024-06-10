#!/bin/bash
echo "DEV Image entrypoint"

# Add group write permissions to persistent volume folders to be able to delete old files when Openshift user ID changes again
echo "Reseting permissions for home folder"
chown -R openshift:root ${HOME} # >/dev/null 2>&1
chmod -R g+w ${HOME} # >/dev/null 2>&1

if [[ ! -d /opt/code-base/excalibur-v4 ]]; then
    echo "Creating repository"
    mkdir -p /opt/code-base/excalibur-v4
fi
echo "Reseting permissions for repository"
chmod -R g+w /opt/code-base/excalibur-v4 # >/dev/null 2>&1


if [[ ! -d /opt/code-base/volumes ]]; then
    echo "Creating volumes"
    mkdir -p /opt/code-base/volumes/{dashboard-static-files,database,grafana-data,loki-data,pam-client-static-files,pam-recordings}
fi
echo "Reseting permissions for volumes"
chmod -R g+w /opt/code-base/volumes # >/dev/null 2>&1

# Create daemon process
echo "Starting daemon $(date)"

while true
do
    sleep 1
done