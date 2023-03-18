const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('node:child_process').exec);
const yaml = require('js-yaml');

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
  options.loadYaml = options.loadYaml || true;

  // Make sure chartDir exists.
  fs.statSync(options.chartDir);

  // Now construct the args.
  const helmCmd = [options.helmBinary, 'template'];

  const valueKeys = Object.keys(options.values);
  const valuePairs = [];
  valueKeys.forEach((key) => {
    valuePairs.push(`${key}=${options.values[key]}`);
  });
  if (valuePairs.length > 0) {
    helmCmd.push('--set', valuePairs.join(','));
  }

  if (options.valuesFiles) {
    const valuesFiles = typeof options.valuesFiles === 'string' ?
      options.valuesFiles.split(','):
      options.valuesFiles;
    valuesFiles.forEach((valuesFile) => {
      fs.statSync(valuesFile);
      helmCmd.push('-f');
      helmCmd.push(valuesFile);
    });
  }

  if (options.templateFiles) {
    const templateFiles = typeof options.templateFiles === 'string' ?
      options.templateFiles.split(',') :
      options.templateFiles;
    templateFiles.forEach((templateFile) => {
      const filePath = path.join(chartDir, templateFile);
      fs.statSync(filePath);
      // Note: get the abs template file path to chek it actually exists,
      // `helm template` command expects relative path from chartDir.
      helmCmd.push('--show-only');
      helmCmd.push(templateFile);
    });
  }

  if (options.extraHelmArgs) {
    options.extraHelmArgs.forEach((arg) => helmCmd.push(arg));
  }

  helmCmd.push(options.releaseName);
  helmCmd.push(options.chartDir);

  const helmOutput = await exec(helmCmd.join(' '));
  if (options.loadYaml) {
    return yaml.loadAll(helmOutput.stdout);
  } else {
    return helmOutput;
  }
}

module.exports = {
  renderTemplate,
};
