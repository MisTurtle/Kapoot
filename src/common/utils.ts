import path from 'path';
import { fileURLToPath } from 'url';

export const production = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root_path = path.join(__dirname, "..", "..", production ? "" : "");


export function rootPath(...rel_path: string[]): string
{
    return path.join.apply(undefined, [__root_path, ...rel_path]);
}