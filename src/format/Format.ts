import * as exec from '@actions/exec';
import { ModifiedFiles } from '../utils/ModifiedFiles';
import { FormatResult } from './FormatResult';

export async function format(params: {workingDirectory:string, modifiedFiles: ModifiedFiles }): Promise<FormatResult>{
  let output = '';
  let errOutputs = '';

  const options: exec.ExecOptions = { cwd: params.workingDirectory };
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

  const args = ['-o none', '.'];
  await exec.exec('dart format', args, options);

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
    }
  }

  return new FormatResult({
    files: fileNotFormatted,
  });
}