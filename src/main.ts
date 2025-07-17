import { type ActionOptions, run } from 'dart-analyze';
import { getInputSafe } from './utils/getInput';
import { FailOn } from './utils/FailOn';

/**
 * Run the action
 */
async function main(): Promise<void> {
  const options: ActionOptions = {
    failOn: FailOn.fromInput(getInputSafe('fail-on')),
    token: getInputSafe('token', { required: true }),
    workingDirectory: getInputSafe('working-directory'),
    checkRenamedFiles: getInputSafe('check-renamed-files') === 'true',
    emojis: (getInputSafe('emojis') || 'true') === 'true',
    format: (getInputSafe('format') || 'true') === 'true',
    lineLength: parseInt(getInputSafe('line-length')) || null,
  };

  await run(options);
}

main();
