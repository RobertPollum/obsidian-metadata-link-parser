---
title: Replacing Service Principal Secrets in Crossplane with Azure Workload Identity Federation
link: https://hackernoon.com/replacing-service-principal-secrets-in-crossplane-with-azure-workload-identity-federation?source=rss
author: Piyush Jajoo
publish_date: 2026-01-16 23:00:08
saved_date: 2026-01-17 15:10:00
image: https://hackernoon.com/https://cdn.hackernoon.com/images/2jqChkrv03exBUgkLrDzIbfM99q2-2c024ql.jpeg
tags: #azure #federated-identity-management #cross-cloud-strategy #eks #kind #local-dev-environment #github-actions #credential-free-azure-auth
---

![image](https://hackernoon.com/https://cdn.hackernoon.com/images/2jqChkrv03exBUgkLrDzIbfM99q2-2c024ql.jpeg)

When using Crossplane to provision Azure resources from Kubernetes, authentication becomes a critical challenge. Traditional approaches using service principal secrets are insecure and operationally complex. This blog post shares how we solved Azure authentication using Workload Identity Federation across three distinct deployment scenarios:

1.  **Local Development**: Kind cluster with Crossplane on developer laptops
2.  **CI/CD Pipeline**: GitHub Actions running Kind cluster with Crossplane for automated testing
3.  **Production**: EKS cluster with Crossplane managing Azure infrastructure

Each scenario presented unique challenges, and we’ll share the exact configurations, code snippets, and solutions that made credential-free Azure authentication work seamlessly across all environments.

## The Challenge: Why Traditional Approaches Fall Short

Before diving into solutions, let’s understand the problem we were solving:

### Traditional Approach: Service Principal Secrets

```yaml
# ❌ The old way - storing secrets
apiVersion: v1
kind: Secret
metadata:
  name: azure-credentials
type: Opaque
data:
  clientId: base64-encoded-client-id
  clientSecret: base64-encoded-secret  # Long-lived credential!
  tenantId: base64-encoded-tenant-id
```

**Problems:**

-   Long-lived credentials stored in Kubernetes secrets
-   Manual rotation required
-   Security risk if secrets are compromised
-   Different authentication patterns across environments
-   Secret management overhead

### Our Goal: Workload Identity Federation

We wanted to achieve:

-   ✅ **Zero stored secrets** across all environments
-   ✅ **Automatic token rotation** with short-lived credentials
-   ✅ **Consistent authentication pattern** from local dev to production
-   ✅ **Individual developer isolation** in local development
-   ✅ **Clear audit trail** for all Azure operations

## Understanding Azure Workload Identity Federation

Before diving into each scenario, let’s understand the core concept:

![](https://cdn.hackernoon.com/images/ywCyl8mvkZWzqsISZFO2B08cv812-2026-01-17T04:00:06.426Z-kdprvxw28qqvhjx2dail551h)

**Key Components:**

1.  **OIDC Provider**: Kubernetes cluster’s identity provider (must be publicly accessible)
2.  **Service Account Token**: Short-lived JWT issued by Kubernetes
3.  **Federated Credential**: Trust relationship in Azure AD
4.  **Token Exchange**: JWT → Azure access token

## Scenario 1: Production EKS with Crossplane

### Overview

In production, we run Crossplane on EKS clusters to provision and manage Azure resources. EKS provides a native OIDC provider that Azure can validate directly.

### Architecture

![](https://cdn.hackernoon.com/images/ywCyl8mvkZWzqsISZFO2B08cv812-2026-01-17T04:00:06.434Z-svpqwggwoqdeuft5s04xjgnl)

### Step 1: EKS Cluster Configuration

EKS clusters come with OIDC provider enabled by default. Get your OIDC provider URL:

```bash
# Get EKS OIDC provider URL
aws eks describe-cluster --name your-cluster-name \
  --query "cluster.identity.oidc.issuer" --output text

# Example output: https://oidc.eks.us-east-1.amazonaws.com/id/EXAMPLED539D4633E53DE1B71EXAMPLE
```

### Step 2: Azure AD Application Setup

Create an Azure AD application for production:

```bash
# Create Azure AD application
az ad app create --display-name "crossplane-production-azure"

# Get the client ID
AZURE_CLIENT_ID=$(az ad app list --display-name "crossplane-production-azure" \
  --query "[0].appId" -o tsv)

# Get tenant ID
AZURE_TENANT_ID=$(az account show --query tenantId -o tsv)

echo "Client ID: $AZURE_CLIENT_ID"
echo "Tenant ID: $AZURE_TENANT_ID"
```

### Step 3: Create Federated Credential

Configure the trust relationship between EKS and Azure AD:

```bash
# Get EKS OIDC issuer (without https://)
EKS_OIDC_ISSUER=$(aws eks describe-cluster --name your-cluster-name \
  --query "cluster.identity.oidc.issuer" --output text | sed 's|https://||')

# Create federated credential
az ad app federated-credential create \
  --id $AZURE_CLIENT_ID \
  --parameters '{
    "name": "eks-crossplane-federated-credential",
    "issuer": "https://'"$EKS_OIDC_ISSUER"'",
    "subject": "system:serviceaccount:crossplane-system:provider-azure-sa",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

### Step 4: Assign Azure Permissions

Grant necessary permissions to the Azure AD application:

```bash
# Assign Contributor role
az role assignment create \
  --role "Contributor" \
  --assignee $AZURE_CLIENT_ID \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID"

# Assign User Access Administrator (if needed for role assignments)
az role assignment create \
  --role "User Access Administrator" \
  --assignee $AZURE_CLIENT_ID \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID"
```

### Step 5: Crossplane Deployment Configuration

Configure Crossplane to use workload identity:

```yaml
# deployment-runtime-config.yaml
apiVersion: pkg.crossplane.io/v1beta1
kind: DeploymentRuntimeConfig
metadata:
  name: azure-provider-deployment-runtime-config
spec:
  serviceAccountTemplate:
    metadata:
      name: provider-azure-sa
      annotations:
        azure.workload.identity/client-id: "YOUR_AZURE_CLIENT_ID"
        azure.workload.identity/tenant-id: "YOUR_AZURE_TENANT_ID"
      labels:
        azure.workload.identity/use: "true"
  deploymentTemplate:
    spec:
      template:
        spec:
          containers:
          - name: package-runtime
            env:
            - name: AZURE_CLIENT_ID
              value: "YOUR_AZURE_CLIENT_ID"
            - name: AZURE_TENANT_ID
              value: "YOUR_AZURE_TENANT_ID"
            - name: AZURE_FEDERATED_TOKEN_FILE
              value: "/var/run/secrets/azure/tokens/azure-identity-token"
            volumeMounts:
            - name: azure-identity-token
              mountPath: /var/run/secrets/azure/tokens
              readOnly: true
          volumes:
          - name: azure-identity-token
            projected:
              sources:
              - serviceAccountToken:
                  path: azure-identity-token
                  audience: api://AzureADTokenExchange
                  expirationSeconds: 3600
```

### Step 6: Azure Provider Configuration

Configure the Crossplane Azure provider:

```yaml
# provider-config.yaml
apiVersion: azure.upbound.io/v1beta1
kind: ProviderConfig
metadata:
  name: default
spec:
  credentials:
    source: OIDCTokenFile
  subscriptionID: "YOUR_AZURE_SUBSCRIPTION_ID"
  tenantID: "YOUR_AZURE_TENANT_ID"
  clientID: "YOUR_AZURE_CLIENT_ID"
```

### Step 7: Deploy Crossplane Provider

```bash
# Install Crossplane
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm install crossplane crossplane-stable/crossplane \
  --namespace crossplane-system --create-namespace

# Install Azure provider
kubectl apply -f - <<EOF
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-azure-network
spec:
  package: xpkg.upbound.io/upbound/provider-azure-network:v0.39.0
  runtimeConfigRef:
    name: azure-provider-deployment-runtime-config
EOF

# Apply provider config
kubectl apply -f provider-config.yaml
```

### Verification

\# Check provider status kubectl get providers

# Check provider pods

```bash
# Check provider status
kubectl get providers

# Check provider pods
kubectl get pods -n crossplane-system

# Verify token projection
kubectl exec -n crossplane-system deployment/provider-azure-network -- \
  ls -la /var/run/secrets/azure/tokens/

# Test Azure connectivity
kubectl logs -n crossplane-system deployment/provider-azure-network \
  -c package-runtime --tail=50
```

## Scenario 2: Local Development with Kind and ngrok

### Overview

Local development presented the biggest challenge: Kind clusters don’t have publicly accessible OIDC providers, but Azure needs to validate tokens against public endpoints. Our solution uses ngrok to expose the Kind cluster’s OIDC endpoints.

### The Problem

![](https://cdn.hackernoon.com/images/ywCyl8mvkZWzqsISZFO2B08cv812-2026-01-17T04:00:06.435Z-n019yyiox391zwjfjd3bjl56)

### The Solution: ngrok Tunnel

![](https://cdn.hackernoon.com/images/ywCyl8mvkZWzqsISZFO2B08cv812-2026-01-17T04:00:06.436Z-t2s2l10gblf5vg806aod4pco)

### Step 1: Install Prerequisites

```bash
# Install ngrok
brew install ngrok

# Authenticate ngrok (get token from ngrok.com)
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Install Kind
brew install kind

# Install kubectl
brew install kubectl
```

### Step 2: Start ngrok Tunnel

```bash
# Start ngrok tunnel to expose Kubernetes API server
ngrok http https://localhost:6443 --log=stdout > /tmp/ngrok.log 2>&1 &

# Wait for ngrok to start
sleep 3

# Get ngrok public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | \
  jq -r '.tunnels[0].public_url')

echo "ngrok URL: $NGROK_URL"
# Example: https://abc123.ngrok.io
```

### Step 3: Create Kind Cluster with ngrok OIDC

This is the critical configuration that makes it work:

```bash
# Create Kind cluster with ngrok as OIDC issuer
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: crossplane-dev
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: ClusterConfiguration
    apiServer:
      extraArgs:
        service-account-issuer: ${NGROK_URL}
        service-account-jwks-uri: ${NGROK_URL}/openid/v1/jwks
        service-account-signing-key-file: /etc/kubernetes/pki/sa.key
        service-account-key-file: /etc/kubernetes/pki/sa.pub
        api-audiences: api://AzureADTokenExchange
        anonymous-auth: "true"
EOF
```

**Key Configuration Points:**

-   `service-account-issuer`: Set to ngrok URL (not localhost!)
-   `service-account-jwks-uri`: Points to ngrok URL for public key discovery
-   `api-audiences`: Must include `api://AzureADTokenExchange`
-   `anonymous-auth: "true"`: Allows Azure to fetch OIDC discovery without authentication

### Step 4: Configure RBAC for OIDC Discovery

Azure needs anonymous access to OIDC endpoints:

```bash
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: oidc-discovery
rules:
- nonResourceURLs:
  - "/.well-known/openid-configuration"
  - "/.well-known/jwks"
  - "/openid/v1/jwks"
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: oidc-discovery
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: oidc-discovery
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: system:anonymous
EOF
```

### Step 5: Create Individual Azure AD App

```bash
# Get developer name
DEVELOPER_NAME=$(whoami)

# Create Azure AD app
az ad app create --display-name "crossplane-local-dev-${DEVELOPER_NAME}"

# Get client ID
AZURE_CLIENT_ID=$(az ad app list \
  --display-name "crossplane-local-dev-${DEVELOPER_NAME}" \
  --query "[0].appId" -o tsv)

# Create federated credential with ngrok URL
az ad app federated-credential create \
  --id $AZURE_CLIENT_ID \
  --parameters '{
    "name": "kind-local-dev-federated-credential",
    "issuer": "'"$NGROK_URL"'",
    "subject": "system:serviceaccount:crossplane-system:provider-azure-sa",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Assign Azure permissions
az role assignment create \
  --role "Contributor" \
  --assignee $AZURE_CLIENT_ID \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID"
```

### Step 6: Deploy Crossplane with Workload Identity

```bash
# Install Crossplane
helm install crossplane crossplane-stable/crossplane \
  --namespace crossplane-system --create-namespace

# Create deployment runtime config
kubectl apply -f - <<EOF
apiVersion: pkg.crossplane.io/v1beta1
kind: DeploymentRuntimeConfig
metadata:
  name: azure-provider-deployment-runtime-config
spec:
  serviceAccountTemplate:
    metadata:
      name: provider-azure-sa
      annotations:
        azure.workload.identity/client-id: "${AZURE_CLIENT_ID}"
        azure.workload.identity/tenant-id: "${AZURE_TENANT_ID}"
      labels:
        azure.workload.identity/use: "true"
  deploymentTemplate:
    spec:
      template:
        spec:
          containers:
          - name: package-runtime
            env:
            - name: AZURE_CLIENT_ID
              value: "${AZURE_CLIENT_ID}"
            - name: AZURE_TENANT_ID
              value: "${AZURE_TENANT_ID}"
            - name: AZURE_FEDERATED_TOKEN_FILE
              value: "/var/run/secrets/azure/tokens/azure-identity-token"
            volumeMounts:
            - name: azure-identity-token
              mountPath: /var/run/secrets/azure/tokens
              readOnly: true
          volumes:
          - name: azure-identity-token
            projected:
              sources:
              - serviceAccountToken:
                  path: azure-identity-token
                  audience: api://AzureADTokenExchange
                  expirationSeconds: 3600
EOF

# Install Azure provider
kubectl apply -f - <<EOF
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-azure-network
spec:
  package: xpkg.upbound.io/upbound/provider-azure-network:v0.39.0
  runtimeConfigRef:
    name: azure-provider-deployment-runtime-config
EOF

# Create provider config
kubectl apply -f - <<EOF
apiVersion: azure.upbound.io/v1beta1
kind: ProviderConfig
metadata:
  name: default
spec:
  credentials:
    source: OIDCTokenFile
  subscriptionID: "${AZURE_SUBSCRIPTION_ID}"
  tenantID: "${AZURE_TENANT_ID}"
  clientID: "${AZURE_CLIENT_ID}"
EOF
```

### Step 7: Verify Setup

```bash
# Verify OIDC discovery is accessible via ngrok
curl -k "${NGROK_URL}/.well-known/openid-configuration"

# Check provider status
kubectl get providers

# Verify token projection
kubectl exec -n crossplane-system deployment/provider-azure-network -- \
  cat /var/run/secrets/azure/tokens/azure-identity-token | \
  cut -d. -f2 | base64 -d | jq .

# Check provider logs
kubectl logs -n crossplane-system deployment/provider-azure-network \
  -c package-runtime --tail=50
```

### Cleanup

```bash
# Delete Azure AD app
az ad app delete --id $AZURE_CLIENT_ID

# Delete Kind cluster
kind delete cluster --name crossplane-dev

# Stop ngrok
pkill ngrok
```

## Scenario 3: GitHub Actions CI with Kind

### Overview

For CI/CD, we use GitHub Actions’ native OIDC provider instead of ngrok. This provides a stable, public OIDC issuer that Azure can validate directly.

### Architecture

![](https://cdn.hackernoon.com/images/ywCyl8mvkZWzqsISZFO2B08cv812-2026-01-17T04:00:06.775Z-g1oh1wyeoohqg30b1aqhrvit)

### Step 1: One-Time Azure AD App Setup

Create a shared Azure AD app for CI:

```bash
# Create Azure AD app for CI
az ad app create --display-name "crossplane-ci-github-actions"

# Get client ID
AZURE_CLIENT_ID=$(az ad app list \
  --display-name "crossplane-ci-github-actions" \
  --query "[0].appId" -o tsv)

# Create federated credential for pull requests
az ad app federated-credential create \
  --id $AZURE_CLIENT_ID \
  --parameters '{
    "name": "github-pr-federated-credential",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:your-org/your-repo:pull_request",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Assign Azure permissions
az role assignment create \
  --role "Contributor" \
  --assignee $AZURE_CLIENT_ID \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID"

az role assignment create \
  --role "User Access Administrator" \
  --assignee $AZURE_CLIENT_ID \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID"
```

### Step 2: Store Configuration (Not Secrets!)

Create a configuration file with public identifiers:

```bash
# ci-azure-config.env
AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789012
AZURE_TENANT_ID=87654321-4321-4321-4321-210987654321
AZURE_SUBSCRIPTION_ID=abcdef12-3456-7890-abcd-ef1234567890
```

**Important**: These are public identifiers, safe to commit to your repository!

### Step 3: GitHub Actions Workflow

Create `.github/workflows/e2e-tests.yaml`:

```bash
name: E2E Integration Tests

on:
  pull_request:
    branches: [main]

permissions:
  id-token: write  # Required for GitHub OIDC
  contents: read

jobs:
  run-e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Load CI Azure Configuration
        run: |
          source ci-azure-config.env
          echo "AZURE_CLIENT_ID=$AZURE_CLIENT_ID" >> $GITHUB_ENV
          echo "AZURE_TENANT_ID=$AZURE_TENANT_ID" >> $GITHUB_ENV
          echo "AZURE_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID" >> $GITHUB_ENV

      - name: Azure Login with OIDC
        uses: azure/login@v1
        with:
          client-id: ${{ env.AZURE_CLIENT_ID }}
          tenant-id: ${{ env.AZURE_TENANT_ID }}
          subscription-id: ${{ env.AZURE_SUBSCRIPTION_ID }}

      - name: Create Kind Cluster
        run: |
          # Install Kind
          curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
          chmod +x ./kind
          sudo mv ./kind /usr/local/bin/kind

          # Create standard Kind cluster (no special OIDC config needed)
          kind create cluster --name ci-cluster

      - name: Setup GitHub OIDC Tokens for Crossplane
        run: |
          # Get GitHub OIDC token
          GITHUB_TOKEN=$(curl -s \
            -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
            "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=api://AzureADTokenExchange" | \
            jq -r ".value")

          # Create secrets with GitHub OIDC tokens
          kubectl create namespace crossplane-system
          kubectl create secret generic azure-identity-token \
            --from-literal=azure-identity-token="$GITHUB_TOKEN" \
            --namespace=crossplane-system

          # Start background token refresh (GitHub tokens expire in 5 minutes)
          nohup bash -c '
            while true; do
              sleep 240  # Refresh every 4 minutes
              GITHUB_TOKEN=$(curl -s \
                -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
                "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=api://AzureADTokenExchange" | \
                jq -r ".value")

              if [ -n "$GITHUB_TOKEN" ] && [ "$GITHUB_TOKEN" != "null" ]; then
                kubectl create secret generic azure-identity-token \
                  --from-literal=azure-identity-token="$GITHUB_TOKEN" \
                  --namespace=crossplane-system \
                  --dry-run=client -o yaml | kubectl apply -f -
              fi
            done
          ' > /tmp/token_refresh.log 2>&1 &

      - name: Install Crossplane
        run: |
          helm repo add crossplane-stable https://charts.crossplane.io/stable
          helm install crossplane crossplane-stable/crossplane \
            --namespace crossplane-system --create-namespace --wait

      - name: Configure Crossplane with Workload Identity
        run: |
          # Create deployment runtime config
          kubectl apply -f - <<EOF
          apiVersion: pkg.crossplane.io/v1beta1
          kind: DeploymentRuntimeConfig
          metadata:
            name: azure-provider-deployment-runtime-config
          spec:
            serviceAccountTemplate:
              metadata:
                name: provider-azure-sa
                annotations:
                  azure.workload.identity/client-id: "${{ env.AZURE_CLIENT_ID }}"
                  azure.workload.identity/tenant-id: "${{ env.AZURE_TENANT_ID }}"
                labels:
                  azure.workload.identity/use: "true"
            deploymentTemplate:
              spec:
                template:
                  spec:
                    containers:
                    - name: package-runtime
                      env:
                      - name: AZURE_CLIENT_ID
                        value: "${{ env.AZURE_CLIENT_ID }}"
                      - name: AZURE_TENANT_ID
                        value: "${{ env.AZURE_TENANT_ID }}"
                      - name: AZURE_FEDERATED_TOKEN_FILE
                        value: "/var/run/secrets/azure/tokens/azure-identity-token"
                      volumeMounts:
                      - name: azure-identity-token
                        mountPath: /var/run/secrets/azure/tokens
                        readOnly: true
                    volumes:
                    - name: azure-identity-token
                      secret:
                        secretName: azure-identity-token
                        items:
                        - key: azure-identity-token
                          path: azure-identity-token
          EOF

          # Install Azure provider
          kubectl apply -f - <<EOF
          apiVersion: pkg.crossplane.io/v1
          kind: Provider
          metadata:
            name: provider-azure-network
          spec:
            package: xpkg.upbound.io/upbound/provider-azure-network:v0.39.0
            runtimeConfigRef:
              name: azure-provider-deployment-runtime-config
          EOF

          # Wait for provider to be ready
          kubectl wait --for=condition=healthy --timeout=300s \
            provider/provider-azure-network

          # Create provider config
          kubectl apply -f - <<EOF
          apiVersion: azure.upbound.io/v1beta1
          kind: ProviderConfig
          metadata:
            name: default
          spec:
            credentials:
              source: OIDCTokenFile
            subscriptionID: "${{ env.AZURE_SUBSCRIPTION_ID }}"
            tenantID: "${{ env.AZURE_TENANT_ID }}"
            clientID: "${{ env.AZURE_CLIENT_ID }}"
          EOF

      - name: Run E2E Tests
        run: |
          # Your E2E tests here
          kubectl apply -f test/e2e/test-resources.yaml

          # Wait for resources to be ready
          kubectl wait --for=condition=ready --timeout=600s \
            -f test/e2e/test-resources.yaml

      - name: Cleanup
        if: always()
        run: |
          # Delete test resources
          kubectl delete -f test/e2e/test-resources.yaml --wait=false

          # Delete Kind cluster
          kind delete cluster --name ci-cluster
```

### Key Differences from Local Dev

| Aspect | Local Development | GitHub Actions CI | |----|----|----| | **OIDC Issuer** | ngrok tunnel | GitHub native OIDC | | **Token Source** | Projected service account | GitHub OIDC token in secret | | **Token Lifetime** | 1 hour (auto-refresh) | 5 minutes (manual refresh) | | **Cluster Config** | Custom OIDC issuer | Standard Kind cluster | | **Azure AD App** | Individual per developer | Shared for CI | | **Token Storage** | Projected volume | Kubernetes secret |

### Token Refresh Implementation

GitHub OIDC tokens expire in 5 minutes, so we implement automatic refresh:

```bash
# Background token refresh daemon
nohup bash -c '
  while true; do
    sleep 240  # Wait 4 minutes

    # Get fresh GitHub OIDC token
    GITHUB_TOKEN=$(curl -s \
      -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
      "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=api://AzureADTokenExchange" | \
      jq -r ".value")

    if [ -n "$GITHUB_TOKEN" ] && [ "$GITHUB_TOKEN" != "null" ]; then
      # Update secret (Kubernetes auto-updates mounted files)
      kubectl create secret generic azure-identity-token \
        --from-literal=azure-identity-token="$GITHUB_TOKEN" \
        --namespace=crossplane-system \
        --dry-run=client -o yaml | kubectl apply -f -
    fi
  done
' > /tmp/token_refresh.log 2>&1 &
```

## Comparison: Three Scenarios Side-by-Side

| Feature | EKS Production | Local Development | GitHub Actions CI | |----|----|----|----| | **OIDC Provider** | EKS native | ngrok tunnel | GitHub native | | **Cluster Type** | EKS | Kind | Kind | | **Token Projection** | Projected volume | Projected volume | Secret volume | | **Token Lifetime** | 1 hour | 1 hour | 5 minutes | | **Token Refresh** | Automatic | Automatic | Manual daemon | | **Azure AD App** | Production app | Individual per dev | Shared CI app | | **Setup Complexity** | Low | Medium | Medium | | **Security Isolation** | High | High (per dev) | Medium (shared) | | **Public Accessibility** | ✅ Native | ✅ Via ngrok | ✅ Native |

## Troubleshooting Guide

### Common Issues Across All Scenarios

#### Issue 1: Token File Not Found

**Error:**

```bash
reading OIDC Token from file "/var/run/secrets/azure/tokens/azure-identity-token": no such file or directory
```

**Solution:**

```bash
# Check if volume is mounted
kubectl exec -n crossplane-system deployment/provider-azure-network -- \
  ls -la /var/run/secrets/azure/tokens/

# Verify deployment configuration
kubectl get deploymentruntimeconfig azure-provider-deployment-runtime-config -o yaml

# Check provider pod spec
kubectl get pod -n crossplane-system -l pkg.crossplane.io/provider=provider-azure-network -o yaml
```

#### Issue 2: Azure Authentication Failure

**Error:**

```bash
AADSTS700211: No matching federated identity record found for presented assertion issuer
```

**Solution:**

```bash
# Verify federated credential configuration
az ad app federated-credential list --id $AZURE_CLIENT_ID

# Check token claims
kubectl exec -n crossplane-system deployment/provider-azure-network -- \
  cat /var/run/secrets/azure/tokens/azure-identity-token | \
  cut -d. -f2 | base64 -d | jq .

# Ensure issuer and subject match exactly
```

### Local Development Specific Issues

#### Issue 3: ngrok URL Changed

**Error:** Authentication fails after restarting ngrok

**Solution:**

```bash
# Get new ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | \
  jq -r '.tunnels[0].public_url')

# Update federated credential
az ad app federated-credential update \
  --id $AZURE_CLIENT_ID \
  --federated-credential-id <credential-id> \
  --parameters '{
    "issuer": "'"$NGROK_URL"'"
  }'

# Recreate Kind cluster with new URL
kind delete cluster --name crossplane-dev
# Then recreate with new ngrok URL
```

#### Issue 4: OIDC Discovery Endpoint Unreachable

**Error:**

```bash
AADSTS50166: Request to External OIDC endpoint failed
```

**Solution:**

```bash
# Verify ngrok is running
curl -s http://localhost:4040/api/tunnels

# Test OIDC discovery endpoint
curl -k "${NGROK_URL}/.well-known/openid-configuration"

# Check RBAC permissions
kubectl get clusterrolebinding oidc-discovery -o yaml
```

### GitHub Actions Specific Issues

#### Issue 5: Token Expiration in Long Tests

**Error:** Authentication fails after 5 minutes

**Solution:**

```bash
# Verify token refresh daemon is running
ps aux | grep "refresh_tokens"

# Check refresh logs
tail -f /tmp/token_refresh.log

# Manually refresh token
GITHUB_TOKEN=$(curl -s \
  -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=api://AzureADTokenExchange" | \
  jq -r ".value")

kubectl create secret generic azure-identity-token \
  --from-literal=azure-identity-token="$GITHUB_TOKEN" \
  --namespace=crossplane-system \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Best Practices and Recommendations

### Security Best Practices

1.  **Individual Identities**: Use separate Azure AD apps for each environment
2.  **Least Privilege**: Grant minimum required Azure permissions
3.  **Resource Group Scoping**: Limit permissions to specific resource groups
4.  **Regular Audits**: Review Azure AD audit logs for unusual activity
5.  **Token Expiration**: Use short token lifetimes (1 hour recommended)

### Operational Best Practices

1.  **Automation**: Use scripts to automate Azure AD app creation and cleanup
2.  **Documentation**: Maintain clear documentation of federated credentials
3.  **Monitoring**: Set up alerts for authentication failures
4.  **Testing**: Test configuration changes in non-production first
5.  **Cleanup**: Always clean up Azure AD apps after development

### Workflow Recommendations

**For Local Development:**

-   Create automation scripts to start/stop your development environment
-   Include Azure AD app creation and cleanup in your setup scripts
-   Document the setup process for new team members

**For CI/CD:**

-   Configure your CI pipeline to automatically handle token refresh
-   Set up proper cleanup steps to remove test resources
-   Use repository-scoped federated credentials for security

**For Production:**

-   Implement monitoring and alerting for authentication failures
-   Document the federated credential configuration
-   Plan for disaster recovery scenarios

## Conclusion

We successfully implemented Azure Workload Identity Federation across three distinct scenarios:

1.  **EKS Production**: Leveraging native EKS OIDC for seamless Azure authentication
2.  **Local Development**: Using ngrok to expose Kind cluster OIDC endpoints with individual developer isolation
3.  **GitHub Actions CI**: Utilizing GitHub’s native OIDC provider for automated testing

### Key Achievements

-   ✅ **Zero Stored Secrets**: No credentials stored anywhere across all environments
-   ✅ **Consistent Pattern**: Same workload identity approach from dev to production
-   ✅ **Individual Isolation**: Each developer has separate Azure identity
-   ✅ **Automatic Rotation**: All tokens are short-lived and auto-refreshed
-   ✅ **Clear Audit Trail**: Full visibility into all Azure operations

### Implementation Summary

This approach has transformed Azure authentication from a security liability into a robust, automated system that works consistently across all environments. The complete configurations shown in this blog post can be adapted to your specific infrastructure and repository structure.

**Key takeaways:**

-   All three scenarios use the same workload identity federation principle
-   Configuration differences are minimal between environments
-   The same Azure provider setup works across all scenarios
-   Token management is automatic in all cases

## Additional Resources

-   [Azure Workload Identity Federation Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation)
-   [Crossplane Azure Provider Documentation](https://marketplace.upbound.io/providers/upbound/provider-azure)
-   [Kubernetes Service Account Token Projection](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#service-account-token-volume-projection)
-   [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)

\\