/* @flow */
/* eslint require-await: off, max-lines: off, max-nested-callbacks: off */

import { noop, parseQuery, wrapPromise, uniqueID } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { FUNDING, PLATFORM } from "@paypal/sdk-constants/src";

import {
  mockSetupButton,
  mockAsyncProp,
  createButtonHTML,
  clickButton,
  getMockWindowOpen,
  mockFunction,
  getGraphQLApiMock,
  type MockWindow,
} from "./mocks";

const EXPECTED_POPUP_QUERY_PARAMS = [
  "sdkMeta",
  "buttonSessionID",
  "parentDomain",
];
const EXPECTED_NATIVE_URL = "https://www.paypal.com/smart/checkout/native";

const EXPECTED_VENMO_URL = "https://www.paypal.com/smart/checkout/venmo";
const EXPECTED_VENMO_POPUP_URL =
  "https://history.paypal.com/smart/checkout/venmo/popup";
const EXPECTED_VENMO_POPUP_QUERY_PARAMS = [
  "sdkMeta",
  "buttonSessionID",
  "parentDomain",
  "venmoWebEnabled",
  "venmoWebUrl",
];
const IOS_SAFARI_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1";

const POST_MESSAGE = {
  DETECT_WEB_SWITCH: "detectWebSwitch",
  ON_CANCEL: "onCancel",
  ON_ERROR: "onError",
};

const validateNativeURL = (url) => {
  const [redirectUrl, redirectQueryString] = url.split("?");

  // eslint-disable-next-line compat/compat
  const redirectDomain = new URL(redirectUrl).origin;
  const redirectQuery = parseQuery(redirectQueryString);

  if (redirectDomain !== "https://www.paypal.com") {
    throw new Error(`Unexpected redirect domain: ${redirectDomain}`);
  }

  if (!redirectQuery.sdkMeta) {
    throw new Error(`Expected sdkMeta to be passed in url`);
  }

  if (!redirectQuery.sessionUID) {
    throw new Error(`Expected sessionUID to be passed in url`);
  }

  if (!redirectQuery.pageUrl) {
    throw new Error(`Expected pageUrl to be passed in url`);
  }

  if (!redirectQuery.buttonSessionID) {
    throw new Error(`Expected buttonSessionID to be passed in url`);
  }

  if (!redirectQuery.orderID) {
    throw new Error(`Expected orderID to be passed in url`);
  }

  if (!redirectQuery.env) {
    throw new Error(`Expected env to be passed in url`);
  }

  if (!redirectQuery.channel) {
    throw new Error(`Expected channel to be passed in url`);
  }

  if (!redirectQuery.buyerCountry) {
    throw new Error(`Expected buyerCountry to be passed in url`);
  }

  if (!redirectQuery.sdkVersion) {
    throw new Error(`Expected sdkVersion to be passed in url`);
  }

  return {
    url: redirectUrl,
    domain: redirectDomain,
    query: redirectQuery,
  };
};

const sendRedirectMessage = ({
  mockWindow,
  expect,
  redirect = true,
  url = EXPECTED_NATIVE_URL,
  hash = "close",
}) => {
  return mockWindow
    .send({
      name: "awaitRedirect",
      data: {
        app: null,
        redirect: true,
        pageUrl: `${window.location.href}#${hash}`,
      },
    })
    .then(
      expect("awaitRedirectResponse", (res) => {
        if (res.redirect !== redirect) {
          throw new Error(`Expected redirect to be ${redirect.toString()}`);
        }

        if (res.redirect) {
          if (!res.redirectUrl) {
            throw new Error(`Expected redirect url`);
          }

          const [redirectUrl] = res.redirectUrl.split("?");

          if (redirectUrl !== url) {
            throw new Error(
              `Expected redirect url to be ${url} but got ${redirectUrl}`,
            );
          }

          return validateNativeURL(res.redirectUrl);
        } else {
          return {
            url: "",
            domain: "",
            query: {},
          };
        }
      }),
    );
};

const getFirebaseGraphQLMock = ({ expect, sessionToken }) => {
  return getGraphQLApiMock({
    extraHandler: expect("firebaseGQLCall", ({ data }) => {
      if (!data.query.includes("query GetFireBaseSessionToken")) {
        return;
      }

      if (!data.variables.sessionUID) {
        throw new Error(`Expected sessionUID to be passed`);
      }

      return {
        data: {
          firebase: {
            auth: {
              sessionUID: data.variables.sessionUID,
              sessionToken,
            },
          },
        },
      };
    }),
  }).expectCalls();
};

const mockCreateOrder = ({ expect, orderID }) => {
  window.xprops.createOrder = mockAsyncProp(
    expect("createOrder", async () => {
      return orderID;
    }),
    50,
  );
};

const mockOnApprove = ({ expect, orderID, payerID }) => {
  window.xprops.onApprove = mockAsyncProp(
    expect("onApprove", (data) => {
      if (data.orderID !== orderID) {
        throw new Error(
          `Expected orderID to be ${orderID}, got ${data.orderID}`,
        );
      }

      if (payerID && data.payerID !== payerID) {
        throw new Error(
          `Expected payerID to be ${payerID}, got ${data.payerID}`,
        );
      }
    }),
  );
};

const mockOnClick = ({ expect, valid }) => {
  window.xprops.onClick = mockAsyncProp(
    expect("onClick", async () => {
      return ZalgoPromise.resolve(valid);
    }),
    50,
  );
};

const mockOnError = ({ expect }) => {
  window.xprops.onError = mockAsyncProp(
    expect("onError", async () => {
      return ZalgoPromise.resolve(true);
    }),
    50,
  );
};

const mockOnCancel = ({ expect }) => {
  window.xprops.onCancel = mockAsyncProp(
    expect("onCancel", async () => {
      return ZalgoPromise.resolve(true);
    }),
    50,
  );
};

const mockOnComplete = ({ expect }) => {
  window.xprops.onComplete = mockAsyncProp(
    expect("onComplete", async () => {
      return ZalgoPromise.resolve(true);
    }),
    50,
  );
};

type MockWebCheckoutOptions = {|
  expect: Function,
  error?: boolean,
  cancel?: boolean,
  complete?: boolean,
  orderID: string,
  payerID?: string,
  mockWindow?: MockWindow,
  approve?: boolean,
  onComplete?: ({| props: Object |}) => void | ZalgoPromise<void>,
  restart?: boolean,
|};

const mockVenmoWebCheckout = ({
  expect,
  error = false,
  cancel = false,
  complete = false,
  orderID,
  payerID,
  mockWindow,
  approve = true,
  onComplete = noop,
}: MockWebCheckoutOptions) => {
  const venmoMock = mockFunction(
    window.paypal,
    "Venmo",
    expect("Venmo", ({ original: CheckoutOriginal, args: [props] }) => {
      const checkoutInstance = CheckoutOriginal(props);

      const renderToMock = mockFunction(
        checkoutInstance,
        "renderTo",
        expect("renderTo", async ({ args }) => {
          const [win, element, context] = args;

          if (!win) {
            throw new Error(`Expected window to be passed to renderTo`);
          }

          if (props.win) {
            throw new Error(`Expected window to not be passed to props`);
          }

          if (!element || typeof element !== "string") {
            throw new Error(`Expected string element to be passed to renderTo`);
          }

          if (context !== "popup") {
            throw new Error(`Expected context to be popup, got ${context}`);
          }

          return props.onAuth({ buyerAccessToken: "bat" }).then(() => {
            return props.createOrder().then((id) => {
              if (id !== orderID) {
                throw new Error(`Expected orderID to be ${orderID}, got ${id}`);
              }

              return ZalgoPromise.try(() => {
                if (approve) {
                  if (mockWindow) {
                    mockWindow.expectClose();
                  }

                  return props.onApprove({
                    orderID,
                    payerID,
                  });
                } else if (error) {
                  return props.onError();
                } else if (cancel) {
                  return props.onCancel();
                } else if (complete) {
                  return props.onComplete();
                }
              }).then(() => {
                venmoMock.cancel();
                renderToMock.cancel();

                return onComplete
                  ? onComplete({
                      props,
                    })
                  : props.onComplete();
              });
            });
          });
        }),
      );

      return checkoutInstance;
    }),
  );
};

const fundingEligibility = {
  [FUNDING.VENMO]: {
    eligible: true,
    branded: false,
  },
};

const setupNativeButton = (props = {}) => {
  return mockSetupButton({
    fundingEligibility,
    eligibility: {
      cardFields: false,
      venmoEnableOnShippingChange: true,
    },
    cookies: "s@paypal.com",
    ...props,
  });
};

describe("native venmo cases", () => {
  beforeEach(() => {
    window.xprops.enableNativeCheckout = true;
    window.xprops.onShippingChange = () => {
      return ZalgoPromise.resolve(true);
    };
    delete window.xprops.onClick;
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe("for MOBILE", () => {
    beforeEach(() => {
      window.navigator.mockUserAgent = IOS_SAFARI_USER_AGENT;
      window.xprops.platform = PLATFORM.MOBILE;
    });

    it("should render a Venmo button with createOrder, click the button, and render venmo via popup to web path in iOS", async () => {
      return await wrapPromise(async ({ expect, avoid }) => {
        const sessionToken = uniqueID();
        const orderID = uniqueID();

        const gqlMock = getFirebaseGraphQLMock({ expect, sessionToken });

        window.xprops.onCancel = avoid(POST_MESSAGE.ON_CANCEL);
        window.xprops.onError = avoid(POST_MESSAGE.ON_ERROR);

        const mockWindow = getMockWindowOpen({
          expectedUrl: EXPECTED_VENMO_POPUP_URL,
          expectedQuery: EXPECTED_VENMO_POPUP_QUERY_PARAMS,
          expectImmediateUrl: false,
          expectClose: true,
        });

        mockCreateOrder({ expect, orderID });
        mockOnApprove({ expect, orderID, payerID: null });

        mockVenmoWebCheckout({ expect, orderID, mockWindow });

        createButtonHTML({ fundingEligibility });

        await setupNativeButton();

        await clickButton(FUNDING.VENMO);
        await window.xprops.onApprove.await();

        gqlMock.done();
        mockWindow.done();
      });
    });

    it("should render a Venmo button without calling createOrder due to invalid onClick in iOS", async () => {
      return await wrapPromise(async ({ expect, avoid }) => {
        const sessionToken = uniqueID();

        window.xprops.onError = avoid(POST_MESSAGE.ON_ERROR);

        const gqlMock = getFirebaseGraphQLMock({ expect, sessionToken });

        mockOnClick({ expect, valid: false });
        createButtonHTML({ fundingEligibility });

        await setupNativeButton();
        await clickButton(FUNDING.VENMO);

        await window.xprops.onClick.await();
        gqlMock.done();
      });
    });

    it("should render a button with createOrder, click the button, and detect web switch in iOS and restart with Venmo web", async () => {
      return await wrapPromise(async ({ expect, avoid }) => {
        const sessionToken = uniqueID();
        const orderID = uniqueID();

        const gqlMock = getFirebaseGraphQLMock({ expect, sessionToken });

        let mockWebSocketServer;

        const mockWindow = getMockWindowOpen({
          expectedUrl: EXPECTED_VENMO_POPUP_URL,
          expectedQuery: EXPECTED_POPUP_QUERY_PARAMS,
          expectClose: false,
          onOpen: () => {
            sendRedirectMessage({
              mockWindow,
              expect,
              url: EXPECTED_VENMO_URL,
            }).then(({ url: redirectUrl }) => {
              mockWindow.redirect(redirectUrl).then(() => {
                mockWindow.send({
                  name: POST_MESSAGE.DETECT_WEB_SWITCH,
                });
              });
            });
          },
        });

        mockCreateOrder({ expect, orderID });

        window.xprops.onCancel = avoid(POST_MESSAGE.ON_CANCEL);
        window.xprops.onError = avoid(POST_MESSAGE.ON_ERROR);
        delete window.xprops.onShippingChange;

        mockVenmoWebCheckout({
          expect,
          orderID,
          mockWindow,
          approve: false,
        });

        createButtonHTML({ fundingEligibility });

        await setupNativeButton();

        await clickButton(FUNDING.VENMO);

        if (mockWebSocketServer) {
          mockWebSocketServer.done();
        }
        mockWindow.done();
        gqlMock.done();
      });
    });

    it("should render a button with createOrder, click the button, and detect error in Venmo web flow and not close popup", async () => {
      return await wrapPromise(async ({ expect, avoid }) => {
        const orderID = uniqueID();
        const sessionToken = uniqueID();

        const gqlMock = getFirebaseGraphQLMock({ expect, sessionToken });

        mockCreateOrder({ expect, orderID });
        mockOnError({ expect });

        window.xprops.onCancel = avoid(POST_MESSAGE.ON_CANCEL);

        const mockWindow = getMockWindowOpen({
          expectedUrl: EXPECTED_VENMO_POPUP_URL,
          expectedQuery: EXPECTED_POPUP_QUERY_PARAMS,
          expectImmediateUrl: false,
          expectClose: false,
        });

        mockVenmoWebCheckout({
          expect,
          orderID,
          mockWindow,
          approve: false,
          error: true,
        });

        createButtonHTML({ fundingEligibility });

        await setupNativeButton();

        await clickButton(FUNDING.VENMO);

        await window.xprops.onError.await();
        mockWindow.done();
        gqlMock.done();
      });
    });

    it("should render a button with createOrder, click the button, and detect cancel in Venmo web flow and close popup", async () => {
      return await wrapPromise(async ({ expect, avoid }) => {
        const orderID = uniqueID();
        const sessionToken = uniqueID();

        const gqlMock = getFirebaseGraphQLMock({ expect, sessionToken });

        mockCreateOrder({ expect, orderID });
        mockOnCancel({ expect });

        window.xprops.onError = avoid(POST_MESSAGE.ON_ERROR);

        const mockWindow = getMockWindowOpen({
          expectedUrl: EXPECTED_VENMO_POPUP_URL,
          expectedQuery: EXPECTED_POPUP_QUERY_PARAMS,
          expectImmediateUrl: false,
          expectClose: true,
        });

        mockVenmoWebCheckout({
          expect,
          orderID,
          mockWindow,
          approve: false,
          cancel: true,
        });

        createButtonHTML({ fundingEligibility });

        await setupNativeButton();

        await clickButton(FUNDING.VENMO);

        await window.xprops.onCancel.await();
        mockWindow.done();
        gqlMock.done();
      });
    });

    it("should render a button with createOrder, click the button, and detect onComplete in Venmo web flow and close popup", async () => {
      return await wrapPromise(async ({ expect, avoid }) => {
        const orderID = uniqueID();
        const sessionToken = uniqueID();

        const gqlMock = getFirebaseGraphQLMock({ expect, sessionToken });

        mockCreateOrder({ expect, orderID });
        mockOnComplete({ expect });

        window.xprops.onError = avoid(POST_MESSAGE.ON_ERROR);

        const mockWindow = getMockWindowOpen({
          expectedUrl: EXPECTED_VENMO_POPUP_URL,
          expectedQuery: EXPECTED_POPUP_QUERY_PARAMS,
          expectImmediateUrl: false,
          expectClose: true,
        });

        mockVenmoWebCheckout({
          expect,
          orderID,
          mockWindow,
          approve: false,
          complete: true,
        });

        createButtonHTML({ fundingEligibility });

        await setupNativeButton();

        await clickButton(FUNDING.VENMO);

        await window.xprops.onComplete.await();
        mockWindow.done();
        gqlMock.done();
      });
    });
  });
});
