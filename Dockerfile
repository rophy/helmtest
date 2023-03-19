FROM node:16.19.1-bullseye-slim

RUN apt-get update && apt-get install -y curl git

RUN curl -sLo ./helm.tar.gz https://get.helm.sh/helm-v3.11.2-linux-amd64.tar.gz \
    && tar -zxvf helm.tar.gz linux-amd64/helm \
    --strip-components 1 && mv ./helm /usr/local/bin/ \
    && rm ./helm.tar.gz

RUN curl -sLo ./helm.tar.gz https://get.helm.sh/helm-v3.11.2-linux-amd64.tar.gz \
    && tar -zxvf helm.tar.gz linux-amd64/helm \
    --strip-components 1 && mv ./helm /usr/local/bin/ \
    && rm ./helm.tar.gz

RUN curl -sLo kubeconform.tar.gz https://github.com/yannh/kubeconform/releases/download/v0.6.1/kubeconform-linux-amd64.tar.gz \
    && tar -zxvf kubeconform.tar.gz kubeconform \
    && mv ./kubeconform /usr/local/bin/ \
    && rm kubeconform.tar.gz

ENV KUBERNETES_VERSION=1.22.9
RUN cd / && git clone --depth 1 --filter=blob:none --sparse https://github.com/yannh/kubernetes-json-schema \
    && cd kubernetes-json-schema \
    && git sparse-checkout set v${KUBERNETES_VERSION}-standalone-strict \
    && rm -rf ./.git

ENV KUBECONFORM_ENABLED=true KUBECONFORM_ARGS="-kubernetes-version ${KUBERNETES_VERSION} -schema-location /kubernetes-json-schema -strict"
ENV HELM_REGISTRY_CONFIG=/tmp/registry.json DOCKER_CONFIG=/tmp/config.json
RUN npm install -g @rophy123/helmtest@1.2.0

WORKDIR /workspace
CMD ["/usr/local/bin/helmtest"]
