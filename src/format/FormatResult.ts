import { actionOptions } from "../utils/ActionOptions";
import { FailOnEnum } from "../utils/FailOn";

export interface FormatResultInterface {
  files: Set<string>;
}

export class FormatResult {
  private readonly files: Set<string>;

  constructor(params: FormatResultInterface) {
    this.files = params.files;
  }

  public get success(): boolean {
    return actionOptions.failOn !== FailOnEnum.Format || !this.files.size;
  }

  public get count(): number {
    return this.files.size;
  }

  public get commentBody(): string {
    const comments: string[] = [];
    for (const file of this.files) {
      comments.push(`- [ ] ${actionOptions.emojis ? ":poop: " : ''} \`${file}\` is not formatted.`);
    }
    return comments.join('\n');
  }
}