import * as core from "@actions/core";
import * as github from "@actions/github";
import yaml from "js-yaml";
import path from "path";
import { ConfigEntry } from "./ConfigEntry";
const CONFIG_PATH = ".github";

export async function getConfig(github: github.GitHub, fileName: string, { owner, repo }): Promise<ConfigEntry[]> {
  try {
    const configFile = {
      owner,
      repo,
      path: path.posix.join(CONFIG_PATH, fileName)
    };
    core.debug(`Getting contents of ${JSON.stringify(configFile)}`);
    const response = await github.repos.getContents(configFile);
    if (Array.isArray(response.data)) {
      throw new Error(`${fileName} is not a file.`);
    }
    if (response.data.content === undefined) {
      throw new Error(`${fileName} is empty.`);
    }
    return parseConfig(response.data.content);
  } catch (error) {
    core.error(`ERROR! ${JSON.stringify(error)}`);
    if (error.status === 404) {
      return [];
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
