import * as yaml from 'js-yaml';
import * as fs from 'fs';
// import { minimatch } from 'minimatch';
import * as minimatch from 'minimatch';
import * as path from 'path';
import { actionOptions } from './ActionOptions';

/**
 * The ignore files in the analysis_options.yaml
 */
export class IgnoredFiles {
  private readonly patterns: minimatch.IMinimatch[];
  constructor() {
    let patterns: string[];
    try {
      const yamlFile = yaml.load(fs.readFileSync(path.resolve(actionOptions.workingDirectory, './analysis_options.yaml'), 'utf8')) as { analyzer?: { exclude?: string[] } };
      patterns = yamlFile?.analyzer?.exclude ?? [];
    } catch (error) {
      console.log(`Could not load analysis_options.yaml:\n${error}`);
    }
    patterns ??= [];
    this.patterns = patterns.map((pattern) => new minimatch.Minimatch(pattern));
  }

  /**
   * Whether a file is ignored
   */
  public has(file: string): boolean {
    return this.patterns.some((pattern) => pattern.match(file));
  }
}
