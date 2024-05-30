## 5. Service Mesh

### 5.1 Configure VM (CRC environment only)

```sh
crc config set memory 21504
crc config set disk-size 62
```

### 5.2 Install Operators

```sh
#oc create namespace openshift-operators
oc apply -f manifests/operators -n openshift-operators
```

#### 5.2.1 Check installation process

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

### 5.3 Install Service Mesh Control Plane

```sh
oc create namespace istio-system
oc apply -f manifests/servicemesh-control-plane.yml -n istio-system
```

Get installation status

```sh
oc get smcp -n istio-system

#NAME    READY   STATUS            PROFILES      VERSION   AGE
#basic   9/9     ComponentsReady   ["default"]   2.5.1     80s
```

### 5.4 Install Service Mesh Member Roll

```sh
oc apply -f manifests/servicemesh-member-roll.yml -n istio-system
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

### 5.5 Istio configuration

- https://istio.io/latest/docs/reference/config/networking/
- https://istio.io/latest/docs/concepts/traffic-management/#load-balancing-options

```sh
oc apply -f manifests/istio-config.yml
```

### 5.6 Open the Kiali console in browser

```sh
oc get route kiali -n istio-system -o jsonpath='{.spec.host}'
```

Open the `http://<url>` path in browser

### 5.7 Service Mesh Removal

```sh
oc delete namespace istio-system
oc delete -f manifests/operators -n openshift-operators
```

## 6. References

### 6.1 gRPC

- https://github.com/grpc/grpc-node/tree/master/examples/helloworld

### 6.2 Openshift

- https://docs.openshift.com/container-platform/4.15/networking/routes/route-configuration.html
- https://kubernetes.io/docs/reference/networking/virtual-ips/#session-affinity
- https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/developer-cli-commands.html

### 6.3 Service Mesh

- https://docs.openshift.com/container-platform/4.15/service_mesh/v2x/installing-ossm.html
- https://developers.redhat.com/articles/2023/01/30/run-app-under-openshift-service-mesh
- https://www.densify.com/openshift-tutorial/openshift-service-mesh/
- https://github.com/rhthsa/openshift-demo/blob/main/openshift-service-mesh.md

### 6.4 Istio

- https://istio.io/latest/docs/reference/config/networking/
- https://istio.io/latest/docs/concepts/traffic-management/#load-balancing-options

istioctl install --set profile=openshift

istioctl uninstall -y --purge
oc delete ns istio-system istio-operator

oc -n istio-system expose svc/istio-ingressgateway --port=http2

oc label namespace loadbalancing-test istio-injection=enabled

## 7 Linkerd

linkerd check --pre
linkerd install-cni | oc apply -f -

> spec template spec containers securityContext: readOnlyRootFilesystem: false privileged: true

oc apply -f manifests\linkerd.yml
oc adm policy add-scc-to-user linkerd-cni-scc -z linkerd-cni -n linkerd-cni

linkerd install --crds | oc apply -f -
linkerd install --linkerd-cni-enabled | oc apply -f -
linkerd check

linkerd uninstall | oc delete -f -

https://github.com/linkerd/linkerd2/issues?q=openshift
