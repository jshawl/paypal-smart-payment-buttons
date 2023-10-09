/* @flow */

import type { CrossDomainWindowType } from '@krakenjs/cross-domain-utils/src';
import { ENV, INTENT, COUNTRY, FUNDING, CARD, PLATFORM, CURRENCY } from '@paypal/sdk-constants/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

import type { LocaleType, ProxyWindow, Wallet, ConnectOptions } from '../types';
import type { XApplePaySessionConfigRequest } from '../payment-flows/types';
import { getStorageID, isStorageStateFresh } from '../lib';

import { getOnInit } from './onInit';
import { getOnClick } from './onClick';
import { getOnError } from './onError';

import type { OnInit, XOnInit, OnClick, XOnClick, XOnError, OnError, XGetPopupBridge, GetPopupBridge, RememberFunding, GetPageURL, GetQueriedEligibleFunding, PaymentRequest } from '.';

// export something to force webpack to see this as an ES module
export const TYPES = true;

export type PrerenderDetailsType = {|
    win ? : ? ProxyWindow,
    fundingSource : $Values<typeof FUNDING>,
    card ? : ? $Values<typeof CARD>
|};

export type XProps = {|
    env : $Values<typeof ENV>,
    locale : LocaleType,
    uid : string,

    sessionID : string,
    clientID : string,
    partnerAttributionID : ?string,
    merchantRequestedPopupsDisabled : ?boolean,
    sdkCorrelationID : string,
    platform : $Values<typeof PLATFORM>,
    merchantID : $ReadOnlyArray<string>,

    vault : boolean,
    commit : boolean,
    intent : $Values<typeof INTENT>,
    currency : $Values<typeof CURRENCY>,
    wallet : Wallet,

    clientAccessToken : ?string,
    buyerCountry : $Values<typeof COUNTRY>,

    getPrerenderDetails : () => ZalgoPromise<PrerenderDetailsType>,
    getPopupBridge : XGetPopupBridge,
    remember : RememberFunding,
    enableThreeDomainSecure : boolean,
    enableNativeCheckout : boolean | void,
    enableVaultInstallments : boolean,
    getParentDomain : () => string,
    getPageUrl : GetPageURL,
    getParent : () => CrossDomainWindowType,
    clientMetadataID : ?string,
    fundingSource : ?$Values<typeof FUNDING>,
    disableFunding : ?$ReadOnlyArray<$Values<typeof FUNDING>>,
    enableFunding : ?$ReadOnlyArray<$Values<typeof FUNDING>>,
    disableCard : ?$ReadOnlyArray<$Values<typeof CARD>>,
    disableAutocomplete? : boolean,
    getQueriedEligibleFunding? : GetQueriedEligibleFunding,
    storageID? : string,
    stageHost : ?string,
    apiStageHost : ?string,
    connect? : ConnectOptions,

    amount : ?string,
    userIDToken : ?string,

    onInit : XOnInit,
    onClick : XOnClick,
    onError : XOnError,

    paymentMethodNonce : ?string,
    paymentMethodToken : ?string,
    branded? : boolean,
    userExperienceFlow : string,
    allowBillingPayments : boolean,

    applePay : XApplePaySessionConfigRequest,
    paymentRequest: ?PaymentRequest,
    disableSetCookie? : boolean
|};

export type Props = {|
    env : $Values<typeof ENV>,
    locale : LocaleType,
    uid : string,

    sessionID : string,
    clientID : string,
    partnerAttributionID : ?string,
    merchantRequestedPopupsDisabled : ?boolean,
    clientMetadataID : ?string,
    sdkCorrelationID : string,
    platform : $Values<typeof PLATFORM>,

    vault : boolean,
    commit : boolean,
    currency : $Values<typeof CURRENCY>,
    intent : $Values<typeof INTENT>,
    wallet : Wallet,

    clientAccessToken : ?string,

    getPrerenderDetails : () => ZalgoPromise<PrerenderDetailsType>,
    getPopupBridge : GetPopupBridge,
    rememberFunding : RememberFunding,
    enableThreeDomainSecure : boolean,
    enableNativeCheckout : boolean,
    enableVaultInstallments : boolean,
    merchantDomain : string,
    getPageUrl : GetPageURL,
    getParent : () => CrossDomainWindowType,
    fundingSource : ?$Values<typeof FUNDING>,
    standaloneFundingSource : ?$Values<typeof FUNDING>,
    disableFunding : $ReadOnlyArray<$Values<typeof FUNDING>>,
    enableFunding : $ReadOnlyArray<$Values<typeof FUNDING>>,
    disableCard : ?$ReadOnlyArray<$Values<typeof CARD>>,
    disableAutocomplete? : boolean,
    getQueriedEligibleFunding : GetQueriedEligibleFunding,

    stageHost : ?string,
    apiStageHost : ?string,

    amount : ?string,
    userIDToken : ?string,
    stickinessID : string,

    onInit : OnInit,
    onError : OnError,
    onClick : ?OnClick,
    connect : ?ConnectOptions,

    paymentMethodToken : ?string,

    applePay : XApplePaySessionConfigRequest,

    branded : boolean | null,
    userExperienceFlow : string,
    allowBillingPayments : boolean,

    paymentRequest: ?PaymentRequest,
    merchantID : $ReadOnlyArray<string>,
    disableSetCookie : boolean
|};

export function getProps({
    branded
} : {|
    branded : boolean | null
|}) : Props {
    const xprops : XProps = window.xprops;

    let {
        uid,
        env,
        vault = false,
        commit,
        locale,
        platform,
        sessionID,
        clientID,
        partnerAttributionID,
        merchantRequestedPopupsDisabled,
        clientMetadataID,
        sdkCorrelationID,
        getParentDomain,
        clientAccessToken,
        getPopupBridge,
        getPrerenderDetails,
        getPageUrl,
        enableThreeDomainSecure,
        enableVaultInstallments,
        enableNativeCheckout = false,
        remember: rememberFunding,
        stageHost,
        apiStageHost,
        getParent,
        fundingSource,
        currency,
        connect,
        intent,
        merchantID,
        amount,
        userIDToken,
        enableFunding,
        disableFunding,
        disableCard,
        disableAutocomplete,
        wallet,
        paymentMethodNonce,
        paymentMethodToken = paymentMethodNonce,
        getQueriedEligibleFunding = () => ZalgoPromise.resolve([]),
        storageID,
        applePay,
        userExperienceFlow,
        allowBillingPayments,
        paymentRequest,
        disableSetCookie = false
    } = xprops;

    const onInit = getOnInit({ onInit: xprops.onInit });
    const merchantDomain = (typeof getParentDomain === 'function') ? getParentDomain() : 'unknown';

    enableFunding = enableFunding || [];
    disableFunding = disableFunding || [];

    const onClick = getOnClick({ onClick: xprops.onClick });

    const stickinessID = (storageID && isStorageStateFresh())
        ? storageID
        : getStorageID();


    const onError = getOnError({ onError: xprops.onError });

    return {
        uid,
        env,

        vault,
        commit,

        clientAccessToken,
        locale,

        sessionID,
        clientID,
        partnerAttributionID,
        clientMetadataID,
        sdkCorrelationID,
        merchantDomain,
        platform,
        currency,
        intent,
        wallet,
        merchantRequestedPopupsDisabled,

        getPopupBridge,
        getPrerenderDetails,
        getPageUrl,
        rememberFunding,
        getParent,
        connect,
        fundingSource,
        enableFunding,
        disableFunding,
        disableCard,
        disableAutocomplete,
        getQueriedEligibleFunding,

        amount,
        userIDToken,

        enableThreeDomainSecure,
        enableNativeCheckout,
        enableVaultInstallments,

        onClick,
        onInit,
        onError,
        stageHost,
        apiStageHost,

        standaloneFundingSource: fundingSource,
        paymentMethodToken,
        branded,
        stickinessID,
        applePay,
        userExperienceFlow,
        allowBillingPayments,

        paymentRequest,
        merchantID,

        disableSetCookie
    };
}
