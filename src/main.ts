import * as core from '@actions/core';
import { analyze } from './analyze/analyze';
import { format } from './format/Format';
import { Result } from './result/Result';
import { IgnoredFiles } from './utils/IgnoredFiles';
import { ModifiedFiles } from './utils/ModifiedFiles';


/**
 * Run the action
 */
async function main(): Promise<void> {

  try {
    const modifiedFiles = new ModifiedFiles();
    await modifiedFiles.isInit;

    const ignoredFiles = new IgnoredFiles();

    const analyzeResult = await analyze({
      modifiedFiles,
      // `dart analyze` already doesn't check ignore files
    });

    const formatResult = await format({
      modifiedFiles,
      ignoredFiles,
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
