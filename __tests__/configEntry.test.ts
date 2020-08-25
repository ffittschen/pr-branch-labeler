import "jest-extended";
import nock from "nock";
import { ConfigEntry } from "../src/ConfigEntry";

nock.disableNetConnect();

describe("Config entry", () => {
  let shared;

  beforeEach(() => {
    shared = require('./shared');
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

    it("adds the 'release' label for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
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

  describe("Regular headRegExp and baseRegExp usage", () => {
    it("adds the 'bugfix' label for 'bugfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "bugfix", headRegExp: [/bugfix[/].*/, /hotfix[/].*/] })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("bugfix");
      expect.assertions(1);
    });

    it("adds the 'bugfix' label for 'hotfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "bugfix", headRegExp: [/bugfix[/].*/, /hotfix[/].*/] })

      // Act
      const label = entry.getLabel("hotfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("bugfix");
      expect.assertions(1);
    });

    it("adds the 'release' label for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "release", baseRegExp: /release[/].*/ })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-changes", "release/1.0.0");

      // Assert
      expect(label).toEqual("release");
      expect.assertions(1);
    });

    it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "🧩 Subtask", headRegExp: /feature[/].*/, baseRegExp: /feature[/].*/ })

      // Act
      const label = entry.getLabel("feature/FOO-42-part", "feature/FOO-42-whole");

      // Assert
      expect(label).toEqual("🧩 Subtask");
      expect.assertions(1);
    });
  });


  describe("Regular headRegExp and baseRegExp usage", () => {
    it("adds the 'bugfix' label for 'bugfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "bugfix", headRegExp: [/bugfix[/].*/, /hotfix[/].*/] })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("bugfix");
      expect.assertions(1);
    });

    it("adds the 'bugfix' label for 'hotfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "bugfix", headRegExp: [/bugfix[/].*/, /hotfix[/].*/] })

      // Act
      const label = entry.getLabel("hotfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("bugfix");
      expect.assertions(1);
    });

    it("adds the 'release' label for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "release", baseRegExp: /release[/].*/ })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-changes", "release/1.0.0");

      // Assert
      expect(label).toEqual("release");
      expect.assertions(1);
    });

    it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "🧩 Subtask", headRegExp: /feature[/].*/, baseRegExp: /feature[/].*/ })

      // Act
      const label = entry.getLabel("feature/FOO-42-part", "feature/FOO-42-whole");

      // Assert
      expect(label).toEqual("🧩 Subtask");
      expect.assertions(1);
    });
  });


  describe("Mixed regular and RegExp usage", () => {
    it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole' head to baseRegExp", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "🧩 Subtask", head: "feature/*", baseRegExp: /feature[/].*/ })

      // Act
      const label = entry.getLabel("feature/FOO-42-part", "feature/FOO-42-whole");

      // Assert
      expect(label).toEqual("🧩 Subtask");
      expect.assertions(1);
    });

    it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole' headRegExp to base", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "🧩 Subtask", headRegExp: /feature[/].*/, base: "feature/*" })

      // Act
      const label = entry.getLabel("feature/FOO-42-part", "feature/FOO-42-whole");

      // Assert
      expect(label).toEqual("🧩 Subtask");
      expect.assertions(1);
    });
  });


  describe("Dynamic headRegExp and baseRegExp usage", () => {
    it("adds the 'FOO-42-squash-bugs' label for 'bugfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "$1", headRegExp: [/bugfix[/](.*)/, /hotfix[/](.*)/] })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("FOO-42-squash-bugs");
      expect.assertions(1);
    });

    it("adds the 'FOO-42-squash-bugs' label for 'hotfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "$1", headRegExp: [/bugfix[/].*/, /hotfix[/](.*)/] })

      // Act
      const label = entry.getLabel("hotfix/FOO-42-squash-bugs", "master");

      // Assert
      expect(label).toEqual("FOO-42-squash-bugs");
      expect.assertions(1);
    });

    it("adds the '1.0.0' label for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "$1", baseRegExp: /release[/](.*)/ })

      // Act
      const label = entry.getLabel("bugfix/FOO-42-changes", "release/1.0.0");

      // Assert
      expect(label).toEqual("1.0.0");
      expect.assertions(1);
    });

    it("adds the 'FOO-42-part' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "$1", headRegExp: /feature[/](.*)/, baseRegExp: /feature[/](.*)/ })

      // Act
      const label = entry.getLabel("feature/FOO-42-part", "feature/FOO-42-whole");

      // Assert
      expect(label).toEqual("FOO-42-part");
      expect.assertions(1);
    });

    it("adds the 'FOO-42-whole' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
      // Arrange
      const entry = new ConfigEntry({ label: "$2", headRegExp: /feature[/](.*)/, baseRegExp: /feature[/](.*)/ })

      // Act
      const label = entry.getLabel("feature/FOO-42-part", "feature/FOO-42-whole");

      // Assert
      expect(label).toEqual("FOO-42-whole");
      expect.assertions(1);
    });
  });

  describe("Disallows mixing of matching and regex for same branch", () => {
    it("errors when using head and headRegExp", async () => {
      // Assert
      expect(() => { new ConfigEntry({ label: "bugfix", head: "bugfix/*", headRegExp: /bugfix[/].*/ }) })

        .toThrow(new Error("Config can only contain one of: head, headRegExp"));
      expect.assertions(1);
    });

    it("errors when using base and baseRegExp", async () => {
      // Assert
      expect(() => { new ConfigEntry({ label: "bugfix", base: "bugfix/*", baseRegExp: /bugfix[/].*/ }) })
        .toThrow(new Error("Config can only contain one of: base, baseRegExp"))
      expect.assertions(1);
    });
  });
});
