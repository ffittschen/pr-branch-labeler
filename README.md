# PR Branch Labeler

A GitHub Action that offers an easy way to automatically add labels to opened PRs depending on their `head` and/or `base` branch.
The branches can be specified directly or using patterns, such as `feature/*` or `bugfix/*`.

## Usage

To use the PR Branch Labeler, you can add a YAML-based workflow file, e.g.`.github/workflows/pr-branch-labeler.yml`, with the following content:

```yaml
name: PR Branch Labeler

on: pull_request

jobs:
  label_prs:
    runs-on: ubuntu-latest
    steps:
    - name: Label PRs
      if: github.event.action == 'opened' # Only run the action when the PR was first opened
      uses: ffittschen/pr-branch-labeler@v1
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

Configure the PR Branch Labeler action by creating a `.github/pr-branch-labeler.yml` file, e.g. with the following:

```yaml
# Apply label "feature" if head matches "feature/*"
feature:
  head: "feature/*"

# Apply label "bugfix" if head matches one of "bugfix/*" or "hotfix/*"
bugfix:
  head: ["bugfix/*", "hotfix/*"]
```

If only a `head` is specified, you can also use the shorthand notation. The following configuration is equivalent to the one above:

```yaml
feature: "feature/*"
bugfix: ["bugfix/*", "hotfix/*"]
```

In case you want to assign labels if the PR has a specific `base` branch, you can specify it in the configuration as follows:

```yaml
# Apply label "release" if base matches "release/*"
release:
  base: "release/*"
```

If you specify both, `head` and `base`, it will be seen as an AND condition:

```yaml
# Apply label "🧩 Subtask" if head and base match "feature/*"
🧩 Subtask:
  head: "feature/*"
  base: "feature/*"
```

Note: If there are multiple rules matching one branch, all of the labels will be added to the PR. One example of this would be a configuration that contains the feature and subtask rules. If a new PR with `head` and `base` matching `feature/*` will be opened, the PR gets the labels `feature` AND `🧩 Subtask`.

You can also specify regular expressions:

```yaml
# Apply label "🧩 Subtask" if head and base match "feature/*"
🧩 Subtask:
  headRegExp: 'feature[/].*'
  baseRegExp: 'feature[/].*'
```

When using regular expressions you may also use group match numbers as labels:

```yaml
# Apply whatever comes after "release/" as the label when matching against base of "release/*"
$1:
  baseRegExp: 'release[/](.*)'
```

In this example if you were merging into the `release/1.0.0` branch, the label `1.0.0` would be applied.
