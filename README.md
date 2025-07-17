[![codecov](https://codecov.io/gh/ValentinVignal/action-dart-analyze/branch/main/graph/badge.svg?token=XESGUDU3E6)](https://codecov.io/gh/ValentinVignal/action-dart-analyze)
[![wakatime](https://wakatime.com/badge/github/ValentinVignal/action-dart-analyze.svg)](https://wakatime.com/badge/github/ValentinVignal/action-dart-analyze)

# action-dart-analyze

This action analyzes the modified lines dart code of the PR by running `dart analyze` and `dart format`.

## How to use it

Create a `.yml` file in `./github/workflows/` in your project.

## Inputs

- `fail-on`: Specifies when the action should fail.
  - Options:
    - `'error'`: Fails only on analyze error.
    - `'warning'`: Fails on warnings and errors.
    - `'info'`: Fails on info, warnings and errors from `dart analyze`.
    - `'format'`: Fails on everything, including bad formatting.
    - `'nothing'`: Fails on nothing.
  - Optional.
  - Default: `'warning'`.
- `working-directory`: The working directory.
  - Optional.
  - Default: `'./'`.
- `token`: Github token
  - Optional.
  - Default: Secret token provided by Github
- `check-renamed-files`: If set to `'true'`, it will checks an entire renamed file even if there is no change in it.
  - Options: `'false'`, `'true'`.
  - Optional.
  - Default: `'false'`.
- `emojis`: `'false'` will remove the emojis from the comment.
  - Options: `'true'`, `'false'`.
  - Optional.
  - Default: `'true'`.
- `format`: `'false'` will remove the check on the format.
  - Options: `'true'`, `'false'`.
  - Optional.
  - Default: `'true'`.
- `line-length`: The line length for dart format command.
  - Optional.
  - Default: The default value used in `dart format`

## Outputs

No output.

## Result

It will fail the checks on your Pull Requests if any issue is found:

![failed-workflow](https://github.com/ValentinVignal/action-dart-analyze/blob/main/doc/images/failed-workflow.png)

It will leave a comment explaining why it failed and what issues it found:

![comment](https://github.com/ValentinVignal/action-dart-analyze/blob/main/doc/images/comment.png)

In the code change, it will display errors and warnings where the issues are found:

![changes-warnings-errors](https://github.com/ValentinVignal/action-dart-analyze/blob/main/doc/images/changes-warnings-errors.png)

## Example usage

```yml
on: [pull_request]

jobs:
  linter:
    runs-on: ubuntu-latest
    name: Lint flutter code
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Set up Flutter
        uses: subosito/flutter-action@v2
      - run: flutter pub get
      - name: Analyze Flutter
        uses: ValentinVignal/action-dart-analyze@v0.17
        with:
          fail-on: 'warning'
```

## Using the `GITHUB_TOKEN` in a workflow

In order to write comments, your `GITHUB_TOKEN` might need the `pull_request: write` permission.

## Run it yourself

Alternatively, you can download and run the script `scripts/run.sh`.
In order to run it, you will need to set-up node first

```shell
Options:
-t, --token <token>              Required authentication token.

    --fail-on <value>            Set failure level (nothing, format, info, warning, error). Default: error.
    --working-directory <path>   Set the working directory. Default: ./
    --[no-]check-renamed-files   Enable or disable checking renamed files. Default: false.
    --[no-]emojis                Enable or disable emojis. Default: true.
    --[no-]format                Enable or disable formatting. Default: true.
    --line-length <number>       Set max line length. Default: null.
-h, --help                       Show this help message.
```

```yml
on: [pull_request]

jobs:
  linter:
    runs-on: ubuntu-latest
    name: Lint flutter code
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Set up Flutter
        uses: subosito/flutter-action@v2
      - run: flutter pub get
      - uses: actions/setup-node@v4 # You need to install node before running the script.
      - run: |
          curl https://raw.githubusercontent.com/ValentinVignal/action-dart-analyze/refs/heads/main/scripts/run.sh -o script.sh
          bash script.sh -t ${{ github.token }} --fail-on warning
```
