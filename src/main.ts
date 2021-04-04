import * as core from '@actions/core';
import * as path from 'path';

import { analyze } from './analyze/analyze';
import { format } from './format/Format';
import { Result } from './result/Result';
import { ModifiedFiles } from './utils/ModifiedFiles';

async function main(): Promise<void> {

  try {
    let workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, core.getInput('working-directory'))
    if (!workingDirectory) {
      workingDirectory = './';
    }

    const modifiedFiles = new ModifiedFiles();
    await modifiedFiles.isInit;

    const analyzeResult = await analyze({
      workingDirectory,
      modifiedFiles,
    });

    const formatResult = await format({
      workingDirectory,
      modifiedFiles,
    });

    const result = new Result({
      analyze: analyzeResult,
      format: formatResult,
    });

    if (!result.success) {
      await result.comment();
    }
    result.log();
  } catch (error) {
    core.setFailed(`error: ${error.message}`);
  }

}

main();
