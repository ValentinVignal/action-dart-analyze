import { actionOptions } from "../utils/ActionOptions";
import { FailOnEnum } from "../utils/FailOn";
import { DartAnalyzeLogType, DartAnalyzeLogTypeEnum, DartAnalyzeLogTypeKey,} from "./DartAnalyzeLogType";

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
  readonly urls: [string] | [string, string];
  readonly type: DartAnalyzeLogTypeEnum
  readonly originalLine: string;

  constructor(params: {line: string, delimiter?: string}) {
      this.originalLine = params.line;
      const lineData = params.line.split(params?.delimiter?? '-');
      this.type = DartAnalyzeLogType.typeFromKey(lineData[0].trim() as DartAnalyzeLogTypeKey);
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
    if (actionOptions.failOn !== FailOnEnum.Nothing){
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
    switch(this.type) {
      case DartAnalyzeLogTypeEnum.Error:
        return ':bangbang:';
      case DartAnalyzeLogTypeEnum.Warning:
        return ':warning:'
      case DartAnalyzeLogTypeEnum.Info:
        return ':eyes:'
    }
  }
}
