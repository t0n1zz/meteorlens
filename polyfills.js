/**
 * Must run before any code that uses Buffer (e.g. @solana/web3.js, @meteora-ag/dlmm).
 * Web and React Native use different globals; set Buffer on all of them.
 */
import { Buffer } from "buffer";

const b = Buffer;
if (typeof globalThis !== "undefined") globalThis.Buffer = b;
if (typeof global !== "undefined") global.Buffer = b;
if (typeof window !== "undefined") window.Buffer = b;
if (typeof self !== "undefined") self.Buffer = b;
