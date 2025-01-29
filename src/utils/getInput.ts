import * as core from '@actions/core';


/**
 *
 * Used to get the input from the action. Using the action from the market place
 * with set environment variables like `INPUT_FAIL-ON`, but using the shell
 * script will set environment variable like `INPUT_FAIL_ON`. This function
 * returns the value of the input, no matter how it was set.
 */
export const getInputSafe = (name: string, options?: core.InputOptions): string => {
  const value = core.getInput(name, options);

  if (value || !name.includes('-')) {
    return value;
  }
  return core.getInput(name.replace(/-/g, '_'), options);
};