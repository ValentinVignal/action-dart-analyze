import { DartAnalyzeLogType, DartAnalyzeLogTypeKey, getDartAnalyzeLogType } from "../DartAnalyzeLogType";

export interface ParsedLineInterface {
  file: string;
  line: number;
  column: number;
  message: string;
  url: string;
  type: DartAnalyzeLogType
}

export class ParsedLine {
  file: string;
  line: number;
  column: number;
  message: string;
  url: string;
  type: DartAnalyzeLogType


  constructor(params: {line: string, delimiter?: string}) {
      const lineData = params.line.split(params?.delimiter?? '-');
      this.type = getDartAnalyzeLogType(lineData[0].trim() as DartAnalyzeLogTypeKey);
      const lints = lineData[1].trim().split(' at ');
      const location = lints.pop()?.trim()!;
      const lintMessage = lints.join(' at ').trim();
      const [file, lineNumber, columnNumber] = location.split(':');
      const lintName = lineData[2].replace(/[\W]+/g, '');
      const lintNameLowerCase = lintName.toLowerCase();
      this.url = lintName === lintNameLowerCase
        ? `https://dart-lang.github.io/linter/lints/${lintNameLowerCase}.html`
        : `https://dart.dev/tools/diagnostic-messages#${lintNameLowerCase}`
      this.file = file;
      this.line = parseInt(lineNumber);
      this.column = parseInt(columnNumber);
      this.message = lintMessage;
  }
}
