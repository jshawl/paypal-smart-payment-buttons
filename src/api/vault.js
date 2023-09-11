/* @flow */
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { VAULT_SETUP_TOKENS_API_URL, SMART_API_URI } from "../config";

import { callRestAPI, callGraphQL, callSmartAPI } from "./api";

export type PaymentSourceCardDetails = {|
  number: string,
  expiry: string,

  name?: string,
  security_code?: string,
  type?: "CREDIT" | "DEBIT" | "PREPAID" | "STORE" | "UNKNOWN",
  brand?: string,
  billing_address?: {|
    address_line_1?: string,
    address_line_2?: string,
    admin_area_1?: string,
    admin_area_2?: string,
    postal_code?: string,
    country_code: string,
  |},
  verification_method?: "string",
  experience_context?: Object,
|};

export type PaymentSourceCard = {|
  card: PaymentSourceCardDetails,
|};

export type PaymentSourcePayPalDetails = $Shape<{|
  billing_agreement_id: string,
  description: string,
  usage_pattern: string,
  shipping: Object,
  permit_multiple_payment_tokens: boolean,
  usage_type: string,
  customer_type: string,
  experience_context: Object,
|}>;

export type PaymentSourcePayPal = {|
  paypal: PaymentSourcePayPal,
|};

export type PaymentSource = PaymentSourceCard | PaymentSourcePayPal;

type VaultBasicOptions = {|
  vaultSetupToken: string,
  facilitatorAccessToken: string,
|};

type VaultTokenStatus =
  | "APPROVED"
  | "CREATED"
  | "PAYER_ACTION_REQUIRED"
  | "TOKENIZED"
  | "VAULTED";

type VaultSetupTokenResponse = {|
  id: string,
  customer: {|
    id: string,
  |},
  status: VaultTokenStatus,
  payment_source: Object,
  links: $ReadOnlyArray<{|
    href: string,
    rel: "approve" | "confirm" | "self",
    method: "GET" | "POST",
  |}>,
|};

export const getVaultSetupToken = ({
  vaultSetupToken,
  facilitatorAccessToken,
}: VaultBasicOptions): ZalgoPromise<VaultSetupTokenResponse> =>
  callRestAPI<void, VaultSetupTokenResponse>({
    accessToken: facilitatorAccessToken,
    url: `${VAULT_SETUP_TOKENS_API_URL}/${vaultSetupToken}`,
    eventName: "v3_vault_setup_tokens_get",
  });

export type PaymentSourceInput = {|
  card: {|
    number: string,
    expiry: string,
    name?: string,
    securityCode: string,
    billingAddress?: {|
      postalCode?: string,
      addressLine1?: string,
      addressLine2?: string,
      adminArea1?: string,
      adminArea2?: string,
      countryCode: string
    |},
  |},
|};

export const updateVaultSetupToken = ({
  clientID,
  vaultSetupToken,
  paymentSource,
  idToken,
}: {|
  clientID: string,
  vaultSetupToken: string,
  paymentSource: PaymentSourceInput,
  idToken: string,
|}): ZalgoPromise<{| id: string, status: VaultTokenStatus |}> =>
  callGraphQL<{| id: string, status: VaultTokenStatus |}>({
    name: "UpdateVaultSetupToken",
    query: `
      mutation UpdateVaultSetupToken(
        $clientID: String!
        $vaultSetupToken: String!
        $paymentSource: PaymentSource
        $idToken: String
      ) {
        updateVaultSetupToken(
          clientId: $clientID
          vaultSetupToken: $vaultSetupToken
          paymentSource: $paymentSource
          idToken: $idToken
        ) {
          id,
          status,
          links {
            rel, href
          }
        }
      }`,
    variables: {
      clientID,
      vaultSetupToken,
      paymentSource,
      idToken
    },
  });

export function vaultApprovalSessionIdToOrderId(
  approvalSessionId: string
): ZalgoPromise<string> {

  return callSmartAPI({
    authenticated: false,
    method: "post",
    eventName: "vault_ectoken",
    url: `${SMART_API_URI.VAULT}/${approvalSessionId}/ectoken`,
  }).then(({ data }) => {
    return data.token;
  })

}
