import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function format(workingDirectory:string ): Promise<number>{
  let output = '';

  const options = { cwd: workingDirectory };
  // options.listeners = {
  //   stdout: (data) => {
  //     output += data.toString();
  //   },
  //   stderr: (data) => {
  //     output += data.toString();
  //   }
  // };

  const args = [];
  const lineLength = core.getInput('line-length');

  if (lineLength) {
    args.push('--line-length');
    args.push(lineLength);
  }

  args.push('--dry-run');
  args.push('.');

  await exec.exec('dartfmt', args, options);

  let warningCount = 0;
  const lines = output.trim().split(/\r?\n/);

  for (const line of lines) {
    if (!line.endsWith('.dart')) continue;

    console.log(`::warning file=${line}::Invalid format. For more details, see https://dart.dev/guides/language/effective-dart/style#formatting`);
    warningCount++;
  }

  return warningCount;
}