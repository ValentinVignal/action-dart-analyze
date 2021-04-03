import * as core from '@actions/core';
import * as path from 'path';

import { analyze } from './analyze/analyze';
import { Result } from './result/Result';

async function main(): Promise<void> {

  try {
    let workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, core.getInput('working-directory'))
    if (!workingDirectory) {
      workingDirectory = './';
    }
    const analyzeResult = await analyze(workingDirectory);

    const result = new Result({
      analyze: analyzeResult,
    });

    await result.comment();
    result.log();
  } catch (error) {
    core.setFailed(`error: ${error.message}`);
  }

}

main();
