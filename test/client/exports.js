/* @flow */
import { wrapPromise, uniqueID } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import {
  FUNDING,
  CARD,
  INTENT,
  WALLET_INSTRUMENT,
} from "@paypal/sdk-constants/src";

import {
  getBuyerAccessToken,
  setBuyerAccessToken,
} from "../../src/lib/session";
import { getLsatUpgradeError } from "../../src/api";

import {
  MOCK_BUYER_ACCESS_TOKEN,
  getGraphQLApiMock,
  mockSetupButton,
  mockAsyncProp,
  generateOrderID,
  clickButton,
  createButtonHTML,
  DEFAULT_FUNDING_ELIGIBILITY,
} from "./mocks";

describe("exports cases", () => {
  it("should return facilitator access token", () => {
    const facilitatorAccessToken = "QQQ123000";

    mockSetupButton({ facilitatorAccessToken }).then(() => {
      const exportedFacilitatorAccessToken = window.exports
        .paymentSession()
        .getFacilitatorAccessToken();
      if (facilitatorAccessToken !== exportedFacilitatorAccessToken) {
        throw new Error(
          `Expected ${exportedFacilitatorAccessToken} from exports.paymentSession().getFacilitatorAccessToken() to be ${facilitatorAccessToken}`,
        );
      }
    });
  });

  it("should handle upgrade from exports.paymentSession().upgradeFacilitatorAccessToken()", async () => {
    // upgradeFacilitatorAccessToken
    const facilitatorAccessToken = "QQQ123000";

    const gqlMock = getGraphQLApiMock({
      extraHandler: ({ data }) => {
        if (data.query.includes("mutation UpgradeFacilitatorAccessToken")) {
          if (!data.variables.facilitatorAccessToken) {
            throw new Error(`We haven't received the facilitatorAccessToken`);
          }

          if (!data.variables.buyerAccessToken) {
            throw new Error(`We haven't received the buyer's access token`);
          }

          if (!data.variables.orderID) {
            throw new Error(`We haven't received the orderID`);
          }

          return {
            data: {
              upgradeLowScopeAccessToken: true,
            },
          };
        }
      },
    }).expectCalls();

    setBuyerAccessToken(MOCK_BUYER_ACCESS_TOKEN);

    await mockSetupButton({ facilitatorAccessToken });

    try {
      await window.exports
        .paymentSession()
        .upgradeFacilitatorAccessToken({
          facilitatorAccessToken,
          orderID: "asdf4321",
        });
    } catch {
      throw new Error("Failed to upgrade LSAT");
    }

    gqlMock.done();
  });

  it("should clear error state for upgradeFacilitatorAccessToken() on retry", async () => {
    // upgradeFacilitatorAccessToken
    const facilitatorAccessToken = "QQQ123000";

    const gqlMock = getGraphQLApiMock({
      extraHandler: ({ data }) => {
        if (data.query.includes("mutation UpgradeFacilitatorAccessToken")) {
          if (!data.variables.facilitatorAccessToken) {
            throw new Error(`We haven't received the facilitatorAccessToken`);
          }

          if (data.variables.buyerAccessToken === "INVALID_BUYER_TOKEN") {
            throw new Error(`Buyer's access token is invalid`);
          }

          if (!data.variables.orderID) {
            throw new Error(`We haven't received the orderID`);
          }

          return {
            data: {
              upgradeLowScopeAccessToken: true,
            },
          };
        }
      },
    }).expectCalls();

    setBuyerAccessToken("INVALID_BUYER_TOKEN");

    await mockSetupButton({ facilitatorAccessToken });

    try {
      await window.exports
        .paymentSession()
        .upgradeFacilitatorAccessToken({
          facilitatorAccessToken,
          orderID: "asdf4321",
        });
      throw new Error(`upgradeFacilitatorAccessToken should have failed`);
    } catch {
      // no-op error is expected
    }
    if (!getLsatUpgradeError()) {
      throw new Error(`Expected LSAT Upgrade Error to be set`);
    }

    setBuyerAccessToken(MOCK_BUYER_ACCESS_TOKEN);
    try {
      await window.exports
        .paymentSession()
        .upgradeFacilitatorAccessToken({
          facilitatorAccessToken,
          orderID: "asdf4321",
        });
    } catch {
      throw new Error("Failed to upgrade LSAT");
    }
    if (getLsatUpgradeError()) {
      throw new Error(`Expected LSAT Upgrade Error to be empty`);
    }
    gqlMock.done();
  });

  it("should handle error from exports.paymentSession().upgradeFacilitatorAccessToken()", async () => {
    const facilitatorAccessToken = "QQQ123000";

    setBuyerAccessToken(undefined);

    await mockSetupButton({ facilitatorAccessToken });

    try {
      await window.exports
        .paymentSession()
        .upgradeFacilitatorAccessToken({
          facilitatorAccessToken,
          orderID: "asdf4321",
        });
    } catch (error) {
      const err = new Error("Buyer access token not found");
      if (error.message !== err.message) {
        throw new Error(`Expected ${error.message} to be ${err.message}`);
      }
    }
  });

  it("should render PayPal button, click the button, and store buyer access token", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      const orderID = generateOrderID();
      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", () => {
          return ZalgoPromise.try(() => {
            return orderID;
          });
        }),
      );

      window.xprops.onCancel = avoid("onCancel");

      createButtonHTML();

      await mockSetupButton({
        merchantID: ["XYZ12345ABC"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
      });

      await clickButton(FUNDING.PAYPAL);

      const buyerAccessToken = getBuyerAccessToken() || "";
      if (buyerAccessToken !== MOCK_BUYER_ACCESS_TOKEN) {
        throw new Error(
          `Expected buyerAccessToken to be ${buyerAccessToken}, but got ${MOCK_BUYER_ACCESS_TOKEN}`,
        );
      }
    });
  });

  it("should render a card button, click the button, and store buyer access token", async () => {
    return await wrapPromise(async ({ expect }) => {
      const orderID = generateOrderID();
      const userIDToken = uniqueID();
      const tokenID = uniqueID();
      const accessToken = uniqueID();
      const instrumentID = tokenID;
      const paymentMethodID = tokenID;
      const payerID = "payerID";

      window.xprops.userIDToken = userIDToken;
      window.xprops.paymentMethodID = "test";
      window.xprops.paymentMethodNonce = paymentMethodID;
      window.xprops.paymentMethodToken = paymentMethodID;
      window.xprops.branded = true;

      const wallet = {
        [FUNDING.CARD]: {
          instruments: [
            {
              type: WALLET_INSTRUMENT.CARD,
              instrumentID,
              tokenID,
              branded: true,
              oneClick: true,
              accessToken,
            },
          ],
        },
      };

      const fundingEligibility = {
        [FUNDING.CARD]: {
          eligible: true,
          branded: false,
          vendors: {
            [CARD.VISA]: {
              eligible: true,
            },
          },
        },
      };

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", () => {
          return orderID;
        }),
      );

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
          if (data.query.includes("query GetSmartWallet")) {
            if (data.variables.userIDToken !== userIDToken) {
              throw new Error(`Expected correct userIdToken`);
            }

            return {
              data: {
                smartWallet: {
                  ...wallet,
                },
              },
            };
          }

          if (data.query.includes("query GetCheckoutDetails")) {
            return {
              data: {
                checkoutSession: {
                  cart: {
                    intent: INTENT.CAPTURE,
                    amounts: {
                      total: {
                        currencyCode: "USD",
                      },
                    },
                    shippingAddress: {
                      isFullAddress: false,
                    },
                  },
                  flags: {
                    isChangeShippingAddressAllowed: false,
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

          if (data.query.includes("mutation ApprovePaymentWithNonce")) {
            return {
              data: {
                approvePaymentWithNonce: {
                  buyer: {
                    userId: payerID,
                    auth: {
                      accessToken: "def123xxxyyyzzz456",
                    },
                  },
                },
              },
            };
          }
        },
      });

      createButtonHTML({ wallet, fundingEligibility });
      await mockSetupButton({
        merchantID: [uniqueID()],
        wallet,
        fundingEligibility,
      });

      await clickButton(FUNDING.CARD);

      const buyerAccessToken = getBuyerAccessToken() || "";
      if (buyerAccessToken !== MOCK_BUYER_ACCESS_TOKEN) {
        throw new Error(
          `Expected buyerAccessToken to be ${buyerAccessToken}, but got ${MOCK_BUYER_ACCESS_TOKEN}`,
        );
      }

      gqlMock.done();
    });
  });

  it("should return guestEnabled status from exports.isGuestEnabled()", async () => {
    const guestEnabled = true;

    await mockSetupButton({
      fundingEligibility: {
        card: {
          guestEnabled,
          eligible: true,
          branded: false,
          vendors: {},
        },
      },
    });

    let guestEnabledStatus;
    try {
      guestEnabledStatus = await window.exports.isGuestEnabled();
    } catch {
      throw new Error("Failed to get guestEnabled status");
    }

    if (guestEnabledStatus !== guestEnabled) {
      throw new Error(
        `Expected guestEnabled status to be ${String(
          guestEnabled,
        )}, but got ${guestEnabledStatus}`,
      );
    }
  });

  it("should return guestEnabled status from exports.isGuestEnabled() if missing on fundingEligibility", async () => {
    const guestEnabled = true;

    const gqlMock = getGraphQLApiMock({
      extraHandler: ({ data }) => {
        if (data.query.includes("query GetFundingEligibility")) {
          if (!data.variables.merchantID) {
            throw new Error(`We haven't received the merchantID`);
          }

          return {
            data: {
              fundingEligibility: {
                card: {
                  guestEnabled,
                },
              },
            },
          };
        }
      },
    }).expectCalls();

    await mockSetupButton();

    let guestEnabledStatus;
    try {
      guestEnabledStatus = await window.exports.isGuestEnabled();
    } catch {
      throw new Error("Failed to get guestEnabled status");
    }

    if (guestEnabledStatus !== guestEnabled) {
      throw new Error(
        `Expected guestEnabled status to be ${String(
          guestEnabled,
        )}, but got ${guestEnabledStatus}`,
      );
    }

    gqlMock.done();
  });

  it("should throw error from exports.isGuestEnabled() if missing guestEnabled status", async () => {
    const gqlMock = getGraphQLApiMock({
      extraHandler: ({ data }) => {
        if (data.query.includes("query GetFundingEligibility")) {
          if (!data.variables.merchantID) {
            throw new Error(`We haven't received the merchantID`);
          }

          return {
            data: undefined,
          };
        }
      },
    }).expectCalls();

    await mockSetupButton();

    let guestEnabledStatus;
    try {
      guestEnabledStatus = await window.exports.isGuestEnabled();
    } catch (err) {
      const message =
        "GraphQL fundingEligibility returned no fundingEligibility object";
      if (err.message !== message) {
        throw new Error(`Expected ${err.message} to be ${message}`);
      }
    }

    if (guestEnabledStatus !== undefined) {
      throw new Error(
        `Expected guestEnabled status to be undefined, but got ${guestEnabledStatus}`,
      );
    }

    gqlMock.done();
  });

  it("should return false from exports.isShippingChangeEnabled()", async () => {
    const hasOSC = false;

    await mockSetupButton();

    let hasOnShippingChange;
    try {
      hasOnShippingChange = await window.exports.isShippingChangeEnabled();
    } catch {
      throw new Error("Failed to get guestEnabled status");
    }

    if (hasOnShippingChange !== hasOSC) {
      throw new Error(
        `Expected guestEnabled status to be ${String(
          hasOSC,
        )}, but got ${hasOnShippingChange}`,
      );
    }
  });

  it("should return true from exports.isShippingChangeEnabled()", async () => {
    const hasOSC = true;
    window.xprops.onShippingChange = () =>
      ZalgoPromise.try(() => {
        return "anything";
      });

    await mockSetupButton();

    let hasOnShippingChange;
    try {
      hasOnShippingChange = await window.exports.isShippingChangeEnabled();
    } catch {
      throw new Error("Failed to get guestEnabled status");
    }

    if (hasOnShippingChange !== hasOSC) {
      throw new Error(
        `Expected guestEnabled status to be ${String(
          hasOSC,
        )}, but got ${hasOnShippingChange}`,
      );
    }
  });

  it("should call merchant createOrder via exports createOrder", async () => {
    return await wrapPromise(async ({ expect }) => {
      const orderID = generateOrderID();
      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", () => {
          return ZalgoPromise.try(() => {
            return orderID;
          });
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        merchantID: ["XYZ12345ABC"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
      });

      window.exports.paymentSession().createOrder();
    });
  });

  it("should call merchant onApprove via exports onApprove", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", () => {
          return ZalgoPromise.try(() => {
            return null;
          });
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        merchantID: ["XYZ12345ABC"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
      });

      window.exports.paymentSession().onApprove({ payerID: "XXYYZZ123456" });
    });
  });

  it("should call merchant onCancel via exports onCancel", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.onCancel = mockAsyncProp(
        expect("onCancel", () => {
          return ZalgoPromise.try(() => {
            return null;
          });
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        merchantID: ["XYZ12345ABC"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
      });

      window.exports.paymentSession().onCancel();
    });
  });

  it("should call merchant onError via exports onError", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.onError = mockAsyncProp(
        expect("onError", () => {
          return ZalgoPromise.try(() => {
            return null;
          });
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        merchantID: ["XYZ12345ABC"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
      });

      window.exports.paymentSession().onError();
    });
  });

  it("should call merchant onShippingChange via exports onShippingChange", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.onShippingChange = mockAsyncProp(
        expect("onShippingChange", () => {
          return ZalgoPromise.try(() => {
            return null;
          });
        }),
      );

      createButtonHTML();

      await mockSetupButton({
        merchantID: ["XYZ12345ABC"],
        fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY,
        buyerAccessToken: MOCK_BUYER_ACCESS_TOKEN,
      });

      window.exports.paymentSession().onShippingChange({
        orderID: "00000000XXYYZZ000",
        paymentToken: "00000000XXYYZZ000",
        paymentId: "PAYID-00000000XXYYZZ00000000AB",
        selected_shipping_option: null,
      });
    });
  });
});
