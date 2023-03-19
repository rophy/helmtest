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
});
