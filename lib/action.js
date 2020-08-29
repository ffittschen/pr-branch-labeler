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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const matcher_1 = __importDefault(require("matcher"));
const config_1 = require("./config");
function action(context = github.context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        core.debug(`context: ${JSON.stringify(context)}`);
        if (!((_a = context === null || context === void 0 ? void 0 : context.payload) === null || _a === void 0 ? void 0 : _a.pull_request)) {
            throw new Error("Payload doesn't contain `pull_request`.");
        }
        return addLabelsIfAny(context);
    });
}
function addLabelsIfAny(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const repoToken = core.getInput("repo-token", { required: true });
        const octokit = github.getOctokit(repoToken);
        const labelsToAdd = yield getLabelsToAdd(octokit, context);
        if (!labelsToAdd.length) {
            return;
        }
        return addLabels(labelsToAdd, octokit, context);
    });
}
function getLabelsToAdd(octokit, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const configPath = core.getInput("config-path");
        const config = yield config_1.getConfig(octokit, context, configPath);
        core.debug(`config: ${JSON.stringify(config)}`);
        const headRef = context.payload.pull_request.head.ref;
        const baseRef = context.payload.pull_request.base.ref;
        return config.reduce((labels, entry) => {
            if (entry.head && entry.base) {
                if (isMatch(headRef, entry.head) && isMatch(baseRef, entry.base)) {
                    core.info(`Matched "${headRef}" to "${entry.head}" and "${baseRef}" to "${entry.base}". Setting label to "${entry.label}"`);
                    labels.push(entry.label);
                }
            }
            else if (entry.head && isMatch(headRef, entry.head)) {
                core.info(`Matched "${headRef}" to "${entry.head}". Setting label to "${entry.label}"`);
                labels.push(entry.label);
            }
            else if (entry.base && isMatch(baseRef, entry.base)) {
                core.info(`Matched "${baseRef}" to "${entry.base}". Setting label to "${entry.label}"`);
                labels.push(entry.label);
            }
            return labels;
        }, []);
    });
}
function isMatch(ref, patterns) {
    return Array.isArray(patterns)
        ? patterns.some(pattern => matcher_1.default.isMatch(ref, pattern))
        : matcher_1.default.isMatch(ref, patterns);
}
function addLabels(labels, octokit, context) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug(`Adding labels: ${labels}`);
        return octokit.issues.addLabels(Object.assign(Object.assign({}, context.repo), { issue_number: context.payload.pull_request.number, labels }));
    });
}
exports.default = action;
