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
class LabelMatcher {
    static match(headRef, baseRef, entry) {
        if (entry.head && entry.base) {
            if (isMatch(headRef, entry.head) && isMatch(baseRef, entry.base)) {
                core.debug(`Matched "${headRef}" to "${entry.head}" and "${baseRef}" to "${entry.base}". Setting label to "${entry.label}"`);
                return entry.label;
            }
            return undefined;
        }
        if (entry.head && isMatch(headRef, entry.head)) {
            core.debug(`Matched "${headRef}" to "${entry.head}". Setting label to "${entry.label}"`);
            return entry.label;
        }
        if (entry.base && isMatch(baseRef, entry.base)) {
            core.debug(`Matched "${baseRef}" to "${entry.base}". Setting label to "${entry.label}"`);
            return entry.label;
        }
        return undefined;
    }
}
exports.LabelMatcher = LabelMatcher;
function isMatch(ref, patterns) {
    return Array.isArray(patterns)
        ? patterns.some(pattern => matcher_1.default.isMatch(ref, pattern))
        : matcher_1.default.isMatch(ref, patterns);
}
