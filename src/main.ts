import * as core from '@actions/core';
import * as path from 'path';

import { analyze, AnalyzeResult } from './Analyze';
import { comment } from './Comment';
import { FailOn, getFailOn } from './FailOn';


async function main(): Promise<void> {

  try {
    let workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, core.getInput('working-directory'))
    if (!workingDirectory) {
      workingDirectory = './';
    }


    const analyzeResult = await analyze(workingDirectory);
    // const formatWarningCount = await format(workingDirectory);

    const success = isSuccess(analyzeResult);

    await logResult({success, result: analyzeResult});
    
  } catch (error) {
    core.setFailed(`error: ${error.message}`);
  }

}

function isSuccess(result: AnalyzeResult): boolean {
    const failOn = getFailOn();
    switch (failOn) {
      case FailOn.Nothing:
        return true;
        // core.warning(message);
        // break;
      case FailOn.Error:
        return !!result.counts.errors
        // if (result.counts.errors) {
        //   core.setFailed(message);
        // } else {
        //   core.warning(message);
        // }
        // break;
      case FailOn.Warning:
        return !!(result.counts.errors + result.counts.info);
        // if (result.counts.errors + result.counts.info) {
        //   core.setFailed(message);
        // } else {
        //   core.warning(message);
        // }
        // break;
      case FailOn.Info:
        return !!(result.counts.errors + result.counts.warnings + result.counts.info);
        // if (result.counts.errors + result.counts.warnings + result.counts.info) {
        //   core.setFailed(params.message);
        // } else {
        //   core.warning(params.message);
        // }
    }

}

async function logResult(params: {success: boolean, result: AnalyzeResult}): Promise<void> {
    const issueCount = params.result.counts.info + params.result.counts.warnings + params.result.counts.errors; // + formatWarningCount;
    const message = `${issueCount} issue${issueCount === 1 ? '' : 's'} found.`;
    await comment({message});
    const logger = params.success ? core.warning : core.setFailed;
    logger(message);
}

main();
