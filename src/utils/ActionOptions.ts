import * as core from '@actions/core';
import * as path from 'path';
import { FailOn, FailOnEnum } from './FailOn';

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
    this.failOn = FailOn.fromInput(core.getInput('fail-on') || 'error');
    this.workingDirectory = path.resolve(process.env.GITHUB_WORKSPACE!, core.getInput('working-directory') ?? './');
    this.token = core.getInput('token', { required: true });
    console.log('hasToken', !!this.token);
    this.checkRenamedFiles = core.getInput('check-renamed-files') === 'true';
    this.emojis = (core.getInput('emojis') || 'true') === 'true';
    this.format = (core.getInput('format') || 'true') === 'true';
    try {
      this.lineLength = parseInt(core.getInput('line-length'));
    } catch (_) {
      this.lineLength = null;
    }
  }
}

/**
 * Singleton with the option of the action
 */
export const actionOptions = new ActionOptions();
