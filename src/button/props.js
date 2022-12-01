/* @flow */

import { COUNTRY, FUNDING, CARD, INTENT, type FundingEligibilityType } from '@paypal/sdk-constants/src';
import type { InstallmentsFlowType } from '@paypal/installments/src/types';
import type { CustomStyle } from '@paypal/checkout-components/src/types';
import { EXPERIENCE } from '@paypal/checkout-components/src/constants/button';

import type { ContentType, ProxyWindow, Wallet, CheckoutFlowType, CardFormFlowType,
    ThreeDomainSecureFlowType, MenuFlowType, PersonalizationType, QRCodeType, PaymentFieldsFlowType, InlinePaymentFieldsEligibility, FeatureFlags } from '../types';
import { type FirebaseConfig } from '../api';
import { getNonce } from '../lib';
import { getProps, type XProps, type Props } from '../props/props';

// export something to force webpack to see this as an ES module
export const TYPES = true;


export type PrerenderDetailsType = {|
    win ? : ? ProxyWindow,
    fundingSource : $Values<typeof FUNDING>,
    card ? : ? $Values<typeof CARD>
|};

export type ButtonStyle = {|
    layout : string,
    color : string,
    shape : string,
    label : string,
    tagline : boolean | void,
    custom? : CustomStyle
|};

export type ButtonXProps = {|
    ...XProps,

    style : ButtonStyle,
    buttonSessionID : string
|};

export type ButtonProps = {|
    ...Props,

    style : ButtonStyle,
    inlinexo : boolean,
    buttonSessionID : string
|};

export function getButtonProps({
    facilitatorAccessToken,
    brandedDefault,
    paymentSource,
    featureFlags,
    enableOrdersApprovalSmartWallet,
    smartWalletOrderID
} : {|
    facilitatorAccessToken : string,
    brandedDefault : boolean | null,
    paymentSource : $Values<typeof FUNDING> | null,
    featureFlags: FeatureFlags,
    enableOrdersApprovalSmartWallet? : boolean,
    smartWalletOrderID? : string
|}) : ButtonProps {
    const xprops : ButtonXProps = window.xprops;

    let {
        buttonSessionID,
        style,
        branded,
        experience,
        intent
    } = xprops;

    branded = branded ?? brandedDefault;

    if (xprops.createBillingAgreement) {
        if (xprops.createOrder) {
            throw new Error(`Do not pass both createBillingAgreement and createOrder`);
        }

        if (!xprops.vault) {
            throw new Error(`Must pass vault=true to sdk to use createBillingAgreement`);
        }
    }

    if (xprops.createSubscription) {
        if (xprops.createOrder) {
            throw new Error(`Do not pass both createSubscription and createOrder`);
        }

        if (xprops.createBillingAgreement) {
            throw new Error(`Do not pass both createSubscription and createBillingAgreement`);
        }

        if (!xprops.vault) {
            throw new Error(`Must pass vault=true to sdk to use createSubscription`);
        }
    }

    if (intent === INTENT.TOKENIZE) {
        if (!xprops.createBillingAgreement) {
            throw new Error(`Must pass createBillingAgreement with intent=tokenize`);
        }

        if (xprops.createOrder || xprops.createSubscription) {
            throw new Error(`Must not pass createOrder or createSubscription with intent=tokenize`);
        }
    }

    if (intent === INTENT.SUBSCRIPTION) {
        if (!xprops.createSubscription) {
            throw new Error(`Must pass createSubscription with intent=subscription`);
        }

        if (xprops.createOrder || xprops.createBillingAgreement) {
            throw new Error(`Must not pass createOrder or createBillingAgreement with intent=tokenize`);
        }
    }

    return {
        ...getProps({ facilitatorAccessToken, branded, paymentSource, featureFlags, enableOrdersApprovalSmartWallet, smartWalletOrderID }),
        style,
        buttonSessionID,
        branded,
        inlinexo: experience === EXPERIENCE.INLINE
    };
}

export type Components = {|
    Checkout : CheckoutFlowType,
    CardForm : CardFormFlowType,
    ThreeDomainSecure : ThreeDomainSecureFlowType,
    Menu : MenuFlowType,
    Installments : InstallmentsFlowType,
    QRCode : QRCodeType,
    PaymentFields : PaymentFieldsFlowType
|};

export function getComponents() : Components {
    const { Checkout, CardForm, ThreeDomainSecure, Menu, Installments, QRCode, PaymentFields } = paypal;
    return { Checkout, CardForm, ThreeDomainSecure, Menu, Installments, QRCode, PaymentFields };
}

export type Config = {|
    sdkVersion : string,
    cspNonce : ?string,
    firebase : ?FirebaseConfig
|};

export function getConfig({ serverCSPNonce, firebaseConfig } : {| serverCSPNonce : ?string, firebaseConfig : ?FirebaseConfig |}) : Config {
    const cspNonce = serverCSPNonce || getNonce();
    const { version: sdkVersion } = paypal;

    return {
        sdkVersion,
        cspNonce,
        firebase: firebaseConfig
    };
}

export type ServiceData = {|
    merchantID : $ReadOnlyArray<string>,
    buyerCountry : $Values<typeof COUNTRY>,
    fundingEligibility : FundingEligibilityType,
    wallet : ?Wallet,
    facilitatorAccessToken : string,
    sdkMeta : string,
    buyerAccessToken : ?string,
    content : ContentType,
    eligibility : {|
        cardForm : boolean,
        paymentFields : InlinePaymentFieldsEligibility
    |},
    cookies : string,
    personalization : PersonalizationType,
    featureFlags: FeatureFlags
|};

type ServiceDataOptions = {|
    facilitatorAccessToken : string,
    buyerGeoCountry : $Values<typeof COUNTRY>,
    fundingEligibility : FundingEligibilityType,
    wallet : ?Wallet,
    buyerAccessToken : ?string,
    serverMerchantID : $ReadOnlyArray<string>,
    sdkMeta : string,
    content : ContentType,
    eligibility : {|
        cardFields : boolean,
        inlinePaymentFields : InlinePaymentFieldsEligibility
    |},
    cookies : string,
    personalization : PersonalizationType,
    featureFlags: FeatureFlags
|};

export function getServiceData({
    facilitatorAccessToken,
    sdkMeta,
    content,
    buyerGeoCountry,
    fundingEligibility,
    wallet,
    buyerAccessToken,
    serverMerchantID,
    eligibility,
    cookies,
    personalization,
    featureFlags
} : ServiceDataOptions) : ServiceData {

    return {
        merchantID:   serverMerchantID,
        buyerCountry: buyerGeoCountry || COUNTRY.US,
        fundingEligibility,
        wallet,
        sdkMeta,
        content,
        buyerAccessToken,
        facilitatorAccessToken,
        eligibility: {
            cardForm: eligibility.cardFields || false,
            paymentFields: eligibility.inlinePaymentFields || {
                inlineEligibleAPMs : [],
                isInlineEnabled : false
            }
        },
        cookies,
        personalization,
        featureFlags
    };
}
