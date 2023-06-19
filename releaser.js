#!/usr/bin/env node
const { execSync } = require('child_process');
const args = process.argv.slice(2);
const environment = args[0];
const excludedCommitHash = args[1];

if (['test', 'prod'].indexOf(environment) === -1) {
    console.log('Usage: releaser.js [test|prod] [optional: commitHash to revert]');
    return;
}

release(environment, excludedCommitHash);


function getLastCommitHash(length = 6) {
    return execSync('git rev-parse HEAD').toString().trim().slice(0, length + 1);
}

function getBranchName() {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

function createAndPushRelease(releaseName) {
    if (checkIfTagExists(releaseName)) {
        console.log(`Release ${releaseName} already exists`);
        return;
    }
    console.log(`Releasing ${releaseName} on ${getBranchName()}`);
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

function checkIfCommitExists(commitHash) {
    try {
        const res = execSync(`git rev-parse --verify --quiet ${commitHash}`);
        return res.toString().trim() === commitHash;
    } catch (error) {
        return false;
    }
}

// function revertCommit(commitHash) {
//     try {
//         if (checkIfCommitExists(commitHash)) {
//             execSync(`git revert ${commitHash}`);
//             console.log(`Reverted commit ${commitHash}`);
//         }
//     } catch (error) {
//
//     }
// }

// function cherryPickCommit(commitHash) {
//     try {
//         if (checkIfCommitExists(commitHash)) {
//             execSync(`git cherry-pick --all ${commitHash}`);
//             console.log(`Cherry picked commit ${commitHash}`);
//         }
//     } catch (error) {
//
//     }
// }

function release(environment, excludedCommitHash) {
    // if (excludedCommitHash && environment === 'prod') {
    //     revertCommit(excludedCommitHash);
    // }

    const commitHash = getLastCommitHash();
    const releaseName = `${environment}-${commitHash}`;

    createAndPushRelease(releaseName);

    // if (excludedCommitHash && environment === 'prod') {
    //     cherryPickCommit(excludedCommitHash);
    // }
}
