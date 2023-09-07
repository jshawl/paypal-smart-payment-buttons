/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { memoize, noop, supportsPopups, stringifyError, PopupOpenError } from '@krakenjs/belter/src';
import { FPTI_KEY } from '@paypal/sdk-constants/src';
import { getDomain, getParent, getTop, type CrossDomainWindowType } from '@krakenjs/cross-domain-utils/src';

import type { ProxyWindow } from '../../types';
import { CONTEXT, TARGET_ELEMENT, FPTI_TRANSITION, FPTI_STATE } from '../../constants';
import { unresolvedPromise, getLogger, setBuyerAccessToken } from '../../lib';
import { openPopup } from '../../ui';
import type { ButtonProps, Components, ServiceData, Config } from '../../button/props';
import type { Payment } from '../types';

import { VENMO_WEB_URL } from './config';
import type { NativeFallbackOptions } from './eligibility';

export const VENMO_POPUP_DIMENSIONS = {
    WIDTH:  500,
    HEIGHT: 692
};

let canRenderTop = false;
let buyerAccessTokenReceivedOnAuth = null;

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

export function setupVenmoWeb({ components } : {| components: Components|}) : ZalgoPromise<void> {
    const { Venmo } = components;

    const [ parent, top ] = [ getParent(window), getTop(window) ];

    const tasks = {};

    if (top && parent && parent !== top) {
        tasks.canRenderTo = Venmo.canRenderTo(top).then(result => {
            canRenderTop = result;
        });
    }

    return ZalgoPromise.hash(tasks).then(noop);
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
  getLogger().info(`popup_dimensions_${ fundingSource }`).flush();
  return { width: VENMO_POPUP_DIMENSIONS.WIDTH, height: VENMO_POPUP_DIMENSIONS.HEIGHT };
}

type VenmoPopupOptions = {|
    payment : Payment,
    props : ButtonProps,
    serviceData : ServiceData,
    config : Config,
    components : Components,
    clean? : mixed,
    sessionUID? : string,
    callbacks? : mixed,
    fallback : (opts? : {|
        win? : CrossDomainWindowType | ProxyWindow,
        fallbackOptions? : NativeFallbackOptions
    |}) => ZalgoPromise<void>,
|};

type VenmoPopup = {|
    click : () => ZalgoPromise<boolean> | ZalgoPromise<string> | ZalgoPromise<void> | boolean | void,
    start : () => ZalgoPromise<void>,
    close : () => ZalgoPromise<void>,
|};

export function initVenmoWeb({ props, components, serviceData, payment, config, fallback } : VenmoPopupOptions) : VenmoPopup {
    const { Venmo } = components;
    const { sessionID, buttonSessionID, createOrder, onApprove, onCancel, onError, onComplete,
        onShippingChange, onShippingAddressChange, onShippingOptionsChange, locale, commit, clientAccessToken,
        onClick, clientMetadataID: cmid, onAuth, env,
        enableFunding, stickinessID, standaloneFundingSource, branded,
        merchantRequestedPopupsDisabled } = props;
    let { button, win, fundingSource, card, isClick, buyerAccessToken = serviceData.buyerAccessToken,
        venmoPayloadID, buyerIntent } = payment;
    const { buyerCountry, eligibility: { venmoWebEnabled } } = serviceData;
    const { cspNonce } = config;

    let context = getContext({ win, isClick, merchantRequestedPopupsDisabled });

    let approved = false;
    let doApproveOnClose = false;
    let forceClosed = false;

    const init = () => {
        return Venmo({
            window:   win,
            sessionID,
            buttonSessionID,
            stickinessID,
            clientAccessToken,
            venmoPayloadID,
            parentDomain: getDomain(),
            venmoWebUrl: VENMO_WEB_URL[env],
            venmoWebEnabled,

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

            onAuth: ({ accessToken }) => {
                buyerAccessTokenReceivedOnAuth = accessToken ? accessToken : buyerAccessToken;

                return onAuth({ accessToken: buyerAccessTokenReceivedOnAuth }).then(token => {
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
                    .info(`venmo_flow_error `, { err: stringifyError(err) })
                    .track({
                        [FPTI_KEY.STATE]:        FPTI_STATE.BUTTON,
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
                return win ? fallback({ win }) : fallback({ win: getRenderWindow() });
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
          return initVenmoWeb({ props, components, serviceData, config, payment: { button, fundingSource, card, buyerIntent, isClick: false, checkoutRestart: true }, fallback })
              .start().finally(unresolvedPromise);
      });
    });

    const click = () => {
        return ZalgoPromise.try(() => {
            if (!merchantRequestedPopupsDisabled && !win && supportsPopups()) {
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

            return ZalgoPromise.try(() => {
                return onClick ? onClick({ fundingSource }) : true;
            }).then(valid => {
                if (win && !valid) {
                    getLogger().info(`native_onclick_invalid`).track({
                        [FPTI_KEY.STATE]:       FPTI_STATE.BUTTON,
                        [FPTI_KEY.TRANSITION]:  FPTI_TRANSITION.NATIVE_ON_CLICK_INVALID
                    }).flush();

                    win.close();
                }

                return valid;
            });
        });
    };

    return { click, start, close };
}
