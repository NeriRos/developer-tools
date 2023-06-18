#!/usr/bin/env node
const { execSync } = require("child_process");
const args = process.argv.slice(2);

function getLastCommitHash() {
  return execSync("git rev-parse HEAD").toString().trim().slice(0, 7);
}

function getBranchName() {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

function createAndPushRelease(releaseName) {
  if (checkIfTagExists(releaseName)) {
    console.log(`Release ${releaseName} already exists`);
    return;
  }
  console.log(`Releasing ${releaseName} on ${getBranchName()}`);
  execSync(`git tag ${releaseName}`)
  execSync(`git push origin ${releaseName}`)
}

// checkIfTagExists without stdout
function checkIfTagExists(tagName) {
  try {
    execSync(`git rev-parse --verify --quiet ${tagName}`);
    return true;
  } catch (error) {
    return false;
  }
}

function release() {
  const commitHash = getLastCommitHash();
  const environment = args[0];

  if (["test", "prod"].indexOf(environment) === -1) {
    console.log("Usage: releaser.js [test|prod]");
    return;
  }

  const releaseName = `${environment}-${commitHash}`;

  createAndPushRelease(releaseName);
}

release();
