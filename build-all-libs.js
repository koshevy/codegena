#!/usr/bin/env node
const { execSync } = require('child_process');
const { projects } = require('./angular.json');
const { findKey } = require('lodash');
const paths = execSync('./node_modules/.bin/lerna list --toposort --parseable')
  .toString('utf-8')
  .split('\n')
  .map(packageName => packageName.trim())
  .filter(packageName => !!packageName)
  .map(path => path.replace(__dirname, ''));

try {
  paths.forEach(path => {
    const project = findKey(projects, project => {
      return path.indexOf(project.root) !== -1;
    });

    const output = execSync(
        `./node_modules/.bin/ng build ${project}`,
        { maxBuffer: 1000 * 1000 * 5 },
    );

    console.log(output.toString('utf-8'));
  });
} catch (error) {
  throw new Eror('Build failed!');
}
