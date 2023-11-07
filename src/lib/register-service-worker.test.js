// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable promise/no-native, no-restricted-globals, compat/compat */
/* @flow */
import { describe, beforeEach, it, expect, vi } from "vitest";

import { SERVICE_WORKER } from "../constants";

import {
  registerServiceWorker,
  getSanitizedUrl,
} from "./register-service-worker";

const { SERVICE_WORKER_URL } = SERVICE_WORKER;

const waitForExpect = function waitForExpect(
  expectation: () => void | Promise<void>,
  timeout = 4500,
  interval = 50,
  // eslint-disable-next-line flowtype/no-weak-types
): Promise<any> {
  if (interval < 1) {
    interval = 1;
  }
  const maxTries = Math.ceil(timeout / interval);
  let tries = 0;
  return new Promise((resolve, reject) => {
    const rejectOrRerun = (error: Error) => {
      if (tries > maxTries) {
        reject(error);
        return;
      }
      // eslint-disable-next-line no-use-before-define
      setTimeout(runExpectation, interval);
    };
    function runExpectation() {
      tries += 1;
      try {
        Promise.resolve(expectation())
          .then(() => resolve())
          .catch(rejectOrRerun);
      } catch (error) {
        rejectOrRerun(error);
      }
    }
    setTimeout(runExpectation, 0);
  });
};

describe("Test service worker registration script", () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        register: vi.fn().mockResolvedValue({
          addEventListener: () => true,
        }),
      },
    });
    Object.defineProperty(global, "BroadcastChannel", {
      value: vi.fn().mockImplementation(() => ({
        addEventListener: vi.fn(),
      })),
    });
  });

  it("Should install a service worker", async () => {
    const registerSpy = vi.spyOn(global.navigator.serviceWorker, "register");
    const dumbledoreCurrentReleaseHash =
      "b6cc430fb82802fb9363767b8a7c38187fa4a9d7";
    const dumbledoreServiceWorker =
      "service-worker.d13e6de5a39aafd6b06bd1d18d165c8d.js";

    registerServiceWorker({
      dumbledoreCurrentReleaseHash,
      dumbledoreServiceWorker,
    });

    const expectedSwUrl = `${SERVICE_WORKER_URL}/${dumbledoreServiceWorker}?releaseHash=${dumbledoreCurrentReleaseHash}`;

    await waitForExpect(() => {
      expect(registerSpy).toHaveBeenLastCalledWith(expectedSwUrl, {
        scope: "/webapps/hermes",
      });
    });
  });
});

describe("Test service worker url generation", () => {
  it("Should check and remove non alphanumeric characters in the release hash", () => {
    const invalidReleaseHash =
      "/../../b6cc430fb82802fb9363767b8a7c38187fa4a9d7";
    const dumbledoreServiceWorker =
      "service-worker.d13e6de5a39aafd6b06bd1d18d165c8d.js";
    const sanitizedUrl = getSanitizedUrl(
      invalidReleaseHash,
      dumbledoreServiceWorker,
    );
    const expectedUrl =
      "https://www.paypal.com/checkout-sw/service-worker.d13e6de5a39aafd6b06bd1d18d165c8d.js?releaseHash=b6cc430fb82802fb9363767b8a7c38187fa4a9d7";

    expect(sanitizedUrl).toMatch(expectedUrl);
  });
  it("Should remove any encoded html in url to prevent xss attacks", () => {
    const invalidReleaseHash =
      "b6cc430fb82802fb9363767b8a7c38187fa4a9d7;<alert>1</alert>&lt;alert&gt;";
    const dumbledoreServiceWorker =
      "service-worker.d13e6de5a39aafd6b06bd1d18d165c8d.js";
    const sanitizedUrl = getSanitizedUrl(
      invalidReleaseHash,
      dumbledoreServiceWorker,
    );
    const expectedUrl =
      "https://www.paypal.com/checkout-sw/service-worker.d13e6de5a39aafd6b06bd1d18d165c8d.js?releaseHash=b6cc430fb82802fb9363767b8a7c38187fa4a9d7";

    expect(sanitizedUrl).toMatch(expectedUrl);
  });
});
