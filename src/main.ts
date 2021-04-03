import * as core from '@actions/core';
import * as path from 'path';

import { analyze } from './analyze/analyze';
import { AnalyzeResult } from './analyze/AnalyzeResult';
import { comment } from './utils/Comment';


async function main(): Promise<void> {

  try {
    let workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, core.getInput('working-directory'))
    if (!workingDirectory) {
      workingDirectory = './';
    }


    const analyzeResult = await analyze(workingDirectory);
    // const formatWarningCount = await format(workingDirectory);

    // const success = isSuccess(analyzeResult);
    const success = analyzeResult.counts.failCount === 0;

    await logResult({success, result: analyzeResult});
    
  } catch (error) {
    core.setFailed(`error: ${error.message}`);
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
