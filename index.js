/**
 * Entry point. Polyfills must load before any Solana/web3 code.
 * @see https://docs.solanamobile.com/react-native/polyfill-guides/web3-js
 */
import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;

import { registerRootComponent } from "expo";
import App from "./App";
registerRootComponent(App);
