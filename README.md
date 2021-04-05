# action-dart-analyze

This action analyzes dart code by running `dart analyze` and `dart format`.

## How to use it

Create a `.yml` file in `./github/workflows/` in your project.

## Inputs

- `fail-on`: Specifies when the action should fail.
  - Options:
    - `'error'`: Fails only on analyze error.
    - `'warning'`: Fails on warnings and errors.
    - `'info`: Fails on info, warnings and errors from `dart analyze`.
    - `'format'`: Fails on everything, including bad formatting.
    - `'nothing'`: Fails on nothing.
  - Optional.
  - Default: `'error'`.
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

## Outputs

No output.

## Example usage

```yml
on: [pull_request]

jobs:
  linter:
    runs-on: ubuntu-latest
    name: Lint flutter code
    steps:
    - name: Checkout code
      uses: actions/checkout@v2
    - name: Set up Flutter
      uses: subosito/flutter-action@v1
    - run: flutter pub get
    - name: Analyze Flutter
      uses: ValentinVignal/action-dart-analyze@v1.0
      with:
        fail-on: 'warning'
```
