#!/usr/bin/env node

import { Octokit } from 'octokit';
import core from '@actions/core';

const GH_TOKEN   = core.getInput('GH_TOKEN');
const workflowID = core.getInput('workflow_id');
const repoName   = process.env.GITHUB_REPOSITORY;
const filter     = core.getInput('filter') || ""; // empty filters match
                                                  // everything

if (!GH_TOKEN) {
    console.error('Error: The GH_TOKEN environment variable is not set.');
    process.exit(1);
}

if (!workflowID) {
    console.error('Error: The workflowID environment variable is not set.');
    process.exit(1);
}

if (!repoName) {
    console.error(
        'Error: The GITHUB_REPOSITORY environment variable is not set.');
    process.exit(1);
}

const regexFilter = new RegExp(filter);
console.log(`"${filter}" =  ${regexFilter}`);

var badAnnotations = [];

const octokit = new Octokit({ auth: GH_TOKEN });

// Get the jobs in the workflow ...
const { data: { jobs } } = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs',
    {
        owner: repoName.split('/')[0],
        repo: repoName.split('/')[1],
        run_id: workflowID,
        mediaType: {
            format: 'json',
            previews: ['scarlet-witch']
        }
    }
);

if ( !jobs ) {
    console.error(`Error: could not get jobs for workflow "${workflowID}"`);
}

// ... then get the annotations for each job
for (const job of jobs) {
    const { data: annotations } = await octokit.request(
        'GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations',
        {
            owner: repoName.split('/')[0],
            repo: repoName.split('/')[1],
            check_run_id: job.id,
            mediaType: {
                format: 'json',
                previews: ['scarlet-witch']
            }
        }
    );

    if ( !annotations ) {
        // this is not always a bug, could just be a run with no annotations
        console.info(
            `info: could not get annotations for data for run ${job.id}.`);
        continue;
    }

    for (const an of annotations) {
        const text = an.title + an.message;

        if (['warning', 'failure'].includes(an.annotation_level.toLowerCase()))
        {
            console.log(
                "debug: trying to match " + text + " to " + regexFilter);

            if (regexFilter.test(text)) {
                console.log(an);
                badAnnotations.push(an);
            }
        }
    }
}

if (badAnnotations.length > 0) {
    core.setFailed(
        `Found ${ badAnnotations.length } annotations of 'warning' or higher` +
        `severity.`
    );
}


