

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
  NAMESPACES=($(kubectl get projects --no-headers | awk '{print $1}'))
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