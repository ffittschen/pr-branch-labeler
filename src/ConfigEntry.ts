import * as core from "@actions/core";
import matcher from "matcher";

export class ConfigEntry implements ConfigEntryParams {
  label: string;
  head?: string | string[];
  base?: string | string[];

  constructor(raw: ConfigEntryParams) {
    this.label = raw.label;

    if (raw.head) {
      this.head = raw.head;
    }

    if (raw.base) {
      this.base = raw.base;
    }
  }

  getLabel(headRef: string, baseRef: string): string | undefined {
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

  private static isMatch(ref: string, patterns: string | string[]): boolean {
    return Array.isArray(patterns)
      ? patterns.some(pattern => matcher.isMatch(ref, pattern))
      : matcher.isMatch(ref, patterns);
  }
}

export interface ConfigEntryParams {
  label: string;
  head?: string | string[];
  base?: string | string[];
};
