/* @flow */
import { FUNDING } from "@paypal/sdk-constants/src";
import { redirect as redir } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { getLogger } from "../lib";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { getPayPalDomainRegex } from "@paypal/sdk-client/src";
import { getDomainFromUrl } from "@krakenjs/cross-domain-utils/src";

export const checkUlsatNotRequired = (
  paymentSource: $Values<typeof FUNDING> | null,
  buyerAccessToken: ?string,
): boolean => paymentSource === FUNDING.VENMO && !buyerAccessToken;

export const redirect = (url: string): ZalgoPromise<void> => {
  if (!url) {
    throw new Error(`Expected redirect url`);
  }

  if (url.indexOf("://") === -1) {
    getLogger().warn("redir_url_non_scheme", { url }).flush();
    throw new Error(
      `Invalid redirect url: ${url} - must be fully qualified url`,
    );
  } else if (!url.match(/^https:\/\//)) {
    getLogger().warn("redir_url_non_http", { url }).flush();

    if (
      url
        .toLowerCase()
        .replace(/[^a-z:]+/g, "")
        .match(/^javascript:/)
    ) {
      getLogger().warn("redir_url_has_javascript", { url }).flush();
      throw new Error(
        `Invalid redirect url: ${url} - must be fully qualified url`,
      );
    }
  }

  return redir(url, window.top);
}

export const getButtonType = (
  getPageUrl: () => ZalgoPromise<string>,
): ZalgoPromise<string> => {
  return getPageUrl().then((pageUrl) => {
    const domain = getDomainFromUrl(pageUrl);
    if (window.xprops.hostedButtonId) {
      if (domain.match(getPayPalDomainRegex())) {
        if (pageUrl.match(/qrcode/)) {
          return "ncp_qr_code";
        } else {
          return "ncp_payment_link";
        }
      } else {
        return "ncp_button_code";
      }
    }
    return "iframe";
  });
};
