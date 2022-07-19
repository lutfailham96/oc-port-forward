# oc-port-forward
Simpe Openshift port forward wrapper

## Usage
```shell
$ npx oc-port-forward

Usage:
	--project	Project name, ex: my-project
	--pods		Pods name to be forwarded, usually same as deployment name
	--port		Forwarded port, ex: 8080:8080
```

### Example usage
```shell
npx oc-port-forward --project my-project --pods webserver --port 8080:8080
```
