import * as core from "@actions/core";
import {Context} from '@actions/github/lib/context';
import {GitHub} from "@actions/github/lib/utils";
import yaml from "js-yaml";
import { ConfigEntry } from "./ConfigEntry";

const defaultConfigPath = ".github/pr-branch-labeler.yml";

const defaults: ConfigEntry[] = [
  { label: "feature", head: "feature/*", base: undefined },
  { label: "bugfix", head: ["bugfix/*", "hotfix/*"], base: undefined },
  { label: "chore", head: "chore/*", base: undefined }
];

export async function getConfig(
  github: InstanceType<typeof GitHub>,
  context: Context,
  configPath: string
): Promise<ConfigEntry[]> {
  try {
    const path = configPath || defaultConfigPath;
    const configFile = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      path,
      ref: context.payload.pull_request!.head.ref,
    };
    core.debug(`Getting contents of ${JSON.stringify(configFile)}`);
    const response = await github.repos.getContent(configFile);
    return parseConfig(response.data.content);
  } catch (error) {
    core.debug(`getConfig error: ${JSON.stringify(error)}`);
    if (error.status === 404) {
      return defaults;
    }

    throw error;
  }
}

function parseConfig(content: string): ConfigEntry[] {
  const configObject = yaml.safeLoad(Buffer.from(content, "base64").toString()) || {};
  if (configObject === {}) {
    return [];
  }

  return Object.entries(configObject).reduce((entries: ConfigEntry[], [label, object]: [string, any]) => {
    const headPattern = object.head || (typeof object === "string" || Array.isArray(object) ? object : undefined);
    const basePattern = object.base;
    if (headPattern || basePattern) {
      entries.push({ label: label, head: headPattern, base: basePattern });
    } else {
      throw new Error("config.yml has invalid structure.");
    }

    return entries;
  }, []);
}
