/* @flow */
import { FUNDING } from "@paypal/sdk-constants/src";

export const checkUlsatNotRequired = (
  paymentSource: $Values<typeof FUNDING> | null,
  buyerAccessToken: ?string,
): boolean => paymentSource === FUNDING.VENMO && !buyerAccessToken;
