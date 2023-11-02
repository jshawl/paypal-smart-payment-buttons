/* @flow */
/** @jsx h */

import { h, Fragment } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import cardValidator from "card-validator";

import { getPostRobot } from "../../lib";
import { DEFAULT_CARD_TYPE } from "../constants";
import {
  removeNonDigits,
  defaultNavigation,
  defaultInputState,
  navigateOnKeyDown,
  exportMethods,
  getContext,
} from "../lib";
import type {
  CardType,
  CardCvvChangeEvent,
  CardNavigation,
  FieldValidity,
  InputState,
  InputEvent,
} from "../types";

import { AriaMessage } from "./AriaMessage";

type CardCvvProps = {|
  name: string,
  autocomplete?: string,
  type: string,
  state?: InputState,
  placeholder: string,
  style: Object,
  navigation: CardNavigation,
  onChange: (cvvEvent: CardCvvChangeEvent) => void,
  onFocus: (event: InputEvent) => void,
  onBlur: (event: InputEvent) => void,
  onKeyDown?: (keyDown: boolean) => void,
  allowNavigation: boolean,
  onValidityChange?: (numberValidity: FieldValidity) => void,
|};

export function CardCVV({
  name = "cvv",
  autocomplete = "cc-csc",
  navigation = defaultNavigation,
  allowNavigation = false,
  state,
  type,
  placeholder,
  style,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onValidityChange,
}: CardCvvProps): mixed {
  const [attributes, setAttributes]: [Object, (Object) => Object] = useState({
    placeholder,
  });
  const [inputState, setInputState]: [
    InputState,
    (InputState | ((InputState) => InputState)) => InputState,
  ] = useState({ ...defaultInputState, ...state });
  const [cardType, setCardType]: [CardType, (CardType) => CardType] =
    useState(DEFAULT_CARD_TYPE);
  const [touched, setTouched] = useState(false);
  const { inputValue, keyStrokeCount, isValid, isPotentiallyValid } =
    inputState;

  const cvvRef = useRef();
  const ariaMessageRef = useRef();

  useEffect(() => {
    if (!allowNavigation) {
      exportMethods(cvvRef, setAttributes, setInputState, ariaMessageRef);
    }
    // listen for card type changes
    const postRobot = getPostRobot();
    if (postRobot) {
      const context = getContext(window);
      postRobot.on(
        "cardTypeChange",
        {
          domain: window.location.origin,
        },
        (event) => {
          const messageContext = getContext(event.source);
          if (messageContext === context) {
            setCardType(event.data);
          }
        },
      );
    }
  }, []);

  useEffect(() => {
    onChange({ cardCvv: inputState.inputValue });
  }, [inputState]);

  useEffect(() => {
    const validity = cardValidator.cvv(inputValue, cardType?.code?.size);
    if (touched) {
      validity.isPotentiallyValid = false;
    }
    setInputState((newState) => ({ ...newState, ...validity }));
  }, [cardType]);

  useEffect(() => {
    const validity = cardValidator.cvv(inputValue, cardType?.code?.size);
    if (touched) {
      validity.isPotentiallyValid = false;
    }
    setInputState((newState) => ({ ...newState, ...validity }));
  }, [cardType]);

  useEffect(() => {
    if (typeof onValidityChange === "function") {
      onValidityChange({ isValid, isPotentiallyValid });
    }
    if (allowNavigation && inputValue && isValid) {
      navigation.next();
    }
  }, [isValid, isPotentiallyValid]);

  const setCvvValue: (InputEvent) => void = (event: InputEvent): void => {
    const { value: rawValue } = event.target;
    const value = removeNonDigits(rawValue);
    const validity = cardValidator.cvv(value, cardType?.code?.size);

    setInputState({
      ...inputState,
      ...validity,
      inputValue: value,
      maskedInputValue: value,
      keyStrokeCount: keyStrokeCount + 1,
    });
  };

  const onKeyDownEvent: (InputEvent) => void = (event: InputEvent): void => {
    if (typeof onKeyDown === "function") {
      if (event.key === "Enter") {
        onKeyDown(true);
      } else {
        onKeyDown(false);
      }
    }

    if (allowNavigation) {
      navigateOnKeyDown(event, navigation);
    }
  };

  const onFocusEvent: (InputEvent) => void = (event: InputEvent): void => {
    if (!touched) {
      setTouched(true);
    }
    if (typeof onFocus === "function") {
      onFocus(event);
    }
  };

  const onBlurEvent: (InputEvent) => void = (event: InputEvent): void => {
    if (typeof onBlur === "function") {
      onBlur(event);
    }
    if (typeof onKeyDown === "function") {
      onKeyDown(false);
    }
  };

  return (
    <Fragment>
      <input
        aria-describedby={"card-cvv-field-description"}
        name={name}
        autocomplete={autocomplete}
        inputmode="numeric"
        ref={cvvRef}
        type={type}
        className="card-field-cvv"
        value={inputValue}
        style={style}
        maxLength={cardType.code.size}
        onKeyDown={onKeyDownEvent}
        onInput={setCvvValue}
        onFocus={onFocusEvent}
        onBlur={onBlurEvent}
        {...attributes}
        placeholder={attributes.placeholder ?? cardType.code.name}
      />
      <AriaMessage
        ariaMessageId={"card-cvv-field-description"}
        ariaMessageRef={ariaMessageRef}
      />
    </Fragment>
  );
}
