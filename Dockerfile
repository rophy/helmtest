FROM node:16.19.1-bullseye-slim

RUN apt-get update && apt-get install -y curl

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

RUN npm install -g @rophy123/helmtest
