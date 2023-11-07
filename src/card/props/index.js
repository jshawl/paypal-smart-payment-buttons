/* @flow */
/* eslint-disable flowtype/require-exact-type */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import {
  FUNDING,
  CARD,
  type FundingEligibilityType,
} from "@paypal/sdk-constants/src";

import type {
  ProxyWindow,
  FeatureFlags,
  ThreeDomainSecureFlowType,
} from "../../types";
import { PAYMENT_FLOWS } from "../../constants";
import {
  getProps,
  type OnError,
  type XOnApprove,
  type XOnError,
  type SaveActionOnApprove,
  type XProps,
  type Props,
} from "../../props";
import type {
  CardStyle,
  CardPlaceholder,
  CardFieldsState,
  ParsedCardType,
  FieldsState,
} from "../types";
import { CARD_FIELD_TYPE, CARD_ERRORS, SUBMIT_ERRORS } from "../constants";

import {
  getCreateVaultSetupToken,
  type XCreateVaultSetupToken,
  type CreateVaultSetupToken,
} from "./createVaultSetupToken";
import {
  getCreateOrder,
  type CreateOrder,
  type XCreateOrder,
} from "./createOrder";

// export something to force webpack to see this as an ES module
export const TYPES = true;

export type PrerenderDetailsType = {|
  win?: ?ProxyWindow,
  fundingSource: $Values<typeof FUNDING>,
  card?: ?$Values<typeof CARD>,
|};

export type CardExport = ({|
  submit: () => ZalgoPromise<void>,
  getState: () => CardFieldsState,
|}) => ZalgoPromise<void>;

export type InputEventState = {|
  cards: $ReadOnlyArray<ParsedCardType>,
  emittedBy: string,
  fields: FieldsState,
  errors: [$Values<typeof CARD_ERRORS>] | [],
  isFormValid: boolean,
|};

export type OnChange = ({| ...InputEventState |}) => ZalgoPromise<void>;

export type OnBlur = (InputEventState) => ZalgoPromise<void>;

export type OnFocus = (InputEventState) => ZalgoPromise<void>;

export type OnInputSubmitRequest = (InputEventState) => ZalgoPromise<void>;

export type InputEvents = {
  onChange?: OnChange,
  onFocus?: OnFocus,
  onBlur?: OnBlur,
  onInputSubmitRequest?: OnInputSubmitRequest,
};

export type CardXProps = {|
  ...XProps,
  type: $Values<typeof CARD_FIELD_TYPE>,
  style: CardStyle,
  placeholder: CardPlaceholder,
  minLength?: number,
  maxLength?: number,
  cardSessionID: string,
  fundingEligibility: FundingEligibilityType,
  inputEvents: InputEvents,
  export: CardExport,
  parent?: {|
    props: XProps,
    export: CardExport,
  |},
  onApprove?: ?XOnApprove,
  onError?: XOnError,
  createOrder?: XCreateOrder,
  createVaultSetupToken: XCreateVaultSetupToken,
  hcfSessionID: string,
  clientMetadataID: string,
  userIDToken: string,
|};

export type CardProps = {|
  ...Props,
  type: $Values<typeof CARD_FIELD_TYPE>,
  branded: boolean,
  style: CardStyle,
  placeholder: CardPlaceholder,
  minLength?: number,
  maxLength?: number,
  cardSessionID: string,
  fundingEligibility: FundingEligibilityType,
  export: CardExport,
  inputEvents: InputEvents,
  facilitatorAccessToken: string,
  disableAutocomplete?: boolean,
  hcfSessionID: string,
  createOrder?: CreateOrder,
  createVaultSetupToken?: XCreateVaultSetupToken,
  onApprove: SaveActionOnApprove,
  onError: OnError,
  productAction: string,
  clientMetadataID: string,
  userIDToken: string,
|};

export type PurchaseFlowCardProps = {|
  ...CardProps,
  createOrder: CreateOrder,
|};

export type VaultWithoutPurchaseFlowCardProps = {|
  ...CardProps,
  createVaultSetupToken: CreateVaultSetupToken,
|};

type GetCardPropsOptions = {|
  facilitatorAccessToken: string,
  featureFlags: FeatureFlags,
  experiments: {
    hostedCardFields: boolean,
    useIDToken: boolean,
  },
|};

export type Components = {|
  ThreeDomainSecure: ThreeDomainSecureFlowType,
|};

export function getComponents(): Components {
  const { ThreeDomainSecure } = paypal;
  return { ThreeDomainSecure };
}
const determineProductAction = ({
  createOrder,
  createVaultSetupToken,
}: {
  createOrder: ?XCreateOrder,
  createVaultSetupToken: XCreateVaultSetupToken,
}): string => {
  if (createOrder) {
    return PAYMENT_FLOWS.WITH_PURCHASE;
  }

  if (createVaultSetupToken) {
    return PAYMENT_FLOWS.VAULT_WITHOUT_PURCHASE;
  }

  // the current props setup guards against this. In a future refactor,
  // it would be great to determine the flow upfront and throw an error
  // to the merchant letting them know we can't determine what product
  // action they are attempting to tie to the Card Fields
  return "unknown";
};

export function getCardProps({
  facilitatorAccessToken,
  experiments,
}: GetCardPropsOptions): CardProps {
  if (!experiments.hostedCardFields) {
    throw new Error(SUBMIT_ERRORS.NOT_FEATURE_FLAGGED);
  }

  const xprops: CardXProps = window.xprops;

  const {
    type,
    cardSessionID,
    style,
    placeholder,
    minLength,
    maxLength,
    fundingEligibility,
    inputEvents,
    branded = fundingEligibility?.card?.branded ?? true,
    parent,
    export: xport,
    createVaultSetupToken,
    createOrder,
    sdkCorrelationID,
    partnerAttributionID,
    hcfSessionID,
    userIDToken,
  } = xprops;

  const returnData = {
    type,
    branded,
    style,
    placeholder,
    minLength,
    maxLength,
    cardSessionID,
    fundingEligibility,
    inputEvents,
    export: parent ? parent.export : xport,
    facilitatorAccessToken,
    sdkCorrelationID,
    partnerAttributionID,
    hcfSessionID,
    userIDToken,
  };

  const baseProps = getProps({ branded });

  if (createVaultSetupToken && createOrder) {
    throw new Error(SUBMIT_ERRORS.PASSING_BOTH_FUNCTIONS);
  }

  if (!createVaultSetupToken && !createOrder) {
    throw new Error(SUBMIT_ERRORS.MISSING_BOTH_FUNCTIONS);
  }

  if (createVaultSetupToken && !xprops?.onApprove) {
    throw new Error(SUBMIT_ERRORS.MISSING_ONAPPROVE);
  }

  // $FlowFixMe
  return {
    ...baseProps,
    ...returnData,
    // $FlowFixMe xprops can be undefined
    createOrder: getCreateOrder({ createOrder: xprops.createOrder }),
    // $FlowFixMe xprops can be undefined
    createVaultSetupToken: getCreateVaultSetupToken({
      createVaultSetupToken: xprops.createVaultSetupToken,
    }),
    // $FlowFixMe xprops can be undefined
    onApprove: xprops.onApprove,
    // $FlowFixMe xprops can be undefined
    onError: xprops.onError,
    productAction: determineProductAction({
      createOrder: xprops.createOrder,
      createVaultSetupToken: xprops.createVaultSetupToken,
    }),
  };
}

/* eslint-enable flowtype/require-exact-type */
