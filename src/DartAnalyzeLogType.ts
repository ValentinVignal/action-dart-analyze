import { FailOn, getFailOn } from "./FailOn";

export enum DartAnalyzeLogType{
  Info = 1,
  Warning = 2,
  Error = 3,
}

export type DartAnalyzeLogTypeKey = 'info'|'warning'|'error';

export type LogKey = 'warning'|'error';

export function getDartAnalyzeLogType(key: DartAnalyzeLogTypeKey): DartAnalyzeLogType {
  switch(key) {
    case 'error':
      return DartAnalyzeLogType.Error;
    case 'warning':
      return DartAnalyzeLogType.Warning;
    default:
      return DartAnalyzeLogType.Info;
  }
}


export function getLogKey(logType: DartAnalyzeLogType): LogKey {
  const failOn = getFailOn();
  if (failOn.valueOf() <= logType.valueOf()) {
    return 'error';
  }
  return 'warning';
}