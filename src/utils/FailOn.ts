import * as core from '@actions/core';

export enum FailOn{
  Error = 0,
  Warning = 1,
  Info = 2,
  Format = 3,
  Nothing = 4,
}

export const failOn = getFailOn();

function getFailOn(): FailOn{
  const input = core.getInput('fail-on');
  switch(input) {
    case 'nothing':
      return FailOn.Nothing;
    case 'format':
      return FailOn.Format;
    case 'info':
      return FailOn.Info;
    case 'warning':
      return FailOn.Warning;
    default:
      return FailOn.Error;
  }
  
}
