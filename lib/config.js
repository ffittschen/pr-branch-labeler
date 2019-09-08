"use strict";
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
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const CONFIG_PATH = ".github";
function getConfig(github, fileName, { owner, repo }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield github.repos.getContents({
                owner,
                repo,
                path: path_1.default.posix.join(CONFIG_PATH, fileName)
            });
            return parseConfig(response.data.content);
        }
        catch (error) {
            if (error.status === 404) {
                return [];
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
