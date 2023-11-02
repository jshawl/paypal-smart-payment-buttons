/* @flow */
/** @jsx h */
/* eslint-disable flowtype/require-exact-type */

import { h, Fragment } from "preact";
import { noop } from "@krakenjs/belter";
import { useState, useEffect, useRef } from "preact/hooks";

import {
  setErrors,
  initFieldValidity,
  goToNextField,
  goToPreviousField,
  convertDateFormat,
  getCSSText,
  markValidity,
  exportMethods,
} from "../lib";
import type {
  CardStyle,
  Card,
  CardNumberChangeEvent,
  CardExpiryChangeEvent,
  CardCvvChangeEvent,
  CardNameChangeEvent,
  CardPostalCodeChangeEvent,
  FieldValidity,
  CardNavigation,
  CardType,
} from "../types";
import {
  CARD_ERRORS,
  DEFAULT_STYLE_MULTI_CARD,
  DEFAULT_STYLE_SINGLE_CARD,
  DEFAULT_PLACEHOLDERS,
  CARD_FIELD_TYPE,
} from "../constants";

import { CardNumber } from "./CardNumber";
import { CardExpiry } from "./CardExpiry";
import { CardCVV } from "./CardCVV";
import { CardName } from "./CardName";
import { CardPostalCode } from "./CardPostalCode";
import { Icons, Icon } from "./Icons";

type CardFieldProps = {|
  cspNonce: string,
  onChange: ({
    value: Card,
    valid: boolean,
    errors: [$Values<typeof CARD_ERRORS>] | [],
  }) => void,
  styleObject: CardStyle,
  placeholder: {| number?: string, expiry?: string, cvv?: string |},
  autoFocusRef: (mixed) => void,
  autocomplete?: string,
  gqlErrorsObject: {| field: string, errors: [] |},
|};

export function CardField({
  cspNonce,
  onChange,
  styleObject = {},
  placeholder = {},
  gqlErrorsObject = {},
  autoFocusRef,
  autocomplete,
}: CardFieldProps): mixed {
  const [attributes, setAttributes]: [Object, (Object) => Object] = useState(
    {},
  );
  const [cssText, setCSSText]: [string, (string) => string] = useState("");
  const [number, setNumber]: [string, (string) => string] = useState("");
  const [cvv, setCvv]: [string, (string) => string] = useState("");
  const [expiry, setExpiry]: [string, (string) => string] = useState("");
  const [isValid, setIsValid]: [boolean, (boolean) => boolean] = useState(true);
  const [validationMessage, setValidationMessage]: [
    string,
    (string) => string,
  ] = useState("");
  const [isCardEligible, setIsCardEligible]: [boolean, (boolean) => boolean] =
    useState(true);
  const [numberValidity, setNumberValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const [expiryValidity, setExpiryValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const [cvvValidity, setCvvValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const [touched, setTouched] = useState(false);
  // TODO: change the focus boolean flag to an object to avoid a race condition when either of number/expiry or cvv
  // fields have been focused instantaneously. Eg: {cvvHasFocus: true, expiryHasFocus: false, ...}, if any of these
  // fields has focus, hasFocus should be true since this block is for Single Card Fields
  const [hasFocus, setHasFocus]: [boolean, (boolean) => boolean] =
    useState(false);
  const numberRef = useRef();
  const expiryRef = useRef();
  const cvvRef = useRef();
  const cardFieldRef = useRef();

  const cardNumberNavivation: CardNavigation = {
    next: goToNextField(expiryRef),
    previous: () => noop,
  };
  const cardExpiryNavivation: CardNavigation = {
    next: goToNextField(cvvRef),
    previous: goToPreviousField(numberRef),
  };
  const cardCvvNavivation: CardNavigation = {
    next: () => noop,
    previous: goToPreviousField(expiryRef),
  };

  function getValidationMessage(): string {
    if (!isCardEligible) {
      return "This card vendor is not eligible.";
    }
    if (!numberValidity.isPotentiallyValid && !numberValidity.isValid) {
      return "This card number is not valid.";
    }
    if (!expiryValidity.isPotentiallyValid && !expiryValidity.isValid) {
      return "This expiration date is not valid.";
    }
    if (!cvvValidity.isPotentiallyValid && !cvvValidity.isValid) {
      return "This security code is not valid.";
    }
    return "";
  }

  useEffect(() => {
    autoFocusRef(numberRef);
    exportMethods(cardFieldRef, setAttributes);
  }, []);

  useEffect(() => {
    setCSSText(getCSSText(DEFAULT_STYLE_SINGLE_CARD, styleObject));
  }, [styleObject]);

  useEffect(() => {
    const { field, errors } = gqlErrorsObject;

    if (field === CARD_FIELD_TYPE.NUMBER) {
      const hasGQLErrors = errors.length > 0;
      if (hasGQLErrors) {
        setNumberValidity({ isPotentiallyValid: false, isValid: false });
      }
    }

    if (field === CARD_FIELD_TYPE.EXPIRY) {
      const hasGQLErrors = errors.length > 0;
      if (hasGQLErrors) {
        setExpiryValidity({ isPotentiallyValid: false, isValid: false });
      }
    }

    if (field === CARD_FIELD_TYPE.CVV) {
      const hasGQLErrors = errors.length > 0;
      if (hasGQLErrors) {
        setCvvValidity({ isPotentiallyValid: false, isValid: false });
      }
    }
  }, [gqlErrorsObject]);

  useEffect(() => {
    setValidationMessage(getValidationMessage());

    const valid = Boolean(
      numberValidity.isValid && cvvValidity.isValid && expiryValidity.isValid,
    );

    setIsValid(valid);

    const errors = setErrors({
      isCardEligible,
      isNumberValid: numberValidity.isValid,
      isCvvValid: cvvValidity.isValid,
      isExpiryValid: expiryValidity.isValid,
      gqlErrorsObject,
    });

    markValidity(numberRef, numberValidity, hasFocus, touched);
    markValidity(expiryRef, expiryValidity, hasFocus, touched);
    markValidity(cvvRef, cvvValidity, hasFocus, touched);

    onChange({ value: { number, cvv, expiry }, valid, errors });
  }, [
    number,
    cvv,
    expiry,
    isValid,
    numberValidity,
    isCardEligible,
    cvvValidity,
    expiryValidity,
  ]);

  useEffect(() => {
    const element = cardFieldRef?.current;
    if (element) {
      if (hasFocus) {
        element.classList.add("focus");
      } else {
        element.classList.remove("focus");
      }
      if (validationMessage.length > 0) {
        element.classList.add("invalid");
      } else {
        element.classList.remove("invalid");
      }
    }
  }, [hasFocus, validationMessage]);

  const onChangeNumber: (CardNumberChangeEvent) => void = ({
    cardNumber,
  }: CardNumberChangeEvent): void => {
    setNumber(cardNumber);
  };

  const handleFocus = () => {
    setTouched(true);
    setHasFocus(true);
  };

  return (
    <Fragment>
      <style nonce={cspNonce}>{cssText}</style>
      <Icons />
      <fieldset ref={cardFieldRef} className="card-field" {...attributes}>
        <CardNumber
          ref={numberRef}
          autocomplete={autocomplete}
          navigation={cardNumberNavivation}
          type="text"
          allowNavigation={true}
          placeholder={placeholder.number ?? DEFAULT_PLACEHOLDERS.number}
          onChange={onChangeNumber}
          onEligibilityChange={(eligibility: boolean) =>
            setIsCardEligible(eligibility)
          }
          onValidityChange={(validity: FieldValidity) =>
            setNumberValidity({ ...validity })
          }
          onFocus={handleFocus}
          onBlur={() => setHasFocus(false)}
        />
        <CardExpiry
          ref={expiryRef}
          autocomplete={autocomplete}
          navigation={cardExpiryNavivation}
          type="text"
          allowNavigation={true}
          placeholder={placeholder.expiry ?? DEFAULT_PLACEHOLDERS.expiry}
          maxLength="7"
          onChange={({ maskedDate }: CardExpiryChangeEvent) =>
            setExpiry(convertDateFormat(maskedDate))
          }
          onValidityChange={(validity: FieldValidity) =>
            setExpiryValidity({ ...validity })
          }
          onFocus={handleFocus}
          onBlur={() => setHasFocus(false)}
        />
        <CardCVV
          ref={cvvRef}
          autocomplete={autocomplete}
          navigation={cardCvvNavivation}
          type="text"
          allowNavigation={true}
          placeholder={placeholder.cvv}
          onChange={({ cardCvv }: CardCvvChangeEvent) => setCvv(cardCvv)}
          onValidityChange={(validity: FieldValidity) =>
            setCvvValidity({ ...validity })
          }
          onFocus={handleFocus}
          onBlur={() => setHasFocus(false)}
        />
      </fieldset>
      <ValidationMessage message={validationMessage} />
    </Fragment>
  );
}

export function ValidationMessage({ message }: Object): mixed {
  return (
    <div
      className={`card-field-validation-error ${
        message.length ? "" : "hidden"
      }`}
    >
      <Icon iconId="icon-error" />
      {message}
    </div>
  );
}

type CardNumberFieldProps = {|
  cspNonce: string,
  onChange: ({|
    value: string,
    valid: boolean,
    isFocused: boolean,
    potentiallyValid: boolean,
    potentialCardTypes: $ReadOnlyArray<CardType> | [],
  |}) => void,
  onFocus: ({ isFocused: boolean }) => void,
  onKeyDown: ({ isInputSubmitRequest: boolean }) => void,
  styleObject: CardStyle,
  placeholder: string,
  autoFocusRef: (mixed) => void,
  autocomplete?: string,
  gqlErrors: [],
|};

export function CardNumberField({
  cspNonce,
  onChange,
  onFocus,
  styleObject = {},
  placeholder,
  autoFocusRef,
  autocomplete,
  onKeyDown,
  gqlErrors = [],
}: CardNumberFieldProps): mixed {
  const [cssText, setCSSText]: [string, (string) => string] = useState("");
  const [number, setNumber]: [string, (string) => string] = useState("");
  const [isCardEligible, setIsCardEligible]: [boolean, (boolean) => boolean] =
    useState(true);
  const [numberValidity, setNumberValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const [cards, setCards]: [
    $ReadOnlyArray<CardType>,
    (CardType) => $ReadOnlyArray<CardType>,
  ] = useState([]);
  const [hasFocus, setHasFocus]: [boolean, (boolean) => boolean] =
    useState(false);
  const [touched, setTouched] = useState(false);
  const [isSubmitRequest, setIsSubmitRequest]: [boolean, (boolean) => boolean] =
    useState(false);
  const numberRef = useRef();

  const { isValid, isPotentiallyValid } = numberValidity;

  useEffect(() => {
    autoFocusRef(numberRef);
  }, []);

  useEffect(() => {
    setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
  }, [styleObject]);

  useEffect(() => {
    const hasGQLErrors = gqlErrors.length > 0;
    if (hasGQLErrors) {
      setNumberValidity({ isPotentiallyValid: false, isValid: false });
    }
  }, [gqlErrors]);

  useEffect(() => {
    markValidity(numberRef, numberValidity, hasFocus, touched);
    onChange({
      value: number,
      valid: numberValidity.isValid,
      isFocused: hasFocus,
      potentiallyValid: numberValidity.isPotentiallyValid,
      potentialCardTypes: cards,
    });
  }, [number, isCardEligible, isValid, hasFocus, isPotentiallyValid, cards]);

  const handleInputChange = (cardNumber, potentialCardTypes) => {
    setNumber(cardNumber);
    setCards(potentialCardTypes);
  };
  useEffect(() => {
    onFocus({ isFocused: hasFocus });
  }, [hasFocus]);

  useEffect(() => {
    onKeyDown({ isInputSubmitRequest: isSubmitRequest });
  }, [isSubmitRequest]);

  const handleFocus = () => {
    setTouched(true);
    setHasFocus(true);
  };

  return (
    <Fragment>
      <style nonce={cspNonce}>{cssText}</style>
      <Icons />
      <CardNumber
        ref={numberRef}
        type="text"
        autocomplete={autocomplete}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDERS.number}
        onChange={({ cardNumber, potentialCardTypes }: CardNumberChangeEvent) =>
          handleInputChange(cardNumber, potentialCardTypes)
        }
        onEligibilityChange={(eligibility: boolean) =>
          setIsCardEligible(eligibility)
        }
        onValidityChange={(validity: FieldValidity) =>
          setNumberValidity(validity)
        }
        onFocus={handleFocus}
        onBlur={() => setHasFocus(false)}
        onKeyDown={(keyDown: boolean) => setIsSubmitRequest(keyDown)}
      />
    </Fragment>
  );
}

type CardExpiryFieldProps = {|
  cspNonce: string,
  onChange: ({|
    value: string,
    valid: boolean,
    isFocused: boolean,
    potentiallyValid: boolean,
  |}) => void,
  onFocus: ({ isFocused: boolean }) => void,
  onKeyDown: ({ isInputSubmitRequest: boolean }) => void,
  styleObject: CardStyle,
  placeholder: string,
  autoFocusRef: (mixed) => void,
  autocomplete?: string,
  gqlErrors: [],
|};

export function CardExpiryField({
  cspNonce,
  onChange,
  onFocus,
  onKeyDown,
  styleObject = {},
  placeholder,
  autoFocusRef,
  autocomplete,
  gqlErrors = [],
}: CardExpiryFieldProps): mixed {
  const [cssText, setCSSText]: [string, (string) => string] = useState("");
  const [expiry, setExpiry]: [string, (string) => string] = useState("");
  const [expiryValidity, setExpiryValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const expiryRef = useRef();
  const [hasFocus, setHasFocus]: [boolean, (boolean) => boolean] =
    useState(false);
  const [touched, setTouched] = useState(false);
  const [isSubmitRequest, setIsSubmitRequest]: [boolean, (boolean) => boolean] =
    useState(false);

  const { isValid, isPotentiallyValid } = expiryValidity;

  useEffect(() => {
    autoFocusRef(expiryRef);
  }, []);

  useEffect(() => {
    setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
  }, [styleObject]);

  useEffect(() => {
    const hasGQLErrors = gqlErrors.length > 0;
    if (hasGQLErrors) {
      setExpiryValidity({ isPotentiallyValid: false, isValid: false });
    }
  }, [gqlErrors]);

  useEffect(() => {
    markValidity(expiryRef, expiryValidity, hasFocus, touched);
    onChange({
      value: expiry,
      valid: expiryValidity.isValid,
      isFocused: hasFocus,
      potentiallyValid: expiryValidity.isPotentiallyValid,
    });
  }, [expiry, isValid, hasFocus, isPotentiallyValid]);

  useEffect(() => {
    onFocus({ isFocused: hasFocus });
  }, [hasFocus]);

  useEffect(() => {
    onKeyDown({ isInputSubmitRequest: isSubmitRequest });
  }, [isSubmitRequest]);

  const handleFocus = () => {
    setTouched(true);
    setHasFocus(true);
  };

  return (
    <Fragment>
      <style nonce={cspNonce}>{cssText}</style>
      <CardExpiry
        ref={expiryRef}
        type="text"
        autocomplete={autocomplete}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDERS.expiry}
        maxLength="7"
        onChange={({ maskedDate }: CardExpiryChangeEvent) =>
          setExpiry(convertDateFormat(maskedDate))
        }
        onValidityChange={(validity: FieldValidity) =>
          setExpiryValidity(validity)
        }
        onFocus={handleFocus}
        onBlur={() => setHasFocus(false)}
        onKeyDown={(value: boolean) => setIsSubmitRequest(value)}
      />
    </Fragment>
  );
}
type CardCvvFieldProps = {|
  cspNonce: string,
  onChange: ({|
    value: string,
    valid: boolean,
    isFocused: boolean,
    potentiallyValid: boolean,
  |}) => void,
  onFocus: ({ isFocused: boolean }) => void,
  onKeyDown: ({ isInputSubmitRequest: boolean }) => void,
  styleObject: CardStyle,
  placeholder: string,
  autoFocusRef: (mixed) => void,
  autocomplete?: string,
  gqlErrors: [],
|};

export function CardCVVField({
  cspNonce,
  onChange,
  onFocus,
  onKeyDown,
  styleObject = {},
  placeholder,
  autoFocusRef,
  autocomplete,
  gqlErrors = [],
}: CardCvvFieldProps): mixed {
  const [cssText, setCSSText]: [string, (string) => string] = useState("");
  const [cvv, setCvv]: [string, (string) => string] = useState("");
  const [cvvValidity, setCvvValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const cvvRef = useRef();
  const [hasFocus, setHasFocus]: [boolean, (boolean) => boolean] =
    useState(false);
  const [touched, setTouched] = useState(false);
  const [isSubmitRequest, setIsSubmitRequest]: [boolean, (boolean) => boolean] =
    useState(false);

  const { isValid, isPotentiallyValid } = cvvValidity;

  useEffect(() => {
    autoFocusRef(cvvRef);
  }, []);

  useEffect(() => {
    setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
  }, [styleObject]);

  useEffect(() => {
    const hasGQLErrors = gqlErrors.length > 0;
    if (hasGQLErrors) {
      setCvvValidity({ isPotentiallyValid: false, isValid: false });
    }
  }, [gqlErrors]);

  useEffect(() => {
    markValidity(cvvRef, cvvValidity, hasFocus, touched);
    onChange({
      value: cvv,
      valid: cvvValidity.isValid,
      isFocused: hasFocus,
      potentiallyValid: cvvValidity.isPotentiallyValid,
    });
  }, [cvv, isValid, hasFocus, isPotentiallyValid]);

  useEffect(() => {
    onFocus({ isFocused: hasFocus });
  }, [hasFocus]);

  useEffect(() => {
    onKeyDown({ isInputSubmitRequest: isSubmitRequest });
  }, [isSubmitRequest]);

  const handleFocus = () => {
    setTouched(true);
    setHasFocus(true);
  };

  return (
    <Fragment>
      <style nonce={cspNonce}>{cssText}</style>
      <CardCVV
        ref={cvvRef}
        type="text"
        autocomplete={autocomplete}
        placeholder={placeholder}
        onChange={({ cardCvv }: CardCvvChangeEvent) => setCvv(cardCvv)}
        onValidityChange={(validity: FieldValidity) => setCvvValidity(validity)}
        onFocus={handleFocus}
        onBlur={() => setHasFocus(false)}
        onKeyDown={(value: boolean) => setIsSubmitRequest(value)}
      />
    </Fragment>
  );
}

type CardNameFieldProps = {|
  cspNonce: string,
  onChange: ({|
    value: string,
    valid: boolean,
    isFocused: boolean,
    potentiallyValid: boolean,
  |}) => void,
  onFocus: ({ isFocused: boolean }) => void,
  onKeyDown: ({ isInputSubmitRequest: boolean }) => void,
  styleObject: CardStyle,
  placeholder: string,
  autoFocusRef: (mixed) => void,
  gqlErrors: [],
|};

export function CardNameField({
  cspNonce,
  onChange,
  onFocus,
  onKeyDown,
  styleObject = {},
  placeholder,
  autoFocusRef,
  gqlErrors = [],
}: CardNameFieldProps): mixed {
  const [cssText, setCSSText]: [string, (string) => string] = useState("");
  const [name, setName]: [string, (string) => string] = useState("");
  const [nameValidity, setNameValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const nameRef = useRef();
  const [touched, setTouched] = useState(false);
  const [hasFocus, setHasFocus]: [boolean, (boolean) => boolean] =
    useState(false);
  const [isSubmitRequest, setIsSubmitRequest]: [boolean, (boolean) => boolean] =
    useState(false);

  const { isValid, isPotentiallyValid } = nameValidity;

  useEffect(() => {
    autoFocusRef(nameRef);
  }, []);

  useEffect(() => {
    setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
  }, [styleObject]);

  useEffect(() => {
    const hasGQLErrors = gqlErrors.length > 0;
    if (hasGQLErrors) {
      setNameValidity({ isPotentiallyValid: false, isValid: false });
    }
  }, [gqlErrors]);

  useEffect(() => {
    markValidity(nameRef, nameValidity, hasFocus, touched);
    onChange({
      value: name,
      valid: nameValidity.isValid,
      isFocused: hasFocus,
      potentiallyValid: nameValidity.isPotentiallyValid,
    });
  }, [name, isValid, hasFocus, isPotentiallyValid]);

  useEffect(() => {
    onFocus({ isFocused: hasFocus });
  }, [hasFocus]);

  useEffect(() => {
    onKeyDown({ isInputSubmitRequest: isSubmitRequest });
  }, [isSubmitRequest]);

  const handleFocus = () => {
    setHasFocus(true);
    setTouched(true);
  };

  return (
    <Fragment>
      <style nonce={cspNonce}>{cssText}</style>
      <CardName
        ref={nameRef}
        type="text"
        placeholder={placeholder ?? DEFAULT_PLACEHOLDERS.name}
        maxLength="255"
        onChange={({ cardName }: CardNameChangeEvent) => setName(cardName)}
        onValidityChange={(validity: FieldValidity) =>
          setNameValidity(validity)
        }
        onFocus={handleFocus}
        onBlur={() => setHasFocus(false)}
        onKeyDown={(value: boolean) => setIsSubmitRequest(value)}
      />
    </Fragment>
  );
}

type CardPostalFieldProps = {|
  cspNonce: string,
  onChange: ({|
    value: string,
    valid: boolean,
    isFocused: boolean,
    potentiallyValid: boolean,
  |}) => void,
  onFocus: ({ isFocused: boolean }) => void,
  onKeyDown: ({ isInputSubmitRequest: boolean }) => void,
  styleObject: CardStyle,
  placeholder: string,
  minLength: number,
  maxLength: number,
  autoFocusRef: (mixed) => void,
  autocomplete?: string,
  gqlErrors: [],
|};

export function CardPostalCodeField({
  cspNonce,
  onChange,
  onFocus,
  onKeyDown,
  styleObject = {},
  placeholder,
  minLength,
  maxLength,
  autoFocusRef,
  autocomplete,
  gqlErrors = [],
}: CardPostalFieldProps): mixed {
  const [cssText, setCSSText]: [string, (string) => string] = useState("");
  const [postalCode, setPostalCode]: [string, (string) => string] =
    useState("");
  const [postalCodeValidity, setPostalCodeValidity]: [
    FieldValidity,
    (FieldValidity) => FieldValidity,
  ] = useState(initFieldValidity);
  const postalRef = useRef();
  const [hasFocus, setHasFocus]: [boolean, (boolean) => boolean] =
    useState(false);
  const [touched, setTouched] = useState(false);
  const [isSubmitRequest, setIsSubmitRequest]: [boolean, (boolean) => boolean] =
    useState(false);

  const { isValid, isPotentiallyValid } = postalCodeValidity;

  useEffect(() => {
    autoFocusRef(postalRef);
  }, []);

  useEffect(() => {
    setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
  }, [styleObject]);

  useEffect(() => {
    const hasGQLErrors = gqlErrors.length > 0;
    if (hasGQLErrors) {
      setPostalCodeValidity({ isPotentiallyValid: false, isValid: false });
    }
  }, [gqlErrors]);

  useEffect(() => {
    markValidity(postalRef, postalCodeValidity, hasFocus, touched);
    onChange({
      value: postalCode,
      valid: postalCodeValidity.isValid,
      isFocused: hasFocus,
      potentiallyValid: postalCodeValidity.isPotentiallyValid,
    });
  }, [postalCode, isValid, hasFocus, isPotentiallyValid]);

  useEffect(() => {
    onFocus({ isFocused: hasFocus });
  }, [hasFocus]);

  useEffect(() => {
    onKeyDown({ isInputSubmitRequest: isSubmitRequest });
  }, [isSubmitRequest]);

  const handleFocus = () => {
    setTouched(true);
    setHasFocus(true);
  };

  return (
    <Fragment>
      <style nonce={cspNonce}>{cssText}</style>
      <CardPostalCode
        ref={postalRef}
        type="text"
        autocomplete={autocomplete}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDERS.postal}
        minLength={minLength}
        maxLength={maxLength}
        onChange={({ cardPostalCode }: CardPostalCodeChangeEvent) =>
          setPostalCode(cardPostalCode)
        }
        onValidityChange={(validity: FieldValidity) =>
          setPostalCodeValidity(validity)
        }
        onFocus={handleFocus}
        onBlur={() => setHasFocus(false)}
        onKeyDown={(value: boolean) => setIsSubmitRequest(value)}
      />
    </Fragment>
  );
}

/* eslint-enable flowtype/require-exact-type */
