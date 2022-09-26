/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { stringifyError, noop } from '@krakenjs/belter/src';
import { FUNDING, WALLET_INSTRUMENT, FPTI_KEY } from '@paypal/sdk-constants/src';

import type { MenuChoices, Wallet, WalletInstrument } from '../types';
import { getSupplementalOrderInfo, oneClickApproveOrder, getSmartWallet, loadFraudnet, updateButtonClientConfig } from '../api';
import { BUYER_INTENT, FPTI_TRANSITION, FPTI_MENU_OPTION } from '../constants';
import { type ButtonProps } from '../button/props';
import { getBuyerAccessToken, getLogger } from '../lib';

import type { PaymentFlow, PaymentFlowInstance, SetupOptions, IsEligibleOptions, IsPaymentEligibleOptions, InitOptions, MenuOptions, Payment } from './types';
import { checkout, CHECKOUT_POPUP_DIMENSIONS } from './checkout';

function isWalletCaptureEligible({ props, serviceData } : IsEligibleOptions) : boolean {
    const { wallet } = serviceData;
    const { onShippingChange, onShippingAddressChange, onShippingOptionsChange } = props;

    if (!wallet) {
        return false;
    }

    if (onShippingChange || onShippingAddressChange || onShippingOptionsChange) {
        return false;
    }

    return true;
}

function getClientMetadataID({ props } : {| props : ButtonProps |}) : string {
    const { clientMetadataID, sessionID } = props;
    return clientMetadataID || sessionID;
}

let smartWalletPromise;
let smartWalletErrored = false;

function setupWalletCapture({ props, config, serviceData } : SetupOptions) {
    const { env, clientID, currency, amount, userIDToken, paymentMethodToken, allowBillingPayments, branded } = props;
    const { cspNonce } = config;
    const { merchantID, wallet } = serviceData;

    const clientMetadataID = getClientMetadataID({ props });

    if (!wallet) {
        throw new Error(`No wallet found`);
    }

    smartWalletPromise = loadFraudnet({ env, clientMetadataID, cspNonce }).catch(noop).then(() => {
        return userIDToken
            ? getSmartWallet({ clientID, merchantID, currency, amount, clientMetadataID, userIDToken, paymentMethodToken, allowBillingPayments, branded })
            : wallet;
    });

    smartWalletPromise.catch(err => {
        getLogger().warn('load_smart_wallet_error', { err: stringifyError(err) });
        smartWalletErrored = true;
    });
}

function getInstrument(wallet : Wallet, fundingSource : $Values<typeof FUNDING>, instrumentID : string) : WalletInstrument {

    // $FlowFixMe
    const walletFunding = wallet[fundingSource];

    if (!walletFunding) {
        throw new Error(`Wallet has no ${ fundingSource }`);
    }

    let instrument;
    for (const inst of walletFunding.instruments) {
        if (inst.instrumentID === instrumentID) {
            instrument = inst;
        }
    }

    if (!instrument) {
        throw new Error(`Can not find instrument with id ${ instrumentID }`);
    }

    return instrument;
}

function isWalletCapturePaymentEligible({ serviceData, payment } : IsPaymentEligibleOptions) : boolean {
    const { wallet } = serviceData;
    const { win, fundingSource, instrumentID } = payment;

    if (win) {
        return false;
    }

    if (!wallet) {
        return false;
    }

    if (!instrumentID) {
        return false;
    }

    if (!smartWalletPromise) {
        return false;
    }

    if (smartWalletErrored) {
        return false;
    }

    try {
        getInstrument(wallet, fundingSource, instrumentID);
    } catch (err) {
        return false;
    }

    return true;
}

function initWalletCapture({ props, components, payment, serviceData, config, restart: fullRestart } : InitOptions) : PaymentFlowInstance {
    const { createOrder, onApprove, clientMetadataID, vault, onAuth, enableOrdersApprovalSmartWallet } = props;
    const { fundingSource, instrumentID } = payment;
    const { wallet } = serviceData;

    if (!wallet || !smartWalletPromise) {
        throw new Error(`No smart wallet found`);
    }

    if (!instrumentID) {
        throw new Error(`Instrument id required for wallet capture`);
    }

    const instrument = getInstrument(wallet, fundingSource, instrumentID);

    const createAccessToken = () => {
        if (!smartWalletPromise) {
            throw new Error(`No smart wallet found`);
        }

        if(getBuyerAccessToken()) {
            return getBuyerAccessToken();
        }

        return smartWalletPromise.then(smartWallet => {
            const { accessToken } = getInstrument(smartWallet, fundingSource, instrumentID);

            if (!accessToken) {
                throw new Error(`Instrument access token not found`);
            }

            return accessToken;
        });
    };

    const getWebCheckoutFallback = () => {
        console.log('TEST Wallet Capture fallbackToWebCheckout > getWebCheckoutFallback')
        return checkout.init({
            props, components, serviceData, payment: {
                ...payment,
                createAccessToken,
                isClick:       false,
                buyerIntent:   BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING,
                fundingSource: (instrument && instrument.type === WALLET_INSTRUMENT.CREDIT) ? FUNDING.CREDIT : fundingSource
            }, config, restart: fullRestart
        });
    };

    const fallbackToWebCheckout = () => {
        console.log('TEST Wallet Capture fallbackToWebCheckout')
        getLogger().info('web_checkout_fallback').flush();
        return getWebCheckoutFallback().start();
    };

    // One click checkout is ineligible if the flow was using (userIDToken  + vault)
    // One click checkout is Eligible for (vault + enableOrdersApprovalSmartWallet)

    if ( !instrument.oneClick || smartWalletErrored || (vault && !enableOrdersApprovalSmartWallet)) {
        console.warn('TEST Wallet Capture initWalletCapture > needs to fallbackToWebCheckout', {
            oneClick: instrument.oneClick,
            smartWalletErrored,
            vault,
            enableOrdersApprovalSmartWallet
        })
        return getWebCheckoutFallback();
    }

    const restart = () => {
        return fallbackToWebCheckout();
    };

    const shippingRequired = (orderID) => {
        return getSupplementalOrderInfo(orderID).then(order => {
            const { flags: { isChangeShippingAddressAllowed } } = order.checkoutSession;

            if (isChangeShippingAddressAllowed) {
                return true;
            }

            return false;
        });
    };

    const start = () => {
        console.log('TEST Wallet Capture Start')
        return ZalgoPromise.hash({
            orderID:     createOrder(),
            smartWallet: smartWalletPromise
        }).then(({ orderID, smartWallet }) => {
            console.log('TEST Wallet Capture Start Promise Resolved', { orderID, smartWallet })
            const buyerAccessToken = (enableOrdersApprovalSmartWallet && getBuyerAccessToken()) || getInstrument(smartWallet, fundingSource, instrumentID).accessToken;

            if (!buyerAccessToken) {
                throw new Error(`No access token available for instrument`);
            }

            const instrumentType = instrument.type;
            if (!instrumentType) {
                throw new Error(`Instrument has no type`);
            }
            
            return ZalgoPromise.hash({
                requireShipping: shippingRequired(orderID),
                orderApproval:   oneClickApproveOrder({ orderID, instrumentType, buyerAccessToken, instrumentID, clientMetadataID }),
                onAuth:          onAuth({ accessToken: buyerAccessToken })
            }).then(({ requireShipping, orderApproval }) => {
                console.log('TEST Wallet Capture Start > ZalgoPromise.hash', {requireShipping, orderApproval})
                if (requireShipping) {
                    return fallbackToWebCheckout();
                }

                const { payerID } = orderApproval;
                return onApprove({ payerID, buyerAccessToken }, { restart }).catch(noop);
                
            });
        }).catch(err => {
            console.log('TEST Wallet Capture Start Promise Catch')
            getLogger().warn('approve_order_error', { err: stringifyError(err) }).flush();
            return fallbackToWebCheckout();
        });
    };

    return {
        start,
        close: () => ZalgoPromise.resolve()
    };
}

const POPUP_OPTIONS = {
    width:  CHECKOUT_POPUP_DIMENSIONS.WIDTH,
    height: CHECKOUT_POPUP_DIMENSIONS.HEIGHT
};

function setupWalletMenu({ props, payment, serviceData, components, config, restart } : MenuOptions) : MenuChoices {
    console.log('TEST setupWalletMenu', { props, payment, serviceData, components, config, restart })
    const { createOrder, enableOrdersApprovalSmartWallet } = props;
    const { fundingSource, instrumentID } = payment;
    const { wallet, content } = serviceData;

    if (!wallet) {
        throw new Error(`Can not render wallet menu without wallet`);
    }

    if (!instrumentID) {
        throw new Error(`Can not render wallet menu without instrumentID`);
    }

    const instrument = getInstrument(wallet, fundingSource, instrumentID);

    if (!instrument) {
        throw new Error(`Can not render wallet menu without instrument`);
    }

    console.log('TEST setupWalletMenu validated')

    const updateMenuClientConfig = () => {
        console.log('TEST setupWalletMenu updateMenuClientConfig')
        return ZalgoPromise.try(() => {
            return createOrder();
        }).then(orderID => {
            console.log('TEST setupWalletMenu updateMenuClientConfig  > then ', {orderID})
            return updateButtonClientConfig({ fundingSource, orderID, inline: false });
        });
    };

    const loadCheckout = ({ payment: checkoutPayment } : {| payment : Payment |}) => {
        console.log('TEST setupWalletMenu > loadCheckout Regular wallet', {payment});
        return checkout.init({
            props, components, serviceData, config, payment: checkoutPayment, restart
        }).start();
    };

    const newFundingSource = (instrument.type === WALLET_INSTRUMENT.CREDIT)
        ? FUNDING.CREDIT
        : fundingSource;

    const CHOOSE_FUNDING_SHIPPING = {
        label:    content.payWithDifferentMethod,
        popup:    POPUP_OPTIONS,
        onSelect: ({ win }) => {

            console.log('TEST setupWalletMenu > onSelect', {win})

            getLogger().info('click_choose_funding').track({
                [FPTI_KEY.TRANSITION]:      FPTI_TRANSITION.CLICK_CHOOSE_FUNDING,
                [FPTI_KEY.OPTION_SELECTED]: FPTI_MENU_OPTION.CHOOSE_FUNDING
            }).flush();

            return ZalgoPromise.try(() => {
                console.log('TEST setupWalletMenu > onSelect > try')
                return updateMenuClientConfig();
            }).then(() => {
                console.log('TEST setupWalletMenu > onSelect > try > then > call loadCheckout', {payment})
                return loadCheckout({
                    payment: {
                        ...payment,
                        win,
                        buyerIntent:       BUYER_INTENT.PAY_WITH_DIFFERENT_FUNDING_SHIPPING,
                        fundingSource:     newFundingSource,
                        createAccessToken: () => {
                            console.log('TEST setupWalletMenu > onSelect > try > then > call loadCheckout> createAccessToken', {payment});

                            return smartWalletPromise.then(smartWallet => {
                                if(enableOrdersApprovalSmartWallet && getBuyerAccessToken()) {
                                    console.log('TEST setupWalletMenu > onSelect > try > then > call loadCheckout> createAccessToken > then getBuyerAccessToken', {accessToken: getBuyerAccessToken()})
                                    return getBuyerAccessToken();
                                }
                                const smartInstrument = getInstrument(smartWallet, fundingSource, instrumentID);
                                console.log('TEST setupWalletMenu > onSelect > try > then > call loadCheckout> createAccessToken > then', {smartInstrument})
                                if (!smartInstrument) {
                                    throw new Error(`Instrument not found`);
                                }

                                if (!smartInstrument.accessToken) {
                                    throw new Error(`Instrument access token not found`);
                                }

                                return smartInstrument.accessToken;
                            });
                        }
                    }
                });
            });
        }
    };

    const CHOOSE_ACCOUNT = {
        label:    content.payWithDifferentAccount,
        popup:    POPUP_OPTIONS,
        onSelect: ({ win }) => {

            getLogger().info('click_choose_account').track({
                [FPTI_KEY.TRANSITION]:      FPTI_TRANSITION.CLICK_CHOOSE_ACCOUNT,
                [FPTI_KEY.OPTION_SELECTED]: FPTI_MENU_OPTION.CHOOSE_ACCOUNT
            }).flush();

            return loadCheckout({
                payment: { ...payment, win, buyerIntent: BUYER_INTENT.PAY_WITH_DIFFERENT_ACCOUNT, fundingSource: newFundingSource }
            });
        }
    };

    if (fundingSource === FUNDING.PAYPAL || fundingSource === FUNDING.CREDIT) {
        return [
            CHOOSE_FUNDING_SHIPPING,
            CHOOSE_ACCOUNT
        ];
    }
    
    throw new Error(`Can not render menu for ${ fundingSource }`);
}

function updateWalletClientConfig({ orderID, payment }) : ZalgoPromise<void> {
    const { fundingSource } = payment;
    return updateButtonClientConfig({ fundingSource, orderID, inline: true });
}

export const walletCapture : PaymentFlow = {
    name:                   'wallet_capture',
    setup:                  (...args) => { let res = setupWalletCapture(...args); console.log('TEST setupWalletCapture', res, args); return res;  },
    isEligible:             (...args) => { let res = isWalletCaptureEligible(...args); console.log('TEST isWalletCaptureEligible', res, args); return res;  },
    isPaymentEligible:      (...args) => { let res = isWalletCapturePaymentEligible(...args); console.log('TEST isWalletCapturePaymentEligible', res, args); return res; },
    init:                   (...args) => { let res = initWalletCapture(...args); console.log('TEST initWalletCapture', res, args); return res; },
    setupMenu:              (...args) => { let res = setupWalletMenu(...args); console.log('TEST setupWalletMenu', res, args); return res; },
    updateFlowClientConfig: updateWalletClientConfig,
    spinner:                true,
    inline:                 true
};
