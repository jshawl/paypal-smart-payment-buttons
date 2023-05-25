/* @flow */

import type { CrossDomainWindowType } from '@krakenjs/cross-domain-utils/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

import { type ValidatePaymentMethodResponse } from '../api';
import type { ThreeDomainSecureFlowType } from '../types';
import { TARGET_ELEMENT } from '../constants';


type CreateOrder = () => ZalgoPromise<string>;
type ThreeDomainSecureProps = {|
    ThreeDomainSecure : ThreeDomainSecureFlowType,
    createOrder : CreateOrder,
    getParent : () => CrossDomainWindowType
|};

type ThreeDomainSecureContingencyProps = {|
    ThreeDomainSecure : ThreeDomainSecureFlowType,
    createOrder : CreateOrder,
    getParent : () => CrossDomainWindowType,
    status : string,
    links : $ReadOnlyArray < {|
        method : string,
        rel : string,
        href : string
    |}>
|};

function handleThreeDomainSecureRedirect({ ThreeDomainSecure, createOrder, getParent }: ThreeDomainSecureProps): ZalgoPromise<void> {
    const promise = new ZalgoPromise();
    const instance = ThreeDomainSecure({
        createOrder,
        onSuccess: () => promise.resolve(),
        onCancel: () => promise.reject(new Error(`3DS cancelled`)),
        onError: (err) => promise.reject(err)
    });

    return instance.renderTo(getParent(), TARGET_ELEMENT.BODY)
        .then(() => promise)
        .finally(instance.close);
}


export function handleThreeDomainSecureContingency({ status, links, ThreeDomainSecure, createOrder, getParent }: ThreeDomainSecureContingencyProps): ZalgoPromise<void> | void {
    return ZalgoPromise.try(() => {
        if (status === "PAYER_ACTION_REQUIRED" && links.some(link => link.rel === "payer-action" && link.href && link.href.includes("flow=3ds"))) {
            return handleThreeDomainSecureRedirect({ ThreeDomainSecure, createOrder, getParent });
        }
    });
}

type HandleValidatePaymentMethodResponse = {|
    ThreeDomainSecure : ThreeDomainSecureFlowType,
    status : number,
    body : ValidatePaymentMethodResponse,
    createOrder : CreateOrder,
    getParent : () => CrossDomainWindowType
|};

export function handleValidatePaymentMethodResponse({ ThreeDomainSecure, status, body, createOrder, getParent }: HandleValidatePaymentMethodResponse): ZalgoPromise<void> {
    return ZalgoPromise.try(() => {
        if (status === 422 && body.links && body.links.some(link => link.rel === '3ds-contingency-resolution')) {
            return handleThreeDomainSecureRedirect({ ThreeDomainSecure, createOrder, getParent });
        }

        if (status !== 200) {

            const hasDescriptiveErrorCode = Array.isArray(body.details);
            if (hasDescriptiveErrorCode) {
                const details = body.details && body.details[0];
                const { issue = '' } = details || {};
                if (issue.trim().length !== 0) {
                    throw new Error(`Validate payment failed with issue: ${issue}`);
                }
            }

            throw new Error(`Validate payment failed with status: ${status}`);
        }
    });
}
