
# Annotation Failure Action

![image](https://github.com/root-project/annotation-failure-action/assets/82065181/60807959-311b-48ef-9122-9654e2fc7836)


Causes the build to fail if certain annotations are created. This is useful in 
conjuntion with
[problem matchers](https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md)
to fail the workflow on compiler warnings without enabling `-Werror`.

## Inputs

### GH\_TOKEN

**required** This workflow requires an access token with yet to be determined permissions to
read annotations (but likely `checks` and `actions`).

### workflow\_id

**required** The id of the workflow to check annotations for. For jobs checking their own
annotations, `${{ github.run_id }}` works. For jobs triggered by `workflow_run`,
`${{ github.event.workflow_run.id }}` finds the `run_id` of the run that
triggered this run.

### filter

**optional** A regex filter that causes job failures when it's (partially) matching
an annotation whose severity is 'warning' or higher. It matches against the
annotation's title and message concatinated.
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

Check for annotations from a different workflow using `on: workflow_run`.
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
