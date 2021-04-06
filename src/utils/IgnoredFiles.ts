import * as yaml from 'js-yaml';
import * as fs from 'fs';

/**
 * The ignore files in the analysis_options.yaml
 */
export class IgnoredFiles{
  private readonly files: Set<string>;
  constructor() {
    try {
      const yamlFile = yaml.load(fs.readFileSync('./analysis_options.yml', 'utf8')) as {analyzer?: {exclude?: string[]}};
      this.files = new Set(yamlFile?.analyzer?.exclude ?? []);
    } catch (error) {
      this.files ??= new Set<string>();
      console.log(`Could not load analysis_options.yml:\n${error}`);
    }
  }

  /**
   * Whether a file is ignored
   */
  public has(file: string): boolean {
    return this.files.has(file);
  }
}
