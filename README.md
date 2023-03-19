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

See [example](../../tree/example) as an example helm chart project which includes unit tests.
