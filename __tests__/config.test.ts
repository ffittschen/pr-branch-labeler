import * as github from "@actions/github";
import "jest-extended";
import nock from "nock";
import { getConfig } from '../src/config';
import { configFixture, emptyConfigFixture } from './shared';

nock.disableNetConnect();

describe("Config file loader", () => {
    beforeEach(() => {
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it("succeeds", async () => {

        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/TheCleric/Hello-World/contents/.github/pr-branch-labeler.yml")
            .reply(200, configFixture());

        const octokit = new github.GitHub("token");

        const config = await getConfig(octokit, "pr-branch-labeler.yml", {
            repo: "Hello-World",
            owner: "TheCleric"
        });

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect(config.length).toEqual(6);
        expect.assertions(2);
    });

    it("throws an error for an invalid config file", async () => {

        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/TheCleric/Hello-World/contents/.github/pr-branch-labeler.yml")
            .reply(200, configFixture("invalid-config.yml"));

        const octokit = new github.GitHub("token");

        await expect(getConfig(octokit, "pr-branch-labeler.yml", {
            repo: "Hello-World",
            owner: "TheCleric"
        })).rejects.toThrow(new Error("config.yml has invalid structure."));

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect.assertions(2);
    });

    it("throws an error for a directory", async () => {

        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/TheCleric/Hello-World/contents/.github/test")
            .reply(200, []);

        const octokit = new github.GitHub("token");

        await expect(getConfig(octokit, "test", {
            repo: "Hello-World",
            owner: "TheCleric"
        })).rejects.toThrow(new Error("test is not a file."));

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect.assertions(2);
    });

    it("throws an error for no contents", async () => {

        // Arrange
        const getConfigScope = nock("https://api.github.com")
            .persist()
            .get("/repos/TheCleric/Hello-World/contents/.github/pr-branch-labeler.yml")
            .reply(200, emptyConfigFixture());

        const octokit = new github.GitHub("token");

        await expect(getConfig(octokit, "pr-branch-labeler.yml", {
            repo: "Hello-World",
            owner: "TheCleric"
        })).rejects.toThrow(new Error("pr-branch-labeler.yml is empty."));

        // Assert
        expect(getConfigScope.isDone()).toBeTrue();
        expect.assertions(2);
    });
});
