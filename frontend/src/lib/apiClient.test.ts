import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/apiClient";
import type { ApiErrorBody } from "@/types/api";

describe("getApiErrorMessage", () => {
  it("returns API message from axios error", () => {
    const error = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: { success: false, message: "Invalid coupon code", data: {} },
      },
    );

    expect(getApiErrorMessage(error)).toBe("Invalid coupon code");
  });

  it("returns timeout message for aborted requests", () => {
    const error = new AxiosError("timeout", "ECONNABORTED");
    expect(getApiErrorMessage(error)).toBe(
      "Request timed out. Please check your connection and try again.",
    );
  });

  it("falls back for unknown errors", () => {
    expect(getApiErrorMessage("boom", "fallback")).toBe("fallback");
  });
});

describe("getApiFieldErrors", () => {
  it("extracts validation field map from API error", () => {
    const error = new AxiosError<ApiErrorBody>(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          success: false,
          message: "Validation failed",
          data: { name: "Name is required" },
        },
      },
    );

    expect(getApiFieldErrors(error)).toEqual({ name: "Name is required" });
  });
});
