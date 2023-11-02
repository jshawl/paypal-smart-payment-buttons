/* @flow */

import {
  getAllFramesInWindow,
  isSameDomain,
} from "@krakenjs/cross-domain-utils/src";

import { FRAME_NAME } from "../../constants";
import type { CardExports } from "../lib";

export function getExportsByFrameName<T>(
  name: $Values<typeof FRAME_NAME>,
): ?CardExports<T> {
  try {
    for (const win of getAllFramesInWindow(window)) {
      if (
        isSameDomain(win) &&
        // $FlowFixMe
        win.exports &&
        win.exports.name === name
      ) {
        return win.exports;
      }
    }
  } catch (err) {
    // pass
  }
}
