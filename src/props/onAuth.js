/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { stringifyError } from "@krakenjs/belter/src";

import { upgradeFacilitatorAccessToken } from "../api";
import { getLogger, setBuyerAccessToken } from "../lib";
import type { FeatureFlags, Experiments } from "../types";

import type { CreateOrder } from "./createOrder";
import type { CreateSubscription } from "./createSubscription";

export type XOnAuthDataType = {|
  accessToken: ?string,
|};

export type OnAuth = (params: XOnAuthDataType) => ZalgoPromise<string | void>;

type GetOnAuthOptions = {|
  facilitatorAccessToken: string,
  createOrder: CreateOrder,
  createSubscription: ?CreateSubscription,
  featureFlags: FeatureFlags,
  experiments: Experiments,
|};

export function getOnAuth({
  facilitatorAccessToken,
  createOrder,
  createSubscription,
  featureFlags,
  experiments,
}: GetOnAuthOptions): OnAuth {
  return ({ accessToken }: XOnAuthDataType) => {
    getLogger().info(
      `spb_onauth_access_token_${accessToken ? "present" : "not_present"}`,
    );
    const isInIgnoreCacheExperiment = experiments?.upgradeLSATWithIgnoreCache;

    return ZalgoPromise.try(() => {
      if (accessToken) {
        if (createSubscription || isInIgnoreCacheExperiment) {
          // Cache the buyerAccessToken so that it can be used when creating an upgraded lsat with ignore cache
          setBuyerAccessToken(accessToken);
          getLogger().info("ignore_lsat_upgrade", {
            createSubscription: Boolean(createSubscription),
            upgradeLSATWithIgnoreCache: isInIgnoreCacheExperiment,
            isLsatUpgradable: featureFlags.isLsatUpgradable,
            accessToken: Boolean(accessToken),
          });
          return accessToken;
        }
        if (featureFlags.isLsatUpgradable) {
          return createOrder()
            .then((orderID) => {
              return upgradeFacilitatorAccessToken(facilitatorAccessToken, {
                buyerAccessToken: accessToken,
                orderID,
              });
            })
            .then(() => {
              getLogger().info(`upgrade_lsat_success`);
              return accessToken;
            })
            .catch((err) => {
              getLogger().warn("upgrade_lsat_failure", {
                error: stringifyError(err),
              });
              return accessToken;
            });
        }

        return accessToken;
      }
    });
  };
}
