const mockPath = {
  join: jest.fn(),
};

jest.mock('path', () => mockPath);

const mockActionOptions = {
  actionOptions: {} as ActionOptions,
};

jest.mock('../utils/ActionOptions', () => {
  return mockActionOptions;
});

import * as exec from '@actions/exec';
import { ActionOptions } from '../utils/ActionOptions';
import { FailOnEnum } from '../utils/FailOn';
import { IgnoredFiles } from '../utils/IgnoredFiles';
import { ModifiedFiles } from '../utils/ModifiedFiles';
import { format } from './Format';

describe('Format', () => {

  beforeEach(() => {
    mockActionOptions.actionOptions = {} as ActionOptions;
  });

  afterEach(() => {
    mockActionOptions.actionOptions = {} as ActionOptions;
  });
  it('should concatenate the cwd to files from the format command to compare them with the modified files', async () => {
    mockActionOptions.actionOptions = {
      format: true,
      workingDirectory: 'actionOptionWorkingDirectory',
      failOn: FailOnEnum.Format,
    } as ActionOptions;
    const ignoredFiles: Partial<IgnoredFiles> = {
      has: jest.fn(),
    };
    const modifiedFiles: Partial<ModifiedFiles> = {
      has: jest.fn(),
    };
    jest.spyOn(console, 'log').mockImplementation();


    jest.spyOn(exec, 'exec').mockImplementationOnce(
      (commandLine: string, args: string[] | undefined, options: exec.ExecOptions | undefined): Promise<number> => {
        options!.listeners!.stdout!(Buffer.from('Changed lib/file_0.dart\nChanged lib/file_1.dart\r\nChanged lib/file_2.dart'));
        return Promise.resolve(0);
      },
    );

    (ignoredFiles.has as jest.Mock).mockReturnValue(false);
    (modifiedFiles.has as jest.Mock).mockImplementation((file: string) => {
      return ['cwd/actionOptionWorkingDirectory/lib/file_0.dart', 'cwd/actionOptionWorkingDirectory/lib/file_1.dart'].includes(file);
    });

    jest.spyOn(process, 'cwd').mockReturnValue('cwd');
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));

    const result = await format({
      modifiedFiles: modifiedFiles as ModifiedFiles,
      ignoredFiles: ignoredFiles as IgnoredFiles,
    });

    expect(result.success).toEqual(false); // It should fail because some modified files are not formatted.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).files).toEqual(new Set([
      'lib/file_0.dart',
      'lib/file_1.dart',
    ])); // It should return the unformatted files.
    expect(modifiedFiles.has).toHaveBeenCalledTimes(3);
    // It should use the absolute unformatted file paths to compare them with
    // the modified files. 
    expect(modifiedFiles.has).toHaveBeenCalledWith('cwd/actionOptionWorkingDirectory/lib/file_0.dart');
    expect(modifiedFiles.has).toHaveBeenCalledWith('cwd/actionOptionWorkingDirectory/lib/file_1.dart');
    expect(modifiedFiles.has).toHaveBeenCalledWith('cwd/actionOptionWorkingDirectory/lib/file_2.dart');

    // It should use the relative unformatted file paths to compare them with
    // the ignored files. 
    expect(ignoredFiles.has).toHaveBeenCalledWith('lib/file_0.dart');
    expect(ignoredFiles.has).toHaveBeenCalledWith('lib/file_1.dart');
    expect(ignoredFiles.has).toHaveBeenCalledWith('lib/file_2.dart');

  });
});
