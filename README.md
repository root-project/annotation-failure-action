
# Annotation Failure Action

Causes the build to fail if certain annotations are created. This is useful in 
conjuntion with
[problem matchers](https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md)
to fail the workflow on compiler warnings without enabling `-Werror`.

## Inputs

### GH\_TOKEN

This workflow requires an access token with yet to be determined permissions to
read annotations (but likely `checks` and `actions`).

### filter

**optional** A regex filter that causes job failures when (partially) matching
an annotation whose severity is 'warning' or higher. More specifically, it
matches against the annotation's title and message concatinated.
Without a filter, any annotation of severity warning or higher causes a build
failure.

## Example usage

Check for annotations within the same workflow
```
  matrix-build-step:
    [...]

  assert-annotations:
    name: Check for compiler warnings
    needs: [build-step]
    runs-on: ubuntu-latest

    permissions:
      checks: write
      pull-requests: write
      actions: read

    steps:
      - name: Check for compiler warnings
        env:
          filter: ''
          workflow_id: ${{ github.run_id }}
          GH_TOKEN: ${{ github.token }}
        uses: root-project/annotation-failure-action@main
```

Check for annotations in a different workflow. Useful in conjunction with a 
workflow that posts comments on pull requests.
```
name: Read annotations

on:
  workflow_run:
    workflows: [annotation-creating-workflow]
    types:
      - completed

jobs:
  read_annotations:
    name: Check for compiler warnings

    runs-on: ubuntu-latest

    permissions:
      checks: write
      pull-requests: write
      actions: read

    steps:
      - name: Check for annotations in the run that triggered this
        env:
          workflow_id: ${{ github.event.workflow_run.id }}
          GH_TOKEN: ${{ github.token }}
        uses: root-project/annotation-failure-action@main
```