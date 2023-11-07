/* @flow */
/* eslint require-await: off, max-lines: off, max-nested-callbacks: off */

import { wrapPromise, uniqueID } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { FUNDING, COUNTRY } from "@paypal/sdk-constants/src";

import { areArraysIdentical } from "./util";
import {
  mockAsyncProp,
  createButtonHTML,
  getGraphQLApiMock,
  DEFAULT_FUNDING_ELIGIBILITY,
  mockFunction,
  clickButton,
  mockSetupButton,
} from "./mocks";

describe("onShippingAddressChange", () => {
  const amount = {
    currencyCode: "USD",
    value: "200.00",
    breakdown: {
      itemTotal: {
        currencyCode: "USD",
        value: "180.00",
      },
      shipping: {
        currencyCode: "USD",
        value: "5.00",
      },
      handling: {
        currencyCode: "USD",
        value: "1.00",
      },
      taxTotal: {
        currencyCode: "USD",
        value: "20.00",
      },
      discount: {
        currencyCode: "USD",
        value: "10.00",
      },
    },
  };

  const shippingAddress = {
    city: "San Jose",
    state: "CA",
    countryCode: "US",
    postalCode: "11111",
  };

  const taxTotal = "20.00";
  const shippingDiscount = "10.00";

  const shippingOptions = [
    {
      id: "SHIP_1234",
      label: "Free Shipping",
      type: "SHIPPING",
      selected: true,
      amount: {
        value: "0.00",
        currencyCode: "USD",
      },
    },
    {
      id: "SHIP_123",
      label: "Shipping",
      type: "SHIPPING",
      selected: false,
      amount: {
        value: "20.00",
        currencyCode: "USD",
      },
    },
    {
      id: "SHIP_124",
      label: "Overnight",
      type: "SHIPPING",
      selected: false,
      amount: {
        value: "40.00",
        currencyCode: "USD",
      },
    },
  ];

  it("should update tax, shipping discount and shipping options, and provide query when address changes for server-side integrations", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      const orderID = uniqueID();
      const accessToken = uniqueID();
      const payerID = "YYYYYYYYYY";
      const facilitatorAccessToken = uniqueID();

      const getCheckoutDetails = getGraphQLApiMock({
        extraHandler: expect("upgradeLSATGQLCall", ({ data }) => {
          if (data.query.includes("query GetCheckoutDetails")) {
            return {
              data: {
                checkoutSession: {
                  cart: {
                    intent: "capture",
                    amounts: {
                      total: {
                        currencyCode: "USD",
                      },
                    },
                    shippingMethods: [
                      {
                        id: "SHIP_1234",
                        label: "Free Shipping",
                        type: "SHIPPING",
                        selected: true,
                        amount: {
                          value: "0.00",
                          currency_code: "USD",
                        },
                      },
                      {
                        id: "SHIP_123",
                        label: "Shipping",
                        type: "SHIPPING",
                        selected: false,
                        amount: {
                          value: "20.00",
                          currency_code: "USD",
                        },
                      },
                      {
                        id: "SHIP_124",
                        label: "Overnight",
                        type: "SHIPPING",
                        selected: false,
                        amount: {
                          value: "40.00",
                          currency_code: "USD",
                        },
                      },
                    ],
                  },
                  payees: [
                    {
                      merchantId: "XYZ12345",
                      email: {
                        stringValue: "xyz-us-b1@paypal.com",
                      },
                    },
                  ],
                },
              },
            };
          }
        }),
      }).expectCalls();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return ZalgoPromise.try(() => {
            return orderID;
          });
        }),
      );

      window.xprops.onShippingAddressChange = mockAsyncProp(
        expect("onShippingAddressChange", async (data, actions) => {
          const query = await actions.buildOrderPatchPayload({
            taxTotal,
            shippingOptions,
            shippingDiscount,
          });
          const expectedQuery = [
            {
              op: "replace",
              path: "/purchase_units/@reference_id=='default'/amount",
              value: {
                value: "181.00",
                currency_code: "USD",
                breakdown: {
                  item_total: { currency_code: "USD", value: "180.00" },
                  shipping: { currency_code: "USD", value: "0.00" },
                  handling: { currency_code: "USD", value: "1.00" },
                  tax_total: { currency_code: "USD", value: "20.00" },
                  discount: { currency_code: "USD", value: "10.00" },
                  shipping_discount: { currency_code: "USD", value: "10.00" },
                },
              },
            },
            {
              op: "replace",
              path: "/purchase_units/@reference_id=='default'/shipping/options",
              value: [
                {
                  id: "SHIP_1234",
                  label: "Free Shipping",
                  type: "SHIPPING",
                  selected: true,
                  amount: { value: "0.00", currency_code: "USD" },
                },
                {
                  id: "SHIP_123",
                  label: "Shipping",
                  type: "SHIPPING",
                  selected: false,
                  amount: { value: "20.00", currency_code: "USD" },
                },
                {
                  id: "SHIP_124",
                  label: "Overnight",
                  type: "SHIPPING",
                  selected: false,
                  amount: { value: "40.00", currency_code: "USD" },
                },
              ],
            },
          ];

          if (!areArraysIdentical(expectedQuery, query)) {
            throw new Error(
              `Expected query, ${JSON.stringify(
                query,
              )}, to be, ${JSON.stringify(expectedQuery)}`,
            );
          }
        }),
      );

      mockFunction(
        window.paypal,
        "Checkout",
        expect("Checkout", ({ original: CheckoutOriginal, args: [props] }) => {
          props.onAuth({ accessToken });
          mockFunction(
            props,
            "onApprove",
            expect(
              "onApprove",
              ({ original: onApproveOriginal, args: [data, actions] }) => {
                return onApproveOriginal({ ...data, payerID }, actions);
              },
            ),
          );

          const checkoutInstance = CheckoutOriginal(props);

          mockFunction(
            checkoutInstance,
            "renderTo",
            expect("renderTo", async ({ original: renderToOriginal, args }) => {
              return props.createOrder().then((id) => {
                if (id !== orderID) {
                  throw new Error(
                    `Expected orderID to be ${orderID}, got ${id}`,
                  );
                }

                return renderToOriginal(...args).then(() => {
                  return props.onShippingAddressChange(
                    {
                      orderID,
                      amount,
                      shippingAddress,
                    },
                    { reject: avoid("reject") },
                  );
                });
              });
            }),
          );

          return checkoutInstance;
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        facilitatorAccessToken,
        merchantID: ["XYZ12345"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
        personalization: {},
        buyerCountry: COUNTRY.US,
      });

      await clickButton(FUNDING.PAYPAL);
      getCheckoutDetails.done();
    });
  });

  it("should not update tax amount and shipping options, or patch when address changes and there is an error", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      const orderID = uniqueID();
      const accessToken = uniqueID();
      const payerID = "YYYYYYYYYY";
      const facilitatorAccessToken = uniqueID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return ZalgoPromise.try(() => {
            return orderID;
          });
        }),
      );

      window.xprops.onShippingAddressChange = mockAsyncProp(
        expect("onShippingAddressChange", async (callbackData, actions) => {
          const patchShippingMock = getGraphQLApiMock({
            extraHandler: avoid("UpdateShippingCall", ({ data }) => {
              if (data.query.includes("UpdateShipping")) {
                throw new Error(`Expected error...`);
              }
            }),
          });

          const query = await actions.buildOrderPatchPayload();
          if (query && query.length > 0) {
            throw new Error(
              `Expected query to be an empty array but was, ${JSON.stringify(
                query,
              )}`,
            );
          }
          patchShippingMock.done();
        }),
      );

      mockFunction(
        window.paypal,
        "Checkout",
        expect("Checkout", ({ original: CheckoutOriginal, args: [props] }) => {
          props.onAuth({ accessToken });
          mockFunction(
            props,
            "onApprove",
            expect(
              "onApprove",
              ({ original: onApproveOriginal, args: [data, actions] }) => {
                return onApproveOriginal({ ...data, payerID }, actions);
              },
            ),
          );

          const checkoutInstance = CheckoutOriginal(props);

          mockFunction(
            checkoutInstance,
            "renderTo",
            expect("renderTo", async ({ original: renderToOriginal, args }) => {
              return props.createOrder().then((id) => {
                if (id !== orderID) {
                  throw new Error(
                    `Expected orderID to be ${orderID}, got ${id}`,
                  );
                }

                return renderToOriginal(...args).then(() => {
                  return props.onShippingAddressChange(
                    {
                      orderID,
                      amount,
                      shippingAddress,
                    },
                    { reject: avoid("reject") },
                  );
                });
              });
            }),
          );

          return checkoutInstance;
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        facilitatorAccessToken,
        merchantID: ["XYZ12345"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
        personalization: {},
        buyerCountry: COUNTRY.US,
      });

      await clickButton(FUNDING.PAYPAL);
    });
  });

  it("should allow merchant to pass back specified error to application through sdk for display", async () => {
    return await wrapPromise(async ({ expect }) => {
      const orderID = uniqueID();
      const accessToken = uniqueID();
      const payerID = "YYYYYYYYYY";
      const facilitatorAccessToken = uniqueID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return ZalgoPromise.try(() => {
            return orderID;
          });
        }),
      );

      window.xprops.onShippingAddressChange = mockAsyncProp(
        expect("onShippingAddressChange", async (data, actions) => {
          actions.reject(data.errors.ADDRESS_ERROR);
        }),
      );

      mockFunction(
        window.paypal,
        "Checkout",
        expect("Checkout", ({ original: CheckoutOriginal, args: [props] }) => {
          props.onAuth({ accessToken });
          mockFunction(
            props,
            "onApprove",
            expect(
              "onApprove",
              ({ original: onApproveOriginal, args: [data, actions] }) => {
                return onApproveOriginal({ ...data, payerID }, actions);
              },
            ),
          );

          const checkoutInstance = CheckoutOriginal(props);

          mockFunction(
            checkoutInstance,
            "renderTo",
            expect("renderTo", async ({ original: renderToOriginal, args }) => {
              return props.createOrder().then((id) => {
                if (id !== orderID) {
                  throw new Error(
                    `Expected orderID to be ${orderID}, got ${id}`,
                  );
                }

                return renderToOriginal(...args).then(() => {
                  return props.onShippingAddressChange(
                    {
                      orderID,
                      amount,
                      shippingAddress,
                    },
                    {
                      reject: expect("reject", (error) => {
                        const expectedError = `Your order can't be shipped to this address.`;

                        if (error !== expectedError) {
                          throw new Error(
                            `Expected error message to be, ${expectedError}, but was ${error}`,
                          );
                        }
                      }),
                    },
                  );
                });
              });
            }),
          );

          return checkoutInstance;
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        facilitatorAccessToken,
        merchantID: ["XYZ12345"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
        personalization: {},
        buyerCountry: COUNTRY.US,
      });

      await clickButton(FUNDING.PAYPAL);
    });
  });

  it("should return generic error message if merchant sends unapproved one", async () => {
    return await wrapPromise(async ({ expect }) => {
      const orderID = uniqueID();
      const accessToken = uniqueID();
      const payerID = "YYYYYYYYYY";
      const facilitatorAccessToken = uniqueID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return ZalgoPromise.try(() => {
            return orderID;
          });
        }),
      );

      window.xprops.onShippingAddressChange = mockAsyncProp(
        expect("onShippingAddressChange", async (data, actions) => {
          actions.reject("This is crazy!");
        }),
      );

      mockFunction(
        window.paypal,
        "Checkout",
        expect("Checkout", ({ original: CheckoutOriginal, args: [props] }) => {
          props.onAuth({ accessToken });
          mockFunction(
            props,
            "onApprove",
            expect(
              "onApprove",
              ({ original: onApproveOriginal, args: [data, actions] }) => {
                return onApproveOriginal({ ...data, payerID }, actions);
              },
            ),
          );

          const checkoutInstance = CheckoutOriginal(props);

          mockFunction(
            checkoutInstance,
            "renderTo",
            expect("renderTo", async ({ original: renderToOriginal, args }) => {
              return props.createOrder().then((id) => {
                if (id !== orderID) {
                  throw new Error(
                    `Expected orderID to be ${orderID}, got ${id}`,
                  );
                }

                return renderToOriginal(...args).then(() => {
                  return props.onShippingAddressChange(
                    {
                      orderID,
                      amount,
                      shippingAddress,
                    },
                    {
                      reject: expect("reject", (error) => {
                        const expectedError =
                          "Unable to update address. Please try again.";

                        if (error !== expectedError) {
                          throw new Error(
                            `Expected error message to be, ${expectedError}, but was ${error}`,
                          );
                        }
                      }),
                    },
                  );
                });
              });
            }),
          );

          return checkoutInstance;
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        facilitatorAccessToken,
        merchantID: ["XYZ12345"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
        personalization: {},
        buyerCountry: COUNTRY.US,
      });

      await clickButton(FUNDING.PAYPAL);
    });
  });
});
