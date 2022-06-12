import path from 'path';
import { actionOptions } from '../utils/ActionOptions';
import { FailOnEnum } from '../utils/FailOn';
import { DartAnalyzeLogType, DartAnalyzeLogTypeEnum, DartAnalyzeLogTypeKey } from './DartAnalyzeLogType';

export interface ParsedLineInterface {
  file: string;
  line: number;
  column: number;
  message: string;
  url: string;
  type: DartAnalyzeLogTypeEnum
  originalLine: string;
}

export class ParsedLine {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly urls: [string, string];
  readonly type: DartAnalyzeLogTypeEnum;
  readonly originalLine: string;
  readonly lintName: string;

  constructor(params: { line: string, delimiter?: string }) {
    this.originalLine = params.line; // 'INFO|LINT|PREFER_CONST_CONSTRUCTORS|/path/to/file.dart|96|13|80|Prefer const with constant constructors.'
    const lineData = params.line.split(params?.delimiter ?? '|'); // ['INFO', 'LINT', 'PREFER_CONST_CONSTRUCTORS', '/path/to/file.dart', '96', '13', '80', 'Prefer const with constant constructors.']
    this.type = DartAnalyzeLogType.typeFromKey(lineData[0] as DartAnalyzeLogTypeKey);
    this.message = lineData[7]; // 'Prefer const with constant constructors.'
    this.file = path.join(lineData[3]); // '/path/to/file.dart'
    const lineNumber = lineData[4]; // '96'
    const columnNumber = lineData[5]; // '13'
    const lintName = lineData[2].toLowerCase(); // 'PREFER_CONST_CONSTRUCTORS'
    this.lintName = lintName.toLowerCase();  // 'prefer_const_constructors'
    this.urls = [
      `https://dart.dev/tools/diagnostic-messages#${this.lintName}`,
      `https://dart-lang.github.io/linter/lints/${this.lintName}.html`,
    ];
    this.line = parseInt(lineNumber);
    this.column = parseInt(columnNumber);
  }

  public get isFail(): boolean {
    if (actionOptions.failOn !== FailOnEnum.Nothing) {
      if (this.type === DartAnalyzeLogTypeEnum.Error) {
        return true;
      }
      if (actionOptions.failOn !== FailOnEnum.Error) {
        if (this.type === DartAnalyzeLogTypeEnum.Warning) {
          return true;
        }
        if (actionOptions.failOn !== FailOnEnum.Warning) {
          // It is FailOn.Info
          return true;
        }
      }
    }
    return false;
  }

  public get emoji(): string {
    switch (this.type) {
      case DartAnalyzeLogTypeEnum.Error:
        return ':bangbang:';
      case DartAnalyzeLogTypeEnum.Warning:
        return ':warning:';
      case DartAnalyzeLogTypeEnum.Info:
        return ':eyes:';
    }
  }

  public get humanReadableString(): string {
    return `${DartAnalyzeLogType.typeToString(this.type)} - \`${path.relative(process.env.GITHUB_WORKSPACE!, this.file)}\`:${this.line}:${this.column} - ${this.message} (${this.lintName}).`;
  }
}
