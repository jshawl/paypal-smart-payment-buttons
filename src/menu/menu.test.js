/* @flow */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { openPopup } from "../ui";

import { setupMenu } from ".";

const warn = vi.fn();

const onSelect = vi.fn();

vi.mock("../lib", async () => {
  const actual = await vi.importActual("../lib");
  return {
    ...actual,
    getLogger: () => ({
      warn,
    }),
  };
});

vi.mock("../ui", () => ({
  openPopup: vi.fn(),
}));

describe("Menu", () => {
  const cspNonce = "ABCD";
  const pageVisible = true;
  const popup = {
    width: 100,
    height: 100,
  };
  beforeEach(() => {
    window.xprops = {};
    window.xprops.onProps = vi.fn();
    window.xprops.choices = [
      {
        label: "First Option",
        popup,
        onSelect,
      },
    ];
  });
  it("should render a button with menu, click the button, open a popup", () => {
    setupMenu({ cspNonce, pageVisible });
    const button = window.document.querySelector(".menu-item");
    button.click();
    expect(openPopup).toHaveBeenCalledWith(popup);
    expect(onSelect).toHaveBeenCalled();
  });
  it("should render a button with menu, click the button, fail to open a popup", () => {
    // error out window open
    // $FlowFixMe
    openPopup.mockImplementationOnce(() => {
      throw new Error("window.open is not implemented");
    });
    setupMenu({ cspNonce, pageVisible });
    const button = window.document.querySelector(".menu-item");
    button.click();
    expect(warn).toHaveBeenCalledWith(
      "menu_popup_open_error",
      expect.anything()
    );
    expect(onSelect).toHaveBeenCalled();
  });
});
