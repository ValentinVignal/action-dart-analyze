import * as github from '@actions/github';
import * as core from '@actions/core';
import { context } from '@actions/github/lib/utils';

export type CommentReact = '+1'|'-1'|'laugh'|'confused'|'heart'|'hooray'|'rocket'|'eyes';

export async function comment(params: {message: string, reacts?: CommentReact[]}): Promise<void> {

  if (!github.context.payload.pull_request) {
    // Can only comment on Pull Requests
    return;
  }
  const octokit = github.getOctokit(core.getInput('token', {required: true}));

  // Create the comment
  try {
    const comment = await octokit.issues.createComment({
      ...github.context.repo,
      issue_number: context.payload.pull_request!.number,
      body: params.message,
    });
    if (params.reacts) {
      for (const react of params.reacts) {
        try {
          await octokit.reactions.createForCommitComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: comment.data.id,
            content: react,
          });
        } catch (error) {
          console.log(`Couldn't react :${react}: on ${comment.data.id}:\n${error}`);
        }
      }
    }
  } catch (error) {
    console.log(`Couldn't comment "${params.message} with reacts ${params.reacts}`);
  } 
}

