import nock from "nock";
import path from "path";
import { readFileSync } from "fs";
import "jest-extended";

nock.disableNetConnect();

describe("PR Branch Labeler", () => {
  let main;

  beforeEach(() => {
    const repoToken = "token";
    process.env["INPUT_REPO-TOKEN"] = repoToken;
    process.env["GITHUB_REPOSITORY"] = "Codertocat/Hello-World";
    process.env["GITHUB_EVENT_PATH"] = path.join(__dirname, "fixtures", "payload.json");
    main = require("../src/main");
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("adds the 'feature' label for 'feature/FOO-42-awesome-stuff' to 'master'", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(200, configFixture());

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["feature"]
        });
        return true;
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("feature/FOO-42-awesome-stuff", "master");

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeTrue();
    // This is expecting 4 assertions, since the postLabelsScope will do an assertion
    // when "../src/main" is required the first time
    expect.assertions(4);
  });

  it("adds the 'bugfix' label for 'bugfix/FOO-42-squash-bugs' to 'master'", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(200, configFixture());

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["bugfix"]
        });
        return true;
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("bugfix/FOO-42-squash-bugs", "master");

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeTrue();
    expect.assertions(3);
  });

  it("adds the 'bugfix' label for 'hotfix/FOO-42-squash-bugs' to 'master'", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(200, configFixture());

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["bugfix"]
        });
        return true;
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("hotfix/FOO-42-squash-bugs", "master");

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeTrue();
    expect.assertions(3);
  });

  it("adds the 'release' and 'fix' labels for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(200, configFixture());

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body.labels).toIncludeAllMembers(["bugfix", "release"]);
        return true;
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("bugfix/FOO-42-changes", "release/1.0.0");

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeTrue();
    expect.assertions(3);
  });

  it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(200, configFixture());

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body.labels).toIncludeAllMembers(["feature", "🧩 Subtask"]);
        return true;
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("feature/FOO-42-part", "feature/FOO-42-whole");

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeTrue();
    expect.assertions(3);
  });

  it("uses the default config when no config was provided", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(404);

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        expect(body).toMatchObject({
          labels: ["feature"]
        });
        return true;
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("feature/FOO-42-awesome-stuff", "master");

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeTrue();
    expect.assertions(3);
  });

  it("adds no labels if the branch doesn't match any patterns", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(200, configFixture());

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", () => {
        throw new Error("Shouldn't add labels");
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("fix-the-build", "master");

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeFalse();
    expect.assertions(2);
  });

  it("throws an error when the provided config is invalid", async () => {
    // Arrange
    const getConfigScope = nock("https://api.github.com")
      .persist()
      .get("/repos/Codertocat/Hello-World/contents/.github/pr-labeler.yml")
      .reply(200, configFixture("invalid-config.yml"));

    const postLabelsScope = nock("https://api.github.com")
      .persist()
      .post("/repos/Codertocat/Hello-World/issues/42/labels", body => {
        throw new Error("Shouldn't add labels");
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture("feature/FOO-42-awesome-stuff", "master");

    // Act
    await expect(main.run()).rejects.toThrow(new Error("config.yml has invalid structure."));

    // Assert
    expect(getConfigScope.isDone()).toBeTrue();
    expect(postLabelsScope.isDone()).toBeFalse();
    expect.assertions(3);
  });
});

function encodeContent(content: Buffer | ArrayBuffer | SharedArrayBuffer) {
  return Buffer.from(content).toString("base64");
}

function configFixture(fileName = "config.yml") {
  return {
    type: "file",
    encoding: "base64",
    name: fileName,
    path: `.github/${fileName}`,
    content: encodeContent(readFileSync(`./__tests__/fixtures/${fileName}`))
  };
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
