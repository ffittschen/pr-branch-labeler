import * as core from "@actions/core";
import * as github from "@actions/github";
import {GitHub} from "@actions/github/lib/utils";
import {Context} from "@actions/github/lib/context";
import matcher from "matcher";
import { getConfig } from "./config";
import { ConfigEntry } from "./ConfigEntry";

async function action(context: Context = github.context) {
  core.debug(`context: ${JSON.stringify(context)}`);
  if (!context?.payload?.pull_request) {
    throw new Error("Payload doesn't contain `pull_request`.");
  }
  return addLabelsIfAny(context);
}

async function addLabelsIfAny(context: Context) {
  const repoToken: string = core.getInput("repo-token", { required: true });
  const octokit = github.getOctokit(repoToken);
  const labelsToAdd = await getLabelsToAdd(octokit, context);
  if (!labelsToAdd.length) {
    return;
  }
  return addLabels(labelsToAdd, octokit, context);
}

async function getLabelsToAdd(octokit: InstanceType<typeof GitHub>, context: Context) {
  const configPath: string = core.getInput("config-path");
  const config: ConfigEntry[] = await getConfig(octokit, context, configPath);
  core.debug(`config: ${JSON.stringify(config)}`);
  const headRef = context.payload.pull_request!.head.ref;
  const baseRef = context.payload.pull_request!.base.ref;
  return config.reduce((labels: string[], entry) => {
    if (entry.head && entry.base) {
      if (isMatch(headRef, entry.head) && isMatch(baseRef, entry.base)) {
        core.info(`Matched "${headRef}" to "${entry.head}" and "${baseRef}" to "${entry.base}". Setting label to "${entry.label}"`);
        labels.push(entry.label);
      }
    } else if (entry.head && isMatch(headRef, entry.head)) {
      core.info(`Matched "${headRef}" to "${entry.head}". Setting label to "${entry.label}"`);
      labels.push(entry.label);
    } else if (entry.base && isMatch(baseRef, entry.base)) {
      core.info(`Matched "${baseRef}" to "${entry.base}". Setting label to "${entry.label}"`);
      labels.push(entry.label);
    }

    return labels;
  }, []);
}

function isMatch(ref: string, patterns: string | string[]): boolean {
  return Array.isArray(patterns)
    ? patterns.some(pattern => matcher.isMatch(ref, pattern))
    : matcher.isMatch(ref, patterns);
}

async function addLabels(labels: string[], octokit: InstanceType<typeof GitHub>, context: Context) {
  core.debug(`Adding labels: ${labels}`);
  return octokit.issues.addLabels({
    ...context.repo,
    issue_number: context.payload.pull_request!.number,
    labels
  });
}

export default action;
