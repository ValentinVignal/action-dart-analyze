export enum FailOnEnum {
  Error = 0,
  Warning = 1,
  Info = 2,
  Format = 3,
  Nothing = 4,
}

export class FailOn {
  static fromInput(input: string) {
    switch (input) {
      case 'nothing':
        return FailOnEnum.Nothing;
      case 'format':
        return FailOnEnum.Format;
      case 'info':
        return FailOnEnum.Info;
      case 'warning':
        return FailOnEnum.Warning;
      default:
        return FailOnEnum.Error;
    }
  }
}

