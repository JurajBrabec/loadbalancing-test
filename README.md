## Service Mesh

- https://docs.openshift.com/container-platform/4.15/service_mesh/v1x/ossm-architecture.html
- https://developers.redhat.com/articles/2023/01/30/run-app-under-openshift-service-mesh
- https://www.densify.com/openshift-tutorial/openshift-service-mesh/
- https://github.com/rhthsa/openshift-demo/blob/main/openshift-service-mesh.md

## gRPC

https://github.com/grpc/grpc-node/tree/master/examples/helloworld

## Openshift

- https://docs.openshift.com/container-platform/4.15/networking/routes/route-configuration.html
- https://kubernetes.io/docs/reference/networking/virtual-ips/#session-affinity
- https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/developer-cli-commands.html

### Create project

```sh
oc new-project servicemesh-test
```

### APP_1

Create the frontend app, that listens on port `8000`, responds on route `/` and queries the backend via gRPC.

```shell
oc new-app https://github.com/JurajBrabec/xclbr-be.git --context-dir=app_1 --strategy docker --name app-1 --labels app.kubernetes.io/part-of=servicemesh
```

Set the environment variable for `app_2` connection

```sh
oc set env deployment app-1 APP_2_ADDR=app-2:8080
```

Scale the application as needed

```sh
oc scale deployment app-1 --replicas=2
```

Expose the service to public. Optionally set the URL variable for future use in tests.

```sh
oc expose service app-1
oc get route app-1 -o jsonpath='{.spec.host}'
# set URL=<url>
```

Set the cookie name (optional, by default name is random)

```sh
oc annotate route app-1 router.openshift.io/cookie_name="app_1"
```

Set the load balancing policy (optional)

```sh
 oc annotate route app-1 haproxy.router.openshift.io/balance=roundrobin
```

Disable cookies entirely (optional - to test LB via browser too)

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
oc new-app https://github.com/JurajBrabec/xclbr-be.git --context-dir=app_2 --strategy docker --name app-2 --labels app.kubernetes.io/part-of=servicemesh
```

Scale the application as needed

```sh
oc scale deployment app-2 --replicas=3
```

Changes the service type to `LoadBalancer` (optional)

```sh
oc patch service app-2 -p '{"spec":{"type":"LoadBalancer"}}'
```

Remove the app (optional)

```sh
oc delete all --selector app=app-2
```

Remove everything at once (optional)

```sh
oc delete all --selector app.kubernetes.io/part-of=servicemesh
oc delete project servicemesh-test
```

### Test the apps

`for /l %l in (0,0,1) do; @curl %URL% & echo. & timeout 1 > NUL`

### Configure CRC

```sh
crc config set memory 21504
crc config set disk-size 62
```

### Delete evicted pods

```sh
oc get pods --all-namespaces -o json | jq '.items[] | select(.status.reason!=null) | select(.status.reason | contains("Evicted")) | "oc delete pods \(.metadata.name) -n \(.metadata.namespace)"' | xargs -n 1 bash -c
```

## Service Mesh

- https://github.com/rhthsa/openshift-demo/blob/main/openshift-service-mesh.md

### Install

#### Operators

`ossm-sub.yml`

```yaml
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: kiali-ossm
  namespace: openshift-operators
spec:
  channel: stable
  installPlanApproval: Automatic
  name: kiali-ossm
  source: redhat-operators
  sourceNamespace: openshift-marketplace
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: jaeger-product
  namespace: openshift-operators
spec:
  channel: stable
  installPlanApproval: Automatic
  name: jaeger-product
  source: redhat-operators
  sourceNamespace: openshift-marketplace
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  labels:
    operators.coreos.com/servicemeshoperator.openshift-operators: ''
  name: servicemeshoperator
  namespace: openshift-operators
spec:
  channel: stable
  installPlanApproval: Automatic # Manual,Automatic
  #startingCSV: servicemeshoperator.v2.1.3
  name: servicemeshoperator
  source: redhat-operators
  sourceNamespace: openshift-marketplace
# oc -n openshift-operators get installplans -l operators.coreos.com/servicemeshoperator.openshift-operators= -oname | \
#xargs -r -n 1 oc -n openshift-operators patch --type json --patch '[{"op": "replace", "path": "/spec/approved", "value": true }]'
```

CLI

```sh
oc apply -f ossm-sub.yaml
sleep 10
oc wait --for condition=established --timeout=180s \
crd/servicemeshcontrolplanes.maistra.io \
crd/kialis.kiali.io \
crd/jaegers.jaegertracing.io
oc get csv
```

Output

```
customresourcedefinition.apiextensions.k8s.io/servicemeshcontrolplanes.maistra.io condition met
customresourcedefinition.apiextensions.k8s.io/kialis.kiali.io condition met
customresourcedefinition.apiextensions.k8s.io/jaegers.jaegertracing.io condition met
NAME                               DISPLAY                                                 VERSION    REPLACES                           PHASE
jaeger-operator.v1.38.0-2          Red Hat OpenShift distributed tracing platform          1.38.0-2   jaeger-operator.v1.36.0-2          Succeeded
kiali-operator.v1.57.3             Kiali Operator                                          1.57.3     kiali-operator.v1.48.3             Succeeded
servicemeshoperator.v2.3.0         Red Hat OpenShift Service Mesh                          2.3.0-0    servicemeshoperator.v2.2.3         Succeeded
```

#### Service Mesh Control plane

`smcp.yml`

```yaml
apiVersion: maistra.io/v2
kind: ServiceMeshControlPlane
metadata:
  name: basic
spec:
  version: v2.4 # Change this to match your OSSM Version
  tracing:
    sampling: 10000 # scaled integer, 0-100% in 0.01% increments, i.e. 1=.001%, 100=1%, 10000=100%
    type: Jaeger
  proxy:
    networking:
      trafficControl:
        outbound:
          policy: ALLOW_ANY # Change to REGISTRY_ONLY to block by default
    accessLogging:
      # both may be specified
      file:
        name: /dev/stdout # file name
        encoding: TEXT # TEXT or JSON
        # format: cutom-format # format for log messages
      # envoySerivce:
      #   enabled: false
  security:
    dataPlane:
      mtls: false
      automtls: false
    controlPlane:
      mtls: false
  policy:
    type: Istiod # or Mixer or Remote, Mixer is default for pre v2.0
  telemetry:
    type: Istiod
  gateways:
    openshiftRoute:
      enabled: true
    ingress:
      routeConfig: # specifies whether to create an OpenShift Route for istio-ingressgateway
        enabled: true
      # runtime:
      #     container:
      #       resources:
      #         requests:
      #           cpu: 10m
      #           memory: 128Mi
      #         limits:
      #           cpu: 500m
      #           memory: 512Mi
      # deployment:
      #   autoScaling:
      #     maxReplicas: 4
      #     minReplicas: 1
      #     targetCPUUtilizationPercentage: 85
      #     enabled: true
      #   podDisruption:
      #     enabled: false
      #   pod:
      #     tolerations:
      #     - key: node.kubernetes.io/unreachable
      #       operator: Exists
      #       effect: NoExecute
      #       tolerationSeconds: 60
      # service:
      #   type: ClusterIP
    egress:
      enabled: false
  general:
    logging:
      # componentLevels:
      #   default: info
      logAsJSON: false
    validationMessages: false
  addons:
    grafana:
      enabled: true
    jaeger:
      install:
        storage:
          type: Memory
    kiali:
      enabled: true
    prometheus:
      enabled: true
  runtime:
    defaults:
      container:
        imagePullPolicy: Always
    components:
      prometheus:
        deployment:
          replicas: 2
        pod:
          tolerations:
            - key: node.kubernetes.io/unreachable
              operator: Exists
              effect: NoExecute
              tolerationSeconds: 60
    # defaults:
    #   deployment:
    #     podDisruption:
    #       enabled: false
    #       minAvailable: 1
#### Annotation for Prometheus - OSSM 2.0
# prometheus.io/path: /metrics
# prometheus.io/port: "8080"
# prometheus.io/scrape: "true"
# prometheus.istio.io/merge-metrics: "true"
# sidecar.istio.io/inject: "true"
# traffic.sidecar.istio.io/excludeInboundPorts: "15020"

#### Annotation for Prometheus - OSSM 2.1
# prometheus.io/path: /metrics
# prometheus.io/port: "8080"
# prometheus.io/scrape: "true"
# sidecar.istio.io/inject: "true"

#### Update Network Policy
# cat << EOF |oc apply -f -
# apiVersion: networking.k8s.io/v1
# kind: NetworkPolicy
# metadata:
#   name: user-workload-access
#   namespace: bookinfo
# spec:
#   ingress:
#   - from:
#     - namespaceSelector:
#         matchLabels:
#           network.openshift.io/policy-group: monitoring
#   podSelector: {}
#   policyTypes:
#   - Ingress
# EOF
```

CLI

```sh
oc new-project istio-system
oc create -f manifests/smcp.yaml -n istio-system

watch oc get smcp/basic -n istio-system
```

Output

```
NAME    READY   STATUS            PROFILES      VERSION   AGE
basic   9/9     ComponentsReady   ["default"]   2.3.0     80s
```

#### Service Mesh Member Roll

`smmr.yml`

```yml
apiVersion: maistra.io/v1
kind: ServiceMeshMemberRoll
metadata:
  name: default
spec:
  members:
    - servicemesh-test
```

CLI

```sh
oc create -f manifests/smmr.yaml -n istio-system

oc describe smmr/default -n istio-system | grep -A2 Spec:
```

Output

```

```
