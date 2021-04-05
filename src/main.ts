import * as core from '@actions/core';

import { analyze } from './analyze/analyze';
import { format } from './format/Format';
import { Result } from './result/Result';
import { ModifiedFiles } from './utils/ModifiedFiles';

/**
 * Run the action
 */
async function main(): Promise<void> {

  try {
    const modifiedFiles = new ModifiedFiles();
    await modifiedFiles.isInit;

    const analyzeResult = await analyze({
      modifiedFiles,
    });

    const formatResult = await format({
      modifiedFiles,
    });
    /*

    const result = new Result({
      analyze: analyzeResult,
      format: formatResult,
    });

    if (!result.success) {
      await result.comment();
    }
    result.log();
    */
  } catch (error) {
    core.setFailed(`error: ${error.message}`);
  }

}

main();
