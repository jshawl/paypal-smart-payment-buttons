/* @flow */
/** @jsx h */

import { h, render, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

import { getBody } from '../../lib';
import { setupExports, autoFocusOnFirstInput, filterExtraFields, kebabToCamelCase, parsedCardType} from '../lib';
import { CARD_FIELD_TYPE_TO_FRAME_NAME, CARD_FIELD_TYPE } from '../constants';
import { submitCardFields, getCardFieldState, getFieldErrors, isEmpty } from '../interface';
import { getCardProps, type CardProps } from '../props';
import type { SetupCardOptions} from '../types';
import type {FeatureFlags } from '../../types'
import { setupCardLogger } from '../logger';

import { CardField, CardNumberField, CardCVVField, CardExpiryField, CardNameField, CardPostalCodeField } from './fields';

type PageProps = {|
    cspNonce : string,
    props : CardProps,
    featureFlags: FeatureFlags
|};

function Page({ cspNonce, props, featureFlags } : PageProps) : mixed {
    const { facilitatorAccessToken, style, disableAutocomplete, placeholder, type, export: xport, inputEvents, minLength, maxLength } = props;
    const { onChange, onFocus, onBlur, onInputSubmitRequest } = inputEvents || {};
    const [ fieldValue, setFieldValue ] = useState();
    const [ fieldValid, setFieldValid ] = useState(false);
    const [ fieldPotentiallyValid, setFieldPotentiallyValid] = useState(true);
    const [ cardTypes, setCardTypes ] = useState([]);
    const [ fieldFocus, setFieldFocus ] = useState(false);
    const [ inputSubmit, setInputSubmit ] = useState(false);
    const [ mainRef, setRef ] = useState();
    const [ fieldGQLErrors, setFieldGQLErrors ] = useState({ singleField: {}, numberField: [], expiryField: [], cvvField: [], nameField: [], postalCodeField: [] });
    const initialRender = useRef(true)

    let autocomplete;
    if (disableAutocomplete) {
        autocomplete = 'off';
    }

    const getFieldValue = () => {
        return fieldValue;
    };

    const isFieldValid = () => {
        return fieldValid;
    };

    const isFieldPotentiallyValid = () => {
        return fieldPotentiallyValid
    }

    const isFieldFocused = () => {
        return fieldFocus;
    }

    const getPotentialCardTypes = () => {
        return cardTypes
    }

    const setGqlErrors = (errorData : {| field : string, errors : [] |}) => {
        const { errors } = errorData;

        const errorObject = { ...fieldGQLErrors };

        if (type === CARD_FIELD_TYPE.SINGLE) {
            errorObject.singleField = { ...errorData };
        } else if (errors && errors.length) {
            switch (type) {
            case CARD_FIELD_TYPE.NUMBER:
                errorObject.numberField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.EXPIRY:
                errorObject.expiryField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.CVV:
                errorObject.cvvField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.NAME:
                errorObject.nameField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.POSTAL:
                errorObject.postalCodeField = [ ...errors ];
                break;
            default:
                break;
            }
        }

        setFieldGQLErrors(errorObject);
    };

    const resetGQLErrors = () => {
        setFieldGQLErrors({ singleField: {}, numberField: [], expiryField: [], cvvField: [], nameField: [], postalCodeField: [] });
    };

    const getStateObject = () => {
        const { cards, fields } = getCardFieldState()
        const currentField = kebabToCamelCase(CARD_FIELD_TYPE_TO_FRAME_NAME[type])
        let potentialCardTypes
        fields[currentField] = {
            isEmpty: isEmpty(fieldValue),
            isFocused: fieldFocus,
            isPotentiallyValid: fieldPotentiallyValid,
            isValid: fieldValid
        }
        if (currentField === 'cardNumberField') {
            potentialCardTypes = parsedCardType(cardTypes)
        } else {
            potentialCardTypes = cards
        }
        return { fields, potentialCardTypes }
    }

    useEffect(() => {
        // useEffect is fired on first render as well as when
        // any value in the depenency array has changed. We
        // only want to fire off the onChange event if the
        // validity changes after the first render. So in
        // order to do that we add this guard to not noop
        // when the component first renders. We leverage
        // useRef to store the value of initialRender as
        // we want that to persist across re-renders.
        // See: https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
        if ( initialRender.current && fieldValue === '') {
            initialRender.current = false
        } else if( !initialRender.current && typeof onChange === 'function' ) {
            const {fields, potentialCardTypes} = getStateObject();
            const errors = getFieldErrors(fields)
            onChange({
                fields,
                cards: potentialCardTypes,
                emittedBy: type,
                isFormValid: errors.length === 0,
                errors
            });
        }
    }, [ fieldValue ]);
    useEffect(() => {
        if ( initialRender.current && fieldValue === '') {
            initialRender.current = false
        } else if(!initialRender.current && typeof onFocus === 'function'){
            const {fields, potentialCardTypes} = getStateObject();
            const errors = getFieldErrors(fields)
            const fieldStateObject = {
                fields,
                cards: potentialCardTypes,
                emittedBy: type,
                isFormValid: errors.length === 0,
                errors
            }

            if(fieldFocus) {
                onFocus({...fieldStateObject});
            } else if(typeof onBlur === 'function' && !fieldFocus) {
                onBlur({...fieldStateObject})
            }
        }
    },[fieldFocus])

    // fire the handler when key code is 13
    //
    useEffect(() => {
        if(inputSubmit && typeof onInputSubmitRequest === 'function') {
            const {fields, potentialCardTypes} = getStateObject();
            const errors = getFieldErrors(fields)
            const fieldStateObject = {
                fields,
                cards: potentialCardTypes,
                emittedBy: type,
                isFormValid: errors.length === 0,
                errors
            }

            onInputSubmitRequest({...fieldStateObject})
            setInputSubmit(false)
        }
        
    }, [inputSubmit])


    useEffect(() => {
        autoFocusOnFirstInput(mainRef);
    }, [ mainRef ]);

    useEffect(() => {
        setupExports({
            name: CARD_FIELD_TYPE_TO_FRAME_NAME[type],
            isFieldPotentiallyValid,
            getPotentialCardTypes,
            isFieldValid,
            isFieldFocused,
            getFieldValue,
            setGqlErrors,
            resetGQLErrors
        });

        xport({
            submit: (extraData) => {
                const extraFields = filterExtraFields(extraData);
                return submitCardFields({ facilitatorAccessToken, extraFields, featureFlags });
            },
            getState: () => {
                const cardFieldState = getCardFieldState()
                const { fields } = cardFieldState
                const errors = getFieldErrors(fields)

                return {...cardFieldState,
                    isFormValid: errors.length === 0,
                    errors}
            }
        });
    }, [ fieldValid, fieldValue, fieldFocus, fieldPotentiallyValid, cardTypes ]);

    const onFieldChange = ({ value, valid, isFocused, potentiallyValid, potentialCardTypes }) => {
        setFieldValue(value);
        setFieldFocus(isFocused)
        setFieldValid(valid);
        setFieldPotentiallyValid(potentiallyValid);
        resetGQLErrors();
        setCardTypes(potentialCardTypes);
    };

    const onFieldFocus = ({isFocused}) => {
        setFieldFocus(isFocused)
    }

    const onInputSubmit = ({isInputSubmitRequest}) => {
        setInputSubmit(isInputSubmitRequest)
    }

    return (
        <Fragment>
            {
                (type === CARD_FIELD_TYPE.SINGLE)
                    ? <CardField
                            gqlErrorsObject={ fieldGQLErrors.singleField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.NUMBER)
                    ? <CardNumberField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.numberField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            onFocus={onFieldFocus}
                            onKeyDown={onInputSubmit}
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.CVV)
                    ? <CardCVVField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.cvvField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            onKeyDown={onInputSubmit}
                            onFocus={onFieldFocus}
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.EXPIRY)
                    ? <CardExpiryField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.expiryField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            onFocus={onFieldFocus}
                            onKeyDown={onInputSubmit}
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.NAME)
                    ? <CardNameField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.nameField }
                            cspNonce={ cspNonce }
                            onChange={ onFieldChange }
                            onFocus={onFieldFocus}
                            onKeyDown={onInputSubmit}
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.POSTAL)
                    ? <CardPostalCodeField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.postalCodeField }
                            cspNonce={ cspNonce }
                            onChange={ onFieldChange }
                            onFocus={onFieldFocus}
                            onKeyDown={onInputSubmit}
                            styleObject={ style }
                            placeholder={ placeholder }
                            minLength={ minLength }
                            maxLength={ maxLength || 10}
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }
        </Fragment>
    );
}

export function setupCard({ cspNonce, facilitatorAccessToken, featureFlags, buyerCountry, metadata } : SetupCardOptions) {
    const props = getCardProps({
        facilitatorAccessToken,
        featureFlags
    });
    const {
        env,
        sessionID,
        clientID,
        partnerAttributionID,
        sdkCorrelationID,
        locale,
        merchantID,
        merchantDomain,
        cardSessionID,
        type,
        hcfSessionID
    } = props;

    setupCardLogger({
        env,
        sessionID,
        cardSessionID,
        clientID,
        partnerAttributionID,
        sdkCorrelationID,
        cardCorrelationID: metadata?.correlationID,
        locale,
        merchantID,
        merchantDomain,
        buyerCountry,
        type,
        hcfSessionID
    })

    render(<Page cspNonce={ cspNonce } props={ props } featureFlags={featureFlags} />, getBody());
}
