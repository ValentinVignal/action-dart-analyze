import * as path from 'path';
import { FailOn, FailOnEnum } from './FailOn';
import { getInputSafe } from './getInput';

/**
 * Contains all the options of the action
 */
export class ActionOptions {
  public readonly failOn: FailOnEnum;
  public readonly workingDirectory: string;
  public readonly token: string;
  public readonly checkRenamedFiles: boolean;
  public readonly emojis: boolean;
  public readonly format: boolean;
  public readonly lineLength: number | null;
  constructor() {
    this.failOn = FailOn.fromInput(getInputSafe('fail-on') || 'error');
    this.token = getInputSafe('token', { required: true });
    this.workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, getInputSafe('working-directory') ?? './');
    this.checkRenamedFiles = getInputSafe('check-renamed-files') === 'true';
    this.emojis = (getInputSafe('emojis') || 'true') === 'true';
    this.format = (getInputSafe('format') || 'true') === 'true';
    try {
      this.lineLength = parseInt(getInputSafe('line-length'));
    } catch (_) {
      this.lineLength = null;
    }
  }
}

/**
 * Singleton with the option of the action
 */
export const actionOptions = new ActionOptions();