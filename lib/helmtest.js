/* eslint-disable guard-for-in */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('node:child_process').exec);
const yaml = require('js-yaml');

/**
 * Run `helm template` to generate javascript object of the result YAML.
 * @param {object} valuesMap A map of values to set.
 * @param {list} valuesFileList List of values.yaml files.
 * @param {string} chartDir Path to the chart.
 * @param {string} releaseName Name of the release.
 * @param {list} templateFilesList An optional list of template files to filter.
 * @param {extraHelmArgs} extraHelmArgs An optional list of extra helm args.
 * @return {object} Rendered template.
 */
async function renderTemplate(
    valuesMap,
    valuesFileList,
    chartDir,
    releaseName,
    templateFilesList,
    extraHelmArgs) {
  assert(chartDir, 'chartDir is required');
  assert(releaseName, 'releaseName is required');

  // Make sure chartDir exists.
  fs.statSync(chartDir);

  // Now construct the args.
  const helmCmd = ['helm', 'template'];

  if (valuesMap) {
    const valuePairs = [];
    for (const key in valuesMap) {
      valuePairs.push(`${key}=${valuesMap[key]}`);
    }
    helmCmd.push('--set', valuesPairs.join(','));
  }

  if (valuesFileList) {
    if (typeof valuesFileList === 'string') {
      valuesFileList = valuesFileList.split(',');
    }
    valuesFileList.forEach((valuesFile) => {
      fs.statSync(valuesFile);
      helmCmd.push('-f');
      helmCmd.push(valuesFile);
    });
  }

  if (templateFilesList) {
    if (typeof templateFilesList === 'string') {
      templateFilesList = templateFilesList.split(',');
    }
    templateFilesList.forEach((templateFile) => {
      const filePath = path.join(chartDir, templateFile);
      fs.statSync(filePath);
      // Note: get the abs template file path to chek it actually exists,
      // `helm template` command expects relative path from chartDir.
      helmCmd.push('--show-only');
      helmCmd.push(templateFile);
    });
  }

  if (extraHelmArgs) {
    extraHelmArgs.forEach((arg) => helmCmd.push(arg));
  }

  helmCmd.push(releaseName);
  helmCmd.push(chartDir);

  const helmOutput = await exec(helmCmd.join(' '));
  return yaml.loadAll(helmOutput.stdout);
}

module.exports = {
  renderTemplate,
};
