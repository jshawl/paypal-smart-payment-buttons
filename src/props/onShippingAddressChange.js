/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { COUNTRY, FPTI_KEY } from '@paypal/sdk-constants/src';

import { getShippingOrderInfo } from '../api';
import { FPTI_TRANSITION, FPTI_CONTEXT_TYPE, FPTI_CUSTOM_KEY } from '../constants';
import { getLogger } from '../lib';
import type { CheckoutOrderAmount, CheckoutShippingOption } from '../types';
 
import type { CreateOrder } from './createOrder';
import {
    type Query,
    type ON_SHIPPING_CHANGE_EVENT,
    ON_SHIPPING_CHANGE_PATHS,
    SHIPPING_ADDRESS_ERROR_MESSAGES,
    GENERIC_REJECT_ADDRESS_MESSAGE
} from './onShippingChange';
import { buildBreakdown, calculateTotalFromShippingBreakdownAmounts, convertQueriesToArray, updateOperationForShippingOptions, breakdownKeyChanges, optionsKeyChanges } from './utils';
        
export type XOnShippingAddressChangeDataType = {|
    orderID? : string,
    paymentID? : string,
    paymentToken? : string,
    shippingAddress : {|
        city : string,
        state : string,
        countryCode : $Values<typeof COUNTRY>,
        postalCode : string
    |},
    errors : typeof SHIPPING_ADDRESS_ERROR_MESSAGES
|};

type BuildOrderPatchPayloadArgs = {|
    discount?: string,
    handling?: string,
    insurance?: string,
    itemTotal?: string,
    shippingOptions?: $ReadOnlyArray<CheckoutShippingOption>,
    shippingDiscount?: string,
    taxTotal?: string
|}

export type XOnShippingAddressChangeActionsType = {|
    reject : (string) => ZalgoPromise<void>,
    buildOrderPatchPayload: (args?: BuildOrderPatchPayloadArgs) => ZalgoPromise<$ReadOnlyArray<Query>>,
|};

export type XOnShippingAddressChange = (XOnShippingAddressChangeDataType, XOnShippingAddressChangeActionsType) => ZalgoPromise<void>;

export type OnShippingAddressChangeData = {|
    orderID? : string,
    paymentID? : string,
    paymentToken? : string,
    shippingAddress : {|
        city : string,
        state : string,
        countryCode : $Values<typeof COUNTRY>,
        postalCode : string
    |},
    amount? : CheckoutOrderAmount,
    event? : ON_SHIPPING_CHANGE_EVENT,
    buyerAccessToken? : ?string,
    forceRestAPI? : boolean
|};
        
export type OnShippingAddressChangeActionsType = {|
    resolve : () => ZalgoPromise<void>,
    reject : (string) => ZalgoPromise<void>
|};
            
export function buildXOnShippingAddressChangeData(data : OnShippingAddressChangeData) : XOnShippingAddressChangeDataType {
    // eslint-disable-next-line no-unused-vars
    const { amount, buyerAccessToken, event, forceRestAPI, shippingAddress, ...rest } = data;

    return {
        errors: SHIPPING_ADDRESS_ERROR_MESSAGES,
        shippingAddress,
        ...rest,
    };
}

export function buildXOnShippingAddressChangeActions({ data, actions: passedActions, orderID } : {| data : OnShippingAddressChangeData, actions : OnShippingAddressChangeActionsType, orderID : string |}) : XOnShippingAddressChangeActionsType {
    const patchQueries = {};

    let breakdown = data.amount?.breakdown ? breakdownKeyChanges(data.amount.breakdown) : {};

    if (Object.keys(breakdown).length === 0) {
        throw new Error('Must pass amount with breakdown into data attribute for onShippingAddressChange callback.');
    }

    const actions = {
        reject: passedActions.reject ?
            (message) => {
                if (Object.values(SHIPPING_ADDRESS_ERROR_MESSAGES).indexOf(message) === -1) {
                    return passedActions.reject(GENERIC_REJECT_ADDRESS_MESSAGE);
                } else {
                    return passedActions.reject(message);
                }
            } : function reject() {
                throw new Error(`Missing reject action callback`);
            },

        buildOrderPatchPayload: ({discount, handling, insurance, itemTotal, shippingOptions, shippingDiscount, taxTotal} = {}) => {
            const selectedShippingOption = shippingOptions?.find(option => option.selected === true);
            const selectedShippingOptionAmount = selectedShippingOption?.amount?.value ?? '0.00';

            const updatedAmounts = {};

            if (discount) {
                updatedAmounts.discount = discount;
            }

            if (handling) {
                updatedAmounts.handling = handling;
            }

            if (insurance) {
                updatedAmounts.insurance = insurance;
            }

            if (itemTotal) {
                updatedAmounts.item_total = itemTotal;
            }

            if (selectedShippingOption) {
                updatedAmounts.shipping = selectedShippingOptionAmount;
            }

            if (shippingDiscount) {
                updatedAmounts.shipping_discount = shippingDiscount;
            }

            if (taxTotal) {
                updatedAmounts.tax_total = taxTotal;
            }

            breakdown = buildBreakdown({ breakdown, updatedAmounts });
            const newAmount = calculateTotalFromShippingBreakdownAmounts({ breakdown, updatedAmounts });
            
            if (Object.keys(updatedAmounts).length) {
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

                if (shippingOptions?.length) {
                    // build payload for patching the order with all available shipping options
                    const ordersV2Options = optionsKeyChanges(shippingOptions);
    
                    patchQueries[ON_SHIPPING_CHANGE_PATHS.OPTIONS] = {
                        op:    hasShippingMethods ? 'replace' : 'add',
                        path:  ON_SHIPPING_CHANGE_PATHS.OPTIONS,
                        value: ordersV2Options
                    };
                }

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

export type OnShippingAddressChange = (OnShippingAddressChangeData, OnShippingAddressChangeActionsType) => ZalgoPromise<void>;

type OnShippingAddressChangeXProps = {|
    onShippingAddressChange : ?XOnShippingAddressChange
|};

export function getOnShippingAddressChange({ onShippingAddressChange } : OnShippingAddressChangeXProps, { createOrder } : {| createOrder : CreateOrder |}) : ?OnShippingAddressChange {
    if (onShippingAddressChange) {
        return ({ ...data }, actions) => {
            return createOrder().then(orderID => {
                getLogger()
                    .info('button_shipping_address_change')
                    .track({
                        [FPTI_KEY.TRANSITION]:                       FPTI_TRANSITION.CHECKOUT_SHIPPING_ADDRESS_CHANGE,
                        [FPTI_KEY.EVENT_NAME]:                       FPTI_TRANSITION.CHECKOUT_SHIPPING_ADDRESS_CHANGE,
                        [FPTI_KEY.CONTEXT_TYPE]:                     FPTI_CONTEXT_TYPE.ORDER_ID,
                        [FPTI_KEY.TOKEN]:                            orderID,
                        [FPTI_KEY.CONTEXT_ID]:                       orderID,
                        [FPTI_CUSTOM_KEY.SHIPPING_CALLBACK_INVOKED]: '1'
                    }).flush();
                
                return onShippingAddressChange(buildXOnShippingAddressChangeData(data), buildXOnShippingAddressChangeActions({ data, actions, orderID }));
            });
        };
    }
}
