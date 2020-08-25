import * as core from "@actions/core";
import * as github from "@actions/github";
import { getConfig } from "./config";
import { ConfigEntry } from "./ConfigEntry";

const CONFIG_FILENAME = "pr-branch-labeler.yml";
const defaults: ConfigEntry[] = [
  new ConfigEntry({ label: "feature", head: "feature/*" }),
  new ConfigEntry({ label: "bugfix", head: ["bugfix/*", "hotfix/*"] }),
  new ConfigEntry({ label: "chore", head: "chore/*" })
];

// Export the context to be able to mock the payload during tests.
export const context = github.context;

export async function run() {
  const repoToken: string = core.getInput("repo-token", { required: true });

  core.debug(`context: ${context ? JSON.stringify(context) : ''}`);

  if (context && context.payload && context.payload.repository && context.payload.pull_request) {
    const octokit = new github.GitHub(repoToken);
    const repoConfig: ConfigEntry[] = await getConfig(octokit, CONFIG_FILENAME, context);
    core.debug(`repoConfig: ${JSON.stringify(repoConfig)}`);
    const config: ConfigEntry[] = repoConfig.length > 0 ? repoConfig : defaults;
    core.debug(`config: ${JSON.stringify(config)}`);
    const headRef = context.payload.pull_request.head.ref;
    const baseRef = context.payload.pull_request.base.ref;

    const labelsToAdd = config.map(entry => entry.getLabel(headRef, baseRef))
      .filter(label => label !== undefined)
      .map(label => label!);

    core.debug(`Adding labels: ${labelsToAdd}`);

    if (labelsToAdd.length > 0) {
      await octokit.issues.addLabels({
        issue_number: context.payload.pull_request.number,
        labels: labelsToAdd,
        ...context.repo
      });
    }
  }

}

try {
  run();
} catch (error) {
  core.error(`ERROR! ${JSON.stringify(error)}`);
  core.setFailed(error.message);
  throw error;
}
