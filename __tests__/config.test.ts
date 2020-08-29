import * as github from "@actions/github";
import * as Context from '@actions/github/lib/context';
import "jest-extended";
import nock from "nock";
import path from "path";
import { getConfig } from '../src/config';
// @ts-ignore
import { configFixture } from './shared';


nock.disableNetConnect();

describe("Config file loader", () => {
  let context;

  beforeEach(() => {
    process.env["INPUT_REPO-TOKEN"] = "token";
    process.env["GITHUB_REPOSITORY"] = "Codertocat/Hello-World";
    process.env["GITHUB_EVENT_PATH"] = path.join(__dirname, "fixtures", "payload.json");

    context = new Context.Context();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("succeeds", async () => {
    nock("https://api.github.com")
      .get("/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=feature%2Fawesome-stuff")
      .reply(200, configFixture());

    const octokit = github.getOctokit("token");

    const config = await getConfig(octokit, context, ".github/pr-branch-labeler.yml");

    expect(config.length).toEqual(6);
  });

  it("throws an error for an invalid config file", async () => {
    nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=feature%2Fawesome-stuff")
      .reply(200, configFixture("invalid-config.yml"));

    const octokit = github.getOctokit("token");

    await expect(getConfig(octokit, context, ".github/pr-branch-labeler.yml")).rejects.toThrow(new Error("config.yml has invalid structure."));
  });
});
