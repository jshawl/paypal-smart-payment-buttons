/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { memoize } from "@krakenjs/belter/src";
import { FUNDING } from "@paypal/sdk-constants/src";

type PaymentSource = $Values<typeof FUNDING>;

export type XCreateOrderDataType = {|
  paymentSource: PaymentSource,
|};

export type XCreateOrder = ?(XCreateOrderDataType) => ZalgoPromise<string>;
export type CreateOrder = () => ZalgoPromise<string>;

type CreateOrderXProps = {|
  createOrder: ?XCreateOrder,
|};

export function getCreateOrder({
  createOrder,
}: CreateOrderXProps): ?CreateOrder {
  if (!createOrder) {
    return;
  }

  return memoize(() => {
    return ZalgoPromise.try(() => {
      return createOrder({ paymentSource: FUNDING.CARD });
    }).then((orderID) => {
      if (!orderID || typeof orderID !== "string") {
        throw new Error(`Expected an order id to be passed`);
      }

      if (orderID.includes("PAY-") || orderID.includes("PAYID-")) {
        throw new Error(
          `Do not pass PAY-XXX or PAYID-XXX directly into createOrder. Pass the EC-XXX token instead`,
        );
      }

      return orderID;
    });
  });
}
