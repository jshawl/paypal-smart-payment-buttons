/* @flow */
/* eslint require-await: off, max-lines: off, max-nested-callbacks: off */

import { wrapPromise } from "@krakenjs/belter/src";
import { FUNDING, INTENT } from "@paypal/sdk-constants/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { EXPERIMENTAL_POPUP_DIMENSIONS } from "../../src/payment-flows/checkout";

import {
  mockSetupButton,
  mockAsyncProp,
  createButtonHTML,
  getValidatePaymentMethodApiMock,
  getConfirmOrderApiMock,
  clickButton,
  getGraphQLApiMock,
  generateOrderID,
  mockMenu,
  clickMenu,
  getMockWindowOpen,
  DEFAULT_FUNDING_ELIGIBILITY,
} from "./mocks";

const fundingEligibilityPayPalVaulted = {
  [FUNDING.PAYPAL]: {
    eligible: true,
    branded: true,
    vaultable: true,
  },
};

const fundingEligibilityPayPalNotVaulted = {
  [FUNDING.PAYPAL]: {
    eligible: true,
    branded: true,
    vaultable: false,
  },
};

describe("vault cases", () => {
  it("should set up a new forced-vaulted funding source", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.vault = true;
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let enableVaultCalled = false;

      const gqlMock = getGraphQLApiMock({
        extraHandler: expect("graphqlCall", ({ data }) => {
          if (!data.query.includes("mutation EnableVault")) {
            return;
          }

          // CCO Data on enable vault
          if (
            !data.variables.clientConfig.productFlow ||
            !data.variables.clientConfig.fundingSource ||
            !data.variables.clientConfig.integrationArtifact ||
            !data.variables.clientConfig.userExperienceFlow ||
            !data.variables.clientConfig.productFlow ||
            !data.variables.clientConfig.buttonSessionID
          ) {
            return {};
          }

          enableVaultCalled = true;
          return {};
        }),
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async () => {
          gqlMock.done();

          if (!enableVaultCalled) {
            throw new Error(`Expected graphql call with enableVault mutation`);
          }
        }),
      );
      const fundingEligibility = fundingEligibilityPayPalVaulted;
      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
    });
  });

  it("should set up a new forced-vaulted funding source, and work even if paypal is not vaultable", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      window.xprops.vault = true;
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      window.xprops.onApprove = expect("onApprove");

      const fundingEligibility = fundingEligibilityPayPalNotVaulted;
      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL).catch(avoid("clickCatch"));
    });
  });

  it("should set up a new optionally-vaulted funding source", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let enableVaultCalled = false;

      const gqlMock = getGraphQLApiMock({
        extraHandler: expect("graphqlCall", ({ data }) => {
          if (data.query.includes("mutation EnableVault")) {
            enableVaultCalled = true;
            return {};
          }

          if (data.query.includes("query GetFundingEligibility")) {
            return {
              data: {
                fundingEligibility: {
                  paypal: {
                    vaultable: true,
                  },
                },
              },
            };
          }
        }),
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async () => {
          gqlMock.done();

          if (!enableVaultCalled) {
            throw new Error(`Expected graphql call with enableVault mutation`);
          }
        }),
      );

      const fundingEligibility = fundingEligibilityPayPalVaulted;

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
    });
  });

  it("should not call enableVault mutation if both id token and client token passed in", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";
      window.xprops.userIDToken = "abc-123";

      const orderID = generateOrderID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let enableVaultCalled = false;

      const gqlMock = getGraphQLApiMock({
        extraHandler: expect("graphqlCall", ({ data }) => {
          if (data.query.includes("mutation EnableVault")) {
            enableVaultCalled = true;
            return {};
          }

          if (data.query.includes("query GetFundingEligibility")) {
            return {
              data: {
                fundingEligibility: {
                  paypal: {
                    vaultable: true,
                  },
                },
              },
            };
          }
        }),
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async () => {
          gqlMock.done();

          if (enableVaultCalled) {
            throw new Error(`EnableVault mutation should not have been called`);
          }
        }),
      );

      const fundingEligibility = fundingEligibilityPayPalVaulted;

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
    });
  });

  it("should not set up a new optionally-vaulted funding source when vaulting is not eligible", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let enableVaultCalled = false;

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
          if (data.query.includes("mutation EnableVault")) {
            enableVaultCalled = true;
            return {};
          }

          if (data.query.includes("query GetFundingEligibility")) {
            return {
              data: {
                fundingEligibility: {
                  paypal: {
                    vaultable: false,
                  },
                },
              },
            };
          }
        },
      }).enable();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async () => {
          gqlMock.disable();

          if (enableVaultCalled) {
            throw new Error(
              `Expected graphql to not be called with enableVault mutation`,
            );
          }
        }),
      );

      const fundingEligibility = fundingEligibilityPayPalNotVaulted;
      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
    });
  });

  it("should continue with a one time payment for a new optionally-vaulted funding source when enableVault errors out", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let enableVaultCalled = false;

      const gqlMock = getGraphQLApiMock({
        extraHandler: expect("graphqlCall", ({ data }) => {
          if (data.query.includes("mutation EnableVault")) {
            enableVaultCalled = true;
            return {
              errors: [
                {
                  message: "enableVault intentionally failed",
                },
              ],
            };
          }

          if (data.query.includes("query GetFundingEligibility")) {
            return {
              data: {
                fundingEligibility: {
                  paypal: {
                    vaultable: true,
                  },
                },
              },
            };
          }
        }),
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async () => {
          gqlMock.done();

          if (!enableVaultCalled) {
            throw new Error(`Expected graphql call with enableVault mutation`);
          }
        }),
      );

      const fundingEligibility = fundingEligibilityPayPalVaulted;

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
    });
  });

  it("should pay with an existing vaulted paypal account with no shipping required", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
        },
      }).expectCalls();

      window.paypal.Menu = expect("Menu", mockMenu);

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();
      const confirmCall = getConfirmOrderApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
          confirmCall.done();
        }),
      );

      const fundingEligibility = {
        [FUNDING.PAYPAL]: {
          eligible: true,
          branded: true,
          vaultedInstruments: [
            {
              id: paymentMethodID,
              label: {
                description: "foo@bar.com",
              },
            },
          ],
        },
      };

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
      gqlMock.done();
    });
  });

  it("should pay with an existing vaulted card with no shipping required", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      window.xprops.clientAccessToken = "abc-123";

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
        },
      }).expectCalls();

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.paypal.Menu = expect("Menu", mockMenu);

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();
      const confirmCall = getConfirmOrderApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
          confirmCall.done();
        }),
      );

      const fundingEligibility = {
        ...DEFAULT_FUNDING_ELIGIBILITY,
        [FUNDING.CARD]: {
          eligible: true,
          branded: true,
          vendors: {
            visa: {
              eligible: true,
              vaultedInstruments: [
                {
                  id: paymentMethodID,
                  label: {
                    description: "Visa x-1234",
                  },
                },
              ],
            },
          },
        },
      };

      window.paypal.Checkout = avoid("Checkout", window.paypal.Checkout);

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.CARD);
      gqlMock.done();
      confirmCall.done();
    });
  });

  it("should pay with an existing vaulted card with installments", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      window.xprops.clientAccessToken = "abc-123";

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
        },
      }).expectCalls();

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.paypal.Menu = expect("Menu", mockMenu);

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();
      const confirmCall = getConfirmOrderApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
          confirmCall.done();
        }),
      );

      const fundingEligibility = {
        ...DEFAULT_FUNDING_ELIGIBILITY,
        [FUNDING.CARD]: {
          eligible: true,
          branded: true,
          installments: true,
          vendors: {
            visa: {
              eligible: true,
              vaultedInstruments: [
                {
                  id: paymentMethodID,
                  label: {
                    description: "Visa x-1234",
                  },
                },
              ],
            },
          },
        },
      };

      window.paypal.Checkout = avoid("Checkout", window.paypal.Checkout);

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.CARD);
      gqlMock.done();
      vpmCall.done();
      confirmCall.done();
    });
  });

  it("should pay with an existing vaulted paypal account with shipping required but address passed", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
                      isFullAddress: true,
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
        },
      }).expectCalls();

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.paypal.Menu = expect("Menu", mockMenu);

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();
      const confirmCall = getConfirmOrderApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          confirmCall.done();
          vpmCall.done();
        }),
      );

      const fundingEligibility = {
        [FUNDING.PAYPAL]: {
          eligible: true,
          branded: true,
          vaultedInstruments: [
            {
              id: paymentMethodID,
              label: {
                description: "foo@bar.com",
              },
            },
          ],
        },
      };

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
      gqlMock.done();
    });
  });

  it("should pay with an existing vaulted card with shipping required but address passed", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      window.xprops.clientAccessToken = "abc-123";

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
                      isFullAddress: true,
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
        },
      }).expectCalls();

      window.paypal.Menu = expect("Menu", mockMenu);

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();
      const confirmCall = getConfirmOrderApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
          confirmCall.done();
        }),
      );

      const fundingEligibility = {
        ...DEFAULT_FUNDING_ELIGIBILITY,
        [FUNDING.CARD]: {
          eligible: true,
          branded: true,
          vendors: {
            visa: {
              eligible: true,
              vaultedInstruments: [
                {
                  id: paymentMethodID,
                  label: {
                    description: "Visa x-1234",
                  },
                },
              ],
            },
          },
        },
      };

      window.paypal.Checkout = avoid("Checkout", window.paypal.Checkout);

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.CARD);
      gqlMock.done();
    });
  });

  it("should pay with an existing vaulted paypal account with shipping required and fall back to checkout", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
                    isChangeShippingAddressAllowed: true,
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
        },
      }).expectCalls();

      window.paypal.Menu = expect("Menu", mockMenu);

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
        }),
      );

      const fundingEligibility = {
        [FUNDING.PAYPAL]: {
          eligible: true,
          branded: true,
          vaultedInstruments: [
            {
              id: paymentMethodID,
              label: {
                description: "foo@bar.com",
              },
            },
          ],
        },
      };

      window.paypal.Checkout = expect("Checkout", window.paypal.Checkout);

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
      gqlMock.done();
    });
  });

  it("should pay with an existing vaulted card with shipping required and error out", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      window.xprops.clientAccessToken = "abc-123";

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
                    isChangeShippingAddressAllowed: true,
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
        },
      }).expectCalls();

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.paypal.Menu = expect("Menu", mockMenu);

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(avoid("onApprove"));

      const fundingEligibility = {
        ...DEFAULT_FUNDING_ELIGIBILITY,
        [FUNDING.CARD]: {
          eligible: true,
          branded: true,
          vendors: {
            visa: {
              eligible: true,
              vaultedInstruments: [
                {
                  id: paymentMethodID,
                  label: {
                    description: "Visa x-1234",
                  },
                },
              ],
            },
          },
        },
      };

      window.paypal.Checkout = avoid("Checkout", window.paypal.Checkout);

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.CARD).catch(expect("clickButtonCatch"));

      gqlMock.done();
      vpmCall.done();
    });
  });

  it("should pay with an existing vaulted paypal account but change FI using the menu", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const vpmCall = getValidatePaymentMethodApiMock().expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
        }),
      );

      const fundingEligibility = {
        [FUNDING.PAYPAL]: {
          eligible: true,
          branded: true,
          vaultedInstruments: [
            {
              id: paymentMethodID,
              label: {
                description: "foo@bar.com",
              },
            },
          ],
        },
      };

      getMockWindowOpen({ expectImmediateUrl: false });
      const win = window.open();

      const Checkout = window.paypal.Checkout;
      window.paypal.Checkout = expect("Checkout", (props) => {
        if (!props.window) {
          throw new Error(`Expected window to be passed`);
        }

        if (props.window !== win) {
          throw new Error(`Expected correct window to be passed`);
        }

        return Checkout(props);
      });

      const content = {
        payWithDifferentMethod: "Choose card or shipping",
      };

      window.paypal.Menu = expect("Menu", (initialMenuProps) => {
        if (!initialMenuProps.clientID) {
          throw new Error(`Expected initial menu props to contain clientID`);
        }

        return {
          renderTo: expect("menuRender", async (element) => {
            if (!element) {
              throw new Error(`Expected element to be passed`);
            }
          }),
          updateProps: expect("menuUpdateProps", async (menuProps) => {
            if (typeof menuProps.verticalOffset !== "number") {
              throw new TypeError(`Expected vertical offset to be passed`);
            }

            if (!Array.isArray(menuProps.choices)) {
              throw new TypeError(`Expected choices array to be passed`);
            }

            const choice = menuProps.choices.find(
              ({ label }) => label === content.payWithDifferentMethod,
            );

            if (!choice) {
              throw new Error(
                `Expected to find choose card or shipping button`,
              );
            }

            if (!choice.popup || !choice.popup.width || !choice.popup.height) {
              throw new Error(`Expected popup option to be passed`);
            }

            if (choice.popup.height !== EXPERIMENTAL_POPUP_DIMENSIONS.HEIGHT) {
              throw new Error(
                `Expected popup height to be ${EXPERIMENTAL_POPUP_DIMENSIONS.HEIGHT} but got ${choice.popup.height}`,
              );
            }

            if (choice.popup.width !== EXPERIMENTAL_POPUP_DIMENSIONS.WIDTH) {
              throw new Error(
                `Expected popup width to be ${EXPERIMENTAL_POPUP_DIMENSIONS.WIDTH} but got ${choice.popup.WIDTH}`,
              );
            }

            choice.onSelect({ win });
          }),
          hide: expect("hide", mockAsyncProp()),
          show: expect("show", mockAsyncProp()),
        };
      });

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({
        content,
        merchantID: ["XYZ12345"],
        fundingEligibility,
        experiments: { popupIncreaseDimensions: true },
      });

      await clickMenu(FUNDING.PAYPAL);
    });
  });

  it("should pay with an existing vaulted paypal account but pay with a different account using the menu", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }
        }),
      );

      const fundingEligibility = {
        [FUNDING.PAYPAL]: {
          eligible: true,
          branded: true,
          vaultedInstruments: [
            {
              id: paymentMethodID,
              label: {
                description: "foo@bar.com",
              },
            },
          ],
        },
      };

      getMockWindowOpen({ expectImmediateUrl: false });
      const win = window.open();

      const Checkout = window.paypal.Checkout;
      window.paypal.Checkout = expect("Checkout", (props) => {
        if (!props.window) {
          throw new Error(`Expected window to be passed`);
        }

        if (props.window !== win) {
          throw new Error(`Expected correct window to be passed`);
        }

        return Checkout(props);
      });

      const content = {
        payWithDifferentAccount: "Use different account",
      };

      window.paypal.Menu = expect("Menu", (initialMenuProps) => {
        if (!initialMenuProps.clientID) {
          throw new Error(`Expected initial menu props to contain clientID`);
        }

        return {
          renderTo: expect("menuRender", async (element) => {
            if (!element) {
              throw new Error(`Expected element to be passed`);
            }
          }),
          updateProps: expect("menuUpdateProps", async (menuProps) => {
            if (typeof menuProps.verticalOffset !== "number") {
              throw new TypeError(`Expected vertical offset to be passed`);
            }

            if (!Array.isArray(menuProps.choices)) {
              throw new TypeError(`Expected choices array to be passed`);
            }

            const choice = menuProps.choices.find(
              ({ label }) => label === content.payWithDifferentAccount,
            );

            if (!choice) {
              throw new Error(
                `Expected to find choose card or shipping button`,
              );
            }

            if (!choice.popup || !choice.popup.width || !choice.popup.height) {
              throw new Error(`Expected popup option to be passed`);
            }

            choice.onSelect({ win });
          }),
          hide: expect("hide", mockAsyncProp()),
          show: expect("show", mockAsyncProp()),
        };
      });

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({
        content,
        merchantID: ["XYZ12345"],
        fundingEligibility,
      });

      await clickMenu(FUNDING.PAYPAL);
    });
  });

  it("should pay with an existing vaulted card but delete using the menu", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";
      const paymentMethodID = "xyz123";

      let deleteVaultCalled;

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
          if (data.query.includes("mutation DeleteVault")) {
            if (data.variables.paymentMethodID !== paymentMethodID) {
              throw new Error(
                `Incorrect payment method id passed to deleteVault`,
              );
            }
            deleteVaultCalled = true;
          }
        },
      }).expectCalls();

      const fundingEligibility = {
        ...DEFAULT_FUNDING_ELIGIBILITY,
        [FUNDING.CARD]: {
          eligible: true,
          branded: true,
          vendors: {
            visa: {
              eligible: true,
              vaultedInstruments: [
                {
                  id: paymentMethodID,
                  label: {
                    description: "Visa x-1234",
                  },
                },
              ],
            },
          },
        },
      };

      const content = {
        deleteVaultedCard: "Unlink card",
      };

      window.paypal.Menu = expect("Menu", (initialMenuProps) => {
        if (!initialMenuProps.clientID) {
          throw new Error(`Expected initial menu props to contain clientID`);
        }

        return {
          renderTo: expect("menuRender", async (element) => {
            if (!element) {
              throw new Error(`Expected element to be passed`);
            }
          }),
          updateProps: expect("menuUpdateProps", async (menuProps) => {
            if (typeof menuProps.verticalOffset !== "number") {
              throw new TypeError(`Expected vertical offset to be passed`);
            }

            if (!Array.isArray(menuProps.choices)) {
              throw new TypeError(`Expected choices array to be passed`);
            }

            const choice = menuProps.choices.find(
              ({ label }) => label === content.deleteVaultedCard,
            );

            if (!choice) {
              throw new Error(
                `Expected to find choose card or shipping button`,
              );
            }

            choice.onSelect();
          }),
          hide: expect("hide", mockAsyncProp()),
          show: expect("show", mockAsyncProp()),
        };
      });

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({
        content,
        merchantID: ["XYZ12345"],
        fundingEligibility,
      });

      await clickMenu(FUNDING.CARD);

      gqlMock.done();

      if (!deleteVaultCalled) {
        throw new Error(`Expected delete vault to be called`);
      }
    });
  });

  it("should run client config and validate calls sequentially", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      window.paypal.Menu = expect("Menu", mockMenu);

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let vpmCallInProgress = false;
      let updateClientConfigCallInProgress = false;

      const vpmCall = getValidatePaymentMethodApiMock({
        extraHandler: expect("vpmCall", ({ uri }) => {
          if (uri.indexOf(`/${orderID}/`) === -1) {
            throw new Error(
              `Expected validate uri ${uri} to contain order id ${orderID}`,
            );
          }

          if (updateClientConfigCallInProgress) {
            throw new Error(
              `Expected client config call to not be in progress during validate call`,
            );
          }

          vpmCallInProgress = true;
          return ZalgoPromise.delay(100).then(() => {
            vpmCallInProgress = false;
            return {};
          });
        }),
      }).expectCalls();

      const gqlMock = getGraphQLApiMock({
        extraHandler: expect("gqlCall", ({ data }) => {
          if (data.variables.orderID && data.variables.orderID !== orderID) {
            throw new Error(
              `Expected orderID passed to GQL to be ${orderID}, got ${data.variables.orderID}`,
            );
          }

          if (data.query.includes("mutation UpdateClientConfig")) {
            if (vpmCallInProgress) {
              throw new Error(
                `Expected vpm call to not be in progress during client config call`,
              );
            }

            updateClientConfigCallInProgress = true;
            return ZalgoPromise.delay(100).then(() => {
              updateClientConfigCallInProgress = false;
              return {};
            });
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
        }),
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
        }),
      );

      const fundingEligibility = {
        [FUNDING.PAYPAL]: {
          eligible: true,
          branded: true,
          vaultedInstruments: [
            {
              id: paymentMethodID,
              label: {
                description: "foo@bar.com",
              },
            },
          ],
        },
      };

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL);
      gqlMock.done();
    });
  });

  it("should run client config and validate calls sequentially for edit-fi case", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();
      const paymentMethodID = "xyz123";

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let vpmCallInProgress = false;
      let updateClientConfigCallInProgress = false;

      const vpmCall = getValidatePaymentMethodApiMock({
        extraHandler: expect("vpmCall", ({ uri }) => {
          if (uri.indexOf(`/${orderID}/`) === -1) {
            throw new Error(
              `Expected validate uri ${uri} to contain order id ${orderID}`,
            );
          }

          if (updateClientConfigCallInProgress) {
            throw new Error(
              `Expected client config call to not be in progress during validate call`,
            );
          }

          vpmCallInProgress = true;
          return ZalgoPromise.delay(100).then(() => {
            vpmCallInProgress = false;
            return {};
          });
        }),
      }).expectCalls();

      const gqlMock = getGraphQLApiMock({
        extraHandler: expect("gqlCall", ({ data }) => {
          if (data.variables.orderID && data.variables.orderID !== orderID) {
            throw new Error(
              `Expected orderID passed to GQL to be ${orderID}, got ${data.variables.orderID}`,
            );
          }

          if (data.query.includes("mutation UpdateClientConfig")) {
            if (vpmCallInProgress) {
              throw new Error(
                `Expected vpm call to not be in progress during client config call`,
              );
            }

            updateClientConfigCallInProgress = true;
            return ZalgoPromise.delay(100).then(() => {
              updateClientConfigCallInProgress = false;
              return {};
            });
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
        }),
      }).expectCalls();

      getMockWindowOpen({ expectImmediateUrl: false });
      const win = window.open();

      const Checkout = window.paypal.Checkout;
      window.paypal.Checkout = expect("Checkout", (props) => {
        if (!props.window) {
          throw new Error(`Expected window to be passed`);
        }

        if (props.window !== win) {
          throw new Error(`Expected correct window to be passed`);
        }

        return Checkout(props);
      });

      const content = {
        payWithDifferentMethod: "Choose card or shipping",
      };

      window.paypal.Menu = expect("Menu", (initialMenuProps) => {
        if (!initialMenuProps.clientID) {
          throw new Error(`Expected initial menu props to contain clientID`);
        }

        return {
          renderTo: expect("menuRender", async (element) => {
            if (!element) {
              throw new Error(`Expected element to be passed`);
            }
          }),
          updateProps: expect("menuUpdateProps", async (menuProps) => {
            if (typeof menuProps.verticalOffset !== "number") {
              throw new TypeError(`Expected vertical offset to be passed`);
            }

            if (!Array.isArray(menuProps.choices)) {
              throw new TypeError(`Expected choices array to be passed`);
            }

            const choice = menuProps.choices.find(
              ({ label }) => label === content.payWithDifferentMethod,
            );

            if (!choice) {
              throw new Error(
                `Expected to find choose card or shipping button`,
              );
            }

            if (!choice.popup || !choice.popup.width || !choice.popup.height) {
              throw new Error(`Expected popup option to be passed`);
            }

            choice.onSelect({ win });
          }),
          hide: expect("hide", mockAsyncProp()),
          show: expect("show", mockAsyncProp()),
        };
      });

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
          gqlMock.done();
        }),
      );

      const fundingEligibility = {
        [FUNDING.PAYPAL]: {
          eligible: true,
          branded: true,
          vaultedInstruments: [
            {
              id: paymentMethodID,
              label: {
                description: "foo@bar.com",
              },
            },
          ],
        },
      };

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({
        merchantID: ["XYZ12345"],
        fundingEligibility,
        content,
      });

      await clickMenu(FUNDING.PAYPAL);
    });
  });

  it("Enable Vault graphql call should fail", async () => {
    return await wrapPromise(async ({ expect }) => {
      window.xprops.vault = true;
      window.xprops.clientAccessToken = "abc-123";

      const orderID = generateOrderID();

      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
          if (data.query.includes("mutation EnableVault")) {
            throw new Error(`Not today`);
          }
        },
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async () => {
          gqlMock.done();
        }),
      );

      const fundingEligibility = fundingEligibilityPayPalVaulted;

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({ merchantID: ["XYZ12345"], fundingEligibility });

      await clickButton(FUNDING.PAYPAL).catch(expect("clickCatch"));
    });
  });

  it("should pay with a vaulted card and use the ID token as a bearer token", async () => {
    return await wrapPromise(async ({ expect, avoid }) => {
      const paymentMethodID = "xyz123";
      const userIDToken = "eyja1234567";

      window.xprops.userIDToken = userIDToken;

      const gqlMock = getGraphQLApiMock({
        extraHandler: ({ data }) => {
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
                },
              },
            };
          }
        },
      }).expectCalls();

      window.paypal.Menu = expect("Menu", mockMenu);

      const orderID = generateOrderID();
      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      const confirmCall = getConfirmOrderApiMock({
        extraHandler: expect("confirmOrder", ({ headers }) => {
          if (headers.authorization !== `Bearer ${userIDToken}`) {
            throw new Error(`Expected call to come with correct access token`);
          }

          return {};
        }),
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          confirmCall.done();
        }),
      );

      const fundingEligibility = {
        [FUNDING.CARD]: {
          eligible: true,
          branded: true,
          vendors: {
            visa: {
              eligible: true,
              vaultedInstruments: [
                {
                  id: paymentMethodID,
                  label: {
                    description: "Visa x-1234",
                  },
                },
              ],
            },
          },
        },
      };

      window.paypal.Checkout = avoid("Checkout", window.paypal.Checkout);

      createButtonHTML({ fundingEligibility });
      await mockSetupButton({
        fundingEligibility,
        experiments: {
          deprecateVaultValidatePaymentMethod: true,
        },
      });

      await clickButton(FUNDING.CARD);
      gqlMock.done();
    });
  });

  it("should pay with venmo vault using only confirm payment source and skip validate payment method", async () => {
    return await wrapPromise(async ({ expect }) => {
      const paymentMethodID = "xyz123";
      const userIDToken = "eyja1234567";

      window.xprops.userIDToken = userIDToken;

      const wallet = {
        [FUNDING.VENMO]: {
          instruments: [
            {
              type: "venmo",
              tokenID: paymentMethodID,
              oneClick: true,
              label: "@username",
              branded: null,
            },
          ],
        },
      };

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
        },
      }).expectCalls();

      const orderID = generateOrderID();
      window.xprops.createOrder = mockAsyncProp(
        expect("createOrder", async () => {
          return orderID;
        }),
      );

      let vpmCalled = false;
      const vpmCall = getValidatePaymentMethodApiMock({
        handler: () => {
          vpmCalled = true;
        },
      }).listen();

      const confirmCall = getConfirmOrderApiMock({
        handler: () => {
          if (vpmCalled) {
            throw new Error(
              `Expected validate payment method to not be called`,
            );
          }

          return {};
        },
      }).expectCalls();

      window.xprops.onApprove = mockAsyncProp(
        expect("onApprove", async (data) => {
          if (data.orderID !== orderID) {
            throw new Error(
              `Expected orderID to be ${orderID}, got ${data.orderID}`,
            );
          }

          vpmCall.done();
          confirmCall.done();
        }),
      );

      const fundingEligibility = {
        venmo: {
          eligible: true,
          branded: false,
        },
      };

      createButtonHTML({ wallet, fundingEligibility });
      // $FlowIssue
      await mockSetupButton({
        merchantID: ["XYZ12345"],
        fundingEligibility,
        wallet,
        experiments: {
          deprecateVaultValidatePaymentMethod: true,
        },
      });

      await clickButton(FUNDING.VENMO);
      gqlMock.done();
    });
  });
});
