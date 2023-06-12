kubectl get appwrapper --all-namespaces --no-headers \
| awk '{print $1, $2}' \
| while read namespace name;
do
    kubectl get appwrapper $name -n $namespace -o json
done