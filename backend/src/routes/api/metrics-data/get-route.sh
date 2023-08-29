if [[ $(command -v oc) ]] ; then # if oc exists, use this command - for local testing
	oc get route prometheus-k8s -n openshift-monitoring -o jsonpath="{.spec.host}" 
else # if oc does not exist
	echo "prometheus-operated.openshift-monitoring.svc.cluster.local:9090"
fi
