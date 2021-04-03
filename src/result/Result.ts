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

  constructor(params: ResultInterface) {
    this.analyze = params.analyze;
  }

  public get success():boolean {
    return this.analyze.isSuccess;
  }

  /**
   * Put a comment on the PR
   */
  public async comment(): Promise<void> {
    const messages: string[] = [
      this.issueCountMessage({emojis: true})
    ];

    messages.push('\n---\n');
    
    for (const line of this.analyze.lines) {
      let urls = `[link](${line.urls[0]})`;
      if (line.urls.length > 1) {
        urls += ` or [link](${line.urls[1]})`
      }
      
      let failEmoji = '';
      const failOn = getFailOn();
      if (![FailOn.Nothing, FailOn.Info].includes(failOn)) {
        failEmoji = `:${line.isFail ? 'x' : 'poop'}: `
      }
      messages.push(`- ${failEmoji}${line.emoji} ${line.originalLine}. See ${urls}`);
    }

    await comment({message: messages.join('\n'), reacts: [this.react]});
  }

  /**
   * React to the comment on the PR
   */
  private get react(): CommentReact {
    return '+1';
  }

  private issueCountMessage(params?: {emojis?: boolean}): string {
    const messages: string[] = [];
    const titleLine = `Dart Analyzer found ${this.analyze.counts.total} issue${Result.pluralS(this.analyze.counts.total)}`;
    if (params?.emojis) {
      let emoji = ':tada:';
      if (this.analyze.counts.failCount) {
        emoji = ':x:';
      } else if (this.analyze.counts.total) {
        emoji = ':warning:';
      }
      messages.push(`${emoji} ${titleLine}`);
    } else {
      messages.push(titleLine);
    }
    if (!!this.analyze.counts.total && ![FailOn.Info, FailOn.Nothing].includes(getFailOn())) {
      // Issues are found and there are some non failing logs and failing logs
      const failCount = this.analyze.counts.failCount;
      let firstLine = `${failCount} critical issue${Result.pluralS(failCount)}`;
      if (params?.emojis) {
        firstLine = `:${failCount ? 'x' : 'white_check_mark'}: ${firstLine}`
      }
      let secondLine = `${this.analyze.counts.total - failCount} non failing issue${Result.pluralS(this.analyze.counts.failCount)}`
      if (params?.emojis) {
        secondLine = `:${this.analyze.counts.total - failCount ? 'warning': 'white_check_mark'}: ${secondLine}`
      }
      messages.push(`- ${firstLine}`);
      messages.push(`- ${secondLine}`);
    }
    return messages.join('\n');
    
  }

  /**
   * Log the results in the github action
   */
  public log(): void {
    const logger = this.success ? core.warning : core.setFailed;
    logger(this.issueCountMessage());
    
  }

  private static pluralS(count: number): string {
    return count > 1 ? 's': '';
  }
}