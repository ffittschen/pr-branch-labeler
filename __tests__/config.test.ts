import * as github from "@actions/github";
import * as Context from '@actions/github/lib/context';
import "jest-extended";
import nock from "nock";
import path from "path";
import { getConfig } from '../src/config';
import { configFixture, emptyConfigFixture } from './shared';


nock.disableNetConnect();

describe("Config file loader", () => {
    let context;

    beforeEach(() => {
        const repoToken = "token";
        process.env["INPUT_REPO-TOKEN"] = repoToken;
        process.env["GITHUB_REPOSITORY"] = "Codertocat/Hello-World";
        process.env["GITHUB_EVENT_PATH"] = path.join(__dirname, "fixtures", "payload.json");

        context = new Context.Context();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it("succeeds", async () => {
        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/Codertocat/Hello-World/contents/.github/pr-branch-labeler.yml?ref=0123456")
            .reply(200, configFixture());

        const octokit = new github.GitHub("token");

        const config = await getConfig(octokit, "pr-branch-labeler.yml", context);

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect(config.length).toEqual(11);
        expect.assertions(2);
    });

    it("converts regular expressions", async () => {
        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/Codertocat/Hello-World/contents/.github/pr-branch-labeler.yml?ref=0123456")
            .reply(200, configFixture());

        const octokit = new github.GitHub("token");

        const config = await getConfig(octokit, "pr-branch-labeler.yml", context);

        const headRegExpConfigs = config.filter(x => x.headRegExp);
        const headRegExpConfigsWithRegExp = headRegExpConfigs.filter(x =>
            Array.isArray(x.headRegExp)
                ? x.headRegExp.map(x => x !== null && x.exec !== undefined).reduce((a, v) => a && v, true)
                : x.headRegExp!.exec !== undefined
        )

        const baseRegExpConfigs = config.filter(x => x.baseRegExp);
        const baseRegExpConfigsWithRegExp = baseRegExpConfigs.filter(x =>
            Array.isArray(x.baseRegExp)
                ? x.baseRegExp.map(x => x !== null && x.exec !== undefined).reduce((a, v) => a && v, true)
                : x.baseRegExp!.exec !== undefined
        )

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect(headRegExpConfigs.length).toBeGreaterThan(0);
        expect(headRegExpConfigs.length).toEqual(headRegExpConfigsWithRegExp.length);
        expect(baseRegExpConfigs.length).toBeGreaterThan(0);
        expect(baseRegExpConfigs.length).toEqual(baseRegExpConfigs.length);
        expect.assertions(5);
    });

    it("throws an error for an invalid config file", async () => {
        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/Codertocat/Hello-World/contents/.github/pr-branch-labeler.yml?ref=0123456")
            .reply(200, configFixture("invalid-config.yml"));

        const octokit = new github.GitHub("token");

        await expect(getConfig(octokit, "pr-branch-labeler.yml", context)).rejects.toThrow(new Error("config.yml has invalid structure."));

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect.assertions(2);
    });

    it("throws an error for a directory", async () => {
        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/Codertocat/Hello-World/contents/.github/test?ref=0123456")
            .reply(200, []);

        const octokit = new github.GitHub("token");

        await expect(getConfig(octokit, "test", context)).rejects.toThrow(new Error("test is not a file."));

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect.assertions(2);
    });

    it("throws an error for no contents", async () => {
        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/Codertocat/Hello-World/contents/.github/pr-branch-labeler.yml?ref=0123456")
            .reply(200, emptyConfigFixture());

        const octokit = new github.GitHub("token");

        await expect(getConfig(octokit, "pr-branch-labeler.yml", context)).rejects.toThrow(new Error("pr-branch-labeler.yml is empty."));

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect.assertions(2);
    });
});
