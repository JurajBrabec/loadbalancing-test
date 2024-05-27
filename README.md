# Loadbalancing Test

## gRPC

- https://github.com/grpc/grpc-node/tree/master/examples/helloworld

## Openshift

- https://docs.openshift.com/container-platform/4.15/networking/routes/route-configuration.html
- https://kubernetes.io/docs/reference/networking/virtual-ips/#session-affinity
- https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/developer-cli-commands.html

## Preparations

```sh
@FOR /f "tokens=*" %i IN ('crc oc-env') DO @call %i
git clone https://github.com/JurajBrabec/loadbalancing-test.git
cd loadbalancing-test
```

### Create project

```sh
oc new-project loadbalancing-test
```

### APP_1

Create the frontend app, that listens on port `8000`, responds on route `/test` and queries the backend app via gRPC.

```shell
oc apply -f manifests/app-1.yml
```

#### Optional commands

Set the environment variable for `app_2` connection

```sh
oc set env deployment app-1 APP_2_ADDR=app-2:8080
```

Scale the application as needed

```sh
oc scale deployment app-1 --replicas=2
```

Set the cookie name (by default name is random)

```sh
oc annotate route app-1 router.openshift.io/cookie_name="app_1"
```

Set the route load balancing policy

```sh
 oc annotate route app-1 haproxy.router.openshift.io/balance=leastconn
```

Disable cookies entirely (to test LB via browser too)

```sh
oc annotate route app-1 haproxy.router.openshift.io/disable_cookies=true
```

Remove the app (optional)

```sh
oc delete all --selector app=app-1
```

### APP_2

Create the backend service, that listens on port `8080` (gRPC)

```sh
oc apply -f manifests/app-2.yml
```

### Test the apps

```sh
oc get route app-1 -o jsonpath='{.spec.host}'
set URL=<url>

for /l %l in (0,0,1) do; @curl %URL%/test & echo. & timeout 1 > NUL
```

#### Optional commands

Scale the application as needed

```sh
oc scale deployment app-2 --replicas=4
```

Changes the service type to `LoadBalancer`

```sh
oc patch service app-2 -p '{"spec":{"type":"LoadBalancer"}}'
```

Remove the app-2

```sh
oc delete all --selector app=app-2
```

### Removal

Remove everything at once

```sh
oc delete all --selector app.kubernetes.io/part-of=loadbalancing-test
oc delete project loadbalancing-test
```

## Service Mesh

- https://docs.openshift.com/container-platform/4.15/service_mesh/v2x/installing-ossm.html
- https://developers.redhat.com/articles/2023/01/30/run-app-under-openshift-service-mesh
- https://www.densify.com/openshift-tutorial/openshift-service-mesh/
- https://github.com/rhthsa/openshift-demo/blob/main/openshift-service-mesh.md

### Configure CRC

```sh
crc config set memory 21504
crc config set disk-size 62
```

### Install Operators

```sh
#oc create namespace openshift-operators
oc apply -f manifests/operators.yml -n openshift-operators
```

#### Check installation process

List installed subscriptions

```sh
oc get subscription -A
```

Get current CSV for subscription

```sh
# Jaeger
oc get subscription jaeger -n openshift-operators -o template --template '{{.status.currentCSV}}'

# Kiali
oc get subscription kiali -n openshift-operators -o template --template '{{.status.currentCSV}}'

# Service Mesh
oc get subscription servicemesh -n openshift-operators -o template --template '{{.status.currentCSV}}'
```

Get installation status for a CSV

```sh
oc get csv <csv> -o template --template '{{.status.phase}}'

#'Succeeded'
```

### Install Service Mesh Control Plane

```sh
oc create namespace istio-system
oc apply -f manifests/smcp.yml -n istio-system
```

Get installation status

```sh
oc get smcp -n istio-system

#NAME    READY   STATUS            PROFILES      VERSION   AGE
#basic   9/9     ComponentsReady   ["default"]   2.5.1     80s
```

### Install Service Mesh Member Roll

```sh
oc apply -f manifests/smmr.yml -n istio-system
```

Get installation status

```sh
oc get smmr -n istio-system

#NAME      READY   STATUS       AGE
#default   1/1     Configured   5s

oc get smm

#NAME      CONTROL PLANE        READY   AGE
#default   istio-system/basic   True    5s
```

### Istio configuration

- https://istio.io/latest/docs/reference/config/networking/
- https://istio.io/latest/docs/concepts/traffic-management/#load-balancing-options

```sh
oc apply -f manifests/istio-config.yml
```

### Open the Kiali console

```sh
oc get route kiali -n istio-system -o jsonpath='{.spec.host}'
```

### Service Mesh Removal

```sh
oc delete smcp default -n istio-system
oc delete -f manifests/operators.yml -n istio-system
```
