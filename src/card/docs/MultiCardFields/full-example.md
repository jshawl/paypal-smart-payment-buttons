# Full Multi-Card Field Example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Checkout Page</title>
  </head>
  <body>
    <div id="checkout-form">
      <div id="card-name-field-container"></div>
      <div id="card-number-field-container"></div>
      <div id="card-expiry-field-container"></div>
      <div id="card-cvv-field-container"></div>
      <button id="multi-card-field-button" type="button">
        Pay now with Multi Card Fields
      </button>
    </div>
  </body>
  <script src="https://www.paypal.com/sdk/js?client-id=<your-client-id>&components=card-fields"></script>
  <script>
    // Custom Styles Object (optional)
    const styleObject = {
      input: {
        "font-size": "16 px",
        "font-family": "monospace",
        "font-weight": "lighter",
        color: "blue",
      },
      ".invalid": {
        color: "purple",
      },
      ":hover": {
        color: "orange",
      },
      ".purple": {
        color: "purple",
      },
    };
    // Create the Card Fields Component and define callbacks
    const cardField = paypal.CardFields({
      style: styleObject,
      createOrder: function (data, actions) {
        return fetch("/api/paypal/order/create/", {
          method: "post",
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
            // Redirect to success page
          });
      },
      inputEvents: {
        onChange: function (data) {
          // Handle a change event in any of the fields
        },
        onFocus: function (data) {
          // Handle a focus event in any of the fields
        },
        onBlur: function (data) {
          // Handle a blur event in any of the fields
        },
        onInputSubmitRequest: function (data) {
          // Handle an attempt to submit the entire card form
          // when a buyer hits the enter key (or mobile equivalent)
          // while focusing any of the fields
        },
      },
    });
    // Define Container for each field and the submit button
    const cardNameContainer = document.getElementById(
      "card-name-field-container",
    ); // Optional field
    const cardNumberContainer = document.getElementById(
      "card-number-field-container",
    );
    const cardCvvContainer = document.getElementById(
      "card-cvv-field-container",
    );
    const cardExpiryContainer = document.getElementById(
      "card-expiry-field-container",
    );

    const multiCardFieldButton = document.getElementById(
      "multi-card-field-button",
    );

    // Render each field after checking for eligibility
    if (cardField.isEligible()) {
      const nameField = cardField.NameField();
      nameField.render(cardNameContainer);

      const numberField = cardField.NumberField();
      numberField.render(cardNumberContainer);

      const cvvField = cardField.CVVField();
      cvvField.render(cardCvvContainer);

      const expiryField = cardField.ExpiryField();
      expiryField.render(cardExpiryContainer);

      // Add click listener to submit button and call the submit function on the CardField component
      multiCardFieldButton.addEventListener("click", () => {
        cardField
          .submit()
          .then(() => {
            // Handle a successful payment
          })
          .catch((err) => {
            // Handle an unsuccessful payment
          });
      });
    }
  </script>
</html>
```
