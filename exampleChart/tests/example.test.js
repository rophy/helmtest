/**
 * Example tests for exampleChart using helmtest.
 * Run with: docker run -v $(pwd):/workspace ghcr.io/rophy/helmtest
 */

test('exampleChart should render 4 resources by default', async () => {
  const result = await helmtest.renderTemplate();
  expect(result.length).toBe(4);
  expect(result[0]).toMatchObject({kind: 'ServiceAccount'});
  expect(result[1]).toMatchObject({kind: 'Service'});
  expect(result[2]).toMatchObject({kind: 'Deployment'});
  expect(result[3]).toMatchObject({kind: 'Pod'});
});

test('deployment should use nginx image by default', async () => {
  const result = await helmtest.renderTemplate();
  const deployment = result.find((r) => r.kind === 'Deployment');
  expect(deployment.spec.template.spec.containers[0].image).toBe('nginx:1.16.0');
});

test('deployment replicas can be customized', async () => {
  const result = await helmtest.renderTemplate({
    values: {replicaCount: 3},
  });
  const deployment = result.find((r) => r.kind === 'Deployment');
  expect(deployment.spec.replicas).toBe(3);
});

test('ingress is disabled by default', async () => {
  const result = await helmtest.renderTemplate();
  const ingress = result.find((r) => r.kind === 'Ingress');
  expect(ingress).toBeUndefined();
});

test('ingress can be enabled', async () => {
  const result = await helmtest.renderTemplate({
    values: {
      'ingress.enabled': true,
      'ingress.className': 'nginx',
      'ingress.hosts[0].host': 'example.local',
      'ingress.hosts[0].paths[0].path': '/',
      'ingress.hosts[0].paths[0].pathType': 'Prefix',
    },
  });
  const ingress = result.find((r) => r.kind === 'Ingress');
  expect(ingress).toBeDefined();
  expect(ingress.spec.ingressClassName).toBe('nginx');
});
