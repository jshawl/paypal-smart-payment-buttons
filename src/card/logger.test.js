/* @flow */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { COUNTRY } from "@paypal/sdk-constants/src";
import { uniqueID } from "@krakenjs/belter/src";

import { getLogger, sendCountMetric } from "../lib/logger";

import {
  hcfTransactionError,
  hcfTransactionSuccess,
  vaultWithoutPurchaseFailure,
  vaultWithoutPurchaseSuccess,
  setupCardLogger,
} from "./logger";

vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(),
  sendCountMetric: vi.fn(),
  setupLogger: vi.fn(),
}));

const cardLoggerProps = {
  env: "test",
  sessionID: uniqueID(),
  clientID: uniqueID(),
  sdkCorrelationID: uniqueID(),
  cardSessionID: uniqueID(),
  partnerAttributionID: uniqueID(),
  merchantDomain: "mock://www.paypal.com",
  buyerCountry: COUNTRY.US,
  locale: {
    country: "US",
    lang: "en",
  },
  merchantID: ["XYZ12345"],
  type: "name",
  hcfSessionID: uniqueID(),
  cardCorrelationID: uniqueID(),
  productAction: "with_purchase",
};

describe("card logger", () => {
  const trackMock = vi.fn();
  const trackBuilder = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    trackMock.mockImplementation(() => ({
      flush: vi.fn(),
    }));
    // $FlowIssue .mockImplementation
    getLogger.mockImplementation(() => ({
      addTrackingBuilder: trackBuilder,
      track: trackMock,
      warn: vi.fn(),
      error: vi.fn(),
      flush: vi.fn(),
    }));
  });

  it("should call logger.track with setupCardLogger ", async () => {
    await setupCardLogger(cardLoggerProps);
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        event_name: "hcf_name_field_rendered",
        transition_name: "hcf_name_field_rendered",
      }),
    );
  });

  it("should call logger.addTrackingBuilder with card field options", async () => {
    await setupCardLogger(cardLoggerProps);
    expect(trackBuilder).toHaveBeenCalledWith(expect.any(Function));
    expect(trackBuilder.mock.calls[0][0]()).toMatchObject(
      expect.objectContaining({
        hcf_version: "v2",
        seller_id: "XYZ12345",
        merchant_domain: "mock://www.paypal.com",
      }),
    );
  });

  it("should call logger.track with hcfTransactionError ", async () => {
    const error = new Error("testing hcf transaction error");
    await hcfTransactionError({ error });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        ext_error_code: "hcf_transaction_error",
        ext_error_desc: "testing hcf transaction error",
      }),
    );
    expect(sendCountMetric).toBeCalledWith({
      name: "pp.app.paypal_sdk.card_fields.submit.error.count",
      dimensions: {
        cardFieldsFlow: "with_purchase",
      },
    });
  });

  it("should call logger.track with hcfTransactionSuccess ", async () => {
    await hcfTransactionSuccess({ orderID: "ABCD123" });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        event_name: "hcf_transaction_success",
        transition_name: "hcf_transaction_success",
        order_id: "ABCD123",
      }),
    );
    expect(sendCountMetric).toBeCalledWith({
      name: "pp.app.paypal_sdk.card_fields.submit.success.count",
      dimensions: {
        cardFieldsFlow: "with_purchase",
      },
    });
  });

  it("should call logger.track with vaultWithoutPurchaseSuccess ", async () => {
    await vaultWithoutPurchaseSuccess({ vaultToken: "ABCD123efgh" });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        event_name: "hcf_transaction_success",
        transition_name: "hcf_transaction_success",
        vault_token: "ABCD123efgh",
      }),
    );
    expect(sendCountMetric).toBeCalledWith({
      name: "pp.app.paypal_sdk.card_fields.submit.success.count",
      dimensions: {
        cardFieldsFlow: "vault_without_purchase",
      },
    });
  });

  it("should call logger.track with vaultWithoutPurchaseFailure ", async () => {
    const error = new Error("testing vault without purchase error");
    await vaultWithoutPurchaseFailure({ error });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        ext_error_code: "hcf_transaction_error",
        ext_error_desc: "testing vault without purchase error",
      }),
    );
    expect(sendCountMetric).toBeCalledWith({
      name: "pp.app.paypal_sdk.card_fields.submit.error.count",
      dimensions: {
        cardFieldsFlow: "vault_without_purchase",
      },
    });
  });
});
