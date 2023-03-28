/* @flow */
import { describe, beforeEach, it, expect, vi } from "vitest";
import { INTENT } from "@paypal/sdk-constants/src";

// eslint-disable-next-line import/no-namespace
import * as getLegacyPropsStuff from "../props/legacyProps"
// eslint-disable-next-line import/no-namespace
import * as getOnErrorStuff from "../props/onError"

import { getButtonProps } from "./props";



describe('getButtonProps', () => {
    const brandedDefault = true;
    const paymentSource = 'paypal';
    const facilitatorAccessToken = 'ABCDEFG12345';
    const featureFlags = {
    isLsatUpgradable: false,
    shouldThrowIntegrationError: true,
  };
  const defaultArgs = {
    experiments: {},
    facilitatorAccessToken,
    brandedDefault,
    paymentSource,
    featureFlags,
  };
  beforeEach(() => {
    window.xprops = {};
  });

    it('should not fail with correct values passed in', () => {
      window.xprops = {
        intent:INTENT.SUBSCRIPTION,
        vault:true,
        createSubscription:vi.fn(),
        onError: vi.fn()
      }
      expect(() => getButtonProps(defaultArgs)).not.toThrowError();
    });

    it('should retrieve legacyProps', () => {
      const legacyPropSpy = vi.spyOn(getLegacyPropsStuff, "getLegacyProps")
      
      window.xprops.intent = INTENT.CAPTURE
      window.xprops.onApprove = vi.fn()
      const result = getButtonProps(defaultArgs)
      expect(result.onApprove).toEqual(expect.any(Function))
      expect(legacyPropSpy).toBeCalled()
    })
    
    it('should setup the onError prop', () => {
      const getOnErrorSpy = vi.spyOn(getOnErrorStuff, "getOnError")
      window.xprops.intent = INTENT.CAPTURE
      window.xprops.onApprove = vi.fn()
      const result = getButtonProps(defaultArgs)
      expect(result.onError).toEqual(expect.any(Function))
      expect(getOnErrorSpy).toBeCalled()
    })
    
    it('should fail if createBillingAgreement & createOrder are both passed in', () => {
        window.xprops.createBillingAgreement = vi.fn();
        window.xprops.createOrder = vi.fn();
        expect(() => getButtonProps(defaultArgs)).toThrowError("Do not pass both createBillingAgreement and createOrder");
    });

    it('should fail if createBillingAgreement is passed in but not vault', () => {
        window.xprops.createBillingAgreement =  vi.fn();
        expect(() => getButtonProps(defaultArgs)).toThrowError("Must pass vault=true to sdk to use createBillingAgreement");
    });

    it('should fail if createSubscription & createOrder are both passed in', () => {
        window.xprops.createSubscription = vi.fn();
        window.xprops.createOrder = vi.fn();
        expect(() => getButtonProps(defaultArgs)).toThrowError("Do not pass both createSubscription and createOrder");
    });

    it('should fail if createSubscription but not vault', () => {
        window.xprops.createSubscription = vi.fn();
        expect(() => getButtonProps(defaultArgs)).toThrowError("Must pass vault=true to sdk to use createSubscription");
    });

    it('should fail if intent is tokenize but no createBillingAgreement', () => {
        window.xprops.intent = INTENT.TOKENIZE;
        expect(() => getButtonProps(defaultArgs)).toThrowError("Must pass createBillingAgreement with intent=tokenize");
    });

    it('should fail if intent is tokenize but contains createOrder', () => {
        window.xprops.intent = INTENT.TOKENIZE;
        window.xprops.createBillingAgreement = vi.fn();
        window.xprops.createOrder = () => 'ok';
        expect(() => getButtonProps(defaultArgs)).toThrowError("Do not pass both createBillingAgreement and createOrder");
    });

    it('should fail if intent is tokenize but contains createSubscription', () => {
        window.xprops.intent = INTENT.TOKENIZE;
        window.xprops.createBillingAgreement = vi.fn();
        window.xprops.createSubscription = vi.fn();
        expect(() => getButtonProps(defaultArgs)).toThrowError("Must pass vault=true to sdk to use createBillingAgreement");
    });

    it('should fail if intent is subscription but does not contain createSubscription', () => {
        window.xprops.intent = INTENT.SUBSCRIPTION;
        window.xprops.vault = true;
        expect(() => getButtonProps(defaultArgs)).toThrowError("Must pass createSubscription with intent=subscription");
    });

    it('should fail if intent is subscription but contains createOrder', () => {
        window.xprops.intent = INTENT.SUBSCRIPTION;
        window.xprops.vault = true;
        window.xprops.createSubscription = vi.fn();
        window.xprops.createOrder = vi.fn();
        expect(() => getButtonProps(defaultArgs)).toThrowError("Do not pass both createSubscription and createOrder");
    });

    it('should fail if intent is subscription but contains createBillingAgreement', () => {
        window.xprops.intent = INTENT.SUBSCRIPTION;
        window.xprops.vault = true;
        window.xprops.createSubscription = vi.fn();
        window.xprops.createBillingAgreement = vi.fn();
        expect(() => getButtonProps(defaultArgs)).toThrowError("Do not pass both createSubscription and createBillingAgreement");
    });

    it('passes through enableOrdersApprovalSmartWallet and smartWalletOrderID to props', () => {
        window.xprops.intent = INTENT.CAPTURE;
        const props = getButtonProps({
            ...defaultArgs,
            enableOrdersApprovalSmartWallet: true,
            smartWalletOrderID: 'abc'
        });
        expect(props.enableOrdersApprovalSmartWallet).toBe(true);
        expect(props.smartWalletOrderID).toEqual('abc');
    });
});
