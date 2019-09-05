import path from "path";
import yaml from "js-yaml";
import * as github from "@actions/github";

const CONFIG_PATH = ".github";

export async function getConfig(
  github: github.GitHub,
  fileName: string,
  { owner, repo }
): Promise<{ [s: string]: string | string[] }> {
  try {
    const response = await github.repos.getContents({
      owner,
      repo,
      path: path.posix.join(CONFIG_PATH, fileName)
    });

    return parseConfig(response.data.content);
  } catch (error) {
    if (error.code === 404) {
      return {};
    }

    throw error;
  }
}

function parseConfig(content: string) {
  return yaml.safeLoad(Buffer.from(content, "base64").toString()) || {};
}
