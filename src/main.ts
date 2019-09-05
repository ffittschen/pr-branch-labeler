import * as core from "@actions/core";
import * as github from "@actions/github";
import { getConfig } from "./config";
import matcher from "matcher";

const CONFIG_FILENAME = "pr-labeler.yml";
const defaults = {
  feature: "feature/*",
  fix: ["bugfix/*", "hotfix/*"],
  chore: "chore/*"
};

const githubToken = core.getInput("someToken");
const octokit = new github.GitHub(githubToken);

async function run() {
  try {
    const context = github.context;
    if (
      context &&
      context.payload &&
      context.payload.repository &&
      context.payload.pull_request
    ) {
      const repoInfo = {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name
      };
      const ref = context.payload.pull_request.head.ref;
      const config = {
        ...defaults,
        ...(await getConfig(octokit, CONFIG_FILENAME, repoInfo))
      };
      const labelsToAdd = Object.entries(config).reduce(
        (labels: string[], [label, patterns]) => {
          if (
            Array.isArray(patterns)
              ? patterns.some(pattern => matcher.isMatch(ref, pattern))
              : matcher.isMatch(ref, patterns)
          ) {
            labels.push(label);
          }

          return labels;
        },
        []
      );

      if (labelsToAdd.length > 0) {
        await octokit.issues.addLabels({
          number: context.payload.pull_request.number,
          labels: labelsToAdd,
          ...repoInfo
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
