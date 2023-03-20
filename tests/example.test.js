const path = require('path');
const {format: prettyFormat} = require('pretty-format');

const helmtest = require('../lib/helmtest');

describe('helmtest', () => {
  test('default params', async () => {
    const result = await helmtest.renderTemplate({chartDir: 'exampleChart'});
    expect(result.length).toBe(4);
    expect(result[0]).toMatchObject({
      kind: 'ServiceAccount',
      metadata: {
        name: 'release-name-exampleChart',
      },
    });
    expect(result[1]).toMatchObject({
      kind: 'Service',
      metadata: {
        name: 'release-name-exampleChart',
      },
    });
    expect(result[2]).toMatchObject({
      kind: 'Deployment',
      metadata: {
        name: 'release-name-exampleChart',
      },
    });
    expect(result[3]).toMatchObject({
      kind: 'Pod',
      metadata: {
        name: 'release-name-exampleChart-test-connection',
      },
    });
  });

  test('chartDir', async () => {
    await expect(helmtest.renderTemplate({chartDir: 'non-exist'}))
    .rejects.toMatchObject({
      code: 'ENOENT'
    });
    await expect(helmtest.renderTemplate({chartDir: 'exampleChart'}));
  });

  test('releaseName', async () => {
    const resultDefaults = await helmtest.renderTemplate({chartDir: 'exampleChart'});
    expect(resultDefaults.length).toBe(4);
    expect(resultDefaults[0]).toMatchObject({
      kind: 'ServiceAccount',
      metadata: {
        name: 'release-name-exampleChart',
        labels: {
          'app.kubernetes.io/instance': 'release-name'
        }
      }
    });
    const resultCustomized = await helmtest.renderTemplate({
      chartDir: 'exampleChart',
      releaseName: 'hello-world',
    });
    expect(resultCustomized.length).toBe(4);
    expect(resultCustomized[0]).toMatchObject({
      kind: 'ServiceAccount',
      metadata: {
        name: 'hello-world-exampleChart',
        labels: {
          'app.kubernetes.io/instance': 'hello-world'
        }
      }
    });
  });

  test('values', async () => {
    const result = await helmtest.renderTemplate({
      chartDir: 'exampleChart',
      values: {
        replicaCount: 2,
        'ingress.enabled': true,
        'ingress.className': 'hello'
      }
    });
    expect(result.length).toBe(5);
    expect(result[2]).toMatchObject({
      kind: 'Deployment',
      spec: {
        replicas: 2
      }
    });
    expect(result[3]).toMatchObject({
      kind: 'Ingress',
      spec: {
        ingressClassName: 'hello',
      }
    });
  });

  test('valuesFiles', async () => {
    const result = await helmtest.renderTemplate({
      chartDir: 'exampleChart',
      valuesFiles: [
        path.join(__dirname, 'fixtures/values.yaml'),
        path.join(__dirname, 'fixtures/values2.yaml'),
      ]
    });
    expect(result.length).toBe(4);
    expect(result).toHaveProperty('[2].spec.template.spec.containers[0].image', 'nginx:2.0');
    expect(result).toHaveProperty('[2].spec.template.spec.containers[0].resources.limits.cpu', '500m');
    expect(result).toHaveProperty('[2].spec.template.spec.containers[0].resources.requests.memory', '128Mi');
    expect(result).toHaveProperty('[2].spec.template.spec.containers[0].resources.limits.memory', '512Mi');
  });

  test('templateFiles', async () => {
    const result = await helmtest.renderTemplate({
      chartDir: 'exampleChart',
      templateFiles: ['templates/service.yaml'],
    });
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      kind: 'Service',
      spec: {
        ports: [{
          port: 80,
        }],
      },
    });
  });

  test('extraHelmArgs', async () => {
    const result = await helmtest.renderTemplate({
      chartDir: 'exampleChart',
      extraHelmArgs: ['--set', 'service.port=90', '--show-only=templates/service.yaml']
    });
    expect(result.length).toBe(1);
    expect(result).toHaveProperty('[0].spec.ports[0].port', 90);
  });

  test('helmBinary', async () => {
    await expect(helmtest.renderTemplate({
      helmBinary: 'non-exist'
    }))
    .rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  test('loadYaml', async () => {
    const result = await helmtest.renderTemplate({
      chartDir: 'exampleChart',
      loadYaml: false,
    });

    expect(typeof result).toBe('string');
    expect(result).toContain('nginx');
  });
  
});
