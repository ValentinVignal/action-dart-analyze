import * as core from '@actions/core';
import { AnalyzeResult } from "../analyze/AnalyzeResult";
import { DartAnalyzeLogType, DartAnalyzeLogTypeEnum } from '../analyze/DartAnalyzeLogType';
import { comment, CommentReact } from "../utils/Comment";
import { failOn, FailOn } from "../utils/FailOn";

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
      if (![FailOn.Nothing, FailOn.Info].includes(failOn)) {
        failEmoji = `:${line.isFail ? 'x' : 'poop'}: `
      }
      
      const highlight = line.isFail ? '**': '';
      messages.push(`- [ ] ${failEmoji}${line.emoji} ${highlight}${line.originalLine.trim()}.${highlight} See ${urls}`);
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
    const messages: string[] = [
      this.title(params),
      this.titleLine({
        ...params,
        type: DartAnalyzeLogTypeEnum.Error,
      }),
      this.titleLine({
        ...params,
        type: DartAnalyzeLogTypeEnum.Warning,
      }),
      this.titleLine({
        ...params,
        type: DartAnalyzeLogTypeEnum.Info,
      }),
    ];
    return messages.join('\n');
  }

  private title(params?: {emojis?: boolean}): string {
    const title = `Dart Analyzer found ${this.analyze.counts.total} issue${Result.pluralS(this.analyze.counts.total)}`;
    if (params?.emojis) {
      let emoji = ':tada:';
      if (this.analyze.counts.failCount) {
        emoji = ':x:';
      } else if (this.analyze.counts.total) {
        emoji = ':warning:';
      }
      return `${emoji} ${title}`;
    } else {
      return title;
    }
  }

  private titleLine(params: {emojis?: boolean, type: DartAnalyzeLogTypeEnum}): string {
    const isFail = DartAnalyzeLogType.isFail(params.type);
    let emoji = '';
    let count: number;
    let line = '';
    switch (params.type) {
      case DartAnalyzeLogTypeEnum.Error:
        count = this.analyze.counts.errors;
        emoji = count ? 'x' : 'white_check_mark';
        line = `${count} error${Result.pluralS(count)}`
        break;
      case DartAnalyzeLogTypeEnum.Warning:
        count = this.analyze.counts.warnings;
        emoji = count ? 'warning' : 'tada'
        line = `${count} warning${Result.pluralS(count)}`
        break;
      case DartAnalyzeLogTypeEnum.Info:
        count = this.analyze.counts.info;
        emoji = count ? 'eyes' : 'rocket';
        line = `${count} info log${Result.pluralS(count)}`
        break;
    }

    const highlight = isFail && params.emojis && count ? '**' : '';
    emoji = `:${emoji}: `;
    line = `- ${params.emojis ? emoji : ''} ${highlight}${line}.${highlight}`;
    return line;
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