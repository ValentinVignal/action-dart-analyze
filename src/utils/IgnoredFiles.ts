import * as fs from 'fs';
import * as yaml from 'js-yaml';
import minimatch from 'minimatch';
import * as path from 'path';
import { actionOptions } from './ActionOptions';

type AnalysisOptions = {
  exclude?: string[];
  include?: string;
}

/**
 * The ignore files in the analysis_options.yaml
 */
export class IgnoredFiles {
  private readonly patterns: minimatch.IMinimatch[];
  constructor() {
    let patterns: string[];
    try {
      const yamlPath = IgnoredFiles.findClosestYamlFile(actionOptions.workingDirectory);
      if (!yamlPath) {
        throw new Error(`Could not find any "analysis_options.yaml" in the parent directories of "${actionOptions.workingDirectory}"`);
      }
      patterns = IgnoredFiles.getIgnoredPatterns(yamlPath);
    } catch (error) {
      console.error('Could not load analysis_options.yaml:\n', error);
    }
    patterns ??= [];
    console.log('partterns');
    console.log(patterns);
    this.patterns = patterns.map((pattern) => new minimatch.Minimatch(pattern));
  }

  /**
   * 
   * @param path 
   */
  private static findClosestYamlFile(directoryPath: string): string | null {
    const yamlPath = path.resolve(directoryPath, 'analysis_options.yaml');
    if (fs.existsSync(yamlPath)) {
      return yamlPath;
    } else {
      const parentDirectoryPath = path.resolve(directoryPath, '..');
      if (parentDirectoryPath === directoryPath) {
        return null;
      } else {
        return IgnoredFiles.findClosestYamlFile(parentDirectoryPath);
      }
    }
  }

  private static getIgnoredPatterns(yamlPath: string): string[] {
    const yamlFile = yaml.load(fs.readFileSync(yamlPath, 'utf8')) as AnalysisOptions;
    const ignoredFiles = yamlFile?.exclude ?? [];
    if (yamlFile?.include) {
      const newPath = path.resolve(yamlPath, yamlFile.include);
      if (fs.existsSync(newPath)) {
        return [
          ...IgnoredFiles.getIgnoredPatterns(newPath),
          ...ignoredFiles,
        ];
      }
    }
    return ignoredFiles;
  }

  /**
   * Whether a file is ignored
   */
  public has(file: string): boolean {
    return this.patterns.some((pattern) => pattern.match(file));
  }
}
