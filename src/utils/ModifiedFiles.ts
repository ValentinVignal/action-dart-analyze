import * as github from '@actions/github';
import * as core from '@actions/core';
import { EventName } from '../actions/github/EventName';
import { context } from '@actions/github/lib/utils';

interface FileLinesInterface {
  start: number;
  end: number
}

class FileLines {
  readonly start: number;
  readonly end: number;

  constructor(params: FileLinesInterface) {
    this.start = params.start;
    this.end = params.end;
  }

  public includes(line: number): boolean {
    return this.start <= line && line <= this.end;
  }
}

export interface ModifiedFileInterface {
  name: string;
  deletions: FileLinesInterface[];
  additions: FileLinesInterface[];
}

/**
 * A modified file
 */
class ModifiedFile {
  readonly name: string;
  readonly deletions: FileLines[];
  readonly additions: FileLines[];

  constructor(file: {filename: string, patch?: string|undefined}) {
    this.name = file.filename;
    this.additions = [];
    this.deletions = [];

    this.parsePatch(file.patch);
  }

  private parsePatch(patch?: string|undefined): void {
    if (patch) {
      // The changes are included in the file
      const patches = patch.split('@@').filter((_, index) => index % 2); // Only take the line information
      for (const patch of patches) {
        // patch is usually like " -6,7 +6,8"
        try {
          const hasAddition = patch.includes('+');
          const hasDeletion = patch.includes('-');
          if (hasAddition) {
            const lines = patch.match(/\+.*/)![0].trim().slice(1).split(',').map((num) => parseInt(num)) as [number, number];
            this.additions.push(new FileLines({
              start: lines[0],
              end: lines[0] + lines[1],
            }));
          }
          if (hasDeletion) {
            const lines = patch.split('+')[0].trim().slice(1).split(',').map((num) => parseInt(num)) as [number, number];
            this.deletions.push(new FileLines({
              start: lines[0],
              end: lines[0] + lines[1],
            }));
          }

        } catch (error) {
          console.log(`Error getting the patch of the file:\n${error}`);
        }
      }
    } else {
      // Take the all file
      this.additions.push(new FileLines({
          start: 0,
          end: Infinity,
      }));
      this.deletions.push(new FileLines({
          start: 0,
          end: Infinity,
      }));
    }
  }

  public get hasAdditions(): boolean {
    return !!this.additions.length;
  }

  public get hasDeletions(): boolean {
    return !!this.deletions.length;
  }

  public get hasChanges(): boolean {
    return this.hasAdditions || this.hasDeletions;
  }

  public hasAdditionLine(line: number): boolean {
    if (!this.hasAdditions) {
      return false;
    }
    return this.additions.some((fileLines) => fileLines.includes(line));
  }

  public hasDeletionLine(line: number): boolean {
    if (!this.hasDeletions) {
      return false;
    }
    return this.deletions.some((fileLines) => fileLines.includes(line));
  }

  public hasLine(line: number): boolean {
    return this.hasAdditionLine(line) || this.hasDeletionLine(line);
  }
}

/**
 * All modified files
 */
export class ModifiedFiles {
  readonly files: Map<ModifiedFile['name'], ModifiedFile>;
  readonly isInit: Promise<boolean>;
  private readonly _resolveInit: (value: boolean) => void;

  constructor() {
    this.files = new Map<ModifiedFile['name'], ModifiedFile>();
    let resolveInit: ((value: boolean) => void)[] = [];
    this.isInit = new Promise<boolean>((resolve) => {
      resolveInit.push(resolve);
    });
    this._resolveInit = resolveInit[0];
    this.init();

  }

  private async init(): Promise<void> {
    const files = await this.getGithubFiles();
    for (const file of files) {
      this.files.set(file.filename, new ModifiedFile(file));
    }
    this._resolveInit(true);
  }



  private async getGithubFiles() {
    const eventName = github.context.eventName as EventName;
    let base = '';
    let head = '';

    switch (eventName) {
      case 'pull_request':
        base = github.context.payload.pull_request?.base?.sha;
        head = github.context.payload.pull_request?.head?.sha;
        break
      case 'push':
        base = github.context.payload.before;
        head = github.context.payload.after;
        break
      default:
        core.setFailed(
          `This action only supports pull requests and pushes, ${github.context.eventName} events are not supported. ` +
            "Please submit an issue on this action's GitHub repo if you believe this in correct."
        );
    }

    /// Github client from API token
    const client = github.getOctokit(core.getInput('token', {required: true}));
    
    const response = await client.repos.compareCommits({
      base,
      head,
      owner: context.repo.owner,
      repo: context.repo.repo,
    });

    // Ensure that the request was successful.
    if (response.status !== 200) {
      core.setFailed(
        `The GitHub API for comparing the base and head commits for this ${context.eventName} event returned ${response.status}, expected 200. ` +
          "Please submit an issue on this action's GitHub repo."
      )
    }

    // Ensure that the head commit is ahead of the base commit.
    if (response.data.status !== 'ahead') {
      core.setFailed(
        `The head commit for this ${context.eventName} event is not ahead of the base commit. ` +
          "Please submit an issue on this action's GitHub repo."
      )
    }
    return response.data.files;
  }

  public has(fileName: string): boolean {
    return this.files.has(fileName);
  }

  public get(fileName: string): ModifiedFile|undefined {
    return this.files.get(fileName);
  }
}