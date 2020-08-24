import "jest-extended";
import nock from "nock";
import { ConfigEntry } from "../src/ConfigEntry";

nock.disableNetConnect();

describe("Config entry", () => {
  let main;

  beforeEach(() => {
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("shorthand array", () => {
    it("adds the 'support' label for 'support/FOO-42-assisting' to 'master'", async () => {

      // Arrange
      const entry = new ConfigEntry({ label: "support", head: ["support/*", "sup/*"] })

      // Act
      const label = entry.getLabel("support/FOO-42-assisting", "master");

      // Assert
      expect(label).toEqual("support");
      expect.assertions(1);
    });
  });

  describe("Regular head and base usage", () => {
    it("adds the 'bugfix' label for 'bugfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "bugfix", head: ["bugfix/*", "hotfix/*"] })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("bugfix");
      expect.assertions(1);
    });

    it("adds the 'bugfix' label for 'hotfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "bugfix", head: ["bugfix/*", "hotfix/*"] })

      // Act
      const label = entry.getLabel("hotfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("bugfix");
      expect.assertions(1);
    });

    it("adds the 'release' and 'fix' labels for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "release", base: "release/*" })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-changes", "release/1.0.0");

      // Assert
      expect(label).toEqual("release");
      expect.assertions(1);
    });

    it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "🧩 Subtask", head: "feature/*", base: "feature/*" })

      // Act
      const label = entry.getLabel("feature/FOO-42-part", "feature/FOO-42-whole");

      // Assert
      expect(label).toEqual("🧩 Subtask");
      expect.assertions(1);
    });
  });


  it("adds no labels if the branch doesn't match any patterns", async () => {
    // Arrange
    const entry = new ConfigEntry({ label: '' })

    // Act
    const label = entry.getLabel("fix-the-build", "master");

    // Assert
    expect(label).toEqual(undefined);
    expect.assertions(1);
  });
});
