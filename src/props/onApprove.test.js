/* @flow */
import { vi, describe, test, expect } from "vitest";

import { getSaveActionOnApprove } from "./onApprove";

describe("decorate onApprove - save action", () => {
  const onApproveData = { vaultSetupToken: "token" };

  test("should call onApprove and not error", async () => {
    const onApprove = vi.fn();
    const onError = vi.fn();

    const decoratedOnApprove = getSaveActionOnApprove({
      onApprove,
      onError,
    });

    await decoratedOnApprove(onApproveData);

    expect.assertions(2);
    expect(onApprove).toHaveBeenCalledWith(onApproveData);
    expect(onError).not.toHaveBeenCalled();
  });

  test("should call onError if onApprove throws error", async () => {
    const onApproveError = new Error("failed onApprove");
    const onApprove = vi.fn().mockImplementation(() => {
      throw onApproveError;
    });
    const onError = vi.fn();

    const decoratedOnApprove = getSaveActionOnApprove({
      onApprove,
      onError,
    });

    expect.assertions(3);
    await expect(decoratedOnApprove(onApproveData)).rejects.toThrow(
      onApproveError
    );
    expect(onApprove).toHaveBeenCalledWith(onApproveData);
    expect(onError).toHaveBeenCalledWith(onApproveError);
  });

  test("should call onError if onApprove rejects", async () => {
    const onApproveError = new Error("failed onApprove");
    const onApprove = vi.fn().mockRejectedValue(onApproveError);
    const onError = vi.fn();

    const decoratedOnApprove = getSaveActionOnApprove({
      onApprove,
      onError,
    });

    expect.assertions(3);
    await expect(decoratedOnApprove(onApproveData)).rejects.toThrow(
      onApproveError
    );
    expect(onApprove).toHaveBeenCalledWith(onApproveData);
    expect(onError).toHaveBeenCalledWith(onApproveError);
  });
});
