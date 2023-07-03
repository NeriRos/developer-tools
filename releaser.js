#!/usr/bin/env node
const {execSync} = require('child_process');
const args = process.argv.slice(2);
const environment = args[0];
const excludedCommitHash = args[1];

if (['test', 'prod'].indexOf(environment) === -1) {
    console.log('Usage: releaser.js [test|prod] [optional: commitHash to revert]');
    return;
}

release(environment, excludedCommitHash);


function getLastCommitHash(length = 6) {
    const commitHash = execSync('git rev-parse HEAD').toString().trim();

    if (length === -1) {
        return commitHash;
    }

    return commitHash.slice(0, length + 1);
}

function getBranchName() {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

function createAndPushRelease(releaseName, commitHash) {
    if (checkIfTagExists(releaseName)) {
        console.log(`Release ${releaseName} already exists`);
        return;
    }

    if (!checkIfCommitExistsInOrigin(commitHash)) {
        console.log(`Commit ${commitHash} does not exist in origin`);
        return;
    }

    const branchName = getBranchName();

    if (releaseName.startsWith("prod-") && branchName !== 'master') {
        console.log(`Production releases can only be created from master branch. Current branch is ${branchName}`);
        return;
    }

    console.log(`Releasing ${releaseName} on ${branchName}`);
    execSync(`git tag ${releaseName}`);
    execSync(`git push origin ${releaseName}`);
}

function checkIfTagExists(tagName) {
    try {
        const res = execSync(`git rev-parse --verify --quiet ${tagName}`);
        return res.toString().trim().length > 0;
    } catch (error) {
        return false;
    }
}

function checkIfCommitExistsInOrigin(commitHash) {
    try {
        const res = execSync(`git branch -r --quiet --contains ${commitHash}`);
        return res.toString().trim().indexOf("no such commit") === -1;
    } catch (error) {
        return false;
    }
}

function fetchGit() {
    execSync('git fetch');
}

function release(environment, excludedCommitHash) {
    fetchGit();
    const commitHash = getLastCommitHash();
    const commitHashComplete = getLastCommitHash(-1);
    const releaseName = `${environment}-${commitHash}`;

    createAndPushRelease(releaseName, commitHashComplete);
}
