import { FailOn, getFailOn } from "../utils/FailOn";
import { DartAnalyzeLogType, DartAnalyzeLogTypeKey, getDartAnalyzeLogType } from "./DartAnalyzeLogType";

export interface ParsedLineInterface {
  file: string;
  line: number;
  column: number;
  message: string;
  url: string;
  type: DartAnalyzeLogType
  originalLine: string;
}

export class ParsedLine {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly urls: [string] | [string, string];
  readonly type: DartAnalyzeLogType
  readonly originalLine: string;

  constructor(params: {line: string, delimiter?: string}) {
      this.originalLine = params.line;
      const lineData = params.line.split(params?.delimiter?? '-');
      this.type = getDartAnalyzeLogType(lineData[0].trim() as DartAnalyzeLogTypeKey);
      const lints = lineData[1].trim().split(' at ');
      const location = lints.pop()?.trim()!;
      const lintMessage = lints.join(' at ').trim();
      const [file, lineNumber, columnNumber] = location.split(':');
      const lintName = lineData[2].replace(/[\W]+/g, '');
      const lintNameLowerCase = lintName.toLowerCase();
      let urls = [`https://dart.dev/tools/diagnostic-messages#${lintNameLowerCase}`];
      if (lintName === lintNameLowerCase) {
        urls = [`https://dart-lang.github.io/linter/lints/${lintNameLowerCase}.html`, ...urls];
      }
      this.urls = urls as [string] | [string, string];
      this.file = file;
      this.line = parseInt(lineNumber);
      this.column = parseInt(columnNumber);
      this.message = lintMessage;
  }

  public get isFail():boolean {
    const failOn = getFailOn();
    if (failOn !== FailOn.Nothing){
      if (this.type === DartAnalyzeLogType.Error) {
        return true;
      }
      if (failOn !== FailOn.Error) {
        if (this.type === DartAnalyzeLogType.Warning) {
          return true;
        }
        if (failOn !== FailOn.Warning) {
          // It is FailOn.Info
          return true;
        }
      }
    }
    return false;
  }

  public get emoji(): string {
    switch(this.type) {
      case DartAnalyzeLogType.Error:
        return ':bangbang:';
      case DartAnalyzeLogType.Warning:
        return ':warning:'
      case DartAnalyzeLogType.Info:
        return ':eyes:'
    }
  }
}
