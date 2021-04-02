import * as github from '@actions/github';
import * as core from '@actions/core';
import { EventName } from './Actions/Github/EventName';
import { context } from '@actions/github/lib/utils';

export async function getModifiedFiles(): Promise<string[]> {
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

  return files.map((file) => file.filename);

}