# Loadbalancing Test

## 1. Overview

The situation is that we have two apps, `app-1` and `app-2`, that are connected via gRPC. `app-1` is a frontend app that listens on port `8000`, responds on route `/test` and queries the backend app via gRPC. `app-2` is a backend app that listens on port `8080` (gRPC).

![Loadbalancing Test](image.png)

## 2. <TL;DR>

```sh
# clone repository
git clone https://github.com/JurajBrabec/loadbalancing-test.git
cd loadbalancing-test

# create project and apps
oc new-project loadbalancing-test
oc apply -f manifests/app-1
oc apply -f manifests/app-2

# install Envoy
oc apply -f manifests/envoy

# Modify app-1 to use Envoy
oc set env deployment app-1 APP_2_ADDR=envoy:8080

# Observe APP_1 route route for results.
```

## 3. Preparations

### 3.1 Path to `oc` command (CRC environment only)

```sh
@FOR /f "tokens=*" %i IN ('crc oc-env') DO @call %i
```

### 3.2 Required permissons

Log in to Openshift as a user with `cluster-admin` rights (for Operators installation).

### 4.4 Clone repository

```sh
git clone https://github.com/JurajBrabec/loadbalancing-test.git
cd loadbalancing-test
```

## 4. Install applications

### 4.1 Create project

```sh
oc new-project loadbalancing-test
```

### 4.2 Install APP_1

Create the frontend app, that listens on port `8000`, responds on route `/test` and queries the backend app via gRPC.

```shell
oc apply -f manifests/app-1
```

#### 4.2.1 Optional commands

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

Remove the app

```sh
oc delete all --selector app=app-1
```

### 4.3. Install APP_2

Create the backend service, that listens on port `8080` (gRPC)

```sh
oc apply -f manifests/app-2
```

#### 4.3.1 Optional commands

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

### 4.4 Test the applications

```sh
oc get route app-1 -o jsonpath='{.spec.host}'

#set URL=<url>
# for /l %l in (0,0,1) do; @curl %URL%/test & echo. & timeout 1 > NUL
```

Open the `http://<url>` path in browser

### 4.5 Removal

Remove everything at once

```sh
oc delete all --selector app.kubernetes.io/part-of=loadbalancing-test
oc delete project loadbalancing-test
```

## 5. Envoy

- https://www.envoyproxy.io/docs/envoy/latest/start/install
- https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_protocols/grpc
- https://grpc.io/docs/platforms/web/basics/#configure-the-envoy-proxy
- https://www.redhat.com/en/blog/configuring-envoy-auto-discover-pods-kubernetes

### 5.1 Install Envoy and modify APP_1 to use it

```sh
oc apply -f manifests/envoy
oc set env deployment app-1 APP_2_ADDR=envoy:8080
```
