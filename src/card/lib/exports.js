/* @flow */

import { FRAME_NAME } from "../../constants";
import { type CardType } from "../types";

export type ExportsOptions = {|
  name: $Values<typeof FRAME_NAME>,
  isFieldValid: () => boolean,
  isFieldPotentiallyValid: () => boolean,
  getPotentialCardTypes: () => $ReadOnlyArray<CardType>,
  isFieldFocused: () => boolean,
  // eslint-disable-next-line no-undef
  getFieldValue: <T>() => T,
  setGqlErrors: ({| field: string, errors: [] |}) => void,
  resetGQLErrors: () => void,
|};

export type CardExports<V> = {|
  name: $Values<typeof FRAME_NAME>,
  isFieldValid: () => boolean,
  isFieldPotentiallyValid: () => boolean,
  getPotentialCardTypes: () => $ReadOnlyArray<CardType>,
  isFieldFocused: () => boolean,
  getFieldValue: () => V,
  setGqlErrors: ({| field: string, errors: [] |}) => void,
  resetGQLErrors: () => void,
|};

export function setupExports<T>({
  name,
  isFieldValid,
  isFieldFocused,
  isFieldPotentiallyValid,
  getFieldValue,
  setGqlErrors,
  resetGQLErrors,
  getPotentialCardTypes,
}: ExportsOptions) {
  const xports: CardExports<T> = {
    name,
    isFieldValid,
    isFieldPotentiallyValid,
    getPotentialCardTypes,
    isFieldFocused,
    getFieldValue,
    setGqlErrors,
    resetGQLErrors,
  };

  window.exports = xports;
}
