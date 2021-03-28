import * as github from '@actions/github';
import * as core from '@actions/core';

export class Comment {
  private static _githubToken: string;
  private static get githubToken(): string {
    if(!Comment._githubToken) {
      try {
        Comment._githubToken = process.env.GITHUB_TOKEN!;
      } catch (error) {
        core.setFailed(`Could not find env variable GITHUB_TOKEN, have you set it up?`);
      }
    }
    return Comment._githubToken;
  }

  public static createComment(comment: string): void {
    const context = github.context;
    const octokit = github.getOctokit(Comment.githubToken);
    const pullRequestNumber = context.payload.pull_request!.number;

    const newComment = octokit.issues.createComment({
      ...context.repo,
      issue_number: pullRequestNumber,
      body: comment,
      
    });
  }


}
