# Deployment Instructions

This document outlines the step-by-step instructions to deploying the MCAD dashboard via the manifests in this repo. 

## 0. Requirements

MCAD requires the following tools to deploy onto Openshift:

- [kustomize](https://github.com/kubernetes-sigs/kustomize)
- [OpenShift CLI](https://docs.openshift.com/container-platform/4.12/cli_reference/openshift_cli/getting-started-cli.html)

## 1. Log in to your Openshift Cluster

You can log into your Openshift cluster in two ways:

- use the `oc login` command [`oc login --token=XXX --server=XXX`]
- use the `make login` target available in the Makefile. 
    - If using `make login` add login credentials in .env file and make sure `OC_PROJECT=project_name` is without QUOTATION

## 2. Deploy the ODH Operator

The MCAD Dashboard is integrated to the ODH Dashboard, which is reliant on a couple of ODH stack components. So we need to deploy the ODH Operator along with a base KfDef.

First let's deploy the ODH Operator:

1. In the Openshift console, navigate to `Operators > OperatorHub` in the sidebar menu.
    - On top, you have to change the project to `ODH`/ or the project where you want odh to run [important step] before installing KfDef
2. In the search menu, search for `Open Data Hub Operator` and click on the matching operator. 
3. Keep the default settings and install the Operator

Given a couple minutes, the Operator should be up and running. 

Typically deploying the ODH operator additionally deploys several components including the ODH Dashboard. This currently conflicts with the manifests in this repo and needs to be delete.  This is as simple as editing a KF Def that is deployed by default in the ODH Operator. 

1. In the Openshift console, navigate to `Operators > Installed Operators` in the sidebar menu. 
2. Select the ODH Operator, then in the operator submenu, go to the `KfDef` tab
3. The `KfDef` tab is empty, click on `Create KfDef`
4. Now we are going to edit the YAML for this KFDef. Select `YAML` from the submenu, and notice that under `spec > applications` there is a list. 
5. Search for the item in the list with `name: odh-dashboard` and delete this item. Click `Save` at the bottom. 

## Deploy the Manifests

Finally, with the ODH Operator up and running, we simply need to deploy the manifests in this repo. From the home directory of this repo, this is as simple as running 

```
make deploy
``` 

### About the manifests

The above command deploys the manifests as defined in this repo's `manifests/base` directory. This means you should be able to modify the deployment according to how you need. 

Notably, if you attempt to build your own images and want to deploy, see `manifests/base/kustomization.yaml` and modify the relevant image tags at the bottom of the file. 

## Undeploy the Manifests

To clean the deployment, run the following command:

```
make undeploy
```