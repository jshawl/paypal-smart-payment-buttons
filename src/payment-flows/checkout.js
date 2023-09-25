/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { memoize, noop, supportsPopups, stringifyError, extendUrl, PopupOpenError, parseQuery, submitForm, isWebView } from '@krakenjs/belter/src';
import { FUNDING, FPTI_KEY, APM_LIST } from '@paypal/sdk-constants/src';
import { getParent, getTop, type CrossDomainWindowType } from '@krakenjs/cross-domain-utils/src';

import type { ProxyWindow, ConnectOptions } from '../types';
import { type CreateBillingAgreement, type CreateSubscription } from '../props';
import { exchangeAccessTokenForAuthCode, getConnectURL, updateButtonClientConfig, getSmartWallet, loadFraudnet  } from '../api';
import { CONTEXT, TARGET_ELEMENT, BUYER_INTENT, FPTI_TRANSITION, FPTI_CONTEXT_TYPE, FPTI_STATE, HEADERS } from '../constants';
import { unresolvedPromise, getLogger, setBuyerAccessToken, sendCountMetric } from '../lib';
import { openPopup } from '../ui';
import { FUNDING_SKIP_LOGIN } from '../config';
import { enableLoadingSpinner, getButtons } from "../button/dom";

import type { PaymentFlow, PaymentFlowInstance, SetupOptions, InitOptions } from './types';

export const CHECKOUT_POPUP_DIMENSIONS = {
    WIDTH:  500,
    HEIGHT: 590
};

export const EXPERIMENTAL_POPUP_DIMENSIONS = {
    WIDTH: 568,
    HEIGHT: 750
};

export const CHECKOUT_APM_POPUP_DIMENSIONS = {
    WIDTH:  1282,
    HEIGHT: 720
};

let canRenderTop = false;
let smokeHash = '';
let buyerAccessTokenReceivedOnAuth = null;

function getSmokeHash() : ZalgoPromise<string> {
    return window.xprops.getPageUrl().then(pageUrl => {
        if (pageUrl.indexOf('smokeHash') !== -1) {
            return parseQuery(pageUrl.split('?')[1]).smokeHash
        }

        return '';
    });
}

function getRenderWindow() : Object {
    const top = getTop(window);
    if (canRenderTop && top) {
        return top;
    } else if (getParent()) {
        return getParent();
    } else {
        return window;
    }
}

function setupCheckout({ components } : SetupOptions) : ZalgoPromise<void> {
    const { Checkout } = components;

    const [ parent, top ] = [ getParent(window), getTop(window) ];

    const tasks = {};

    if (top && parent && parent !== top) {
        tasks.canRenderTo = Checkout.canRenderTo(top).then(result => {
            canRenderTop = result;
        });
    }

    getSmokeHash().then(hash => {
        smokeHash = hash;
    });

    return ZalgoPromise.hash(tasks).then(noop);
}

function isCheckoutEligible() : boolean {
    return true;
}

function isCheckoutPaymentEligible() : boolean {
    return true;
}

type ConnectEligibleOptions = {|
    connect : ?ConnectOptions,
    vault : boolean,
    createBillingAgreement : ?CreateBillingAgreement,
    createSubscription : ?CreateSubscription,
    fundingSource : $Values<typeof FUNDING>
|};


function isConnectEligible({ connect, vault, fundingSource, createBillingAgreement, createSubscription } : ConnectEligibleOptions) : boolean {
    if (!connect) {
        return false;
    }

    if (vault) {
        return false;
    }

    if (fundingSource !== FUNDING.PAYPAL && fundingSource !== FUNDING.CREDIT) {
        return false;
    }

    if (createBillingAgreement || createSubscription) {
        return false;
    }

    return true;
}

function getContext({ win, isClick, merchantRequestedPopupsDisabled } : {| win : ?(CrossDomainWindowType | ProxyWindow), isClick : ?boolean, merchantRequestedPopupsDisabled : ?boolean |}) : $Values<typeof CONTEXT> {

    const popupSupported = supportsPopups();
    getLogger().info('spb_decide_context', {
        merchantRequestedPopupsDisabled: Boolean(merchantRequestedPopupsDisabled),
        isClick:                         Boolean(isClick),
        popupSupported:                  Boolean(popupSupported)
    });

    if (!merchantRequestedPopupsDisabled && win) {
        return CONTEXT.POPUP;
    }

    if (!merchantRequestedPopupsDisabled && isClick && popupSupported) {
        return CONTEXT.POPUP;
    }

    return CONTEXT.IFRAME;
}

export const getDimensions = (fundingSource : string, popupIncreaseDimensions? : boolean) : {| width : number, height : number |} => {
    if (isWebView()) {
        getLogger().info(`popup_dimensions_${ fundingSource }`);
        sendCountMetric({
            name: "pp.app.paypal_sdk.checkout_ui.dimension.count",
            dimensions: {
                spbPaymentFlow: "checkout",
                fundingSource,
                dimensionType: 'webview',
            }
        })
        return { width: window.outerWidth - 4, height: window.outerHeight - 20 };
    } else if (APM_LIST.indexOf(fundingSource) !== -1) {
        getLogger().info(`popup_dimensions_value_${ fundingSource }`);
        sendCountMetric({
            name: "pp.app.paypal_sdk.checkout_ui.dimension.count",
            dimensions: {
                spbPaymentFlow: "checkout",
                fundingSource,
                dimensionType: 'apm',
            }
        })
        return { width: CHECKOUT_APM_POPUP_DIMENSIONS.WIDTH, height: CHECKOUT_APM_POPUP_DIMENSIONS.HEIGHT };
    } else if (popupIncreaseDimensions) {
        getLogger().info(`popup_dimensions_value_${ fundingSource }`);
        sendCountMetric({
            name: "pp.app.paypal_sdk.checkout_ui.dimension.count",
            dimensions: {
                spbPaymentFlow: "checkout",
                fundingSource,
                dimensionType: 'experiment_default',
            }
        })
        return { width: EXPERIMENTAL_POPUP_DIMENSIONS.WIDTH, height: EXPERIMENTAL_POPUP_DIMENSIONS.HEIGHT };
    } else {
        getLogger().info(`popup_dimensions_${ fundingSource }`);
        sendCountMetric({
            name: "pp.app.paypal_sdk.checkout_ui.dimension.count",
            dimensions: {
                spbPaymentFlow: "checkout",
                fundingSource,
                dimensionType: 'default',
            }
        })
        return { width: CHECKOUT_POPUP_DIMENSIONS.WIDTH, height: CHECKOUT_POPUP_DIMENSIONS.HEIGHT };
    }
}

function initCheckout({ props, components, serviceData, payment, config, restart: fullRestart, experiments } : InitOptions) : PaymentFlowInstance {
    const { Checkout } = components;
    const { sessionID, buttonSessionID, createOrder, onApprove, onComplete, onCancel,
        onShippingChange, onShippingAddressChange, onShippingOptionsChange, locale, commit, onError, vault, clientAccessToken,
        createBillingAgreement, createSubscription, onClick, amount,
        clientID, connect, clientMetadataID: cmid, onAuth, userIDToken, env,
        currency, enableFunding, stickinessID,
        standaloneFundingSource, branded, paymentMethodToken, allowBillingPayments, merchantRequestedPopupsDisabled, disableSetCookie } = props;
    let { button, win, fundingSource, card, isClick, buyerAccessToken = serviceData.buyerAccessToken,
        venmoPayloadID, buyerIntent, checkoutRestart } = payment;
    const { buyerCountry, sdkMeta, merchantID } = serviceData;
    const { cspNonce } = config;

    let context = getContext({ win, isClick, merchantRequestedPopupsDisabled });
    const connectEligible = isConnectEligible({ connect, createBillingAgreement, createSubscription, vault, fundingSource });

    let approved = false;
    let doApproveOnClose = false;
    let forceClosed = false;

    const init = () => {
        return Checkout({
            window:   win,
            sessionID,
            buttonSessionID,
            stickinessID,
            clientAccessToken,
            venmoPayloadID,
            smokeHash,

            createAuthCode: () => {
                return ZalgoPromise.try(() => {
                    const fundingSkipLogin = FUNDING_SKIP_LOGIN[fundingSource];

                    if (payment.createAccessToken) {
                        return payment.createAccessToken();
                    } else if(checkoutRestart && buyerAccessTokenReceivedOnAuth && fundingSkipLogin) {
                        return buyerAccessTokenReceivedOnAuth;
                    } else if (buyerAccessToken) {
                        return buyerAccessToken;
                    } else if (clientID && userIDToken && fundingSkipLogin) {
                        const clientMetadataID = cmid || sessionID;
                        const queryStringParams = disableSetCookie ? { disableSetCookie } : {};
                        return loadFraudnet({ env, clientMetadataID, cspNonce, queryStringParams }).catch(noop).then(() => {
                            const headers = { [ HEADERS.DISABLE_SET_COOKIE ]: String(disableSetCookie) }
                            return getSmartWallet({ clientID, merchantID, currency, amount, clientMetadataID, userIDToken, paymentMethodToken, allowBillingPayments, branded, headers });
                        }).then(wallet => {
                            // $FlowFixMe
                            const walletInstruments = wallet[fundingSkipLogin] && wallet[fundingSkipLogin].instruments;

                            if (walletInstruments) {
                                for (const instrument of walletInstruments) {
                                    if (instrument.accessToken) {
                                        return instrument.accessToken;
                                    }
                                }
                            }
                        });
                    }
                }).then(accessToken => {
                    if (accessToken && (buyerIntent === BUYER_INTENT.PAY || buyerIntent === BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING)) {
                        return exchangeAccessTokenForAuthCode(accessToken);
                    }
                }).catch(err => {
                    getLogger().warn('exchange_access_token_auth_code_error', { err: stringifyError(err) });
                });
            },

            getConnectURL: (connect && connectEligible) ? ({ payerID }) => {
                if (!clientID) {
                    throw new Error(`Expected clientID`);
                }

                return createOrder().then(orderID => {
                    return getConnectURL({ orderID, payerID, clientID, fundingSource, connect }).then(connectURL => {
                        getLogger()
                            .info('connect_redirect', { connectURL })
                            .track({
                                [FPTI_KEY.STATE]:        FPTI_STATE.BUTTON,
                                [FPTI_KEY.TRANSITION]:   FPTI_TRANSITION.CONNECT_REDIRECT,
                                [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.ORDER_ID,
                                [FPTI_KEY.TOKEN]:        orderID,
                                [FPTI_KEY.CONTEXT_ID]:   orderID
                            }).flush();

                        return extendUrl(connectURL, {
                            query: {
                                sdkMeta
                            }
                        });
                    }).catch(err => {
                        getLogger().error('connect_redirect_error', { err: stringifyError(err) });
                        throw err;
                    });
                });
            } : null,

            createOrder: () => {
                // reset the buyerAccessTokenReceivedOnAuth
                buyerAccessTokenReceivedOnAuth = null;
                return createOrder().then(orderID => {
                    return orderID;
                });
            },

            onApprove: ({ approveOnClose = false, payerID, paymentID, billingToken, subscriptionID, authCode } = {}) => {
                if (approveOnClose) {
                    doApproveOnClose = true;
                    return;
                }
                approved = true;
                getLogger().info(`spb_onapprove_access_token_${ buyerAccessToken ? 'present' : 'not_present' }`).flush();

                setBuyerAccessToken(buyerAccessToken);

                // eslint-disable-next-line no-use-before-define
                return onApprove({ payerID, paymentID, billingToken, subscriptionID, buyerAccessToken, authCode }, { restart })
                // eslint-disable-next-line no-use-before-define
                .finally(() => close().then(noop))
                .catch(noop);
            },

            onComplete: () => {
                getLogger().info(`spb_oncomplete_access_token_${ buyerAccessToken ? 'present' : 'not_present' }`).flush();

                setBuyerAccessToken(buyerAccessToken);

                return onComplete({ buyerAccessToken })
                    // eslint-disable-next-line no-use-before-define
                    .finally(() => close().then(noop))
                    .catch(noop);
            },

            onSmartWalletEligible: ({ accessToken, eligibilityReason, locale: smartWalletLocale, orderID }) : ZalgoPromise<{| smartWalletRendered : boolean, buyerIntent : string |}> => {
                const { country, lang } = smartWalletLocale || locale;
                const access_token = accessToken || buyerAccessToken || "";
                const PPOF_MIN_WIDTH = 250;
                
                if (window.innerWidth < PPOF_MIN_WIDTH || buyerIntent === BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING || buyerIntent === BUYER_INTENT.PAY_WITH_DIFFERENT_ACCOUNT) {
                    getLogger().info(`checkout_smart_wallet_not_eligible `, {
                        buyerIntent,
                        width: window.innerWidth
                    }).track({
                        [FPTI_KEY.STATE]:        FPTI_STATE.BUTTON,
                        [FPTI_KEY.STATE]:        FPTI_STATE.ELIGIBILITY_CHECK,
                        [FPTI_KEY.TRANSITION]:   `${eligibilityReason}_ineligible`,
                        [FPTI_KEY.CONTEXT_ID]:   orderID,
                        [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.ORDER_ID
                    }).flush();
                    return ZalgoPromise.resolve({
                        smartWalletRendered: false,
                        buyerIntent
                    });
                }

                createOrder().then(walletOrderID => {
                    getLogger().info(`checkout_smart_wallet_eligible `, {
                        buyerIntent,
                        eligibilityReason
                    }).track({
                        [FPTI_KEY.STATE]:        FPTI_STATE.BUTTON,
                        [FPTI_KEY.STATE]:        FPTI_STATE.ELIGIBILITY_CHECK,
                        [FPTI_KEY.TRANSITION]:   `${eligibilityReason}_eligible`,
                        [FPTI_KEY.CONTEXT_ID]:   walletOrderID,
                        [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.ORDER_ID
                    }).flush().then(() => {
                        // eslint-disable-next-line no-use-before-define
                        close().then(() => {
                            getButtons().forEach(smartButton => enableLoadingSpinner(smartButton));
                            submitForm({
                                url: document.location.href,
                                target: '_self',
                                body: {
                                    buyerAccessToken: access_token,
                                    smartWalletOrderID: walletOrderID,
                                    enableOrdersApprovalSmartWallet: true,
                                    'locale.country': country,
                                    'locale.lang': lang,
                                    product: eligibilityReason
                                }
                            });
                        });
                    });
                });

                return ZalgoPromise.resolve({
                    smartWalletRendered: true,
                    buyerIntent
                });
            },

            onAuth: ({ accessToken }) => {
                buyerAccessTokenReceivedOnAuth = accessToken ? accessToken : buyerAccessToken;

                return onAuth({ accessToken: buyerAccessTokenReceivedOnAuth }).then(token => {
                    setBuyerAccessToken(token);

                    // this seems dead code. the return value is not always buyerAccessToken
                    buyerAccessToken = token;
                });
            },

            onCancel: () => {
                // eslint-disable-next-line no-use-before-define
                return close().then(() => {
                    return onCancel();
                });
            },

            onShippingChange: onShippingChange
                ? (data, actions) => {
                    return onShippingChange({ buyerAccessToken, ...data }, actions);
                } : null,

            onShippingAddressChange: onShippingAddressChange
                ? (data, actions) => {
                    if (!data.shippingAddress) {
                        throw new Error('Must pass shippingAddress in data to handle changes in shipping address.');
                    }
                    
                    return onShippingAddressChange({ ...data }, actions);
                } : null,

            onShippingOptionsChange: onShippingOptionsChange
                ? (data, actions) => {
                    if (!data.selectedShippingOption) {
                        throw new Error('Must pass selectedShippingOption in data to handle changes in shipping options.');
                    }
                    
                    return onShippingOptionsChange({ ...data }, actions);
                } : null,

            onClose: () => {
                if (doApproveOnClose && !approved) {
                    // eslint-disable-next-line no-use-before-define
                    return onApprove({ forceRestAPI: true }, { restart }).catch(noop);
                }
                if (!forceClosed && !approved) {
                    return onCancel();
                }
            },

            onError: (err) => {
                getLogger()
                    .info(`checkout_flow_error `, { err: stringifyError(err) })
                    .track({
                        [FPTI_KEY.STATE]:        FPTI_STATE.BUTTON,
                        [FPTI_KEY.TRANSITION]:   FPTI_TRANSITION.CHECKOUT_ERROR,
                        [FPTI_KEY.EVENT_NAME]:   FPTI_TRANSITION.CHECKOUT_ERROR,
                        [FPTI_KEY.ERROR_DESC]:   stringifyError(err)
                    }).flush();
                return onError(err);
            },

            dimensions: getDimensions(fundingSource, experiments?.popupIncreaseDimensions ?? false),

            fundingSource,
            card,
            buyerCountry,
            locale,
            commit,
            cspNonce,
            clientMetadataID: cmid,
            enableFunding,
            standaloneFundingSource,
            branded,
            restart:          () => {
                return fullRestart({ payment: { ...payment, win } });
            }
        });
    };

    let instance;

    const close = () => {
        return ZalgoPromise.try(() => {
            if (instance) {
                forceClosed = true;
                return instance.close();
            }
        });
    };

    const start = memoize(() => {
        instance = init();
        return instance.renderTo(getRenderWindow(), TARGET_ELEMENT.BODY, context);
    });

    const restart = memoize(() : ZalgoPromise<void> => {
        // Closing any previous checkout popup before restarting
        return close().finally(() => {
            return initCheckout({ props, components, serviceData, config, payment: { button, fundingSource, card, buyerIntent, isClick: false, checkoutRestart: true }, restart })
                .start().finally(unresolvedPromise);
        });
    });

    const click = () => {
        return ZalgoPromise.try(() => {
            if (!merchantRequestedPopupsDisabled && !win && supportsPopups()) {
                try {
                    const { width, height } = getDimensions(fundingSource, experiments?.popupIncreaseDimensions ?? false);
                    win = openPopup({ width, height });
                } catch (err) {
                    if (err instanceof PopupOpenError) {
                        getLogger().warn('popup_open_error_iframe_fallback', { err: stringifyError(err) });
                        context = CONTEXT.IFRAME;
                    } else {
                        getLogger().warn('popup_open_error_blocked', { err: stringifyError(err) });
                        sendCountMetric({
                            name: "pp.app.paypal_sdk.buttons.click.error.count",
                            dimensions: {
                                errorName: 'checkout_blocked',
                            }
                        }).flush()
                        throw err;
                    }
                }
            }

            if (!onClick) {
                start();
                return;
            }

            return ZalgoPromise.try(() => {
                return onClick ? onClick({ fundingSource }) : true;
            }).then(valid => {
                if (win && !valid) {
                    sendCountMetric({
                        name: "pp.app.paypal_sdk.buttons.click.error.count",
                        dimensions: {
                            errorName: 'invalid_funding_click',
                        }
                    }).flush()
                    win.close();
                }
            });
        });
    };

    return { click, start, close };
}

function updateCheckoutClientConfig({ orderID, payment, userExperienceFlow, featureFlags }) : ZalgoPromise<void> {
    return ZalgoPromise.try(() => {
        const { buyerIntent, fundingSource } = payment;
        
        const updateClientConfigPromise = updateButtonClientConfig({ fundingSource, orderID, inline: false, userExperienceFlow, featureFlags });

        const isButtonClientConfigCallBlocking = featureFlags && featureFlags.isButtonClientConfigCallBlocking;
        // Block
        if (buyerIntent === BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING || isButtonClientConfigCallBlocking) {
            return updateClientConfigPromise;
        }
    });
}

export const checkout : PaymentFlow = {
    name:                   'checkout',
    setup:                  setupCheckout,
    isEligible:             isCheckoutEligible,
    isPaymentEligible:      isCheckoutPaymentEligible,
    init:                   initCheckout,
    updateFlowClientConfig: updateCheckoutClientConfig
};
