import { readFileSync } from "fs";

function encodeContent(content: Buffer | ArrayBuffer | SharedArrayBuffer) {
    return Buffer.from(content).toString("base64");
}

export function configFixture(fileName = "config.yml") {
    return {
        type: "file",
        encoding: "base64",
        name: fileName,
        path: `.github/${fileName}`,
        content: encodeContent(readFileSync(`./__tests__/fixtures/${fileName}`))
    };
}

export function emptyConfigFixture(fileName = "config.yml") {
    return {
        type: "file",
        encoding: "base64",
        name: fileName,
        path: `.github/${fileName}`,
        content: undefined
    };
}
