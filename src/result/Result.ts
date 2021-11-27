import * as core from '@actions/core';
import { AnalyzeResult } from "../analyze/AnalyzeResult";
import { DartAnalyzeLogType, DartAnalyzeLogTypeEnum } from '../analyze/DartAnalyzeLogType';
import { FormatResult } from '../format/FormatResult';
import { actionOptions } from '../utils/ActionOptions';
import { comment } from "../utils/Comment";
import { FailOnEnum } from '../utils/FailOn';

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
    /**
     * Dart analyze result
     */
    this.analyze = params.analyze;
    /**
     * Dart format result
     */
    this.format = params.format;
  }

  /**
   * Whether it is a success or not
   */
  public get success(): boolean {
    return this.analyze.success && this.format.success;
  }

  /**
   * Put a comment on the PR
   */
  public async comment(): Promise<void> {
    const messages: string[] = [
      this.issueCountMessage({ emojis: true })
    ];

    const analyzeBody = this.analyze.commentBody;
    if (analyzeBody) {
      messages.push(analyzeBody);
    }
    const formatBody = this.format.commentBody;
    if (formatBody) {
      messages.push(formatBody);
    }

    await comment({ message: messages.join('\n---\n') });
  }

  /**
   * Summary of the analysis put in the comment and in the console
   * 
   * @param params 
   * @returns 
   */
  private issueCountMessage(params?: { emojis?: boolean }): string {
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
    ];
    if (actionOptions.format) {
      messages.push(this.titleLineFormat({ ...params, }));
    }
    return messages.join('\n');
  }

  /**
   * Global title put in the comment or in the console at the end of the analysis
   * 
   * @param params 
   * @returns 
   */
  private title(params?: { emojis?: boolean }): string {
    const title = `Dart Analyzer found ${this.count} issue${Result.pluralS(this.count)}`;
    if (params?.emojis && actionOptions.emojis) {
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

  /**
   * Line title for a specific dart analysis category
   * 
   * @param params 
   * @returns 
   */
  private titleLineAnalyze(params: { emojis?: boolean, type: DartAnalyzeLogTypeEnum }): string {
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
    line = `- ${params.emojis && actionOptions.emojis ? emoji : ''}${highlight}${line}.${highlight}`;
    return line;
  }

  /**
   * Line title for the formatting issues
   * 
   * @param params 
   * @returns 
   */
  private titleLineFormat(params: { emojis?: boolean }): string {
    let emoji = `:${this.format.count ? 'poop' : 'art'}: `;
    const highlight = params.emojis && this.format.count && actionOptions.failOn === FailOnEnum.Format ? '**' : '';
    return `- ${params.emojis && actionOptions.emojis ? emoji : ''}${highlight}${this.format.count} formatting issue${Result.pluralS(this.format.count)}${highlight}`;
  }

  /**
   * Log the results in the github action
   */
  public log(): void {
    const logger = this.success ? (this.count ? core.warning : core.info) : core.setFailed;
    logger(this.issueCountMessage());

  }

  /**
   * 
   * @param count 
   * @returns 's' if count > 1, else '' 
   */
  private static pluralS(count: number): string {
    return count > 1 ? 's' : '';
  }

  /**
   * The total count of issues found
   */
  private get count() {
    return this.analyze.counts.total + this.format.count;
  }
}
