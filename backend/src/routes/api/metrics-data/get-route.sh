if [[ $(command -v oc) ]] ; then # if oc exists, use this command - for local testing
	oc get route prometheus-k8s -n openshift-monitoring -o jsonpath="{.spec.host}" 
else # if oc does not exist
	APISERVER=https://kubernetes.default.svc
	SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
	TOKEN=$(cat ${SERVICEACCOUNT}/token)
	CACERT=${SERVICEACCOUNT}/ca.crt
	curl --silent --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET \
	${APISERVER}/apis/route.openshift.io/v1/namespaces/openshift-monitoring/routes | ./jq -r \
	'.items[] | select(.metadata.name=="prometheus-k8s") | .spec.host'
fi
