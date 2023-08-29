if [[ $(command -v oc) ]] ; then
	oc get route prometheus-portal -n odh -o jsonpath="{.spec.host}" 
else 
	echo "prometheus-operated.odh.svc.cluster.local:9090"
fi
