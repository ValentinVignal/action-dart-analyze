
import * as core from '@actions/core';
import * as path from 'path';

import { analyze } from './analyze';


async function main(): Promise<void> {

  try {
    let workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE, core.getInput('working-directory'))
    if (!workingDirectory) {
      workingDirectory = './';
    }


    const [analyzeErrorCount, analyzeWarningCount, analyzeInfoCount] = await analyze(workingDirectory);
    // const formatWarningCount = await format(workingDirectory);

    const issueCount = analyzeErrorCount + analyzeWarningCount + analyzeInfoCount; // + formatWarningCount;
    const failOnWarnings = core.getInput('fail-on-warnings') === 'true';
    const message = `${issueCount} issue${issueCount === 1 ? '' : 's'} found.`;

    if (analyzeErrorCount > 0 || (failOnWarnings && issueCount > 0)) {
      core.setFailed(message);
    } else {
      core.warning
      console.log(message);
    }
  } catch (error) {
    core.setFailed(`error: ${error.message}`);
  }

}

main();