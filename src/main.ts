import * as core from "@actions/core";
import * as github from "@actions/github";
import { getConfig } from "./config";
import { ConfigEntry } from "./ConfigEntry";
import matcher from "matcher";

const CONFIG_FILENAME = "pr-branch-labeler.yml";
const defaults: ConfigEntry[] = [
  { label: "feature", head: "feature/*", base: undefined },
  { label: "bugfix", head: ["bugfix/*", "hotfix/*"], base: undefined },
  { label: "chore", head: "chore/*", base: undefined }
];

// Export the context to be able to mock the payload during tests.
export const context = github.context;

export async function run() {
  try {
    const repoToken: string = core.getInput("repo-token", { required: true });

    if (context && context.payload && context.payload.repository && context.payload.pull_request) {
      const octokit = new github.GitHub(repoToken);
      const repoConfig: ConfigEntry[] = await getConfig(octokit, CONFIG_FILENAME, context.repo);
      const config: ConfigEntry[] = repoConfig.length > 0 ? repoConfig : defaults;
      const headRef = context.payload.pull_request.head.ref;
      const baseRef = context.payload.pull_request.base.ref;
      const labelsToAdd = config.reduce((labels: string[], entry) => {
        if (entry.head && entry.base) {
          if (isMatch(headRef, entry.head) && isMatch(baseRef, entry.base)) {
            labels.push(entry.label);
          }
        } else if (entry.head && isMatch(headRef, entry.head)) {
          labels.push(entry.label);
        } else if (entry.base && isMatch(baseRef, entry.base)) {
          labels.push(entry.label);
        }

        return labels;
      }, []);

      if (labelsToAdd.length > 0) {
        core.debug(`Adding labels: ${labelsToAdd}`);
        await octokit.issues.addLabels({
          issue_number: context.payload.pull_request.number,
          labels: labelsToAdd,
          ...context.repo
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}

function isMatch(ref: string, patterns: string | string[]): boolean {
  return Array.isArray(patterns)
    ? patterns.some(pattern => matcher.isMatch(ref, pattern))
    : matcher.isMatch(ref, patterns);
}

run();
