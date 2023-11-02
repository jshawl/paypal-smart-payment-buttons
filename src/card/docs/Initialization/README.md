# JS SDK Initialization

## Script Tag

- Load the SDK from `paypal.com/sdk/js?client-id=xyz`
- This provides the `window.paypal` namespace

```html
<script src="https://www.paypal.com/sdk/js?client-id=<YOUR_CLIENT_ID>&components=card-fields" />

<script>
  paypal.CardFields({...})
</script>
```

### Initialization Parameters

Initialization Parameters can be passed via the script url query, and/or via data attributes. e.g.

```html
<script
  src="https://www.paypal.com/sdk/js?client-id=test&components=card-fields"
  data-user-id-token="xyz"
></script>
```

- **URL Query Paramers** shall be used where:
  - The parameter is required for the initialization of the SDK on the server (e.g. eligibility decisioning)
  - The parameter is highly cacheable for different users on the same merchant page (e.g. client id, currency)
- **Data Attribute Parameters** shall be used where:
  - The parameter is required only on the client-side for initialization of the SDK (e.g. user id token)
  - The parameter is not highly cacheable for different users on the same merchant page (e.g. client metadata id)

#### URL Query Paramers

##### client-id

- Mandatory
- Default: not set
- The Client ID of the merchant directly accepting payments

Example:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test"></script>
```

##### components

- Optional
- Default: buttons

Components which should be loaded as part of the SDK. Comma-separated, dashed names.

Available components:

- `buttons`
- `card-fields`
- `marks`
- `messages`
- `checkout`
- `auth-button`

Different components export different globals to the `window.paypal` namespace, e.g.

- `buttons` exports `paypal.Buttons`
- `card-fields` exports `paypal.CardFields`

Example:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test&components=buttons,card-fields"></script>
```

##### commit

- Optional
- Default: true

Is the user committing to an immediate payment, or are there additional steps:

- `commit=true`: 'Pay Now', capture the payment immediately after buyer approval
- `commit=false`: 'Continue', additional steps required after buyer approval (e.g. auth/capture or upsells)

Example:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test&commit=false"></script>
```

##### currency

- Optional
- Default: USD

The currency for any transactions via the SDK.

Available countries: See [Currency Support](./support/currencies.md)

Example:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test&currency=EUR"></script>
```

##### debug

- Optional
- Default: false

Put the SDK in debug mode

- `debug=false`: SDK is minified, mangled, etc.
- `debug=true`: SDK is unminified

Example:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test&debug=true"></script>
```

##### Intent

- Optional
- Default: `capture`

Which intent to use for the transaction

- `capture`: Immediate capture (can be used for sale transactions with legacy apis)
- `authorize`: Auth-Capture (can be used for order transactions with legacy apis)
- `subscription`: Subscription setup
- `tokenize`: Vault or tokenize only

Example:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test&intent=authorize"></script>
```

##### Locale

- Optional
- Default: derived from browser settings

Locale with which to render SDK experiences.

Available locales: See [Languages](./support/languages.md)

Example:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test&locale=fr_FR"></script>
```

#### Data Attribute Parameters

##### data-namespace

- Optional
- Default: paypal

Use a different global namespace on the page to export the PayPal SDK.

Example:

```html
<script
  src="https://www.paypal.com/sdk/js?client-id=test"
  data-namespace="paypal_sdk"
></script>

<script>
  paypal_sdk.Foo();
</script>
```

##### data-csp-nonce

- Optional
- Default: none

CSP Nonce used for script/style elements which are rendered directly onto the page where the SDK is invoked.

Example:

```html
<script
  src="https://www.paypal.com/sdk/js?client-id=test"
  data-csp-nonce="XYZ"
></script>
```

##### data-user-id-token

- Optional
- Default: none

Used to pass buyer identity through the SDK. Requires id-token in JWT format. Can contain:

- Customer ID: vaulting cases
- PayPal Payer ID: identity linking / returning billing user cases

Example:

```html
<script
  src="https://www.paypal.com/sdk/js?client-id=test"
  data-user-id-token="XYZ"
></script>
```

##### data-page-type

- Optional
- Default: none

Identify the page type the SDK is loaded on, for tracking purposes.

- `product-listing`: Product listing page
- `search-results`: Search Results page
- `product-details`: Product details page
- `mini-cart`: Mini-cart component
- `checkout`: Checkout page

Example:

```html
<script
  src="https://www.paypal.com/sdk/js?client-id=test"
  data-page-type="product-details"
></script>
```

##### data-partner-attribution-id

- Optional
- Default: none

Used to attribute transactions to a particular partner account.

Example:

```html
<script
  src="https://www.paypal.com/sdk/js?client-id=test"
  data-partner-attribution-id="XYZ"
></script>
```

##### data-client-metadata-id

- Optional
- Default: Order ID / Autogenerated

Used for risk tracking. Unique per transaction

Example:

```html
<script
  src="https://www.paypal.com/sdk/js?client-id=test"
  data-client-metadata-id="XYZ"
></script>
```

##### data-enable-3ds

- Optional
- Default: none

Pass to enable 3DS for unbranded payment flows

## NPM Module

```sh
npm install @paypal/paypal-js
```

```js
import { loadScript } from "paypal";

const configuration = {
  clientID: "<YOUR_CLIENT_ID>",
};

try {
  await loadScript(configuration);
} catch (error) {
  console.error(error);
}
```
