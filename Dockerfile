FROM node:18.17.1-alpine3.18

RUN apk add --no-cache curl git bash jq yq openssl

RUN curl -sLo ./helm.tar.gz https://get.helm.sh/helm-v3.11.2-linux-amd64.tar.gz \
    && tar -zxvf helm.tar.gz linux-amd64/helm \
    --strip-components 1 && mv ./helm /usr/local/bin/ \
    && rm ./helm.tar.gz

RUN curl -sLo kubeconform.tar.gz https://github.com/yannh/kubeconform/releases/download/v0.6.1/kubeconform-linux-amd64.tar.gz \
    && tar -zxvf kubeconform.tar.gz kubeconform \
    && mv ./kubeconform /usr/local/bin/ \
    && rm kubeconform.tar.gz

ENV KUBERNETES_VERSION=1.22.9
RUN mkdir kubernetes-json-schema && cd /tmp \
    && git clone --depth 1 --filter=blob:none --sparse https://github.com/yannh/kubernetes-json-schema \
    && cd kubernetes-json-schema \
    && git sparse-checkout set v${KUBERNETES_VERSION}-standalone-strict \
    && mv v${KUBERNETES_VERSION}-standalone-strict /kubernetes-json-schema/ \
    && git sparse-checkout set v1.23.17-standalone-strict \
    && mv v1.23.17-standalone-strict /kubernetes-json-schema/ \
    && rm -rf /tmp/kubernetes-json-schema

RUN cd /tmp \
    && git clone --depth 1 --filter=blob:none --sparse https://github.com/datreeio/CRDs-catalog.git \
    && cd CRDs-catalog \
    && git sparse-checkout set networking.istio.io \
    && mv networking.istio.io /kubernetes-json-schema/ \
    && git sparse-checkout set security.istio.io \
    && mv security.istio.io /kubernetes-json-schema/ \
    && rm -rf /tmp/CRDs-catalog

RUN cd /tmp \
    && git clone --depth 1 --filter=blob:none --sparse https://github.com/ricoberger/vault-secrets-operator.git \
    && cd vault-secrets-operator \
    && git sparse-checkout set config/crd/bases \
    && mv config/crd/bases /kubernetes-json-schema/vaultsecrets.ricoberger.de \
    && rm -rf /tmp/vault-secrets-operator


ENV KUBECONFORM_ENABLED=true KUBECONFORM_EXTRA_ARGS="-kubernetes-version ${KUBERNETES_VERSION} \
-schema-location /kubernetes-json-schema \
-schema-location '/kubernetes-json-schema/security.istio.io/{{.ResourceKind}}_{{.ResourceAPIVersion}}.json' \
-schema-location '/kubernetes-json-schema/networking.istio.io/{{.ResourceKind}}_{{.ResourceAPIVersion}}.json' \
-schema-location '/kubernetes-json-schema/vaultsecrets.ricoberger.de/{{.ResourceKind}}_{{.ResourceAPIVersion}}.json'"
ENV HELM_REGISTRY_CONFIG=/tmp/registry.json DOCKER_CONFIG=/tmp/config.json
RUN npm install -g @rophy123/helmtest@2.1.5 jest@^29.5.0

WORKDIR /workspace
CMD ["/usr/local/bin/helmtest"]
