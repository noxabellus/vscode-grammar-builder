import { promises as fs } from 'fs';
import { rimraf } from 'rimraf';

export function clean(path: string) {
    return new Promise<void>((resolve, reject) => {
        rimraf(path)
            .then(() => fs.mkdir(path).then(resolve, reject)), reject;

    });
}
