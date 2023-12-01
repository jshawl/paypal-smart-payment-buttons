/* @flow */

import { describe, expect, vi, it } from "vitest";
import { redirect as redir } from "@krakenjs/belter/src";

import { getLogger } from "../lib";

import { redirect } from "./utils";

const logger = {
  warn: vi.fn(() => logger),
  info: vi.fn(() => logger),
  flush: vi.fn(),
};

vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(() => logger),
}));

vi.mock("@krakenjs/belter/src", () => ({
  redirect: vi.fn(),
}));

describe("redirect", () => {
  it("should redirect a valid url", () => {
    redirect("https://www.paypal.com");

    expect(getLogger).toBeCalledTimes(0);
    expect(redir).toBeCalledTimes(1);

    expect.assertions(2);
  });

  it("should log a warning if redirect url is not https", () => {
    redirect("http://paypal.com");

    expect(getLogger).toBeCalledTimes(1);
    expect(redir).toBeCalledTimes(1);

    expect.assertions(2);
  });

  it("should not redirect if the url is invalid", () => {
    expect(() => redirect("not a valid url")).toThrowError(
      "Invalid redirect url",
    );
    expect(getLogger).toBeCalledTimes(1);
    expect(redir).toBeCalledTimes(0);

    expect.assertions(3);
  });

  it("should not redirect if the url contains javascript", () => {
    expect(() =>
      // eslint-disable-next-line no-script-url
      redirect("javascript:alert(document.cookie)//://"),
    ).toThrowError("Invalid redirect url");
    expect(getLogger).toBeCalledTimes(2);
    expect(redir).toBeCalledTimes(0);

    expect.assertions(3);
  });
});
