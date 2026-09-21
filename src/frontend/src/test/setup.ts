import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose `data-ocid` hooks; make them queryable by test id
// without misreading selector misses as timing failures.
configure({ testIdAttribute: "data-ocid" });

// Unmount every rendered tree between tests so queries never see a previous
// test's DOM.
afterEach(() => {
  cleanup();
});
