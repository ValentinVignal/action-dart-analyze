import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';
import { DartAnalyzeLogType, DartAnalyzeLogTypeKey, getDartAnalyzeLogType, getLogKey } from './DartAnalyzeLogType';
import { getModifiedFiles } from './ModifiedFiles';

export async function analyze(workingDirectory: string): Promise<[number, number, number]> {
  let outputs = '';
  let errOutputs = '';

  console.log('::group:: Analyze dart code')

  const options: exec.ExecOptions = {cwd: workingDirectory};

  options.listeners = {
    stdout: (data) => {
      outputs += data.toString();
    },
    stderr: (data) => {
      errOutputs += data.toString();
    }
  };
  
  const args = [workingDirectory];

  try {
    await exec.exec('dart analyze', args, options);
  } catch (_) {
    // dart analyze sometimes fails
  }

  const modifiedFiles = await getModifiedFiles();

  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  const lines = outputs.trim().split(/\r?\n/);
  const errLines = errOutputs.trim().split(/\r?\n/);
  const delimiter = '-';

  for (const line of [...lines, ...errLines]) {
    if (!line.includes(delimiter)) {
      continue;
    }
    try {
      const parsedLine = parseLine(line, delimiter);
      if (!modifiedFiles.includes(parsedLine.file)) {
        continue
      }
      const message = `file=${parsedLine.file},line=${parsedLine.line},col=${parsedLine.column}::${parsedLine.message} [See](${parsedLine.url})`;

      switch(parsedLine.type) {
        case DartAnalyzeLogType.Error:
          errorCount++;
          break;
        case DartAnalyzeLogType.Warning:
          warningCount++;
          break;
        default:
          infoCount++;
          break;
      }
      console.log(`::${getLogKey(parsedLine.type)} ${message}`);

    } catch (_) {}
  } 
  console.log('::endgroup::');

  return [errorCount, warningCount, infoCount];
}

interface ParsedLine {
  file: string;
  line: number;
  column: number;
  message: string;
  url: string;
  type: DartAnalyzeLogType
}

/**
 * @description Extract useful information from a line
 * 
 * @param line 
 * @param delimiter 
 * @returns 
 */
function parseLine(line: string, delimiter: string): ParsedLine {
      const lineData = line.split(delimiter);
      const logType = getDartAnalyzeLogType(lineData[0].trim() as DartAnalyzeLogTypeKey);
      const lints = lineData[1].trim().split(' at ');
      const location = lints.pop()?.trim()!;
      const lintMessage = lints.join(' at ').trim();
      const [file, lineNumber, columnNumber] = location.split(':');
      const lintName = lineData[2].replace(/[\W]+/g, '');
      const lintNameLowerCase = lintName.toLowerCase();
      const url = lintName === lintNameLowerCase
        ? `https://dart-lang.github.io/linter/lints/${lintNameLowerCase}.html`
        : `https://dart.dev/tools/diagnostic-messages#${lintNameLowerCase}`
      return {
        file,
        line: parseInt(lineNumber),
        column: parseInt(columnNumber),
        message: lintMessage,
        url,
        type: logType,
      }

}

