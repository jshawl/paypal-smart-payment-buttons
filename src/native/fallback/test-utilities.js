/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable promise/no-native, no-restricted-globals */
/* @flow */
import { vi } from "vitest";

type WindowPayPalOptions = $Shape<{|
  postRobot: $Shape<{|
    send: Function,
  |}>,
|}>;

export const setupWindowPayPal = (options: WindowPayPalOptions = {}) => {
  if (window.paypal) {
    delete window.paypal;
  }

  window.paypal = {
    ...options,
  };
};

type WindowXpropsOptions = $Shape<{|
  intent: string,
  getPageUrl: () => Promise<string>,
  remember: () => Promise<void>,
|}>;

export const setupWindowXprops = (options: WindowXpropsOptions = {}) => {
  if (window.xprops) {
    delete window.xprops;
  }

  window.xprops = {
    locale: {
      country: "US",
      lang: "en",
    },
    style: {},
    getPrerenderDetails: vi.fn().mockResolvedValue({}),
    ...options,
  };
};
