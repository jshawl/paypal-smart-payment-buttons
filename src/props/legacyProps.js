/* @flow */

import { INTENT, FUNDING, CURRENCY } from '@paypal/sdk-constants/src';

import type { FeatureFlags } from '../types';

import { getCreateBillingAgreement } from "./createBillingAgreement"
import { getCreateSubscription } from "./createSubscription"
import { getCreateOrder } from "./createOrder"
import { getOnApprove } from "./onApprove"
import { getOnComplete } from "./onComplete"
import { getOnCancel } from "./onCancel"
import { getOnShippingChange } from "./onShippingChange"
import { getOnShippingAddressChange } from "./onShippingAddressChange"
import { getOnShippingOptionsChange } from "./onShippingOptionsChange"
import { getOnAuth } from "./onAuth"
import { getCreateVaultSetupToken } from './createVaultSetupToken';

import type { CreateOrder, XCreateOrder, CreateBillingAgreement, XCreateBillingAgreement, OnApprove, XOnApprove, OnComplete, XOnComplete, OnCancel, XOnCancel, OnShippingChange, XOnShippingChange, OnShippingAddressChange, XOnShippingAddressChange,
    OnShippingOptionsChange, XOnShippingOptionsChange,
    OnError, XCreateSubscription, XCreateVaultSetupToken, OnAuth
} from '.';

export type LegacyPropOptions = {|
  paymentSource : $Values<typeof FUNDING> | null,
  partnerAttributionID : ?string,
  merchantID : $ReadOnlyArray<string>,
  clientID : string,
  facilitatorAccessToken : string,
  currency : $Values<typeof CURRENCY>,
  intent : $Values<typeof INTENT>,
  enableOrdersApprovalSmartWallet? : boolean | void,
  smartWalletOrderID? : string | void,
  branded : boolean | null,
  clientAccessToken : ?string,
  vault : boolean,
  featureFlags: FeatureFlags,
  onApprove : ?XOnApprove,
  onComplete? : ?XOnComplete,
  onCancel : XOnCancel,
  onError : OnError,
  onShippingChange : ?XOnShippingChange,
  onShippingAddressChange : ?XOnShippingAddressChange,
  onShippingOptionsChange : ?XOnShippingOptionsChange,
  createOrder : ?XCreateOrder,
  createSubscription : ?XCreateSubscription,
  createBillingAgreement : ?XCreateBillingAgreement,
  createVaultSetupToken: ?XCreateVaultSetupToken,
  flow: ?string
|}


export type LegacyProps = {|
  createOrder : CreateOrder,

  onApprove : OnApprove,
  onComplete : OnComplete,
  onCancel : OnCancel,
  onAuth : OnAuth,

  createBillingAgreement : ?CreateBillingAgreement,
  createSubscription : ?XCreateSubscription,

  onShippingChange : ?OnShippingChange,
  onShippingAddressChange : ?OnShippingAddressChange,
  onShippingOptionsChange : ?OnShippingOptionsChange,
|}

/**
 * Props associated with Checkout and Subscriptions. With the introduction of Actions, we ultimately want this model to go away
 * and for Checkout/Subscriptions to be their own actions with their own independent validations/props.
 */
export function getLegacyProps({
  paymentSource,
  partnerAttributionID,
  merchantID,
  clientID,
  facilitatorAccessToken,
  currency,
  intent,
  enableOrdersApprovalSmartWallet,
  smartWalletOrderID,
  branded,
  clientAccessToken,
  vault = false,
  featureFlags,
  createBillingAgreement: inputCreateBillingAgreement,
  createSubscription: inputCreateSubscription,
  createOrder: inputCreateOrder,
  onError,
  onApprove: inputOnApprove,
  onComplete: inputOnComplete,
  onCancel: inputOnCancel,
  onShippingChange: inputOnShippingChange,
  onShippingAddressChange: inputOnShippingAddressChange,
  onShippingOptionsChange: inputOnShippingOptionsChange,
  createVaultSetupToken: inputCreateVaultSetupToken,
  flow
} : LegacyPropOptions) : LegacyProps {
  const createBillingAgreement = getCreateBillingAgreement({ createBillingAgreement: inputCreateBillingAgreement, paymentSource });
  const createSubscription = getCreateSubscription({ createSubscription: inputCreateSubscription, partnerAttributionID, merchantID, clientID, paymentSource }, { facilitatorAccessToken });

  const createVaultSetupToken = getCreateVaultSetupToken({ createVaultSetupToken: inputCreateVaultSetupToken });

   const createOrder = getCreateOrder({ createOrder: inputCreateOrder, currency, intent, merchantID, partnerAttributionID, paymentSource }, { facilitatorAccessToken, createBillingAgreement, createSubscription, enableOrdersApprovalSmartWallet, smartWalletOrderID, createVaultSetupToken, flow });

   const onApprove = getOnApprove({ onApprove: inputOnApprove, createBillingAgreement, createSubscription, intent, onError, partnerAttributionID, clientAccessToken, vault, clientID, facilitatorAccessToken, branded, createOrder, paymentSource, featureFlags, createVaultSetupToken, flow });
   const onComplete = getOnComplete({ intent, onComplete: inputOnComplete, partnerAttributionID, onError, clientID, facilitatorAccessToken, createOrder, featureFlags });
   const onCancel = getOnCancel({ onCancel: inputOnCancel, onError }, { createOrder });
   const onShippingChange = getOnShippingChange({ onShippingChange: inputOnShippingChange, partnerAttributionID, featureFlags  }, { facilitatorAccessToken, createOrder });
   const onShippingAddressChange = getOnShippingAddressChange({ onShippingAddressChange: inputOnShippingAddressChange, clientID }, { createOrder });
   const onShippingOptionsChange = getOnShippingOptionsChange({ onShippingOptionsChange: inputOnShippingOptionsChange, clientID }, { createOrder });
   const onAuth = getOnAuth({ facilitatorAccessToken, createOrder, createSubscription, featureFlags });

  return {
    createBillingAgreement,
    createSubscription,
    createOrder,
    onApprove,
    onComplete,
    onCancel,
    onShippingChange,
    onShippingAddressChange,
    onShippingOptionsChange,
    onAuth
  }
}