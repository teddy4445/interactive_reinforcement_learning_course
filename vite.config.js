import {offlineBuild} from './scripts/offline-build.mjs';
import {defineConfig} from 'vitest/config';
export default defineConfig({base:'/rl-island/',worker:{format:'es'},plugins:[offlineBuild()],test:{include:['tests/unit/**/*.test.js']}});
