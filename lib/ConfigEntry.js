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
        this.head = raw.head;
        this.headRegExp = raw.headRegExp;
        if (this.head && this.headRegExp) {
            throw new Error("Config can only contain one of: head, headRegExp");
        }
        this.base = raw.base;
        this.baseRegExp = raw.baseRegExp;
        if (this.base && this.baseRegExp) {
            throw new Error("Config can only contain one of: base, baseRegExp");
        }
    }
    getLabel(headRef, baseRef) {
        const headMatches = ConfigEntry.getMatches(headRef, this.head, this.headRegExp);
        const baseMatches = ConfigEntry.getMatches(baseRef, this.base, this.baseRegExp);
        core.debug('*** getLabel ***');
        core.debug(JSON.stringify(this));
        core.debug('headRef');
        core.debug(headRef);
        core.debug('headMatches');
        core.debug(JSON.stringify(headMatches));
        core.debug('baseRef');
        core.debug(baseRef);
        core.debug('baseMatches');
        core.debug(JSON.stringify(baseMatches));
        if ((this.head || this.headRegExp) && (this.base || this.baseRegExp)) {
            if (headMatches && baseMatches) {
                const label = this.getLabelFromMatches(headMatches.concat(baseMatches));
                core.debug(`Matched "${headRef}" to "${this.head ? this.head : this.headRegExp.toString()}" and "${baseRef}" to "${this.base ? this.base : this.baseRegExp.toString()}". Setting label to "${label}"`);
                return label;
            }
            return undefined;
        }
        if ((this.head || this.headRegExp) && headMatches) {
            const label = this.getLabelFromMatches(headMatches);
            core.debug(`Matched "${headRef}" to "${this.head ? this.head : this.headRegExp.toString()}". Setting label to "${label}"`);
            return label;
        }
        if ((this.base || this.baseRegExp) && baseMatches) {
            const label = this.getLabelFromMatches(baseMatches);
            core.debug(`Matched "${baseRef}" to "${this.base ? this.base : this.baseRegExp.toString()}". Setting label to "${label}"`);
            return label;
        }
        //core.debug('label', undefined);
        return undefined;
    }
    getLabelFromMatches(matches) {
        if (!this.label.startsWith('$')) {
            return this.label;
        }
        const matchPosString = this.label.substr(1);
        const matchPosNumber = parseInt(matchPosString);
        if (isNaN(matchPosNumber) || matchPosNumber < 1) {
            return this.label;
        }
        const actualMatches = matches.filter(match => match != '');
        if (matchPosNumber > actualMatches.length) {
            return this.label;
        }
        return actualMatches[matchPosNumber - 1];
    }
    static getMatches(ref, patterns, patternsRegExp) {
        if (patterns) {
            if (Array.isArray(patterns)) {
                core.debug(`Trying to match "${ref}" to ${JSON.stringify(patterns)}`);
                return patterns.some(pattern => matcher_1.default.isMatch(ref, pattern)) ? [''] : undefined;
            }
            core.debug(`Trying to match "${ref}" to "${patterns}"`);
            return matcher_1.default.isMatch(ref, patterns) ? [''] : undefined;
        }
        if (patternsRegExp) {
            if (Array.isArray(patternsRegExp)) {
                core.debug(`Trying to match "${ref}" to ${JSON.stringify(patternsRegExp.map(x => x.toString()))}`);
                const matches = patternsRegExp
                    .map((pattern) => this.getRegExpMatch(ref, pattern) || null)
                    .filter((match) => match !== null);
                return matches.length === 0 ? undefined : matches.flat();
            }
            core.debug(`Trying to match "${ref}" to "${patternsRegExp.toString()}"`);
            return ConfigEntry.getRegExpMatch(ref, patternsRegExp);
        }
        return undefined;
    }
    static getRegExpMatch(ref, pattern) {
        const regExpResult = pattern.exec(ref);
        if (regExpResult === null) {
            return undefined;
        }
        if (regExpResult.length === 0) {
            return [''];
        }
        return regExpResult.slice(1);
    }
}
exports.ConfigEntry = ConfigEntry;
;
