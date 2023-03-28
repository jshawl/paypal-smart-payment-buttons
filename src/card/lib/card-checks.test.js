/* @flow */
import { describe, it, expect, beforeEach } from "vitest";

import { DEFAULT_CARD_TYPE } from "../constants";

import {
  detectCardType,
  addGapsToCardNumber,
  checkCardEligibility,
} from "./card-checks";

describe("card-checks", () => {
  describe("detectCardType", () => {
    it("returns an array with the default card type as the only element if the number length is 0", () => {
      const number = "";

      const cardType = detectCardType(number);

      expect(cardType).toStrictEqual([DEFAULT_CARD_TYPE]);
    });

    it("returns an array with the default card type as the only element if the number length is greater than 0 but the card validator module does not return any potential card type", () => {
      // the card-validator module will return an empty array for this card number
      const number = "123";

      const cardType = detectCardType(number);

      expect(cardType).toStrictEqual([DEFAULT_CARD_TYPE]);
    });

    it("returns an array with the card type as the only element when the card validator module is able to detect a card type", () => {
      const number = "41111111";

      const cardType = detectCardType(number);

      expect(cardType).toStrictEqual([
        {
          niceType: "Visa",
          type: "visa",
          patterns: [4],
          matchStrength: 1,
          gaps: [4, 8, 12],
          lengths: [16, 18, 19],
          code: {
            name: "CVV",
            size: 3,
          },
        },
      ]);
    });

    it("returns an array of possible card types when the card validator module detects more than one possible card types", () => {
      const number = "4";

      const cardType = detectCardType(number);

      expect(cardType).toStrictEqual([
        {
          niceType: "Visa",
          type: "visa",
          patterns: [4],
          gaps: [4, 8, 12],
          lengths: [16, 18, 19],
          code: { name: "CVV", size: 3 },
          matchStrength: 1,
        },
        {
          niceType: "Maestro",
          type: "maestro",
          patterns: [
            493698,
            [500000, 504174],
            [504176, 506698],
            [506779, 508999],
            [56, 59],
            63,
            67,
            6,
          ],
          gaps: [4, 8, 12],
          lengths: [12, 13, 14, 15, 16, 17, 18, 19],
          code: { name: "CVC", size: 3 },
        },
        {
          niceType: "Elo",
          type: "elo",
          patterns: [
            401178,
            401179,
            438935,
            457631,
            457632,
            431274,
            451416,
            457393,
            504175,
            [506699, 506778],
            [509000, 509999],
            627780,
            636297,
            636368,
            [650031, 650033],
            [650035, 650051],
            [650405, 650439],
            [650485, 650538],
            [650541, 650598],
            [650700, 650718],
            [650720, 650727],
            [650901, 650978],
            [651652, 651679],
            [655000, 655019],
            [655021, 655058],
          ],
          gaps: [4, 8, 12],
          lengths: [16],
          code: { name: "CVE", size: 3 },
        },
      ]);
    });
  });

  describe("addGapsToCardNumber", () => {
    it("should add gaps (spaces) to the card number", () => {
      const cardNumber = "4111111111111111";
      const newCardNumber = addGapsToCardNumber(cardNumber);
      expect(newCardNumber).toBe("4111 1111 1111 1111");
    });

    it("should handle card numbers with spaces and letters", () => {
      const cardNumber = " 4111a11 11b11 11c1111 ";
      const newCardNumber = addGapsToCardNumber(cardNumber);
      expect(newCardNumber).toBe("4111 1111 1111 1111");
    });
  });

  describe("checkCardEligibility", () => {
    beforeEach(() => {
      window.xprops = {};
    });

    it("should find the card eligible when the vendor is eligible for purchaese flow", () => {
      window.xprops.fundingEligibility = {
        card: {
          eligible: true,
          vendors: {
            visa: {
              eligible: true,
            },
          },
        },
      };
      const cardNumber = "4111111111111111";
      const cardType = detectCardType(cardNumber)[0];
      const isVaultFlow = false;
      expect(checkCardEligibility(cardNumber, cardType, isVaultFlow)).toBe(
        true
      );
    });

    it("should find the card ineligible when the card type is ineligible for purchaese flow", () => {
      window.xprops.fundingEligibility = {
        card: {
          eligible: true,
          vendors: {
            visa: {
              eligible: false,
            },
          },
        },
      };
      const cardNumber = "4111111111111111";
      const cardType = detectCardType(cardNumber)[0];
      const isVaultFlow = false;
      expect(checkCardEligibility(cardNumber, cardType, isVaultFlow)).toBe(
        false
      );
    });

    it("should find the card eligible when the card type is eligible for vaulting", () => {
      window.xprops.fundingEligibility = {
        card: {
          eligible: true,
          vendors: {
            discover: {
              vaultable: true,
            },
          },
        },
      };
      const cardNumber = "6011000990139424";
      const cardType = detectCardType(cardNumber)[0];
      const isVaultFlow = true;
      expect(checkCardEligibility(cardNumber, cardType, isVaultFlow)).toBe(
        true
      );
    });

    it("should find the card ineligible when the card type is ineligible for vaulting", () => {
      window.xprops.fundingEligibility = {
        card: {
          eligible: true,
          vendors: {
            discover: {
              vaultable: false,
            },
          },
        },
      };
      const cardNumber = "6011000990139424";
      const cardType = detectCardType(cardNumber)[0];
      const isVaultFlow = true;
      expect(checkCardEligibility(cardNumber, cardType, isVaultFlow)).toBe(
        false
      );
    });

    it("should find card payments not eligible when the merchant is not onboarded for card payments", () => {
      window.xprops.fundingEligibility = {
        card: {
          eligible: false,
        },
      };
      const cardNumber = "4111111111111111";
      const cardType = detectCardType(cardNumber)[0];
      expect(checkCardEligibility(cardNumber, cardType, true)).toBe(false);
      expect(checkCardEligibility(cardNumber, cardType, false)).toBe(false);
    });

    it("should find unbranded card payments not eligible if the merchant is only eligible for branded payments", () => {
      window.xprops.fundingEligibility = {
        card: {
          branded: true,
        },
      };
      const cardNumber = "4111111111111111";
      const cardType = detectCardType(cardNumber)[0];
      expect(checkCardEligibility(cardNumber, cardType, true)).toBe(false);
      expect(checkCardEligibility(cardNumber, cardType, false)).toBe(false);
    });

    it("should default to ineligible if there is no funding eligibility specified", () => {
      const cardNumber = "4111111111111111";
      const cardType = detectCardType(cardNumber)[0];
      expect(checkCardEligibility(cardNumber, cardType, true)).toBe(false);
      expect(checkCardEligibility(cardNumber, cardType, false)).toBe(false);
    });

    it("should default to eligible if there is no card number entered", () => {
      const cardNumber = "";
      const cardType = detectCardType(cardNumber)[0];
      expect(checkCardEligibility(cardNumber, cardType, true)).toBe(true);
      expect(checkCardEligibility(cardNumber, cardType, false)).toBe(true);
    });
  });
});
