/**
 * Shim for Node "util" used by @coral-xyz/anchor.
 * React Native/Hermes provide TextDecoder/TextEncoder on global.
 */
module.exports = {
  TextDecoder: global.TextDecoder,
  TextEncoder: global.TextEncoder,
};
