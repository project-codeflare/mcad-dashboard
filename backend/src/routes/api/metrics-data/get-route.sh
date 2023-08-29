if oc get route prometheus-k8s -n openshift-monitoring -o jsonpath="{.spec.host}" ; then
	oc get route prometheus-k8s -n openshift-monitoring -o jsonpath="{.spec.host}" 
else 
	echo "prometheus-operated.openshift-monitoring.svc.cluster.local:9090"
fi
