import * as exec from '@actions/exec';
import { DartAnalyzeLogType, DartAnalyzeLogTypeEnum } from './DartAnalyzeLogType';
import { AnalyzeResult } from './AnalyzeResult';
import { ParsedLine } from './ParsedLine';
import { ModifiedFiles } from '../utils/ModifiedFiles';
import { actionOptions } from '../utils/ActionOptions';

/**
 * Runs `dart analyze`
 * 
 * @param params 
 * @returns The result of `dart analyze`
 */
export async function analyze(params: {modifiedFiles: ModifiedFiles}): Promise<AnalyzeResult> {
  let outputs = '';
  let errOutputs = '';

  console.log('::group:: Analyze dart code')

  const options: exec.ExecOptions = {cwd: actionOptions.workingDirectory};

  options.listeners = {
    stdout: (data) => {
      outputs += data.toString();
    },
    stderr: (data) => {
      errOutputs += data.toString();
    }
  };
  
  const args = [actionOptions.workingDirectory];

  try {
    await exec.exec('dart analyze', args, options);
  } catch (_) {
    // dart analyze sometimes fails
  }

  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  const lines = outputs.trim().split(/\r?\n/);
  const errLines = errOutputs.trim().split(/\r?\n/);
  const delimiter = '-';

  const parsedLines: ParsedLine[] = [];

  for (const line of [...lines, ...errLines]) {
    if (!line.includes(delimiter)) {
      continue;
    }
    try {
      const parsedLine = new ParsedLine({
        line,
        delimiter,
      });
      if (!params.modifiedFiles.has(parsedLine.file)) {
        // Don't lint anything if the file is not part of the changes
        continue
      }
      const modifiedFile = params.modifiedFiles.get(parsedLine.file)!;
      if (!modifiedFile.hasAdditionLine(parsedLine.line)) {
        // Don't lint if the issue doesn't belong to the additions
        continue;
      }

      parsedLines.push(parsedLine);
      let urls = parsedLine.urls[0];
      if (urls.length > 1) {
        urls += `or ${urls[1]}`;
      }
      const message = `file=${parsedLine.file},line=${parsedLine.line},col=${parsedLine.column}::${parsedLine.message}. See ${parsedLine.urls[0]}`;

      switch(parsedLine.type) {
        case DartAnalyzeLogTypeEnum.Error:
          errorCount++;
          break;
        case DartAnalyzeLogTypeEnum.Warning:
          warningCount++;
          break;
        default:
          infoCount++;
          break;
      }
      console.log(`::${DartAnalyzeLogType.keyFromType(parsedLine.type)} ${message}`); // Log the issue

    } catch (error) {
      console.log(`Error analyzing line ${line}:\n${error}`);
    }
  } 
  console.log('::endgroup::');

  return new AnalyzeResult({
    counts: {
      info: infoCount,
      warnings: warningCount,
      errors: errorCount,
    },
    lines: parsedLines,
  });
}
