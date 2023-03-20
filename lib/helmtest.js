const fs = require('fs');
const path = require('path');
const util = require('util');
const execFile = util.promisify(require('node:child_process').execFile);
const yaml = require('js-yaml');
const debug = require('debug')('helmtest');
const Readable = require('stream').Readable;

/**
 * Run `helm template` to generate javascript object of the result YAML.
 * @param {object} options See below for list of options.
 * @return {object} Rendered template.
 */
async function renderTemplate(options = {}) {
  // default values
  if (!options) options = {};
  options.chartDir = options.chartDir || '.';
  options.releaseName = options.releaseName || 'release-name';
  options.values = options.values || {};
  options.valuesFiles = options.valuesFiles || [];
  options.templateFiles = options.templateFiles || [];
  options.extraHelmArgs = options.extraHelmArgs || [];
  options.helmBinary = options.helmBinary || process.env.HELM_BINARY || 'helm';
  if (options.loadYaml === undefined) options.loadYaml = true;
  if (options.kubeconformEnabled === undefined) {
    options.kubeconformEnabled = process.env.KUBECONFORM_ENABLED || false;
  }
  options.kubeconformBinary = options.kubeconformBinary ||
    process.env.KUBECONFORM_BINARY || 'kubeconform';
  options.kubeconformArgs = options.kubeconformArgs ||
    ['-strict', '-summary'];

  if (process.env.KUBECONFORM_EXTRA_ARGS) {
    const kcExtraArgs = process.env.KUBECONFORM_EXTRA_ARGS.split(' ');
    options.kubeconformArgs = options.kubeconformArgs.concat(kcExtraArgs);
  }

  debug(`options: ${JSON.stringify(options)}`);

  // Make sure chartDir exists.
  fs.statSync(options.chartDir);

  // Now construct the args.
  const helmCmd = options.helmBinary;
  const helmArgs = ['template'];

  const valueKeys = Object.keys(options.values);
  const valuePairs = [];
  valueKeys.forEach((key) => {
    valuePairs.push(`${key}=${options.values[key]}`);
  });
  if (valuePairs.length > 0) {
    helmArgs.push('--set', valuePairs.join(','));
  }

  if (options.valuesFiles) {
    const valuesFiles = typeof options.valuesFiles === 'string' ?
      options.valuesFiles.split(','):
      options.valuesFiles;
    valuesFiles.forEach((valuesFile) => {
      fs.statSync(valuesFile);
      helmArgs.push('-f', valuesFile);
    });
  }

  if (options.templateFiles) {
    const templateFiles = typeof options.templateFiles === 'string' ?
      options.templateFiles.split(',') :
      options.templateFiles;
    templateFiles.forEach((templateFile) => {
      const filePath = path.join(options.chartDir, templateFile);
      fs.statSync(filePath);
      // Note: get the abs template file path to chek it actually exists,
      // `helm template` command expects relative path from chartDir.
      helmArgs.push('--show-only', templateFile);
    });
  }

  options.extraHelmArgs.forEach((arg) => helmArgs.push(arg));
  helmArgs.push(options.releaseName, options.chartDir);
  debug(`helm command: ${helmCmd} ${helmArgs.join(' ')}`);
  const helmOutput = await execFile(helmCmd, helmArgs);

  if (options.kubeconformEnabled) {
    const kcCmd = options.kubeconformBinary;
    const kcArgs = options.kubeconformArgs;
    debug(`kubeconform command: ${kcCmd} ${kcArgs.join(' ')}`);
    const kcProc = execFile(kcCmd, kcArgs);
    const piper = new Readable();
    piper.pipe(kcProc.child.stdin);
    piper.push(helmOutput.stdout);
    piper.push(null);
    try {
      const kcResult = await kcProc;
      if (kcResult.stdout) debug(kcResult.stdout);
      if (kcResult.stderr) debug(kcResult.stderr);
    } catch (err) {
      if (err.stdout) console.error(err.stdout);
      if (err.stderr) console.error(err.stderr);
      throw err;
    }
  }

  if (options.loadYaml) {
    return yaml.loadAll(helmOutput.stdout);
  } else {
    return helmOutput.stdout;
  }
}

module.exports = {
  renderTemplate,
};
