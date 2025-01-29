import * as path from 'path';
import { FailOn, FailOnEnum } from './FailOn';
import { getInput } from './getInput';

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
    this.failOn = FailOn.fromInput(getInput('fail-on') || 'error');
    this.workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, getInput('working-directory') ?? './');
    this.token = getInput('token', { required: true });
    this.checkRenamedFiles = getInput('check-renamed-files') === 'true';
    this.emojis = (getInput('emojis') || 'true') === 'true';
    this.format = (getInput('format') || 'true') === 'true';
    try {
      this.lineLength = parseInt(getInput('line-length'));
    } catch (_) {
      this.lineLength = null;
    }
    console.log('hasInputs', !!this.token, this.failOn, this.workingDirectory, this.checkRenamedFiles, this.emojis, this.format, this.lineLength);
  }
}

/**
 * Singleton with the option of the action
 */
export const actionOptions = new ActionOptions();