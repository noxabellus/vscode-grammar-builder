console.log("hello");

import { promises as fs } from 'fs';
import * as Path from 'path';
import proc from 'child_process';

import { JsonObject, TMGrammar } from 'vscode-grammar';
import { clean } from './clean.js';
import log from './log.js';
import cli from './cli.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

interface Args {
    "-default": string;
    name: string;
    out: string;
}

(async function () {
    let { "-default": srcPath, name, out }: Args = cli.args();

    let outPath = Path.resolve(process.cwd(), out ?? 'dist');
    let relPath = '';
    let absPath = '';

    if (srcPath) {
        absPath = Path.resolve(process.cwd(), srcPath);
        relPath = Path.relative(__dirname, absPath).replace(/\\/g, '/');
    } else {
        cli.err('No source path provided');
    }

    name = name ?? Path.basename(relPath);

    log.ok(`Building ${name} from ${relPath} to ${outPath}...`);

    try {
        const file = Path.resolve(absPath, 'index.js');

        // hack to get error messages from tsc if there is a problem in the file
        await new Promise<void> ((resolve, reject) => {
            proc.spawn('tsc', ['--noEmit', file], {stdio: 'inherit'})
                .on('exit', (code) => {
                    if (code !== 0) reject(`tsc exited with code ${code}`);
                    else resolve();
                });
        });

        log.ok("tsc check passed");

        let grammar = (await import(file)).default;

        await build(grammar, outPath, name);
        await copyConfigs(absPath, outPath);
    } catch (err) {
        cli.err(err);
    }

    async function build(grammar: TMGrammar, outPath: string, name: string) {
        let processed = toJson(grammar);
        let content = JSON.stringify(processed, null, '\t');
        let filePath = Path.resolve(outPath, `${name}.tmLanguage.json`);

        await clean(outPath);
        await fs.writeFile(filePath, content);

        log.ok(`Wrote file '${filePath}'`);
    }

    function copyConfigs(srcPath: string, outPath: string) {
        return new Promise<void>(async (resolve, reject) => {
            let files = await fs.readdir(srcPath);
            files = files.filter((file) => file.endsWith('json'));

            let pending = files.length;
            let done = 0;

            if (!pending) resolve();

            files.forEach((file) => {
                let dest = Path.resolve(outPath, file);
                file = Path.resolve(srcPath, file);

                fs.copyFile(file, dest)
                    .catch(reject)
                    .then(() => {
                        log.ok(`Copied '${file}' -> '${dest}'`);
                        if (++done === pending) resolve();
                    });
            });
        });
    }

    function toJson(grammar: TMGrammar): JsonObject {
        let processed: JsonObject = {};
        for (let [key, value] of Object.entries(grammar)) {
            // prettier-ignore
            if (typeof value === 'string')
                processed[key] = value;
            else if (value instanceof RegExp)
                processed[key] = value.toString().replace(/^\/|\/$/g, '');
            else if (Array.isArray(value))
                processed[key] = value.map(toJson);
            else
                processed[key] = toJson(value);
        }
        return processed;
    }
})();
