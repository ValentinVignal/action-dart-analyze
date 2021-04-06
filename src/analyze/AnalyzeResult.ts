import { actionOptions } from "../utils/ActionOptions";
import { FailOnEnum } from "../utils/FailOn";
import { ParsedLine } from "./ParsedLine";

export interface AnalyzeResultCountsInterface {
  info: number;
  warnings: number;
  errors: number;
}

/**
 * Different log counts from the dart Analyze
 */
class AnalyzeResultCounts {
  info: number;
  warnings: number;
  errors: number;
  constructor(params: AnalyzeResultCountsInterface) {
    this.info = params.info;
    this.warnings = params.warnings;
    this.errors = params.errors;
  }

  /**
   * The total number of logs
   */
  public get total(): number {
    return this.info + this.warnings + this.errors;
  }

  public get failCount(): number {
    let count = 0;
    if (actionOptions.failOn !== FailOnEnum.Nothing) {
      count += this.errors;
      if (actionOptions.failOn !== FailOnEnum.Error) {
        count += this.warnings;
        if (actionOptions.failOn !== FailOnEnum.Warning) {
          count += this.info;
        }
      }
    } 
    return count;
  }
}


/**
 * Result of dart analyze
 */
export interface AnalyzeResultInterface {
  counts: AnalyzeResultCountsInterface;
  lines: ParsedLine[];
}

export class AnalyzeResult {
  counts: AnalyzeResultCounts;
  lines: ParsedLine[];

  constructor(params: AnalyzeResultInterface) {
    this.counts = new AnalyzeResultCounts(params.counts);
    this.lines =  params.lines;
  }

  // Whether it is a success (not failing results)
  public get success(): boolean {
    return !this.counts.failCount
  }

  // Whether it has logs (even not failing ones)
  public get hasWarning(): boolean {
    return !!this.counts.total;
  }

  /**
   * Get the comment body
   */
  public get commentBody(): string {
    const comments: string[] = [];

    for (const line of this.lines) {
      let urls = `[link](${line.urls[0]})`;
      if (line.urls.length > 1) {
        urls += ` or [link](${line.urls[1]})`
      }
      let failEmoji = '';
      if (![FailOnEnum.Nothing, FailOnEnum.Format, FailOnEnum.Info].includes(actionOptions.failOn)) {
        failEmoji = `:${line.isFail ? 'x' : 'poop'}: `
      }
      const highlight = line.isFail ? '**': '';
      comments.push(`- ${actionOptions.emojis ? failEmoji + line.emoji: ''}${highlight}${line.originalLine.trim().replace(line.file, `\`${line.file}\``)}.${highlight} See ${urls}.`);
    }
    return comments.join('\n');
  }
}
