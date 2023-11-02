/* @flow */
/** @jsx h */

import { h, Fragment } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import cardValidator from "card-validator";

import {
  defaultNavigation,
  defaultInputState,
  navigateOnKeyDown,
  exportMethods,
} from "../lib";
import type {
  CardPostalCodeChangeEvent,
  CardNavigation,
  FieldValidity,
  InputState,
  InputEvent,
} from "../types";

import { AriaMessage } from "./AriaMessage";

type CardPostalCodeProps = {|
  name: string,
  type: string,
  state?: InputState,
  placeholder: string,
  style: Object,
  maxLength: number,
  navigation: CardNavigation,
  onChange: (expiryEvent: CardPostalCodeChangeEvent) => void,
  onFocus?: (event: InputEvent) => void,
  onBlur?: (event: InputEvent) => void,
  onKeyDown?: (keyDown: boolean) => void,
  allowNavigation: boolean,
  onValidityChange?: (numberValidity: FieldValidity) => void,
  minLength: number,
|};

export function CardPostalCode({
  name = "postal",
  navigation = defaultNavigation,
  allowNavigation = false,
  state,
  type,
  placeholder,
  style,
  maxLength,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onValidityChange,
  minLength,
}: CardPostalCodeProps): mixed {
  const [attributes, setAttributes]: [Object, (Object) => Object] = useState({
    placeholder,
  });
  const [inputState, setInputState]: [
    InputState,
    (InputState | ((InputState) => InputState)) => InputState,
  ] = useState({ ...defaultInputState, ...state });
  const { inputValue, keyStrokeCount, isValid, isPotentiallyValid } =
    inputState;

  const postalCodeRef = useRef();
  const ariaMessageRef = useRef();

  useEffect(() => {
    exportMethods(postalCodeRef, setAttributes, setInputState, ariaMessageRef);
  }, []);

  useEffect(() => {
    onChange({ cardPostalCode: inputState.inputValue });
  }, [inputState]);

  useEffect(() => {
    if (typeof onValidityChange === "function") {
      onValidityChange({ isValid, isPotentiallyValid });
    }
    if (allowNavigation && inputValue && isValid) {
      navigation.next();
    }
  }, [isValid, isPotentiallyValid]);

  const setPostalCodeValue: (InputEvent) => void = (
    event: InputEvent,
  ): void => {
    const { value } = event.target;
    const validity = cardValidator.postalCode(value, { minLength });

    setInputState({
      ...inputState,
      ...validity,
      inputValue: value,
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
        aria-describedby={"card-postalCode-field-description"}
        name={name}
        inputmode="numeric"
        ref={postalCodeRef}
        type={type}
        className="card-field-postal-code"
        value={inputValue}
        style={style}
        maxLength={maxLength}
        onKeyDown={onKeyDownEvent}
        onInput={setPostalCodeValue}
        onFocus={onFocusEvent}
        onBlur={onBlurEvent}
        minLength={minLength}
        {...attributes}
      />
      <AriaMessage
        ariaMessageId={"card-postalCode-field-description"}
        ariaMessageRef={ariaMessageRef}
      />
    </Fragment>
  );
}
