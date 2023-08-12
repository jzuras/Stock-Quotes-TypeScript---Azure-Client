// First, let TypeScript allow all module names starting with "https://". This will suppress TS errors.
declare module 'https://*';

// Second, list out all your dependencies. For every URL, you must map it to its local module.
declare module 'https://cdn.skypack.dev/pin/superstruct@v1.0.3-yP8v6jYc8g9oW4NL2673/mode=imports,min/optimized/superstruct.js' {
    export * from 'superstruct';
}
