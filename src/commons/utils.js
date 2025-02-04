import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root_path = path.join(__dirname, "..", "..");

export function rootPath(...rel_path)
{
    return path.join.apply(undefined, [__root_path, ...rel_path]);
}