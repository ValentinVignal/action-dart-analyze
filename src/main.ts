import * as core from '@actions/core';
import * as path from 'path';

import { analyze } from './Analyze';
import { FailOn, getFailOn } from './FailOn';


async function main(): Promise<void> {

  try {
    let workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, core.getInput('working-directory'))
    if (!workingDirectory) {
      workingDirectory = './';
    }


    const [analyzeErrorCount, analyzeWarningCount, analyzeInfoCount] = await analyze(workingDirectory);
    const failOn = getFailOn();
    // const formatWarningCount = await format(workingDirectory);

    const issueCount = analyzeErrorCount + analyzeWarningCount + analyzeInfoCount; // + formatWarningCount;
    const message = `${issueCount} issue${issueCount === 1 ? '' : 's'} found.`;
    
    switch (failOn) {
      case FailOn.Nothing:
        core.warning(message);
        break;
      case FailOn.Error:
        if (analyzeErrorCount) {
          core.setFailed(message);
        } else {
          core.warning(message);
        }
        break;
      case FailOn.Warning:
        if (analyzeErrorCount + analyzeWarningCount) {
          core.setFailed(message);
        } else {
          core.warning(message);
        }
        break;
      case FailOn.Info:
        if (analyzeErrorCount + analyzeWarningCount + analyzeInfoCount) {
          core.setFailed(message);
        } else {
          core.warning(message);
        }
    }
  } catch (error) {
    core.setFailed(`error: ${error.message}`);
  }

}

main();