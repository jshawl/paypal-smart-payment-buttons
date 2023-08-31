/* @flow */

import { type Query } from '../../src/props/onShippingChange';
import { type Breakdown } from '../../src/types';

export function triggerKeyPress(el : Element, keyCode : number) {
    const eventObj = window.document.createEvent('Events');
    eventObj.initEvent('keypress', true, true);
    eventObj.which = keyCode;
    eventObj.keyCode = keyCode;
    eventObj.key = keyCode;
    el.dispatchEvent(eventObj);
}

export function areObjectsIdentical(obj1 : Breakdown | Query, obj2 : Breakdown | Query) : boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                if (!areObjectsIdentical(obj1[key], obj2[key])) {
                    return false;
                }
            } else if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
    }

    return true;
}

export function areArraysIdentical(arr1 : $ReadOnlyArray<Query>, arr2 : $ReadOnlyArray<Query>) : boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }
  
    for (let i = 0; i < arr1.length; i++) {
        const item1 = arr1[i];
        const item2 = arr2[i];
  
        if (typeof item1 === 'object' && typeof item2 === 'object') {
            if (!areObjectsIdentical(item1, item2)) {
                return false;
            }
        } else if (item1 !== item2) {
            return false;
        }
    }
  
    return true;
}
