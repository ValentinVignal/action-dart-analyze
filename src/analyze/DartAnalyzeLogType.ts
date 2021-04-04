import { FailOn, failOn } from "../utils/FailOn";

export enum DartAnalyzeLogTypeEnum{
  Info = 1,
  Warning = 2,
  Error = 3,
}

export type DartAnalyzeLogTypeKey = 'info'|'warning'|'error';

export type LogKey = 'warning'|'error';

export class DartAnalyzeLogType {
  public static typeFromKey(key: DartAnalyzeLogTypeKey): DartAnalyzeLogTypeEnum {
    switch(key) {
      case 'error':
        return DartAnalyzeLogTypeEnum.Error;
      case 'warning':
        return DartAnalyzeLogTypeEnum.Warning;
      default:
        return DartAnalyzeLogTypeEnum.Info;
    }
  }

  public static keyFromType(logType: DartAnalyzeLogTypeEnum): LogKey {
    switch (logType) {
      case DartAnalyzeLogTypeEnum.Error:
        return 'error';
      default:
        return 'warning';
    }
  }

  public static isFail(logType: DartAnalyzeLogTypeEnum): boolean {
    switch (failOn) {
      case FailOn.Nothing:
        return false;
      case FailOn.Format:
        return false;
      case FailOn.Info:
        return true;
      case FailOn.Warning:
        return logType === DartAnalyzeLogTypeEnum.Error || logType === DartAnalyzeLogTypeEnum.Warning;
      case FailOn.Error:
      default:
        return logType === DartAnalyzeLogTypeEnum.Error;
    }
  }
}



