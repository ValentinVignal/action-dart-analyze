import * as exec from '@actions/exec';
import { actionOptions } from '../utils/ActionOptions';
import { IgnoredFiles } from '../utils/IgnoredFiles';
import { ModifiedFiles } from '../utils/ModifiedFiles';
import { FormatResult } from './FormatResult';

export async function format(params: { modifiedFiles: ModifiedFiles, ignoredFiles: IgnoredFiles }): Promise<FormatResult> {
  if (!actionOptions.format) {
    return new FormatResult();
  }
  let output = '';
  let errOutputs = '';

  console.log('::group:: Analyze formatting');

  const options: exec.ExecOptions = { cwd: actionOptions.workingDirectory };
  options.listeners = {
    stdout: (data) => {
      output += data.toString();
    },
    stderr: (data) => {
      errOutputs += data.toString();
    }
  };

  const args: string[] = ['-o', 'none'];
  if (actionOptions.lineLength) {
    args.push('--line-length');
    args.push(actionOptions.lineLength.toString());
  }
  args.push('.');

  try {
    await exec.exec('dart format', args, options);
  } catch (_) {

  }


  const lines = output.trim().split(/\r?\n/);
  const errLines = errOutputs.trim().split(/\r?\n/);

  const fileNotFormatted = new Set<string>();

  console.log('formatted files:');
  for (const file of params.modifiedFiles.files.keys()) {
    console.log('   ', file);
  }

  for (const line of [...lines, ...errLines]) {
    console.log('line', line);
    if (!line.startsWith('Changed')) {
      continue;
    }

    const file = line.split(' ')[1];
    if (params.ignoredFiles.has(file)) {
      continue;
    }
    if (params.modifiedFiles.has(file)) {
      fileNotFormatted.add(file);
      console.log(`::warning file=${file}:: ${file} is not formatted`);
    }
  }
  console.log('::endgroup::');

  return new FormatResult({
    files: fileNotFormatted,
  });
}
