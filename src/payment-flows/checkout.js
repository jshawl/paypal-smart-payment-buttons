/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { memoize, noop, supportsPopups, stringifyError, extendUrl, PopupOpenError, parseQuery, submitForm } from '@krakenjs/belter/src';
import { FUNDING, FPTI_KEY, APM_LIST } from '@paypal/sdk-constants/src';
import { getParent, getTop, type CrossDomainWindowType } from '@krakenjs/cross-domain-utils/src';

import type { ProxyWindow, ConnectOptions } from '../types';
import { type CreateBillingAgreement, type CreateSubscription } from '../props';
import { exchangeAccessTokenForAuthCode, getConnectURL, updateButtonClientConfig, getSmartWallet, loadFraudnet  } from '../api';
import { CONTEXT, TARGET_ELEMENT, BUYER_INTENT, FPTI_TRANSITION, FPTI_CONTEXT_TYPE, PRODUCT_FLOW, FPTI_STATE } from '../constants';
import { unresolvedPromise, getLogger, setBuyerAccessToken } from '../lib';
import { openPopup } from '../ui';
import { FUNDING_SKIP_LOGIN } from '../config';

import type { PaymentFlow, PaymentFlowInstance, SetupOptions, InitOptions } from './types';
import { enableLoadingSpinner, getButtons } from "../button/dom";

export const CHECKOUT_POPUP_DIMENSIONS = {
    WIDTH:  500,
    HEIGHT: 590
};

export const CHECKOUT_APM_POPUP_DIMENSIONS = {
    WIDTH:  1282,
    HEIGHT: 720
};

let canRenderTop = false;
let acceleratedXO = false;
let smokeHash = '';

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
    console.log('TEST Checkout.js setupCheckout', { components });
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

export const getDimensions = (fundingSource : string) : {| width : number, height : number |} => {
    if (APM_LIST.indexOf(fundingSource) !== -1) {
        getLogger().info(`popup_dimensions_value_${ fundingSource }`).flush();
        return { width: CHECKOUT_APM_POPUP_DIMENSIONS.WIDTH, height: CHECKOUT_APM_POPUP_DIMENSIONS.HEIGHT };
    } else {
        getLogger().info(`popup_dimensions_${ fundingSource }`).flush();
        return { width: CHECKOUT_POPUP_DIMENSIONS.WIDTH, height: CHECKOUT_POPUP_DIMENSIONS.HEIGHT };
    }
}

function initCheckout({ props, components, serviceData, payment, config, restart: fullRestart } : InitOptions) : PaymentFlowInstance {
    console.log('TEST Checkout.js initCheckout', { props, components, serviceData, payment, config, fullRestart });
    const { Checkout } = components;
    const { sessionID, buttonSessionID, createOrder, onApprove, onComplete, onCancel,
        onShippingChange, onShippingAddressChange, onShippingOptionsChange, locale, commit, onError, vault, clientAccessToken,
        createBillingAgreement, createSubscription, onClick, amount,
        clientID, connect, clientMetadataID: cmid, onAuth, userIDToken, env,
        currency, enableFunding, stickinessID,
        standaloneFundingSource, branded, paymentMethodToken, allowBillingPayments, merchantRequestedPopupsDisabled, inlinexo } = props;
    let { button, win, fundingSource, card, isClick, buyerAccessToken = serviceData.buyerAccessToken,
        venmoPayloadID, buyerIntent } = payment;
    const { buyerCountry, sdkMeta, merchantID } = serviceData;
    const { cspNonce } = config;

    acceleratedXO = inlinexo && fundingSource === FUNDING.CARD;

    let context = getContext({ win, isClick, merchantRequestedPopupsDisabled });
    const connectEligible = isConnectEligible({ connect, createBillingAgreement, createSubscription, vault, fundingSource });

    let approved = false;
    let doApproveOnClose = false;
    let forceClosed = false;

    const init = () => {
        console.log('TEST Checkout.js Init');
        return Checkout({
            window:   win,
            sessionID,
            buttonSessionID,
            stickinessID,
            clientAccessToken,
            venmoPayloadID,
            inlinexo: acceleratedXO,
            smokeHash,

            createAuthCode: () => {
                console.log('TEST checkout.js >> createAuthCode');
                return ZalgoPromise.try(() => {
                    const fundingSkipLogin = FUNDING_SKIP_LOGIN[fundingSource];

                    if (payment.createAccessToken) {
                        return payment.createAccessToken();
                    } else if (buyerAccessToken) {
                        return buyerAccessToken;
                    } else if (clientID && userIDToken && fundingSkipLogin) {
                        const clientMetadataID = cmid || sessionID;

                        return loadFraudnet({ env, clientMetadataID, cspNonce }).catch(noop).then(() => {
                            return getSmartWallet({ clientID, merchantID, currency, amount, clientMetadataID, userIDToken, paymentMethodToken, allowBillingPayments, branded });
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
                return createOrder().then(orderID => {
                    return orderID;
                });
            },

            onApprove: ({ accelerated, approveOnClose = false, payerID, paymentID, billingToken, subscriptionID, authCode } = {}) => {
                if (approveOnClose) {
                    doApproveOnClose = true;
                    return;
                }
                approved = true;
                getLogger().info(`spb_onapprove_access_token_${ buyerAccessToken ? 'present' : 'not_present' }`).flush();

                setBuyerAccessToken(buyerAccessToken);

                let valid = true;
                // eslint-disable-next-line no-use-before-define
                return onApprove({ accelerated, payerID, paymentID, billingToken, subscriptionID, buyerAccessToken, authCode }, { restart })
                .finally(() => {
                    if (accelerated) {
                        return valid;
                    } else {
                        // eslint-disable-next-line no-use-before-define
                        return close().then(noop);
                    }
                })
                .catch(() => {
                    valid = false;
                });
            },

            onComplete: () => {
                getLogger().info(`spb_oncomplete_access_token_${ buyerAccessToken ? 'present' : 'not_present' }`).flush();

                setBuyerAccessToken(buyerAccessToken);

                return onComplete({ buyerAccessToken })
                    // eslint-disable-next-line no-use-before-define
                    .finally(() => close().then(noop))
                    .catch(noop);
            },

            onSmartWalletEligible: ({ accessToken, eligibilityReason, locale }) : ZalgoPromise<any> => {
                const {country = props.locale.country, lang = props.locale.lang } = locale || props.locale;
                const access_token = accessToken ? accessToken : buyerAccessToken;
                // If buyerIntent is change FI/Shipping or Account then its not eligible for Smart Wallet Orders Approval
                if (window.innerWidth < 300 || buyerIntent === BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING || buyerIntent === BUYER_INTENT.PAY_WITH_DIFFERENT_ACCOUNT) {
                    getLogger().info(`checkout_smart_wallet_not_eligible `, {
                        buyerIntent,
                        width: window.innerWidth
                    });
                    return ZalgoPromise.resolve({
                        smartWalletRendered: false,
                        buyerIntent
                    });
                }

                createOrder().then(orderID => { // use memoized version
                    getLogger().info(`checkout_smart_wallet_eligible `, {
                        buyerIntent,
                        eligibilityReason
                    }).track({
                        [FPTI_KEY.STATE]:        FPTI_STATE.ELIGIBILITY_CHECK,
                        [FPTI_KEY.TRANSITION]:   `${eligibilityReason}_eligible`,
                        [FPTI_KEY.CONTEXT_ID]:   orderID,
                        [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.ORDER_ID
                    }).flush().then(() => {
                        close().then(() => {
                            getButtons().forEach(button => enableLoadingSpinner(button));
                            submitForm({
                                url: document.location.href,
                                target: '_self',
                                body: {
                                    buyerAccessToken: access_token,
                                    smartWalletOrderID: orderID,
                                    enableOrdersApprovalSmartWallet: true,
                                    'locale.country': country,
                                    'locale.lang': lang
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
                const access_token = accessToken ? accessToken : buyerAccessToken;
                return onAuth({ accessToken: access_token }).then(token => {
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
                    if (!data.shipping_address) {
                        throw new Error('Must pass shipping_address in data to handle changes in shipping address.');
                    }
                    
                    return onShippingAddressChange({ ...data }, actions);
                } : null,

            onShippingOptionsChange: onShippingOptionsChange
                ? (data, actions) => {
                    if (!data.selected_shipping_option) {
                        throw new Error('Must pass selected_shipping_option in data to handle changes in shipping options.');
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
                        [FPTI_KEY.TRANSITION]:   FPTI_TRANSITION.CHECKOUT_ERROR,
                        [FPTI_KEY.EVENT_NAME]:   FPTI_TRANSITION.CHECKOUT_ERROR,
                        [FPTI_KEY.ERROR_DESC]:   stringifyError(err)
                    }).flush();
                return onError(err);
            },

            dimensions: getDimensions(fundingSource),

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
        console.log('TEST Checkout.js Start');
        instance = init();
        return instance.renderTo(getRenderWindow(), TARGET_ELEMENT.BODY, context);
    });

    const restart = memoize(() : ZalgoPromise<void> => {
        // Closing any previous checkout popup before restarting
        return close().finally(() => {
            return initCheckout({ props, components, serviceData, config, payment: { button, fundingSource, card, buyerIntent, isClick: false }, restart })
                .start().finally(unresolvedPromise);
        });
    });

    const click = () => {
        console.log('TEST Checkout.js Click');
        return ZalgoPromise.try(() => {
            if (acceleratedXO) {
                context = CONTEXT.IFRAME;
            } else if (!merchantRequestedPopupsDisabled && !win && supportsPopups()) {
                try {
                    const { width, height } = getDimensions(fundingSource);
                    win = openPopup({ width, height });
                } catch (err) {
                    getLogger().warn('popup_open_error_iframe_fallback', { err: stringifyError(err) });

                    if (err instanceof PopupOpenError) {
                        context = CONTEXT.IFRAME;
                    } else {
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
                    win.close();
                }
            });
        });
    };

    return { click, start, close };
}

function updateCheckoutClientConfig({ orderID, payment, userExperienceFlow, inlinexo }) : ZalgoPromise<void> {
    return ZalgoPromise.try(() => {
        const { buyerIntent, fundingSource } = payment;
        
        let productFlow = PRODUCT_FLOW.SMART_PAYMENT_BUTTONS;
        if (inlinexo) {
            productFlow = PRODUCT_FLOW.ACCELERATED;
        }
        const updateClientConfigPromise = updateButtonClientConfig({ fundingSource, productFlow, orderID, inline: acceleratedXO, userExperienceFlow });

        // Block
        if (buyerIntent === BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING) {
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
