import * as core from '@actions/core';
import { AnalyzeResult } from "../analyze/AnalyzeResult";
import { DartAnalyzeLogType, DartAnalyzeLogTypeEnum } from '../analyze/DartAnalyzeLogType';
import { FormatResult } from '../format/FormatResult';
import { comment } from "../utils/Comment";
import { failOn, FailOn } from "../utils/FailOn";

export interface ResultInterface {
  analyze: AnalyzeResult;
  format: FormatResult;
}

/**
 * Handle and summarize the results
 */
export class Result {
  analyze: AnalyzeResult;
  format: FormatResult;

  constructor(params: ResultInterface) {
    this.analyze = params.analyze;
    this.format = params.format;
  }

  public get success():boolean {
    return this.analyze.success && this.format.success;
  }

  /**
   * Put a comment on the PR
   */
  public async comment(): Promise<void> {
    const messages: string[] = [
      this.issueCountMessage({emojis: true})
    ];

    const analyzeBody = this.analyze.commentBody;
    if (analyzeBody) {
      messages.push(analyzeBody);
    }
    const formatBody = this.format.commentBody;
    if (formatBody) {
      messages.push(formatBody);
    }

    await comment({message: messages.join('\n---\n')});
  }

  private issueCountMessage(params?: {emojis?: boolean}): string {
    const messages: string[] = [
      this.title(params),
      this.titleLineAnalyze({
        ...params,
        type: DartAnalyzeLogTypeEnum.Error,
      }),
      this.titleLineAnalyze({
        ...params,
        type: DartAnalyzeLogTypeEnum.Warning,
      }),
      this.titleLineAnalyze({
        ...params,
        type: DartAnalyzeLogTypeEnum.Info,
      }),
      this.titleLineFormat({
        ...params,
      })
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

  private titleLineAnalyze(params: {emojis?: boolean, type: DartAnalyzeLogTypeEnum}): string {
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

    private titleLineFormat(params: {emojis?: boolean}):string {
      let emoji = `:${this.format.count ? 'poop' : 'art'}: `;
      const highlight = params.emojis && this.format.count ? '**' : '';
      return `- ${params.emojis ? emoji : '' } ${highlight}${this.format.count} formatting issue${Result.pluralS(this.format.count)}`;
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