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
  CardNameChangeEvent,
  CardNavigation,
  FieldValidity,
  InputState,
  InputEvent,
} from "../types";

import { AriaMessage } from "./AriaMessage";

type CardNameProps = {|
  name: string,
  type: string,
  state?: InputState,
  placeholder: string,
  style: Object,
  maxLength: string,
  navigation: CardNavigation,
  onChange: (nameEvent: CardNameChangeEvent) => void,
  onFocus: (event: InputEvent) => void,
  onBlur: (event: InputEvent) => void,
  onKeyDown?: (keyDown: boolean) => void,
  allowNavigation: boolean,
  onValidityChange?: (numberValidity: FieldValidity) => void,
|};

export function CardName({
  name = "name",
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
}: CardNameProps): mixed {
  const [attributes, setAttributes]: [Object, (Object) => Object] = useState({
    placeholder,
  });
  const [inputState, setInputState]: [
    InputState,
    (InputState | ((InputState) => InputState)) => InputState,
  ] = useState({ ...defaultInputState, ...state });
  const { inputValue, keyStrokeCount, isValid, isPotentiallyValid } =
    inputState;

  const nameRef = useRef();
  const ariaMessageRef = useRef();

  useEffect(() => {
    exportMethods(nameRef, setAttributes, setInputState, ariaMessageRef);
  }, []);

  useEffect(() => {
    onChange({ cardName: inputState.inputValue });
  }, [inputState]);

  useEffect(() => {
    if (typeof onValidityChange === "function") {
      onValidityChange({ isValid, isPotentiallyValid });
    }
    if (allowNavigation && inputValue && isValid) {
      navigation.next();
    }
  }, [isValid, isPotentiallyValid]);

  const setNameValue: (InputEvent) => void = (event: InputEvent): void => {
    const { value } = event.target;
    const validity = cardValidator.cardholderName(value);

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
        aria-describedby={"card-name-field-description"}
        name={name}
        inputmode="text"
        ref={nameRef}
        type={type}
        className="card-field-name"
        value={inputValue}
        style={style}
        maxLength={maxLength}
        onKeyDown={onKeyDownEvent}
        onInput={setNameValue}
        onFocus={onFocusEvent}
        onBlur={onBlurEvent}
        {...attributes}
      />
      <AriaMessage
        ariaMessageId={"card-name-field-description"}
        ariaMessageRef={ariaMessageRef}
      />
    </Fragment>
  );
}
