import { expect, it, describe } from "@jest/globals";

describe("Is jest ok", () => {
  it("to be ok", () => {
    expect("ok").toBe("ok");
  });

  it("to be not ok", () => {
    expect("!!").not.toBe("ok");
  });
});
