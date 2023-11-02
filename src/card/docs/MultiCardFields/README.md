# Multi Card Fields

- [Rendering](#rendering)
- [Styling](#styling)
- [Eligibility](#eligibility)
- [Input Events](#input-events)
- [Validation](#validation)
- [Methods](#methods)

### Rendering

Render the card fields component on your website, by creating an instance of paypal `CardFields` as below:

```js
const cardFields = paypal.CardFields({
  style,
  createOrder,
  onApprove,
});
```

#### Options

You can pass the following options when instantiating the card fields component:

- style: a custom style object (Optional, see [styling](#styling) for allowed properties)
- [createOrder](#createOrder): callback to create the order on your server (Required)
- [onApprove](onApprove): callback to capture the order on your server (Required)

# createOrder

Callback used to create an order id, for any case involving a purchase.

This callback will be invoked whenever the user takes an action to submit the card fields (e.g. clicks the merchant-supplied button).

### Create order from server

```javascript
const createOrder = (data, actions) => {
  return fetch("/api/paypal/order", {
    method: "POST",
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      return json.orderID;
    });
};
```

Setup your server to invoke the [Creat Order API](https://developer.paypal.com/docs/api/orders/v2/#orders_create). The button pressed on the client side will determine the "payment_source" that is sent in the below sample which presumes that in this case it was "Card".

#### Request

**Create Order with Card as a Payment Source**

```
curl -v -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders
-H "Content-Type: application/json" \
-H "Authorization: Bearer Access-Token" \
-d '{
    "intent": "CAPTURE",
    "purchase_units": [
        {
            "amount": {
                "currency_code": "USD",
                "value": "100.00"
            }
        }
    ],
}
```

#### Response

Pass the order.id to the PayPal JS SDK and it will update the order with the number, cvv, expiry date entered in a way such that the PCI burden in taken on by PayPal.

```json
{
            "id": "5O190127TN364715T",
            "status": "CREATED",
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": "d9f80740-38f0-11e8-b467-0ed5f89f718b",
                    "amount": {
                        "currency_code": "USD",
                        "value": "100.00"
                    }
                }
            ],
            "create_time": "2022-10-03T11:18:49Z",
            "links": [
                {
                    "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
                    "rel": "self",
                    "method": "GET"
                },
                {
                    "href": "https://www.paypal.com/checkoutnow?token=5O190127TN364715T",
                    "rel": "approve",
                    "method": "GET"
                },
                {
                    "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
                    "rel": "update",
                    "method": "PATCH"
                },
                {
                    "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T/capture",
                    "rel": "capture",
                    "method": "POST"
                }
            ]
        }
    }
```

## onApprove

Callback used to signal buyer approval of a purchase, e.g.

- Successfully entering a card and submitting it
- Clicking on a button and approving a payment

### Capture order from server

```js
const onApprove = (data, actions) => {
  return fetch("/api/paypal/order/capture", {
    method: "POST",
    body: JSON.stringify({
      orderID: data.orderID,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      // Show a success page
    });
};
```

Setup your server to invoke the [Capture Order API](https://developer.paypal.com/docs/api/orders/v2/#orders_capture).

#### Request

```
curl -v -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders/<order_id>/capture \
-H "Content-Type: application/json" \
-H "Authorization: Bearer Access-Token" \
```

#### Response

```json
{
  "id": "some_id",
  "status": "COMPLETED",
  "payment_source": {
    "card": {
      "brand": "VISA",
      "last_digits": "1111",
      "type": "CREDIT"
    }
  },
  "purchase_units": [
    {
      "reference_id": "reference_id",
      "payments": {
        "authorizations": [
          {
            "id": "id",
            "status": "CREATED",
            "amount": {
              "currency_code": "USD",
              "value": "100.00"
            },
            "seller_protection": {
              "status": "ELIGIBLE",
              "dispute_categories": [
                "ITEM_NOT_RECEIVED",
                "UNAUTHORIZED_TRANSACTION"
              ]
            },
            "expiration_time": "2022-10-04T14:37:39Z",
            "links": [
              {
                "href": "https://api-m.paypal.com/v2/payments/authorizations/5O190127TN364715T",
                "rel": "self",
                "method": "GET"
              },
              {
                "href": "https://api-m.paypal.com/v2/payments/authorizations/5O190127TN364715T/capture",
                "rel": "capture",
                "method": "POST"
              },
              {
                "href": "https://api-m.paypal.com/v2/payments/authorizations/5O190127TN364715T/void",
                "rel": "void",
                "method": "POST"
              },
              {
                "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
                "rel": "up",
                "method": "GET"
              }
            ]
          }
        ]
      }
    }
  ],
  "payer": {
    "name": {
      "given_name": "John",
      "surname": "Doe"
    },
    "email_address": "customer@example.com",
    "payer_id": "QYR5Z8XDVJNXQ"
  },
  "links": [
    {
      "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
      "rel": "self",
      "method": "GET"
    }
  ]
}
```

### Available Fields

#### Card Name Field (optional)

Render an optional name field.

```js
const cardNameContainer = document.getElementById("card-name-field-container");

const nameField = cardField.NameField();
nameField.render(cardNameContainer);
```

#### Card Number Field

Render a card number field. This field is required to capture a payment.

```js
const cardNumberContainer = document.getElementById(
  "card-number-field-container",
);

const numberField = cardField.NumberField();
numberField.render(cardNumberContainer);
```

#### Card Expiry Date Field

Render a card expiry date field. This field is required to capture a payment.

```js
const cardExpiryContainer = document.getElementById(
  "card-expiry-field-container",
);

const expiryField = cardField.ExpiryField();
expiryField.render(cardExpiryContainer);
```

#### Card CVV Field

Render a card cvv field. This field is required to capture a payment.

```js
const cardCvvContainer = document.getElementById("card-cvv-field-container");

const cvvField = cardField.CVVField();
cvvField.render(cardCvvContainer);
```

#### Placeholders

Each card field has a default placeholder text. You can override this text by passing a placeholder object when creating the field.

```js
const nameField = cardField.NameField({
  placeholder: "Enter your full name as it appears on your card",
});
```

### Styling

Override the styles for your card fields instance by leveraging the following style [properties](#properties) and [selectors](#selectors)

##### Properties

- `appearance`
- `color`
- `direction`
- `font`
- `font-family`
- `font-size`
- `font-size-adjust`
- `font-stretch`
- `font-style`
- `font-variant`
- `font-variant-alternates`
- `font-variant-caps`
- `font-variant-east-asian`
- `font-variant-ligatures`
- `font-variant-numeric`
- `font-weight`
- `letter-spacing`
- `line-height`
- `outline`
- `opacity`
- `padding`
- `text-shadow`
- `transition`
- `-moz-appearance`
- `-moz-osx-font-smoothing`
- `-moz-tap-highlight-color`
- `-webkit-osx-font-smoothing`
- `-webkit-tap-highlight-color`
- `-webkit-transition`

##### Selectors

- `:hover`
- `.valid`
- `.invalid`
- `@media`

#### Example

Style objects can be passed into the parent `CardFields` component to apply the style object to every field, or can be passed into each card field individually to apply the style only to that field.

##### Passing the Style Object to the parent CardField

```js
const cardStyle = {
  input: {
    "font-size": "16px",
    "font-family": "courier, monospace",
    "font-weight": "lighter",
    color: "#ccc",
  },
  ".invalid": {
    color: "purple",
  },
};

paypal
  .CardFields({
    style: cardStyle,
  })
  .render("#card-field-container");
```

##### Passing the style object to an individual field

```js
const nameFieldStyle = {
    'input': {
        'color': 'blue'
    }
    '.invalid': {
        'color': 'purple',
    },
}
const nameField = cardField.NameField({
    style: nameFieldStyle
});
```

## Eligibility

##### Detect Eligibility

```js
const cardFields = paypal.CardFields({
  /* options */
});

if (cardFields.isEligible()) {
  cardFields.NumberField().render("#card-number-field-container");
  cardFields.CVVField().render("#card-cvv-field-container");
  cardFields.ExpiryField().render("#card-expiry-field-container");
}
```

## Input Events

You can pass an optional `inputEvents` object into either the parent `CardFields` component, which will pass down each callback as props to the child components (each individual field), or directly into each field component. If you pass the `inputEvents` object into both the `CardFields` and individual field components, the object passed into the field components directly will take precedent.

#### Input Events Callbacks:

- onChange: gets called when the input in any field changes
- onFocus: gets called when any field gets focus
- onBlur: gets called when any field loses focus
- onInputSubmitRequest: gets called when a user attempts to submit the field by pressing the enter key in any of the fields

#### Examples

##### Passing the `inputEvents` object into the parent `CardFields` component

```js
const cardField = paypal.CardFields({
    inputEvents: {
        onChange: function(data) => {
            // do something when an input changes
        },
        onFocus: function(data) => {
            // do something when a field gets focus
        },
        onBlur: function(data) => {
            // do something when a field loses focus
        }
        onInputSubmitRequest: function(data) => {
            if (data.isFormValid) {
                // submit the card form for the user
            } else {
                // inform buyer that some field(s) are not yet valid
            }
        }
    }
})
```

##### Passing the `inputEvents` object into each individual field component

```js

const cardField = paypal.CardFields(/* options */)
const nameField = cardField.NameField({
       inputEvents: {
        onChange: function(data) => {
            // do something when only the input of the name field changes
        },
        onFocus: function(data) => {
            // do something when only the name field gets focus
        },
        onBlur: function(data) => {
            // do something when only the name field loses focus
        }
        onInputSubmitRequest: function(data) => {
            if (data.isFormValid) {
                // submit the card form for the user
            } else {
                // inform buyer that some field(s) are not yet valid
            }
        }
    }
});
```

### State Object

Each of the event callbacks will return a state object as follows:

```js
data: {
    cards: ['array of potential card types'],
    emittedBy: 'field that emitted the event',
    isFormValid: 'boolean showing whether the field is valid or not',
    fields: {
        nameField: {
            isFocused: 'boolean showing if field is currently focused or not',
            isEmpty: 'boolean showing if field is currently empty or not',
            isValid: 'boolean showing if field is currently valid or not'
            isPotentiallyValid: 'boolean showing if field can be valid or not'
        },
        numberField: {
            isFocused: 'boolean showing if field is currently focused or not',
            isEmpty: 'boolean showing if field is currently empty or not',
            isValid: 'boolean showing if field is currently valid or not'
            isPotentiallyValid: 'boolean showing if field can be valid or not'
        },
        cvvField: {
            isFocused: 'boolean showing if field is currently focused or not',
            isEmpty: 'boolean showing if field is currently empty or not',
            isValid: 'boolean showing if field is currently valid or not'
            isPotentiallyValid: 'boolean showing if field can be valid or not'
        },
        expiryField: {
            isFocused: 'boolean showing if field is currently focused or not',
            isEmpty: 'boolean showing if field is currently empty or not',
            isValid: 'boolean showing if field is currently valid or not'
            isPotentiallyValid: 'boolean showing if field can be valid or not'
        },
    },
}
```

## Validation

##### Validate Individual Fields

```js
const cardFields = paypal.CardFields({
  /* options */
});

const cardContainer = document.getElementById("#card-number-field-container");

const cardNumberField = cardFields.NumberField({
  // add valid or invalid class when the validation changes on the field
  inputEvents: {
    onChange: (data) => {
      cardContainer.className = data.fields.cardNumberField.isValid
        ? "valid"
        : "invalid";
    },
  },
});
```

#### Validate Entire Card Form

```js
const formContainer = document.getElementById("form-container");

const cardFields = paypal.CardFields({
  inputEvents: {
    onChange: (data) => {
      formContainer.className = data.isFormValid ? "valid" : "invalid";
    },
  },
});
```

## Methods

#### addClass

Add a class to a field. Useful for updating field styles when events occur elsewhere in your checkout

| Parameters | Type   | Description            |
| ---------- | ------ | ---------------------- |
| classname  | string | The class to be added. |

```js
const cardField = paypal.CardFields(/* options */);
const numberField = cardField.NumberField(/* options */);
numberField.render(cardNumberContainer);
numberField.addClass("purple");
```

### clear

Clears the value of a field.

```js
const cardField = paypal.CardFields(/* options */);
const nameField = cardField.NameField(/* options */);
nameField.render(cardNameContainer);
nameField.clear();
```

### focus

Programmatically focus a field.

```js
const cardField = paypal.CardFields(/* options */);
const nameField = cardField.NameField(/* options */);
nameField.render(cardNameContainer);
nameField.focus();
```

### getState

Returns a promise that resolves into [state object](#state-object). It includes the state of all fields and possible card types

#### Example

```js
const cardField = paypal.CardFields(/* options */);
const nameField = cardField.NameField(/* options */);
nameField.render(cardNameContainer);

cardField
  .getState()
  .then((res) => {
    //checking if each field is empty
    const emptyField = Object.keys(res.fields).forEach((field) => {
      return res.fields[field].isEmpty;
    });
  })
  .catch((err) => {
    console.log(err);
  });

var formValid = Object.keys(state.fields).every(function (key) {
  return state.fields[key].isValid;
});
```

### removeAttribute

Removes a supported attribute from a field.

| Parameters | Type   | Description                                                  |
| ---------- | ------ | ------------------------------------------------------------ |
| attribute  | string | The name of the attribute you wish to remove from the field. |

```js
const cardField = paypal.CardFields(/* options */);
const numberField = cardField.NumberField(/* options */);
numberField.render(cardNumberContainer);
numberField.removeAttribute("placeholder");
```

### removeClass

Removes a class from a field. Useful for updating field styles when events occur elsewhere in your checkout.

| Parameters | Type   | Description              |
| ---------- | ------ | ------------------------ |
| classname  | string | The class to be removed. |

```js
const cardField = paypal.CardFields(/* options */);
const numberField = cardField.NumberField(/* options */);
numberField.render(cardNumberContainer);
numberField.removeClass("purple");
```

### setAttribute

Sets an attribute of a field. Supported attributes are `aria-invalid`, `aria-required`, `disabled`, and `placeholder`.

| Parameters | Type   | Description                             |
| ---------- | ------ | --------------------------------------- |
| attribute  | string | The attribute to be added to the field. |
| value      | string | The value for the attribute             |

```js
const cardField = paypal.CardFields(/* options */);
const nameField = cardField.NameField(/* options */);
nameField.render(cardNameContainer);
nameField.setAttribute("placeholder", "Enter your full name");
```

### setMessage

Sets a visually hidden message for screen readers on a field

| Parameters | Type   | Description                            |
| ---------- | ------ | -------------------------------------- |
| message    | string | The message to set for screen readers. |

```js
const cardField = paypal.CardFields(/* options */);
const nameField = cardField.NameField(/* options */);
nameField.render(cardNameContainer);
nameField.setMessage("Please type your name as it appears on your credit card");
```

### submit

Submit the payment information

```js
// Add click listener to merchant-supplied submit button and call the submit function on the CardField component
multiCardFieldButton.addEventListener("click", () => {
  cardField
    .submit()
    .then(() => {
      console.log("multi card fields submit");
    })
    .catch((err) => {
      console.log("There was an error with multi card fields: ", err);
    });
});
```

## Full Example

See our [full example](full-example.md) of a basic integration for an idea on how to get started
