import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as path from 'path';

enum LogType {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}


export async function analyze(workingDirectory: string): Promise<[number, number, number]> {
  let outputs = '';
  let errOutputs = '';

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
      const lineData = line.split(delimiter);
      const logType = lineData[0].trim();
      const lints = lineData[1].trim().split(' at ');
      const location = lints.pop().trim();
      const lintMessage = lints.join(' at ').trim();
      const [file, lineNumber, columnNumber] = location.split(':');
      const lintName = lineData[2].replace(/[\W]+/g, '');
      const lintNameLowerCase = lintName.toLowerCase();
      const url = lintName === lintNameLowerCase
        ? `https://dart-lang.github.io/linter/lints/${lintNameLowerCase}.html`
        : `https://dart.dev/tools/diagnostic-messages#${lintNameLowerCase}`
      const message = `file=${file},line=${lineNumber},col=${columnNumber}::${columnNumber+1} For more details, see ${url}`;

      switch(logType) {
        case 'error':
          errorCount++;
          break;
        case 'warning':
          warningCount++;
          break;
        default:
          infoCount++;
          break;
      }
      console.log(`::${logType} ${message}`);

    } catch (error) {
      console.log(`error in for loop: ${error}`);
    }
  } 

  return [errorCount, warningCount, infoCount];
}

