import * as Path from 'path';
import { promises as fs } from 'fs';

import cli from '../cli.js';
import log from '../log.js';
import { clean } from '../clean.js';
import { processIndex, processRepo } from './processing.js';
import { JsonGrammar, TMGrammarScope } from 'vscode-grammar';


import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

interface Args {
    "-default": string;
    out: string;
}

(async function () {
    let { "-default": path, out }: Args = cli.args();
    if (!path) {
        cli.err('Expected path to a grammar JSON file');
    }

    try {
        await decompile(path, out);
    } catch (err) {
        cli.err(err);
    }

    async function decompile(path: string, out = 'out') {
        let file = Path.resolve(process.cwd(), path);
        let outPath = Path.resolve(process.cwd(), out);

        await clean(outPath);

        let contents = await fs.readFile(file);
        let grammar: JsonGrammar = JSON.parse(contents.toString());
        log.ok(`Parsed grammar for '${grammar.name}'`);

        let repo: Map<string, TMGrammarScope> = undefined;
        if ('repository' in grammar) {
            repo = await processRepo(outPath, grammar.repository);
        }

        await processIndex(outPath, grammar, repo!);
    }
})();
