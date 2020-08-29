import "jest-extended";
import nock from "nock";
import path from "path";
import {WebhookPayload} from "@actions/github/lib/interfaces";
import {Context} from "@actions/github/lib/context";
// @ts-ignore
import { configFixture } from './shared';

import action from "../src/action";

nock.disableNetConnect();

describe("PR Branch Labeler", () => {
  beforeEach(() => {
    process.env["INPUT_REPO-TOKEN"] = "token";
    process.env["GITHUB_REPOSITORY"] = "Codertocat/Hello-World";
    process.env["GITHUB_EVENT_PATH"] = path.join(__dirname, "fixtures", "payload.json");
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("adds the 'feature' label for 'feature/FOO-42-awesome-stuff' to 'master'", async () => {
    await expect(action()).rejects.toThrow(new Error("Payload doesn't contain `pull_request`."));
  });

  it("adds the 'feature' label for 'feature/FOO-42-awesome-stuff' to 'master'", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=feature%2FFOO-42-awesome-stuff')
      .reply(200, configFixture())
      .post("/repos/Codertocat/Hello-World/issues/42/labels", (body) => {
        expect(body).toMatchObject({
          labels: ["feature"]
        });
        return true;
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("feature/FOO-42-awesome-stuff", "master");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(1);
  });

  it("adds the 'support' label for 'support/FOO-42-assisting' to 'master'", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=support%2FFOO-42-assisting')
      .reply(200, configFixture())
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["support"]
        });
        return true;
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("support/FOO-42-assisting", "master");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(1);
  });

  it("adds the 'bugfix' label for 'bugfix/FOO-42-squash-bugs' to 'master'", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=bugfix%2FFOO-42-squash-bugs')
      .reply(200, configFixture())
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["bugfix"]
        });
        return true;
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("bugfix/FOO-42-squash-bugs", "master");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(1);
  });

  it("adds the 'bugfix' label for 'hotfix/FOO-42-squash-bugs' to 'master'", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=hotfix%2FFOO-42-squash-bugs')
      .reply(200, configFixture())
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["bugfix"]
        });
        return true;
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("hotfix/FOO-42-squash-bugs", "master");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(1);
  });

  it("adds the 'release' and 'fix' labels for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
     nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=bugfix%2FFOO-42-changes')
      .reply(200, configFixture())
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body.labels).toIncludeAllMembers(["bugfix", "release"]);
        return true;
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("bugfix/FOO-42-changes", "release/1.0.0");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(1);
  });

  it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=feature%2FFOO-42-part')
      .reply(200, configFixture())
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body.labels).toIncludeAllMembers(["feature", "🧩 Subtask"]);
        return true;
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("feature/FOO-42-part", "feature/FOO-42-whole");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(1);
  });

  it("uses the default config when no config was provided", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=feature%2FFOO-42-awesome-stuff')
      .reply(404)
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["feature"]
        });
        return true;
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("feature/FOO-42-awesome-stuff", "master");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(1);
  });

  it("adds no labels if the branch doesn't match any patterns", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=fix-the-build')
      .reply(200, configFixture())
      .post("/repos/Codertocat/Hello-World/issues/42/labels", () => {
        throw new Error("Shouldn't add labels");
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("fix-the-build", "master");
    const context = new MockContext(pr);

    await action(context);

    expect.assertions(0);
  });

  it("throws an error when the provided config is invalid", async () => {
    nock("https://api.github.com")
      .get('/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml?ref=feature%2FFOO-42-awesome-stuff')
      .reply(200, configFixture("invalid-config.yml"))
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        throw new Error("Shouldn't add labels");
      })
      .reply(200);

    const pr = createPullRequestOpenedFixture("feature/FOO-42-awesome-stuff", "master");
    const context = new MockContext(pr);

    await expect(action(context)).rejects.toThrow(new Error("config.yml has invalid structure."));
  });
});

class MockContext extends Context {
  constructor(payload: WebhookPayload) {
    super();
    this.payload = payload;
  }
}

function createPullRequestOpenedFixture(headRef: string, baseRef: string) {
  return {
    action: "opened",
    pull_request: {
      number: 42,
      head: {
        ref: headRef
      },
      base: {
        ref: baseRef
      }
    },
    repository: {
      name: "Hello-World",
      owner: {
        login: "Codertocat"
      }
    }
  };
}
