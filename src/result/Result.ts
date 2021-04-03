import * as core from '@actions/core';
import { AnalyzeResult } from "../analyze/AnalyzeResult";
import { comment, CommentReact } from "../utils/Comment";
import { FailOn, getFailOn } from "../utils/FailOn";

export interface ResultInterface {
  analyze: AnalyzeResult;
}

/**
 * Handle and summarize the results
 */
export class Result {
  analyze: AnalyzeResult;

  static readonly githubIndentation: number = 2;

  constructor(params: ResultInterface) {
    this.analyze = params.analyze;
  }

  /**
   * Put a comment on the PR
   */
  public async comment(): Promise<void> {
    const messages: string[] = [
      this.issueCountMessage()
    ];

    messages.push('\n---\n');
    
    for (const line of this.analyze.lines) {
      messages.push(`- ${line.originalLine}. [See](${line.url})`);
    }

    await comment({message: messages.join('\n'), reacts: [this.react]});
  }

  /**
   * React to the comment on the PR
   */
  private get react(): CommentReact {
    return '+1';
  }

  private issueCountMessage(): string {
    const messages: string[] = [
    `Dart Analyzer found ${this.analyze.counts.total} issue${Result.pluralS(this.analyze.counts.total)}`,

    ];
    if (!!this.analyze.counts.total && ![FailOn.Info, FailOn.Nothing].includes(getFailOn())) {
      // Issues are found and there are some non failing logs and failing logs
      const failCount = this.analyze.counts.failCount;
      messages.push(`- ${failCount} critical issue${Result.pluralS(failCount)}`);
      messages.push(`- ${this.analyze.counts.total - failCount} non failing issue${Result.pluralS(this.analyze.counts.failCount)}`);
    }
    return messages.join('\n');
    
  }

  /**
   * Log the results in the github action
   */
  public log(): void {
    const logger = this.analyze.isSuccess ? core.warning : core.setFailed;
    logger(this.issueCountMessage());
    
  }

  private static indent(times: number): string {
    return ' '.repeat(times * Result.githubIndentation);
  }



  private static pluralS(count: number): string {
    return count > 1 ? 's': '';
  }
}