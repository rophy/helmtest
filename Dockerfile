FROM node:22-alpine3.21

RUN apk upgrade --no-cache libcrypto3 libssl3 && \
    apk add --no-cache curl git bash

RUN curl -sLo ./helm.tar.gz https://get.helm.sh/helm-v3.20.0-linux-amd64.tar.gz \
    && tar -zxvf helm.tar.gz linux-amd64/helm \
    --strip-components 1 && mv ./helm /usr/local/bin/ \
    && rm ./helm.tar.gz

RUN curl -sLo kubeconform.tar.gz https://github.com/yannh/kubeconform/releases/download/v0.7.0/kubeconform-linux-amd64.tar.gz \
    && tar -zxvf kubeconform.tar.gz kubeconform \
    && mv ./kubeconform /usr/local/bin/ \
    && rm kubeconform.tar.gz

ENV KUBERNETES_VERSION=1.24.17
RUN cd / && git clone --depth 1 --filter=blob:none --sparse https://github.com/yannh/kubernetes-json-schema \
    && cd kubernetes-json-schema \
    && git sparse-checkout set v${KUBERNETES_VERSION}-standalone-strict \
    && rm -rf ./.git

ENV KUBECONFORM_ENABLED=true KUBECONFORM_EXTRA_ARGS="-kubernetes-version ${KUBERNETES_VERSION} -schema-location /kubernetes-json-schema"
ENV HELM_REGISTRY_CONFIG=/tmp/registry.json DOCKER_CONFIG=/tmp/config.json

# Install helmtest from local source
COPY package*.json /helmtest/
RUN cd /helmtest && npm install --omit=dev
COPY bin /helmtest/bin
COPY lib /helmtest/lib
COPY index.js /helmtest/
RUN npm install -g /helmtest && npm install -g jest@^29.7.0

ENV NODE_PATH=/usr/local/lib/node_modules
WORKDIR /workspace
CMD ["/usr/local/bin/helmtest"]
