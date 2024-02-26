import * as Path from 'path';
import proc from 'child_process';
import log from "./log.js";
import cli from "./cli.js";

(async function () {
    try {
        let pkgPath = Path.resolve(process.cwd(), 'package.json');
        log.ok(`Looking for package config at ${pkgPath}`);

        let pkg = (await import(pkgPath, {assert: {type: "json"}})).default;

        log.ok(`Found package.json:\n${JSON.stringify(pkg, null, '    ')}`);

        let vsixPath = Path.resolve(process.cwd(), `${pkg.name}-${pkg.version}.vsix`);

        log.ok(`Installing ${vsixPath}...`);

        // hack to get error messages from tsc if there is a problem in the file
        await new Promise<void> ((resolve, reject) => {
            proc.spawn('code', ['--install-extension', vsixPath], {stdio: 'inherit'})
                .on('exit', (code) => {
                    if (code !== 0) reject(`vs code exited with code ${code}`);
                    else resolve();
                });
        });

        log.ok("Installed!");
    } catch (err) {
        cli.err(err);
    }
})();
