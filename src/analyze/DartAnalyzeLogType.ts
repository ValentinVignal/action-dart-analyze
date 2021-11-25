import { actionOptions } from "../utils/ActionOptions";
import { FailOnEnum } from "../utils/FailOn";

export enum DartAnalyzeLogTypeEnum {
  Info = 1,
  Warning = 2,
  Error = 3,
}

export type DartAnalyzeLogTypeKey = 'INFO' | 'WARNING' | 'ERROR';

export type LogKey = 'INFO' | 'WARNING' | 'ERROR';

export class DartAnalyzeLogType {
  public static typeFromKey(key: DartAnalyzeLogTypeKey): DartAnalyzeLogTypeEnum {
    switch (key) {
      case 'ERROR':
        return DartAnalyzeLogTypeEnum.Error;
      case 'WARNING':
        return DartAnalyzeLogTypeEnum.Warning;
      default:
        return DartAnalyzeLogTypeEnum.Info;
    }
  }

  public static keyFromType(logType: DartAnalyzeLogTypeEnum): LogKey {
    switch (logType) {
      case DartAnalyzeLogTypeEnum.Error:
        return 'ERROR';
      case DartAnalyzeLogTypeEnum.Warning:
        return 'WARNING';
      default:
        return 'INFO';
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



