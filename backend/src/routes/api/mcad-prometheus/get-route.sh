if [[ $(command -v oc) ]] ; then
	oc get route prometheus-portal -n odh -o jsonpath="{.spec.host}" 
else 
	APISERVER=https://kubernetes.default.svc
	SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
	TOKEN=$(cat ${SERVICEACCOUNT}/token)
	CACERT=${SERVICEACCOUNT}/ca.crt
	curl --silent --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET \
	${APISERVER}/apis/route.openshift.io/v1/namespaces/odh/routes | ./jq -r \
	'.items[] | select(.metadata.name=="prometheus-portal") | .spec.host'
fi
