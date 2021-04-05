import { actionOptions } from "../utils/ActionOptions";
import { FailOnEnum } from "../utils/FailOn";

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
    switch (actionOptions.failOn) {
      case FailOnEnum.Nothing:
        return false;
      case FailOnEnum.Format:
        return false;
      case FailOnEnum.Info:
        return true;
      case FailOnEnum.Warning:
        return logType === DartAnalyzeLogTypeEnum.Error || logType === DartAnalyzeLogTypeEnum.Warning;
      case FailOnEnum.Error:
      default:
        return logType === DartAnalyzeLogTypeEnum.Error;
    }
  }
}



