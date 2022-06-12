import { actionOptions } from '../utils/ActionOptions';
import { FailOnEnum } from '../utils/FailOn';

export enum DartAnalyzeLogTypeEnum {
  Info = 1,
  Warning = 2,
  Error = 3,
}

export type DartAnalyzeLogTypeKey = 'INFO' | 'WARNING' | 'ERROR';

export type LogKey = 'WARNING' | 'ERROR';

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

  /**
   * 
   * @param logType 
   * @returns The Github key for the log type.
   */
  public static keyFromType(logType: DartAnalyzeLogTypeEnum): LogKey {
    switch (logType) {
      case DartAnalyzeLogTypeEnum.Error:
        return 'ERROR';
      default:
        return 'WARNING';
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

  public static typeToString(logType: DartAnalyzeLogTypeEnum): string {
    switch (logType) {
      case DartAnalyzeLogTypeEnum.Info:
        return 'Info';
      case DartAnalyzeLogTypeEnum.Warning:
        return 'Warning';
      case DartAnalyzeLogTypeEnum.Error:
        return 'Error';
    }
  }
}



