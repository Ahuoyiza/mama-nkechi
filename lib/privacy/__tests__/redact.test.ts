// TODO (Activity 4): remove the .skip once redact() is built.
import { describe, expect, it } from "vitest";
import { redact } from "../redact";

describe.skip("redact", () => {
  it("replaces email addresses", () => {
    expect(redact("Questions? ada.okafor@example.com")).toBe("Questions? [EMAIL]");
    expect(redact("MAMA+recipes@mail.example.co.uk")).toBe("[EMAIL]");
  });

  it("replaces Nigerian phone numbers however they're typed", () => {
    expect(redact("call me on 0803 123 4567 if unsure")).toBe("call me on [PHONE] if unsure");
    expect(redact("08031234567")).toBe("[PHONE]");
    expect(redact("+234 803 123 4567")).toBe("[PHONE]");
    expect(redact("+2348031234567")).toBe("[PHONE]");
    expect(redact("0803-123-4567")).toBe("[PHONE]");
    expect(redact("WhatsApp 0905 000 1111 or 0812 345 6789")).toBe("WhatsApp [PHONE] or [PHONE]");
  });

  it("replaces 11-digit ID numbers (NIN, BVN)", () => {
    expect(redact("My NIN is 12345678901")).toBe("My NIN is [ID_NUMBER]");
  });

  it("leaves ordinary recipe numbers alone", () => {
    const step = "Simmer for 45 minutes at 180°C, then add 2 cups (500 g) of rice. Serves 4-6.";
    expect(redact(step)).toBe(step);
    expect(redact("Blend 3 tatashe and 2 scotch bonnets")).toBe("Blend 3 tatashe and 2 scotch bonnets");
  });

  it("handles several kinds at once", () => {
    expect(redact("Email ada@example.com or ring 0803 123 4567 (NIN 12345678901)")).toBe(
      "Email [EMAIL] or ring [PHONE] (NIN [ID_NUMBER])",
    );
  });
});
