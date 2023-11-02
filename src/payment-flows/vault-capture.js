/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { FUNDING, FPTI_KEY } from "@paypal/sdk-constants/src";
import { destroyElement, noop } from "@krakenjs/belter/src";
import { initiateInstallments } from "@paypal/installments/src/interface";

import type { MenuChoices } from "../types";
import {
  validatePaymentMethod,
  getSupplementalOrderInfo,
  deleteVault,
  updateButtonClientConfig,
  loadFraudnet,
  confirmOrderAPI,
  buildPaymentSource,
} from "../api";
import {
  BUYER_INTENT,
  FPTI_TRANSITION,
  FPTI_CONTEXT_TYPE,
  FPTI_MENU_OPTION,
} from "../constants";
import { getLogger, sendCountMetric } from "../lib";
import {
  handleValidatePaymentMethodResponse,
  handleThreeDomainSecureContingency,
} from "../lib/3ds";
import type { ButtonProps } from "../button/props";

import type {
  PaymentFlow,
  PaymentFlowInstance,
  IsEligibleOptions,
  IsPaymentEligibleOptions,
  IsInstallmentsEligibleOptions,
  InitOptions,
  MenuOptions,
  Payment,
} from "./types";
import {
  checkout,
  CHECKOUT_POPUP_DIMENSIONS,
  EXPERIMENTAL_POPUP_DIMENSIONS,
} from "./checkout";

const VAULT_MIN_WIDTH = 250;

function setupVaultCapture() {
  // pass
}

function isVaultCaptureEligible({ props }: IsEligibleOptions): boolean {
  const { onShippingChange, onShippingAddressChange, onShippingOptionsChange } =
    props;

  if (onShippingChange || onShippingAddressChange || onShippingOptionsChange) {
    return false;
  }

  return true;
}

function isVaultCapturePaymentEligible({
  payment,
}: IsPaymentEligibleOptions): boolean {
  const { win, paymentMethodID, fundingSource } = payment;

  if (win) {
    return false;
  }

  if (!paymentMethodID) {
    return false;
  }

  if (window.innerWidth < VAULT_MIN_WIDTH && fundingSource === FUNDING.PAYPAL) {
    return false;
  }

  return true;
}

function isVaultCaptureInstallmentsEligible({
  props,
  serviceData,
}: IsInstallmentsEligibleOptions): boolean {
  const { enableVaultInstallments } = props;
  const { fundingEligibility } = serviceData;

  if (
    enableVaultInstallments &&
    fundingEligibility.card &&
    fundingEligibility.card.installments
  ) {
    return true;
  }

  return false;
}

function getClientMetadataID({ props }: {| props: ButtonProps |}): string {
  const { clientMetadataID, sessionID } = props;
  return clientMetadataID || sessionID;
}

function initVaultCapture({
  props,
  components,
  payment,
  serviceData,
  config,
  experiments,
}: InitOptions): PaymentFlowInstance {
  const {
    createOrder,
    onApprove,
    clientAccessToken,
    enableThreeDomainSecure,
    partnerAttributionID,
    getParent,
    userIDToken,
    clientID,
    env,
    disableSetCookie,
  } = props;
  const { ThreeDomainSecure, Installments } = components;
  const { fundingSource, paymentMethodID, button } = payment;
  const { facilitatorAccessToken, buyerCountry } = serviceData;
  const { cspNonce } = config;

  const clientMetadataID = getClientMetadataID({ props });
  let accessToken = clientAccessToken ?? facilitatorAccessToken;

  if (!paymentMethodID) {
    throw new Error(`Payment method id required for vault capture`);
  }

  if (!accessToken) {
    throw new Error(`Client access token required for vault capture`);
  }

  const restart = () => {
    return ZalgoPromise.try(() => {
      throw new Error(`Vault capture restart not implemented`);
    });
  };

  const fallbackToWebCheckout = () => {
    getLogger().info("web_checkout_fallback").flush();
    return checkout
      .init({
        props,
        components,
        serviceData,
        payment: {
          ...payment,
          isClick: false,
          buyerIntent: BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING,
        },
        config,
        restart,
      })
      .start();
  };

  const shippingRequired = (orderID) => {
    return getSupplementalOrderInfo(orderID).then((order) => {
      const {
        flags: { isChangeShippingAddressAllowed },
      } = order.checkoutSession;

      if (isChangeShippingAddressAllowed) {
        return true;
      }

      return false;
    });
  };

  const startExperimentPaymentFlow = (orderID) => {
    if (userIDToken) {
      accessToken = userIDToken;
    }

    ZalgoPromise.try(() => {
      return shippingRequired(orderID).then((shippingRequiredFlag) => {
        if (shippingRequiredFlag) {
          sendCountMetric({
            name: "pp.app.paypal_sdk.buttons.vault_capture.error.count",
            event: "error",
            dimensions: {
              errorName: "shipping_required_failure_or_fallback",
              fundingSource,
            },
          });

          if (fundingSource !== FUNDING.PAYPAL) {
            throw new Error(
              `Shipping address requested for ${fundingSource} payment`,
            );
          }

          return fallbackToWebCheckout();
        }

        return confirmOrderAPI(
          orderID,
          {
            payment_source: buildPaymentSource({
              paymentMethodID,
              fundingSource,
              enableThreeDomainSecure,
            }),
          },
          {
            facilitatorAccessToken: accessToken,
            partnerAttributionID,
            experiments: {},
          },
        )
          .then((res) => {
            // $FlowFixMe
            const { status, links } = res;
            return handleThreeDomainSecureContingency({
              status,
              links,
              ThreeDomainSecure,
              createOrder,
              getParent,
              paymentFlow: "vault_capture",
              fundingSource,
            });
          })
          .then(() => {
            sendCountMetric({
              name: "pp.app.paypal_sdk.buttons.vault_capture.success.count",
              event: "success",
              dimensions: {
                fundingSource,
                experimentInUse:
                  "deprecated_validate_payment_method_experiment",
              },
            });
            return onApprove({}, { restart });
          });
      });
    });
  };

  const startPaymentFlow = (orderID, installmentPlan) => {
    return ZalgoPromise.hash({
      validate: validatePaymentMethod({
        accessToken,
        orderID,
        paymentMethodID,
        enableThreeDomainSecure,
        clientMetadataID,
        partnerAttributionID,
        installmentPlan,
      }),
      requireShipping: shippingRequired(orderID),
    }).then(({ validate, requireShipping }) => {
      if (requireShipping) {
        sendCountMetric({
          name: "pp.app.paypal_sdk.buttons.vault_capture.error.count",
          event: "error",
          dimensions: {
            errorName: "shipping_required_failure_or_fallback",
            fundingSource,
          },
        });

        if (fundingSource !== FUNDING.PAYPAL) {
          throw new Error(
            `Shipping address requested for ${fundingSource} payment`,
          );
        }

        return fallbackToWebCheckout();
      }

      const { status, body } = validate;
      return handleValidatePaymentMethodResponse({
        ThreeDomainSecure,
        status,
        body,
        createOrder,
        getParent,
      }).then(() => {
        return confirmOrderAPI(
          orderID,
          {
            payment_source: buildPaymentSource({
              paymentMethodID,
              fundingSource,
            }),
          },
          {
            facilitatorAccessToken: accessToken,
            partnerAttributionID,
            experiments: {},
          },
        ).then(() => {
          sendCountMetric({
            name: "pp.app.paypal_sdk.buttons.vault_capture.success.count",
            event: "success",
            dimensions: {
              fundingSource,
              experimentInUse: "none",
            },
          });

          return onApprove({}, { restart });
        });
      });
    });
  };

  const start = () => {
    return createOrder().then((orderID) => {
      const queryStringParams = disableSetCookie ? { disableSetCookie } : {};
      return loadFraudnet({
        env,
        clientMetadataID,
        cspNonce,
        queryStringParams,
      })
        .catch(noop)
        .then(() => {
          const installmentsEligible = isVaultCaptureInstallmentsEligible({
            props,
            serviceData,
          });

          getLogger()
            .info(
              installmentsEligible
                ? "vault_merchant_installments_eligible"
                : "vault_merchant_installments_ineligible",
            )
            .track({
              [FPTI_KEY.TRANSITION]: installmentsEligible
                ? FPTI_TRANSITION.INSTALLMENTS_ELIGIBLE
                : FPTI_TRANSITION.INSTALLMENTS_INELIGIBLE,
              [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.ORDER_ID,
              [FPTI_KEY.TOKEN]: orderID,
              [FPTI_KEY.CONTEXT_ID]: orderID,
            })
            .flush();

          if (clientID && installmentsEligible) {
            return getSupplementalOrderInfo(orderID).then((order) => {
              const cartAmount =
                order.checkoutSession.cart.amounts.total
                  .currencyFormatSymbolISOCurrency;
              return initiateInstallments({
                clientID,
                Installments,
                paymentMethodID,
                button,
                buyerCountry,
                orderID,
                accessToken,
                cartAmount,
                onPay: startPaymentFlow,
                getLogger,
              });
            });
          } else if (experiments?.deprecateVaultValidatePaymentMethod) {
            return startExperimentPaymentFlow(orderID);
          } else {
            return startPaymentFlow(orderID);
          }
        });
    });
  };

  return {
    start,
    close: () => ZalgoPromise.resolve(),
  };
}

function setupVaultMenu({
  props,
  payment,
  serviceData,
  components,
  config,
  restart,
  experiments,
}: MenuOptions): MenuChoices {
  const dimensions = experiments?.popupIncreaseDimensions
    ? EXPERIMENTAL_POPUP_DIMENSIONS
    : CHECKOUT_POPUP_DIMENSIONS;
  const POPUP_OPTIONS = {
    width: dimensions.WIDTH,
    height: dimensions.HEIGHT,
  };

  const {
    clientAccessToken,
    createOrder,
    enableThreeDomainSecure,
    partnerAttributionID,
    sessionID,
    clientMetadataID,
    userIDToken,
  } = props;
  const { fundingSource, paymentMethodID, button } = payment;
  const { content, facilitatorAccessToken, featureFlags } = serviceData;

  if (!clientAccessToken || !paymentMethodID) {
    throw new Error(`Client access token and payment method id required`);
  }

  getLogger().info(`popup_dimensions_value_vault_capture`);
  sendCountMetric({
    name: "pp.app.paypal_sdk.checkout_ui.dimension.count",
    dimensions: {
      spbPaymentFlow: "vault_capture",
      fundingSource,
      dimensionType: experiments?.popupIncreaseDimensions
        ? "experiment_default"
        : "default",
    },
  });

  const updateMenuClientConfig = () => {
    return ZalgoPromise.try(() => {
      return createOrder();
    }).then((orderID) => {
      return updateButtonClientConfig({
        fundingSource,
        orderID,
        inline: false,
        featureFlags,
      });
    });
  };

  const validate = () => {
    const accessToken = userIDToken
      ? facilitatorAccessToken
      : clientAccessToken;

    return ZalgoPromise.try(() => {
      return createOrder();
    }).then((orderID) => {
      return validatePaymentMethod({
        accessToken,
        orderID,
        paymentMethodID,
        enableThreeDomainSecure,
        partnerAttributionID,
        clientMetadataID: clientMetadataID || sessionID,
      });
    });
  };

  const loadCheckout = ({
    payment: checkoutPayment,
  }: {|
    payment: Payment,
  |}) => {
    return checkout
      .init({
        props,
        components,
        serviceData,
        config,
        payment: checkoutPayment,
        restart,
      })
      .start();
  };

  const CHOOSE_FUNDING_SHIPPING = {
    label: content.payWithDifferentMethod,
    popup: POPUP_OPTIONS,
    onSelect: ({ win }) => {
      getLogger()
        .info("click_choose_funding")
        .track({
          [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.CLICK_CHOOSE_FUNDING,
          [FPTI_KEY.OPTION_SELECTED]: FPTI_MENU_OPTION.CHOOSE_FUNDING,
        })
        .flush();

      return ZalgoPromise.try(() => {
        return updateMenuClientConfig();
      })
        .then(() => {
          return validate();
        })
        .then(() => {
          return loadCheckout({
            payment: {
              ...payment,
              win,
              buyerIntent: BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING,
            },
          });
        });
    },
  };

  const CHOOSE_ACCOUNT = {
    label: content.payWithDifferentAccount,
    popup: POPUP_OPTIONS,
    onSelect: ({ win }) => {
      getLogger()
        .info("click_choose_account")
        .track({
          [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.CLICK_CHOOSE_ACCOUNT,
          [FPTI_KEY.OPTION_SELECTED]: FPTI_MENU_OPTION.CHOOSE_ACCOUNT,
        })
        .flush();

      return ZalgoPromise.try(() => {
        return updateMenuClientConfig();
      }).then(() => {
        return loadCheckout({
          payment: {
            ...payment,
            win,
            buyerIntent: BUYER_INTENT.PAY_WITH_DIFFERENT_ACCOUNT,
          },
        });
      });
    },
  };

  const DELETE_CARD = {
    label: content.deleteVaultedCard,
    spinner: true,
    onSelect: () => {
      // $FlowFixMe
      const element: HTMLElement = button.parentElement || button;

      getLogger()
        .info("click_unlink_account")
        .track({
          [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.CLICK_UNLINK_ACCOUNT,
          [FPTI_KEY.OPTION_SELECTED]: FPTI_MENU_OPTION.UNLINK_ACCOUNT,
        })
        .flush();

      return deleteVault({ paymentMethodID, clientAccessToken }).then(() => {
        destroyElement(element);
      });
    },
  };

  if (fundingSource === FUNDING.PAYPAL) {
    return [CHOOSE_FUNDING_SHIPPING, CHOOSE_ACCOUNT];
  }

  if (fundingSource === FUNDING.CARD) {
    return [DELETE_CARD];
  }

  throw new Error(`Can not render menu for ${fundingSource}`);
}

function updateVaultClientConfig({
  orderID,
  payment,
  featureFlags,
}): ZalgoPromise<void> {
  const { fundingSource } = payment;
  return updateButtonClientConfig({
    fundingSource,
    orderID,
    inline: true,
    featureFlags,
  });
}

export const vaultCapture: PaymentFlow = {
  name: "vault_capture",
  setup: setupVaultCapture,
  isEligible: isVaultCaptureEligible,
  isPaymentEligible: isVaultCapturePaymentEligible,
  init: initVaultCapture,
  setupMenu: setupVaultMenu,
  updateFlowClientConfig: updateVaultClientConfig,
  spinner: true,
  inline: true,
};
