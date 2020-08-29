"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const core = __importStar(require("@actions/core"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const defaultConfigPath = ".github/pr-branch-labeler.yml";
const defaults = [
    { label: "feature", head: "feature/*", base: undefined },
    { label: "bugfix", head: ["bugfix/*", "hotfix/*"], base: undefined },
    { label: "chore", head: "chore/*", base: undefined }
];
function getConfig(github, context, configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const path = configPath || defaultConfigPath;
            const configFile = {
                owner: context.repo.owner,
                repo: context.repo.repo,
                path,
                ref: context.payload.pull_request.head.ref,
            };
            core.debug(`Getting contents of ${JSON.stringify(configFile)}`);
            const response = yield github.repos.getContent(configFile);
            return parseConfig(response.data.content);
        }
        catch (error) {
            core.debug(`getConfig error: ${JSON.stringify(error)}`);
            if (error.status === 404) {
                return defaults;
            }
            throw error;
        }
    });
}
exports.getConfig = getConfig;
function parseConfig(content) {
    const configObject = js_yaml_1.default.safeLoad(Buffer.from(content, "base64").toString()) || {};
    if (configObject === {}) {
        return [];
    }
    return Object.entries(configObject).reduce((entries, [label, object]) => {
        const headPattern = object.head || (typeof object === "string" || Array.isArray(object) ? object : undefined);
        const basePattern = object.base;
        if (headPattern || basePattern) {
            entries.push({ label: label, head: headPattern, base: basePattern });
        }
        else {
            throw new Error("config.yml has invalid structure.");
        }
        return entries;
    }, []);
}
