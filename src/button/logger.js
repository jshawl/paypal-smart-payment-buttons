/* @flow */

import {
  isIEIntranet,
  getPageRenderTime,
  querySelectorAll,
} from "@krakenjs/belter/src";
import {
  FPTI_KEY,
  ENV,
  FUNDING,
  FPTI_USER_ACTION,
  COUNTRY,
} from "@paypal/sdk-constants/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import type { LocaleType } from "../types";
import {
  getLogger,
  setupLogger,
  isStorageStateFresh,
  isIOSSafari,
  isAndroidChrome,
  prepareLatencyInstrumentationPayload,
  getNavigationTimeOrigin,
  sendCountMetric,
} from "../lib";
import {
  DATA_ATTRIBUTES,
  FPTI_TRANSITION,
  FPTI_BUTTON_TYPE,
  FPTI_BUTTON_KEY,
  FPTI_STATE,
  FPTI_CONTEXT_TYPE,
  FPTI_CUSTOM_KEY,
} from "../constants";
import type { GetQueriedEligibleFunding, OnShippingChange } from "../props";

import type { ButtonStyle } from "./props";

function getTemplateVersion(): string {
  const templateVersion =
    document.body &&
    document.body.getAttribute(`${DATA_ATTRIBUTES.RENDER_VERSION}`);
  return (templateVersion || "unknown").replace(/[^a-zA-Z0-9]+/g, "_");
}

function getClientVersion(): string {
  const clientVersion =
    document.body &&
    document.body.getAttribute(`${DATA_ATTRIBUTES.CLIENT_VERSION}`);
  return (clientVersion || "unknown").replace(/[^a-zA-Z0-9]+/g, "_");
}

function getResponseStartTime(): number {
  const startTime =
    document.body &&
    document.body.getAttribute(DATA_ATTRIBUTES.RESPONSE_START_TIME);
  return Number(startTime);
}

type ButtonLoggerOptions = {|
  env: $Values<typeof ENV>,
  sessionID: string,
  clientID: string,
  partnerAttributionID: ?string,
  commit: boolean,
  sdkCorrelationID: string,
  buttonCorrelationID: string,
  locale: LocaleType,
  buttonSessionID: string,
  merchantID: $ReadOnlyArray<string>,
  merchantDomain: string,
  sdkVersion: string,
  style: ButtonStyle,
  fundingSource: ?$Values<typeof FUNDING>,
  getQueriedEligibleFunding: GetQueriedEligibleFunding,
  stickinessID: string,
  buyerCountry: $Values<typeof COUNTRY>,
  onShippingChange: ?OnShippingChange,
  product?: string,
|};

export function setupButtonLogger({
  env,
  sessionID,
  buttonSessionID,
  clientID,
  partnerAttributionID,
  commit,
  sdkCorrelationID,
  buttonCorrelationID,
  locale,
  merchantID,
  merchantDomain,
  sdkVersion,
  style,
  fundingSource,
  getQueriedEligibleFunding,
  stickinessID,
  buyerCountry,
  onShippingChange,
  product,
}: ButtonLoggerOptions): ZalgoPromise<void> {
  const logger = getLogger();

  setupLogger({
    env,
    sessionID,
    clientID,
    sdkCorrelationID,
    locale,
    sdkVersion,
    buyerCountry,
  });

  logger.addPayloadBuilder(() => {
    return {
      buttonSessionID,
      buttonCorrelationID,
    };
  });

  logger.addTrackingBuilder(() => {
    return {
      [FPTI_KEY.CONTEXT_TYPE]: FPTI_CONTEXT_TYPE.BUTTON_SESSION_ID,
      [FPTI_KEY.CONTEXT_ID]: buttonSessionID,
      [FPTI_KEY.BUTTON_SESSION_UID]: buttonSessionID,
      [FPTI_KEY.BUTTON_VERSION]: __SMART_BUTTONS__.__MINOR_VERSION__,
      [FPTI_BUTTON_KEY.BUTTON_CORRELATION_ID]: buttonCorrelationID,
      [FPTI_KEY.STICKINESS_ID]: isAndroidChrome() ? stickinessID : null,
      [FPTI_KEY.PARTNER_ATTRIBUTION_ID]: partnerAttributionID,
      [FPTI_KEY.USER_ACTION]: commit
        ? FPTI_USER_ACTION.COMMIT
        : FPTI_USER_ACTION.CONTINUE,
      [FPTI_KEY.SELLER_ID]: merchantID[0],
      [FPTI_KEY.MERCHANT_DOMAIN]: merchantDomain,
      [FPTI_KEY.CHOSEN_FUNDING]: fundingSource,
      [FPTI_KEY.PRODUCT]: product,
      [FPTI_KEY.TIMESTAMP]: Date.now().toString(),
    };
  });

  if (isIEIntranet()) {
    logger.warn("button_child_intranet_mode");
  }

  return ZalgoPromise.hash({
    pageRenderTime: getPageRenderTime(),
    queriedEligibleFunding: getQueriedEligibleFunding(),
  }).then(({ pageRenderTime, queriedEligibleFunding }) => {
    const fundingSources = querySelectorAll(
      `[${DATA_ATTRIBUTES.FUNDING_SOURCE}]`,
    )
      .map((el) => {
        return el.getAttribute(DATA_ATTRIBUTES.FUNDING_SOURCE);
      })
      .filter(Boolean);

    const walletInstruments = querySelectorAll(
      `[${DATA_ATTRIBUTES.INSTRUMENT_TYPE}]`,
    )
      .flatMap((el) => {
        const dataInstrumentType = el.getAttribute(
          DATA_ATTRIBUTES.INSTRUMENT_TYPE,
        );
        const dataSecondaryInstrumentType = el.getAttribute(
          DATA_ATTRIBUTES.SECONDARY_INSTRUMENT_TYPE,
        );
        const instrumentTypes = [
          dataInstrumentType,
          dataSecondaryInstrumentType,
        ];

        return instrumentTypes;
      })
      .filter(Boolean);

    const payNow = querySelectorAll(`[${DATA_ATTRIBUTES.FUNDING_SOURCE}]`)
      .map((el) => {
        return el.getAttribute(DATA_ATTRIBUTES.PAY_NOW);
      })
      .some(Boolean);

    const { layout, color, shape, label, tagline = true } = style;

    let nativeDevice = "non_native";
    if (isIOSSafari()) {
      nativeDevice = "ios_safari";
    } else if (isAndroidChrome()) {
      nativeDevice = "android_chrome";
    }

    const serverRenderVersion = getTemplateVersion();
    const dotSeparatedRenderVersion = serverRenderVersion.split("_").join(".");

    if (dotSeparatedRenderVersion !== sdkVersion) {
      logger.info("server_render_version_mismatch", {
        sdkVersion,
        serverRenderVersion,
      });
      sendCountMetric({
        name: "pp.app.paypal_sdk.buttons.server_render_version_mismatch",
        dimensions: {},
      });
    }

    logger.info("smart_payment_buttons_render_options", {
      color,
      label,
      layout,
      nativeDevice,
      shape,
      fundingInstruments: fundingSources.join(","),
      fundingInstrumentsCount: fundingSources.length.toString(),
      js_sdk_version: getClientVersion(),
      storageState: isStorageStateFresh() ? "fresh" : "not_fresh",
      tagline: tagline.toString(),
      version: serverRenderVersion,
      walletInstruments: walletInstruments.join(","),
      walletInstrumentsCount: walletInstruments.length.toString(),
    });

    if (window.performance) {
      try {
        const responseStartTime = getResponseStartTime();
        const responseEndTime =
          getNavigationTimeOrigin() +
          performance.getEntriesByName("buttons-response-received").pop()
            .startTime;
        const cplPhases = prepareLatencyInstrumentationPayload(
          responseStartTime,
          responseEndTime,
        );
        logger.info("CPL_LATENCY_METRICS_SECOND_RENDER");
        logger.track({
          [FPTI_KEY.STATE]: "CPL_LATENCY_METRICS",
          [FPTI_KEY.TRANSITION]: "process_client_metrics",
          [FPTI_KEY.PAGE]: "main:xo:paypal-components:smart-payment-buttons",
          [FPTI_KEY.CPL_COMP_METRICS]: JSON.stringify(cplPhases?.comp || {}),
        });
      } catch (error) {
        logger.info(`button_render_CPL_instrumentation_log_error`, error);
      }
    } else {
      logger.info(`button_render_CPL_instrumentation_not_executed`);
    }

    const tracking = {
      [FPTI_KEY.STATE]: FPTI_STATE.BUTTON,
      [FPTI_KEY.TRANSITION]: FPTI_TRANSITION.BUTTON_LOAD,
      [FPTI_KEY.EVENT_NAME]: FPTI_TRANSITION.BUTTON_LOAD,
      [FPTI_KEY.FUNDING_LIST]: fundingSources.join(":"),
      [FPTI_KEY.FI_LIST]: walletInstruments.join(":"),
      [FPTI_KEY.SELECTED_FI]: fundingSource,
      [FPTI_KEY.FUNDING_COUNT]: fundingSources.length.toString(),
      [FPTI_KEY.PAGE_LOAD_TIME]: pageRenderTime
        ? pageRenderTime.toString()
        : "",
      [FPTI_KEY.POTENTIAL_PAYMENT_METHODS]: Array.isArray(
        queriedEligibleFunding,
      )
        ? queriedEligibleFunding.join(":")
        : "",
      [FPTI_KEY.PAY_NOW]: payNow.toString(),
      [FPTI_BUTTON_KEY.BUTTON_LAYOUT]: layout,
      [FPTI_BUTTON_KEY.BUTTON_COLOR]: color,
      [FPTI_BUTTON_KEY.BUTTON_SIZE]: "responsive",
      [FPTI_BUTTON_KEY.BUTTON_SHAPE]: shape,
      [FPTI_BUTTON_KEY.BUTTON_LABEL]: label,
      [FPTI_BUTTON_KEY.BUTTON_WIDTH]: window.innerWidth,
      [FPTI_BUTTON_KEY.BUTTON_TYPE]: FPTI_BUTTON_TYPE.IFRAME,
      [FPTI_BUTTON_KEY.BUTTON_TAGLINE_ENABLED]: tagline ? "1" : "0",
      [FPTI_CUSTOM_KEY.SHIPPING_CALLBACK_PASSED]: onShippingChange ? "1" : "0",
    };

    logger.track(tracking);

    logger.flush();
  });
}
