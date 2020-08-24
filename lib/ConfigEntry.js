"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const matcher_1 = __importDefault(require("matcher"));
class ConfigEntry {
    constructor(raw) {
        this.label = raw.label;
        if (raw.head) {
            this.head = raw.head;
        }
        if (raw.base) {
            this.base = raw.base;
        }
    }
    getLabel(headRef, baseRef) {
        if (this.head && this.base) {
            if (ConfigEntry.isMatch(headRef, this.head) && ConfigEntry.isMatch(baseRef, this.base)) {
                core.debug(`Matched "${headRef}" to "${this.head}" and "${baseRef}" to "${this.base}". Setting label to "${this.label}"`);
                return this.label;
            }
            return undefined;
        }
        if (this.head && ConfigEntry.isMatch(headRef, this.head)) {
            core.debug(`Matched "${headRef}" to "${this.head}". Setting label to "${this.label}"`);
            return this.label;
        }
        if (this.base && ConfigEntry.isMatch(baseRef, this.base)) {
            core.debug(`Matched "${baseRef}" to "${this.base}". Setting label to "${this.label}"`);
            return this.label;
        }
        return undefined;
    }
    static isMatch(ref, patterns) {
        return Array.isArray(patterns)
            ? patterns.some(pattern => matcher_1.default.isMatch(ref, pattern))
            : matcher_1.default.isMatch(ref, patterns);
    }
}
exports.ConfigEntry = ConfigEntry;
;
