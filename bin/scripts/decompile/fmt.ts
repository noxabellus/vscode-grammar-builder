import * as prettier from 'prettier';

namespace fmt {
    export async function print(src: string | string[]): Promise<string> {
        if (Array.isArray(src)) src = src.join('\n');

        return prettier.format(src, {
            useTabs: false,
            tabWidth: 4,
            singleQuote: false,
            trailingComma: 'all',
            parser: 'typescript',
        });
    }
}

export default fmt;
