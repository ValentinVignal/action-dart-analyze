import * as github from '@actions/github';
import { context } from '@actions/github/lib/utils';
import { getInput } from './getInput';

export type CommentReact = '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray' | 'rocket' | 'eyes';

export async function comment(params: { message: string, reacts?: CommentReact[] }): Promise<void> {

  if (!github.context.payload.pull_request) {
    // Can only comment on Pull Requests
    return;
  }
  const octokit = github.getOctokit(getInput('token', { required: true }));

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
          const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') as [string, string];
          await octokit.reactions.createForCommitComment({
            owner: owner,
            repo: repo,
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

