import * as core from '@actions/core';

export enum FailOn{
  Info = 0,
  Warning = 1,
  Error = 2,
  Nothing = 3,
}

export const failOn = getFailOn();

function getFailOn(): FailOn{
  const input = core.getInput('fail-on');
  switch(input) {
    case 'nothing':
      return FailOn.Nothing;
    case 'info':
      return FailOn.Info;
    case 'warning':
      return FailOn.Warning;
    default:
      return FailOn.Error;
  }
  
}
