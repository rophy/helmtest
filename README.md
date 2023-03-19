# helmtest

A npm module which enables writing unit tests with nodejs / Jest.

Heavily inspired by [Stono/helmtest](https://github.com/Stono/helm-test).

## Why not just use Stono/helmtest?

I originally wanted to update [Stono/helmtest](https://github.com/Stono/helm-test) to fit my needs,
but after attempting to customize it, I figured it's actually easier to rewrite one.

Differences with [Stono/helmtest](https://github.com/Stono/helm-test):

- Single js file for the core logic (lib/helmtest.js)
- Supports [kubeconform](https://github.com/yannh/kubeconform) instead of [kubeval](https://github.com/instrumenta/kubeval/)
- No Grunt and TypeScript
- Can be used as a npm library without assuming test framework and passing objects around global scope.
- Can also run independently as CLI. In this case [jest](https://jestjs.io/) is bundled instead of mocha/chai.

## Getting Started

### Running helmtest as npm module

Install helmtest:

```bash
npm install @rophy123/helmtest
```

To use helmtest in your code:

```javascript
const helmtest = require('@rophy123/helmtest');

// Run `helm template` under working directory
helmtest.renderTemplate()
.then(results => {
  // results are JS objects converted from result YAML.
  // '[{"apiVesrion":"v1","kind":"ServiceAccount","metadata":...
  console.log(JSON.stringify(results));
});
```

The results object can be used to verify details. For example, in jest:

```javascript
const helmtest = require('@rophy123/helmtest');

test('exmapleChart should render 4 resources', async () => {
  const result = await helmtest.renderTemplate();
  expect(result.length).toBe(4);
});
```

See [API Spec](#api-spec) for the options of `helmtest.renderTemplate()`.

### Running helmtest as CLI

Install [jest](https://jestjs.io/) along with helmtest globally:

```bash
npm install -g @rophy123/helmtest jest
```

...and then you can write unit tests under `tests/` dir of your chart project without the need for package.json

A docker image [rophy/helmtest](https://hub.docker.com/r/rophy/helmtest) is avilable which includes everything to run up unit tests.

See [example](../../tree/example) as an example helm chart project on how to use docker image and write unit tests.

## API Spec

helmtest currently only expose one method: `helmtest.renderTemplate(options)`.

`options` is a object with option names, descriptions and defaults as below:

| Option               | Description                                                                         | Default                                           |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| chartDir             | Path to chart, the `CHART` arg in helm CLI: `helm template [NAME] [CHART] [flags]`. | `'.'`                                             |
| releaseName          | Release name, the `NAME` arg in helm CLI: `helm template [NAME] [CHART] [flags]`.   | `'release-name'`                                  |
| values               | A map of chart values to set.                                                       | `{}`                                              |
| valuesFiles          | A list of paths to additional values.yaml.                                          | `[]`                                              |
| extraHelmArgs        | A list of extra args to pass to helm CLI, e.g. `--timeout=5s`                       | `[]`                                              |
| helmBinary           | Path to helm binary.                                                                | `process.env.HELM_BINARY || 'helm'`               |
| loadYaml             | if `false`, will return rendered template as raw string instead of js object.       | `true`                                            |
| kubeconformEnabled   | if `true`, will pass rendered template to kubeconform CLI to validate schema.       | `process.env.KUBECONFORM_ENABLED || false`        |
| kubeconformBinary    | Path to kubeconform binary.                                                         | `process.env.KUBECONFORM_BINARY || 'kubeconform'` |
| kubeconformExtraArgs | A list of extra args to pass to kubeconform CLI.                                    | `process.env.KUBECONFORM_ARGS || []`              |
