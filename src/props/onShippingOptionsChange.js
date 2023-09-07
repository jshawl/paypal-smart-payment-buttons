/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { FPTI_KEY } from '@paypal/sdk-constants/src';

import { getShippingOrderInfo } from '../api';
import { FPTI_TRANSITION, FPTI_CONTEXT_TYPE, FPTI_CUSTOM_KEY } from '../constants';
import { getLogger } from '../lib';
import type { CheckoutOrderAmount, CheckoutShippingOption } from '../types';

import type { CreateOrder } from './createOrder';
import {
    type Query,
    type ON_SHIPPING_CHANGE_EVENT,
    ON_SHIPPING_CHANGE_PATHS,
    SHIPPING_OPTIONS_ERROR_MESSAGES,
    GENERIC_REJECT_ADDRESS_MESSAGE
} from './onShippingChange';
import { buildBreakdown, calculateTotalFromShippingBreakdownAmounts, convertQueriesToArray, updateOperationForShippingOptions, updateShippingOptions, breakdownKeyChanges, optionsKeyChanges } from './utils';
       
export type XOnShippingOptionsChangeDataType = {|
    orderID? : string,
    paymentID? : string,
    paymentToken? : string,
    selectedShippingOption? : CheckoutShippingOption,
    errors : typeof SHIPPING_OPTIONS_ERROR_MESSAGES
|};

type BuildPatchPayloadArgs = {|
    option?: CheckoutShippingOption,
    discount?: string,
|}

export type XOnShippingOptionsChangeActionsType = {|
    buildPatchPayload: (args: BuildPatchPayloadArgs) => ZalgoPromise<$ReadOnlyArray<Query>>,
    reject : (string) => ZalgoPromise<void>,
|};

export type XOnShippingOptionsChange = (XOnShippingOptionsChangeDataType, XOnShippingOptionsChangeActionsType) => ZalgoPromise<void>;

export type OnShippingOptionsChangeData = {|
    orderID? : string,
    paymentID? : string,
    paymentToken? : string,
    selectedShippingOption? : CheckoutShippingOption,
    options? : $ReadOnlyArray<CheckoutShippingOption>,
    amount? : CheckoutOrderAmount,
    event? : ON_SHIPPING_CHANGE_EVENT,
    buyerAccessToken? : ?string,
    forceRestAPI? : boolean
|};
        
export type OnShippingOptionsChangeActionsType = {|
    resolve : () => ZalgoPromise<void>,
    reject : (string) => ZalgoPromise<void>
|};
            
export function buildXOnShippingOptionsChangeData(data : OnShippingOptionsChangeData) : XOnShippingOptionsChangeDataType {
    // eslint-disable-next-line no-unused-vars
    const { amount, buyerAccessToken, event, forceRestAPI, options, selectedShippingOption, ...rest } = data;

    return {
        errors: SHIPPING_OPTIONS_ERROR_MESSAGES,
        selectedShippingOption,
        ...rest
    };
}

export function buildXOnShippingOptionsChangeActions({ data, actions: passedActions, orderID } : {| data : OnShippingOptionsChangeData, actions : OnShippingOptionsChangeActionsType, orderID : string |}) : XOnShippingOptionsChangeActionsType {
    const patchQueries = {};

    let newAmount;
    let breakdown = data.amount?.breakdown ? breakdownKeyChanges(data.amount.breakdown) : {};

    if (Object.keys(breakdown).length === 0) {
        throw new Error('Must pass breakdown into data attribute for onShippingAddressChange callback.');
    }

    const actions = {
        reject: passedActions.reject ?
            (message) => {
                if (Object.values(SHIPPING_OPTIONS_ERROR_MESSAGES).indexOf(message) === -1) {
                    return passedActions.reject(GENERIC_REJECT_ADDRESS_MESSAGE);
                } else {
                    return passedActions.reject(message);
                }
            } : function reject() {
                throw new Error(`Missing reject action callback`);
            },
        buildPatchPayload: ({option, discount}) => {
            if (option && data.options) {
                const selectedShippingOptionAmount = option?.amount?.value;
                const options = optionsKeyChanges(updateShippingOptions({ option, options: data.options }));

                newAmount = calculateTotalFromShippingBreakdownAmounts({ breakdown, updatedAmounts: { shipping: selectedShippingOptionAmount } });
                breakdown = buildBreakdown({ breakdown, updatedAmounts: { shipping: selectedShippingOptionAmount } });

                if (options && options.length > 0) {
                    patchQueries[ON_SHIPPING_CHANGE_PATHS.OPTIONS] = {
                        op:    data?.event || 'replace', // or 'add' if there are none.
                        path:  ON_SHIPPING_CHANGE_PATHS.OPTIONS,
                        value: options
                    };
                }

                patchQueries[ON_SHIPPING_CHANGE_PATHS.AMOUNT] = {
                    op:       'replace',
                    path:     ON_SHIPPING_CHANGE_PATHS.AMOUNT,
                    value: {
                        value:         `${ newAmount }`,
                        currency_code: data?.amount?.currencyCode,
                        breakdown
                    }
                };
            }

            if (discount) {
                newAmount = calculateTotalFromShippingBreakdownAmounts({ breakdown, updatedAmounts: { shippingDiscount: discount } });
                breakdown = buildBreakdown({ breakdown, updatedAmounts: { shipping_discount: discount } });

                patchQueries[ON_SHIPPING_CHANGE_PATHS.AMOUNT] = {
                    op:       'replace',
                    path:     ON_SHIPPING_CHANGE_PATHS.AMOUNT,
                    value: {
                        value:         `${ newAmount }`,
                        currency_code: data?.amount?.currencyCode,
                        breakdown
                    }
                };
            }
            return getShippingOrderInfo(orderID).then(sessionData => {
                let queries = [];
                const shippingMethods = sessionData?.checkoutSession?.cart?.shippingMethods || [];
                const hasShippingMethods = Boolean(shippingMethods.length > 0);

                if (hasShippingMethods) {
                    queries = updateOperationForShippingOptions({ queries: patchQueries });
                } else {
                    queries = convertQueriesToArray({ queries: patchQueries });
                }
                return queries;
            });
        }

    };

    return actions;
}

export type OnShippingOptionsChange = (OnShippingOptionsChangeData, OnShippingOptionsChangeActionsType) => ZalgoPromise<void>;

type OnShippingOptionsChangeXProps = {|
    onShippingOptionsChange : ?XOnShippingOptionsChange
|};

export function getOnShippingOptionsChange({ onShippingOptionsChange } : OnShippingOptionsChangeXProps, { createOrder } : {| createOrder : CreateOrder |}) : ?OnShippingOptionsChange {
    if (onShippingOptionsChange) {
        return ({ ...data }, actions) => {
            return createOrder().then(orderID => {
                getLogger()
                    .info('button_shipping_options_change')
                    .track({
                        [FPTI_KEY.TRANSITION]:                       FPTI_TRANSITION.CHECKOUT_SHIPPING_OPTIONS_CHANGE,
                        [FPTI_KEY.EVENT_NAME]:                       FPTI_TRANSITION.CHECKOUT_SHIPPING_OPTIONS_CHANGE,
                        [FPTI_KEY.CONTEXT_TYPE]:                     FPTI_CONTEXT_TYPE.ORDER_ID,
                        [FPTI_KEY.TOKEN]:                            orderID,
                        [FPTI_KEY.CONTEXT_ID]:                       orderID,
                        [FPTI_CUSTOM_KEY.SHIPPING_CALLBACK_INVOKED]: '1'
                    }).flush();
                
                return onShippingOptionsChange(buildXOnShippingOptionsChangeData(data), buildXOnShippingOptionsChangeActions({ data, actions, orderID }));
            });
        };
    }
}
