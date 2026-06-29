## 2.2

- Upgrade to node 24.

## 2.1

- Adds `comment-on-success` input to allow posting comments even when there are no failing issues found. Defaults to `true`.

## 2.0

- Adds parameter `severity-overrides`.
- Adds parameter `fail-on-format`.
- Removes `format` from the options of `fail-on`.
- Adds `note` to the options of `fail-on`.

## 1.1

- Makes the action update the existing comment instead of creating new ones.
- Fix a bug where the analyzer and formatter where not run.

## 1.0

- Adds `scripts/run.sh` to run this action with a bash script.
- **BREAKING**: `fail-on` now defaults to `'warning'`.

## 0.17

- :arrow_up: Upgrade to node 20.

## 0.16

- :sparkles: Supports nested analysis options.

## 0.15

- :arrow_up: Upgrade to node 16.

## 0.14

- :bug: Fix a bug where the unformatted files were not detected (again).

## 0.13

- :bug: Fix a bug where the unformatted files were not detected.
