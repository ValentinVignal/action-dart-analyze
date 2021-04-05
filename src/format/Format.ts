import * as exec from '@actions/exec';
import { actionOptions } from '../utils/ActionOptions';
import { ModifiedFiles } from '../utils/ModifiedFiles';
import { FormatResult } from './FormatResult';

export async function format(params: { modifiedFiles: ModifiedFiles }): Promise<FormatResult>{
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

  try {
    await exec.exec('dart format', )
  } catch (_) {

  }

  await exec.exec('dart format -o none .', [], options);

  const lines = output.trim().split(/\r?\n/);
  const errLines = errOutputs.trim().split(/\r?\n/);

  const fileNotFormatted = new Set<string>();

  for (const line of [...lines, ...errLines]) {
    if (!line.startsWith('Changed')) {
      continue;
    }

    const file = line.split(' ')[1];
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