import * as path from 'path';

export type Env = 'prod' | 'dev' | 'boe';

export const envs: ReadonlyArray<Env> = ['prod', 'dev', 'boe'];

export let env: Env;

export const basedir = path.resolve(__dirname, '../..');

export function updateEnv(_env: Env) {
    env = _env;
}
