import * as github from '@actions/github';
import * as core from '@actions/core';
import { EventName } from './Actions/Github/EventName';
import { context } from '@actions/github/lib/utils';

interface FileLines {
  start: number;
  end: number
}

export interface ModifiedFile {
  name: string;
  deletion?: FileLines[];
  addition?: FileLines[];
}

export async function getModifiedFiles(): Promise<ModifiedFile[]> {
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

  const files = response.data.files;

  return files.map((file) => {
    return parseFile(file);
  });
}

function parseFile(file: {filename: string, patch?: string|undefined}): ModifiedFile {
  const modifiedFile: ModifiedFile = {
    name: file.filename
  };
  if (file.patch) {
    // The changes are included in the file
    const patches = file.patch.split('@@').filter((_, index) => index % 2); // Only take the line information
    for (const patch of patches) {
      // path is usually like " -6,7 +6,8"
      try {
        const hasAddition = patch.includes('+');
        const hasDeletion = patch.includes('-');
        if (hasAddition) {
          const lines = patch.match(/\+.*/)![0].trim().slice(1).split(',').map((num) => parseInt(num)) as [number, number];
          modifiedFile.addition ??= [];
          modifiedFile.addition?.push({
            start: lines[0],
            end: lines[0] + lines[1],
          });
        }
        if (hasDeletion) {

          const lines = patch.split('+')[0].trim().slice(1).split(',').map((num) => parseInt(num)) as [number, number];
          modifiedFile.deletion ??= [];
          modifiedFile.deletion?.push({
            start: lines[0],
            end: lines[0] + lines[1],
          });
        }

      } catch (error) {
        console.log(`Error getting the patch of the file:\n${error}`);
      }
    }
  } else {
    // Take the all file
    modifiedFile.addition = [{
        start: 0,
        end: Infinity,
    }];
    modifiedFile.deletion = [{
        start: 0,
        end: Infinity,
    }];
  }
  return modifiedFile;

}
