# Vaulting with HCF

- [Vault with Purchase](#vault-with-purchase)
- [Vault without Purchase](#vault-without-purchase)
- [Error states](#error-states)

## Vault with Purchase

### General Flow

1. Define the `CardFields` `createOrder` callback to pass relevant payment information (excluding card details) and desire to vault payment method to server-side API.
2. API calls `POST v2/checkout/orders` with `vault` field.
3. The order is successfully created and the `orderId` is returned.
4. Define the `CardFields` `onApprove` callback to pass the returned `orderId` to server-side API.
5. API calls `POST v2/checkout/orders/${orderId}/capture`, vault details are returned, stored by merchant, and processing continues as usual.

### Modifications to `createOrder`

In order to vault the card, an indicator needs to be set inside of `createOrder` to pass through to the `POST v2/checkout/orders` call; for example, a checkbox on a page that, when checked, includes the vault parameter in the body passed to the server-side API. (A general overview of the `createOrder` function can be found in the [Multi Card Fields documentation](../MultiCardFields/README.md#createOrder).)

`vault.store_in_vault`: indicates desire to vault purchase method. A value of `"ON_SUCCESS"` indicates the vault will occur only upon successful order capture.

```js
let vaulting = vaultCheckbox.checked;
if (vaulting) {
  payload.payment_source = {
    card: {
      attributes: {
        vault: {
          store_in_vault: "ON_SUCCESS",
        },
      },
    },
  };
}
```

### Modifications to `onApprove`

After the order is successfully created via `createOrder`, the order needs to be captured. This is done by defining the `CardFields.onApprove` callback to pass the orderId to a server-side API that calls `POST v2/checkout/orders/${orderId}/capture`. No vault specific data is required in the body of the call. Once the order is successfully captured, the response will include the vaulting data. (A general overview of the `onApprove` callback can be found in the [Multi Card Fields documentation](../MultiCardFields/README.md#onApprove).)

Depending on the type of card being used, several different responses may be returned to indicate the vaulting status. Generally, if vaulting occurred successfully, you will see the `payment_source.card.attributes.vault` field populated with an `id` field. This is the id of the vaulted payment method that can be stored and used to retrieve the vaulted payment method for subsequent transactions. Additionally, a `customer.id` will be generated if this is a first time buyer. The merchant will need to store this `customer.id` to use for future calls to retrieve existing vaulted payment methods. Example response:

```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "payment_source": {
    "card": {
      "last_digits": "1111",
      "brand": "VISA",
      "attributes": {
        "vault": {
          "id": "7dyps8w",
          "status": "VAULTED",
          "customer": {
            "id": "wxj1234"
          },
          "links": [
            {
              "href": "https://api-m.paypal.com/v3/vault/payment-tokens/7dyps8w",
              "rel": "self",
              "method": "GET"
            },
            {
              "href": "https://api-m.paypal.com/v3/vault/payment-tokens/7dyps8w",
              "rel": "delete",
              "method": "DELETE"
            },
            {
              "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
              "rel": "up",
              "method": "GET"
            }
          ]
        }
      }
    }
  }
```

### Card Specific Requirements

#### Visa & Mastercard

No special considerations required for Visa or Mastercard vault implementation.

#### American Express

Vaulting with American Express requires the merchant to be subscribed to the American Express OptBlue feature.

### Examples of vaulting modifications:

In this example you can see the `createOrder` callback defining a payload to include a customer id and the vault command, and then included in the `fetch()` call.

#### First Time Buyer

```js
const cardField = paypal.CardFields({
    style: styleObject,
    createOrder: function (data, actions) {
      const payload = {
        payment_source: {
          card: {
            attributes: {
              vault: {
                store_in_vault: "ON_SUCCESS",
              },
            },
          },
        };
      };
      return fetch("/api/paypal/order/create/", {
        method: "post",
        payload,
        })
        .then((res) => {
            return res.json();
        })
        .then((orderData) => {
            return orderData.id;
        });
    },
    onApprove: function (data, actions) {
        const { orderID } = data;
        return fetch(`/api/paypal/orders/${orderID}/capture/`, {
        method: "post",
        })
        .then((res) => {
            return res.json();
        })
        .then((orderData) => {
            // Retrieve customer and vault details from response
            const vault = orderData?.paymentSource?.card?.attributes?.vault;
            if (vault) {
              // custom function for merchant to save vault.id and vault.customer.id
            }
            // Redirect to success page
        });
    },
    inputEvents: {
        onChange: function (data) {
            // Handle a change event in any of the fields
        },
        onFocus: function(data) {
            // Handle a focus event in any of the fields
        },
        onBlur: function(data) {
            // Handle a blur event in any of the fields
        },
        onInputSubmitRequest: function(data) {
            // Handle an attempt to submit the entire card form
            // when a buyer hits the enter key (or mobile equivalent)
            // while focusing any of the fields
        }
    },
});
```

#### Return Buyer

// todo

## Vault without Purchase

// todo

## Error States

// todo
