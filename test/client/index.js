/* @flow */

import { setupMocks } from "./mocks";

import "./happy";
import "./actions";
import "./actions-fallback";
import "./contingency";
import "./contingency-fallback";
import "./funding";
import "./wallet";
import "./error";
import "./validation";
import "./prerender";
import "./vault";
import "./clientConfig";
import "./popupBridge";
import "./card";
import "./native";
import "./native-qrcode";
import "./nativePopup";
import "./payee";
import "./connect";
import "./smart-fields";
import "./popup";
import "./applepay";
import "./applepay-utils";
import "./exports";
import "./card-fields";
import "./data";
import "./props-utils";
import "./onShippingAddressChange";
import "./onShippingOptionsChange";
import "./payment-fields";
import "./venmo";

beforeEach(() => {
  setupMocks();
});
