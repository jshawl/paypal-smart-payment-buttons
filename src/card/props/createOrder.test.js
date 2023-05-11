/* @flow */
import { describe, expect, test, vi } from "vitest";

import { getCreateOrder } from "./createOrder";

describe("decorate createOrder", () => {
  test("should return undefined if createOrder isn't passed", () => {
    const createOrder = undefined;

    const decoratedCreateOrder = getCreateOrder({
      createOrder,
    });

    expect(decoratedCreateOrder).toEqual(undefined);
  });

  test("should memoize return value", async () => {
    const createOrder = vi.fn().mockResolvedValue(Math.random().toString());

    const decoratedCreateOrder = getCreateOrder({
      createOrder,
    });

    // $FlowIssue
    const firstValue = await decoratedCreateOrder();
    // $FlowIssue
    const secondValue = await decoratedCreateOrder();

    expect(typeof firstValue).toEqual("string");
    // $FlowIssue Zalgo doesn't work with await types
    expect(firstValue.length).toBeGreaterThan(0);

    expect(firstValue).toEqual(secondValue);
  });

  test("should throw error when passed PAY- token", () => {
    const createOrder = vi.fn().mockResolvedValue("PAY-123");
    const decoratedCreateOrder = getCreateOrder({
      createOrder,
    });

    // $FlowIssue
    expect(decoratedCreateOrder()).rejects.toThrowError(
      "Do not pass PAY-XXX or PAYID-XXX directly into createOrder. Pass the EC-XXX token instead"
    );
  });

  test("should throw error when passed PAYID- token", () => {
    const createOrder = vi.fn().mockResolvedValue("PAYID-123");
    const decoratedCreateOrder = getCreateOrder({
      createOrder,
    });

    // $FlowIssue
    expect(decoratedCreateOrder()).rejects.toThrowError(
      "Do not pass PAY-XXX or PAYID-XXX directly into createOrder. Pass the EC-XXX token instead"
    );
  });

  test.each([
    ["number", 1234],
    ["object", { token: "token" }],
    ["array", ["token"]],
    ["boolean", true],
    ["null", null],
  ])("should fail if createOrder returns a %s", (_, returnValue) => {
    const createOrder = vi.fn().mockResolvedValue(returnValue);
    const decoratedCreateOrder = getCreateOrder({
      createOrder,
    });

    // $FlowIssue
    expect(decoratedCreateOrder()).rejects.toThrowError(
      "Expected an order id to be passed"
    );
  });

  test("should succeed with setupToken", () => {
    const createOrder = vi.fn().mockResolvedValue("vault_setup_token");
    const decoratedCreateOrder = getCreateOrder({
      createOrder,
    });

    // $FlowIssue
    expect(decoratedCreateOrder()).resolves.toEqual("vault_setup_token");
  });
});
