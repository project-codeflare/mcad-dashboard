#!/bin/sh

if [[ $(command -v kubectl) ]] ; then
	if kubectl get appwrapper --all-namespaces &>/dev/null; then
	# Admin User
	  kubectl get appwrapper --all-namespaces --no-headers \
	  | awk '{print $1, $2}' \
	  | while read namespace name;
	  do
	    kubectl get appwrapper $name -n $namespace -o json
	  done
	# Non-Admin User
	else
	  NAMESPACES=$(kubectl get projects --no-headers | awk '{print $1}')
	  for namespace in "${NAMESPACES[@]}"; do
	    output=$(kubectl get appwrapper -n $namespace --no-headers | awk '{print $1}')
	    if [[ -z "$output" ]]; then
	        continue
	    else
	        for appwrapper_name in $output; do
	        kubectl get appwrapper "$appwrapper_name" -n "$namespace" -o json
	        done
	    fi
	   done 2>/dev/null
	fi

else 
	APISERVER=https://kubernetes.default.svc
	SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
	TOKEN=$(cat ${SERVICEACCOUNT}/token)
	CACERT=${SERVICEACCOUNT}/ca.crt
	curl --silent --cacert ${CACERT} \
	     --header "Authorization: Bearer ${TOKEN}" -X GET \
	     ${APISERVER}/apis/mcad.ibm.com/v1beta1/appwrappers | ./jq \
	     '.items[]'

fi
