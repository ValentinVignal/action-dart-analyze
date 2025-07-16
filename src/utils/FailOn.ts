import { FailOnEnum } from 'dart-analyze';

export class FailOn {
  static fromInput(input?: string): FailOnEnum {
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
        return FailOnEnum.Warning;
    }
  }
}

