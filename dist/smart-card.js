window.smartCard = function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = !0;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            enumerable: !0,
            get: getter
        });
    };
    __webpack_require__.r = function(exports) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module"
        });
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    };
    __webpack_require__.t = function(value, mode) {
        1 & mode && (value = __webpack_require__(value));
        if (8 & mode) return value;
        if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, "default", {
            enumerable: !0,
            value: value
        });
        if (2 & mode && "string" != typeof value) for (var key in value) __webpack_require__.d(ns, key, function(key) {
            return value[key];
        }.bind(null, key));
        return ns;
    };
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
    };
    __webpack_require__.o = function(object, property) {
        return {}.hasOwnProperty.call(object, property);
    };
    __webpack_require__.p = "";
    return __webpack_require__(__webpack_require__.s = 44);
}([ function(module, exports, __webpack_require__) {
    "use strict";
    var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
        void 0 === k2 && (k2 = k);
        Object.defineProperty(o, k2, {
            enumerable: !0,
            get: function() {
                return m[k];
            }
        });
    } : function(o, m, k, k2) {
        void 0 === k2 && (k2 = k);
        o[k2] = m[k];
    });
    var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
        Object.defineProperty(o, "default", {
            enumerable: !0,
            value: v
        });
    } : function(o, v) {
        o.default = v;
    });
    var creditCardType = (this && this.__importStar || function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (null != mod) for (var k in mod) "default" !== k && {}.hasOwnProperty.call(mod, k) && __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    })(__webpack_require__(6));
    var cardholder_name_1 = __webpack_require__(18);
    var card_number_1 = __webpack_require__(19);
    var expiration_date_1 = __webpack_require__(21);
    var expiration_month_1 = __webpack_require__(8);
    var expiration_year_1 = __webpack_require__(5);
    var cvv_1 = __webpack_require__(24);
    var postal_code_1 = __webpack_require__(25);
    module.exports = {
        creditCardType: creditCardType,
        cardholderName: cardholder_name_1.cardholderName,
        number: card_number_1.cardNumber,
        expirationDate: expiration_date_1.expirationDate,
        expirationMonth: expiration_month_1.expirationMonth,
        expirationYear: expiration_year_1.expirationYear,
        cvv: cvv_1.cvv,
        postalCode: postal_code_1.postalCode
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        get: function(element) {
            var start, end;
            return {
                start: start = element.selectionStart,
                end: end = element.selectionEnd,
                delta: Math.abs(end - start)
            };
        },
        set: function(element, start, end) {
            document.activeElement === element && element.setSelectionRange && element.setSelectionRange(start, end);
        }
    };
}, function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(26);
}, function(module, exports, __webpack_require__) {
    "use strict";
    var keyCannotMutateValue = __webpack_require__(4);
    var getSelection = __webpack_require__(1).get;
    var setSelection = __webpack_require__(1).set;
    var isBackspace = __webpack_require__(10);
    var isDelete = __webpack_require__(38);
    var Formatter = __webpack_require__(39);
    function BaseStrategy(options) {
        this.isFormatted = !1;
        this.inputElement = options.element;
        this.formatter = new Formatter(options.pattern);
        this._attachListeners();
    }
    function isSimulatedEvent(event) {
        return !event.key && !event.keyCode;
    }
    BaseStrategy.prototype.getUnformattedValue = function(forceUnformat) {
        var value = this.inputElement.value;
        (forceUnformat || this.isFormatted) && (value = this.formatter.unformat({
            value: this.inputElement.value,
            selection: {
                start: 0,
                end: 0
            }
        }).value);
        return value;
    };
    BaseStrategy.prototype.setPattern = function(pattern) {
        this._unformatInput();
        this.formatter = new Formatter(pattern);
        this._reformatInput();
    };
    BaseStrategy.prototype._attachListeners = function() {
        var self = this;
        self.inputElement.addEventListener("keydown", (function(event) {
            isSimulatedEvent(event) && (self.isFormatted = !1);
            keyCannotMutateValue(event) || self._isDeletion(event) && self._unformatInput(event);
        }));
        self.inputElement.addEventListener("keypress", (function(event) {
            isSimulatedEvent(event) && (self.isFormatted = !1);
            keyCannotMutateValue(event) || self._unformatInput(event);
        }));
        self.inputElement.addEventListener("keyup", (function(event) {
            self._reformatInput(event);
        }));
        self.inputElement.addEventListener("input", (function(event) {
            (event instanceof CustomEvent || !event.isTrusted) && (self.isFormatted = !1);
            self._reformatInput(event);
        }));
        self.inputElement.addEventListener("paste", this._pasteEventHandler.bind(this));
    };
    BaseStrategy.prototype._isDeletion = function(event) {
        return isDelete(event) || isBackspace(event);
    };
    BaseStrategy.prototype._reformatInput = function() {
        var input, formattedState;
        if (!this.isFormatted) {
            this.isFormatted = !0;
            formattedState = this.formatter.format({
                selection: getSelection(input = this.inputElement),
                value: input.value
            });
            input.value = formattedState.value;
            setSelection(input, formattedState.selection.start, formattedState.selection.end);
            this._afterReformatInput(formattedState);
        }
    };
    BaseStrategy.prototype._afterReformatInput = function() {};
    BaseStrategy.prototype._unformatInput = function() {
        var input, unformattedState, selection;
        if (this.isFormatted) {
            this.isFormatted = !1;
            selection = getSelection(input = this.inputElement);
            unformattedState = this.formatter.unformat({
                selection: selection,
                value: input.value
            });
            input.value = unformattedState.value;
            setSelection(input, unformattedState.selection.start, unformattedState.selection.end);
        }
    };
    BaseStrategy.prototype._prePasteEventHandler = function(event) {
        event.preventDefault();
    };
    BaseStrategy.prototype._postPasteEventHandler = function() {
        this._reformatAfterPaste();
    };
    BaseStrategy.prototype._pasteEventHandler = function(event) {
        var selection, splicedEntry;
        var entryValue = "";
        this._prePasteEventHandler(event);
        this._unformatInput();
        event.clipboardData ? entryValue = event.clipboardData.getData("Text") : window.clipboardData && (entryValue = window.clipboardData.getData("Text"));
        selection = getSelection(this.inputElement);
        (splicedEntry = this.inputElement.value.split("")).splice(selection.start, selection.end - selection.start, entryValue);
        splicedEntry = splicedEntry.join("");
        this.inputElement.value = splicedEntry;
        setSelection(this.inputElement, selection.start + entryValue.length, selection.start + entryValue.length);
        this._postPasteEventHandler();
    };
    BaseStrategy.prototype._reformatAfterPaste = function() {
        var event = document.createEvent("Event");
        this._reformatInput();
        event.initEvent("input", !0, !0);
        this.inputElement.dispatchEvent(event);
    };
    BaseStrategy.prototype._getStateToFormat = function() {
        var input = this.inputElement;
        var selection = getSelection(input);
        var stateToFormat = {
            selection: selection,
            value: input.value
        };
        if (this._stateToFormat) {
            stateToFormat = this._stateToFormat;
            delete this._stateToFormat;
        } else selection.start === input.value.length && (stateToFormat = this.formatter.unformat(stateToFormat));
        return stateToFormat;
    };
    module.exports = BaseStrategy;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var getCurrentSelection = __webpack_require__(1).get;
    module.exports = function(event) {
        var input = event.currentTarget || event.srcElement;
        var selection = getCurrentSelection(input);
        var isAtBeginning = 0 === selection.start;
        var isAtEnd = selection.start === input.value.length;
        var isShifted = !0 === event.shiftKey;
        switch (event.key) {
          case void 0:
          case "Unidentified":
          case "":
            break;

          case "Backspace":
            return isAtBeginning;

          case "Del":
          case "Delete":
            return isAtEnd;

          default:
            return 1 !== event.key.length;
        }
        switch (event.keyCode) {
          case 9:
          case 19:
          case 20:
          case 27:
          case 39:
          case 45:
            return !0;

          case 33:
          case 34:
          case 35:
          case 36:
          case 37:
          case 38:
          case 40:
            return !isShifted;

          case 8:
            return isAtBeginning;

          case 46:
            return isAtEnd;

          default:
            return !1;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.expirationYear = void 0;
    function verification(isValid, isPotentiallyValid, isCurrentYear) {
        return {
            isValid: isValid,
            isPotentiallyValid: isPotentiallyValid,
            isCurrentYear: isCurrentYear || !1
        };
    }
    exports.expirationYear = function(value, maxElapsedYear) {
        void 0 === maxElapsedYear && (maxElapsedYear = 19);
        var isCurrentYear;
        if ("string" != typeof value) return verification(!1, !1);
        if ("" === value.replace(/\s/g, "")) return verification(!1, !0);
        if (!/^\d*$/.test(value)) return verification(!1, !1);
        var len = value.length;
        if (len < 2) return verification(!1, !0);
        var currentYear = (new Date).getFullYear();
        if (3 === len) return verification(!1, value.slice(0, 2) === String(currentYear).slice(0, 2));
        if (len > 4) return verification(!1, !1);
        var numericValue = parseInt(value, 10);
        var twoDigitYear = Number(String(currentYear).substr(2, 2));
        var valid = !1;
        if (2 === len) {
            if (String(currentYear).substr(0, 2) === value) return verification(!1, !0);
            isCurrentYear = twoDigitYear === numericValue;
            valid = numericValue >= twoDigitYear && numericValue <= twoDigitYear + maxElapsedYear;
        } else if (4 === len) {
            isCurrentYear = currentYear === numericValue;
            valid = numericValue >= currentYear && numericValue <= currentYear + maxElapsedYear;
        }
        return verification(valid, valid, isCurrentYear);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __assign = this && this.__assign || function() {
        return (__assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) ({}).hasOwnProperty.call(s, p) && (t[p] = s[p]);
            }
            return t;
        }).apply(this, arguments);
    };
    var cardTypes = __webpack_require__(13);
    var add_matching_cards_to_results_1 = __webpack_require__(14);
    var is_valid_input_type_1 = __webpack_require__(16);
    var find_best_match_1 = __webpack_require__(17);
    var clone_1 = __webpack_require__(7);
    var customCards = {};
    var cardNames = {
        VISA: "visa",
        MASTERCARD: "mastercard",
        AMERICAN_EXPRESS: "american-express",
        DINERS_CLUB: "diners-club",
        DISCOVER: "discover",
        JCB: "jcb",
        UNIONPAY: "unionpay",
        MAESTRO: "maestro",
        ELO: "elo",
        MIR: "mir",
        HIPER: "hiper",
        HIPERCARD: "hipercard"
    };
    var ORIGINAL_TEST_ORDER = [ cardNames.VISA, cardNames.MASTERCARD, cardNames.AMERICAN_EXPRESS, cardNames.DINERS_CLUB, cardNames.DISCOVER, cardNames.JCB, cardNames.UNIONPAY, cardNames.MAESTRO, cardNames.ELO, cardNames.MIR, cardNames.HIPER, cardNames.HIPERCARD ];
    var testOrder = clone_1.clone(ORIGINAL_TEST_ORDER);
    function findType(cardType) {
        return customCards[cardType] || cardTypes[cardType];
    }
    function getCardPosition(name, ignoreErrorForNotExisting) {
        void 0 === ignoreErrorForNotExisting && (ignoreErrorForNotExisting = !1);
        var position = testOrder.indexOf(name);
        if (!ignoreErrorForNotExisting && -1 === position) throw new Error('"' + name + '" is not a supported card type.');
        return position;
    }
    function creditCardType(cardNumber) {
        var results = [];
        if (!is_valid_input_type_1.isValidInputType(cardNumber)) return results;
        if (0 === cardNumber.length) return testOrder.map((function(cardType) {
            return clone_1.clone(findType(cardType));
        }));
        testOrder.forEach((function(cardType) {
            var cardConfiguration = findType(cardType);
            add_matching_cards_to_results_1.addMatchingCardsToResults(cardNumber, cardConfiguration, results);
        }));
        var bestMatch = find_best_match_1.findBestMatch(results);
        return bestMatch ? [ bestMatch ] : results;
    }
    creditCardType.getTypeInfo = function(cardType) {
        return clone_1.clone(findType(cardType));
    };
    creditCardType.removeCard = function(name) {
        var position = getCardPosition(name);
        testOrder.splice(position, 1);
    };
    creditCardType.addCard = function(config) {
        var existingCardPosition = getCardPosition(config.type, !0);
        customCards[config.type] = config;
        -1 === existingCardPosition && testOrder.push(config.type);
    };
    creditCardType.updateCard = function(cardType, updates) {
        var originalObject = customCards[cardType] || cardTypes[cardType];
        if (!originalObject) throw new Error('"' + cardType + "\" is not a recognized type. Use `addCard` instead.'");
        if (updates.type && originalObject.type !== updates.type) throw new Error("Cannot overwrite type parameter.");
        var clonedCard = clone_1.clone(originalObject);
        clonedCard = __assign(__assign({}, clonedCard), updates);
        customCards[clonedCard.type] = clonedCard;
    };
    creditCardType.changeOrder = function(name, position) {
        var currentPosition = getCardPosition(name);
        testOrder.splice(currentPosition, 1);
        testOrder.splice(position, 0, name);
    };
    creditCardType.resetModifications = function() {
        testOrder = clone_1.clone(ORIGINAL_TEST_ORDER);
        customCards = {};
    };
    creditCardType.types = cardNames;
    module.exports = creditCardType;
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.clone = void 0;
    exports.clone = function(originalObject) {
        return originalObject ? JSON.parse(JSON.stringify(originalObject)) : null;
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.expirationMonth = void 0;
    function verification(isValid, isPotentiallyValid, isValidForThisYear) {
        return {
            isValid: isValid,
            isPotentiallyValid: isPotentiallyValid,
            isValidForThisYear: isValidForThisYear || !1
        };
    }
    exports.expirationMonth = function(value) {
        var currentMonth = (new Date).getMonth() + 1;
        if ("string" != typeof value) return verification(!1, !1);
        if ("" === value.replace(/\s/g, "") || "0" === value) return verification(!1, !0);
        if (!/^\d*$/.test(value)) return verification(!1, !1);
        var month = parseInt(value, 10);
        if (isNaN(Number(value))) return verification(!1, !1);
        var result = month > 0 && month < 13;
        return verification(result, result, result && month >= currentMonth);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var UA = window.navigator && window.navigator.userAgent;
    var isAndroid = __webpack_require__(28);
    var isChrome = __webpack_require__(29);
    var isIos = __webpack_require__(32);
    var isIE9 = __webpack_require__(33);
    var KITKAT_WEBVIEW_REGEX = /Version\/\d\.\d* Chrome\/\d*\.0\.0\.0/;
    module.exports = {
        isIE9: isIE9,
        isAndroidChrome: function(uaArg) {
            var ua = uaArg || UA;
            return isAndroid(ua) && isChrome(ua);
        },
        isIos: isIos,
        isKitKatWebview: function(uaArg) {
            var ua = uaArg || UA;
            return isAndroid(ua) && KITKAT_WEBVIEW_REGEX.test(ua);
        },
        isSamsungBrowser: function(ua) {
            return /SamsungBrowser/.test(ua = ua || UA) || function(ua) {
                return !isChrome(ua) && ua.indexOf("Samsung") > -1;
            }(ua);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(event) {
        return "Backspace" === event.key || 8 === event.keyCode;
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var keyCannotMutateValue = __webpack_require__(4);
    var BaseStrategy = __webpack_require__(3);
    var setSelection = __webpack_require__(1).set;
    function AndroidChromeStrategy(options) {
        BaseStrategy.call(this, options);
    }
    (AndroidChromeStrategy.prototype = Object.create(BaseStrategy.prototype)).constructor = AndroidChromeStrategy;
    AndroidChromeStrategy.prototype._attachListeners = function() {
        var self = this;
        self.inputElement.addEventListener("keydown", (function(event) {
            keyCannotMutateValue(event) || self._unformatInput(event);
        }));
        self.inputElement.addEventListener("keypress", (function(event) {
            keyCannotMutateValue(event) || self._unformatInput(event);
        }));
        self.inputElement.addEventListener("keyup", (function(event) {
            self._reformatInput(event);
        }));
        self.inputElement.addEventListener("input", (function(event) {
            self._reformatInput(event);
        }));
        self.inputElement.addEventListener("paste", this._pasteEventHandler.bind(this));
    };
    AndroidChromeStrategy.prototype._prePasteEventHandler = function() {};
    AndroidChromeStrategy.prototype._postPasteEventHandler = function() {
        setTimeout(this._reformatAfterPaste.bind(this), 0);
    };
    AndroidChromeStrategy.prototype._afterReformatInput = function(formattedState) {
        var input = this.inputElement;
        setTimeout((function() {
            var formattedSelection = formattedState.selection;
            setSelection(input, formattedSelection.end, formattedSelection.end);
        }), 0);
    };
    module.exports = AndroidChromeStrategy;
}, function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(27);
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        visa: {
            niceType: "Visa",
            type: "visa",
            patterns: [ 4 ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16, 18, 19 ],
            code: {
                name: "CVV",
                size: 3
            }
        },
        mastercard: {
            niceType: "Mastercard",
            type: "mastercard",
            patterns: [ [ 51, 55 ], [ 2221, 2229 ], [ 223, 229 ], [ 23, 26 ], [ 270, 271 ], 2720 ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16 ],
            code: {
                name: "CVC",
                size: 3
            }
        },
        "american-express": {
            niceType: "American Express",
            type: "american-express",
            patterns: [ 34, 37 ],
            gaps: [ 4, 10 ],
            lengths: [ 15 ],
            code: {
                name: "CID",
                size: 4
            }
        },
        "diners-club": {
            niceType: "Diners Club",
            type: "diners-club",
            patterns: [ [ 300, 305 ], 36, 38, 39 ],
            gaps: [ 4, 10 ],
            lengths: [ 14, 16, 19 ],
            code: {
                name: "CVV",
                size: 3
            }
        },
        discover: {
            niceType: "Discover",
            type: "discover",
            patterns: [ 6011, [ 644, 649 ], 65 ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16, 19 ],
            code: {
                name: "CID",
                size: 3
            }
        },
        jcb: {
            niceType: "JCB",
            type: "jcb",
            patterns: [ 2131, 1800, [ 3528, 3589 ] ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16, 17, 18, 19 ],
            code: {
                name: "CVV",
                size: 3
            }
        },
        unionpay: {
            niceType: "UnionPay",
            type: "unionpay",
            patterns: [ 620, [ 624, 626 ], [ 62100, 62182 ], [ 62184, 62187 ], [ 62185, 62197 ], [ 62200, 62205 ], [ 622010, 622999 ], 622018, [ 622019, 622999 ], [ 62207, 62209 ], [ 622126, 622925 ], [ 623, 626 ], 6270, 6272, 6276, [ 627700, 627779 ], [ 627781, 627799 ], [ 6282, 6289 ], 6291, 6292, 810, [ 8110, 8131 ], [ 8132, 8151 ], [ 8152, 8163 ], [ 8164, 8171 ] ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 14, 15, 16, 17, 18, 19 ],
            code: {
                name: "CVN",
                size: 3
            }
        },
        maestro: {
            niceType: "Maestro",
            type: "maestro",
            patterns: [ 493698, [ 5e5, 504174 ], [ 504176, 506698 ], [ 506779, 508999 ], [ 56, 59 ], 63, 67, 6 ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 12, 13, 14, 15, 16, 17, 18, 19 ],
            code: {
                name: "CVC",
                size: 3
            }
        },
        elo: {
            niceType: "Elo",
            type: "elo",
            patterns: [ 401178, 401179, 438935, 457631, 457632, 431274, 451416, 457393, 504175, [ 506699, 506778 ], [ 509e3, 509999 ], 627780, 636297, 636368, [ 650031, 650033 ], [ 650035, 650051 ], [ 650405, 650439 ], [ 650485, 650538 ], [ 650541, 650598 ], [ 650700, 650718 ], [ 650720, 650727 ], [ 650901, 650978 ], [ 651652, 651679 ], [ 655e3, 655019 ], [ 655021, 655058 ] ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16 ],
            code: {
                name: "CVE",
                size: 3
            }
        },
        mir: {
            niceType: "Mir",
            type: "mir",
            patterns: [ [ 2200, 2204 ] ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16, 17, 18, 19 ],
            code: {
                name: "CVP2",
                size: 3
            }
        },
        hiper: {
            niceType: "Hiper",
            type: "hiper",
            patterns: [ 637095, 63737423, 63743358, 637568, 637599, 637609, 637612 ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16 ],
            code: {
                name: "CVC",
                size: 3
            }
        },
        hipercard: {
            niceType: "Hipercard",
            type: "hipercard",
            patterns: [ 606282 ],
            gaps: [ 4, 8, 12 ],
            lengths: [ 16 ],
            code: {
                name: "CVC",
                size: 3
            }
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.addMatchingCardsToResults = void 0;
    var clone_1 = __webpack_require__(7);
    var matches_1 = __webpack_require__(15);
    exports.addMatchingCardsToResults = function(cardNumber, cardConfiguration, results) {
        var i, patternLength;
        for (i = 0; i < cardConfiguration.patterns.length; i++) {
            var pattern = cardConfiguration.patterns[i];
            if (matches_1.matches(cardNumber, pattern)) {
                var clonedCardConfiguration = clone_1.clone(cardConfiguration);
                patternLength = Array.isArray(pattern) ? String(pattern[0]).length : String(pattern).length;
                cardNumber.length >= patternLength && (clonedCardConfiguration.matchStrength = patternLength);
                results.push(clonedCardConfiguration);
                break;
            }
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.matches = void 0;
    exports.matches = function(cardNumber, pattern) {
        return Array.isArray(pattern) ? function(cardNumber, min, max) {
            var maxLengthToCheck = String(min).length;
            var substr = cardNumber.substr(0, maxLengthToCheck);
            var integerRepresentationOfCardNumber = parseInt(substr, 10);
            min = parseInt(String(min).substr(0, substr.length), 10);
            max = parseInt(String(max).substr(0, substr.length), 10);
            return integerRepresentationOfCardNumber >= min && integerRepresentationOfCardNumber <= max;
        }(cardNumber, pattern[0], pattern[1]) : function(cardNumber, pattern) {
            return (pattern = String(pattern)).substring(0, cardNumber.length) === cardNumber.substring(0, pattern.length);
        }(cardNumber, pattern);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.isValidInputType = void 0;
    exports.isValidInputType = function(cardNumber) {
        return "string" == typeof cardNumber || cardNumber instanceof String;
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.findBestMatch = void 0;
    exports.findBestMatch = function(results) {
        return function(results) {
            var numberOfResultsWithMaxStrengthProperty = results.filter((function(result) {
                return result.matchStrength;
            })).length;
            return numberOfResultsWithMaxStrengthProperty > 0 && numberOfResultsWithMaxStrengthProperty === results.length;
        }(results) ? results.reduce((function(bestMatch, result) {
            return bestMatch ? Number(bestMatch.matchStrength) < Number(result.matchStrength) ? result : bestMatch : result;
        })) : null;
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.cardholderName = void 0;
    var CARD_NUMBER_REGEX = /^[\d\s-]*$/;
    function verification(isValid, isPotentiallyValid) {
        return {
            isValid: isValid,
            isPotentiallyValid: isPotentiallyValid
        };
    }
    exports.cardholderName = function(value) {
        return "string" != typeof value ? verification(!1, !1) : 0 === value.length ? verification(!1, !0) : value.length > 255 ? verification(!1, !1) : CARD_NUMBER_REGEX.test(value) ? verification(!1, !0) : verification(!0, !0);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.cardNumber = void 0;
    var luhn10 = __webpack_require__(20);
    var getCardTypes = __webpack_require__(6);
    function verification(card, isPotentiallyValid, isValid) {
        return {
            card: card,
            isPotentiallyValid: isPotentiallyValid,
            isValid: isValid
        };
    }
    exports.cardNumber = function(value, options) {
        void 0 === options && (options = {});
        var isValid, maxLength;
        if ("string" != typeof value && "number" != typeof value) return verification(null, !1, !1);
        var testCardValue = String(value).replace(/-|\s/g, "");
        if (!/^\d*$/.test(testCardValue)) return verification(null, !1, !1);
        var potentialTypes = getCardTypes(testCardValue);
        if (0 === potentialTypes.length) return verification(null, !1, !1);
        if (1 !== potentialTypes.length) return verification(null, !0, !1);
        var cardType = potentialTypes[0];
        if (options.maxLength && testCardValue.length > options.maxLength) return verification(cardType, !1, !1);
        isValid = cardType.type === getCardTypes.types.UNIONPAY && !0 !== options.luhnValidateUnionPay || luhn10(testCardValue);
        maxLength = Math.max.apply(null, cardType.lengths);
        options.maxLength && (maxLength = Math.min(options.maxLength, maxLength));
        for (var i = 0; i < cardType.lengths.length; i++) if (cardType.lengths[i] === testCardValue.length) return verification(cardType, testCardValue.length < maxLength || isValid, isValid);
        return verification(cardType, testCardValue.length < maxLength, !1);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(identifier) {
        var sum = 0;
        var alt = !1;
        var i = identifier.length - 1;
        var num;
        for (;i >= 0; ) {
            num = parseInt(identifier.charAt(i), 10);
            alt && (num *= 2) > 9 && (num = num % 10 + 1);
            alt = !alt;
            sum += num;
            i--;
        }
        return sum % 10 == 0;
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __assign = this && this.__assign || function() {
        return (__assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) ({}).hasOwnProperty.call(s, p) && (t[p] = s[p]);
            }
            return t;
        }).apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.expirationDate = void 0;
    var parse_date_1 = __webpack_require__(22);
    var expiration_month_1 = __webpack_require__(8);
    var expiration_year_1 = __webpack_require__(5);
    function verification(isValid, isPotentiallyValid, month, year) {
        return {
            isValid: isValid,
            isPotentiallyValid: isPotentiallyValid,
            month: month,
            year: year
        };
    }
    exports.expirationDate = function(value, maxElapsedYear) {
        var date;
        if ("string" == typeof value) {
            value = value.replace(/^(\d\d) (\d\d(\d\d)?)$/, "$1/$2");
            date = parse_date_1.parseDate(String(value));
        } else {
            if (null === value || "object" != typeof value) return verification(!1, !1, null, null);
            var fullDate = __assign({}, value);
            date = {
                month: String(fullDate.month),
                year: String(fullDate.year)
            };
        }
        var monthValid = expiration_month_1.expirationMonth(date.month);
        var yearValid = expiration_year_1.expirationYear(date.year, maxElapsedYear);
        if (monthValid.isValid) {
            if (yearValid.isCurrentYear) {
                var isValidForThisYear = monthValid.isValidForThisYear;
                return verification(isValidForThisYear, isValidForThisYear, date.month, date.year);
            }
            if (yearValid.isValid) return verification(!0, !0, date.month, date.year);
        }
        return verification(!1, !(!monthValid.isPotentiallyValid || !yearValid.isPotentiallyValid), null, null);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.parseDate = void 0;
    var expiration_year_1 = __webpack_require__(5);
    var is_array_1 = __webpack_require__(23);
    exports.parseDate = function(datestring) {
        var date;
        /^\d{4}-\d{1,2}$/.test(datestring) ? date = datestring.split("-").reverse() : /\//.test(datestring) ? date = datestring.split(/\s*\/\s*/g) : /\s/.test(datestring) && (date = datestring.split(/ +/g));
        if (is_array_1.isArray(date)) return {
            month: date[0] || "",
            year: date.slice(1).join()
        };
        var numberOfDigitsInMonth = function(dateString) {
            var firstCharacter = Number(dateString[0]);
            var assumedYear;
            if (0 === firstCharacter) return 2;
            if (firstCharacter > 1) return 1;
            if (1 === firstCharacter && Number(dateString[1]) > 2) return 1;
            if (1 === firstCharacter) {
                assumedYear = dateString.substr(1);
                return expiration_year_1.expirationYear(assumedYear).isPotentiallyValid ? 1 : 2;
            }
            return 5 === dateString.length ? 1 : dateString.length > 5 ? 2 : 1;
        }(datestring);
        var month = datestring.substr(0, numberOfDigitsInMonth);
        return {
            month: month,
            year: datestring.substr(month.length)
        };
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.isArray = void 0;
    exports.isArray = Array.isArray || function(arg) {
        return "[object Array]" === {}.toString.call(arg);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.cvv = void 0;
    function verification(isValid, isPotentiallyValid) {
        return {
            isValid: isValid,
            isPotentiallyValid: isPotentiallyValid
        };
    }
    exports.cvv = function(value, maxLength) {
        void 0 === maxLength && (maxLength = 3);
        maxLength = maxLength instanceof Array ? maxLength : [ maxLength ];
        return "string" != typeof value ? verification(!1, !1) : /^\d*$/.test(value) ? function(array, thing) {
            for (var i = 0; i < array.length; i++) if (thing === array[i]) return !0;
            return !1;
        }(maxLength, value.length) ? verification(!0, !0) : value.length < Math.min.apply(null, maxLength) ? verification(!1, !0) : value.length > function(array) {
            var maximum = 3;
            var i = 0;
            for (;i < array.length; i++) maximum = array[i] > maximum ? array[i] : maximum;
            return maximum;
        }(maxLength) ? verification(!1, !1) : verification(!0, !0) : verification(!1, !1);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    exports.postalCode = void 0;
    function verification(isValid, isPotentiallyValid) {
        return {
            isValid: isValid,
            isPotentiallyValid: isPotentiallyValid
        };
    }
    exports.postalCode = function(value, options) {
        void 0 === options && (options = {});
        var minLength = options.minLength || 3;
        return "string" != typeof value ? verification(!1, !1) : verification(!(value.length < minLength), !0);
    };
}, function(module, exports, __webpack_require__) {
    "undefined" != typeof self && self, module.exports = function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                i: moduleId,
                l: !1,
                exports: {}
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.l = !0;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports, name, getter) {
            __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
                enumerable: !0,
                get: getter
            });
        };
        __webpack_require__.r = function(exports) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
                value: "Module"
            });
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
        };
        __webpack_require__.t = function(value, mode) {
            1 & mode && (value = __webpack_require__(value));
            if (8 & mode) return value;
            if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
            var ns = Object.create(null);
            __webpack_require__.r(ns);
            Object.defineProperty(ns, "default", {
                enumerable: !0,
                value: value
            });
            if (2 & mode && "string" != typeof value) for (var key in value) __webpack_require__.d(ns, key, function(key) {
                return value[key];
            }.bind(null, key));
            return ns;
        };
        __webpack_require__.n = function(module) {
            var getter = module && module.__esModule ? function() {
                return module.default;
            } : function() {
                return module;
            };
            __webpack_require__.d(getter, "a", getter);
            return getter;
        };
        __webpack_require__.o = function(object, property) {
            return {}.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = 0);
    }([ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, "getUserAgent", (function() {
            return getUserAgent;
        }));
        __webpack_require__.d(__webpack_exports__, "isDevice", (function() {
            return isDevice;
        }));
        __webpack_require__.d(__webpack_exports__, "isTablet", (function() {
            return isTablet;
        }));
        __webpack_require__.d(__webpack_exports__, "isWebView", (function() {
            return isWebView;
        }));
        __webpack_require__.d(__webpack_exports__, "isStandAlone", (function() {
            return isStandAlone;
        }));
        __webpack_require__.d(__webpack_exports__, "isFacebookWebView", (function() {
            return isFacebookWebView;
        }));
        __webpack_require__.d(__webpack_exports__, "isFirefox", (function() {
            return isFirefox;
        }));
        __webpack_require__.d(__webpack_exports__, "isFirefoxIOS", (function() {
            return isFirefoxIOS;
        }));
        __webpack_require__.d(__webpack_exports__, "isEdgeIOS", (function() {
            return isEdgeIOS;
        }));
        __webpack_require__.d(__webpack_exports__, "isOperaMini", (function() {
            return isOperaMini;
        }));
        __webpack_require__.d(__webpack_exports__, "isAndroid", (function() {
            return isAndroid;
        }));
        __webpack_require__.d(__webpack_exports__, "isIos", (function() {
            return isIos;
        }));
        __webpack_require__.d(__webpack_exports__, "isIOS14", (function() {
            return isIOS14;
        }));
        __webpack_require__.d(__webpack_exports__, "isGoogleSearchApp", (function() {
            return isGoogleSearchApp;
        }));
        __webpack_require__.d(__webpack_exports__, "isQQBrowser", (function() {
            return isQQBrowser;
        }));
        __webpack_require__.d(__webpack_exports__, "isIosWebview", (function() {
            return isIosWebview;
        }));
        __webpack_require__.d(__webpack_exports__, "isSFVC", (function() {
            return isSFVC;
        }));
        __webpack_require__.d(__webpack_exports__, "isSFVCorSafari", (function() {
            return isSFVCorSafari;
        }));
        __webpack_require__.d(__webpack_exports__, "isAndroidWebview", (function() {
            return isAndroidWebview;
        }));
        __webpack_require__.d(__webpack_exports__, "isIE", (function() {
            return device_isIE;
        }));
        __webpack_require__.d(__webpack_exports__, "isIECompHeader", (function() {
            return isIECompHeader;
        }));
        __webpack_require__.d(__webpack_exports__, "isElectron", (function() {
            return isElectron;
        }));
        __webpack_require__.d(__webpack_exports__, "isIEIntranet", (function() {
            return isIEIntranet;
        }));
        __webpack_require__.d(__webpack_exports__, "isMacOsCna", (function() {
            return isMacOsCna;
        }));
        __webpack_require__.d(__webpack_exports__, "supportsPopups", (function() {
            return supportsPopups;
        }));
        __webpack_require__.d(__webpack_exports__, "isChrome", (function() {
            return isChrome;
        }));
        __webpack_require__.d(__webpack_exports__, "isSafari", (function() {
            return isSafari;
        }));
        __webpack_require__.d(__webpack_exports__, "isApplePaySupported", (function() {
            return isApplePaySupported;
        }));
        __webpack_require__.d(__webpack_exports__, "isCrossSiteTrackingEnabled", (function() {
            return isCrossSiteTrackingEnabled;
        }));
        __webpack_require__.d(__webpack_exports__, "getBody", (function() {
            return getBody;
        }));
        __webpack_require__.d(__webpack_exports__, "isDocumentReady", (function() {
            return isDocumentReady;
        }));
        __webpack_require__.d(__webpack_exports__, "isDocumentInteractive", (function() {
            return isDocumentInteractive;
        }));
        __webpack_require__.d(__webpack_exports__, "urlEncode", (function() {
            return urlEncode;
        }));
        __webpack_require__.d(__webpack_exports__, "waitForWindowReady", (function() {
            return waitForWindowReady;
        }));
        __webpack_require__.d(__webpack_exports__, "waitForDocumentReady", (function() {
            return waitForDocumentReady;
        }));
        __webpack_require__.d(__webpack_exports__, "waitForDocumentBody", (function() {
            return waitForDocumentBody;
        }));
        __webpack_require__.d(__webpack_exports__, "parseQuery", (function() {
            return parseQuery;
        }));
        __webpack_require__.d(__webpack_exports__, "getQueryParam", (function() {
            return getQueryParam;
        }));
        __webpack_require__.d(__webpack_exports__, "urlWillRedirectPage", (function() {
            return urlWillRedirectPage;
        }));
        __webpack_require__.d(__webpack_exports__, "formatQuery", (function() {
            return formatQuery;
        }));
        __webpack_require__.d(__webpack_exports__, "extendQuery", (function() {
            return extendQuery;
        }));
        __webpack_require__.d(__webpack_exports__, "extendUrl", (function() {
            return extendUrl;
        }));
        __webpack_require__.d(__webpack_exports__, "redirect", (function() {
            return redirect;
        }));
        __webpack_require__.d(__webpack_exports__, "hasMetaViewPort", (function() {
            return hasMetaViewPort;
        }));
        __webpack_require__.d(__webpack_exports__, "isElementVisible", (function() {
            return isElementVisible;
        }));
        __webpack_require__.d(__webpack_exports__, "getPerformance", (function() {
            return getPerformance;
        }));
        __webpack_require__.d(__webpack_exports__, "enablePerformance", (function() {
            return enablePerformance;
        }));
        __webpack_require__.d(__webpack_exports__, "getPageRenderTime", (function() {
            return getPageRenderTime;
        }));
        __webpack_require__.d(__webpack_exports__, "htmlEncode", (function() {
            return htmlEncode;
        }));
        __webpack_require__.d(__webpack_exports__, "isBrowser", (function() {
            return dom_isBrowser;
        }));
        __webpack_require__.d(__webpack_exports__, "querySelectorAll", (function() {
            return querySelectorAll;
        }));
        __webpack_require__.d(__webpack_exports__, "onClick", (function() {
            return onClick;
        }));
        __webpack_require__.d(__webpack_exports__, "getScript", (function() {
            return getScript;
        }));
        __webpack_require__.d(__webpack_exports__, "isLocalStorageEnabled", (function() {
            return isLocalStorageEnabled;
        }));
        __webpack_require__.d(__webpack_exports__, "getBrowserLocales", (function() {
            return getBrowserLocales;
        }));
        __webpack_require__.d(__webpack_exports__, "appendChild", (function() {
            return appendChild;
        }));
        __webpack_require__.d(__webpack_exports__, "getElementSafe", (function() {
            return getElementSafe;
        }));
        __webpack_require__.d(__webpack_exports__, "getElement", (function() {
            return getElement;
        }));
        __webpack_require__.d(__webpack_exports__, "elementReady", (function() {
            return elementReady;
        }));
        __webpack_require__.d(__webpack_exports__, "PopupOpenError", (function() {
            return dom_PopupOpenError;
        }));
        __webpack_require__.d(__webpack_exports__, "popup", (function() {
            return popup;
        }));
        __webpack_require__.d(__webpack_exports__, "writeToWindow", (function() {
            return writeToWindow;
        }));
        __webpack_require__.d(__webpack_exports__, "writeElementToWindow", (function() {
            return writeElementToWindow;
        }));
        __webpack_require__.d(__webpack_exports__, "setStyle", (function() {
            return setStyle;
        }));
        __webpack_require__.d(__webpack_exports__, "awaitFrameLoad", (function() {
            return awaitFrameLoad;
        }));
        __webpack_require__.d(__webpack_exports__, "awaitFrameWindow", (function() {
            return awaitFrameWindow;
        }));
        __webpack_require__.d(__webpack_exports__, "createElement", (function() {
            return createElement;
        }));
        __webpack_require__.d(__webpack_exports__, "iframe", (function() {
            return iframe;
        }));
        __webpack_require__.d(__webpack_exports__, "addEventListener", (function() {
            return addEventListener;
        }));
        __webpack_require__.d(__webpack_exports__, "bindEvents", (function() {
            return bindEvents;
        }));
        __webpack_require__.d(__webpack_exports__, "setVendorCSS", (function() {
            return setVendorCSS;
        }));
        __webpack_require__.d(__webpack_exports__, "animate", (function() {
            return animate;
        }));
        __webpack_require__.d(__webpack_exports__, "makeElementVisible", (function() {
            return makeElementVisible;
        }));
        __webpack_require__.d(__webpack_exports__, "makeElementInvisible", (function() {
            return makeElementInvisible;
        }));
        __webpack_require__.d(__webpack_exports__, "showElement", (function() {
            return showElement;
        }));
        __webpack_require__.d(__webpack_exports__, "hideElement", (function() {
            return hideElement;
        }));
        __webpack_require__.d(__webpack_exports__, "destroyElement", (function() {
            return destroyElement;
        }));
        __webpack_require__.d(__webpack_exports__, "showAndAnimate", (function() {
            return showAndAnimate;
        }));
        __webpack_require__.d(__webpack_exports__, "animateAndHide", (function() {
            return animateAndHide;
        }));
        __webpack_require__.d(__webpack_exports__, "addClass", (function() {
            return addClass;
        }));
        __webpack_require__.d(__webpack_exports__, "removeClass", (function() {
            return removeClass;
        }));
        __webpack_require__.d(__webpack_exports__, "isElementClosed", (function() {
            return isElementClosed;
        }));
        __webpack_require__.d(__webpack_exports__, "watchElementForClose", (function() {
            return watchElementForClose;
        }));
        __webpack_require__.d(__webpack_exports__, "fixScripts", (function() {
            return fixScripts;
        }));
        __webpack_require__.d(__webpack_exports__, "onResize", (function() {
            return onResize;
        }));
        __webpack_require__.d(__webpack_exports__, "getResourceLoadTime", (function() {
            return getResourceLoadTime;
        }));
        __webpack_require__.d(__webpack_exports__, "isShadowElement", (function() {
            return isShadowElement;
        }));
        __webpack_require__.d(__webpack_exports__, "getShadowRoot", (function() {
            return getShadowRoot;
        }));
        __webpack_require__.d(__webpack_exports__, "getShadowHost", (function() {
            return getShadowHost;
        }));
        __webpack_require__.d(__webpack_exports__, "insertShadowSlot", (function() {
            return insertShadowSlot;
        }));
        __webpack_require__.d(__webpack_exports__, "preventClickFocus", (function() {
            return preventClickFocus;
        }));
        __webpack_require__.d(__webpack_exports__, "getStackTrace", (function() {
            return getStackTrace;
        }));
        __webpack_require__.d(__webpack_exports__, "getCurrentScript", (function() {
            return getCurrentScript;
        }));
        __webpack_require__.d(__webpack_exports__, "getCurrentScriptUID", (function() {
            return getCurrentScriptUID;
        }));
        __webpack_require__.d(__webpack_exports__, "submitForm", (function() {
            return submitForm;
        }));
        __webpack_require__.d(__webpack_exports__, "experiment", (function() {
            return experiment;
        }));
        __webpack_require__.d(__webpack_exports__, "getGlobalNameSpace", (function() {
            return getGlobalNameSpace;
        }));
        __webpack_require__.d(__webpack_exports__, "getStorage", (function() {
            return getStorage;
        }));
        __webpack_require__.d(__webpack_exports__, "isElement", (function() {
            return isElement;
        }));
        __webpack_require__.d(__webpack_exports__, "getFunctionName", (function() {
            return getFunctionName;
        }));
        __webpack_require__.d(__webpack_exports__, "setFunctionName", (function() {
            return setFunctionName;
        }));
        __webpack_require__.d(__webpack_exports__, "base64encode", (function() {
            return base64encode;
        }));
        __webpack_require__.d(__webpack_exports__, "base64decode", (function() {
            return base64decode;
        }));
        __webpack_require__.d(__webpack_exports__, "uniqueID", (function() {
            return uniqueID;
        }));
        __webpack_require__.d(__webpack_exports__, "getGlobal", (function() {
            return getGlobal;
        }));
        __webpack_require__.d(__webpack_exports__, "getObjectID", (function() {
            return getObjectID;
        }));
        __webpack_require__.d(__webpack_exports__, "getEmptyObject", (function() {
            return getEmptyObject;
        }));
        __webpack_require__.d(__webpack_exports__, "memoize", (function() {
            return memoize;
        }));
        __webpack_require__.d(__webpack_exports__, "promiseIdentity", (function() {
            return promiseIdentity;
        }));
        __webpack_require__.d(__webpack_exports__, "memoizePromise", (function() {
            return memoizePromise;
        }));
        __webpack_require__.d(__webpack_exports__, "promisify", (function() {
            return promisify;
        }));
        __webpack_require__.d(__webpack_exports__, "inlineMemoize", (function() {
            return inlineMemoize;
        }));
        __webpack_require__.d(__webpack_exports__, "noop", (function() {
            return src_util_noop;
        }));
        __webpack_require__.d(__webpack_exports__, "once", (function() {
            return once;
        }));
        __webpack_require__.d(__webpack_exports__, "hashStr", (function() {
            return hashStr;
        }));
        __webpack_require__.d(__webpack_exports__, "strHashStr", (function() {
            return strHashStr;
        }));
        __webpack_require__.d(__webpack_exports__, "match", (function() {
            return match;
        }));
        __webpack_require__.d(__webpack_exports__, "awaitKey", (function() {
            return awaitKey;
        }));
        __webpack_require__.d(__webpack_exports__, "stringifyError", (function() {
            return stringifyError;
        }));
        __webpack_require__.d(__webpack_exports__, "stringifyErrorMessage", (function() {
            return stringifyErrorMessage;
        }));
        __webpack_require__.d(__webpack_exports__, "stringify", (function() {
            return stringify;
        }));
        __webpack_require__.d(__webpack_exports__, "domainMatches", (function() {
            return domainMatches;
        }));
        __webpack_require__.d(__webpack_exports__, "patchMethod", (function() {
            return patchMethod;
        }));
        __webpack_require__.d(__webpack_exports__, "extend", (function() {
            return extend;
        }));
        __webpack_require__.d(__webpack_exports__, "values", (function() {
            return util_values;
        }));
        __webpack_require__.d(__webpack_exports__, "memoizedValues", (function() {
            return memoizedValues;
        }));
        __webpack_require__.d(__webpack_exports__, "perc", (function() {
            return perc;
        }));
        __webpack_require__.d(__webpack_exports__, "min", (function() {
            return min;
        }));
        __webpack_require__.d(__webpack_exports__, "max", (function() {
            return max;
        }));
        __webpack_require__.d(__webpack_exports__, "roundUp", (function() {
            return roundUp;
        }));
        __webpack_require__.d(__webpack_exports__, "regexMap", (function() {
            return regexMap;
        }));
        __webpack_require__.d(__webpack_exports__, "svgToBase64", (function() {
            return svgToBase64;
        }));
        __webpack_require__.d(__webpack_exports__, "objFilter", (function() {
            return objFilter;
        }));
        __webpack_require__.d(__webpack_exports__, "identity", (function() {
            return identity;
        }));
        __webpack_require__.d(__webpack_exports__, "regexTokenize", (function() {
            return regexTokenize;
        }));
        __webpack_require__.d(__webpack_exports__, "promiseDebounce", (function() {
            return promiseDebounce;
        }));
        __webpack_require__.d(__webpack_exports__, "safeInterval", (function() {
            return safeInterval;
        }));
        __webpack_require__.d(__webpack_exports__, "isInteger", (function() {
            return isInteger;
        }));
        __webpack_require__.d(__webpack_exports__, "isFloat", (function() {
            return isFloat;
        }));
        __webpack_require__.d(__webpack_exports__, "serializePrimitive", (function() {
            return serializePrimitive;
        }));
        __webpack_require__.d(__webpack_exports__, "deserializePrimitive", (function() {
            return deserializePrimitive;
        }));
        __webpack_require__.d(__webpack_exports__, "dotify", (function() {
            return dotify;
        }));
        __webpack_require__.d(__webpack_exports__, "undotify", (function() {
            return undotify;
        }));
        __webpack_require__.d(__webpack_exports__, "eventEmitter", (function() {
            return eventEmitter;
        }));
        __webpack_require__.d(__webpack_exports__, "camelToDasherize", (function() {
            return camelToDasherize;
        }));
        __webpack_require__.d(__webpack_exports__, "dasherizeToCamel", (function() {
            return dasherizeToCamel;
        }));
        __webpack_require__.d(__webpack_exports__, "capitalizeFirstLetter", (function() {
            return capitalizeFirstLetter;
        }));
        __webpack_require__.d(__webpack_exports__, "get", (function() {
            return util_get;
        }));
        __webpack_require__.d(__webpack_exports__, "safeTimeout", (function() {
            return safeTimeout;
        }));
        __webpack_require__.d(__webpack_exports__, "defineLazyProp", (function() {
            return defineLazyProp;
        }));
        __webpack_require__.d(__webpack_exports__, "arrayFrom", (function() {
            return arrayFrom;
        }));
        __webpack_require__.d(__webpack_exports__, "isObject", (function() {
            return isObject;
        }));
        __webpack_require__.d(__webpack_exports__, "isObjectObject", (function() {
            return isObjectObject;
        }));
        __webpack_require__.d(__webpack_exports__, "isPlainObject", (function() {
            return isPlainObject;
        }));
        __webpack_require__.d(__webpack_exports__, "replaceObject", (function() {
            return replaceObject;
        }));
        __webpack_require__.d(__webpack_exports__, "copyProp", (function() {
            return copyProp;
        }));
        __webpack_require__.d(__webpack_exports__, "regex", (function() {
            return regex;
        }));
        __webpack_require__.d(__webpack_exports__, "regexAll", (function() {
            return regexAll;
        }));
        __webpack_require__.d(__webpack_exports__, "isDefined", (function() {
            return isDefined;
        }));
        __webpack_require__.d(__webpack_exports__, "cycle", (function() {
            return cycle;
        }));
        __webpack_require__.d(__webpack_exports__, "debounce", (function() {
            return debounce;
        }));
        __webpack_require__.d(__webpack_exports__, "isRegex", (function() {
            return util_isRegex;
        }));
        __webpack_require__.d(__webpack_exports__, "weakMapMemoize", (function() {
            return util_weakMapMemoize;
        }));
        __webpack_require__.d(__webpack_exports__, "weakMapMemoizePromise", (function() {
            return util_weakMapMemoizePromise;
        }));
        __webpack_require__.d(__webpack_exports__, "getOrSet", (function() {
            return getOrSet;
        }));
        __webpack_require__.d(__webpack_exports__, "cleanup", (function() {
            return cleanup;
        }));
        __webpack_require__.d(__webpack_exports__, "tryCatch", (function() {
            return tryCatch;
        }));
        __webpack_require__.d(__webpack_exports__, "removeFromArray", (function() {
            return removeFromArray;
        }));
        __webpack_require__.d(__webpack_exports__, "assertExists", (function() {
            return assertExists;
        }));
        __webpack_require__.d(__webpack_exports__, "unique", (function() {
            return unique;
        }));
        __webpack_require__.d(__webpack_exports__, "constHas", (function() {
            return constHas;
        }));
        __webpack_require__.d(__webpack_exports__, "dedupeErrors", (function() {
            return dedupeErrors;
        }));
        __webpack_require__.d(__webpack_exports__, "ExtendableError", (function() {
            return util_ExtendableError;
        }));
        __webpack_require__.d(__webpack_exports__, "request", (function() {
            return request;
        }));
        __webpack_require__.d(__webpack_exports__, "addHeaderBuilder", (function() {
            return addHeaderBuilder;
        }));
        __webpack_require__.d(__webpack_exports__, "TYPES", (function() {
            return types_TYPES;
        }));
        __webpack_require__.d(__webpack_exports__, "memoized", (function() {
            return memoized;
        }));
        __webpack_require__.d(__webpack_exports__, "promise", (function() {
            return decorators_promise;
        }));
        __webpack_require__.d(__webpack_exports__, "isPerc", (function() {
            return isPerc;
        }));
        __webpack_require__.d(__webpack_exports__, "isPx", (function() {
            return isPx;
        }));
        __webpack_require__.d(__webpack_exports__, "toNum", (function() {
            return toNum;
        }));
        __webpack_require__.d(__webpack_exports__, "toPx", (function() {
            return toPx;
        }));
        __webpack_require__.d(__webpack_exports__, "toCSS", (function() {
            return toCSS;
        }));
        __webpack_require__.d(__webpack_exports__, "percOf", (function() {
            return percOf;
        }));
        __webpack_require__.d(__webpack_exports__, "normalizeDimension", (function() {
            return normalizeDimension;
        }));
        __webpack_require__.d(__webpack_exports__, "wrapPromise", (function() {
            return wrapPromise;
        }));
        __webpack_require__.d(__webpack_exports__, "KEY_CODES", (function() {
            return KEY_CODES;
        }));
        __webpack_require__.d(__webpack_exports__, "ATTRIBUTES", (function() {
            return ATTRIBUTES;
        }));
        __webpack_require__.d(__webpack_exports__, "UID_HASH_LENGTH", (function() {
            return UID_HASH_LENGTH;
        }));
        __webpack_require__.d(__webpack_exports__, "sfvcScreens", (function() {
            return sfvcScreens;
        }));
        var sfvcScreens = {
            932: {
                textSizeHeights: [ 746, 742, 738 ],
                textSizeHeightsNoTabs: [ 854, 852, 850, 848 ],
                zoomHeight: {
                    1.15: [ 746, 742, 738 ],
                    1.25: [ 746, 743 ],
                    1.5: [ 746, 743 ],
                    1.75: [ 746, 742, 739 ],
                    2: [ 746, 742 ],
                    2.5: [ 745, 743 ],
                    3: [ 749 ],
                    3.01: [ 749 ]
                },
                maybeSafari: {
                    1: [ 732 ],
                    1.15: [ 733 ],
                    1.25: [ 738, 733 ],
                    1.5: [ 738, 732 ],
                    1.75: [ 732 ],
                    2: [ 738, 732 ],
                    2.5: [ 738, 733 ],
                    3: [ 743, 740, 734 ],
                    3.01: [ 743, 740, 734 ]
                }
            },
            926: {
                textSizeHeights: [ 752, 748, 744, 738 ],
                textSizeHeightsNoTabs: [ 860, 858, 856, 854 ],
                zoomHeight: {
                    1.15: [ 752, 747, 744, 738 ],
                    1.25: [ 753, 748, 744, 738 ],
                    1.5: [ 752, 749, 744, 738 ],
                    1.75: [ 753, 747, 744, 739 ],
                    2: [ 752, 748, 744 ],
                    2.5: [ 753, 748 ],
                    3: [ 753, 744 ]
                },
                maybeSafari: {
                    2: [ 738 ],
                    2.5: [ 745, 738 ],
                    3: [ 747, 738 ]
                }
            },
            896: {
                textSizeHeights: [ 721, 717, 713, 707 ],
                textSizeHeightsNoTabs: [ 829, 827, 825, 823 ],
                zoomHeight: {
                    1.15: [ 721, 716, 713, 707 ],
                    1.25: [ 721, 718, 713, 708 ],
                    1.5: [ 722, 717, 713 ],
                    1.75: [ 721, 718, 712, 707 ],
                    2: [ 722, 718, 714, 708 ],
                    2.5: [ 720, 718, 713, 708 ],
                    3: [ 720, 717, 708 ]
                },
                maybeSafari: {
                    1.5: [ 707 ],
                    3: [ 714 ]
                }
            },
            852: {
                textSizeHeights: [ 666, 662, 658 ],
                textSizeHeightsNoTabs: [ 774, 772, 770, 768 ],
                zoomHeight: {
                    1.15: [ 666, 662, 658 ],
                    1.25: [ 665, 661, 658 ],
                    1.5: [ 666, 662, 659 ],
                    1.75: [ 667, 662 ],
                    1.99: [ 663, 659 ],
                    2: [ 663, 659 ],
                    2.5: [ 665, 663 ],
                    3: [ 666, 663 ]
                },
                maybeSafari: {
                    1: [ 652 ],
                    1.15: [ 652 ],
                    1.25: [ 651 ],
                    1.5: [ 653 ],
                    1.75: [ 658, 653 ],
                    1.99: [ 655, 649 ],
                    2: [ 655, 649 ],
                    2.5: [ 658, 653 ],
                    3: [ 657, 651 ]
                }
            },
            844: {
                textSizeHeights: [ 670, 666, 662, 656 ],
                textSizeHeightsNoTabs: [ 778, 776, 774, 772 ],
                zoomHeight: {
                    1.15: [ 670, 666, 662 ],
                    1.25: [ 670, 666, 663, 656 ],
                    1.5: [ 671, 666, 662 ],
                    1.75: [ 670, 667, 662, 656 ],
                    2: [ 670, 666, 662 ],
                    2.5: [ 670, 663 ],
                    3: [ 669, 666, 663, 657 ]
                },
                maybeSafari: {
                    1.15: [ 656 ],
                    1.5: [ 656 ],
                    2: [ 656 ],
                    2.5: [ 665, 655 ],
                    3: [ 663 ]
                }
            },
            812: {
                textSizeHeights: [ 641, 637, 633, 627 ],
                textSizeHeightsNoTabs: [ 749, 747, 745, 743 ],
                zoomHeight: {
                    1.15: [ 641, 637, 633, 627 ],
                    1.25: [ 641, 638, 633, 628 ],
                    1.5: [ 641, 638, 633, 627 ],
                    1.75: [ 641, 637, 634 ],
                    2: [ 642, 638, 634, 628 ],
                    2.5: [ 640, 638, 633, 628 ],
                    3: [ 642, 633 ]
                },
                maybeSafari: {
                    1.75: [ 627 ],
                    3: [ 636, 627 ]
                }
            },
            736: {
                textSizeHeights: [ 628, 624, 620, 614 ],
                textSizeHeightsNoTabs: [ 736, 734, 732, 730 ],
                zoomHeight: {
                    1.15: [ 628, 624, 620, 614 ],
                    1.25: [ 628, 624, 620, 614 ],
                    1.5: [ 629, 624, 620 ],
                    1.75: [ 628, 625, 620, 614 ],
                    2: [ 628, 624, 620 ],
                    2.5: [ 628, 625, 620, 615 ],
                    3: [ 627, 624, 615 ]
                },
                maybeSafari: {
                    1.5: [ 614 ],
                    2: [ 614 ],
                    3: [ 621 ]
                }
            },
            667: {
                textSizeHeights: [ 559, 555, 551, 545 ],
                textSizeHeightsNoTabs: [ 667, 665, 663, 661 ],
                zoomHeight: {
                    1.15: [ 559, 555, 551, 545 ],
                    1.25: [ 559, 555, 551, 545 ],
                    1.5: [ 560, 555, 551 ],
                    1.75: [ 558, 555, 551 ],
                    2: [ 560, 556, 552, 546 ],
                    2.5: [ 560, 555, 550 ],
                    3: [ 558, 555, 546 ]
                },
                maybeSafari: {
                    1.5: [ 545 ],
                    1.75: [ 544 ],
                    2.5: [ 545 ],
                    3: [ 552 ]
                }
            }
        };
        function getUserAgent() {
            return window.navigator.mockUserAgent || window.navigator.userAgent;
        }
        var TABLET_PATTERN = /ip(a|ro)d|silk|xoom|playbook|tablet|kindle|Nexus 7|GT-P10|SC-01C|SHW-M180S|SM-T320|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC( Flyer|_Flyer)|Sprint ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos S7|Dell Streak 7|Advent Vega|A101IT|A70BHT|MID7015|Next2|nook|FOLIO|MB511.*RUTEM|Mac OS.*Silk/i;
        function isDevice(userAgent) {
            void 0 === userAgent && (userAgent = getUserAgent());
            return !!userAgent.match(/Android|webOS|iPhone|iPad|iPod|bada|Symbian|Palm|CriOS|BlackBerry|IEMobile|WindowsMobile|Opera Mini/i);
        }
        function isTablet(userAgent) {
            void 0 === userAgent && (userAgent = getUserAgent());
            return TABLET_PATTERN.test(userAgent);
        }
        function isWebView() {
            var userAgent = getUserAgent();
            return /(iPhone|iPod|iPad|Macintosh).*AppleWebKit(?!.*Safari)|.*WKWebView/i.test(userAgent) || /\bwv\b/.test(userAgent) || /Android.*Version\/(\d)\.(\d)/i.test(userAgent);
        }
        function isStandAlone() {
            return !0 === window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
        }
        function isFacebookWebView(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /FBAN/.test(ua) || /FBAV/.test(ua);
        }
        function isFirefox(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /Firefox/i.test(ua);
        }
        function isFirefoxIOS(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /FxiOS/i.test(ua);
        }
        function isEdgeIOS(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /EdgiOS/i.test(ua);
        }
        function isOperaMini(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /Opera Mini/i.test(ua);
        }
        function isAndroid(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /Android/.test(ua);
        }
        function isIos(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /iPhone|iPod|iPad/.test(ua);
        }
        function isIOS14(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /iPhone.*OS.*(1)?(?:(1)[0-4]| [0-9])_/.test(ua);
        }
        function isGoogleSearchApp(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /\bGSA\b/.test(ua);
        }
        function isQQBrowser(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /QQBrowser/.test(ua);
        }
        function isIosWebview(ua) {
            void 0 === ua && (ua = getUserAgent());
            return !!isIos(ua) && (!!isGoogleSearchApp(ua) || /.+AppleWebKit(?!.*Safari)|.*WKWebView/.test(ua));
        }
        function isSFVC(ua) {
            void 0 === ua && (ua = getUserAgent());
            if (isIos(ua)) {
                var height = window.innerHeight;
                var scale = Math.round(window.screen.width / window.innerWidth * 100) / 100;
                var computedHeight = Math.round(height * scale);
                var device = null;
                if (isIOS14(ua)) device = sfvcScreens[window.outerHeight]; else {
                    if (1 !== scale) return !0;
                    device = sfvcScreens[window.outerHeight];
                }
                return !device || (scale > 1 && device.zoomHeight && device.zoomHeight[scale] ? -1 !== device.zoomHeight[scale].indexOf(computedHeight) : -1 !== device.textSizeHeights.indexOf(computedHeight) || -1 !== device.textSizeHeightsNoTabs.indexOf(computedHeight));
            }
            return !1;
        }
        function isSFVCorSafari(ua) {
            void 0 === ua && (ua = getUserAgent());
            if (isIos(ua)) {
                var sfvc = isSFVC(ua);
                var device = isIOS14(ua) ? sfvcScreens[window.outerHeight] : null;
                if (!device) return !1;
                var height = window.innerHeight;
                var scale = Math.round(window.screen.width / window.innerWidth * 100) / 100;
                var computedHeight = Math.round(height * scale);
                var possibleSafariSizes = device.maybeSafari;
                var maybeSafari = !1;
                scale > 1 && possibleSafariSizes[scale] && -1 !== possibleSafariSizes[scale].indexOf(computedHeight) && (maybeSafari = !0);
                return sfvc || maybeSafari;
            }
            return !1;
        }
        function isAndroidWebview(ua) {
            void 0 === ua && (ua = getUserAgent());
            return !!isAndroid(ua) && /Version\/[\d.]+/.test(ua) && !isOperaMini(ua);
        }
        function device_isIE() {
            return !!window.document.documentMode || Boolean(window.navigator && window.navigator.userAgent && /Edge|MSIE|rv:11/i.test(window.navigator.userAgent));
        }
        function isIECompHeader() {
            var mHttp = window.document.querySelector('meta[http-equiv="X-UA-Compatible"]');
            var mContent = window.document.querySelector('meta[content="IE=edge"]');
            return !(!mHttp || !mContent);
        }
        function isElectron() {
            return !("undefined" == typeof process || !process.versions || !process.versions.electron);
        }
        function isIEIntranet() {
            if (window.document.documentMode) try {
                var status = window.status;
                window.status = "testIntranetMode";
                if ("testIntranetMode" === window.status) {
                    window.status = status;
                    return !0;
                }
                return !1;
            } catch (err) {
                return !1;
            }
            return !1;
        }
        function isMacOsCna() {
            var userAgent = getUserAgent();
            return /Macintosh.*AppleWebKit(?!.*Safari)/i.test(userAgent);
        }
        function supportsPopups(ua) {
            void 0 === ua && (ua = getUserAgent());
            return !(isIosWebview(ua) || isAndroidWebview(ua) || isOperaMini(ua) || isFirefoxIOS(ua) || isEdgeIOS(ua) || isFacebookWebView(ua) || isQQBrowser(ua) || isElectron() || isMacOsCna() || isStandAlone());
        }
        function isChrome(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /Chrome|Chromium|CriOS/.test(ua) && !/SamsungBrowser|Silk|EdgA/.test(ua);
        }
        function isSafari(ua) {
            void 0 === ua && (ua = getUserAgent());
            return /Safari/.test(ua) && !isChrome(ua) && !/Silk|FxiOS|EdgiOS/.test(ua);
        }
        function isApplePaySupported() {
            try {
                if (window.ApplePaySession && window.ApplePaySession.supportsVersion(3) && window.ApplePaySession.canMakePayments()) return !0;
            } catch (e) {
                return !1;
            }
            return !1;
        }
        function isCrossSiteTrackingEnabled(expectedCookieKey) {
            return -1 === window.document.cookie.indexOf(expectedCookieKey);
        }
        function _setPrototypeOf(o, p) {
            return (_setPrototypeOf = Object.setPrototypeOf || function(o, p) {
                o.__proto__ = p;
                return o;
            })(o, p);
        }
        function _inheritsLoose(subClass, superClass) {
            subClass.prototype = Object.create(superClass.prototype);
            subClass.prototype.constructor = subClass;
            _setPrototypeOf(subClass, superClass);
        }
        function _extends() {
            return (_extends = Object.assign || function(target) {
                for (var i = 1; i < arguments.length; i++) {
                    var source = arguments[i];
                    for (var key in source) ({}).hasOwnProperty.call(source, key) && (target[key] = source[key]);
                }
                return target;
            }).apply(this, arguments);
        }
        function utils_isPromise(item) {
            try {
                if (!item) return !1;
                if ("undefined" != typeof Promise && item instanceof Promise) return !0;
                if ("undefined" != typeof window && "function" == typeof window.Window && item instanceof window.Window) return !1;
                if ("undefined" != typeof window && "function" == typeof window.constructor && item instanceof window.constructor) return !1;
                var _toString = {}.toString;
                if (_toString) {
                    var name = _toString.call(item);
                    if ("[object Window]" === name || "[object global]" === name || "[object DOMWindow]" === name) return !1;
                }
                if ("function" == typeof item.then) return !0;
            } catch (err) {
                return !1;
            }
            return !1;
        }
        var dispatchedErrors = [];
        var possiblyUnhandledPromiseHandlers = [];
        var activeCount = 0;
        var flushPromise;
        function flushActive() {
            if (!activeCount && flushPromise) {
                var promise = flushPromise;
                flushPromise = null;
                promise.resolve();
            }
        }
        function startActive() {
            activeCount += 1;
        }
        function endActive() {
            activeCount -= 1;
            flushActive();
        }
        var promise_ZalgoPromise = function() {
            function ZalgoPromise(handler) {
                var _this = this;
                this.resolved = void 0;
                this.rejected = void 0;
                this.errorHandled = void 0;
                this.value = void 0;
                this.error = void 0;
                this.handlers = void 0;
                this.dispatching = void 0;
                this.stack = void 0;
                this.resolved = !1;
                this.rejected = !1;
                this.errorHandled = !1;
                this.handlers = [];
                if (handler) {
                    var _result;
                    var _error;
                    var resolved = !1;
                    var rejected = !1;
                    var isAsync = !1;
                    startActive();
                    try {
                        handler((function(res) {
                            if (isAsync) _this.resolve(res); else {
                                resolved = !0;
                                _result = res;
                            }
                        }), (function(err) {
                            if (isAsync) _this.reject(err); else {
                                rejected = !0;
                                _error = err;
                            }
                        }));
                    } catch (err) {
                        endActive();
                        this.reject(err);
                        return;
                    }
                    endActive();
                    isAsync = !0;
                    resolved ? this.resolve(_result) : rejected && this.reject(_error);
                }
            }
            var _proto = ZalgoPromise.prototype;
            _proto.resolve = function(result) {
                if (this.resolved || this.rejected) return this;
                if (utils_isPromise(result)) throw new Error("Can not resolve promise with another promise");
                this.resolved = !0;
                this.value = result;
                this.dispatch();
                return this;
            };
            _proto.reject = function(error) {
                var _this2 = this;
                if (this.resolved || this.rejected) return this;
                if (utils_isPromise(error)) throw new Error("Can not reject promise with another promise");
                if (!error) {
                    var _err = error && "function" == typeof error.toString ? error.toString() : {}.toString.call(error);
                    error = new Error("Expected reject to be called with Error, got " + _err);
                }
                this.rejected = !0;
                this.error = error;
                this.errorHandled || setTimeout((function() {
                    _this2.errorHandled || function(err, promise) {
                        if (-1 === dispatchedErrors.indexOf(err)) {
                            dispatchedErrors.push(err);
                            setTimeout((function() {
                                throw err;
                            }), 1);
                            for (var j = 0; j < possiblyUnhandledPromiseHandlers.length; j++) possiblyUnhandledPromiseHandlers[j](err, promise);
                        }
                    }(error, _this2);
                }), 1);
                this.dispatch();
                return this;
            };
            _proto.asyncReject = function(error) {
                this.errorHandled = !0;
                this.reject(error);
                return this;
            };
            _proto.dispatch = function() {
                var resolved = this.resolved, rejected = this.rejected, handlers = this.handlers;
                if (!this.dispatching && (resolved || rejected)) {
                    this.dispatching = !0;
                    startActive();
                    var chain = function(firstPromise, secondPromise) {
                        return firstPromise.then((function(res) {
                            secondPromise.resolve(res);
                        }), (function(err) {
                            secondPromise.reject(err);
                        }));
                    };
                    for (var i = 0; i < handlers.length; i++) {
                        var _handlers$i = handlers[i], onSuccess = _handlers$i.onSuccess, onError = _handlers$i.onError, promise = _handlers$i.promise;
                        var _result2 = void 0;
                        if (resolved) try {
                            _result2 = onSuccess ? onSuccess(this.value) : this.value;
                        } catch (err) {
                            promise.reject(err);
                            continue;
                        } else if (rejected) {
                            if (!onError) {
                                promise.reject(this.error);
                                continue;
                            }
                            try {
                                _result2 = onError(this.error);
                            } catch (err) {
                                promise.reject(err);
                                continue;
                            }
                        }
                        if (_result2 instanceof ZalgoPromise && (_result2.resolved || _result2.rejected)) {
                            var promiseResult = _result2;
                            promiseResult.resolved ? promise.resolve(promiseResult.value) : promise.reject(promiseResult.error);
                            promiseResult.errorHandled = !0;
                        } else utils_isPromise(_result2) ? _result2 instanceof ZalgoPromise && (_result2.resolved || _result2.rejected) ? _result2.resolved ? promise.resolve(_result2.value) : promise.reject(_result2.error) : chain(_result2, promise) : promise.resolve(_result2);
                    }
                    handlers.length = 0;
                    this.dispatching = !1;
                    endActive();
                }
            };
            _proto.then = function(onSuccess, onError) {
                if (onSuccess && "function" != typeof onSuccess && !onSuccess.call) throw new Error("Promise.then expected a function for success handler");
                if (onError && "function" != typeof onError && !onError.call) throw new Error("Promise.then expected a function for error handler");
                var promise = new ZalgoPromise;
                this.handlers.push({
                    promise: promise,
                    onSuccess: onSuccess,
                    onError: onError
                });
                this.errorHandled = !0;
                this.dispatch();
                return promise;
            };
            _proto.catch = function(onError) {
                return this.then(void 0, onError);
            };
            _proto.finally = function(onFinally) {
                if (onFinally && "function" != typeof onFinally && !onFinally.call) throw new Error("Promise.finally expected a function");
                return this.then((function(result) {
                    return ZalgoPromise.try(onFinally).then((function() {
                        return result;
                    }));
                }), (function(err) {
                    return ZalgoPromise.try(onFinally).then((function() {
                        throw err;
                    }));
                }));
            };
            _proto.timeout = function(time, err) {
                var _this3 = this;
                if (this.resolved || this.rejected) return this;
                var timeout = setTimeout((function() {
                    _this3.resolved || _this3.rejected || _this3.reject(err || new Error("Promise timed out after " + time + "ms"));
                }), time);
                return this.then((function(result) {
                    clearTimeout(timeout);
                    return result;
                }));
            };
            _proto.toPromise = function() {
                if ("undefined" == typeof Promise) throw new TypeError("Could not find Promise");
                return Promise.resolve(this);
            };
            _proto.lazy = function() {
                this.errorHandled = !0;
                return this;
            };
            ZalgoPromise.resolve = function(value) {
                return value instanceof ZalgoPromise ? value : utils_isPromise(value) ? new ZalgoPromise((function(resolve, reject) {
                    return value.then(resolve, reject);
                })) : (new ZalgoPromise).resolve(value);
            };
            ZalgoPromise.reject = function(error) {
                return (new ZalgoPromise).reject(error);
            };
            ZalgoPromise.asyncReject = function(error) {
                return (new ZalgoPromise).asyncReject(error);
            };
            ZalgoPromise.all = function(promises) {
                var promise = new ZalgoPromise;
                var count = promises.length;
                var results = [].slice();
                if (!count) {
                    promise.resolve(results);
                    return promise;
                }
                var chain = function(i, firstPromise, secondPromise) {
                    return firstPromise.then((function(res) {
                        results[i] = res;
                        0 == (count -= 1) && promise.resolve(results);
                    }), (function(err) {
                        secondPromise.reject(err);
                    }));
                };
                for (var i = 0; i < promises.length; i++) {
                    var prom = promises[i];
                    if (prom instanceof ZalgoPromise) {
                        if (prom.resolved) {
                            results[i] = prom.value;
                            count -= 1;
                            continue;
                        }
                    } else if (!utils_isPromise(prom)) {
                        results[i] = prom;
                        count -= 1;
                        continue;
                    }
                    chain(i, ZalgoPromise.resolve(prom), promise);
                }
                0 === count && promise.resolve(results);
                return promise;
            };
            ZalgoPromise.hash = function(promises) {
                var result = {};
                var awaitPromises = [];
                var _loop = function(key) {
                    if (promises.hasOwnProperty(key)) {
                        var value = promises[key];
                        utils_isPromise(value) ? awaitPromises.push(value.then((function(res) {
                            result[key] = res;
                        }))) : result[key] = value;
                    }
                };
                for (var key in promises) _loop(key);
                return ZalgoPromise.all(awaitPromises).then((function() {
                    return result;
                }));
            };
            ZalgoPromise.map = function(items, method) {
                return ZalgoPromise.all(items.map(method));
            };
            ZalgoPromise.onPossiblyUnhandledException = function(handler) {
                return function(handler) {
                    possiblyUnhandledPromiseHandlers.push(handler);
                    return {
                        cancel: function() {
                            possiblyUnhandledPromiseHandlers.splice(possiblyUnhandledPromiseHandlers.indexOf(handler), 1);
                        }
                    };
                }(handler);
            };
            ZalgoPromise.try = function(method, context, args) {
                if (method && "function" != typeof method && !method.call) throw new Error("Promise.try expected a function");
                var result;
                startActive();
                try {
                    result = method.apply(context, args || []);
                } catch (err) {
                    endActive();
                    return ZalgoPromise.reject(err);
                }
                endActive();
                return ZalgoPromise.resolve(result);
            };
            ZalgoPromise.delay = function(_delay) {
                return new ZalgoPromise((function(resolve) {
                    setTimeout(resolve, _delay);
                }));
            };
            ZalgoPromise.isPromise = function(value) {
                return !!(value && value instanceof ZalgoPromise) || utils_isPromise(value);
            };
            ZalgoPromise.flush = function() {
                return function(Zalgo) {
                    var promise = flushPromise = flushPromise || new Zalgo;
                    flushActive();
                    return promise;
                }(ZalgoPromise);
            };
            return ZalgoPromise;
        }();
        var IE_WIN_ACCESS_ERROR = "Call was rejected by callee.\r\n";
        function getActualProtocol(win) {
            void 0 === win && (win = window);
            return win.location.protocol;
        }
        function getProtocol(win) {
            void 0 === win && (win = window);
            if (win.mockDomain) {
                var protocol = win.mockDomain.split("//")[0];
                if (protocol) return protocol;
            }
            return getActualProtocol(win);
        }
        function isAboutProtocol(win) {
            void 0 === win && (win = window);
            return "about:" === getProtocol(win);
        }
        function canReadFromWindow(win) {
            try {
                return !0;
            } catch (err) {}
            return !1;
        }
        function getActualDomain(win) {
            void 0 === win && (win = window);
            var location = win.location;
            if (!location) throw new Error("Can not read window location");
            var protocol = getActualProtocol(win);
            if (!protocol) throw new Error("Can not read window protocol");
            if ("file:" === protocol) return "file://";
            if ("about:" === protocol) {
                var parent = function(win) {
                    void 0 === win && (win = window);
                    if (win) try {
                        if (win.parent && win.parent !== win) return win.parent;
                    } catch (err) {}
                }(win);
                return parent && canReadFromWindow() ? getActualDomain(parent) : "about://";
            }
            var host = location.host;
            if (!host) throw new Error("Can not read window host");
            return protocol + "//" + host;
        }
        function getDomain(win) {
            void 0 === win && (win = window);
            var domain = getActualDomain(win);
            return domain && win.mockDomain && 0 === win.mockDomain.indexOf("mock:") ? win.mockDomain : domain;
        }
        function isSameDomain(win) {
            if (!function(win) {
                try {
                    if (win === window) return !0;
                } catch (err) {}
                try {
                    var desc = Object.getOwnPropertyDescriptor(win, "location");
                    if (desc && !1 === desc.enumerable) return !1;
                } catch (err) {}
                try {
                    if (isAboutProtocol(win) && canReadFromWindow()) return !0;
                } catch (err) {}
                try {
                    if (function(win) {
                        void 0 === win && (win = window);
                        return "mock:" === getProtocol(win);
                    }(win) && canReadFromWindow()) return !0;
                } catch (err) {}
                try {
                    if (getActualDomain(win) === getActualDomain(window)) return !0;
                } catch (err) {}
                return !1;
            }(win)) return !1;
            try {
                if (win === window) return !0;
                if (isAboutProtocol(win) && canReadFromWindow()) return !0;
                if (getDomain(window) === getDomain(win)) return !0;
            } catch (err) {}
            return !1;
        }
        var iframeWindows = [];
        var iframeFrames = [];
        function isWindowClosed(win, allowMock) {
            void 0 === allowMock && (allowMock = !0);
            try {
                if (win === window) return !1;
            } catch (err) {
                return !0;
            }
            try {
                if (!win) return !0;
            } catch (err) {
                return !0;
            }
            try {
                if (win.closed) return !0;
            } catch (err) {
                return !err || err.message !== IE_WIN_ACCESS_ERROR;
            }
            if (allowMock && isSameDomain(win)) try {
                if (win.mockclosed) return !0;
            } catch (err) {}
            try {
                if (!win.parent || !win.top) return !0;
            } catch (err) {}
            var iframeIndex = function(collection, item) {
                for (var i = 0; i < collection.length; i++) try {
                    if (collection[i] === item) return i;
                } catch (err) {}
                return -1;
            }(iframeWindows, win);
            if (-1 !== iframeIndex) {
                var frame = iframeFrames[iframeIndex];
                if (frame && function(frame) {
                    if (!frame.contentWindow) return !0;
                    if (!frame.parentNode) return !0;
                    var doc = frame.ownerDocument;
                    if (doc && doc.documentElement && !doc.documentElement.contains(frame)) {
                        var parent = frame;
                        for (;parent.parentNode && parent.parentNode !== parent; ) parent = parent.parentNode;
                        if (!parent.host || !doc.documentElement.contains(parent.host)) return !0;
                    }
                    return !1;
                }(frame)) return !0;
            }
            return !1;
        }
        function isWindow(obj) {
            try {
                if (obj === window) return !0;
            } catch (err) {
                if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
            }
            try {
                if ("[object Window]" === {}.toString.call(obj)) return !0;
            } catch (err) {
                if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
            }
            try {
                if (window.Window && obj instanceof window.Window) return !0;
            } catch (err) {
                if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
            }
            try {
                if (obj && obj.self === obj) return !0;
            } catch (err) {
                if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
            }
            try {
                if (obj && obj.parent === obj) return !0;
            } catch (err) {
                if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
            }
            try {
                if (obj && obj.top === obj) return !0;
            } catch (err) {
                if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
            }
            try {
                if (obj && "__unlikely_value__" === obj.__cross_domain_utils_window_check__) return !1;
            } catch (err) {
                return !0;
            }
            try {
                if ("postMessage" in obj && "self" in obj && "location" in obj) return !0;
            } catch (err) {}
            return !1;
        }
        function util_safeIndexOf(collection, item) {
            for (var i = 0; i < collection.length; i++) try {
                if (collection[i] === item) return i;
            } catch (err) {}
            return -1;
        }
        var weakmap_CrossDomainSafeWeakMap = function() {
            function CrossDomainSafeWeakMap() {
                this.name = void 0;
                this.weakmap = void 0;
                this.keys = void 0;
                this.values = void 0;
                this.name = "__weakmap_" + (1e9 * Math.random() >>> 0) + "__";
                if (function() {
                    if ("undefined" == typeof WeakMap) return !1;
                    if (void 0 === Object.freeze) return !1;
                    try {
                        var testWeakMap = new WeakMap;
                        var testKey = {};
                        Object.freeze(testKey);
                        testWeakMap.set(testKey, "__testvalue__");
                        return "__testvalue__" === testWeakMap.get(testKey);
                    } catch (err) {
                        return !1;
                    }
                }()) try {
                    this.weakmap = new WeakMap;
                } catch (err) {}
                this.keys = [];
                this.values = [];
            }
            var _proto = CrossDomainSafeWeakMap.prototype;
            _proto._cleanupClosedWindows = function() {
                var weakmap = this.weakmap;
                var keys = this.keys;
                for (var i = 0; i < keys.length; i++) {
                    var value = keys[i];
                    if (isWindow(value) && isWindowClosed(value)) {
                        if (weakmap) try {
                            weakmap.delete(value);
                        } catch (err) {}
                        keys.splice(i, 1);
                        this.values.splice(i, 1);
                        i -= 1;
                    }
                }
            };
            _proto.isSafeToReadWrite = function(key) {
                return !isWindow(key);
            };
            _proto.set = function(key, value) {
                if (!key) throw new Error("WeakMap expected key");
                var weakmap = this.weakmap;
                if (weakmap) try {
                    weakmap.set(key, value);
                } catch (err) {
                    delete this.weakmap;
                }
                if (this.isSafeToReadWrite(key)) try {
                    var name = this.name;
                    var entry = key[name];
                    entry && entry[0] === key ? entry[1] = value : Object.defineProperty(key, name, {
                        value: [ key, value ],
                        writable: !0
                    });
                    return;
                } catch (err) {}
                this._cleanupClosedWindows();
                var keys = this.keys;
                var values = this.values;
                var index = util_safeIndexOf(keys, key);
                if (-1 === index) {
                    keys.push(key);
                    values.push(value);
                } else values[index] = value;
            };
            _proto.get = function(key) {
                if (!key) throw new Error("WeakMap expected key");
                var weakmap = this.weakmap;
                if (weakmap) try {
                    if (weakmap.has(key)) return weakmap.get(key);
                } catch (err) {
                    delete this.weakmap;
                }
                if (this.isSafeToReadWrite(key)) try {
                    var entry = key[this.name];
                    return entry && entry[0] === key ? entry[1] : void 0;
                } catch (err) {}
                this._cleanupClosedWindows();
                var index = util_safeIndexOf(this.keys, key);
                if (-1 !== index) return this.values[index];
            };
            _proto.delete = function(key) {
                if (!key) throw new Error("WeakMap expected key");
                var weakmap = this.weakmap;
                if (weakmap) try {
                    weakmap.delete(key);
                } catch (err) {
                    delete this.weakmap;
                }
                if (this.isSafeToReadWrite(key)) try {
                    var entry = key[this.name];
                    entry && entry[0] === key && (entry[0] = entry[1] = void 0);
                } catch (err) {}
                this._cleanupClosedWindows();
                var keys = this.keys;
                var index = util_safeIndexOf(keys, key);
                if (-1 !== index) {
                    keys.splice(index, 1);
                    this.values.splice(index, 1);
                }
            };
            _proto.has = function(key) {
                if (!key) throw new Error("WeakMap expected key");
                var weakmap = this.weakmap;
                if (weakmap) try {
                    if (weakmap.has(key)) return !0;
                } catch (err) {
                    delete this.weakmap;
                }
                if (this.isSafeToReadWrite(key)) try {
                    var entry = key[this.name];
                    return !(!entry || entry[0] !== key);
                } catch (err) {}
                this._cleanupClosedWindows();
                return -1 !== util_safeIndexOf(this.keys, key);
            };
            _proto.getOrSet = function(key, getter) {
                if (this.has(key)) return this.get(key);
                var value = getter();
                this.set(key, value);
                return value;
            };
            return CrossDomainSafeWeakMap;
        }();
        function _getPrototypeOf(o) {
            return (_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function(o) {
                return o.__proto__ || Object.getPrototypeOf(o);
            })(o);
        }
        function _isNativeReflectConstruct() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
                Date.prototype.toString.call(Reflect.construct(Date, [], (function() {})));
                return !0;
            } catch (e) {
                return !1;
            }
        }
        function construct_construct(Parent, args, Class) {
            return (construct_construct = _isNativeReflectConstruct() ? Reflect.construct : function(Parent, args, Class) {
                var a = [ null ];
                a.push.apply(a, args);
                var instance = new (Function.bind.apply(Parent, a));
                Class && _setPrototypeOf(instance, Class.prototype);
                return instance;
            }).apply(null, arguments);
        }
        function wrapNativeSuper_wrapNativeSuper(Class) {
            var _cache = "function" == typeof Map ? new Map : void 0;
            return (wrapNativeSuper_wrapNativeSuper = function(Class) {
                if (null === Class || !(fn = Class, -1 !== Function.toString.call(fn).indexOf("[native code]"))) return Class;
                var fn;
                if ("function" != typeof Class) throw new TypeError("Super expression must either be null or a function");
                if (void 0 !== _cache) {
                    if (_cache.has(Class)) return _cache.get(Class);
                    _cache.set(Class, Wrapper);
                }
                function Wrapper() {
                    return construct_construct(Class, arguments, _getPrototypeOf(this).constructor);
                }
                Wrapper.prototype = Object.create(Class.prototype, {
                    constructor: {
                        value: Wrapper,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                });
                return _setPrototypeOf(Wrapper, Class);
            })(Class);
        }
        function isElement(element) {
            var passed = !1;
            try {
                (element instanceof window.Element || null !== element && "object" == typeof element && 1 === element.nodeType && "object" == typeof element.style && "object" == typeof element.ownerDocument) && (passed = !0);
            } catch (_) {}
            return passed;
        }
        function getFunctionName(fn) {
            return fn.name || fn.__name__ || fn.displayName || "anonymous";
        }
        function setFunctionName(fn, name) {
            try {
                delete fn.name;
                fn.name = name;
            } catch (err) {}
            fn.__name__ = fn.displayName = name;
            return fn;
        }
        function base64encode(str) {
            if ("function" == typeof btoa) return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (function(m, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            }))).replace(/[=]/g, "");
            if ("undefined" != typeof Buffer) return Buffer.from(str, "utf8").toString("base64").replace(/[=]/g, "");
            throw new Error("Can not find window.btoa or Buffer");
        }
        function base64decode(str) {
            if ("function" == typeof atob) return decodeURIComponent([].map.call(atob(str), (function(c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })).join(""));
            if ("undefined" != typeof Buffer) return Buffer.from(str, "base64").toString("utf8");
            throw new Error("Can not find window.atob or Buffer");
        }
        function uniqueID() {
            var chars = "0123456789abcdef";
            return "uid_" + "xxxxxxxxxx".replace(/./g, (function() {
                return chars.charAt(Math.floor(Math.random() * chars.length));
            })) + "_" + base64encode((new Date).toISOString().slice(11, 19).replace("T", ".")).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        }
        function getGlobal() {
            if ("undefined" != typeof window) return window;
            if ("undefined" != typeof window) return window;
            if ("undefined" != typeof window) return window;
            throw new Error("No global found");
        }
        var objectIDs;
        function getObjectID(obj) {
            objectIDs = objectIDs || new weakmap_CrossDomainSafeWeakMap;
            if (null == obj || "object" != typeof obj && "function" != typeof obj) throw new Error("Invalid object");
            var uid = objectIDs.get(obj);
            if (!uid) {
                uid = typeof obj + ":" + uniqueID();
                objectIDs.set(obj, uid);
            }
            return uid;
        }
        function serializeArgs(args) {
            try {
                return JSON.stringify([].slice.call(args), (function(subkey, val) {
                    return "function" == typeof val ? "memoize[" + getObjectID(val) + "]" : isElement(val) ? {} : val;
                }));
            } catch (err) {
                throw new Error("Arguments not serializable -- can not be used to memoize");
            }
        }
        function getEmptyObject() {
            return {};
        }
        var memoizeGlobalIndex = 0;
        var memoizeGlobalIndexValidFrom = 0;
        function memoize(method, options) {
            void 0 === options && (options = {});
            var _options$thisNamespac = options.thisNamespace, thisNamespace = void 0 !== _options$thisNamespac && _options$thisNamespac, cacheTime = options.time;
            var simpleCache;
            var thisCache;
            var memoizeIndex = memoizeGlobalIndex;
            memoizeGlobalIndex += 1;
            var memoizedFunction = function() {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                if (memoizeIndex < memoizeGlobalIndexValidFrom) {
                    simpleCache = null;
                    thisCache = null;
                    memoizeIndex = memoizeGlobalIndex;
                    memoizeGlobalIndex += 1;
                }
                var cache;
                cache = thisNamespace ? (thisCache = thisCache || new weakmap_CrossDomainSafeWeakMap).getOrSet(this, getEmptyObject) : simpleCache = simpleCache || {};
                var cacheKey;
                try {
                    cacheKey = serializeArgs(args);
                } catch (_unused) {
                    return method.apply(this, arguments);
                }
                var cacheResult = cache[cacheKey];
                if (cacheResult && cacheTime && Date.now() - cacheResult.time < cacheTime) {
                    delete cache[cacheKey];
                    cacheResult = null;
                }
                if (cacheResult) return cacheResult.value;
                var time = Date.now();
                var value = method.apply(this, arguments);
                cache[cacheKey] = {
                    time: time,
                    value: value
                };
                return value;
            };
            memoizedFunction.reset = function() {
                simpleCache = null;
                thisCache = null;
            };
            return setFunctionName(memoizedFunction, (options.name || getFunctionName(method)) + "::memoized");
        }
        memoize.clear = function() {
            memoizeGlobalIndexValidFrom = memoizeGlobalIndex;
        };
        function promiseIdentity(item) {
            return promise_ZalgoPromise.resolve(item);
        }
        function memoizePromise(method) {
            var cache = {};
            function memoizedPromiseFunction() {
                var _arguments = arguments, _this = this;
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
                var key = serializeArgs(args);
                if (cache.hasOwnProperty(key)) return cache[key];
                cache[key] = promise_ZalgoPromise.try((function() {
                    return method.apply(_this, _arguments);
                })).finally((function() {
                    delete cache[key];
                }));
                return cache[key];
            }
            memoizedPromiseFunction.reset = function() {
                cache = {};
            };
            return setFunctionName(memoizedPromiseFunction, getFunctionName(method) + "::promiseMemoized");
        }
        function promisify(method, options) {
            void 0 === options && (options = {});
            function promisifiedFunction() {
                return promise_ZalgoPromise.try(method, this, arguments);
            }
            options.name && (promisifiedFunction.displayName = options.name + ":promisified");
            return setFunctionName(promisifiedFunction, getFunctionName(method) + "::promisified");
        }
        function inlineMemoize(method, logic, args) {
            void 0 === args && (args = []);
            var cache = method.__inline_memoize_cache__ = method.__inline_memoize_cache__ || {};
            var key = serializeArgs(args);
            return cache.hasOwnProperty(key) ? cache[key] : cache[key] = logic.apply(void 0, args);
        }
        function src_util_noop() {}
        function once(method) {
            var called = !1;
            return setFunctionName((function() {
                if (!called) {
                    called = !0;
                    return method.apply(this, arguments);
                }
            }), getFunctionName(method) + "::once");
        }
        function hashStr(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) hash += str[i].charCodeAt(0) * Math.pow(i % 10 + 1, 5);
            return Math.floor(Math.pow(Math.sqrt(hash), 5));
        }
        function strHashStr(str) {
            var hash = "";
            for (var i = 0; i < str.length; i++) {
                var total = str[i].charCodeAt(0) * i;
                str[i + 1] && (total += str[i + 1].charCodeAt(0) * (i - 1));
                hash += String.fromCharCode(97 + Math.abs(total) % 26);
            }
            return hash;
        }
        function match(str, pattern) {
            var regmatch = str.match(pattern);
            if (regmatch) return regmatch[1];
        }
        function awaitKey(obj, key) {
            return new promise_ZalgoPromise((function(resolve) {
                var value = obj[key];
                if (value) return resolve(value);
                delete obj[key];
                Object.defineProperty(obj, key, {
                    configurable: !0,
                    set: function(item) {
                        (value = item) && resolve(value);
                    },
                    get: function() {
                        return value;
                    }
                });
            }));
        }
        function stringifyError(err, level) {
            void 0 === level && (level = 1);
            if (level >= 3) return "stringifyError stack overflow";
            try {
                if (!err) return "<unknown error: " + {}.toString.call(err) + ">";
                if ("string" == typeof err) return err;
                if (err instanceof Error) {
                    var stack = err && err.stack;
                    var message = err && err.message;
                    if (stack && message) return -1 !== stack.indexOf(message) ? stack : message + "\n" + stack;
                    if (stack) return stack;
                    if (message) return message;
                }
                return err && err.toString && "function" == typeof err.toString ? err.toString() : {}.toString.call(err);
            } catch (newErr) {
                return "Error while stringifying error: " + stringifyError(newErr, level + 1);
            }
        }
        function stringifyErrorMessage(err) {
            var defaultMessage = "<unknown error: " + {}.toString.call(err) + ">";
            return err ? err instanceof Error ? err.message || defaultMessage : "string" == typeof err.message && err.message || defaultMessage : defaultMessage;
        }
        function stringify(item) {
            return "string" == typeof item ? item : item && item.toString && "function" == typeof item.toString ? item.toString() : {}.toString.call(item);
        }
        function domainMatches(hostname, domain) {
            var index = (hostname = hostname.split("://")[1]).indexOf(domain);
            return -1 !== index && hostname.slice(index) === domain;
        }
        function patchMethod(obj, name, handler) {
            var original = obj[name];
            obj[name] = function() {
                var _arguments2 = arguments, _this2 = this;
                return handler({
                    context: this,
                    args: [].slice.call(arguments),
                    original: original,
                    callOriginal: function() {
                        return original.apply(_this2, _arguments2);
                    }
                });
            };
        }
        function extend(obj, source) {
            if (!source) return obj;
            if (Object.assign) return Object.assign(obj, source);
            for (var key in source) source.hasOwnProperty(key) && (obj[key] = source[key]);
            return obj;
        }
        function util_values(obj) {
            if (Object.values) return Object.values(obj);
            var result = [];
            for (var key in obj) obj.hasOwnProperty(key) && result.push(obj[key]);
            return result;
        }
        var memoizedValues = memoize(util_values);
        function perc(pixels, percentage) {
            return Math.round(pixels * percentage / 100);
        }
        function min() {
            return Math.min.apply(Math, arguments);
        }
        function max() {
            return Math.max.apply(Math, arguments);
        }
        function roundUp(num, nearest) {
            var remainder = num % nearest;
            return remainder ? num - remainder + nearest : num;
        }
        function regexMap(str, regexp, handler) {
            var results = [];
            str.replace(regexp, (function(item) {
                results.push(handler ? handler.apply(null, arguments) : item);
            }));
            return results;
        }
        function svgToBase64(svg) {
            return "data:image/svg+xml;base64," + base64encode(svg);
        }
        function objFilter(obj, filter) {
            void 0 === filter && (filter = Boolean);
            var result = {};
            for (var key in obj) obj.hasOwnProperty(key) && filter(obj[key], key) && (result[key] = obj[key]);
            return result;
        }
        function identity(item) {
            return item;
        }
        function regexTokenize(text, regexp) {
            var result = [];
            text.replace(regexp, (function(token) {
                result.push(token);
                return "";
            }));
            return result;
        }
        function promiseDebounce(method, delay) {
            void 0 === delay && (delay = 50);
            var promise;
            var timeout;
            return setFunctionName((function() {
                timeout && clearTimeout(timeout);
                var localPromise = promise = promise || new promise_ZalgoPromise;
                timeout = setTimeout((function() {
                    promise = null;
                    timeout = null;
                    promise_ZalgoPromise.try(method).then((function(result) {
                        localPromise.resolve(result);
                    }), (function(err) {
                        localPromise.reject(err);
                    }));
                }), delay);
                return localPromise;
            }), getFunctionName(method) + "::promiseDebounced");
        }
        function safeInterval(method, time) {
            var timeout;
            !function loop() {
                timeout = setTimeout((function() {
                    method();
                    loop();
                }), time);
            }();
            return {
                cancel: function() {
                    clearTimeout(timeout);
                }
            };
        }
        function isInteger(str) {
            return Boolean(str.match(/^[0-9]+$/));
        }
        function isFloat(str) {
            return Boolean(str.match(/^[0-9]+\.[0-9]+$/));
        }
        function serializePrimitive(value) {
            return value.toString();
        }
        function deserializePrimitive(value) {
            return "true" === value || "false" !== value && (isInteger(value) ? parseInt(value, 10) : isFloat(value) ? parseFloat(value) : value);
        }
        function dotify(obj, prefix, newobj) {
            void 0 === prefix && (prefix = "");
            void 0 === newobj && (newobj = {});
            prefix = prefix ? prefix + "." : prefix;
            for (var key in obj) obj.hasOwnProperty(key) && null != obj[key] && "function" != typeof obj[key] && (obj[key] && Array.isArray(obj[key]) && obj[key].length && obj[key].every((function(val) {
                return "object" != typeof val;
            })) ? newobj["" + prefix + key + "[]"] = obj[key].join(",") : obj[key] && "object" == typeof obj[key] ? newobj = dotify(obj[key], "" + prefix + key, newobj) : newobj["" + prefix + key] = serializePrimitive(obj[key]));
            return newobj;
        }
        function undotify(obj) {
            var result = {};
            for (var key in obj) if (obj.hasOwnProperty(key) && "string" == typeof obj[key]) {
                var value = obj[key];
                if (key.match(/^.+\[\]$/)) {
                    key = key.slice(0, -2);
                    value = value.split(",").map(deserializePrimitive);
                } else value = deserializePrimitive(value);
                var keyResult = result;
                var parts = key.split(".");
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    var isLast = i + 1 === parts.length;
                    var isIndex = !isLast && isInteger(parts[i + 1]);
                    if ("constructor" === part || "prototype" === part || "__proto__" === part) throw new Error("Disallowed key: " + part);
                    isLast ? keyResult[part] = value : keyResult = keyResult[part] = keyResult[part] || (isIndex ? [] : {});
                }
            }
            return result;
        }
        function eventEmitter() {
            var triggered = {};
            var handlers = {};
            var emitter = {
                on: function(eventName, handler) {
                    var handlerList = handlers[eventName] = handlers[eventName] || [];
                    handlerList.push(handler);
                    var cancelled = !1;
                    return {
                        cancel: function() {
                            if (!cancelled) {
                                cancelled = !0;
                                handlerList.splice(handlerList.indexOf(handler), 1);
                            }
                        }
                    };
                },
                once: function(eventName, handler) {
                    var listener = emitter.on(eventName, (function() {
                        listener.cancel();
                        handler();
                    }));
                    return listener;
                },
                trigger: function(eventName) {
                    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) args[_key3 - 1] = arguments[_key3];
                    var handlerList = handlers[eventName];
                    var promises = [];
                    if (handlerList) {
                        var _loop = function(_i2) {
                            var handler = handlerList[_i2];
                            promises.push(promise_ZalgoPromise.try((function() {
                                return handler.apply(void 0, args);
                            })));
                        };
                        for (var _i2 = 0; _i2 < handlerList.length; _i2++) _loop(_i2);
                    }
                    return promise_ZalgoPromise.all(promises).then(src_util_noop);
                },
                triggerOnce: function(eventName) {
                    if (triggered[eventName]) return promise_ZalgoPromise.resolve();
                    triggered[eventName] = !0;
                    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) args[_key4 - 1] = arguments[_key4];
                    return emitter.trigger.apply(emitter, [ eventName ].concat(args));
                },
                reset: function() {
                    handlers = {};
                }
            };
            return emitter;
        }
        function camelToDasherize(string) {
            return string.replace(/([A-Z])/g, (function(g) {
                return "-" + g.toLowerCase();
            }));
        }
        function dasherizeToCamel(string) {
            return string.replace(/-([a-z])/g, (function(g) {
                return g[1].toUpperCase();
            }));
        }
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }
        function util_get(item, path, def) {
            if (!path) return def;
            var pathParts = path.split(".");
            for (var i = 0; i < pathParts.length; i++) {
                if ("object" != typeof item || null === item) return def;
                item = item[pathParts[i]];
            }
            return void 0 === item ? def : item;
        }
        function safeTimeout(method, time) {
            var interval = safeInterval((function() {
                if ((time -= 100) <= 0) {
                    interval.cancel();
                    method();
                }
            }), 100);
        }
        function defineLazyProp(obj, key, getter) {
            if (Array.isArray(obj)) {
                if ("number" != typeof key) throw new TypeError("Array key must be number");
            } else if ("object" == typeof obj && null !== obj && "string" != typeof key) throw new TypeError("Object key must be string");
            Object.defineProperty(obj, key, {
                configurable: !0,
                enumerable: !0,
                get: function() {
                    delete obj[key];
                    var value = getter();
                    obj[key] = value;
                    return value;
                },
                set: function(value) {
                    delete obj[key];
                    obj[key] = value;
                }
            });
        }
        function arrayFrom(item) {
            return [].slice.call(item);
        }
        function isObject(item) {
            return "object" == typeof item && null !== item;
        }
        function isObjectObject(obj) {
            return isObject(obj) && "[object Object]" === {}.toString.call(obj);
        }
        function isPlainObject(obj) {
            if (!isObjectObject(obj)) return !1;
            var constructor = obj.constructor;
            if ("function" != typeof constructor) return !1;
            var prototype = constructor.prototype;
            return !!isObjectObject(prototype) && !!prototype.hasOwnProperty("isPrototypeOf");
        }
        function replaceObject(item, replacer, fullKey) {
            void 0 === fullKey && (fullKey = "");
            if (Array.isArray(item)) {
                var length = item.length;
                var result = [];
                var _loop2 = function(i) {
                    defineLazyProp(result, i, (function() {
                        var itemKey = fullKey ? fullKey + "." + i : "" + i;
                        var child = replacer(item[i], i, itemKey);
                        (isPlainObject(child) || Array.isArray(child)) && (child = replaceObject(child, replacer, itemKey));
                        return child;
                    }));
                };
                for (var i = 0; i < length; i++) _loop2(i);
                return result;
            }
            if (isPlainObject(item)) {
                var _result = {};
                var _loop3 = function(key) {
                    if (!item.hasOwnProperty(key)) return "continue";
                    defineLazyProp(_result, key, (function() {
                        var itemKey = fullKey ? fullKey + "." + key : "" + key;
                        var child = replacer(item[key], key, itemKey);
                        (isPlainObject(child) || Array.isArray(child)) && (child = replaceObject(child, replacer, itemKey));
                        return child;
                    }));
                };
                for (var key in item) _loop3(key);
                return _result;
            }
            throw new Error("Pass an object or array");
        }
        function copyProp(source, target, name, def) {
            if (source.hasOwnProperty(name)) {
                var descriptor = Object.getOwnPropertyDescriptor(source, name);
                Object.defineProperty(target, name, descriptor);
            } else target[name] = def;
        }
        function regex(pattern, string, start) {
            void 0 === start && (start = 0);
            "string" == typeof pattern && (pattern = new RegExp(pattern));
            var result = string.slice(start).match(pattern);
            if (result) {
                var index = result.index;
                var regmatch = result[0];
                return {
                    text: regmatch,
                    groups: result.slice(1),
                    start: start + index,
                    end: start + index + regmatch.length,
                    length: regmatch.length,
                    replace: function(text) {
                        return regmatch ? "" + regmatch.slice(0, start + index) + text + regmatch.slice(index + regmatch.length) : "";
                    }
                };
            }
        }
        function regexAll(pattern, string) {
            var matches = [];
            var start = 0;
            for (;;) {
                var regmatch = regex(pattern, string, start);
                if (!regmatch) break;
                matches.push(regmatch);
                start = match.end;
            }
            return matches;
        }
        function isDefined(value) {
            return null != value;
        }
        function cycle(method) {
            return promise_ZalgoPromise.try(method).then((function() {
                return cycle(method);
            }));
        }
        function debounce(method, time) {
            void 0 === time && (time = 100);
            var timeout;
            return setFunctionName((function() {
                var _arguments3 = arguments, _this3 = this;
                clearTimeout(timeout);
                timeout = setTimeout((function() {
                    return method.apply(_this3, _arguments3);
                }), time);
            }), getFunctionName(method) + "::debounced");
        }
        function util_isRegex(item) {
            return "[object RegExp]" === {}.toString.call(item);
        }
        var util_weakMapMemoize = function(method) {
            var weakmap = new weakmap_CrossDomainSafeWeakMap;
            return function(arg) {
                var _this4 = this;
                return weakmap.getOrSet(arg, (function() {
                    return method.call(_this4, arg);
                }));
            };
        };
        var util_weakMapMemoizePromise = function(method) {
            var weakmap = new weakmap_CrossDomainSafeWeakMap;
            return function(arg) {
                var _this5 = this;
                return weakmap.getOrSet(arg, (function() {
                    return method.call(_this5, arg).finally((function() {
                        weakmap.delete(arg);
                    }));
                }));
            };
        };
        function getOrSet(obj, key, getter) {
            if (obj.hasOwnProperty(key)) return obj[key];
            var val = getter();
            obj[key] = val;
            return val;
        }
        function cleanup(obj) {
            var tasks = [];
            var cleaned = !1;
            var cleanErr;
            var cleaner = {
                set: function(name, item) {
                    if (!cleaned) {
                        obj[name] = item;
                        cleaner.register((function() {
                            delete obj[name];
                        }));
                    }
                    return item;
                },
                register: function(method) {
                    var task = once((function() {
                        return method(cleanErr);
                    }));
                    cleaned ? method(cleanErr) : tasks.push(task);
                    return {
                        cancel: function() {
                            var index = tasks.indexOf(task);
                            -1 !== index && tasks.splice(index, 1);
                        }
                    };
                },
                all: function(err) {
                    cleanErr = err;
                    var results = [];
                    cleaned = !0;
                    for (;tasks.length; ) {
                        var task = tasks.shift();
                        results.push(task());
                    }
                    return promise_ZalgoPromise.all(results).then(src_util_noop);
                }
            };
            return cleaner;
        }
        function tryCatch(fn) {
            var result;
            var error;
            try {
                result = fn();
            } catch (err) {
                error = err;
            }
            return {
                result: result,
                error: error
            };
        }
        function removeFromArray(arr, item) {
            var index = arr.indexOf(item);
            -1 !== index && arr.splice(index, 1);
        }
        function assertExists(name, thing) {
            if (null == thing) throw new Error("Expected " + name + " to be present");
            return thing;
        }
        function unique(arr) {
            var result = {};
            for (var _i4 = 0; _i4 < arr.length; _i4++) result[arr[_i4]] = !0;
            return Object.keys(result);
        }
        var constHas = function(constant, value) {
            return -1 !== memoizedValues(constant).indexOf(value);
        };
        function dedupeErrors(handler) {
            var seenErrors = [];
            var seenStringifiedErrors = {};
            return function(err) {
                if (-1 === seenErrors.indexOf(err)) {
                    seenErrors.push(err);
                    var stringifiedError = stringifyError(err);
                    if (!seenStringifiedErrors[stringifiedError]) {
                        seenStringifiedErrors[stringifiedError] = !0;
                        return handler(err);
                    }
                }
            };
        }
        var util_ExtendableError = function(_Error) {
            _inheritsLoose(ExtendableError, _Error);
            function ExtendableError(message) {
                var _this6;
                (_this6 = _Error.call(this, message) || this).name = _this6.constructor.name;
                "function" == typeof Error.captureStackTrace ? Error.captureStackTrace(function(self) {
                    if (void 0 === self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    return self;
                }(_this6), _this6.constructor) : _this6.stack = new Error(message).stack;
                return _this6;
            }
            return ExtendableError;
        }(wrapNativeSuper_wrapNativeSuper(Error));
        var KEY_CODES = {
            ENTER: 13,
            SPACE: 32
        };
        var ATTRIBUTES = {
            UID: "data-uid"
        };
        var UID_HASH_LENGTH = 30;
        function getBody() {
            var body = document.body;
            if (!body) throw new Error("Body element not found");
            return body;
        }
        function isDocumentReady() {
            return Boolean(document.body) && "complete" === document.readyState;
        }
        function isDocumentInteractive() {
            return Boolean(document.body) && "interactive" === document.readyState;
        }
        function urlEncode(str) {
            return encodeURIComponent(str);
        }
        function waitForWindowReady() {
            return inlineMemoize(waitForWindowReady, (function() {
                return new promise_ZalgoPromise((function(resolve) {
                    isDocumentReady() && resolve();
                    window.addEventListener("load", (function() {
                        return resolve();
                    }));
                }));
            }));
        }
        var waitForDocumentReady = memoize((function() {
            return new promise_ZalgoPromise((function(resolve) {
                if (isDocumentReady() || isDocumentInteractive()) return resolve();
                var interval = setInterval((function() {
                    if (isDocumentReady() || isDocumentInteractive()) {
                        clearInterval(interval);
                        return resolve();
                    }
                }), 10);
            }));
        }));
        function waitForDocumentBody() {
            return promise_ZalgoPromise.try((function() {
                return document.body ? document.body : waitForDocumentReady().then((function() {
                    if (document.body) return document.body;
                    throw new Error("Document ready but document.body not present");
                }));
            }));
        }
        function parseQuery(queryString) {
            return inlineMemoize(parseQuery, (function() {
                var params = {};
                if (!queryString) return params;
                if (-1 === queryString.indexOf("=")) return params;
                for (var _i2 = 0, _queryString$split2 = queryString.split("&"); _i2 < _queryString$split2.length; _i2++) {
                    var pair = _queryString$split2[_i2];
                    (pair = pair.split("="))[0] && pair[1] && (params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]));
                }
                return params;
            }), [ queryString ]);
        }
        function getQueryParam(name) {
            return parseQuery(window.location.search.slice(1))[name];
        }
        function urlWillRedirectPage(url) {
            return -1 === url.indexOf("#") || 0 !== url.indexOf("#") && url.split("#")[0] !== window.location.href.split("#")[0];
        }
        function formatQuery(obj) {
            void 0 === obj && (obj = {});
            return Object.keys(obj).filter((function(key) {
                return "string" == typeof obj[key] || "boolean" == typeof obj[key];
            })).map((function(key) {
                var val = obj[key];
                if ("string" != typeof val && "boolean" != typeof val) throw new TypeError("Invalid type for query");
                return urlEncode(key) + "=" + urlEncode(val.toString());
            })).join("&");
        }
        function extendQuery(originalQuery, props) {
            void 0 === props && (props = {});
            return props && Object.keys(props).length ? formatQuery(_extends({}, parseQuery(originalQuery), props)) : originalQuery;
        }
        function extendUrl(url, options) {
            var query = options.query || {};
            var hash = options.hash || {};
            var originalUrl;
            var originalHash;
            var _url$split = url.split("#");
            originalHash = _url$split[1];
            var _originalUrl$split = (originalUrl = _url$split[0]).split("?");
            originalUrl = _originalUrl$split[0];
            var queryString = extendQuery(_originalUrl$split[1], query);
            var hashString = extendQuery(originalHash, hash);
            queryString && (originalUrl = originalUrl + "?" + queryString);
            hashString && (originalUrl = originalUrl + "#" + hashString);
            return originalUrl;
        }
        function redirect(url, win) {
            void 0 === win && (win = window);
            return new promise_ZalgoPromise((function(resolve) {
                win.location = url;
                urlWillRedirectPage(url) || resolve();
            }));
        }
        function hasMetaViewPort() {
            var meta = document.querySelector("meta[name=viewport]");
            return !(isDevice() && window.screen.width < 660 && !meta);
        }
        function isElementVisible(el) {
            return Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        }
        function getPerformance() {
            return inlineMemoize(getPerformance, (function() {
                var performance = window.performance;
                if (performance && performance.now && performance.timing && performance.timing.connectEnd && performance.timing.navigationStart && Math.abs(performance.now() - Date.now()) > 1e3 && performance.now() - (performance.timing.connectEnd - performance.timing.navigationStart) > 0) return performance;
            }));
        }
        function enablePerformance() {
            return Boolean(getPerformance());
        }
        function getPageRenderTime() {
            return waitForDocumentReady().then((function() {
                var performance = getPerformance();
                if (performance) {
                    var timing = performance.timing;
                    return timing.connectEnd && timing.domInteractive ? timing.domInteractive - timing.connectEnd : void 0;
                }
            }));
        }
        function htmlEncode(html) {
            void 0 === html && (html = "");
            return html.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\//g, "&#x2F;");
        }
        function dom_isBrowser() {
            return "undefined" != typeof window && void 0 !== window.location;
        }
        function querySelectorAll(selector, doc) {
            void 0 === doc && (doc = window.document);
            return [].slice.call(doc.querySelectorAll(selector));
        }
        function onClick(element, handler) {
            element.addEventListener("touchstart", src_util_noop, {
                passive: !0
            });
            element.addEventListener("click", handler);
            element.addEventListener("keypress", (function(event) {
                if (event.keyCode === KEY_CODES.ENTER || event.keyCode === KEY_CODES.SPACE) return handler(event);
            }));
        }
        function getScript(_ref) {
            var _ref$host = _ref.host, host = void 0 === _ref$host ? window.location.host : _ref$host, path = _ref.path, _ref$reverse = _ref.reverse, reverse = void 0 !== _ref$reverse && _ref$reverse;
            return inlineMemoize(getScript, (function() {
                var url = "" + host + path;
                var scripts = [].slice.call(document.getElementsByTagName("script"));
                reverse && scripts.reverse();
                for (var _i4 = 0; _i4 < scripts.length; _i4++) {
                    var script = scripts[_i4];
                    if (script.src && script.src.replace(/^https?:\/\//, "").split("?")[0] === url) return script;
                }
            }), [ path ]);
        }
        function isLocalStorageEnabled() {
            return inlineMemoize(isLocalStorageEnabled, (function() {
                try {
                    if ("undefined" == typeof window) return !1;
                    if (window.localStorage) {
                        var value = Math.random().toString();
                        window.localStorage.setItem("__test__localStorage__", value);
                        var result = window.localStorage.getItem("__test__localStorage__");
                        window.localStorage.removeItem("__test__localStorage__");
                        if (value === result) return !0;
                    }
                } catch (err) {}
                return !1;
            }));
        }
        function getBrowserLocales() {
            var nav = window.navigator;
            var locales = nav.languages ? [].concat(nav.languages) : [];
            nav.language && locales.push(nav.language);
            nav.userLanguage && locales.push(nav.userLanguage);
            return locales.map((function(locale) {
                if (locale && locale.match(/^[a-z]{2}[-_][A-Z]{2}$/)) {
                    var _locale$split = locale.split(/[-_]/);
                    return {
                        country: _locale$split[1],
                        lang: _locale$split[0]
                    };
                }
                return locale && locale.match(/^[a-z]{2}$/) ? {
                    lang: locale
                } : null;
            })).filter(Boolean);
        }
        function appendChild(container, child) {
            container.appendChild(child);
        }
        function getElementSafe(id, doc) {
            void 0 === doc && (doc = document);
            return isElement(id) ? id : "string" == typeof id ? doc.querySelector(id) : void 0;
        }
        function getElement(id, doc) {
            void 0 === doc && (doc = document);
            var element = getElementSafe(id, doc);
            if (element) return element;
            throw new Error("Can not find element: " + stringify(id));
        }
        function elementReady(id) {
            return new promise_ZalgoPromise((function(resolve, reject) {
                var name = stringify(id);
                var el = getElementSafe(id);
                if (el) return resolve(el);
                if (isDocumentReady()) return reject(new Error("Document is ready and element " + name + " does not exist"));
                var interval = setInterval((function() {
                    if (el = getElementSafe(id)) {
                        resolve(el);
                        clearInterval(interval);
                    } else if (isDocumentReady()) {
                        clearInterval(interval);
                        return reject(new Error("Document is ready and element " + name + " does not exist"));
                    }
                }), 10);
            }));
        }
        var dom_PopupOpenError = function(_ExtendableError) {
            _inheritsLoose(PopupOpenError, _ExtendableError);
            function PopupOpenError() {
                return _ExtendableError.apply(this, arguments) || this;
            }
            return PopupOpenError;
        }(util_ExtendableError);
        function popup(url, options) {
            var _options$closeOnUnloa = (options = options || {}).closeOnUnload, closeOnUnload = void 0 === _options$closeOnUnloa ? 1 : _options$closeOnUnloa, _options$name = options.name, name = void 0 === _options$name ? "" : _options$name, width = options.width, height = options.height;
            var top = 0;
            var left = 0;
            width && (window.outerWidth ? left = Math.round((window.outerWidth - width) / 2) + window.screenX : window.screen.width && (left = Math.round((window.screen.width - width) / 2)));
            height && (window.outerHeight ? top = Math.round((window.outerHeight - height) / 2) + window.screenY : window.screen.height && (top = Math.round((window.screen.height - height) / 2)));
            delete options.closeOnUnload;
            delete options.name;
            width && height && (options = _extends({
                top: top,
                left: left,
                width: width,
                height: height,
                status: 1,
                toolbar: 0,
                menubar: 0,
                resizable: 1,
                scrollbars: 1
            }, options));
            var params = Object.keys(options).map((function(key) {
                if (null != options[key]) return key + "=" + stringify(options[key]);
            })).filter(Boolean).join(",");
            var win;
            try {
                win = window.open(url, name, params);
            } catch (err) {
                throw new dom_PopupOpenError("Can not open popup window - " + (err.stack || err.message));
            }
            if (isWindowClosed(win)) {
                var err;
                throw new dom_PopupOpenError("Can not open popup window - blocked");
            }
            closeOnUnload && window.addEventListener("unload", (function() {
                return win.close();
            }));
            return win;
        }
        function writeToWindow(win, html) {
            try {
                win.document.open();
                win.document.write(html);
                win.document.close();
            } catch (err) {
                try {
                    win.location = "javascript: document.open(); document.write(" + JSON.stringify(html) + "); document.close();";
                } catch (err2) {}
            }
        }
        function writeElementToWindow(win, el) {
            var tag = el.tagName.toLowerCase();
            if ("html" !== tag) throw new Error("Expected element to be html, got " + tag);
            var documentElement = win.document.documentElement;
            for (var _i6 = 0, _arrayFrom2 = arrayFrom(documentElement.children); _i6 < _arrayFrom2.length; _i6++) documentElement.removeChild(_arrayFrom2[_i6]);
            for (var _i8 = 0, _arrayFrom4 = arrayFrom(el.children); _i8 < _arrayFrom4.length; _i8++) documentElement.appendChild(_arrayFrom4[_i8]);
        }
        function setStyle(el, styleText, doc) {
            void 0 === doc && (doc = window.document);
            el.styleSheet ? el.styleSheet.cssText = styleText : el.appendChild(doc.createTextNode(styleText));
        }
        var awaitFrameLoadPromises;
        function awaitFrameLoad(frame) {
            if ((awaitFrameLoadPromises = awaitFrameLoadPromises || new weakmap_CrossDomainSafeWeakMap).has(frame)) {
                var _promise = awaitFrameLoadPromises.get(frame);
                if (_promise) return _promise;
            }
            var promise = new promise_ZalgoPromise((function(resolve, reject) {
                frame.addEventListener("load", (function() {
                    !function(frame) {
                        !function() {
                            for (var i = 0; i < iframeWindows.length; i++) {
                                var closed = !1;
                                try {
                                    closed = iframeWindows[i].closed;
                                } catch (err) {}
                                if (closed) {
                                    iframeFrames.splice(i, 1);
                                    iframeWindows.splice(i, 1);
                                }
                            }
                        }();
                        if (frame && frame.contentWindow) try {
                            iframeWindows.push(frame.contentWindow);
                            iframeFrames.push(frame);
                        } catch (err) {}
                    }(frame);
                    resolve(frame);
                }));
                frame.addEventListener("error", (function(err) {
                    frame.contentWindow ? resolve(frame) : reject(err);
                }));
            }));
            awaitFrameLoadPromises.set(frame, promise);
            return promise;
        }
        function awaitFrameWindow(frame) {
            return awaitFrameLoad(frame).then((function(loadedFrame) {
                if (!loadedFrame.contentWindow) throw new Error("Could not find window in iframe");
                return loadedFrame.contentWindow;
            }));
        }
        function createElement(tag, options, container) {
            void 0 === tag && (tag = "div");
            void 0 === options && (options = {});
            tag = tag.toLowerCase();
            var element = document.createElement(tag);
            options.style && extend(element.style, options.style);
            options.class && (element.className = options.class.join(" "));
            options.id && element.setAttribute("id", options.id);
            if (options.attributes) for (var _i10 = 0, _Object$keys2 = Object.keys(options.attributes); _i10 < _Object$keys2.length; _i10++) {
                var key = _Object$keys2[_i10];
                element.setAttribute(key, options.attributes[key]);
            }
            options.styleSheet && setStyle(element, options.styleSheet);
            container && appendChild(container, element);
            if (options.html) if ("iframe" === tag) {
                if (!container || !element.contentWindow) throw new Error("Iframe html can not be written unless container provided and iframe in DOM");
                writeToWindow(element.contentWindow, options.html);
            } else element.innerHTML = options.html;
            return element;
        }
        function iframe(options, container) {
            void 0 === options && (options = {});
            var style = options.style || {};
            var frame = createElement("iframe", {
                attributes: _extends({
                    allowTransparency: "true"
                }, options.attributes || {}),
                style: _extends({
                    backgroundColor: "transparent",
                    border: "none"
                }, style),
                html: options.html,
                class: options.class
            });
            var isIE = window.navigator.userAgent.match(/MSIE|Edge/i);
            frame.hasAttribute("id") || frame.setAttribute("id", uniqueID());
            awaitFrameLoad(frame);
            container && getElement(container).appendChild(frame);
            (options.url || isIE) && frame.setAttribute("src", options.url || "about:blank");
            return frame;
        }
        function addEventListener(obj, event, handler) {
            obj.addEventListener(event, handler);
            return {
                cancel: function() {
                    obj.removeEventListener(event, handler);
                }
            };
        }
        function bindEvents(element, eventNames, handler) {
            handler = once(handler);
            for (var _i12 = 0; _i12 < eventNames.length; _i12++) element.addEventListener(eventNames[_i12], handler);
            return {
                cancel: once((function() {
                    for (var _i14 = 0; _i14 < eventNames.length; _i14++) element.removeEventListener(eventNames[_i14], handler);
                }))
            };
        }
        var VENDOR_PREFIXES = [ "webkit", "moz", "ms", "o" ];
        function setVendorCSS(element, name, value) {
            element.style[name] = value;
            var capitalizedName = capitalizeFirstLetter(name);
            for (var _i16 = 0; _i16 < VENDOR_PREFIXES.length; _i16++) element.style["" + VENDOR_PREFIXES[_i16] + capitalizedName] = value;
        }
        var ANIMATION_START_EVENTS = [ "animationstart", "webkitAnimationStart", "oAnimationStart", "MSAnimationStart" ];
        var ANIMATION_END_EVENTS = [ "animationend", "webkitAnimationEnd", "oAnimationEnd", "MSAnimationEnd" ];
        function animate(element, name, clean, timeout) {
            void 0 === timeout && (timeout = 1e3);
            return new promise_ZalgoPromise((function(resolve, reject) {
                var el = getElement(element);
                if (!el) return resolve();
                var hasStarted = !1;
                var startTimeout;
                var endTimeout;
                var startEvent;
                var endEvent;
                function cleanUp() {
                    clearTimeout(startTimeout);
                    clearTimeout(endTimeout);
                    startEvent.cancel();
                    endEvent.cancel();
                }
                startEvent = bindEvents(el, ANIMATION_START_EVENTS, (function(event) {
                    if (event.target === el && event.animationName === name) {
                        clearTimeout(startTimeout);
                        event.stopPropagation();
                        startEvent.cancel();
                        hasStarted = !0;
                        endTimeout = setTimeout((function() {
                            cleanUp();
                            resolve();
                        }), timeout);
                    }
                }));
                endEvent = bindEvents(el, ANIMATION_END_EVENTS, (function(event) {
                    if (event.target === el && event.animationName === name) {
                        cleanUp();
                        return "string" == typeof event.animationName && event.animationName !== name ? reject("Expected animation name to be " + name + ", found " + event.animationName) : resolve();
                    }
                }));
                setVendorCSS(el, "animationName", name);
                startTimeout = setTimeout((function() {
                    if (!hasStarted) {
                        cleanUp();
                        return resolve();
                    }
                }), 200);
                clean && clean(cleanUp);
            }));
        }
        function makeElementVisible(element) {
            element.style.setProperty("visibility", "");
        }
        function makeElementInvisible(element) {
            element.style.setProperty("visibility", "hidden", "important");
        }
        function showElement(element) {
            element.style.setProperty("display", "");
        }
        function hideElement(element) {
            element.style.setProperty("display", "none", "important");
        }
        function destroyElement(element) {
            element && element.parentNode && element.parentNode.removeChild(element);
        }
        function showAndAnimate(element, name, clean) {
            var animation = animate(element, name, clean);
            showElement(element);
            return animation;
        }
        function animateAndHide(element, name, clean) {
            return animate(element, name, clean).then((function() {
                hideElement(element);
            }));
        }
        function addClass(element, name) {
            element.classList.add(name);
        }
        function removeClass(element, name) {
            element.classList.remove(name);
        }
        function isElementClosed(el) {
            return !(el && el.parentNode && el.ownerDocument && el.ownerDocument.documentElement && el.ownerDocument.documentElement.contains(el));
        }
        function watchElementForClose(element, handler) {
            handler = once(handler);
            var cancelled = !1;
            var mutationObservers = [];
            var interval;
            var sacrificialFrame;
            var sacrificialFrameWin;
            var cancel = function() {
                cancelled = !0;
                for (var _i18 = 0; _i18 < mutationObservers.length; _i18++) mutationObservers[_i18].disconnect();
                interval && interval.cancel();
                sacrificialFrameWin && sacrificialFrameWin.removeEventListener("unload", elementClosed);
                sacrificialFrame && destroyElement(sacrificialFrame);
            };
            var elementClosed = function() {
                if (!cancelled) {
                    handler();
                    cancel();
                }
            };
            if (isElementClosed(element)) {
                elementClosed();
                return {
                    cancel: cancel
                };
            }
            if (window.MutationObserver) {
                var mutationElement = element.parentElement;
                for (;mutationElement; ) {
                    var mutationObserver = new window.MutationObserver((function() {
                        isElementClosed(element) && elementClosed();
                    }));
                    mutationObserver.observe(mutationElement, {
                        childList: !0
                    });
                    mutationObservers.push(mutationObserver);
                    mutationElement = mutationElement.parentElement;
                }
            }
            (sacrificialFrame = document.createElement("iframe")).setAttribute("name", "__detect_close_" + uniqueID() + "__");
            sacrificialFrame.style.display = "none";
            awaitFrameWindow(sacrificialFrame).then((function(frameWin) {
                (sacrificialFrameWin = function(win) {
                    if (!isSameDomain(win)) throw new Error("Expected window to be same domain");
                    return win;
                }(frameWin)).addEventListener("unload", elementClosed);
            }));
            element.appendChild(sacrificialFrame);
            interval = safeInterval((function() {
                isElementClosed(element) && elementClosed();
            }), 1e3);
            return {
                cancel: cancel
            };
        }
        function fixScripts(el, doc) {
            void 0 === doc && (doc = window.document);
            for (var _i20 = 0, _querySelectorAll2 = querySelectorAll("script", el); _i20 < _querySelectorAll2.length; _i20++) {
                var script = _querySelectorAll2[_i20];
                var parentNode = script.parentNode;
                if (parentNode) {
                    var newScript = doc.createElement("script");
                    newScript.text = script.textContent;
                    parentNode.replaceChild(newScript, script);
                }
            }
        }
        function onResize(el, handler, _temp) {
            var _ref2 = void 0 === _temp ? {} : _temp, _ref2$width = _ref2.width, width = void 0 === _ref2$width || _ref2$width, _ref2$height = _ref2.height, height = void 0 === _ref2$height || _ref2$height, _ref2$interval = _ref2.interval, interval = void 0 === _ref2$interval ? 100 : _ref2$interval, _ref2$win = _ref2.win, win = void 0 === _ref2$win ? window : _ref2$win;
            var currentWidth = el.offsetWidth;
            var currentHeight = el.offsetHeight;
            var canceled = !1;
            handler({
                width: currentWidth,
                height: currentHeight
            });
            var check = function() {
                if (!canceled && isElementVisible(el)) {
                    var newWidth = el.offsetWidth;
                    var newHeight = el.offsetHeight;
                    (width && newWidth !== currentWidth || height && newHeight !== currentHeight) && handler({
                        width: newWidth,
                        height: newHeight
                    });
                    currentWidth = newWidth;
                    currentHeight = newHeight;
                }
            };
            var observer;
            var timeout;
            win.addEventListener("resize", check);
            if (void 0 !== win.ResizeObserver) {
                (observer = new win.ResizeObserver(check)).observe(el);
                timeout = safeInterval(check, 10 * interval);
            } else if (void 0 !== win.MutationObserver) {
                (observer = new win.MutationObserver(check)).observe(el, {
                    attributes: !0,
                    childList: !0,
                    subtree: !0,
                    characterData: !1
                });
                timeout = safeInterval(check, 10 * interval);
            } else timeout = safeInterval(check, interval);
            return {
                cancel: function() {
                    canceled = !0;
                    observer.disconnect();
                    window.removeEventListener("resize", check);
                    timeout.cancel();
                }
            };
        }
        function getResourceLoadTime(url) {
            var performance = getPerformance();
            if (performance && "function" == typeof performance.getEntries) {
                var entries = performance.getEntries();
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry && entry.name && 0 === entry.name.indexOf(url) && "number" == typeof entry.duration) return Math.floor(entry.duration);
                }
            }
        }
        function isShadowElement(element) {
            for (;element.parentNode; ) element = element.parentNode;
            return "[object ShadowRoot]" === element.toString();
        }
        function getShadowRoot(element) {
            for (;element.parentNode; ) element = element.parentNode;
            if (isShadowElement(element)) return element;
        }
        function getShadowHost(element) {
            var shadowRoot = getShadowRoot(element);
            if (shadowRoot && shadowRoot.host) return shadowRoot.host;
        }
        function insertShadowSlot(element) {
            var shadowHost = getShadowHost(element);
            if (!shadowHost) throw new Error("Element is not in shadow dom");
            var slotName = "shadow-slot-" + uniqueID();
            var slot = document.createElement("slot");
            slot.setAttribute("name", slotName);
            element.appendChild(slot);
            var slotProvider = document.createElement("div");
            slotProvider.setAttribute("slot", slotName);
            shadowHost.appendChild(slotProvider);
            return isShadowElement(shadowHost) ? insertShadowSlot(slotProvider) : slotProvider;
        }
        function preventClickFocus(el) {
            var onFocus = function onFocus(event) {
                el.removeEventListener("focus", onFocus);
                event.preventDefault();
                el.blur();
                return !1;
            };
            el.addEventListener("mousedown", (function() {
                el.addEventListener("focus", onFocus);
                setTimeout((function() {
                    el.removeEventListener("focus", onFocus);
                }), 1);
            }));
        }
        function getStackTrace() {
            try {
                throw new Error("_");
            } catch (err) {
                return err.stack || "";
            }
        }
        var currentScript = "undefined" != typeof document ? document.currentScript : null;
        var getCurrentScript = memoize((function() {
            if (currentScript) return currentScript;
            if (currentScript = function() {
                try {
                    var stack = getStackTrace();
                    var stackDetails = /.*at [^(]*\((.*):(.+):(.+)\)$/gi.exec(stack);
                    var scriptLocation = stackDetails && stackDetails[1];
                    if (!scriptLocation) return;
                    for (var _i22 = 0, _Array$prototype$slic2 = [].slice.call(document.getElementsByTagName("script")).reverse(); _i22 < _Array$prototype$slic2.length; _i22++) {
                        var script = _Array$prototype$slic2[_i22];
                        if (script.src && script.src === scriptLocation) return script;
                    }
                } catch (err) {}
            }()) return currentScript;
            throw new Error("Can not determine current script");
        }));
        var currentUID = uniqueID();
        var getCurrentScriptUID = memoize((function() {
            var script;
            try {
                script = getCurrentScript();
            } catch (err) {
                return currentUID;
            }
            var uid = script.getAttribute(ATTRIBUTES.UID);
            if (uid && "string" == typeof uid) return uid;
            if ((uid = script.getAttribute(ATTRIBUTES.UID + "-auto")) && "string" == typeof uid) return uid;
            if (script.src) {
                var hashedString = strHashStr(JSON.stringify({
                    src: script.src,
                    dataset: script.dataset
                }));
                uid = "uid_" + hashedString.slice(hashedString.length - UID_HASH_LENGTH);
            } else uid = uniqueID();
            script.setAttribute(ATTRIBUTES.UID + "-auto", uid);
            return uid;
        }));
        function submitForm(_ref3) {
            var url = _ref3.url, target = _ref3.target, body = _ref3.body, _ref3$method = _ref3.method, method = void 0 === _ref3$method ? "post" : _ref3$method;
            var form = document.createElement("form");
            form.setAttribute("target", target);
            form.setAttribute("method", method);
            form.setAttribute("action", url);
            form.style.display = "none";
            if (body) for (var _i24 = 0, _Object$keys4 = Object.keys(body); _i24 < _Object$keys4.length; _i24++) {
                var _body$key;
                var key = _Object$keys4[_i24];
                var input = document.createElement("input");
                input.setAttribute("name", key);
                input.setAttribute("value", null == (_body$key = body[key]) ? void 0 : _body$key.toString());
                form.appendChild(input);
            }
            getBody().appendChild(form);
            form.submit();
            getBody().removeChild(form);
        }
        function getStorage(_ref) {
            var name = _ref.name, _ref$lifetime = _ref.lifetime, lifetime = void 0 === _ref$lifetime ? 12e5 : _ref$lifetime;
            return inlineMemoize(getStorage, (function() {
                var STORAGE_KEY = "__" + name + "_storage__";
                var newStateID = uniqueID();
                var accessedStorage;
                function getState(handler) {
                    var localStorageEnabled = isLocalStorageEnabled();
                    var storage;
                    accessedStorage && (storage = accessedStorage);
                    if (!storage && localStorageEnabled) {
                        var rawStorage = window.localStorage.getItem(STORAGE_KEY);
                        rawStorage && (storage = JSON.parse(rawStorage));
                    }
                    storage || (storage = getGlobal()[STORAGE_KEY]);
                    storage || (storage = {
                        id: newStateID
                    });
                    storage.id || (storage.id = newStateID);
                    accessedStorage = storage;
                    var result = handler(storage);
                    localStorageEnabled ? window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage)) : getGlobal()[STORAGE_KEY] = storage;
                    accessedStorage = null;
                    return result;
                }
                function getID() {
                    return getState((function(storage) {
                        return storage.id;
                    }));
                }
                function getSession(handler) {
                    return getState((function(storage) {
                        var session = storage.__session__;
                        var now = Date.now();
                        session && now - session.created > lifetime && (session = null);
                        session || (session = {
                            guid: uniqueID(),
                            created: now
                        });
                        storage.__session__ = session;
                        return handler(session);
                    }));
                }
                return {
                    getState: getState,
                    getID: getID,
                    isStateFresh: function() {
                        return getID() === newStateID;
                    },
                    getSessionState: function(handler) {
                        return getSession((function(session) {
                            session.state = session.state || {};
                            return handler(session.state);
                        }));
                    },
                    getSessionID: function() {
                        return getSession((function(session) {
                            return session.guid;
                        }));
                    }
                };
            }), [ {
                name: name,
                lifetime: lifetime
            } ]);
        }
        function getBelterExperimentStorage() {
            return getStorage({
                name: "belter_experiment"
            });
        }
        function isEventUnique(name) {
            return getBelterExperimentStorage().getSessionState((function(state) {
                state.loggedBeacons = state.loggedBeacons || [];
                if (-1 === state.loggedBeacons.indexOf(name)) {
                    state.loggedBeacons.push(name);
                    return !0;
                }
                return !1;
            }));
        }
        function getRandomInteger(range) {
            return Math.floor(Math.random() * range);
        }
        function experiment(_ref) {
            var name = _ref.name, _ref$sample = _ref.sample, sample = void 0 === _ref$sample ? 50 : _ref$sample, _ref$logTreatment = _ref.logTreatment, logTreatment = void 0 === _ref$logTreatment ? src_util_noop : _ref$logTreatment, _ref$logCheckpoint = _ref.logCheckpoint, logCheckpoint = void 0 === _ref$logCheckpoint ? src_util_noop : _ref$logCheckpoint, _ref$sticky = _ref.sticky;
            var throttle = void 0 === _ref$sticky || _ref$sticky ? function(name) {
                return getBelterExperimentStorage().getState((function(state) {
                    state.throttlePercentiles = state.throttlePercentiles || {};
                    state.throttlePercentiles[name] = state.throttlePercentiles[name] || getRandomInteger(100);
                    return state.throttlePercentiles[name];
                }));
            }(name) : getRandomInteger(100);
            var group;
            var treatment = name + "_" + (group = throttle < sample ? "test" : sample >= 50 || sample <= throttle && throttle < 2 * sample ? "control" : "throttle");
            var started = !1;
            var forced = !1;
            try {
                window.localStorage && window.localStorage.getItem(name) && (forced = !0);
            } catch (err) {}
            var exp = {
                isEnabled: function() {
                    return "test" === group || forced;
                },
                isDisabled: function() {
                    return "test" !== group && !forced;
                },
                getTreatment: function() {
                    return treatment;
                },
                log: function(checkpoint, payload) {
                    void 0 === payload && (payload = {});
                    if (!started) return exp;
                    isEventUnique(treatment + "_" + JSON.stringify(payload)) && logTreatment({
                        name: name,
                        treatment: treatment,
                        payload: payload,
                        throttle: throttle
                    });
                    isEventUnique(treatment + "_" + checkpoint + "_" + JSON.stringify(payload)) && logCheckpoint({
                        name: name,
                        treatment: treatment,
                        checkpoint: checkpoint,
                        payload: payload,
                        throttle: throttle
                    });
                    return exp;
                },
                logStart: function(payload) {
                    void 0 === payload && (payload = {});
                    started = !0;
                    return exp.log("start", payload);
                },
                logComplete: function(payload) {
                    void 0 === payload && (payload = {});
                    return exp.log("complete", payload);
                }
            };
            return exp;
        }
        function getGlobalNameSpace(_ref) {
            var name = _ref.name, _ref$version = _ref.version, version = void 0 === _ref$version ? "latest" : _ref$version;
            var global = getGlobal();
            var globalKey = "__" + name + "__" + version + "_global__";
            var namespace = global[globalKey] = global[globalKey] || {};
            return {
                get: function(key, defValue) {
                    defValue = defValue || {};
                    return namespace[key] = namespace[key] || defValue;
                }
            };
        }
        var headerBuilders = [];
        function request(_ref) {
            var url = _ref.url, _ref$method = _ref.method, method = void 0 === _ref$method ? "get" : _ref$method, _ref$headers = _ref.headers, headers = void 0 === _ref$headers ? {} : _ref$headers, json = _ref.json, data = _ref.data, body = _ref.body, _ref$win = _ref.win, win = void 0 === _ref$win ? window : _ref$win, _ref$timeout = _ref.timeout, timeout = void 0 === _ref$timeout ? 0 : _ref$timeout;
            return new promise_ZalgoPromise((function(resolve, reject) {
                if (json && data || json && body || data && json) throw new Error("Only options.json or options.data or options.body should be passed");
                var normalizedHeaders = {};
                for (var _i4 = 0, _Object$keys2 = Object.keys(headers); _i4 < _Object$keys2.length; _i4++) {
                    var _key2 = _Object$keys2[_i4];
                    normalizedHeaders[_key2.toLowerCase()] = headers[_key2];
                }
                json ? normalizedHeaders["content-type"] = normalizedHeaders["content-type"] || "application/json" : (data || body) && (normalizedHeaders["content-type"] = normalizedHeaders["content-type"] || "application/x-www-form-urlencoded; charset=utf-8");
                normalizedHeaders.accept = normalizedHeaders.accept || "application/json";
                for (var _i6 = 0; _i6 < headerBuilders.length; _i6++) {
                    var builtHeaders = (0, headerBuilders[_i6])();
                    for (var _i8 = 0, _Object$keys4 = Object.keys(builtHeaders); _i8 < _Object$keys4.length; _i8++) {
                        var _key3 = _Object$keys4[_i8];
                        normalizedHeaders[_key3.toLowerCase()] = builtHeaders[_key3];
                    }
                }
                var xhr = new win.XMLHttpRequest;
                xhr.addEventListener("load", (function() {
                    var responseHeaders = function(rawHeaders) {
                        void 0 === rawHeaders && (rawHeaders = "");
                        var result = {};
                        for (var _i2 = 0, _rawHeaders$trim$spli2 = rawHeaders.trim().split("\n"); _i2 < _rawHeaders$trim$spli2.length; _i2++) {
                            var _line$split = _rawHeaders$trim$spli2[_i2].split(":"), _key = _line$split[0], values = _line$split.slice(1);
                            result[_key.toLowerCase()] = values.join(":").trim();
                        }
                        return result;
                    }(this.getAllResponseHeaders());
                    if (!this.status) return reject(new Error("Request to " + method.toLowerCase() + " " + url + " failed: no response status code."));
                    var contentType = responseHeaders["content-type"];
                    var isJSON = contentType && (0 === contentType.indexOf("application/json") || 0 === contentType.indexOf("text/json"));
                    var responseBody = this.responseText;
                    try {
                        responseBody = JSON.parse(responseBody);
                    } catch (err) {
                        if (isJSON) return reject(new Error("Invalid json: " + this.responseText + "."));
                    }
                    return resolve({
                        status: this.status,
                        headers: responseHeaders,
                        body: responseBody
                    });
                }), !1);
                xhr.addEventListener("error", (function(evt) {
                    reject(new Error("Request to " + method.toLowerCase() + " " + url + " failed: " + evt.toString() + "."));
                }), !1);
                xhr.open(method, url, !0);
                for (var _key4 in normalizedHeaders) normalizedHeaders.hasOwnProperty(_key4) && xhr.setRequestHeader(_key4, normalizedHeaders[_key4]);
                json ? body = JSON.stringify(json) : data && (body = Object.keys(data).map((function(key) {
                    return encodeURIComponent(key) + "=" + (data ? encodeURIComponent(data[key]) : "");
                })).join("&"));
                xhr.timeout = timeout;
                xhr.ontimeout = function() {
                    reject(new Error("Request to " + method.toLowerCase() + " " + url + " has timed out"));
                };
                xhr.send(body);
            }));
        }
        function addHeaderBuilder(method) {
            headerBuilders.push(method);
        }
        var types_TYPES = !0;
        function memoized(target, name, descriptor) {
            descriptor.value = memoize(descriptor.value, {
                name: name,
                thisNamespace: !0
            });
        }
        function decorators_promise(target, name, descriptor) {
            descriptor.value = promisify(descriptor.value, {
                name: name
            });
        }
        function isPerc(str) {
            return "string" == typeof str && /^[0-9]+%$/.test(str);
        }
        function isPx(str) {
            return "string" == typeof str && /^[0-9]+px$/.test(str);
        }
        function toNum(val) {
            if ("number" == typeof val) return val;
            var match = val.match(/^([0-9]+)(px|%)$/);
            if (!match) throw new Error("Could not match css value from " + val);
            return parseInt(match[1], 10);
        }
        function toPx(val) {
            return toNum(val) + "px";
        }
        function toCSS(val) {
            return "number" == typeof val ? toPx(val) : isPerc(val) ? val : toPx(val);
        }
        function percOf(num, perc) {
            return parseInt(num * toNum(perc) / 100, 10);
        }
        function normalizeDimension(dim, max) {
            if ("number" == typeof dim) return dim;
            if (isPerc(dim)) return percOf(max, dim);
            if (isPx(dim)) return toNum(dim);
            throw new Error("Can not normalize dimension: " + dim);
        }
        function wrapPromise(method, _temp) {
            var _ref$timeout = (void 0 === _temp ? {} : _temp).timeout, timeout = void 0 === _ref$timeout ? 5e3 : _ref$timeout;
            var expected = [];
            var promises = [];
            return new promise_ZalgoPromise((function(resolve, reject) {
                var timer = setTimeout((function() {
                    expected.length && reject(new Error("Expected " + expected[0].name + " to be called in " + timeout + "ms"));
                    promises.length && reject(new Error("Expected " + promises[0].name + " promise to complete in " + timeout + "ms"));
                }), timeout);
                var expect = function(name, handler) {
                    void 0 === handler && (handler = src_util_noop);
                    var exp = {
                        name: name,
                        handler: handler
                    };
                    expected.push(exp);
                    return function() {
                        var _this = this;
                        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                        removeFromArray(expected, exp);
                        var _tryCatch = tryCatch((function() {
                            var _handler;
                            return (_handler = handler).call.apply(_handler, [ _this ].concat(args));
                        })), result = _tryCatch.result, error = _tryCatch.error;
                        if (error) {
                            promises.push({
                                name: name,
                                promise: promise_ZalgoPromise.asyncReject(error)
                            });
                            throw error;
                        }
                        promises.push({
                            name: name,
                            promise: promise_ZalgoPromise.resolve(result)
                        });
                        return result;
                    };
                };
                var avoid = function(name, fn) {
                    void 0 === fn && (fn = src_util_noop);
                    return function() {
                        var _fn;
                        promises.push({
                            name: name,
                            promise: promise_ZalgoPromise.asyncReject(new Error("Expected " + name + " to not be called"))
                        });
                        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
                        return (_fn = fn).call.apply(_fn, [ this ].concat(args));
                    };
                };
                var expectError = function(name, handler) {
                    void 0 === handler && (handler = src_util_noop);
                    var exp = {
                        name: name,
                        handler: handler
                    };
                    expected.push(exp);
                    return function() {
                        var _this2 = this;
                        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) args[_key3] = arguments[_key3];
                        removeFromArray(expected, exp);
                        var _tryCatch2 = tryCatch((function() {
                            var _handler2;
                            return (_handler2 = handler).call.apply(_handler2, [ _this2 ].concat(args));
                        })), result = _tryCatch2.result, error = _tryCatch2.error;
                        if (error) throw error;
                        promises.push({
                            name: name,
                            promise: promise_ZalgoPromise.resolve(result).then((function() {
                                throw new Error("Expected " + name + " to throw an error");
                            }), src_util_noop)
                        });
                        return result;
                    };
                };
                promises.push({
                    name: "wrapPromise handler",
                    promise: promise_ZalgoPromise.try((function() {
                        return method({
                            expect: expect,
                            avoid: avoid,
                            expectError: expectError,
                            error: avoid,
                            wait: function() {
                                return promise_ZalgoPromise.resolve();
                            }
                        });
                    }))
                });
                (function wait() {
                    return promise_ZalgoPromise.try((function() {
                        if (promises.length) {
                            var prom = promises[0];
                            return prom.promise.finally((function() {
                                removeFromArray(promises, prom);
                            })).then(wait);
                        }
                    })).then((function() {
                        if (expected.length) return promise_ZalgoPromise.delay(10).then(wait);
                    }));
                })().finally((function() {
                    clearTimeout(timer);
                })).then(resolve, reject);
            }));
        }
    } ]);
}, function(module, exports, __webpack_require__) {
    "use strict";
    var device = __webpack_require__(9);
    var supportsInputFormatting = __webpack_require__(34);
    var constants = __webpack_require__(35);
    var isValidElement = __webpack_require__(36);
    var IosStrategy = __webpack_require__(37);
    var AndroidChromeStrategy = __webpack_require__(11);
    var KitKatChromiumBasedWebViewStrategy = __webpack_require__(41);
    var IE9Strategy = __webpack_require__(42);
    var BaseStrategy = __webpack_require__(3);
    var NoopStrategy = __webpack_require__(43);
    function RestrictedInput(options) {
        if (!isValidElement((options = options || {}).element)) throw new Error(constants.errors.INVALID_ELEMENT);
        if (!options.pattern) throw new Error(constants.errors.PATTERN_MISSING);
        this.strategy = RestrictedInput.supportsFormatting() ? device.isIos() ? new IosStrategy(options) : device.isKitKatWebview() ? new KitKatChromiumBasedWebViewStrategy(options) : device.isAndroidChrome() ? new AndroidChromeStrategy(options) : device.isIE9() ? new IE9Strategy(options) : new BaseStrategy(options) : new NoopStrategy(options);
    }
    RestrictedInput.prototype.getUnformattedValue = function() {
        return this.strategy.getUnformattedValue();
    };
    RestrictedInput.prototype.setPattern = function(pattern) {
        this.strategy.setPattern(pattern);
    };
    RestrictedInput.supportsFormatting = function() {
        return supportsInputFormatting();
    };
    module.exports = RestrictedInput;
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(ua) {
        ua = ua || window.navigator.userAgent;
        return /Android/.test(ua);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var isEdge = __webpack_require__(30);
    var isSamsung = __webpack_require__(31);
    module.exports = function(ua) {
        return !(-1 === (ua = ua || navigator.userAgent).indexOf("Chrome") && -1 === ua.indexOf("CriOS") || isEdge(ua) || isSamsung(ua));
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(ua) {
        return -1 !== (ua = ua || navigator.userAgent).indexOf("Edge/");
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(ua) {
        ua = ua || window.navigator.userAgent;
        return /SamsungBrowser/i.test(ua);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(ua) {
        ua = ua || window.navigator.userAgent;
        return /iPhone|iPod|iPad/i.test(ua);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(ua) {
        return -1 !== (ua = ua || navigator.userAgent).indexOf("MSIE 9");
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var device = __webpack_require__(9);
    module.exports = function() {
        return !device.isSamsungBrowser();
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        errors: {
            PATTERN_MISSING: "A valid pattern must be provided",
            INVALID_ELEMENT: "A valid HTML input or textarea element must be provided"
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(element) {
        return Boolean(element) && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var BaseStrategy = __webpack_require__(3);
    var keyCannotMutateValue = __webpack_require__(4);
    var getSelection = __webpack_require__(1).get;
    var setSelection = __webpack_require__(1).set;
    function IosStrategy(options) {
        BaseStrategy.call(this, options);
    }
    (IosStrategy.prototype = Object.create(BaseStrategy.prototype)).constructor = IosStrategy;
    IosStrategy.prototype.getUnformattedValue = function() {
        return BaseStrategy.prototype.getUnformattedValue.call(this, !0);
    };
    IosStrategy.prototype._attachListeners = function() {
        this.inputElement.addEventListener("keydown", this._keydownListener.bind(this));
        this.inputElement.addEventListener("input", function(event) {
            var isCustomEvent = event instanceof CustomEvent;
            isCustomEvent && (this._stateToFormat = {
                selection: {
                    start: 0,
                    end: 0
                },
                value: this.inputElement.value
            });
            this._formatListener();
            isCustomEvent || this._fixLeadingBlankSpaceOnIos();
        }.bind(this));
        this.inputElement.addEventListener("focus", this._formatListener.bind(this));
        this.inputElement.addEventListener("paste", this._pasteEventHandler.bind(this));
    };
    IosStrategy.prototype._fixLeadingBlankSpaceOnIos = function() {
        var input = this.inputElement;
        "" === input.value && setTimeout((function() {
            input.value = "";
        }), 0);
    };
    IosStrategy.prototype._formatListener = function() {
        var input = this.inputElement;
        var stateToFormat = this._getStateToFormat();
        var formattedState = this.formatter.format(stateToFormat);
        input.value = formattedState.value;
        setSelection(input, formattedState.selection.start, formattedState.selection.end);
    };
    IosStrategy.prototype._keydownListener = function(event) {
        keyCannotMutateValue(event) || this._isDeletion(event) && (this._stateToFormat = this.formatter.simulateDeletion({
            event: event,
            selection: getSelection(this.inputElement),
            value: this.inputElement.value
        }));
    };
    module.exports = IosStrategy;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var DELETE_REGEX = /^Del(ete)?$/;
    module.exports = function(event) {
        return DELETE_REGEX.test(event.key) || 46 === event.keyCode;
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var parsePattern = __webpack_require__(40);
    var isBackspace = __webpack_require__(10);
    function Formatter(pattern) {
        this.setPattern(pattern);
    }
    Formatter.prototype.setPattern = function(pattern) {
        if ("string" != typeof pattern) throw new Error("A valid pattern string is required");
        this.pattern = parsePattern(pattern);
    };
    Formatter.prototype.format = function(options) {
        var i, patternChar, inputChar;
        var originalString = options.value;
        var originalStringIndex = 0;
        var formattedString = "";
        var selection = {
            start: options.selection.start,
            end: options.selection.end
        };
        for (i = 0; i < this.pattern.length; i++) {
            patternChar = this.pattern[i];
            inputChar = originalString[originalStringIndex];
            if (originalStringIndex > originalString.length) break;
            if (patternChar.isPermaChar) {
                if (null != inputChar || formattedString.length === patternChar.index) {
                    formattedString += patternChar.value;
                    patternChar.index <= selection.start && selection.start++;
                    patternChar.index <= selection.end && selection.end++;
                }
            } else for (;originalStringIndex < originalString.length; originalStringIndex++) {
                if (patternChar.value.test(inputChar = originalString[originalStringIndex])) {
                    formattedString += inputChar;
                    originalStringIndex++;
                    break;
                }
                patternChar.index <= selection.start && selection.start--;
                patternChar.index <= selection.end && selection.end--;
            }
        }
        return {
            value: formattedString,
            selection: selection
        };
    };
    Formatter.prototype.unformat = function(options) {
        var i, patternChar;
        var start = options.selection.start;
        var end = options.selection.end;
        var unformattedString = "";
        for (i = 0; i < this.pattern.length; i++) if ((patternChar = this.pattern[i]).isPermaChar || null == options.value[i] || !patternChar.value.test(options.value[i])) {
            if (patternChar.value === options.value[patternChar.index]) {
                patternChar.index < options.selection.start && start--;
                patternChar.index < options.selection.end && end--;
            }
        } else unformattedString += options.value[i];
        return {
            selection: {
                start: start,
                end: end
            },
            value: unformattedString
        };
    };
    Formatter.prototype.simulateDeletion = function(options) {
        var deletionStart, deletionEnd;
        var state = this.unformat.apply(this, arguments);
        var value = state.value;
        var selection = state.selection;
        var delta = Math.abs(state.selection.end - state.selection.start);
        if (delta) {
            deletionStart = selection.start;
            deletionEnd = selection.end;
        } else if (isBackspace(options.event)) {
            deletionStart = Math.max(0, selection.start - 1);
            deletionEnd = selection.start;
        } else {
            deletionStart = selection.start;
            deletionEnd = Math.min(value.length, selection.start + 1);
        }
        return {
            selection: {
                start: deletionStart,
                end: deletionStart
            },
            value: value.substr(0, deletionStart) + value.substr(deletionEnd)
        };
    };
    module.exports = Formatter;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var ALPHA_REGEX = /[A-Za-z]/;
    var DIGIT_REGEX = /\d/;
    var WILD_REGEX = /./;
    var PLACEHOLDER_REGEX = /^[A-Za-z0-9\*]$/;
    var PATTERN_REGEX = new RegExp("({{[^}]+}})|(\\s|\\S)", "g");
    var PLACEHOLDER_PATTERN_REGEX = new RegExp("^({{[^}]+}})$");
    var replacerRegex = new RegExp("{|}", "g");
    function createRegexForChar(char) {
        return function(char) {
            return DIGIT_REGEX.test(char);
        }(char) ? DIGIT_REGEX : function(char) {
            return ALPHA_REGEX.test(char);
        }(char) ? ALPHA_REGEX : WILD_REGEX;
    }
    module.exports = function(patternString) {
        var index, i, j, patternPart, placeholderChars, placeholderChar;
        var patternArray = [];
        var patternParts = patternString.match(PATTERN_REGEX);
        for (index = 0, i = 0; i < patternParts.length; i++) if (PLACEHOLDER_PATTERN_REGEX.test(patternPart = patternParts[i])) {
            placeholderChars = patternPart.replace(replacerRegex, "").split("");
            for (j = 0; j < placeholderChars.length; j++) {
                if (!(char = placeholderChar = placeholderChars[j], PLACEHOLDER_REGEX.test(char))) throw new Error("Only alphanumeric or wildcard pattern matchers are allowed");
                patternArray.push({
                    value: createRegexForChar(placeholderChar),
                    isPermaChar: !1,
                    index: index++
                });
            }
        } else patternArray.push({
            value: patternPart,
            isPermaChar: !0,
            index: index++
        });
        var char;
        return patternArray;
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var AndroidChromeStrategy = __webpack_require__(11);
    function KitKatChromiumBasedWebViewStrategy(options) {
        AndroidChromeStrategy.call(this, options);
    }
    (KitKatChromiumBasedWebViewStrategy.prototype = Object.create(AndroidChromeStrategy.prototype)).constructor = KitKatChromiumBasedWebViewStrategy;
    KitKatChromiumBasedWebViewStrategy.prototype._reformatInput = function() {
        setTimeout(function() {
            AndroidChromeStrategy.prototype._reformatInput.call(this);
        }.bind(this), 0);
    };
    KitKatChromiumBasedWebViewStrategy.prototype._unformatInput = function() {
        setTimeout(function() {
            AndroidChromeStrategy.prototype._unformatInput.call(this);
        }.bind(this), 0);
    };
    module.exports = KitKatChromiumBasedWebViewStrategy;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var BaseStrategy = __webpack_require__(3);
    var keyCannotMutateValue = __webpack_require__(4);
    var getSelection = __webpack_require__(1).get;
    var setSelection = __webpack_require__(1).set;
    function IE9Strategy(options) {
        BaseStrategy.call(this, options);
    }
    (IE9Strategy.prototype = Object.create(BaseStrategy.prototype)).constructor = IE9Strategy;
    IE9Strategy.prototype.getUnformattedValue = function() {
        return BaseStrategy.prototype.getUnformattedValue.call(this, !0);
    };
    IE9Strategy.prototype._attachListeners = function() {
        this.inputElement.addEventListener("keydown", this._keydownListener.bind(this));
        this.inputElement.addEventListener("focus", this._format.bind(this));
        this.inputElement.addEventListener("paste", this._pasteEventHandler.bind(this));
    };
    IE9Strategy.prototype._format = function() {
        var input = this.inputElement;
        var stateToFormat = this._getStateToFormat();
        var formattedState = this.formatter.format(stateToFormat);
        input.value = formattedState.value;
        setSelection(input, formattedState.selection.start, formattedState.selection.end);
    };
    IE9Strategy.prototype._keydownListener = function(event) {
        var newValue, oldValue, selection;
        if (!keyCannotMutateValue(event)) {
            event.preventDefault();
            if (this._isDeletion(event)) this._stateToFormat = this.formatter.simulateDeletion({
                event: event,
                selection: getSelection(this.inputElement),
                value: this.inputElement.value
            }); else {
                oldValue = this.inputElement.value;
                selection = getSelection(this.inputElement);
                newValue = oldValue.slice(0, selection.start) + event.key + oldValue.slice(selection.start);
                selection = padSelection(selection, 1);
                this._stateToFormat = {
                    selection: selection,
                    value: newValue
                };
                selection.start === newValue.length && (this._stateToFormat = this.formatter.unformat(this._stateToFormat));
            }
            this._format();
        }
    };
    IE9Strategy.prototype._reformatAfterPaste = function() {
        var input = this.inputElement;
        var selection = getSelection(this.inputElement);
        var value = this.formatter.format({
            selection: selection,
            value: input.value
        }).value;
        selection = padSelection(selection, 1);
        input.value = value;
        setTimeout((function() {
            setSelection(input, selection.start, selection.end);
        }), 0);
    };
    function padSelection(selection, pad) {
        return {
            start: selection.start + pad,
            end: selection.end + pad
        };
    }
    module.exports = IE9Strategy;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function NoopStrategy(options) {
        this.inputElement = options.element;
    }
    NoopStrategy.prototype.getUnformattedValue = function() {
        return this.inputElement.value;
    };
    NoopStrategy.prototype.setPattern = function() {};
    module.exports = NoopStrategy;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, "setupCard", (function() {
        return setupCard;
    }));
    __webpack_require__.d(__webpack_exports__, "CardField", (function() {
        return CardField;
    }));
    __webpack_require__.d(__webpack_exports__, "ValidationMessage", (function() {
        return ValidationMessage;
    }));
    __webpack_require__.d(__webpack_exports__, "CardNumberField", (function() {
        return CardNumberField;
    }));
    __webpack_require__.d(__webpack_exports__, "CardExpiryField", (function() {
        return CardExpiryField;
    }));
    __webpack_require__.d(__webpack_exports__, "CardCVVField", (function() {
        return CardCVVField;
    }));
    __webpack_require__.d(__webpack_exports__, "CardNameField", (function() {
        return CardNameField;
    }));
    __webpack_require__.d(__webpack_exports__, "CardPostalCodeField", (function() {
        return CardPostalCodeField;
    }));
    __webpack_require__.d(__webpack_exports__, "getCardFields", (function() {
        return getCardFields;
    }));
    __webpack_require__.d(__webpack_exports__, "getCardFieldState", (function() {
        return getCardFieldState;
    }));
    __webpack_require__.d(__webpack_exports__, "getFieldErrors", (function() {
        return getFieldErrors_getFieldErrors;
    }));
    __webpack_require__.d(__webpack_exports__, "resetGQLErrors", (function() {
        return gql_resetGQLErrors;
    }));
    __webpack_require__.d(__webpack_exports__, "emitGqlErrors", (function() {
        return emitGqlErrors;
    }));
    __webpack_require__.d(__webpack_exports__, "hasCardFields", (function() {
        return hasCardFields;
    }));
    __webpack_require__.d(__webpack_exports__, "isEmpty", (function() {
        return isEmpty;
    }));
    __webpack_require__.d(__webpack_exports__, "submitCardFields", (function() {
        return submitCardFields;
    }));
    __webpack_require__.d(__webpack_exports__, "savePaymentSource", (function() {
        return vault_without_purchase_savePaymentSource;
    }));
    function _extends() {
        return (_extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) ({}).hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        }).apply(this, arguments);
    }
    var n, l, preact_module_u, preact_module_t, preact_module_r, preact_module_o, f, c = {}, preact_module_s = [], preact_module_a = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
    function h(n, l) {
        for (var u in l) n[u] = l[u];
        return n;
    }
    function v(n) {
        var l = n.parentNode;
        l && l.removeChild(n);
    }
    function y(l, u, i) {
        var t, r, o, f = {};
        for (o in u) "key" == o ? t = u[o] : "ref" == o ? r = u[o] : f[o] = u[o];
        if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : i), 
        "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === f[o] && (f[o] = l.defaultProps[o]);
        return p(l, f, t, r, null);
    }
    function p(n, i, t, r, o) {
        var f = {
            type: n,
            props: i,
            key: t,
            ref: r,
            __k: null,
            __: null,
            __b: 0,
            __e: null,
            __d: void 0,
            __c: null,
            __h: null,
            constructor: void 0,
            __v: null == o ? ++preact_module_u : o
        };
        return null == o && null != l.vnode && l.vnode(f), f;
    }
    function _(n) {
        return n.children;
    }
    function k(n, l) {
        this.props = n, this.context = l;
    }
    function b(n, l) {
        if (null == l) return n.__ ? b(n.__, n.__.__k.indexOf(n) + 1) : null;
        for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
        return "function" == typeof n.type ? b(n) : null;
    }
    function g(n) {
        var l, u;
        if (null != (n = n.__) && null != n.__c) {
            for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) {
                n.__e = n.__c.base = u.__e;
                break;
            }
            return g(n);
        }
    }
    function m(n) {
        (!n.__d && (n.__d = !0) && preact_module_t.push(n) && !w.__r++ || preact_module_r !== l.debounceRendering) && ((preact_module_r = l.debounceRendering) || preact_module_o)(w);
    }
    function w() {
        var n, l, u, i, r, o, e, c;
        for (preact_module_t.sort(f); n = preact_module_t.shift(); ) n.__d && (l = preact_module_t.length, 
        i = void 0, r = void 0, e = (o = (u = n).__v).__e, (c = u.__P) && (i = [], (r = h({}, o)).__v = o.__v + 1, 
        L(c, o, r, u.__n, void 0 !== c.ownerSVGElement, null != o.__h ? [ e ] : null, i, null == e ? b(o) : e, o.__h), 
        M(i, o), o.__e != e && g(o)), preact_module_t.length > l && preact_module_t.sort(f));
        w.__r = 0;
    }
    function x(n, l, u, i, t, r, o, f, e, a) {
        var h, v, y, d, k, g, m, w = i && i.__k || preact_module_s, x = w.length;
        for (u.__k = [], h = 0; h < l.length; h++) if (null != (d = u.__k[h] = null == (d = l[h]) || "boolean" == typeof d || "function" == typeof d ? null : "string" == typeof d || "number" == typeof d || "bigint" == typeof d ? p(null, d, null, null, d) : Array.isArray(d) ? p(_, {
            children: d
        }, null, null, null) : d.__b > 0 ? p(d.type, d.props, d.key, d.ref ? d.ref : null, d.__v) : d)) {
            if (d.__ = u, d.__b = u.__b + 1, null === (y = w[h]) || y && d.key == y.key && d.type === y.type) w[h] = void 0; else for (v = 0; v < x; v++) {
                if ((y = w[v]) && d.key == y.key && d.type === y.type) {
                    w[v] = void 0;
                    break;
                }
                y = null;
            }
            L(n, d, y = y || c, t, r, o, f, e, a), k = d.__e, (v = d.ref) && y.ref != v && (m || (m = []), 
            y.ref && m.push(y.ref, null, d), m.push(v, d.__c || k, d)), null != k ? (null == g && (g = k), 
            "function" == typeof d.type && d.__k === y.__k ? d.__d = e = A(d, e, n) : e = C(n, d, y, w, k, e), 
            "function" == typeof u.type && (u.__d = e)) : e && y.__e == e && e.parentNode != n && (e = b(y));
        }
        for (u.__e = g, h = x; h--; ) null != w[h] && ("function" == typeof u.type && null != w[h].__e && w[h].__e == u.__d && (u.__d = $(i).nextSibling), 
        S(w[h], w[h]));
        if (m) for (h = 0; h < m.length; h++) O(m[h], m[++h], m[++h]);
    }
    function A(n, l, u) {
        for (var i, t = n.__k, r = 0; t && r < t.length; r++) (i = t[r]) && (i.__ = n, l = "function" == typeof i.type ? A(i, l, u) : C(u, i, i, t, i.__e, l));
        return l;
    }
    function C(n, l, u, i, t, r) {
        var o, f, e;
        if (void 0 !== l.__d) o = l.__d, l.__d = void 0; else if (null == u || t != r || null == t.parentNode) n: if (null == r || r.parentNode !== n) n.appendChild(t), 
        o = null; else {
            for (f = r, e = 0; (f = f.nextSibling) && e < i.length; e += 1) if (f == t) break n;
            n.insertBefore(t, r), o = r;
        }
        return void 0 !== o ? o : t.nextSibling;
    }
    function $(n) {
        var l, u, i;
        if (null == n.type || "string" == typeof n.type) return n.__e;
        if (n.__k) for (l = n.__k.length - 1; l >= 0; l--) if ((u = n.__k[l]) && (i = $(u))) return i;
        return null;
    }
    function I(n, l, u) {
        "-" === l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || preact_module_a.test(l) ? u : u + "px";
    }
    function T(n, l, u, i, t) {
        var r;
        n: if ("style" === l) if ("string" == typeof u) n.style.cssText = u; else {
            if ("string" == typeof i && (n.style.cssText = i = ""), i) for (l in i) u && l in u || I(n.style, l, "");
            if (u) for (l in u) i && u[l] === i[l] || I(n.style, l, u[l]);
        } else if ("o" === l[0] && "n" === l[1]) r = l !== (l = l.replace(/Capture$/, "")), 
        l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), 
        n.l[l + r] = u, u ? i || n.addEventListener(l, r ? z : j, r) : n.removeEventListener(l, r ? z : j, r); else if ("dangerouslySetInnerHTML" !== l) {
            if (t) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s"); else if ("width" !== l && "height" !== l && "href" !== l && "list" !== l && "form" !== l && "tabIndex" !== l && "download" !== l && l in n) try {
                n[l] = null == u ? "" : u;
                break n;
            } catch (n) {}
            "function" == typeof u || (null == u || !1 === u && -1 == l.indexOf("-") ? n.removeAttribute(l) : n.setAttribute(l, u));
        }
    }
    function j(n) {
        return this.l[n.type + !1](l.event ? l.event(n) : n);
    }
    function z(n) {
        return this.l[n.type + !0](l.event ? l.event(n) : n);
    }
    function L(n, u, i, t, r, o, f, e, c) {
        var s, a, v, y, p, d, b, g, m, w, A, P, C, $, H, I = u.type;
        if (void 0 !== u.constructor) return null;
        null != i.__h && (c = i.__h, e = u.__e = i.__e, u.__h = null, o = [ e ]), (s = l.__b) && s(u);
        try {
            n: if ("function" == typeof I) {
                if (g = u.props, m = (s = I.contextType) && t[s.__c], w = s ? m ? m.props.value : s.__ : t, 
                i.__c ? b = (a = u.__c = i.__c).__ = a.__E : ("prototype" in I && I.prototype.render ? u.__c = a = new I(g, w) : (u.__c = a = new k(g, w), 
                a.constructor = I, a.render = q), m && m.sub(a), a.props = g, a.state || (a.state = {}), 
                a.context = w, a.__n = t, v = a.__d = !0, a.__h = [], a._sb = []), null == a.__s && (a.__s = a.state), 
                null != I.getDerivedStateFromProps && (a.__s == a.state && (a.__s = h({}, a.__s)), 
                h(a.__s, I.getDerivedStateFromProps(g, a.__s))), y = a.props, p = a.state, a.__v = u, 
                v) null == I.getDerivedStateFromProps && null != a.componentWillMount && a.componentWillMount(), 
                null != a.componentDidMount && a.__h.push(a.componentDidMount); else {
                    if (null == I.getDerivedStateFromProps && g !== y && null != a.componentWillReceiveProps && a.componentWillReceiveProps(g, w), 
                    !a.__e && null != a.shouldComponentUpdate && !1 === a.shouldComponentUpdate(g, a.__s, w) || u.__v === i.__v) {
                        for (u.__v !== i.__v && (a.props = g, a.state = a.__s, a.__d = !1), a.__e = !1, 
                        u.__e = i.__e, u.__k = i.__k, u.__k.forEach((function(n) {
                            n && (n.__ = u);
                        })), A = 0; A < a._sb.length; A++) a.__h.push(a._sb[A]);
                        a._sb = [], a.__h.length && f.push(a);
                        break n;
                    }
                    null != a.componentWillUpdate && a.componentWillUpdate(g, a.__s, w), null != a.componentDidUpdate && a.__h.push((function() {
                        a.componentDidUpdate(y, p, d);
                    }));
                }
                if (a.context = w, a.props = g, a.__P = n, P = l.__r, C = 0, "prototype" in I && I.prototype.render) {
                    for (a.state = a.__s, a.__d = !1, P && P(u), s = a.render(a.props, a.state, a.context), 
                    $ = 0; $ < a._sb.length; $++) a.__h.push(a._sb[$]);
                    a._sb = [];
                } else do {
                    a.__d = !1, P && P(u), s = a.render(a.props, a.state, a.context), a.state = a.__s;
                } while (a.__d && ++C < 25);
                a.state = a.__s, null != a.getChildContext && (t = h(h({}, t), a.getChildContext())), 
                v || null == a.getSnapshotBeforeUpdate || (d = a.getSnapshotBeforeUpdate(y, p)), 
                H = null != s && s.type === _ && null == s.key ? s.props.children : s, x(n, Array.isArray(H) ? H : [ H ], u, i, t, r, o, f, e, c), 
                a.base = u.__e, u.__h = null, a.__h.length && f.push(a), b && (a.__E = a.__ = null), 
                a.__e = !1;
            } else null == o && u.__v === i.__v ? (u.__k = i.__k, u.__e = i.__e) : u.__e = N(i.__e, u, i, t, r, o, f, c);
            (s = l.diffed) && s(u);
        } catch (n) {
            u.__v = null, (c || null != o) && (u.__e = e, u.__h = !!c, o[o.indexOf(e)] = null), 
            l.__e(n, u, i);
        }
    }
    function M(n, u) {
        l.__c && l.__c(u, n), n.some((function(u) {
            try {
                n = u.__h, u.__h = [], n.some((function(n) {
                    n.call(u);
                }));
            } catch (n) {
                l.__e(n, u.__v);
            }
        }));
    }
    function N(l, u, i, t, r, o, f, e) {
        var s, a, h, y = i.props, p = u.props, d = u.type, _ = 0;
        if ("svg" === d && (r = !0), null != o) for (;_ < o.length; _++) if ((s = o[_]) && "setAttribute" in s == !!d && (d ? s.localName === d : 3 === s.nodeType)) {
            l = s, o[_] = null;
            break;
        }
        if (null == l) {
            if (null === d) return document.createTextNode(p);
            l = r ? document.createElementNS("http://www.w3.org/2000/svg", d) : document.createElement(d, p.is && p), 
            o = null, e = !1;
        }
        if (null === d) y === p || e && l.data === p || (l.data = p); else {
            if (o = o && n.call(l.childNodes), a = (y = i.props || c).dangerouslySetInnerHTML, 
            h = p.dangerouslySetInnerHTML, !e) {
                if (null != o) for (y = {}, _ = 0; _ < l.attributes.length; _++) y[l.attributes[_].name] = l.attributes[_].value;
                (h || a) && (h && (a && h.__html == a.__html || h.__html === l.innerHTML) || (l.innerHTML = h && h.__html || ""));
            }
            if (function(n, l, u, i, t) {
                var r;
                for (r in u) "children" === r || "key" === r || r in l || T(n, r, null, u[r], i);
                for (r in l) t && "function" != typeof l[r] || "children" === r || "key" === r || "value" === r || "checked" === r || u[r] === l[r] || T(n, r, l[r], u[r], i);
            }(l, p, y, r, e), h) u.__k = []; else if (_ = u.props.children, x(l, Array.isArray(_) ? _ : [ _ ], u, i, t, r && "foreignObject" !== d, o, f, o ? o[0] : i.__k && b(i, 0), e), 
            null != o) for (_ = o.length; _--; ) null != o[_] && v(o[_]);
            e || ("value" in p && void 0 !== (_ = p.value) && (_ !== l.value || "progress" === d && !_ || "option" === d && _ !== y.value) && T(l, "value", _, y.value, !1), 
            "checked" in p && void 0 !== (_ = p.checked) && _ !== l.checked && T(l, "checked", _, y.checked, !1));
        }
        return l;
    }
    function O(n, u, i) {
        try {
            "function" == typeof n ? n(u) : n.current = u;
        } catch (n) {
            l.__e(n, i);
        }
    }
    function S(n, u, i) {
        var t, r;
        if (l.unmount && l.unmount(n), (t = n.ref) && (t.current && t.current !== n.__e || O(t, null, u)), 
        null != (t = n.__c)) {
            if (t.componentWillUnmount) try {
                t.componentWillUnmount();
            } catch (n) {
                l.__e(n, u);
            }
            t.base = t.__P = null, n.__c = void 0;
        }
        if (t = n.__k) for (r = 0; r < t.length; r++) t[r] && S(t[r], u, i || "function" != typeof n.type);
        i || null == n.__e || v(n.__e), n.__ = n.__e = n.__d = void 0;
    }
    function q(n, l, u) {
        return this.constructor(n, u);
    }
    n = preact_module_s.slice, l = {
        __e: function(n, l, u, i) {
            for (var t, r, o; l = l.__; ) if ((t = l.__c) && !t.__) try {
                if ((r = t.constructor) && null != r.getDerivedStateFromError && (t.setState(r.getDerivedStateFromError(n)), 
                o = t.__d), null != t.componentDidCatch && (t.componentDidCatch(n, i || {}), o = t.__d), 
                o) return t.__E = t;
            } catch (l) {
                n = l;
            }
            throw n;
        }
    }, preact_module_u = 0, k.prototype.setState = function(n, l) {
        var u;
        u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = h({}, this.state), 
        "function" == typeof n && (n = n(h({}, u), this.props)), n && h(u, n), null != n && this.__v && (l && this._sb.push(l), 
        m(this));
    }, k.prototype.forceUpdate = function(n) {
        this.__v && (this.__e = !0, n && this.__h.push(n), m(this));
    }, k.prototype.render = _, preact_module_t = [], preact_module_o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, 
    f = function(n, l) {
        return n.__v.__b - l.__v.__b;
    }, w.__r = 0;
    var hooks_module_t, hooks_module_r, hooks_module_u, hooks_module_i, hooks_module_o = 0, hooks_module_f = [], hooks_module_c = [], hooks_module_e = l.__b, hooks_module_a = l.__r, hooks_module_v = l.diffed, hooks_module_l = l.__c, hooks_module_m = l.unmount;
    function hooks_module_d(t, u) {
        l.__h && l.__h(hooks_module_r, t, hooks_module_o || u), hooks_module_o = 0;
        var i = hooks_module_r.__H || (hooks_module_r.__H = {
            __: [],
            __h: []
        });
        return t >= i.__.length && i.__.push({
            __V: hooks_module_c
        }), i.__[t];
    }
    function hooks_module_h(n) {
        return hooks_module_o = 1, function(n, u, i) {
            var o = hooks_module_d(hooks_module_t++, 2);
            if (o.t = n, !o.__c && (o.__ = [ hooks_module_B(void 0, u), function(n) {
                var t = o.__N ? o.__N[0] : o.__[0], r = o.t(t, n);
                t !== r && (o.__N = [ r, o.__[1] ], o.__c.setState({}));
            } ], o.__c = hooks_module_r, !hooks_module_r.u)) {
                var f = function(n, t, r) {
                    if (!o.__c.__H) return !0;
                    var u = o.__c.__H.__.filter((function(n) {
                        return n.__c;
                    }));
                    if (u.every((function(n) {
                        return !n.__N;
                    }))) return !c || c.call(this, n, t, r);
                    var i = !1;
                    return u.forEach((function(n) {
                        if (n.__N) {
                            var t = n.__[0];
                            n.__ = n.__N, n.__N = void 0, t !== n.__[0] && (i = !0);
                        }
                    })), !(!i && o.__c.props === n) && (!c || c.call(this, n, t, r));
                };
                hooks_module_r.u = !0;
                var c = hooks_module_r.shouldComponentUpdate, e = hooks_module_r.componentWillUpdate;
                hooks_module_r.componentWillUpdate = function(n, t, r) {
                    if (this.__e) {
                        var u = c;
                        c = void 0, f(n, t, r), c = u;
                    }
                    e && e.call(this, n, t, r);
                }, hooks_module_r.shouldComponentUpdate = f;
            }
            return o.__N || o.__;
        }(hooks_module_B, n);
    }
    function hooks_module_p(u, i) {
        var o = hooks_module_d(hooks_module_t++, 3);
        !l.__s && hooks_module_z(o.__H, i) && (o.__ = u, o.i = i, hooks_module_r.__H.__h.push(o));
    }
    function hooks_module_(n) {
        return hooks_module_o = 5, function(n, r) {
            var u = hooks_module_d(hooks_module_t++, 7);
            return hooks_module_z(u.__H, r) ? (u.__V = n(), u.i = r, u.__h = n, u.__V) : u.__;
        }((function() {
            return {
                current: n
            };
        }), []);
    }
    function hooks_module_b() {
        for (var t; t = hooks_module_f.shift(); ) if (t.__P && t.__H) try {
            t.__H.__h.forEach(hooks_module_k), t.__H.__h.forEach(hooks_module_w), t.__H.__h = [];
        } catch (r) {
            t.__H.__h = [], l.__e(r, t.__v);
        }
    }
    l.__b = function(n) {
        hooks_module_r = null, hooks_module_e && hooks_module_e(n);
    }, l.__r = function(n) {
        hooks_module_a && hooks_module_a(n), hooks_module_t = 0;
        var i = (hooks_module_r = n.__c).__H;
        i && (hooks_module_u === hooks_module_r ? (i.__h = [], hooks_module_r.__h = [], 
        i.__.forEach((function(n) {
            n.__N && (n.__ = n.__N), n.__V = hooks_module_c, n.__N = n.i = void 0;
        }))) : (i.__h.forEach(hooks_module_k), i.__h.forEach(hooks_module_w), i.__h = [])), 
        hooks_module_u = hooks_module_r;
    }, l.diffed = function(t) {
        hooks_module_v && hooks_module_v(t);
        var o = t.__c;
        o && o.__H && (o.__H.__h.length && (1 !== hooks_module_f.push(o) && hooks_module_i === l.requestAnimationFrame || ((hooks_module_i = l.requestAnimationFrame) || hooks_module_j)(hooks_module_b)), 
        o.__H.__.forEach((function(n) {
            n.i && (n.__H = n.i), n.__V !== hooks_module_c && (n.__ = n.__V), n.i = void 0, 
            n.__V = hooks_module_c;
        }))), hooks_module_u = hooks_module_r = null;
    }, l.__c = function(t, r) {
        r.some((function(t) {
            try {
                t.__h.forEach(hooks_module_k), t.__h = t.__h.filter((function(n) {
                    return !n.__ || hooks_module_w(n);
                }));
            } catch (u) {
                r.some((function(n) {
                    n.__h && (n.__h = []);
                })), r = [], l.__e(u, t.__v);
            }
        })), hooks_module_l && hooks_module_l(t, r);
    }, l.unmount = function(t) {
        hooks_module_m && hooks_module_m(t);
        var r, u = t.__c;
        u && u.__H && (u.__H.__.forEach((function(n) {
            try {
                hooks_module_k(n);
            } catch (n) {
                r = n;
            }
        })), u.__H = void 0, r && l.__e(r, u.__v));
    };
    var hooks_module_g = "function" == typeof requestAnimationFrame;
    function hooks_module_j(n) {
        var t, r = function() {
            clearTimeout(u), hooks_module_g && cancelAnimationFrame(t), setTimeout(n);
        }, u = setTimeout(r, 100);
        hooks_module_g && (t = requestAnimationFrame(r));
    }
    function hooks_module_k(n) {
        var t = hooks_module_r, u = n.__c;
        "function" == typeof u && (n.__c = void 0, u()), hooks_module_r = t;
    }
    function hooks_module_w(n) {
        var t = hooks_module_r;
        n.__c = n.__(), hooks_module_r = t;
    }
    function hooks_module_z(n, t) {
        return !n || n.length !== t.length || t.some((function(t, r) {
            return t !== n[r];
        }));
    }
    function hooks_module_B(n, t) {
        return "function" == typeof t ? t(n) : t;
    }
    function utils_isPromise(item) {
        try {
            if (!item) return !1;
            if ("undefined" != typeof Promise && item instanceof Promise) return !0;
            if ("undefined" != typeof window && "function" == typeof window.Window && item instanceof window.Window) return !1;
            if ("undefined" != typeof window && "function" == typeof window.constructor && item instanceof window.constructor) return !1;
            var _toString = {}.toString;
            if (_toString) {
                var name = _toString.call(item);
                if ("[object Window]" === name || "[object global]" === name || "[object DOMWindow]" === name) return !1;
            }
            if ("function" == typeof item.then) return !0;
        } catch (err) {
            return !1;
        }
        return !1;
    }
    var dispatchedErrors = [];
    var possiblyUnhandledPromiseHandlers = [];
    var activeCount = 0;
    var flushPromise;
    function flushActive() {
        if (!activeCount && flushPromise) {
            var promise = flushPromise;
            flushPromise = null;
            promise.resolve();
        }
    }
    function startActive() {
        activeCount += 1;
    }
    function endActive() {
        activeCount -= 1;
        flushActive();
    }
    var promise_ZalgoPromise = function() {
        function ZalgoPromise(handler) {
            var _this = this;
            this.resolved = void 0;
            this.rejected = void 0;
            this.errorHandled = void 0;
            this.value = void 0;
            this.error = void 0;
            this.handlers = void 0;
            this.dispatching = void 0;
            this.stack = void 0;
            this.resolved = !1;
            this.rejected = !1;
            this.errorHandled = !1;
            this.handlers = [];
            if (handler) {
                var _result;
                var _error;
                var resolved = !1;
                var rejected = !1;
                var isAsync = !1;
                startActive();
                try {
                    handler((function(res) {
                        if (isAsync) _this.resolve(res); else {
                            resolved = !0;
                            _result = res;
                        }
                    }), (function(err) {
                        if (isAsync) _this.reject(err); else {
                            rejected = !0;
                            _error = err;
                        }
                    }));
                } catch (err) {
                    endActive();
                    this.reject(err);
                    return;
                }
                endActive();
                isAsync = !0;
                resolved ? this.resolve(_result) : rejected && this.reject(_error);
            }
        }
        var _proto = ZalgoPromise.prototype;
        _proto.resolve = function(result) {
            if (this.resolved || this.rejected) return this;
            if (utils_isPromise(result)) throw new Error("Can not resolve promise with another promise");
            this.resolved = !0;
            this.value = result;
            this.dispatch();
            return this;
        };
        _proto.reject = function(error) {
            var _this2 = this;
            if (this.resolved || this.rejected) return this;
            if (utils_isPromise(error)) throw new Error("Can not reject promise with another promise");
            if (!error) {
                var _err = error && "function" == typeof error.toString ? error.toString() : {}.toString.call(error);
                error = new Error("Expected reject to be called with Error, got " + _err);
            }
            this.rejected = !0;
            this.error = error;
            this.errorHandled || setTimeout((function() {
                _this2.errorHandled || function(err, promise) {
                    if (-1 === dispatchedErrors.indexOf(err)) {
                        dispatchedErrors.push(err);
                        setTimeout((function() {
                            throw err;
                        }), 1);
                        for (var j = 0; j < possiblyUnhandledPromiseHandlers.length; j++) possiblyUnhandledPromiseHandlers[j](err, promise);
                    }
                }(error, _this2);
            }), 1);
            this.dispatch();
            return this;
        };
        _proto.asyncReject = function(error) {
            this.errorHandled = !0;
            this.reject(error);
            return this;
        };
        _proto.dispatch = function() {
            var resolved = this.resolved, rejected = this.rejected, handlers = this.handlers;
            if (!this.dispatching && (resolved || rejected)) {
                this.dispatching = !0;
                startActive();
                var chain = function(firstPromise, secondPromise) {
                    return firstPromise.then((function(res) {
                        secondPromise.resolve(res);
                    }), (function(err) {
                        secondPromise.reject(err);
                    }));
                };
                for (var i = 0; i < handlers.length; i++) {
                    var _handlers$i = handlers[i], onSuccess = _handlers$i.onSuccess, onError = _handlers$i.onError, promise = _handlers$i.promise;
                    var _result2 = void 0;
                    if (resolved) try {
                        _result2 = onSuccess ? onSuccess(this.value) : this.value;
                    } catch (err) {
                        promise.reject(err);
                        continue;
                    } else if (rejected) {
                        if (!onError) {
                            promise.reject(this.error);
                            continue;
                        }
                        try {
                            _result2 = onError(this.error);
                        } catch (err) {
                            promise.reject(err);
                            continue;
                        }
                    }
                    if (_result2 instanceof ZalgoPromise && (_result2.resolved || _result2.rejected)) {
                        var promiseResult = _result2;
                        promiseResult.resolved ? promise.resolve(promiseResult.value) : promise.reject(promiseResult.error);
                        promiseResult.errorHandled = !0;
                    } else utils_isPromise(_result2) ? _result2 instanceof ZalgoPromise && (_result2.resolved || _result2.rejected) ? _result2.resolved ? promise.resolve(_result2.value) : promise.reject(_result2.error) : chain(_result2, promise) : promise.resolve(_result2);
                }
                handlers.length = 0;
                this.dispatching = !1;
                endActive();
            }
        };
        _proto.then = function(onSuccess, onError) {
            if (onSuccess && "function" != typeof onSuccess && !onSuccess.call) throw new Error("Promise.then expected a function for success handler");
            if (onError && "function" != typeof onError && !onError.call) throw new Error("Promise.then expected a function for error handler");
            var promise = new ZalgoPromise;
            this.handlers.push({
                promise: promise,
                onSuccess: onSuccess,
                onError: onError
            });
            this.errorHandled = !0;
            this.dispatch();
            return promise;
        };
        _proto.catch = function(onError) {
            return this.then(void 0, onError);
        };
        _proto.finally = function(onFinally) {
            if (onFinally && "function" != typeof onFinally && !onFinally.call) throw new Error("Promise.finally expected a function");
            return this.then((function(result) {
                return ZalgoPromise.try(onFinally).then((function() {
                    return result;
                }));
            }), (function(err) {
                return ZalgoPromise.try(onFinally).then((function() {
                    throw err;
                }));
            }));
        };
        _proto.timeout = function(time, err) {
            var _this3 = this;
            if (this.resolved || this.rejected) return this;
            var timeout = setTimeout((function() {
                _this3.resolved || _this3.rejected || _this3.reject(err || new Error("Promise timed out after " + time + "ms"));
            }), time);
            return this.then((function(result) {
                clearTimeout(timeout);
                return result;
            }));
        };
        _proto.toPromise = function() {
            if ("undefined" == typeof Promise) throw new TypeError("Could not find Promise");
            return Promise.resolve(this);
        };
        _proto.lazy = function() {
            this.errorHandled = !0;
            return this;
        };
        ZalgoPromise.resolve = function(value) {
            return value instanceof ZalgoPromise ? value : utils_isPromise(value) ? new ZalgoPromise((function(resolve, reject) {
                return value.then(resolve, reject);
            })) : (new ZalgoPromise).resolve(value);
        };
        ZalgoPromise.reject = function(error) {
            return (new ZalgoPromise).reject(error);
        };
        ZalgoPromise.asyncReject = function(error) {
            return (new ZalgoPromise).asyncReject(error);
        };
        ZalgoPromise.all = function(promises) {
            var promise = new ZalgoPromise;
            var count = promises.length;
            var results = [].slice();
            if (!count) {
                promise.resolve(results);
                return promise;
            }
            var chain = function(i, firstPromise, secondPromise) {
                return firstPromise.then((function(res) {
                    results[i] = res;
                    0 == (count -= 1) && promise.resolve(results);
                }), (function(err) {
                    secondPromise.reject(err);
                }));
            };
            for (var i = 0; i < promises.length; i++) {
                var prom = promises[i];
                if (prom instanceof ZalgoPromise) {
                    if (prom.resolved) {
                        results[i] = prom.value;
                        count -= 1;
                        continue;
                    }
                } else if (!utils_isPromise(prom)) {
                    results[i] = prom;
                    count -= 1;
                    continue;
                }
                chain(i, ZalgoPromise.resolve(prom), promise);
            }
            0 === count && promise.resolve(results);
            return promise;
        };
        ZalgoPromise.hash = function(promises) {
            var result = {};
            var awaitPromises = [];
            var _loop = function(key) {
                if (promises.hasOwnProperty(key)) {
                    var value = promises[key];
                    utils_isPromise(value) ? awaitPromises.push(value.then((function(res) {
                        result[key] = res;
                    }))) : result[key] = value;
                }
            };
            for (var key in promises) _loop(key);
            return ZalgoPromise.all(awaitPromises).then((function() {
                return result;
            }));
        };
        ZalgoPromise.map = function(items, method) {
            return ZalgoPromise.all(items.map(method));
        };
        ZalgoPromise.onPossiblyUnhandledException = function(handler) {
            return function(handler) {
                possiblyUnhandledPromiseHandlers.push(handler);
                return {
                    cancel: function() {
                        possiblyUnhandledPromiseHandlers.splice(possiblyUnhandledPromiseHandlers.indexOf(handler), 1);
                    }
                };
            }(handler);
        };
        ZalgoPromise.try = function(method, context, args) {
            if (method && "function" != typeof method && !method.call) throw new Error("Promise.try expected a function");
            var result;
            startActive();
            try {
                result = method.apply(context, args || []);
            } catch (err) {
                endActive();
                return ZalgoPromise.reject(err);
            }
            endActive();
            return ZalgoPromise.resolve(result);
        };
        ZalgoPromise.delay = function(_delay) {
            return new ZalgoPromise((function(resolve) {
                setTimeout(resolve, _delay);
            }));
        };
        ZalgoPromise.isPromise = function(value) {
            return !!(value && value instanceof ZalgoPromise) || utils_isPromise(value);
        };
        ZalgoPromise.flush = function() {
            return function(Zalgo) {
                var promise = flushPromise = flushPromise || new Zalgo;
                flushActive();
                return promise;
            }(ZalgoPromise);
        };
        return ZalgoPromise;
    }();
    function getUserAgent() {
        return window.navigator.mockUserAgent || window.navigator.userAgent;
    }
    function _setPrototypeOf(o, p) {
        return (_setPrototypeOf = Object.setPrototypeOf || function(o, p) {
            o.__proto__ = p;
            return o;
        })(o, p);
    }
    function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        _setPrototypeOf(subClass, superClass);
    }
    var IE_WIN_ACCESS_ERROR = "Call was rejected by callee.\r\n";
    function getActualProtocol(win) {
        void 0 === win && (win = window);
        return win.location.protocol;
    }
    function getProtocol(win) {
        void 0 === win && (win = window);
        if (win.mockDomain) {
            var protocol = win.mockDomain.split("//")[0];
            if (protocol) return protocol;
        }
        return getActualProtocol(win);
    }
    function isAboutProtocol(win) {
        void 0 === win && (win = window);
        return "about:" === getProtocol(win);
    }
    function utils_getParent(win) {
        void 0 === win && (win = window);
        if (win) try {
            if (win.parent && win.parent !== win) return win.parent;
        } catch (err) {}
    }
    function canReadFromWindow(win) {
        try {
            return !0;
        } catch (err) {}
        return !1;
    }
    function getActualDomain(win) {
        void 0 === win && (win = window);
        var location = win.location;
        if (!location) throw new Error("Can not read window location");
        var protocol = getActualProtocol(win);
        if (!protocol) throw new Error("Can not read window protocol");
        if ("file:" === protocol) return "file://";
        if ("about:" === protocol) {
            var parent = utils_getParent(win);
            return parent && canReadFromWindow() ? getActualDomain(parent) : "about://";
        }
        var host = location.host;
        if (!host) throw new Error("Can not read window host");
        return protocol + "//" + host;
    }
    function getDomain(win) {
        void 0 === win && (win = window);
        var domain = getActualDomain(win);
        return domain && win.mockDomain && 0 === win.mockDomain.indexOf("mock:") ? win.mockDomain : domain;
    }
    function isSameDomain(win) {
        if (!function(win) {
            try {
                if (win === window) return !0;
            } catch (err) {}
            try {
                var desc = Object.getOwnPropertyDescriptor(win, "location");
                if (desc && !1 === desc.enumerable) return !1;
            } catch (err) {}
            try {
                if (isAboutProtocol(win) && canReadFromWindow()) return !0;
            } catch (err) {}
            try {
                if (function(win) {
                    void 0 === win && (win = window);
                    return "mock:" === getProtocol(win);
                }(win) && canReadFromWindow()) return !0;
            } catch (err) {}
            try {
                if (getActualDomain(win) === getActualDomain(window)) return !0;
            } catch (err) {}
            return !1;
        }(win)) return !1;
        try {
            if (win === window) return !0;
            if (isAboutProtocol(win) && canReadFromWindow()) return !0;
            if (getDomain(window) === getDomain(win)) return !0;
        } catch (err) {}
        return !1;
    }
    function isAncestorParent(parent, child) {
        if (!parent || !child) return !1;
        var childParent = utils_getParent(child);
        return childParent ? childParent === parent : -1 !== function(win) {
            var result = [];
            try {
                for (;win.parent !== win; ) {
                    result.push(win.parent);
                    win = win.parent;
                }
            } catch (err) {}
            return result;
        }(child).indexOf(parent);
    }
    function getAllChildFrames(win) {
        var result = [];
        for (var _i3 = 0, _getFrames2 = function(win) {
            var result = [];
            var frames;
            try {
                frames = win.frames;
            } catch (err) {
                frames = win;
            }
            var len;
            try {
                len = frames.length;
            } catch (err) {}
            if (0 === len) return result;
            if (len) {
                for (var i = 0; i < len; i++) {
                    var frame = void 0;
                    try {
                        frame = frames[i];
                    } catch (err) {
                        continue;
                    }
                    result.push(frame);
                }
                return result;
            }
            for (var _i = 0; _i < 100; _i++) {
                var _frame = void 0;
                try {
                    _frame = frames[_i];
                } catch (err) {
                    return result;
                }
                if (!_frame) return result;
                result.push(_frame);
            }
            return result;
        }(win); _i3 < _getFrames2.length; _i3++) {
            var frame = _getFrames2[_i3];
            result.push(frame);
            for (var _i5 = 0, _getAllChildFrames2 = getAllChildFrames(frame); _i5 < _getAllChildFrames2.length; _i5++) result.push(_getAllChildFrames2[_i5]);
        }
        return result;
    }
    var iframeWindows = [];
    var iframeFrames = [];
    function isWindowClosed(win, allowMock) {
        void 0 === allowMock && (allowMock = !0);
        try {
            if (win === window) return !1;
        } catch (err) {
            return !0;
        }
        try {
            if (!win) return !0;
        } catch (err) {
            return !0;
        }
        try {
            if (win.closed) return !0;
        } catch (err) {
            return !err || err.message !== IE_WIN_ACCESS_ERROR;
        }
        if (allowMock && isSameDomain(win)) try {
            if (win.mockclosed) return !0;
        } catch (err) {}
        try {
            if (!win.parent || !win.top) return !0;
        } catch (err) {}
        var iframeIndex = function(collection, item) {
            for (var i = 0; i < collection.length; i++) try {
                if (collection[i] === item) return i;
            } catch (err) {}
            return -1;
        }(iframeWindows, win);
        if (-1 !== iframeIndex) {
            var frame = iframeFrames[iframeIndex];
            if (frame && function(frame) {
                if (!frame.contentWindow) return !0;
                if (!frame.parentNode) return !0;
                var doc = frame.ownerDocument;
                if (doc && doc.documentElement && !doc.documentElement.contains(frame)) {
                    var parent = frame;
                    for (;parent.parentNode && parent.parentNode !== parent; ) parent = parent.parentNode;
                    if (!parent.host || !doc.documentElement.contains(parent.host)) return !0;
                }
                return !1;
            }(frame)) return !0;
        }
        return !1;
    }
    function isWindow(obj) {
        try {
            if (obj === window) return !0;
        } catch (err) {
            if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
        }
        try {
            if ("[object Window]" === {}.toString.call(obj)) return !0;
        } catch (err) {
            if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
        }
        try {
            if (window.Window && obj instanceof window.Window) return !0;
        } catch (err) {
            if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
        }
        try {
            if (obj && obj.self === obj) return !0;
        } catch (err) {
            if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
        }
        try {
            if (obj && obj.parent === obj) return !0;
        } catch (err) {
            if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
        }
        try {
            if (obj && obj.top === obj) return !0;
        } catch (err) {
            if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
        }
        try {
            if (obj && "__unlikely_value__" === obj.__cross_domain_utils_window_check__) return !1;
        } catch (err) {
            return !0;
        }
        try {
            if ("postMessage" in obj && "self" in obj && "location" in obj) return !0;
        } catch (err) {}
        return !1;
    }
    function util_safeIndexOf(collection, item) {
        for (var i = 0; i < collection.length; i++) try {
            if (collection[i] === item) return i;
        } catch (err) {}
        return -1;
    }
    var weakmap_CrossDomainSafeWeakMap = function() {
        function CrossDomainSafeWeakMap() {
            this.name = void 0;
            this.weakmap = void 0;
            this.keys = void 0;
            this.values = void 0;
            this.name = "__weakmap_" + (1e9 * Math.random() >>> 0) + "__";
            if (function() {
                if ("undefined" == typeof WeakMap) return !1;
                if (void 0 === Object.freeze) return !1;
                try {
                    var testWeakMap = new WeakMap;
                    var testKey = {};
                    Object.freeze(testKey);
                    testWeakMap.set(testKey, "__testvalue__");
                    return "__testvalue__" === testWeakMap.get(testKey);
                } catch (err) {
                    return !1;
                }
            }()) try {
                this.weakmap = new WeakMap;
            } catch (err) {}
            this.keys = [];
            this.values = [];
        }
        var _proto = CrossDomainSafeWeakMap.prototype;
        _proto._cleanupClosedWindows = function() {
            var weakmap = this.weakmap;
            var keys = this.keys;
            for (var i = 0; i < keys.length; i++) {
                var value = keys[i];
                if (isWindow(value) && isWindowClosed(value)) {
                    if (weakmap) try {
                        weakmap.delete(value);
                    } catch (err) {}
                    keys.splice(i, 1);
                    this.values.splice(i, 1);
                    i -= 1;
                }
            }
        };
        _proto.isSafeToReadWrite = function(key) {
            return !isWindow(key);
        };
        _proto.set = function(key, value) {
            if (!key) throw new Error("WeakMap expected key");
            var weakmap = this.weakmap;
            if (weakmap) try {
                weakmap.set(key, value);
            } catch (err) {
                delete this.weakmap;
            }
            if (this.isSafeToReadWrite(key)) try {
                var name = this.name;
                var entry = key[name];
                entry && entry[0] === key ? entry[1] = value : Object.defineProperty(key, name, {
                    value: [ key, value ],
                    writable: !0
                });
                return;
            } catch (err) {}
            this._cleanupClosedWindows();
            var keys = this.keys;
            var values = this.values;
            var index = util_safeIndexOf(keys, key);
            if (-1 === index) {
                keys.push(key);
                values.push(value);
            } else values[index] = value;
        };
        _proto.get = function(key) {
            if (!key) throw new Error("WeakMap expected key");
            var weakmap = this.weakmap;
            if (weakmap) try {
                if (weakmap.has(key)) return weakmap.get(key);
            } catch (err) {
                delete this.weakmap;
            }
            if (this.isSafeToReadWrite(key)) try {
                var entry = key[this.name];
                return entry && entry[0] === key ? entry[1] : void 0;
            } catch (err) {}
            this._cleanupClosedWindows();
            var index = util_safeIndexOf(this.keys, key);
            if (-1 !== index) return this.values[index];
        };
        _proto.delete = function(key) {
            if (!key) throw new Error("WeakMap expected key");
            var weakmap = this.weakmap;
            if (weakmap) try {
                weakmap.delete(key);
            } catch (err) {
                delete this.weakmap;
            }
            if (this.isSafeToReadWrite(key)) try {
                var entry = key[this.name];
                entry && entry[0] === key && (entry[0] = entry[1] = void 0);
            } catch (err) {}
            this._cleanupClosedWindows();
            var keys = this.keys;
            var index = util_safeIndexOf(keys, key);
            if (-1 !== index) {
                keys.splice(index, 1);
                this.values.splice(index, 1);
            }
        };
        _proto.has = function(key) {
            if (!key) throw new Error("WeakMap expected key");
            var weakmap = this.weakmap;
            if (weakmap) try {
                if (weakmap.has(key)) return !0;
            } catch (err) {
                delete this.weakmap;
            }
            if (this.isSafeToReadWrite(key)) try {
                var entry = key[this.name];
                return !(!entry || entry[0] !== key);
            } catch (err) {}
            this._cleanupClosedWindows();
            return -1 !== util_safeIndexOf(this.keys, key);
        };
        _proto.getOrSet = function(key, getter) {
            if (this.has(key)) return this.get(key);
            var value = getter();
            this.set(key, value);
            return value;
        };
        return CrossDomainSafeWeakMap;
    }();
    function _getPrototypeOf(o) {
        return (_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function(o) {
            return o.__proto__ || Object.getPrototypeOf(o);
        })(o);
    }
    function _isNativeReflectConstruct() {
        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
        if (Reflect.construct.sham) return !1;
        if ("function" == typeof Proxy) return !0;
        try {
            Date.prototype.toString.call(Reflect.construct(Date, [], (function() {})));
            return !0;
        } catch (e) {
            return !1;
        }
    }
    function construct_construct(Parent, args, Class) {
        return (construct_construct = _isNativeReflectConstruct() ? Reflect.construct : function(Parent, args, Class) {
            var a = [ null ];
            a.push.apply(a, args);
            var instance = new (Function.bind.apply(Parent, a));
            Class && _setPrototypeOf(instance, Class.prototype);
            return instance;
        }).apply(null, arguments);
    }
    function wrapNativeSuper_wrapNativeSuper(Class) {
        var _cache = "function" == typeof Map ? new Map : void 0;
        return (wrapNativeSuper_wrapNativeSuper = function(Class) {
            if (null === Class || !(fn = Class, -1 !== Function.toString.call(fn).indexOf("[native code]"))) return Class;
            var fn;
            if ("function" != typeof Class) throw new TypeError("Super expression must either be null or a function");
            if (void 0 !== _cache) {
                if (_cache.has(Class)) return _cache.get(Class);
                _cache.set(Class, Wrapper);
            }
            function Wrapper() {
                return construct_construct(Class, arguments, _getPrototypeOf(this).constructor);
            }
            Wrapper.prototype = Object.create(Class.prototype, {
                constructor: {
                    value: Wrapper,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            });
            return _setPrototypeOf(Wrapper, Class);
        })(Class);
    }
    function getFunctionName(fn) {
        return fn.name || fn.__name__ || fn.displayName || "anonymous";
    }
    function setFunctionName(fn, name) {
        try {
            delete fn.name;
            fn.name = name;
        } catch (err) {}
        fn.__name__ = fn.displayName = name;
        return fn;
    }
    function base64encode(str) {
        if ("function" == typeof btoa) return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (function(m, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }))).replace(/[=]/g, "");
        if ("undefined" != typeof Buffer) return Buffer.from(str, "utf8").toString("base64").replace(/[=]/g, "");
        throw new Error("Can not find window.btoa or Buffer");
    }
    function uniqueID() {
        var chars = "0123456789abcdef";
        return "uid_" + "xxxxxxxxxx".replace(/./g, (function() {
            return chars.charAt(Math.floor(Math.random() * chars.length));
        })) + "_" + base64encode((new Date).toISOString().slice(11, 19).replace("T", ".")).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    }
    function getGlobal() {
        if ("undefined" != typeof window) return window;
        if ("undefined" != typeof window) return window;
        if ("undefined" != typeof global) return global;
        throw new Error("No global found");
    }
    var objectIDs;
    function serializeArgs(args) {
        try {
            return JSON.stringify([].slice.call(args), (function(subkey, val) {
                return "function" == typeof val ? "memoize[" + function(obj) {
                    objectIDs = objectIDs || new weakmap_CrossDomainSafeWeakMap;
                    if (null == obj || "object" != typeof obj && "function" != typeof obj) throw new Error("Invalid object");
                    var uid = objectIDs.get(obj);
                    if (!uid) {
                        uid = typeof obj + ":" + uniqueID();
                        objectIDs.set(obj, uid);
                    }
                    return uid;
                }(val) + "]" : function(element) {
                    var passed = !1;
                    try {
                        (element instanceof window.Element || null !== element && "object" == typeof element && 1 === element.nodeType && "object" == typeof element.style && "object" == typeof element.ownerDocument) && (passed = !0);
                    } catch (_) {}
                    return passed;
                }(val) ? {} : val;
            }));
        } catch (err) {
            throw new Error("Arguments not serializable -- can not be used to memoize");
        }
    }
    function getEmptyObject() {
        return {};
    }
    var memoizeGlobalIndex = 0;
    var memoizeGlobalIndexValidFrom = 0;
    function memoize(method, options) {
        void 0 === options && (options = {});
        var _options$thisNamespac = options.thisNamespace, thisNamespace = void 0 !== _options$thisNamespac && _options$thisNamespac, cacheTime = options.time;
        var simpleCache;
        var thisCache;
        var memoizeIndex = memoizeGlobalIndex;
        memoizeGlobalIndex += 1;
        var memoizedFunction = function() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            if (memoizeIndex < memoizeGlobalIndexValidFrom) {
                simpleCache = null;
                thisCache = null;
                memoizeIndex = memoizeGlobalIndex;
                memoizeGlobalIndex += 1;
            }
            var cache;
            cache = thisNamespace ? (thisCache = thisCache || new weakmap_CrossDomainSafeWeakMap).getOrSet(this, getEmptyObject) : simpleCache = simpleCache || {};
            var cacheKey;
            try {
                cacheKey = serializeArgs(args);
            } catch (_unused) {
                return method.apply(this, arguments);
            }
            var cacheResult = cache[cacheKey];
            if (cacheResult && cacheTime && Date.now() - cacheResult.time < cacheTime) {
                delete cache[cacheKey];
                cacheResult = null;
            }
            if (cacheResult) return cacheResult.value;
            var time = Date.now();
            var value = method.apply(this, arguments);
            cache[cacheKey] = {
                time: time,
                value: value
            };
            return value;
        };
        memoizedFunction.reset = function() {
            simpleCache = null;
            thisCache = null;
        };
        return setFunctionName(memoizedFunction, (options.name || getFunctionName(method)) + "::memoized");
    }
    memoize.clear = function() {
        memoizeGlobalIndexValidFrom = memoizeGlobalIndex;
    };
    function inlineMemoize(method, logic, args) {
        void 0 === args && (args = []);
        var cache = method.__inline_memoize_cache__ = method.__inline_memoize_cache__ || {};
        var key = serializeArgs(args);
        return cache.hasOwnProperty(key) ? cache[key] : cache[key] = logic.apply(void 0, args);
    }
    function src_util_noop() {}
    function stringifyError(err, level) {
        void 0 === level && (level = 1);
        if (level >= 3) return "stringifyError stack overflow";
        try {
            if (!err) return "<unknown error: " + {}.toString.call(err) + ">";
            if ("string" == typeof err) return err;
            if (err instanceof Error) {
                var stack = err && err.stack;
                var message = err && err.message;
                if (stack && message) return -1 !== stack.indexOf(message) ? stack : message + "\n" + stack;
                if (stack) return stack;
                if (message) return message;
            }
            return err && err.toString && "function" == typeof err.toString ? err.toString() : {}.toString.call(err);
        } catch (newErr) {
            return "Error while stringifying error: " + stringifyError(newErr, level + 1);
        }
    }
    function stringifyErrorMessage(err) {
        var defaultMessage = "<unknown error: " + {}.toString.call(err) + ">";
        return err ? err instanceof Error ? err.message || defaultMessage : "string" == typeof err.message && err.message || defaultMessage : defaultMessage;
    }
    memoize((function(obj) {
        if (Object.values) return Object.values(obj);
        var result = [];
        for (var key in obj) obj.hasOwnProperty(key) && result.push(obj[key]);
        return result;
    }));
    function objFilter(obj, filter) {
        void 0 === filter && (filter = Boolean);
        var result = {};
        for (var key in obj) obj.hasOwnProperty(key) && filter(obj[key], key) && (result[key] = obj[key]);
        return result;
    }
    var util_ExtendableError = function(_Error) {
        _inheritsLoose(ExtendableError, _Error);
        function ExtendableError(message) {
            var _this6;
            (_this6 = _Error.call(this, message) || this).name = _this6.constructor.name;
            "function" == typeof Error.captureStackTrace ? Error.captureStackTrace(function(self) {
                if (void 0 === self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return self;
            }(_this6), _this6.constructor) : _this6.stack = new Error(message).stack;
            return _this6;
        }
        return ExtendableError;
    }(wrapNativeSuper_wrapNativeSuper(Error));
    function isDocumentReady() {
        return Boolean(document.body) && "complete" === document.readyState;
    }
    function isDocumentInteractive() {
        return Boolean(document.body) && "interactive" === document.readyState;
    }
    var waitForDocumentReady = memoize((function() {
        return new promise_ZalgoPromise((function(resolve) {
            if (isDocumentReady() || isDocumentInteractive()) return resolve();
            var interval = setInterval((function() {
                if (isDocumentReady() || isDocumentInteractive()) {
                    clearInterval(interval);
                    return resolve();
                }
            }), 10);
        }));
    }));
    function parseQuery(queryString) {
        return inlineMemoize(parseQuery, (function() {
            var params = {};
            if (!queryString) return params;
            if (-1 === queryString.indexOf("=")) return params;
            for (var _i2 = 0, _queryString$split2 = queryString.split("&"); _i2 < _queryString$split2.length; _i2++) {
                var pair = _queryString$split2[_i2];
                (pair = pair.split("="))[0] && pair[1] && (params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]));
            }
            return params;
        }), [ queryString ]);
    }
    function dom_redirect(url, win) {
        void 0 === win && (win = window);
        return new promise_ZalgoPromise((function(resolve) {
            win.location = url;
            (function(url) {
                return -1 === url.indexOf("#") || 0 !== url.indexOf("#") && url.split("#")[0] !== window.location.href.split("#")[0];
            })(url) || resolve();
        }));
    }
    function getPerformance() {
        return inlineMemoize(getPerformance, (function() {
            var performance = window.performance;
            if (performance && performance.now && performance.timing && performance.timing.connectEnd && performance.timing.navigationStart && Math.abs(performance.now() - Date.now()) > 1e3 && performance.now() - (performance.timing.connectEnd - performance.timing.navigationStart) > 0) return performance;
        }));
    }
    function dom_isBrowser() {
        return "undefined" != typeof window && void 0 !== window.location;
    }
    function isLocalStorageEnabled() {
        return inlineMemoize(isLocalStorageEnabled, (function() {
            try {
                if ("undefined" == typeof window) return !1;
                if (window.localStorage) {
                    var value = Math.random().toString();
                    window.localStorage.setItem("__test__localStorage__", value);
                    var result = window.localStorage.getItem("__test__localStorage__");
                    window.localStorage.removeItem("__test__localStorage__");
                    if (value === result) return !0;
                }
            } catch (err) {}
            return !1;
        }));
    }
    _inheritsLoose((function() {
        return _ExtendableError.apply(this, arguments) || this;
    }), _ExtendableError = util_ExtendableError);
    var _ExtendableError;
    var currentScript = "undefined" != typeof document ? document.currentScript : null;
    var getCurrentScript = memoize((function() {
        if (currentScript) return currentScript;
        if (currentScript = function() {
            try {
                var stack = function() {
                    try {
                        throw new Error("_");
                    } catch (err) {
                        return err.stack || "";
                    }
                }();
                var stackDetails = /.*at [^(]*\((.*):(.+):(.+)\)$/gi.exec(stack);
                var scriptLocation = stackDetails && stackDetails[1];
                if (!scriptLocation) return;
                for (var _i22 = 0, _Array$prototype$slic2 = [].slice.call(document.getElementsByTagName("script")).reverse(); _i22 < _Array$prototype$slic2.length; _i22++) {
                    var script = _Array$prototype$slic2[_i22];
                    if (script.src && script.src === scriptLocation) return script;
                }
            } catch (err) {}
        }()) return currentScript;
        throw new Error("Can not determine current script");
    }));
    var currentUID = uniqueID();
    memoize((function() {
        var script;
        try {
            script = getCurrentScript();
        } catch (err) {
            return currentUID;
        }
        var uid = script.getAttribute("data-uid");
        if (uid && "string" == typeof uid) return uid;
        if ((uid = script.getAttribute("data-uid-auto")) && "string" == typeof uid) return uid;
        if (script.src) {
            var hashedString = function(str) {
                var hash = "";
                for (var i = 0; i < str.length; i++) {
                    var total = str[i].charCodeAt(0) * i;
                    str[i + 1] && (total += str[i + 1].charCodeAt(0) * (i - 1));
                    hash += String.fromCharCode(97 + Math.abs(total) % 26);
                }
                return hash;
            }(JSON.stringify({
                src: script.src,
                dataset: script.dataset
            }));
            uid = "uid_" + hashedString.slice(hashedString.length - 30);
        } else uid = uniqueID();
        script.setAttribute("data-uid-auto", uid);
        return uid;
    }));
    function getStorage(_ref) {
        var name = _ref.name, _ref$lifetime = _ref.lifetime, lifetime = void 0 === _ref$lifetime ? 12e5 : _ref$lifetime;
        return inlineMemoize(getStorage, (function() {
            var STORAGE_KEY = "__" + name + "_storage__";
            var newStateID = uniqueID();
            var accessedStorage;
            function getState(handler) {
                var localStorageEnabled = isLocalStorageEnabled();
                var storage;
                accessedStorage && (storage = accessedStorage);
                if (!storage && localStorageEnabled) {
                    var rawStorage = window.localStorage.getItem(STORAGE_KEY);
                    rawStorage && (storage = JSON.parse(rawStorage));
                }
                storage || (storage = getGlobal()[STORAGE_KEY]);
                storage || (storage = {
                    id: newStateID
                });
                storage.id || (storage.id = newStateID);
                accessedStorage = storage;
                var result = handler(storage);
                localStorageEnabled ? window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage)) : getGlobal()[STORAGE_KEY] = storage;
                accessedStorage = null;
                return result;
            }
            function getID() {
                return getState((function(storage) {
                    return storage.id;
                }));
            }
            function getSession(handler) {
                return getState((function(storage) {
                    var session = storage.__session__;
                    var now = Date.now();
                    session && now - session.created > lifetime && (session = null);
                    session || (session = {
                        guid: uniqueID(),
                        created: now
                    });
                    storage.__session__ = session;
                    return handler(session);
                }));
            }
            return {
                getState: getState,
                getID: getID,
                isStateFresh: function() {
                    return getID() === newStateID;
                },
                getSessionState: function(handler) {
                    return getSession((function(session) {
                        session.state = session.state || {};
                        return handler(session.state);
                    }));
                },
                getSessionID: function() {
                    return getSession((function(session) {
                        return session.guid;
                    }));
                }
            };
        }), [ {
            name: name,
            lifetime: lifetime
        } ]);
    }
    var http_headerBuilders = [];
    function request(_ref) {
        var url = _ref.url, _ref$method = _ref.method, method = void 0 === _ref$method ? "get" : _ref$method, _ref$headers = _ref.headers, headers = void 0 === _ref$headers ? {} : _ref$headers, json = _ref.json, data = _ref.data, body = _ref.body, _ref$win = _ref.win, win = void 0 === _ref$win ? window : _ref$win, _ref$timeout = _ref.timeout, timeout = void 0 === _ref$timeout ? 0 : _ref$timeout;
        return new promise_ZalgoPromise((function(resolve, reject) {
            if (json && data || json && body || data && json) throw new Error("Only options.json or options.data or options.body should be passed");
            var normalizedHeaders = {};
            for (var _i4 = 0, _Object$keys2 = Object.keys(headers); _i4 < _Object$keys2.length; _i4++) {
                var _key2 = _Object$keys2[_i4];
                normalizedHeaders[_key2.toLowerCase()] = headers[_key2];
            }
            json ? normalizedHeaders["content-type"] = normalizedHeaders["content-type"] || "application/json" : (data || body) && (normalizedHeaders["content-type"] = normalizedHeaders["content-type"] || "application/x-www-form-urlencoded; charset=utf-8");
            normalizedHeaders.accept = normalizedHeaders.accept || "application/json";
            for (var _i6 = 0; _i6 < http_headerBuilders.length; _i6++) {
                var builtHeaders = (0, http_headerBuilders[_i6])();
                for (var _i8 = 0, _Object$keys4 = Object.keys(builtHeaders); _i8 < _Object$keys4.length; _i8++) {
                    var _key3 = _Object$keys4[_i8];
                    normalizedHeaders[_key3.toLowerCase()] = builtHeaders[_key3];
                }
            }
            var xhr = new win.XMLHttpRequest;
            xhr.addEventListener("load", (function() {
                var responseHeaders = function(rawHeaders) {
                    void 0 === rawHeaders && (rawHeaders = "");
                    var result = {};
                    for (var _i2 = 0, _rawHeaders$trim$spli2 = rawHeaders.trim().split("\n"); _i2 < _rawHeaders$trim$spli2.length; _i2++) {
                        var _line$split = _rawHeaders$trim$spli2[_i2].split(":"), _key = _line$split[0], values = _line$split.slice(1);
                        result[_key.toLowerCase()] = values.join(":").trim();
                    }
                    return result;
                }(this.getAllResponseHeaders());
                if (!this.status) return reject(new Error("Request to " + method.toLowerCase() + " " + url + " failed: no response status code."));
                var contentType = responseHeaders["content-type"];
                var isJSON = contentType && (0 === contentType.indexOf("application/json") || 0 === contentType.indexOf("text/json"));
                var responseBody = this.responseText;
                try {
                    responseBody = JSON.parse(responseBody);
                } catch (err) {
                    if (isJSON) return reject(new Error("Invalid json: " + this.responseText + "."));
                }
                return resolve({
                    status: this.status,
                    headers: responseHeaders,
                    body: responseBody
                });
            }), !1);
            xhr.addEventListener("error", (function(evt) {
                reject(new Error("Request to " + method.toLowerCase() + " " + url + " failed: " + evt.toString() + "."));
            }), !1);
            xhr.open(method, url, !0);
            for (var _key4 in normalizedHeaders) normalizedHeaders.hasOwnProperty(_key4) && xhr.setRequestHeader(_key4, normalizedHeaders[_key4]);
            json ? body = JSON.stringify(json) : data && (body = Object.keys(data).map((function(key) {
                return encodeURIComponent(key) + "=" + (data ? encodeURIComponent(data[key]) : "");
            })).join("&"));
            xhr.timeout = timeout;
            xhr.ontimeout = function() {
                reject(new Error("Request to " + method.toLowerCase() + " " + url + " has timed out"));
            };
            xhr.send(body);
        }));
    }
    var AUTO_FLUSH_LEVEL = [ "warn", "error" ];
    var LOG_LEVEL_PRIORITY = [ "error", "warn", "info", "debug" ];
    var sendBeacon = function(_ref2) {
        var _ref2$win = _ref2.win, win = void 0 === _ref2$win ? window : _ref2$win, url = _ref2.url, data = _ref2.data, _ref2$useBlob = _ref2.useBlob, useBlob = void 0 === _ref2$useBlob || _ref2$useBlob;
        try {
            var json = JSON.stringify(data);
            if (!win.navigator.sendBeacon) throw new Error("No sendBeacon available");
            if (useBlob) {
                var blob = new Blob([ json ], {
                    type: "application/json"
                });
                return win.navigator.sendBeacon(url, blob);
            }
            return win.navigator.sendBeacon(url, json);
        } catch (e) {
            return !1;
        }
    };
    var extendIfDefined = function(target, source) {
        for (var key in source) source.hasOwnProperty(key) && (target[key] = source[key]);
    };
    function Logger(_ref) {
        var url = _ref.url, prefix = _ref.prefix, _ref$logLevel = _ref.logLevel, logLevel = void 0 === _ref$logLevel ? "warn" : _ref$logLevel, _ref$transport = _ref.transport, transport = void 0 === _ref$transport ? function(_ref) {
            var url = _ref.url, method = _ref.method, headers = _ref.headers, json = _ref.json, _ref$enableSendBeacon = _ref.enableSendBeacon, enableSendBeacon = void 0 !== _ref$enableSendBeacon && _ref$enableSendBeacon;
            return promise_ZalgoPromise.try((function() {
                var httpWindow = httpWin || window;
                var win = isSameDomain(httpWindow) ? function(win) {
                    if (!isSameDomain(win)) throw new Error("Expected window to be same domain");
                    return win;
                }(httpWindow) : window;
                var beaconResult = !1;
                (function(_ref) {
                    var headers = _ref.headers, enableSendBeacon = _ref.enableSendBeacon;
                    var hasHeaders = headers && Object.keys(headers).length;
                    return !!(window && window.navigator.sendBeacon && !hasHeaders && enableSendBeacon && window.Blob);
                })({
                    headers: headers,
                    enableSendBeacon: enableSendBeacon
                }) && (beaconResult = function(url) {
                    return "https://api2.amplitude.com/2/httpapi" === url;
                }(url) ? sendBeacon({
                    win: win,
                    url: url,
                    data: json,
                    useBlob: !1
                }) : sendBeacon({
                    win: win,
                    url: url,
                    data: json,
                    useBlob: !0
                }));
                return beaconResult || request({
                    win: win,
                    url: url,
                    method: method,
                    headers: headers,
                    json: json
                });
            })).then(src_util_noop);
        } : _ref$transport, amplitudeApiKey = _ref.amplitudeApiKey, _ref$flushInterval = _ref.flushInterval, flushInterval = void 0 === _ref$flushInterval ? 6e4 : _ref$flushInterval, _ref$enableSendBeacon = _ref.enableSendBeacon, enableSendBeacon = void 0 !== _ref$enableSendBeacon && _ref$enableSendBeacon;
        var httpWin;
        var events = [];
        var tracking = [];
        var metrics = [];
        var payloadBuilders = [];
        var metaBuilders = [];
        var trackingBuilders = [];
        var headerBuilders = [];
        function print(level, event, payload) {
            if (dom_isBrowser() && window.console && window.console.log && !(LOG_LEVEL_PRIORITY.indexOf(level) > LOG_LEVEL_PRIORITY.indexOf(logLevel))) {
                var args = [ event ];
                args.push(payload);
                (payload.error || payload.warning) && args.push("\n\n", payload.error || payload.warning);
                try {
                    window.console[level] && window.console[level].apply ? window.console[level].apply(window.console, args) : window.console.log && window.console.log.apply && window.console.log.apply(window.console, args);
                } catch (err) {}
            }
        }
        function immediateFlush() {
            return promise_ZalgoPromise.try((function() {
                if (dom_isBrowser() && "file:" !== window.location.protocol && (events.length || tracking.length || metrics.length)) {
                    var meta = {};
                    for (var _i2 = 0; _i2 < metaBuilders.length; _i2++) extendIfDefined(meta, (0, metaBuilders[_i2])(meta));
                    var headers = {};
                    for (var _i4 = 0; _i4 < headerBuilders.length; _i4++) extendIfDefined(headers, (0, 
                    headerBuilders[_i4])(headers));
                    var res;
                    url && (res = transport({
                        method: "POST",
                        url: url,
                        headers: headers,
                        json: {
                            events: events,
                            meta: meta,
                            tracking: tracking,
                            metrics: metrics
                        },
                        enableSendBeacon: enableSendBeacon
                    }).catch(src_util_noop));
                    amplitudeApiKey && transport({
                        method: "POST",
                        url: "https://api2.amplitude.com/2/httpapi",
                        headers: {},
                        json: {
                            api_key: amplitudeApiKey,
                            events: tracking.map((function(payload) {
                                return _extends({
                                    event_type: payload.transition_name || "event",
                                    event_properties: payload
                                }, payload);
                            }))
                        },
                        enableSendBeacon: enableSendBeacon
                    }).catch(src_util_noop);
                    events = [];
                    tracking = [];
                    metrics = [];
                    return promise_ZalgoPromise.resolve(res).then(src_util_noop);
                }
            }));
        }
        var flush = function(method, delay) {
            void 0 === delay && (delay = 50);
            var promise;
            var timeout;
            return setFunctionName((function() {
                timeout && clearTimeout(timeout);
                var localPromise = promise = promise || new promise_ZalgoPromise;
                timeout = setTimeout((function() {
                    promise = null;
                    timeout = null;
                    promise_ZalgoPromise.try(method).then((function(result) {
                        localPromise.resolve(result);
                    }), (function(err) {
                        localPromise.reject(err);
                    }));
                }), delay);
                return localPromise;
            }), getFunctionName(method) + "::promiseDebounced");
        }(immediateFlush);
        function log(level, event, payload) {
            void 0 === payload && (payload = {});
            if (!dom_isBrowser()) return logger;
            prefix && (event = prefix + "_" + event);
            var logPayload = _extends({}, objFilter(payload), {
                timestamp: Date.now().toString()
            });
            for (var _i6 = 0; _i6 < payloadBuilders.length; _i6++) extendIfDefined(logPayload, (0, 
            payloadBuilders[_i6])(logPayload));
            !function(level, event, payload) {
                events.push({
                    level: level,
                    event: event,
                    payload: payload
                });
                -1 !== AUTO_FLUSH_LEVEL.indexOf(level) && flush();
            }(level, event, logPayload);
            print(level, event, logPayload);
            return logger;
        }
        function addBuilder(builders, builder) {
            builders.push(builder);
            return logger;
        }
        dom_isBrowser() && (method = flush, time = flushInterval, function loop() {
            setTimeout((function() {
                method();
                loop();
            }), time);
        }());
        var method, time;
        if ("object" == typeof window) {
            window.addEventListener("beforeunload", (function() {
                immediateFlush();
            }));
            window.addEventListener("unload", (function() {
                immediateFlush();
            }));
            window.addEventListener("pagehide", (function() {
                immediateFlush();
            }));
        }
        var logger = {
            debug: function(event, payload) {
                return log("debug", event, payload);
            },
            info: function(event, payload) {
                return log("info", event, payload);
            },
            warn: function(event, payload) {
                return log("warn", event, payload);
            },
            error: function(event, payload) {
                return log("error", event, payload);
            },
            track: function(payload) {
                void 0 === payload && (payload = {});
                if (!dom_isBrowser()) return logger;
                var trackingPayload = objFilter(payload);
                for (var _i8 = 0; _i8 < trackingBuilders.length; _i8++) extendIfDefined(trackingPayload, (0, 
                trackingBuilders[_i8])(trackingPayload));
                print("debug", "track", trackingPayload);
                tracking.push(trackingPayload);
                return logger;
            },
            metric: function(metricPayload) {
                if (!dom_isBrowser()) return logger;
                print("debug", "metric." + metricPayload.name, metricPayload.dimensions || {});
                metrics.push(metricPayload);
                return logger;
            },
            flush: flush,
            immediateFlush: immediateFlush,
            addPayloadBuilder: function(builder) {
                return addBuilder(payloadBuilders, builder);
            },
            addMetaBuilder: function(builder) {
                return addBuilder(metaBuilders, builder);
            },
            addTrackingBuilder: function(builder) {
                return addBuilder(trackingBuilders, builder);
            },
            addHeaderBuilder: function(builder) {
                return addBuilder(headerBuilders, builder);
            },
            setTransport: function(newTransport) {
                transport = newTransport;
                return logger;
            },
            configure: function(opts) {
                opts.url && (url = opts.url);
                opts.prefix && (prefix = opts.prefix);
                opts.logLevel && (logLevel = opts.logLevel);
                opts.transport && (transport = opts.transport);
                opts.amplitudeApiKey && (amplitudeApiKey = opts.amplitudeApiKey);
                opts.flushInterval && (flushInterval = opts.flushInterval);
                opts.enableSendBeacon && (enableSendBeacon = opts.enableSendBeacon);
                return logger;
            },
            __buffer__: {
                get events() {
                    return events;
                },
                get tracking() {
                    return tracking;
                },
                get metrics() {
                    return metrics;
                }
            }
        };
        Object.defineProperty(logger, "__buffer__", {
            writable: !1
        });
        return logger;
    }
    var _FUNDING_SKIP_LOGIN, _AMPLITUDE_API_KEY;
    var ORDERS_API_URL = "/v2/checkout/orders";
    (_FUNDING_SKIP_LOGIN = {}).paypal = "paypal", _FUNDING_SKIP_LOGIN.paylater = "paypal", 
    _FUNDING_SKIP_LOGIN.credit = "paypal";
    (_AMPLITUDE_API_KEY = {}).test = "a23fb4dfae56daf7c3212303b53a8527", _AMPLITUDE_API_KEY.local = "a23fb4dfae56daf7c3212303b53a8527", 
    _AMPLITUDE_API_KEY.stage = "a23fb4dfae56daf7c3212303b53a8527", _AMPLITUDE_API_KEY.sandbox = "a23fb4dfae56daf7c3212303b53a8527", 
    _AMPLITUDE_API_KEY.production = "ce423f79daba95faeb0694186170605c";
    function getLogger() {
        return inlineMemoize(getLogger, (function() {
            return Logger({
                url: "/xoplatform/logger/api/logger",
                enableSendBeacon: !0
            });
        }));
    }
    function unresolvedPromise() {
        return new promise_ZalgoPromise(src_util_noop);
    }
    function promiseNoop() {
        return promise_ZalgoPromise.resolve();
    }
    function util_getBody() {
        var body = document.body;
        if (!body) throw new Error("Document body not found");
        return body;
    }
    function loadScript(url) {
        return new promise_ZalgoPromise((function(resolve, reject) {
            var container = document.body || document.head;
            if (!container) return reject(new Error("Can not find container for script: " + url));
            var script = document.createElement("script");
            script.setAttribute("src", url);
            script.addEventListener("load", (function() {
                return resolve(script);
            }));
            script.addEventListener("error", (function(err) {
                return reject(err);
            }));
            container.appendChild(script);
        }));
    }
    function isEmailAddress(str) {
        return Boolean(str.match(/^.+@.+\..+$/));
    }
    function getSDKStorage() {
        return getStorage({
            name: "paypal",
            lifetime: 36e5
        });
    }
    function getPostRobot() {
        var paypal = function() {
            if (!window.paypal) throw new Error("paypal not found");
            return window.paypal;
        }();
        if (!paypal.postRobot) throw new Error("paypal.postRobot not found");
        return paypal.postRobot;
    }
    var dist = __webpack_require__(0);
    var dist_default = __webpack_require__.n(dist);
    var _CARD_FIELD_TYPE_TO_F, _VALIDATOR_TO_TYPE_MA;
    var types = dist_default.a.creditCardType.types;
    var CARD_FIELD_TYPE_TO_FRAME_NAME = ((_CARD_FIELD_TYPE_TO_F = {}).single = "card-field", 
    _CARD_FIELD_TYPE_TO_F.number = "card-number-field", _CARD_FIELD_TYPE_TO_F.cvv = "card-cvv-field", 
    _CARD_FIELD_TYPE_TO_F.expiry = "card-expiry-field", _CARD_FIELD_TYPE_TO_F.name = "card-name-field", 
    _CARD_FIELD_TYPE_TO_F.postal = "card-postal-field", _CARD_FIELD_TYPE_TO_F);
    var OPTIONAL_CARD_FIELDS = [ "name" ];
    var FIELD_STYLE = {
        appearance: "appearance",
        color: "color",
        direction: "direction",
        font: "font",
        fontFamily: "font-family",
        fontSizeAdjust: "font-size-adjust",
        fontSize: "font-size",
        fontStretch: "font-stretch",
        fontStyle: "font-style",
        fontVariantAlternates: "font-variant-alternates",
        fontVariantCaps: "font-variant-caps",
        fontVariantEastAsian: "font-variant-east-asian",
        fontVariantLigatures: "font-variant-ligatures",
        fontVariantNumeric: "font-variant-numeric",
        fontVariant: "font-variant",
        fontWeight: "font-weight",
        letterSpacing: "letter-spacing",
        lineHeight: "line-height",
        opacity: "opacity",
        outline: "outline",
        padding: "padding",
        paddingTop: "padding-top",
        paddingRight: "padding-right",
        paddingBottom: "padding-bottom",
        paddingLeft: "padding-left",
        textShadow: "text-shadow",
        transition: "transition",
        MozApperance: "-moz-appearance",
        MozOsxFontSmoothing: "-moz-osx-font-smoothing",
        MozTapHighlightColor: "-moz-tap-highlight-color",
        MozTransition: "-moz-transition",
        WebkitAppearance: "-webkit-appearance",
        WebkitOsxFontSmoothing: "-webkit-osx-font-smoothing",
        WebkitTapHighlightColor: "-webkit-tap-highlight-color",
        WebkitTransition: "-webkit-transition"
    };
    var FILTER_CSS_VALUES = [ /;/, /[<>]/, /\\/, /@import/i, /expression/i, /javascript/i, /url/i ];
    var FILTER_CSS_SELECTORS = [ /^\s*$/, /supports/i, /import/i, /[{}]/, /</ ];
    var VALIDATOR_TO_TYPE_MAP = ((_VALIDATOR_TO_TYPE_MA = {})[types.AMERICAN_EXPRESS] = "amex", 
    _VALIDATOR_TO_TYPE_MA[types.DISCOVER] = "discover", _VALIDATOR_TO_TYPE_MA[types.ELO] = "elo", 
    _VALIDATOR_TO_TYPE_MA[types.HIPER] = "hiper", _VALIDATOR_TO_TYPE_MA[types.JCB] = "jcb", 
    _VALIDATOR_TO_TYPE_MA[types.MASTERCARD] = "mastercard", _VALIDATOR_TO_TYPE_MA[types.UNIONPAY] = "cup", 
    _VALIDATOR_TO_TYPE_MA[types.VISA] = "visa", _VALIDATOR_TO_TYPE_MA);
    var DEFAULT_CARD_TYPE = {
        gaps: [ 4, 8, 12 ],
        lengths: [ 16 ],
        patterns: [],
        type: "unknown",
        niceType: "Unknown",
        code: {
            name: "CVV",
            size: 3
        }
    };
    var DEFAULT_STYLE = {
        "html, body": {
            background: "transparent",
            "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif'
        },
        body: {
            margin: "0",
            padding: "0.375rem"
        },
        input: {
            border: "0.0625rem solid #909697",
            "border-radius": "0.25rem",
            "box-sizing": "border-box",
            background: "#ffffff",
            "font-family": "inherit",
            "font-size": "1.125rem",
            "line-height": "1.5rem",
            padding: "1.25rem 0.75rem",
            width: "100%"
        },
        "::placeholder": {
            color: "#687173",
            opacity: "1"
        },
        ".card-icons": {
            display: "none"
        },
        ".card-icon": {
            width: "40px",
            height: "24px",
            "pointer-events": "none",
            position: "absolute",
            top: "1.6875rem",
            left: "1.1875rem"
        },
        "input.card-field-number.display-icon": {
            "padding-left": "calc(1.2rem + 40px)"
        },
        "input.card-field-number.display-icon + .card-icon": {
            display: "block"
        },
        "input.card-field-number + .card-icon": {
            display: "none"
        }
    };
    var DEFAULT_STYLE_MULTI_CARD = {
        ":focus": {
            "border-color": "#000000",
            "box-shadow": "0 0 0 0.125rem #000000 inset, 0 0 0 0.375rem rgb(0 0 0 / 16%)",
            outline: "none"
        },
        ":focus.invalid": {
            "border-color": "#d9360b",
            "box-shadow": "0 0 0 0.125rem #d9360b inset, 0 0 0 0.375rem rgb(217 54 11 / 16%)"
        },
        ".invalid": {
            "border-color": "#d9360b",
            "box-shadow": "0 0 0 0.0625rem #d9360b inset",
            color: "#d9360b"
        }
    };
    var DEFAULT_STYLE_SINGLE_CARD = {
        ".card-field": {
            background: "#ffffff",
            border: "0.0625rem solid #909697",
            "border-radius": "0.25rem",
            "box-sizing": "border-box",
            display: "flex",
            "flex-direction": "row",
            margin: "0",
            padding: "0"
        },
        ".focus": {
            "border-color": "#000000",
            "box-shadow": "0 0 0 0.125rem #000000 inset, 0 0 0 0.375rem rgb(0 0 0 / 16%)"
        },
        ".focus.invalid": {
            "border-color": "#d9360b",
            "box-shadow": "0 0 0 0.125rem #d9360b inset, 0 0 0 0.375rem rgb(217 54 11 / 16%)"
        },
        ".invalid": {
            "border-color": "#d9360b",
            "box-shadow": "0 0 0 0.0625rem #d9360b inset",
            color: "#d9360b"
        },
        input: {
            background: "transparent",
            border: "none",
            "border-radius": "unset",
            "box-sizing": "content-box",
            margin: "0"
        },
        "input, input:focus": {
            border: "none",
            "box-shadow": "none",
            outline: "none"
        },
        "input.invalid": {
            border: "none",
            "box-shadow": "none"
        },
        "input.card-field-number": {
            flex: "1",
            "min-width": "4ch",
            "padding-right": "0.375rem"
        },
        "input.card-field-expiry": {
            "padding-left": "0.375rem",
            "padding-right": "0.375rem",
            "text-align": "center",
            width: "7ch"
        },
        "input.card-field-cvv": {
            "padding-left": "0.375rem",
            "text-align": "center",
            width: "4ch"
        },
        ".card-field-validation-error": {
            "align-items": "center",
            color: "#515354",
            display: "flex",
            "font-size": "0.875rem",
            "margin-top": "0.375rem"
        },
        ".card-field-validation-error > svg": {
            color: "#d9360b",
            width: "24px",
            height: "24px",
            "margin-right": "0.25rem"
        },
        ".card-field-validation-error.hidden": {
            visibility: "hidden"
        }
    };
    var VALID_EXTRA_FIELDS = [ "billingAddress" ];
    var ALLOWED_ATTRIBUTES = [ "aria-invalid", "aria-required", "disabled", "placeholder" ];
    var belter = __webpack_require__(2);
    var defaultInputState = {
        inputValue: "",
        maskedInputValue: "",
        cursorStart: 0,
        cursorEnd: 0,
        isFocused: !1,
        keyStrokeCount: 0,
        isPotentiallyValid: !0,
        isValid: !1
    };
    var initFieldValidity = {
        isValid: !1,
        isPotentiallyValid: !0
    };
    function splice(str, idx, insert) {
        return str.slice(0, idx) + insert + str.slice(idx);
    }
    function assertType(assertion, errorMsg) {
        if (!assertion) throw new TypeError(errorMsg);
    }
    function removeSpaces(value) {
        return value.replace(/\s/g, "");
    }
    function isValidValue(value) {
        return !FILTER_CSS_VALUES.some((function(regex) {
            return regex.test(String(value));
        }));
    }
    function isValidAttribute(attribute) {
        if (!ALLOWED_ATTRIBUTES.includes(attribute.toLocaleLowerCase())) {
            getLogger().warn("attribute_warning", {
                warn: 'HTML Attribute "' + attribute + '" was ignored. See allowed attribute list.'
            });
            return !1;
        }
        return !0;
    }
    function styleToString(style) {
        void 0 === style && (style = {});
        var s = [];
        Object.keys(style).forEach((function(key) {
            var value = style[key];
            if ("string" == typeof value || "number" == typeof value) s.push(" " + key + ": " + value + ";"); else if ("object" == typeof value) {
                s.push(key + " {");
                s.push(styleToString(value));
                s.push("}");
            }
        }));
        return s.join("\n");
    }
    function getCSSText(cardFieldStyle, customStyle) {
        var s = [];
        s.push("/* default style */");
        s.push(styleToString(DEFAULT_STYLE));
        s.push(styleToString(cardFieldStyle));
        s.push("/* custom style */");
        s.push(styleToString(function filterStyle(style) {
            var result = {};
            Object.keys(style).forEach((function(key) {
                var value = style[key];
                if ("string" == typeof value || "number" == typeof value) {
                    var property;
                    if (FIELD_STYLE[key]) {
                        property = FIELD_STYLE[key];
                        isValidValue(value) && (result[property] = value);
                    } else if (Object(belter.values)(FIELD_STYLE).includes(key.toLowerCase())) {
                        property = key.toLowerCase();
                        isValidValue(value) && (result[property] = value);
                    } else getLogger().warn("style_warning", {
                        warn: 'CSS property "' + key + '" was ignored. See allowed CSS property list.'
                    });
                } else "object" == typeof value && ((selector = key, FILTER_CSS_SELECTORS.some((function(regex) {
                    return regex.test(selector);
                }))) || (result[key] = filterStyle(value)));
                var selector;
            }));
            return result;
        }(customStyle)));
        return s.join("\n");
    }
    function markValidity(ref, validity, hasFocus, touched) {
        var _ref$current;
        var element = null == ref || null == (_ref$current = ref.current) ? void 0 : _ref$current.base;
        if (element) if (function(element) {
            return OPTIONAL_CARD_FIELDS.includes(element.name);
        }(element) && 0 === element.value.length) {
            element.classList.remove("valid");
            element.classList.remove("invalid");
        } else if (validity.isValid || validity.isPotentiallyValid && hasFocus) {
            element.classList.add("valid");
            element.classList.remove("invalid");
        } else if (touched) {
            element.classList.add("invalid");
            element.classList.remove("valid");
        }
    }
    function removeNonDigits(value) {
        return removeSpaces(value).replace(/\D/g, "");
    }
    function convertDateFormat(date) {
        var trimmedDate = removeSpaces(date);
        var splittedDate = trimmedDate.split("/");
        var formattedDate = trimmedDate;
        if (splittedDate[1] && 2 === splittedDate[1].length) {
            splittedDate[1] = "20" + splittedDate[1];
            formattedDate = splittedDate.join("/");
        }
        return formattedDate;
    }
    function parsedCardType(potentialCardTypes) {
        return potentialCardTypes.map((function(_ref2) {
            return {
                type: _ref2.type,
                niceType: _ref2.niceType,
                code: _ref2.code
            };
        }));
    }
    function getContext(win) {
        var _win$xprops, _win$xprops$parent, _win$xprops2;
        return (null == (_win$xprops = win.xprops) || null == (_win$xprops$parent = _win$xprops.parent) ? void 0 : _win$xprops$parent.uid) || (null == (_win$xprops2 = win.xprops) ? void 0 : _win$xprops2.uid);
    }
    function cardExpiryToPaymentSourceExpiry(dateString) {
        if (!dateString || "string" != typeof dateString) throw new Error("can not convert invalid expiry date: " + dateString);
        if (dateString.match("^[0-9]{4}-([1-9]|0[1-9]|1[0-2])$")) return dateString;
        if (dateString.match("^([1-9]|0[1-9]|1[0-2])/?([0-9]{4}|[0-9]{2})$")) {
            var _dateString$split = dateString.split("/"), monthString = _dateString$split[0], yearString = _dateString$split[1];
            return (2 === yearString.length ? "20" + yearString : yearString) + "-" + (1 === monthString.length ? "0" + monthString : monthString);
        }
        throw new Error("can not convert invalid expiry date: " + dateString);
    }
    function convertCardToPaymentSource(card, extraFields) {
        var paymentSource = {
            card: {
                number: card.number,
                securityCode: card.cvv,
                expiry: cardExpiryToPaymentSourceExpiry(card.expiry)
            }
        };
        extraFields && 0 !== Object.keys(extraFields).length && (paymentSource.card.billingAddress = extraFields.billingAddress);
        card.name && (paymentSource.card.name = card.name);
        card.postalCode && (paymentSource.card.billingAddress = {
            postalCode: card.postalCode
        });
        return paymentSource;
    }
    function kebabToCamelCase(field) {
        var camelCase = field.split("-");
        camelCase.forEach((function(word, i) {
            camelCase[i] = 0 !== i ? word.toLowerCase().replace(/^\w/, (function(c) {
                return c.toUpperCase();
            })) : word.toLowerCase();
        }));
        return camelCase.join("");
    }
    function reformatBillingKeys(str) {
        return str.replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/([a-z\d])(\d)/g, "$1_$2").toLowerCase();
    }
    dist_default.a.creditCardType.addCard({
        code: {
            name: "CVV",
            size: 3
        },
        gaps: [ 4, 8, 12 ],
        lengths: [ 16, 18, 19 ],
        niceType: "Carte Bancaire",
        patterns: [],
        type: "cb-nationale"
    });
    dist_default.a.creditCardType.addCard({
        code: {
            name: "CVV",
            size: 3
        },
        gaps: [ 4, 8, 12, 16 ],
        lengths: [ 19 ],
        niceType: "Carte Aurore",
        patterns: [],
        type: "cetelem"
    });
    dist_default.a.creditCardType.addCard({
        code: {
            name: "",
            size: 0
        },
        gaps: [ 4, 8, 12, 16 ],
        lengths: [ 17 ],
        niceType: "Cofinoga ou Privilège",
        patterns: [],
        type: "cofinoga"
    });
    dist_default.a.creditCardType.addCard({
        code: {
            name: "",
            size: 0
        },
        gaps: [ 4, 8 ],
        lengths: [ 8, 9 ],
        niceType: "4 étoiles",
        patterns: [],
        type: "cofidis"
    });
    function detectCardType(cardNumber) {
        if (cardNumber.length > 0) {
            var cardTypes = dist_default.a.creditCardType.default(cardNumber);
            if (cardTypes.length > 0) return cardTypes;
        }
        return [ DEFAULT_CARD_TYPE ];
    }
    function addGapsToCardNumber(cardNumber, cardType) {
        var _detectCardType$;
        !function() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            assertType(args.every((function(s) {
                return "string" == typeof s;
            })), "Expected a string");
        }(cardNumber);
        cardNumber = cardNumber.trim().replace(/[^0-9]/g, "").replace(/\s/g, "");
        var gaps = (null == cardType ? void 0 : cardType.gaps) || (null == (_detectCardType$ = detectCardType(cardNumber)[0]) ? void 0 : _detectCardType$.gaps);
        if (gaps) for (var idx = 0; idx < gaps.length; idx++) {
            var splicePoint = gaps[idx] + idx;
            if (splicePoint > cardNumber.length - 1) break;
            cardNumber = splice(cardNumber, splicePoint, " ");
        }
        return cardNumber;
    }
    function checkCardEligibility(cardNumber, cardType, isVaultFlow) {
        var _fundingEligibility$c;
        var fundingEligibility = window.xprops.fundingEligibility;
        var type = VALIDATOR_TO_TYPE_MAP[cardType.type];
        if (0 === cardNumber.length) return !0;
        if (null != fundingEligibility && null != (_fundingEligibility$c = fundingEligibility.card) && _fundingEligibility$c.eligible && type && fundingEligibility.card.vendors && !fundingEligibility.card.branded) {
            var vendor = fundingEligibility.card.vendors[type];
            if (isVaultFlow && null != vendor && vendor.vaultable) return !0;
            if (!isVaultFlow && null != vendor && vendor.eligible) return !0;
        }
        return !1;
    }
    var defaultNavigation = {
        next: function() {
            return belter.noop;
        },
        previous: function() {
            return belter.noop;
        }
    };
    function moveCursor(element, start, end) {
        window.requestAnimationFrame((function() {
            element.selectionStart = start;
            element.selectionEnd = null != end ? end : start;
        }));
    }
    function goToNextField(ref) {
        return function() {
            moveCursor(ref.current.base, 0);
            setTimeout((function() {
                return ref.current.base.focus();
            }));
        };
    }
    function goToPreviousField(ref) {
        return function() {
            var value = ref.current.base.value;
            value && moveCursor(ref.current.base, value.length);
            setTimeout((function() {
                return ref.current.base.focus();
            }));
        };
    }
    function navigateOnKeyDown(event, navigation) {
        var _event$target = event.target, value = _event$target.value, selectionStart = _event$target.selectionStart, key = event.key;
        0 !== selectionStart || 0 !== value.length && value.length === _event$target.selectionEnd || ![ "Backspace", "ArrowLeft" ].includes(key) || navigation.previous();
        selectionStart === value.length && [ "ArrowRight" ].includes(key) && navigation.next();
    }
    function exportMethods(ref, setAttributes, setInputState, ariaMessageRef) {
        window.xprops.export({
            setAttribute: function(name, value) {
                isValidAttribute(name) && setAttributes((function(currentAttributes) {
                    var _extends2;
                    return _extends({}, currentAttributes, ((_extends2 = {})[name] = value, _extends2));
                }));
            },
            removeAttribute: function(name) {
                isValidAttribute(name) && setAttributes((function(currentAttributes) {
                    var _extends3;
                    return _extends({}, currentAttributes, ((_extends3 = {})[name] = "", _extends3));
                }));
            },
            addClass: function(name) {
                var _ref$current;
                null == ref || null == (_ref$current = ref.current) || _ref$current.classList.add(name);
            },
            removeClass: function(name) {
                var _ref$current2;
                null == ref || null == (_ref$current2 = ref.current) || _ref$current2.classList.remove(name);
            },
            clear: function() {
                ref && ref.current && "function" == typeof setInputState && setInputState((function(currentInputState) {
                    return _extends({}, currentInputState, {
                        inputValue: ""
                    });
                }));
            },
            focus: function() {
                var _ref$current3;
                null == ref || null == (_ref$current3 = ref.current) || _ref$current3.focus();
            },
            setMessage: function(message) {
                ariaMessageRef.current.innerText = message;
            }
        });
    }
    function getExportsByFrameName(name) {
        try {
            for (var _i2 = 0, _getAllFramesInWindow2 = function(win) {
                var top = function(win) {
                    void 0 === win && (win = window);
                    try {
                        if (win.top) return win.top;
                    } catch (err) {}
                    if (utils_getParent(win) === win) return win;
                    try {
                        if (isAncestorParent(window, win) && window.top) return window.top;
                    } catch (err) {}
                    try {
                        if (isAncestorParent(win, window) && window.top) return window.top;
                    } catch (err) {}
                    for (var _i7 = 0, _getAllChildFrames4 = getAllChildFrames(win); _i7 < _getAllChildFrames4.length; _i7++) {
                        var frame = _getAllChildFrames4[_i7];
                        try {
                            if (frame.top) return frame.top;
                        } catch (err) {}
                        if (utils_getParent(frame) === frame) return frame;
                    }
                }(win);
                if (!top) throw new Error("Can not determine top window");
                var result = [].concat(getAllChildFrames(top), [ top ]);
                -1 === result.indexOf(win) && (result = [].concat(result, [ win ], getAllChildFrames(win)));
                return result;
            }(window); _i2 < _getAllFramesInWindow2.length; _i2++) {
                var win = _getAllFramesInWindow2[_i2];
                if (isSameDomain(win) && win.exports && win.exports.name === name) return win.exports;
            }
        } catch (err) {}
    }
    function getCardFrames() {
        return {
            cardFrame: getExportsByFrameName("card-field"),
            cardNumberFrame: getExportsByFrameName("card-number-field"),
            cardCVVFrame: getExportsByFrameName("card-cvv-field"),
            cardExpiryFrame: getExportsByFrameName("card-expiry-field"),
            cardNameFrame: getExportsByFrameName("card-name-field"),
            cardPostalFrame: getExportsByFrameName("card-postal-field")
        };
    }
    function getCardFields(isVaultFlow) {
        void 0 === isVaultFlow && (isVaultFlow = !1);
        var card = {};
        var cardFrame = getExportsByFrameName("card-field");
        if (cardFrame && cardFrame.isFieldValid()) return cardFrame.getFieldValue();
        var _getCardFrames = getCardFrames(), cardNumberFrame = _getCardFrames.cardNumberFrame, cardCVVFrame = _getCardFrames.cardCVVFrame, cardExpiryFrame = _getCardFrames.cardExpiryFrame, cardNameFrame = _getCardFrames.cardNameFrame, cardPostalFrame = _getCardFrames.cardPostalFrame;
        if (!cardNumberFrame || !cardNumberFrame.isFieldValid()) throw new Error("INVALID_NUMBER");
        var cardNumber = cardNumberFrame.getFieldValue();
        if (!checkCardEligibility(cardNumber, cardNumberFrame.getPotentialCardTypes()[0], isVaultFlow)) throw new Error("INELIGIBLE_CARD_VENDOR");
        card.number = cardNumber;
        if (!cardCVVFrame || !cardCVVFrame.isFieldValid()) throw new Error("INVALID_CVV");
        card.cvv = cardCVVFrame.getFieldValue();
        if (!cardExpiryFrame || !cardExpiryFrame.isFieldValid()) throw new Error("INVALID_EXPIRY");
        card.expiry = cardExpiryFrame.getFieldValue();
        if (cardNameFrame) {
            var cardNameValue = cardNameFrame.getFieldValue();
            if (cardNameFrame.isFieldValid()) card.name = cardNameValue; else if (0 !== cardNameValue.length) throw new Error("INVALID_NAME");
        }
        if (cardPostalFrame) {
            var postalCodeValue = cardPostalFrame.getFieldValue();
            if (cardPostalFrame.isFieldValid()) card.name = postalCodeValue; else if (0 !== postalCodeValue.length) throw new Error("INVALID_POSTAL");
        }
        return card;
    }
    function isEmpty(value) {
        return 0 === value.length;
    }
    function getCardFieldState() {
        var _getCardFrames = getCardFrames(), cardNumberFrame = _getCardFrames.cardNumberFrame, cardCVVFrame = _getCardFrames.cardCVVFrame, cardExpiryFrame = _getCardFrames.cardExpiryFrame;
        var optionalFields = {};
        [ _getCardFrames.cardNameFrame, _getCardFrames.cardPostalFrame ].forEach((function(cardFrame) {
            cardFrame && (optionalFields[kebabToCamelCase(cardFrame.name)] = {
                isEmpty: isEmpty(null == cardFrame ? void 0 : cardFrame.getFieldValue()),
                isValid: null == cardFrame ? void 0 : cardFrame.isFieldValid(),
                isPotentiallyValid: cardFrame.isFieldPotentiallyValid(),
                isFocused: cardFrame.isFieldFocused()
            });
        }));
        return {
            cards: parsedCardType(cardNumberFrame.getPotentialCardTypes()),
            fields: _extends({}, optionalFields, {
                cardNumberField: {
                    isEmpty: isEmpty(cardNumberFrame.getFieldValue()),
                    isValid: cardNumberFrame.isFieldValid(),
                    isPotentiallyValid: cardNumberFrame.isFieldPotentiallyValid(),
                    isFocused: cardNumberFrame.isFieldFocused()
                },
                cardExpiryField: {
                    isEmpty: isEmpty(cardExpiryFrame.getFieldValue()),
                    isValid: cardExpiryFrame.isFieldValid(),
                    isPotentiallyValid: cardExpiryFrame.isFieldPotentiallyValid(),
                    isFocused: cardExpiryFrame.isFieldFocused()
                },
                cardCvvField: {
                    isEmpty: isEmpty(cardCVVFrame.getFieldValue()),
                    isValid: cardCVVFrame.isFieldValid(),
                    isPotentiallyValid: cardCVVFrame.isFieldPotentiallyValid(),
                    isFocused: cardCVVFrame.isFieldFocused()
                }
            })
        };
    }
    var getFieldErrors_getFieldErrors = function(fields) {
        var errors = [];
        Object.keys(fields).forEach((function(field) {
            if (fields[field] && !fields[field].isValid) switch (field) {
              case kebabToCamelCase("card-name-field"):
                errors.push("INVALID_NAME");
                break;

              case kebabToCamelCase("card-number-field"):
                errors.push("INVALID_NUMBER");
                break;

              case kebabToCamelCase("card-expiry-field"):
                errors.push("INVALID_EXPIRY");
                break;

              case kebabToCamelCase("card-cvv-field"):
                errors.push("INVALID_CVV");
                break;

              case kebabToCamelCase("card-postal-field"):
                errors.push("INVALID_POSTAL");
            }
        }));
        return errors;
    };
    function gql_resetGQLErrors() {
        var _getCardFrames = getCardFrames(), cardFrame = _getCardFrames.cardFrame, cardNumberFrame = _getCardFrames.cardNumberFrame, cardExpiryFrame = _getCardFrames.cardExpiryFrame, cardCVVFrame = _getCardFrames.cardCVVFrame;
        cardFrame && cardFrame.resetGQLErrors();
        cardNumberFrame && cardNumberFrame.resetGQLErrors();
        cardExpiryFrame && cardExpiryFrame.resetGQLErrors();
        cardCVVFrame && cardCVVFrame.resetGQLErrors();
    }
    function emitGqlErrors(errorsMap) {
        var _getCardFrames2 = getCardFrames(), cardFrame = _getCardFrames2.cardFrame, cardNumberFrame = _getCardFrames2.cardNumberFrame, cardExpiryFrame = _getCardFrames2.cardExpiryFrame, cardCVVFrame = _getCardFrames2.cardCVVFrame;
        var number = errorsMap.number, expiry = errorsMap.expiry, security_code = errorsMap.security_code;
        if (cardFrame) {
            var cardFieldError = {
                field: "",
                errors: []
            };
            number && (cardFieldError = {
                field: "number",
                errors: number
            });
            expiry && (cardFieldError = {
                field: "expiry",
                errors: expiry
            });
            security_code && (cardFieldError = {
                field: "cvv",
                errors: security_code
            });
            cardFrame.setGqlErrors(cardFieldError);
        }
        cardNumberFrame && number && cardNumberFrame.setGqlErrors({
            field: "number",
            errors: number
        });
        cardExpiryFrame && expiry && cardExpiryFrame.setGqlErrors({
            field: "expiry",
            errors: expiry
        });
        cardCVVFrame && security_code && cardCVVFrame.setGqlErrors({
            field: "cvv",
            errors: security_code
        });
    }
    function hasCardFields() {
        var _getCardFrames = getCardFrames();
        return Boolean(_getCardFrames.cardFrame || _getCardFrames.cardNumberFrame && _getCardFrames.cardCVVFrame && _getCardFrames.cardExpiryFrame);
    }
    function getOnError(_ref) {
        var onError = _ref.onError;
        var onErrorHandler = onError ? (handler = onError, seenErrors = [], seenStringifiedErrors = {}, 
        function(err) {
            if (-1 === seenErrors.indexOf(err)) {
                seenErrors.push(err);
                var stringifiedError = stringifyError(err);
                if (!seenStringifiedErrors[stringifiedError]) {
                    seenStringifiedErrors[stringifiedError] = !0;
                    return handler(err);
                }
            }
        }) : src_util_noop;
        var handler, seenErrors, seenStringifiedErrors;
        return function(err) {
            return promise_ZalgoPromise.try((function() {
                return onErrorHandler(err);
            }));
        };
    }
    function callRestAPI(_ref) {
        var _extends2;
        var accessToken = _ref.accessToken, method = _ref.method, url = _ref.url, data = _ref.data, headers = _ref.headers, eventName = _ref.eventName;
        if (!accessToken) throw new Error("No access token passed to " + url);
        var requestHeaders = _extends(((_extends2 = {}).authorization = "Bearer " + accessToken, 
        _extends2["content-type"] = "application/json", _extends2), headers);
        return request({
            method: method,
            url: url,
            headers: requestHeaders,
            json: data
        }).then((function(_ref2) {
            var status = _ref2.status, body = _ref2.body, responseHeaders = _ref2.headers;
            if (status >= 300) {
                var error = new Error(url + " returned status " + status + " (Corr ID: " + responseHeaders["paypal-debug-id"] + ").\n\n" + JSON.stringify(body));
                error.response = {
                    status: status,
                    headers: responseHeaders,
                    body: body
                };
                if (429 === status) {
                    var _getLogger$track;
                    getLogger().track(((_getLogger$track = {}).transition_name = "call_rest_api", _getLogger$track.int_error_desc = "Error: " + status + " - " + body, 
                    _getLogger$track.info_msg = "URL: " + url, _getLogger$track));
                }
                eventName && getLogger().warn("rest_api_" + eventName + "_error");
                throw error;
            }
            return body;
        }));
    }
    function callSmartAPI(_ref3) {
        var accessToken = _ref3.accessToken, url = _ref3.url, _ref3$method = _ref3.method, method = void 0 === _ref3$method ? "get" : _ref3$method, _ref3$headers = _ref3.headers, reqHeaders = void 0 === _ref3$headers ? {} : _ref3$headers, json = _ref3.json, _ref3$authenticated = _ref3.authenticated, authenticated = void 0 === _ref3$authenticated || _ref3$authenticated, eventName = _ref3.eventName;
        reqHeaders["x-requested-by"] = "smart-payment-buttons";
        if (authenticated && !accessToken) throw new Error("Buyer access token not present - can not call smart api: " + url);
        accessToken && (reqHeaders["x-paypal-internal-euat"] = accessToken);
        return request({
            url: url,
            method: method,
            headers: reqHeaders,
            json: json
        }).then((function(_ref4) {
            var status = _ref4.status, body = _ref4.body, headers = _ref4.headers;
            if ("contingency" === body.ack) {
                var err = new Error(body.contingency);
                err.response = {
                    url: url,
                    method: method,
                    headers: reqHeaders,
                    body: body
                };
                err.data = body.data;
                getLogger().warn("smart_api_" + eventName + "_contingency_error");
                throw err;
            }
            if (429 === status) {
                var _getLogger$track2;
                getLogger().track(((_getLogger$track2 = {}).transition_name = "call_rest_api", _getLogger$track2.int_error_desc = "Error: " + status + " - " + body, 
                _getLogger$track2.info_msg = "URL: " + url, _getLogger$track2));
            }
            if (status > 400) {
                getLogger().warn("smart_api_" + eventName + "_status_" + status + "_error");
                throw new Error("Api: " + url + " returned status code: " + status + " (Corr ID: " + headers["paypal-debug-id"] + ")\n\n" + JSON.stringify(body));
            }
            if ("success" !== body.ack) {
                getLogger().warn("smart_api_" + eventName + "_ack_error");
                throw new Error("Api: " + url + " returned ack: " + body.ack + " (Corr ID: " + headers["paypal-debug-id"] + ")\n\n" + JSON.stringify(body));
            }
            return {
                data: body.data,
                headers: headers
            };
        }));
    }
    function callGraphQL(_ref5) {
        var name = _ref5.name, _ref5$variables = _ref5.variables, _ref5$headers = _ref5.headers, _ref5$returnErrorObje = _ref5.returnErrorObject, returnErrorObject = void 0 !== _ref5$returnErrorObje && _ref5$returnErrorObje;
        return request({
            url: "/graphql?" + name,
            method: "POST",
            json: {
                query: _ref5.query,
                variables: void 0 === _ref5$variables ? {} : _ref5$variables
            },
            headers: _extends({
                "x-app-name": "smart-payment-buttons"
            }, void 0 === _ref5$headers ? {} : _ref5$headers)
        }).then((function(_ref6) {
            var status = _ref6.status, body = _ref6.body;
            var errors = body.errors || [];
            if (errors.length) {
                var message = errors[0].message || JSON.stringify(errors[0]);
                getLogger().warn("graphql_" + name + "_error", {
                    err: message
                });
                if (returnErrorObject) throw errors[0];
                throw new Error(message);
            }
            if (200 !== status) {
                getLogger().warn("graphql_" + name + "_status_" + status + "_error");
                throw new Error("/graphql returned status " + status + "\n\n" + JSON.stringify(body));
            }
            return body.data;
        }));
    }
    function getResponseCorrelationID(res) {
        return res.headers["paypal-debug-id"];
    }
    function getErrorResponseCorrelationID(err) {
        var res = null == err ? void 0 : err.response;
        if (res) return getResponseCorrelationID(res);
    }
    function createAccessToken(clientID, _temp) {
        var targetSubject = (void 0 === _temp ? {} : _temp).targetSubject;
        return inlineMemoize(createAccessToken, (function() {
            getLogger().info("rest_api_create_access_token");
            var basicAuth = base64encode((clientID || "") + ":");
            var data = {
                grant_type: "client_credentials"
            };
            targetSubject && (data.target_subject = targetSubject);
            return request({
                method: "post",
                url: "/v1/oauth2/token",
                headers: {
                    Authorization: "Basic " + basicAuth
                },
                data: data
            }).then((function(_ref2) {
                var body = _ref2.body;
                if (body && "invalid_client" === body.error) {
                    getLogger().warn("rest_api_v1_oauth2_token_create_error", {
                        err: "invalid client id"
                    });
                    throw new Error("Auth Api invalid client id: " + (clientID || "") + ":\n\n" + JSON.stringify(body, null, 4));
                }
                if (!body || !body.access_token) {
                    getLogger().warn("rest_api_v1_oauth2_token_create_error");
                    throw new Error("Auth Api response error:\n\n" + JSON.stringify(body, null, 4));
                }
                return body.access_token;
            }));
        }), [ clientID, targetSubject ]);
    }
    var lsatUpgradeCalled = !1;
    var lsatUpgradeError;
    var getLsatUpgradeCalled = function() {
        return lsatUpgradeCalled;
    };
    var getLsatUpgradeError = function() {
        return lsatUpgradeError;
    };
    function isInvalidResourceIDError(err) {
        var _err$response, _err$response$body, _err$response$body$de;
        return Boolean(null == err || null == (_err$response = err.response) || null == (_err$response$body = _err$response.body) || null == (_err$response$body$de = _err$response$body.details) ? void 0 : _err$response$body$de.some((function(detail) {
            return "INVALID_RESOURCE_ID" === detail.issue;
        })));
    }
    function getOrder(orderID, _ref2) {
        var _headers4;
        var facilitatorAccessToken = _ref2.facilitatorAccessToken, buyerAccessToken = _ref2.buyerAccessToken, partnerAttributionID = _ref2.partnerAttributionID, _ref2$forceRestAPI = _ref2.forceRestAPI, forceRestAPI = void 0 !== _ref2$forceRestAPI && _ref2$forceRestAPI;
        getLogger().info("get_order_lsat_upgrade_" + (getLsatUpgradeCalled() ? "called" : "not_called"));
        getLogger().info("get_order_lsat_upgrade_" + (getLsatUpgradeError() ? "errored" : "did_not_error"), {
            err: stringifyError(getLsatUpgradeError())
        });
        if (forceRestAPI && !getLsatUpgradeError()) {
            var _headers2;
            return callRestAPI({
                accessToken: facilitatorAccessToken,
                url: ORDERS_API_URL + "/" + orderID,
                eventName: "v2_checkout_orders_get",
                headers: (_headers2 = {}, _headers2["paypal-partner-attribution-id"] = partnerAttributionID || "", 
                _headers2.prefer = "return=representation", _headers2)
            }).catch((function(err) {
                var _headers3;
                var restCorrID = getErrorResponseCorrelationID(err);
                getLogger().warn("get_order_call_rest_api_error", {
                    restCorrID: restCorrID,
                    orderID: orderID,
                    err: stringifyError(err)
                });
                isInvalidResourceIDError(err) && getLogger().warn("get_order_invalid_resource_id_error", {
                    restCorrID: restCorrID,
                    orderID: orderID,
                    err: stringifyError(err)
                });
                return callSmartAPI({
                    accessToken: buyerAccessToken,
                    url: "/smart/api/order/" + orderID,
                    eventName: "order_get",
                    headers: (_headers3 = {}, _headers3["paypal-client-context"] = orderID, _headers3)
                }).then((function(res) {
                    var smartCorrID = getResponseCorrelationID(res);
                    getLogger().info("get_order_smart_fallback_success", {
                        smartCorrID: smartCorrID,
                        restCorrID: restCorrID,
                        orderID: orderID
                    });
                    return res.data;
                })).catch((function(smartErr) {
                    var smartCorrID = getErrorResponseCorrelationID(err);
                    getLogger().error("get_order_smart_fallback_error", {
                        smartCorrID: smartCorrID,
                        restCorrID: restCorrID,
                        orderID: orderID,
                        err: stringifyError(smartErr)
                    });
                    throw smartErr;
                }));
            }));
        }
        return callSmartAPI({
            accessToken: buyerAccessToken,
            url: "/smart/api/order/" + orderID,
            eventName: "order_get",
            headers: (_headers4 = {}, _headers4["paypal-client-context"] = orderID, _headers4)
        }).then((function(_ref3) {
            return _ref3.data;
        }));
    }
    function isProcessorDeclineError(err) {
        var _err$response2, _err$response2$body, _err$response2$body$d, _err$response3, _err$response3$body, _err$response3$body$d, _err$response4, _err$response4$body;
        var details = null != err && null != (_err$response2 = err.response) && null != (_err$response2$body = _err$response2.body) && null != (_err$response2$body$d = _err$response2$body.data) && _err$response2$body$d.details ? null == err || null == (_err$response3 = err.response) || null == (_err$response3$body = _err$response3.body) || null == (_err$response3$body$d = _err$response3$body.data) ? void 0 : _err$response3$body$d.details : null == err || null == (_err$response4 = err.response) || null == (_err$response4$body = _err$response4.body) ? void 0 : _err$response4$body.details;
        return Boolean(null == details ? void 0 : details.some((function(detail) {
            return "INSTRUMENT_DECLINED" === detail.issue || "PAYER_ACTION_REQUIRED" === detail.issue;
        })));
    }
    function isUnprocessableEntityError(err) {
        var _err$response5, _err$response5$body, _err$response5$body$d;
        return Boolean(null == err || null == (_err$response5 = err.response) || null == (_err$response5$body = _err$response5.body) || null == (_err$response5$body$d = _err$response5$body.details) ? void 0 : _err$response5$body$d.some((function(detail) {
            return "DUPLICATE_INVOICE_ID" === detail.issue;
        })));
    }
    function patchOrder(orderID, data, _ref8) {
        var _headers13;
        var facilitatorAccessToken = _ref8.facilitatorAccessToken, buyerAccessToken = _ref8.buyerAccessToken, partnerAttributionID = _ref8.partnerAttributionID, _ref8$forceRestAPI = _ref8.forceRestAPI, forceRestAPI = void 0 !== _ref8$forceRestAPI && _ref8$forceRestAPI;
        getLogger().info("patch_order_lsat_upgrade_" + (getLsatUpgradeCalled() ? "called" : "not_called"));
        getLogger().info("patch_order_lsat_upgrade_" + (getLsatUpgradeError() ? "errored" : "did_not_error"), {
            err: stringifyError(getLsatUpgradeError())
        });
        if (forceRestAPI && !getLsatUpgradeError()) {
            var _headers11;
            return callRestAPI({
                accessToken: facilitatorAccessToken,
                method: "PATCH",
                eventName: "v2_checkout_orders_patch",
                url: ORDERS_API_URL + "/" + orderID,
                data: data,
                headers: (_headers11 = {}, _headers11["paypal-partner-attribution-id"] = partnerAttributionID || "", 
                _headers11.prefer = "return=representation", _headers11)
            }).catch((function(err) {
                var _headers12;
                var restCorrID = getErrorResponseCorrelationID(err);
                getLogger().warn("patch_order_call_rest_api_error", {
                    restCorrID: restCorrID,
                    orderID: orderID,
                    err: stringifyError(err)
                });
                isInvalidResourceIDError(err) && getLogger().warn("patch_order_invalid_resource_id_error", {
                    restCorrID: restCorrID,
                    orderID: orderID,
                    err: stringifyError(err)
                });
                return callSmartAPI({
                    accessToken: buyerAccessToken,
                    method: "post",
                    eventName: "order_patch",
                    url: "/smart/api/order/" + orderID + "/patch",
                    json: {
                        data: Array.isArray(data) ? {
                            patch: data
                        } : data
                    },
                    headers: (_headers12 = {}, _headers12["paypal-client-context"] = orderID, _headers12)
                }).then((function(res) {
                    var smartCorrID = getResponseCorrelationID(res);
                    getLogger().info("patch_order_smart_fallback_success", {
                        smartCorrID: smartCorrID,
                        restCorrID: restCorrID,
                        orderID: orderID
                    });
                    return res.data;
                })).catch((function(smartErr) {
                    var smartCorrID = getErrorResponseCorrelationID(err);
                    getLogger().info("patch_order_smart_fallback_error", {
                        smartCorrID: smartCorrID,
                        restCorrID: restCorrID,
                        orderID: orderID,
                        err: stringifyError(smartErr)
                    });
                    throw smartErr;
                }));
            }));
        }
        getLogger().info("lsat_upgrade_false");
        return callSmartAPI({
            accessToken: buyerAccessToken,
            method: "post",
            eventName: "order_patch",
            url: "/smart/api/order/" + orderID + "/patch",
            json: {
                data: Array.isArray(data) ? {
                    patch: data
                } : data
            },
            headers: (_headers13 = {}, _headers13["paypal-client-context"] = orderID, _headers13)
        }).then((function(_ref9) {
            return _ref9.data;
        }));
    }
    function patchShipping(_ref10) {
        return callGraphQL({
            name: "UpdateShipping",
            query: "\n            mutation UpdateShipping(\n                $clientID: String!\n                $patch: [JSON]!\n                $token: String!\n            ) {\n                updateShipping(\n                    clientID: $clientID,\n                    patch: $patch,\n                    token: $token,\n                )\n            }\n        ",
            variables: {
                clientID: _ref10.clientID,
                patch: _ref10.data,
                token: _ref10.orderID
            }
        });
    }
    function billingTokenToOrderID(billingToken) {
        return callSmartAPI({
            authenticated: !1,
            method: "post",
            eventName: "payment_ectoken",
            url: "/smart/api/payment/" + billingToken + "/ectoken"
        }).then((function(_ref13) {
            return _ref13.data.token;
        }));
    }
    function subscriptionIdToCartId(subscriptionID) {
        return callSmartAPI({
            authenticated: !1,
            method: "post",
            eventName: "billagmt_subscriptions_cartid",
            url: "/smart/api/billagmt/subscriptions/" + subscriptionID + "/cartid"
        }).then((function(_ref14) {
            return _ref14.data.token;
        }));
    }
    var getSupplementalOrderInfo = memoize((function(orderID) {
        var _headers21;
        return callGraphQL({
            name: "GetCheckoutDetails",
            query: "\n        query GetCheckoutDetails($orderID: String!) {\n            checkoutSession(token: $orderID) {\n                cart {\n                    billingType\n                    intent\n                    paymentId\n                    billingToken\n                    amounts {\n                        total {\n                            currencyValue\n                            currencyCode\n                            currencyFormatSymbolISOCurrency\n                        }\n                    }\n                    supplementary {\n                        initiationIntent\n                    }\n                    category\n                }\n                flags {\n                    isChangeShippingAddressAllowed\n                }\n                payees {\n                    merchantId\n                    email {\n                        stringValue\n                    }\n                }\n            }\n        }\n        ",
            variables: {
                orderID: orderID
            },
            headers: (_headers21 = {}, _headers21["paypal-client-context"] = orderID, _headers21)
        });
    }));
    var order_getShippingOrderInfo = function(orderID) {
        var _headers22;
        return callGraphQL({
            name: "GetCheckoutDetails",
            query: "\n            query GetCheckoutDetails($orderID: String!) {\n                checkoutSession(token: $orderID) {\n                    cart {\n                        billingType\n                        intent\n                        paymentId\n                        billingToken\n                        amounts {\n                            total {\n                                currencyValue\n                                currencyCode\n                                currencyFormatSymbolISOCurrency\n                            }\n                        }\n                        supplementary {\n                            initiationIntent\n                        }\n                        category\n                        shippingAddress {\n                            firstName\n                            lastName\n                            line1\n                            line2\n                            city\n                            state\n                            postalCode\n                            country\n                        }\n                        shippingMethods {\n                            id\n                            amount {\n                                currencyCode\n                                currencyValue\n                            }\n                            label\n                            selected\n                            type\n                        }\n                    }\n                    flags {\n                        isChangeShippingAddressAllowed\n                    }\n                    payees {\n                        merchantId\n                        email {\n                            stringValue\n                        }\n                    }\n                }\n            }\n        ",
            variables: {
                orderID: orderID
            },
            headers: (_headers22 = {}, _headers22["paypal-client-context"] = orderID, _headers22)
        });
    };
    function createRequest(accessToken, subscriptionPayload, partnerAttributionID, eventName) {
        return request({
            method: "post",
            url: "/v1/billing/subscriptions",
            headers: {
                Authorization: "Bearer " + accessToken,
                "PayPal-Partner-Attribution-Id": partnerAttributionID || ""
            },
            json: subscriptionPayload
        }).then((function(_ref) {
            var body = _ref.body;
            if (!body || !body.id) {
                getLogger().warn("rest_api_" + eventName + "_error");
                throw new Error("Create Subscription Api response error:\n\n" + JSON.stringify(body, null, 4));
            }
            return body.id;
        }));
    }
    function reviseRequest(accessToken, subscriptionID, subscriptionPayload, partnerAttributionID, eventName) {
        return request({
            method: "post",
            url: "/v1/billing/subscriptions/" + subscriptionID + "/revise",
            headers: {
                Authorization: "Bearer " + accessToken,
                "PayPal-Partner-Attribution-Id": partnerAttributionID || ""
            },
            json: subscriptionPayload
        }).then((function(_ref3) {
            var body = _ref3.body, status = _ref3.status;
            if (200 !== status) {
                getLogger().warn("rest_api_" + eventName + "_error");
                throw new Error("Revise Subscription Api HTTP-" + status + " response: error:\n\n" + JSON.stringify(body, null, 4));
            }
            return subscriptionID;
        }));
    }
    memoize((function(config) {
        return promise_ZalgoPromise.try((function() {
            if (!window.firebase || !window.firebase.auth || !window.firebase.database) return loadScript("https://www.paypalobjects.com/checkout/js/lib/firebase-app.js").then((function() {
                return promise_ZalgoPromise.all([ loadScript("https://www.paypalobjects.com/checkout/js/lib/firebase-auth.js"), loadScript("https://www.paypalobjects.com/checkout/js/lib/firebase-database.js") ]);
            }));
        })).then((function() {
            var firebase = window.firebase;
            if (!firebase) throw new Error("Firebase failed to load");
            firebase.initializeApp(config);
            return firebase;
        }));
    }));
    var _FRAUDNET_URL;
    var FRAUDNET_URL = ((_FRAUDNET_URL = {}).local = "https://www.stage2d0107.stage.paypal.com/FDRegression/fb.js", 
    _FRAUDNET_URL.stage = "https://www.stage2d0107.stage.paypal.com/FDRegression/fb.js", 
    _FRAUDNET_URL.sandbox = "https://c.paypal.com/da/r/fb.js", _FRAUDNET_URL.production = "https://c.paypal.com/da/r/fb.js", 
    _FRAUDNET_URL.test = "https://c.paypal.com/da/r/fb.js", _FRAUDNET_URL);
    memoize((function(_ref) {
        var env = _ref.env, clientMetadataID = _ref.clientMetadataID, cspNonce = _ref.cspNonce, _ref$timeout = _ref.timeout, timeout = void 0 === _ref$timeout ? 1e3 : _ref$timeout;
        return new promise_ZalgoPromise((function(resolve) {
            var config = {
                f: clientMetadataID,
                s: "SMART_PAYMENT_BUTTONS",
                u: window.xprops.buttonLocation,
                cb1: "fnCallback"
            };
            "sandbox" === env && (config.sandbox = !0);
            var configScript = document.createElement("script");
            configScript.setAttribute("nonce", cspNonce || "");
            configScript.setAttribute("type", "application/json");
            configScript.setAttribute("id", "fconfig");
            configScript.setAttribute("fncls", "fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99");
            configScript.textContent = JSON.stringify(config);
            var fraudnetScript = document.createElement("script");
            fraudnetScript.setAttribute("nonce", cspNonce || "");
            fraudnetScript.setAttribute("src", FRAUDNET_URL[env]);
            fraudnetScript.addEventListener("error", (function() {
                return resolve();
            }));
            window.fnCallback = resolve;
            setTimeout(resolve, timeout);
            var body = util_getBody();
            body.appendChild(configScript);
            body.appendChild(fraudnetScript);
        }));
    }));
    memoize((function(_ref) {
        var _headers;
        var _ref$amount = _ref.amount, _ref$vetted = _ref.vetted, _ref$allowBillingPaym = _ref.allowBillingPayments;
        return callGraphQL({
            name: "GetSmartWallet",
            query: "\n            query GetSmartWallet(\n                $clientID: String!\n                $merchantID: [String!]\n                $currency: String\n                $amount: String\n                $userIDToken: String\n                $vetted: Boolean\n                $paymentMethodToken: String\n                $branded: Boolean,\n                $allowBillingPayments: Boolean\n            ) {\n                smartWallet(\n                    clientId: $clientID\n                    merchantId: $merchantID\n                    currency: $currency\n                    amount: $amount\n                    userIdToken: $userIDToken\n                    vetted: $vetted\n                    paymentMethodNonce: $paymentMethodToken\n                    branded: $branded,\n                    allowBillingPayments: $allowBillingPayments\n                ) {\n                    paypal {\n                        instruments {\n                            type\n                            label\n                            logoUrl\n                            instrumentID\n                            tokenID\n                            vendor\n                            oneClick\n                            accessToken\n                        }\n                    }\n                    credit {\n                        instruments {\n                            type\n                            label\n                            logoUrl\n                            instrumentID\n                            tokenID\n                            vendor\n                            oneClick\n                            accessToken\n                        }\n                    }\n                    card {\n                        instruments {\n                            type\n                            label\n                            logoUrl\n                            instrumentID\n                            tokenID\n                            vendor\n                            oneClick\n                        }\n                    }\n                    venmo {\n                        instruments {\n                            type\n                            label\n                            logoUrl\n                            instrumentID\n                            tokenID\n                            oneClick\n                        }\n                    }\n                }\n            }\n        ",
            variables: {
                clientID: _ref.clientID,
                merchantID: _ref.merchantID,
                currency: _ref.currency,
                amount: void 0 === _ref$amount ? "0.00" : _ref$amount,
                userIDToken: _ref.userIDToken,
                vetted: void 0 === _ref$vetted || _ref$vetted,
                paymentMethodToken: _ref.paymentMethodToken,
                branded: _ref.branded,
                allowBillingPayments: void 0 === _ref$allowBillingPaym || _ref$allowBillingPaym
            },
            headers: (_headers = {}, _headers["paypal-client-metadata-id"] = _ref.clientMetadataID, 
            _headers)
        }).then((function(_ref2) {
            return _ref2.smartWallet;
        }));
    }));
    var onApprove_redirect = function(url) {
        if (!url) throw new Error("Expected redirect url");
        if (-1 === url.indexOf("://")) {
            getLogger().warn("redir_url_non_scheme", {
                url: url
            }).flush();
            throw new Error("Invalid redirect url: " + url + " - must be fully qualified url");
        }
        url.match(/^https?:\/\//) || getLogger().warn("redir_url_non_http", {
            url: url
        }).flush();
        return dom_redirect(url, window.top);
    };
    var onApprove_handleProcessorError = function(err, restart, onError) {
        if (isUnprocessableEntityError(err)) {
            err && err.response && (err.message = JSON.stringify(err.response) || err.message);
            return onError(err).then(unresolvedPromise);
        }
        if (isProcessorDeclineError(err)) return restart().then(unresolvedPromise);
        throw err;
    };
    function getCreateOrder(_ref5, _ref6) {
        var createOrder = _ref5.createOrder, currency = _ref5.currency;
        var createBillingAgreement = _ref6.createBillingAgreement, createSubscription = _ref6.createSubscription, enableOrdersApprovalSmartWallet = _ref6.enableOrdersApprovalSmartWallet, smartWalletOrderID = _ref6.smartWalletOrderID;
        var data = {
            paymentSource: _ref5.paymentSource
        };
        var actions = function(_ref4) {
            var facilitatorAccessToken = _ref4.facilitatorAccessToken, intent = _ref4.intent, currency = _ref4.currency, merchantID = _ref4.merchantID, partnerAttributionID = _ref4.partnerAttributionID;
            var order = function(_ref2) {
                var facilitatorAccessToken = _ref2.facilitatorAccessToken, intent = _ref2.intent, currency = _ref2.currency, merchantID = _ref2.merchantID, partnerAttributionID = _ref2.partnerAttributionID;
                return {
                    create: function(data) {
                        var order = _extends({}, data);
                        if (order.intent && order.intent.toLowerCase() !== intent) throw new Error("Unexpected intent: " + order.intent + " passed to order.create. Please ensure you are passing /sdk/js?intent=" + order.intent.toLowerCase() + " in the paypal script tag.");
                        (order = _extends({}, order, {
                            intent: intent.toUpperCase()
                        })).purchase_units = order.purchase_units.map((function(unit) {
                            if (unit.amount.currency_code && unit.amount.currency_code !== currency) throw new Error("Unexpected currency: " + unit.amount.currency_code + " passed to order.create. Please ensure you are passing /sdk/js?currency=" + unit.amount.currency_code + " in the paypal script tag.");
                            var payee = unit.payee;
                            if (merchantID && 1 === merchantID.length && merchantID[0]) {
                                var payeeID = merchantID[0];
                                payee = isEmailAddress(payeeID) ? _extends({}, payee, {
                                    email_address: payeeID
                                }) : _extends({}, payee, {
                                    merchant_id: payeeID
                                });
                            }
                            return _extends({}, unit, {
                                payee: payee,
                                amount: _extends({}, unit.amount, {
                                    currency_code: currency
                                })
                            });
                        }));
                        order.application_context = order.application_context || {};
                        return function(order, _ref) {
                            var _headers;
                            var facilitatorAccessToken = _ref.facilitatorAccessToken, partnerAttributionID = _ref.partnerAttributionID;
                            getLogger().info("rest_api_create_order_id");
                            return callRestAPI({
                                accessToken: facilitatorAccessToken,
                                method: "post",
                                url: "" + ORDERS_API_URL,
                                eventName: "v2_checkout_orders_create",
                                data: order,
                                headers: (_headers = {}, _headers["paypal-partner-attribution-id"] = partnerAttributionID || "", 
                                _headers.prefer = "return=representation", _headers)
                            }).then((function(body) {
                                var _getLogger$track;
                                var orderID = body && body.id;
                                if (!orderID) throw new Error("Order Api response error:\n\n" + JSON.stringify(body, null, 4));
                                getLogger().track(((_getLogger$track = {}).transition_name = "process_create_order", 
                                _getLogger$track.context_type = "EC-Token", _getLogger$track.token = orderID, _getLogger$track.context_id = orderID, 
                                _getLogger$track));
                                return orderID;
                            }));
                        }(order, {
                            facilitatorAccessToken: facilitatorAccessToken,
                            partnerAttributionID: partnerAttributionID,
                            forceRestAPI: !1
                        });
                    }
                };
            }({
                facilitatorAccessToken: facilitatorAccessToken,
                intent: intent,
                currency: currency,
                merchantID: merchantID,
                partnerAttributionID: partnerAttributionID
            });
            !function(_ref3) {
                var facilitatorAccessToken = _ref3.facilitatorAccessToken, intent = _ref3.intent, currency = _ref3.currency, merchantID = _ref3.merchantID, partnerAttributionID = _ref3.partnerAttributionID;
            }({
                facilitatorAccessToken: facilitatorAccessToken,
                intent: intent,
                currency: currency,
                merchantID: merchantID,
                partnerAttributionID: partnerAttributionID
            });
            return {
                order: order,
                payment: null
            };
        }({
            facilitatorAccessToken: _ref6.facilitatorAccessToken,
            intent: _ref5.intent,
            currency: currency,
            merchantID: _ref5.merchantID,
            partnerAttributionID: _ref5.partnerAttributionID
        });
        return memoize((function() {
            var queryOrderID = parseQuery(window.location.search.slice(1)).orderID;
            if (queryOrderID) return promise_ZalgoPromise.resolve(queryOrderID);
            if (enableOrdersApprovalSmartWallet && smartWalletOrderID) return promise_ZalgoPromise.resolve(smartWalletOrderID);
            var startTime = Date.now();
            return promise_ZalgoPromise.try((function() {
                return createBillingAgreement ? createBillingAgreement().then(billingTokenToOrderID) : createSubscription ? createSubscription().then(subscriptionIdToCartId) : createOrder ? createOrder(data, actions) : actions.order.create({
                    purchase_units: [ {
                        amount: {
                            currency_code: currency,
                            value: "0.01"
                        }
                    } ]
                });
            })).catch((function(err) {
                getLogger().error("create_order_error", {
                    err: stringifyError(err)
                });
                throw err;
            })).then((function(orderID) {
                var _getLogger$addPayload;
                if (!orderID || "string" != typeof orderID) throw new Error("Expected an order id to be passed");
                if (0 === orderID.indexOf("PAY-") || 0 === orderID.indexOf("PAYID-")) throw new Error("Do not pass PAY-XXX or PAYID-XXX directly into createOrder. Pass the EC-XXX token instead");
                var duration = Date.now() - startTime;
                getLogger().addPayloadBuilder((function() {
                    return {
                        token: orderID
                    };
                })).addTrackingBuilder((function() {
                    var _ref7;
                    return (_ref7 = {}).context_type = "EC-Token", _ref7.context_id = orderID, _ref7.token = orderID, 
                    _ref7;
                })).track((_getLogger$addPayload = {}, _getLogger$addPayload.state_name = "smart_button", 
                _getLogger$addPayload.transition_name = "process_receive_order", _getLogger$addPayload.event_name = "process_receive_order", 
                _getLogger$addPayload.context_type = "EC-Token", _getLogger$addPayload.button_width = window.innerWidth, 
                _getLogger$addPayload.context_id = orderID, _getLogger$addPayload.token = orderID, 
                _getLogger$addPayload.response_duration = duration.toString(), _getLogger$addPayload)).flush();
                return orderID;
            }));
        }));
    }
    var onComplete_redirect = function(url) {
        if (!url) throw new Error("Expected redirect url");
        if (-1 === url.indexOf("://")) {
            getLogger().warn("redir_url_non_scheme", {
                url: url
            }).flush();
            throw new Error("Invalid redirect url: " + url + " - must be fully qualified url");
        }
        url.match(/^https?:\/\//) || getLogger().warn("redir_url_non_http", {
            url: url
        }).flush();
        return dom_redirect(url, window.top);
    };
    function _objectWithoutPropertiesLoose(source, excluded) {
        if (null == source) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;
        for (i = 0; i < sourceKeys.length; i++) excluded.indexOf(key = sourceKeys[i]) >= 0 || (target[key] = source[key]);
        return target;
    }
    var _excluded = [ "buyerAccessToken", "forceRestAPI" ];
    var ON_SHIPPING_CHANGE_PATHS_AMOUNT = "/purchase_units/@reference_id=='default'/amount", ON_SHIPPING_CHANGE_PATHS_OPTIONS = "/purchase_units/@reference_id=='default'/shipping/options";
    var SHIPPING_ADDRESS_ERROR_MESSAGES = {
        ADDRESS_ERROR: "Your order can't be shipped to this address.",
        COUNTRY_ERROR: "Your order can't be shipped to this country.",
        STATE_ERROR: "Your order can't be shipped to this state.",
        ZIP_ERROR: "Your order can't be shipped to this zip."
    };
    var SHIPPING_OPTIONS_ERROR_MESSAGES = {
        METHOD_UNAVAILABLE: "The shipping method you chose is unavailable. To continue, choose another way to get your order.",
        STORE_UNAVAILABLE: "Part of your order isn't available at this store."
    };
    function _objectDestructuringEmpty(obj) {
        if (null == obj) throw new TypeError("Cannot destructure undefined");
    }
    var calculateTotalFromShippingBreakdownAmounts = function(_ref) {
        var breakdown = _ref.breakdown, updatedAmounts = _ref.updatedAmounts;
        var newAmount = 0;
        var updatedAmountKeys = Object.keys(updatedAmounts) || [];
        var discountKeys = [ "shipping_discount", "discount" ];
        Object.keys(breakdown).forEach((function(item) {
            if (-1 !== updatedAmountKeys.indexOf(item)) discountKeys.includes(item) ? newAmount -= Math.abs(parseFloat(updatedAmounts[item])) : newAmount += parseFloat(updatedAmounts[item]); else if (discountKeys.includes(item)) {
                var _breakdown$item;
                newAmount -= Math.abs(parseFloat(null == (_breakdown$item = breakdown[item]) ? void 0 : _breakdown$item.value));
            } else {
                var _breakdown$item2;
                newAmount += parseFloat(null == (_breakdown$item2 = breakdown[item]) ? void 0 : _breakdown$item2.value);
            }
        }));
        updatedAmountKeys.forEach((function(key) {
            breakdown[key] || updatedAmounts[key] && (discountKeys.includes(key) ? newAmount -= Math.abs(parseFloat(updatedAmounts[key])) : newAmount += parseFloat(updatedAmounts[key]));
        }));
        return newAmount.toFixed(2);
    };
    var buildBreakdown = function(_ref2) {
        var _Object$values$;
        var _ref2$breakdown = _ref2.breakdown, breakdown = void 0 === _ref2$breakdown ? {} : _ref2$breakdown, _ref2$updatedAmounts = _ref2.updatedAmounts, updatedAmounts = void 0 === _ref2$updatedAmounts ? {} : _ref2$updatedAmounts;
        var discountKeys = [ "shipping_discount", "discount" ];
        var updatedAmountKeys = Object.keys(updatedAmounts);
        var currency_code = null == (_Object$values$ = Object.values(breakdown)[0]) ? void 0 : _Object$values$.currency_code;
        updatedAmountKeys.forEach((function(key) {
            breakdown[key] ? breakdown[key].value = updatedAmounts[key] : updatedAmounts[key] && (breakdown[key] = {
                currency_code: currency_code,
                value: updatedAmounts[key] && discountKeys.includes(key) ? Math.abs(parseFloat(updatedAmounts[key])).toFixed(2) : updatedAmounts[key]
            });
        }));
        return breakdown;
    };
    var convertQueriesToArray = function(_ref3) {
        return Object.values(_ref3.queries) || [];
    };
    var utils_updateOperationForShippingOptions = function(_ref5) {
        var queries = _ref5.queries;
        queries[ON_SHIPPING_CHANGE_PATHS_OPTIONS] && (queries[ON_SHIPPING_CHANGE_PATHS_OPTIONS].op = "replace");
        return convertQueriesToArray({
            queries: queries
        });
    };
    var onShippingAddressChange_excluded = [ "amount", "buyerAccessToken", "event", "forceRestAPI", "shipping_address" ];
    var onShippingOptionsChange_excluded = [ "amount", "buyerAccessToken", "event", "forceRestAPI", "options", "selected_shipping_option" ];
    function getLegacyProps(_ref) {
        var paymentSource = _ref.paymentSource, partnerAttributionID = _ref.partnerAttributionID, merchantID = _ref.merchantID, clientID = _ref.clientID, facilitatorAccessToken = _ref.facilitatorAccessToken, currency = _ref.currency, intent = _ref.intent, enableOrdersApprovalSmartWallet = _ref.enableOrdersApprovalSmartWallet, smartWalletOrderID = _ref.smartWalletOrderID, branded = _ref.branded, clientAccessToken = _ref.clientAccessToken, _ref$vault = _ref.vault, vault = void 0 !== _ref$vault && _ref$vault, _ref$experiments = _ref.experiments, experiments = void 0 === _ref$experiments ? {} : _ref$experiments, featureFlags = _ref.featureFlags, inputCreateSubscription = _ref.createSubscription, inputCreateOrder = _ref.createOrder, onError = _ref.onError, inputOnApprove = _ref.onApprove, inputOnComplete = _ref.onComplete, inputOnCancel = _ref.onCancel, inputOnShippingChange = _ref.onShippingChange, inputOnShippingAddressChange = _ref.onShippingAddressChange, inputOnShippingOptionsChange = _ref.onShippingOptionsChange;
        var createBillingAgreement = function(_ref2) {
            var createBillingAgreement = _ref2.createBillingAgreement, paymentSource = _ref2.paymentSource;
            if (createBillingAgreement) return function() {
                return createBillingAgreement((_ref = {
                    paymentSource: paymentSource
                }, {
                    paymentSource: _ref.paymentSource
                }), {}).then((function(billingToken) {
                    if (!billingToken || "string" != typeof billingToken) throw new Error("Expected a billing token to be passed to createBillingAgreement");
                    return billingToken;
                }));
                var _ref;
            };
        }({
            createBillingAgreement: _ref.createBillingAgreement,
            paymentSource: paymentSource
        });
        var createSubscription = function(_ref3, _ref4) {
            var createSubscription = _ref3.createSubscription, partnerAttributionID = _ref3.partnerAttributionID, merchantID = _ref3.merchantID, clientID = _ref3.clientID, paymentSource = _ref3.paymentSource;
            var facilitatorAccessToken = _ref4.facilitatorAccessToken;
            if (createSubscription) {
                if (merchantID && merchantID[0]) {
                    getLogger().info("src_props_subscriptions_recreate_access_token_cache");
                    createAccessToken(clientID, {
                        targetSubject: merchantID[0]
                    });
                }
                return function() {
                    return createSubscription((_ref = {
                        paymentSource: paymentSource
                    }, {
                        paymentSource: _ref.paymentSource
                    }), function(_ref2) {
                        var facilitatorAccessToken = _ref2.facilitatorAccessToken, partnerAttributionID = _ref2.partnerAttributionID, merchantID = _ref2.merchantID, clientID = _ref2.clientID;
                        return {
                            subscription: {
                                create: function(data) {
                                    return function(accessToken, subscriptionPayload, _ref2) {
                                        var partnerAttributionID = _ref2.partnerAttributionID, merchantID = _ref2.merchantID, clientID = _ref2.clientID;
                                        getLogger().info("rest_api_create_subscription_id");
                                        if (!subscriptionPayload) throw new Error("Expected subscription payload to be passed");
                                        if (merchantID && merchantID[0]) {
                                            getLogger().info("rest_api_subscriptions_recreate_access_token");
                                            return createAccessToken(clientID, {
                                                targetSubject: merchantID[0]
                                            }).then((function(thirdPartyAccessToken) {
                                                return createRequest(thirdPartyAccessToken, subscriptionPayload, partnerAttributionID, "v1_billing_subscriptions_recreate");
                                            }));
                                        }
                                        if (!accessToken) throw new Error("Access token not passed");
                                        return createRequest(accessToken, subscriptionPayload, partnerAttributionID, "v1_billing_subscriptions_create");
                                    }(facilitatorAccessToken, data, {
                                        partnerAttributionID: partnerAttributionID,
                                        merchantID: merchantID,
                                        clientID: clientID
                                    });
                                },
                                revise: function(subscriptionID, data) {
                                    return function(accessToken, subscriptionID, subscriptionPayload, _ref4) {
                                        var partnerAttributionID = _ref4.partnerAttributionID, merchantID = _ref4.merchantID, clientID = _ref4.clientID;
                                        getLogger().info("rest_api_create_subscription_id");
                                        if (!subscriptionID) throw new Error("Expected subscription id to be passed as first argument to revise subscription api");
                                        if (!subscriptionPayload) throw new Error("Expected subscription payload to be passed");
                                        if (merchantID && merchantID[0]) {
                                            getLogger().info("rest_api_subscriptions_recreate_access_token");
                                            return createAccessToken(clientID, {
                                                targetSubject: merchantID[0]
                                            }).then((function(thirdPartyAccessToken) {
                                                return reviseRequest(thirdPartyAccessToken, subscriptionID, subscriptionPayload, partnerAttributionID, "v1_billing_subscriptions_revise_recreate");
                                            }));
                                        }
                                        if (!accessToken) throw new Error("Access token not passed");
                                        return reviseRequest(accessToken, subscriptionID, subscriptionPayload, partnerAttributionID, "v1_billing_subscriptions_revise_create");
                                    }(facilitatorAccessToken, subscriptionID, data, {
                                        partnerAttributionID: partnerAttributionID,
                                        merchantID: merchantID,
                                        clientID: clientID
                                    });
                                }
                            }
                        };
                    }({
                        facilitatorAccessToken: facilitatorAccessToken,
                        partnerAttributionID: partnerAttributionID,
                        merchantID: merchantID,
                        clientID: clientID
                    })).then((function(subscriptionID) {
                        if (!subscriptionID || "string" != typeof subscriptionID) throw new Error("Expected an subscription id to be passed to createSubscription");
                        return subscriptionID;
                    }));
                    var _ref;
                };
            }
        }({
            createSubscription: inputCreateSubscription,
            partnerAttributionID: partnerAttributionID,
            merchantID: merchantID,
            clientID: clientID,
            paymentSource: paymentSource
        }, {
            facilitatorAccessToken: facilitatorAccessToken
        });
        var createOrder = getCreateOrder({
            createOrder: inputCreateOrder,
            currency: currency,
            intent: intent,
            merchantID: merchantID,
            partnerAttributionID: partnerAttributionID,
            paymentSource: paymentSource
        }, {
            facilitatorAccessToken: facilitatorAccessToken,
            createBillingAgreement: createBillingAgreement,
            createSubscription: createSubscription,
            enableOrdersApprovalSmartWallet: enableOrdersApprovalSmartWallet,
            smartWalletOrderID: smartWalletOrderID
        });
        var onApprove = function(_ref19) {
            var intent = _ref19.intent, createSubscription = _ref19.createSubscription, onApprove = _ref19.onApprove, partnerAttributionID = _ref19.partnerAttributionID, onError = _ref19.onError, clientAccessToken = _ref19.clientAccessToken, vault = _ref19.vault, clientID = _ref19.clientID, facilitatorAccessToken = _ref19.facilitatorAccessToken, branded = _ref19.branded, createOrder = _ref19.createOrder, paymentSource = _ref19.paymentSource, featureFlags = _ref19.featureFlags;
            if (_ref19.createBillingAgreement) return function(_ref10) {
                var _ref10$onApprove = _ref10.onApprove, onApprove = void 0 === _ref10$onApprove ? function() {
                    throw new Error("Expected onApprove");
                } : _ref10$onApprove, onError = _ref10.onError, facilitatorAccessToken = _ref10.facilitatorAccessToken, createOrder = _ref10.createOrder, paymentSource = _ref10.paymentSource;
                if (!onApprove) throw new Error("Expected onApprove");
                return memoize((function(_ref11, _ref12) {
                    var payerID = _ref11.payerID, paymentID = _ref11.paymentID, billingToken = _ref11.billingToken;
                    var restart = _ref12.restart;
                    return createOrder().then((function(orderID) {
                        var _getLogger$info$track2;
                        getLogger().info("button_approve").track((_getLogger$info$track2 = {}, _getLogger$info$track2.transition_name = "process_checkout_approve", 
                        _getLogger$info$track2.context_type = "EC-Token", _getLogger$info$track2.token = orderID, 
                        _getLogger$info$track2.context_id = orderID, _getLogger$info$track2)).flush();
                        return getSupplementalOrderInfo(orderID).then((function(supplementalData) {
                            return onApprove({
                                orderID: orderID,
                                payerID: payerID,
                                paymentID: paymentID = paymentID || supplementalData && supplementalData.checkoutSession && supplementalData.checkoutSession.cart && supplementalData.checkoutSession.cart.paymentId,
                                billingToken: billingToken = billingToken || supplementalData && supplementalData.checkoutSession && supplementalData.checkoutSession.cart && supplementalData.checkoutSession.cart.billingToken,
                                facilitatorAccessToken: facilitatorAccessToken,
                                paymentSource: paymentSource
                            }, {
                                restart: restart,
                                redirect: onApprove_redirect
                            }).catch((function(err) {
                                return promise_ZalgoPromise.try((function() {
                                    return onError(err);
                                })).then((function() {
                                    throw err;
                                }));
                            }));
                        }));
                    }));
                }));
            }({
                onApprove: onApprove,
                onError: onError,
                facilitatorAccessToken: facilitatorAccessToken,
                createOrder: createOrder,
                paymentSource: paymentSource
            });
            if ("subscription" === intent || createSubscription) return function(_ref16) {
                var _ref16$onApprove = _ref16.onApprove, onApprove = void 0 === _ref16$onApprove ? function() {
                    throw new Error("Expected onApprove");
                } : _ref16$onApprove, onError = _ref16.onError, facilitatorAccessToken = _ref16.facilitatorAccessToken, createOrder = _ref16.createOrder, paymentSource = _ref16.paymentSource;
                if (!onApprove) throw new Error("Expected onApprove");
                return memoize((function(_ref17, _ref18) {
                    var payerID = _ref17.payerID, subscriptionID = _ref17.subscriptionID, buyerAccessToken = _ref17.buyerAccessToken;
                    var restart = _ref18.restart;
                    if (!subscriptionID) throw new Error("Expected subscriptionID");
                    return createOrder().then((function(orderID) {
                        var _getLogger$info$track4;
                        getLogger().info("button_approve").track((_getLogger$info$track4 = {}, _getLogger$info$track4.transition_name = "process_checkout_approve", 
                        _getLogger$info$track4.event_name = "process_checkout_approve", _getLogger$info$track4.context_type = "EC-Token", 
                        _getLogger$info$track4.token = orderID, _getLogger$info$track4.context_id = orderID, 
                        _getLogger$info$track4)).flush();
                        var data = {
                            orderID: orderID,
                            payerID: payerID,
                            subscriptionID: subscriptionID,
                            facilitatorAccessToken: facilitatorAccessToken,
                            paymentSource: paymentSource
                        };
                        var actions = function(_ref6) {
                            var restart = _ref6.restart, subscriptionID = _ref6.subscriptionID, buyerAccessToken = _ref6.buyerAccessToken;
                            return {
                                subscription: {
                                    get: memoize((function() {
                                        if (!subscriptionID) throw new Error("No subscription ID present");
                                        return function(subscriptionID, _ref7) {
                                            return callSmartAPI({
                                                accessToken: _ref7.buyerAccessToken,
                                                eventName: "billagmt_subscriptions_get",
                                                url: "/smart/api/billagmt/subscriptions/" + subscriptionID
                                            }).then((function(_ref8) {
                                                return _ref8.data;
                                            }));
                                        }(subscriptionID, {
                                            buyerAccessToken: buyerAccessToken
                                        });
                                    })),
                                    activate: memoize((function() {
                                        if (!subscriptionID) throw new Error("No subscription ID present");
                                        return function(subscriptionID, _ref5) {
                                            return callSmartAPI({
                                                accessToken: _ref5.buyerAccessToken,
                                                method: "post",
                                                eventName: "billagmt_subscriptions_activate",
                                                url: "/smart/api/billagmt/subscriptions/" + subscriptionID + "/activate"
                                            }).then((function(_ref6) {
                                                return _ref6.data;
                                            }));
                                        }(subscriptionID, {
                                            buyerAccessToken: buyerAccessToken
                                        });
                                    }))
                                },
                                restart: restart,
                                redirect: onApprove_redirect
                            };
                        }({
                            restart: restart,
                            subscriptionID: subscriptionID,
                            buyerAccessToken: buyerAccessToken
                        });
                        return onApprove(data, actions).catch((function(err) {
                            return promise_ZalgoPromise.try((function() {
                                return onError(err);
                            })).then((function() {
                                throw err;
                            }));
                        }));
                    }));
                }));
            }({
                clientID: clientID,
                onApprove: onApprove,
                onError: onError,
                facilitatorAccessToken: facilitatorAccessToken,
                createOrder: createOrder,
                paymentSource: paymentSource
            });
            if ("capture" === intent || "authorize" === intent || "order" === intent) return function(_ref7) {
                var intent = _ref7.intent, _ref7$onApprove = _ref7.onApprove, onApprove = void 0 === _ref7$onApprove ? function(intent) {
                    return function(data, actions) {
                        if ("capture" === intent) return actions.order.capture().then(src_util_noop);
                        if ("authorize" === intent) return actions.order.authorize().then(src_util_noop);
                        throw new Error("Unsupported intent for auto-capture: " + intent);
                    };
                }(intent) : _ref7$onApprove, partnerAttributionID = _ref7.partnerAttributionID, onError = _ref7.onError, clientAccessToken = _ref7.clientAccessToken, vault = _ref7.vault, facilitatorAccessToken = _ref7.facilitatorAccessToken, branded = _ref7.branded, createOrder = _ref7.createOrder, paymentSource = _ref7.paymentSource, featureFlags = _ref7.featureFlags;
                if (!onApprove) throw new Error("Expected onApprove");
                return memoize((function(_ref8, _ref9) {
                    var _ref8$accelerated = _ref8.accelerated, accelerated = void 0 !== _ref8$accelerated && _ref8$accelerated, payerID = _ref8.payerID, paymentID = _ref8.paymentID, billingToken = _ref8.billingToken, buyerAccessToken = _ref8.buyerAccessToken, authCode = _ref8.authCode, _ref8$forceRestAPI = _ref8.forceRestAPI, forceRestAPI = void 0 === _ref8$forceRestAPI ? featureFlags.isLsatUpgradable : _ref8$forceRestAPI;
                    var restart = _ref9.restart;
                    return createOrder().then((function(orderID) {
                        var _getLogger$info$track;
                        getLogger().info("button_approve").track((_getLogger$info$track = {}, _getLogger$info$track.state_name = "smart_button", 
                        _getLogger$info$track.transition_name = "process_checkout_approve", _getLogger$info$track.context_type = "EC-Token", 
                        _getLogger$info$track.token = orderID, _getLogger$info$track.context_id = orderID, 
                        _getLogger$info$track)).flush();
                        billingToken || clientAccessToken || vault || !payerID && branded && getLogger().warn("onapprove_payerid_not_present_for_branded_standalone_button", {
                            orderID: orderID
                        }).flush();
                        return getSupplementalOrderInfo(orderID).then((function(supplementalData) {
                            var data = {
                                accelerated: accelerated,
                                orderID: orderID,
                                payerID: payerID,
                                paymentID: paymentID = paymentID || supplementalData && supplementalData.checkoutSession && supplementalData.checkoutSession.cart && supplementalData.checkoutSession.cart.paymentId,
                                billingToken: billingToken = billingToken || supplementalData && supplementalData.checkoutSession && supplementalData.checkoutSession.cart && supplementalData.checkoutSession.cart.billingToken,
                                facilitatorAccessToken: facilitatorAccessToken,
                                authCode: authCode,
                                paymentSource: paymentSource
                            };
                            var actions = function(_ref3) {
                                var intent = _ref3.intent, orderID = _ref3.orderID, paymentID = _ref3.paymentID, payerID = _ref3.payerID, restart = _ref3.restart, facilitatorAccessToken = _ref3.facilitatorAccessToken, buyerAccessToken = _ref3.buyerAccessToken, partnerAttributionID = _ref3.partnerAttributionID, forceRestAPI = _ref3.forceRestAPI, onError = _ref3.onError;
                                var order = function(_ref) {
                                    var intent = _ref.intent, orderID = _ref.orderID, restart = _ref.restart, facilitatorAccessToken = _ref.facilitatorAccessToken, buyerAccessToken = _ref.buyerAccessToken, partnerAttributionID = _ref.partnerAttributionID, forceRestAPI = _ref.forceRestAPI, onError = _ref.onError;
                                    var get = memoize((function() {
                                        return getOrder(orderID, {
                                            facilitatorAccessToken: facilitatorAccessToken,
                                            buyerAccessToken: buyerAccessToken,
                                            partnerAttributionID: partnerAttributionID,
                                            forceRestAPI: forceRestAPI
                                        });
                                    }));
                                    var capture = memoize((function() {
                                        if ("capture" !== intent) throw new Error("Use intent=capture to use client-side capture");
                                        return function(orderID, _ref4) {
                                            var _headers7;
                                            var facilitatorAccessToken = _ref4.facilitatorAccessToken, buyerAccessToken = _ref4.buyerAccessToken, partnerAttributionID = _ref4.partnerAttributionID, _ref4$forceRestAPI = _ref4.forceRestAPI, forceRestAPI = void 0 !== _ref4$forceRestAPI && _ref4$forceRestAPI;
                                            getLogger().info("capture_order_lsat_upgrade_" + (getLsatUpgradeCalled() ? "called" : "not_called"));
                                            getLogger().info("capture_order_lsat_upgrade_" + (getLsatUpgradeError() ? "errored" : "did_not_error"), {
                                                err: stringifyError(getLsatUpgradeError())
                                            });
                                            if (forceRestAPI && !getLsatUpgradeError()) {
                                                var _headers5;
                                                return callRestAPI({
                                                    accessToken: facilitatorAccessToken,
                                                    method: "post",
                                                    eventName: "v2_checkout_orders_capture",
                                                    url: ORDERS_API_URL + "/" + orderID + "/capture",
                                                    headers: (_headers5 = {}, _headers5["paypal-partner-attribution-id"] = partnerAttributionID || "", 
                                                    _headers5.prefer = "return=representation", _headers5["paypal-request-id"] = orderID, 
                                                    _headers5)
                                                }).catch((function(err) {
                                                    var _headers6;
                                                    var restCorrID = getErrorResponseCorrelationID(err);
                                                    getLogger().warn("capture_order_call_rest_api_error", {
                                                        restCorrID: restCorrID,
                                                        orderID: orderID,
                                                        err: stringifyError(err)
                                                    });
                                                    isInvalidResourceIDError(err) && getLogger().warn("capture_order_invalid_resource_id_error", {
                                                        restCorrID: restCorrID,
                                                        orderID: orderID,
                                                        err: stringifyError(err)
                                                    });
                                                    if (isProcessorDeclineError(err) || isUnprocessableEntityError(err)) throw err;
                                                    return callSmartAPI({
                                                        accessToken: buyerAccessToken,
                                                        method: "post",
                                                        eventName: "order_capture",
                                                        url: "/smart/api/order/" + orderID + "/capture",
                                                        headers: (_headers6 = {}, _headers6["paypal-client-context"] = orderID, _headers6)
                                                    }).then((function(res) {
                                                        var smartCorrID = getResponseCorrelationID(res);
                                                        getLogger().info("capture_order_smart_fallback_success", {
                                                            smartCorrID: smartCorrID,
                                                            restCorrID: restCorrID,
                                                            orderID: orderID
                                                        });
                                                        return res.data;
                                                    })).catch((function(smartErr) {
                                                        var smartCorrID = getErrorResponseCorrelationID(err);
                                                        getLogger().info("capture_order_smart_fallback_error", {
                                                            smartCorrID: smartCorrID,
                                                            restCorrID: restCorrID,
                                                            orderID: orderID,
                                                            err: stringifyError(smartErr)
                                                        });
                                                        throw smartErr;
                                                    }));
                                                }));
                                            }
                                            return callSmartAPI({
                                                accessToken: buyerAccessToken,
                                                method: "post",
                                                eventName: "order_capture",
                                                url: "/smart/api/order/" + orderID + "/capture",
                                                headers: (_headers7 = {}, _headers7["paypal-client-context"] = orderID, _headers7)
                                            }).then((function(_ref5) {
                                                return _ref5.data;
                                            }));
                                        }(orderID, {
                                            facilitatorAccessToken: facilitatorAccessToken,
                                            buyerAccessToken: buyerAccessToken,
                                            partnerAttributionID: partnerAttributionID,
                                            forceRestAPI: forceRestAPI
                                        }).finally(get.reset).finally(capture.reset).catch((function(err) {
                                            return onApprove_handleProcessorError(err, restart, onError);
                                        }));
                                    }));
                                    var authorize = memoize((function() {
                                        if ("authorize" !== intent) throw new Error("Use intent=authorize to use client-side authorize");
                                        return function(orderID, _ref6) {
                                            var _headers10;
                                            var facilitatorAccessToken = _ref6.facilitatorAccessToken, buyerAccessToken = _ref6.buyerAccessToken, partnerAttributionID = _ref6.partnerAttributionID, _ref6$forceRestAPI = _ref6.forceRestAPI, forceRestAPI = void 0 !== _ref6$forceRestAPI && _ref6$forceRestAPI;
                                            getLogger().info("authorize_order_lsat_upgrade_" + (getLsatUpgradeCalled() ? "called" : "not_called"));
                                            getLogger().info("authorize_order_lsat_upgrade_" + (getLsatUpgradeError() ? "errored" : "did_not_error"), {
                                                err: stringifyError(getLsatUpgradeError())
                                            });
                                            if (forceRestAPI && !getLsatUpgradeError()) {
                                                var _headers8;
                                                return callRestAPI({
                                                    accessToken: facilitatorAccessToken,
                                                    method: "post",
                                                    eventName: "v2_checkout_orders_authorize",
                                                    url: ORDERS_API_URL + "/" + orderID + "/authorize",
                                                    headers: (_headers8 = {}, _headers8["paypal-partner-attribution-id"] = partnerAttributionID || "", 
                                                    _headers8.prefer = "return=representation", _headers8)
                                                }).catch((function(err) {
                                                    var _headers9;
                                                    var restCorrID = getErrorResponseCorrelationID(err);
                                                    getLogger().warn("authorize_order_call_rest_api_error", {
                                                        restCorrID: restCorrID,
                                                        orderID: orderID,
                                                        err: stringifyError(err)
                                                    });
                                                    isInvalidResourceIDError(err) && getLogger().warn("authorize_order_invalid_resource_id_error", {
                                                        restCorrID: restCorrID,
                                                        orderID: orderID,
                                                        err: stringifyError(err)
                                                    });
                                                    if (isProcessorDeclineError(err)) throw err;
                                                    return callSmartAPI({
                                                        accessToken: buyerAccessToken,
                                                        method: "post",
                                                        eventName: "order_authorize",
                                                        url: "/smart/api/order/" + orderID + "/authorize",
                                                        headers: (_headers9 = {}, _headers9["paypal-client-context"] = orderID, _headers9)
                                                    }).then((function(res) {
                                                        var smartCorrID = getResponseCorrelationID(res);
                                                        getLogger().info("authorize_order_smart_fallback_success", {
                                                            smartCorrID: smartCorrID,
                                                            restCorrID: restCorrID,
                                                            orderID: orderID
                                                        });
                                                        return res.data;
                                                    })).catch((function(smartErr) {
                                                        var smartCorrID = getErrorResponseCorrelationID(err);
                                                        getLogger().info("authorize_order_smart_fallback_error", {
                                                            smartCorrID: smartCorrID,
                                                            restCorrID: restCorrID,
                                                            orderID: orderID,
                                                            err: stringifyError(smartErr)
                                                        });
                                                        throw smartErr;
                                                    }));
                                                }));
                                            }
                                            getLogger().info("lsat_upgrade_false");
                                            return callSmartAPI({
                                                accessToken: buyerAccessToken,
                                                method: "post",
                                                eventName: "order_authorize",
                                                url: "/smart/api/order/" + orderID + "/authorize",
                                                headers: (_headers10 = {}, _headers10["paypal-client-context"] = orderID, _headers10)
                                            }).then((function(_ref7) {
                                                return _ref7.data;
                                            }));
                                        }(orderID, {
                                            facilitatorAccessToken: facilitatorAccessToken,
                                            buyerAccessToken: buyerAccessToken,
                                            partnerAttributionID: partnerAttributionID,
                                            forceRestAPI: forceRestAPI
                                        }).finally(get.reset).finally(authorize.reset).catch((function(err) {
                                            return onApprove_handleProcessorError(err, restart, onError);
                                        }));
                                    }));
                                    return {
                                        capture: capture,
                                        authorize: authorize,
                                        patch: function(data) {
                                            void 0 === data && (data = {});
                                            return patchOrder(orderID, data, {
                                                facilitatorAccessToken: facilitatorAccessToken,
                                                buyerAccessToken: buyerAccessToken,
                                                partnerAttributionID: partnerAttributionID,
                                                forceRestAPI: forceRestAPI
                                            }).catch((function() {
                                                throw new Error("Order could not be patched");
                                            }));
                                        },
                                        get: get
                                    };
                                }({
                                    intent: intent,
                                    orderID: orderID,
                                    paymentID: paymentID,
                                    payerID: payerID,
                                    restart: restart,
                                    facilitatorAccessToken: facilitatorAccessToken,
                                    buyerAccessToken: buyerAccessToken,
                                    partnerAttributionID: partnerAttributionID,
                                    forceRestAPI: forceRestAPI,
                                    onError: onError
                                });
                                !function(_ref2) {
                                    var intent = _ref2.intent, paymentID = _ref2.paymentID, payerID = _ref2.payerID, restart = _ref2.restart, facilitatorAccessToken = _ref2.facilitatorAccessToken, buyerAccessToken = _ref2.buyerAccessToken, partnerAttributionID = _ref2.partnerAttributionID, onError = _ref2.onError;
                                    if (paymentID) {
                                        var get = memoize((function() {
                                            return function(paymentID, _ref4) {
                                                var _headers2;
                                                return callRestAPI({
                                                    accessToken: _ref4.facilitatorAccessToken,
                                                    eventName: "v1_payments_payment_get",
                                                    url: "/v1/payments/payment/" + paymentID,
                                                    headers: (_headers2 = {}, _headers2["paypal-partner-attribution-id"] = _ref4.partnerAttributionID || "", 
                                                    _headers2)
                                                });
                                            }(paymentID, {
                                                facilitatorAccessToken: facilitatorAccessToken,
                                                buyerAccessToken: buyerAccessToken,
                                                partnerAttributionID: partnerAttributionID
                                            });
                                        }));
                                        var execute = memoize((function() {
                                            if (!payerID) throw new Error("payerID required for payment execute");
                                            if ("capture" !== intent) throw new Error("Use intent=capture to use client-side capture");
                                            return function(paymentID, payerID, _ref5) {
                                                var _headers3;
                                                return callRestAPI({
                                                    accessToken: _ref5.facilitatorAccessToken,
                                                    method: "post",
                                                    eventName: "v1_payments_payment_execute",
                                                    url: "/v1/payments/payment/" + paymentID + "/execute",
                                                    headers: (_headers3 = {}, _headers3["paypal-partner-attribution-id"] = _ref5.partnerAttributionID || "", 
                                                    _headers3),
                                                    data: {
                                                        payer_id: payerID
                                                    }
                                                });
                                            }(paymentID, payerID, {
                                                facilitatorAccessToken: facilitatorAccessToken,
                                                buyerAccessToken: buyerAccessToken,
                                                partnerAttributionID: partnerAttributionID
                                            }).finally(get.reset).finally(execute.reset).catch((function(err) {
                                                return onApprove_handleProcessorError(err, restart, onError);
                                            }));
                                        }));
                                    }
                                }({
                                    intent: intent,
                                    orderID: orderID,
                                    paymentID: paymentID,
                                    payerID: payerID,
                                    restart: restart,
                                    facilitatorAccessToken: facilitatorAccessToken,
                                    buyerAccessToken: buyerAccessToken,
                                    partnerAttributionID: partnerAttributionID,
                                    forceRestAPI: forceRestAPI,
                                    onError: onError
                                });
                                return {
                                    order: order,
                                    payment: null,
                                    restart: restart,
                                    redirect: onApprove_redirect
                                };
                            }({
                                orderID: orderID,
                                paymentID: paymentID,
                                payerID: payerID,
                                intent: intent,
                                restart: restart,
                                facilitatorAccessToken: facilitatorAccessToken,
                                buyerAccessToken: buyerAccessToken,
                                partnerAttributionID: partnerAttributionID,
                                forceRestAPI: forceRestAPI,
                                onError: onError
                            });
                            return onApprove(data, actions).catch((function(err) {
                                return promise_ZalgoPromise.try((function() {
                                    return onError(err);
                                })).then((function() {
                                    throw err;
                                }));
                            }));
                        }));
                    }));
                }));
            }({
                intent: intent,
                onApprove: onApprove,
                partnerAttributionID: partnerAttributionID,
                onError: onError,
                clientAccessToken: clientAccessToken,
                vault: vault,
                facilitatorAccessToken: facilitatorAccessToken,
                branded: branded,
                createOrder: createOrder,
                paymentSource: paymentSource,
                featureFlags: featureFlags
            });
            if ("tokenize" === intent) return function(_ref13) {
                var _ref13$onApprove = _ref13.onApprove, onApprove = void 0 === _ref13$onApprove ? function() {
                    throw new Error("Expected onApprove");
                } : _ref13$onApprove, onError = _ref13.onError, facilitatorAccessToken = _ref13.facilitatorAccessToken, paymentSource = _ref13.paymentSource;
                if (!onApprove) throw new Error("Expected onApprove");
                return memoize((function(_ref14, _ref15) {
                    var _getLogger$info$track3;
                    var paymentMethodToken = _ref14.paymentMethodToken;
                    var restart = _ref15.restart;
                    if (!paymentMethodToken) throw new Error("Payment method token required for tokenize onApprove");
                    getLogger().info("button_approve").track((_getLogger$info$track3 = {}, _getLogger$info$track3.transition_name = "process_tokenize_approve", 
                    _getLogger$info$track3)).flush();
                    return onApprove({
                        facilitatorAccessToken: facilitatorAccessToken,
                        paymentMethodToken: paymentMethodToken,
                        paymentSource: paymentSource
                    }, {
                        restart: restart,
                        redirect: onApprove_redirect
                    }).catch((function(err) {
                        return promise_ZalgoPromise.try((function() {
                            return onError(err);
                        })).then((function() {
                            throw err;
                        }));
                    }));
                }));
            }({
                onApprove: onApprove,
                onError: onError,
                facilitatorAccessToken: facilitatorAccessToken,
                paymentSource: paymentSource
            });
            throw new Error("Unsupported intent: " + intent);
        }({
            onApprove: inputOnApprove,
            createBillingAgreement: createBillingAgreement,
            createSubscription: createSubscription,
            intent: intent,
            onError: onError,
            partnerAttributionID: partnerAttributionID,
            clientAccessToken: clientAccessToken,
            vault: vault,
            clientID: clientID,
            facilitatorAccessToken: facilitatorAccessToken,
            branded: branded,
            createOrder: createOrder,
            paymentSource: paymentSource,
            featureFlags: featureFlags
        });
        var onComplete = function(_ref2) {
            var intent = _ref2.intent, onComplete = _ref2.onComplete, partnerAttributionID = _ref2.partnerAttributionID, onError = _ref2.onError, facilitatorAccessToken = _ref2.facilitatorAccessToken, createOrder = _ref2.createOrder, featureFlags = _ref2.featureFlags;
            return onComplete ? memoize((function(_ref3) {
                var buyerAccessToken = _ref3.buyerAccessToken, _ref3$forceRestAPI = _ref3.forceRestAPI, forceRestAPI = void 0 === _ref3$forceRestAPI ? featureFlags.isLsatUpgradable : _ref3$forceRestAPI;
                return createOrder().then((function(orderID) {
                    var _getLogger$info$track;
                    getLogger().info("button_complete").track((_getLogger$info$track = {}, _getLogger$info$track.transition_name = "process_checkout_complete", 
                    _getLogger$info$track.event_name = "process_checkout_complete", _getLogger$info$track.context_type = "EC-Token", 
                    _getLogger$info$track.token = orderID, _getLogger$info$track.context_id = orderID, 
                    _getLogger$info$track)).flush();
                    var actions = function(_ref) {
                        var orderID = _ref.orderID, facilitatorAccessToken = _ref.facilitatorAccessToken, buyerAccessToken = _ref.buyerAccessToken, partnerAttributionID = _ref.partnerAttributionID, forceRestAPI = _ref.forceRestAPI;
                        var get = memoize((function() {
                            return getOrder(orderID, {
                                facilitatorAccessToken: facilitatorAccessToken,
                                buyerAccessToken: buyerAccessToken,
                                partnerAttributionID: partnerAttributionID,
                                forceRestAPI: forceRestAPI
                            }).finally(get.reset);
                        }));
                        return {
                            order: {
                                get: get
                            },
                            redirect: onComplete_redirect
                        };
                    }({
                        orderID: orderID,
                        facilitatorAccessToken: facilitatorAccessToken,
                        buyerAccessToken: buyerAccessToken,
                        partnerAttributionID: partnerAttributionID,
                        forceRestAPI: forceRestAPI,
                        onError: onError
                    });
                    return onComplete({
                        orderID: orderID,
                        intent: intent
                    }, actions).catch((function(err) {
                        return promise_ZalgoPromise.try((function() {
                            return onError(err);
                        })).then((function() {
                            throw err;
                        }));
                    }));
                }));
            })) : promiseNoop;
        }({
            intent: intent,
            onComplete: inputOnComplete,
            partnerAttributionID: partnerAttributionID,
            onError: onError,
            clientID: clientID,
            facilitatorAccessToken: facilitatorAccessToken,
            createOrder: createOrder,
            featureFlags: featureFlags
        });
        var onCancel = function(_ref2, _ref3) {
            var _ref2$onCancel = _ref2.onCancel, onCancel = void 0 === _ref2$onCancel ? promiseNoop : _ref2$onCancel, onError = _ref2.onError;
            var createOrder = _ref3.createOrder;
            return memoize((function() {
                return createOrder().then((function(orderID) {
                    var _getLogger$info$track;
                    getLogger().info("button_cancel").track((_getLogger$info$track = {}, _getLogger$info$track.transition_name = "process_checkout_cancel", 
                    _getLogger$info$track.event_name = "process_checkout_cancel", _getLogger$info$track.context_type = "EC-Token", 
                    _getLogger$info$track.token = orderID, _getLogger$info$track.context_id = orderID, 
                    _getLogger$info$track)).flush();
                    return onCancel({
                        orderID: {
                            orderID: orderID
                        }.orderID
                    }, {
                        redirect: function(url) {
                            if (!url) throw new Error("Expected redirect url");
                            if (-1 === url.indexOf("://")) {
                                getLogger().warn("redir_url_non_scheme", {
                                    url: url
                                }).flush();
                                throw new Error("Invalid redirect url: " + url + " - must be fully qualified url");
                            }
                            url.match(/^https?:\/\//) || getLogger().warn("redir_url_non_http", {
                                url: url
                            }).flush();
                            return dom_redirect(url, window.top);
                        }
                    });
                })).catch((function(err) {
                    return onError(err);
                }));
            }));
        }({
            onCancel: inputOnCancel,
            onError: onError
        }, {
            createOrder: createOrder
        });
        var onShippingChange = function(_ref2, _ref3) {
            var onShippingChange = _ref2.onShippingChange, partnerAttributionID = _ref2.partnerAttributionID, featureFlags = _ref2.featureFlags, experiments = _ref2.experiments, clientID = _ref2.clientID;
            var facilitatorAccessToken = _ref3.facilitatorAccessToken, createOrder = _ref3.createOrder;
            if (onShippingChange) return function(_ref4, actions) {
                var buyerAccessToken = _ref4.buyerAccessToken, _ref4$forceRestAPI = _ref4.forceRestAPI, forceRestAPI = void 0 === _ref4$forceRestAPI ? featureFlags.isLsatUpgradable : _ref4$forceRestAPI, data = _objectWithoutPropertiesLoose(_ref4, _excluded);
                return createOrder().then((function(orderID) {
                    var _getLogger$info$track;
                    getLogger().info("button_shipping_change").track((_getLogger$info$track = {}, _getLogger$info$track.transition_name = "process_checkout_shipping_change", 
                    _getLogger$info$track.event_name = "process_checkout_shipping_change", _getLogger$info$track.context_type = "EC-Token", 
                    _getLogger$info$track.token = orderID, _getLogger$info$track.context_id = orderID, 
                    _getLogger$info$track.shipping_callback_invoked = "1", _getLogger$info$track)).flush();
                    return onShippingChange(data, function(_ref) {
                        var orderID = _ref.orderID, facilitatorAccessToken = _ref.facilitatorAccessToken, buyerAccessToken = _ref.buyerAccessToken, partnerAttributionID = _ref.partnerAttributionID, forceRestAPI = _ref.forceRestAPI, clientID = _ref.clientID;
                        var useShippingChangeCallbackMutation = _ref.experiments.useShippingChangeCallbackMutation;
                        return {
                            resolve: function() {
                                return promise_ZalgoPromise.resolve();
                            },
                            reject: _ref.actions.reject || function() {
                                throw new Error("Missing reject action callback");
                            },
                            order: {
                                patch: function(data) {
                                    void 0 === data && (data = {});
                                    return useShippingChangeCallbackMutation ? patchShipping({
                                        clientID: clientID,
                                        data: data,
                                        orderID: orderID
                                    }).catch((function() {
                                        throw new Error("Order could not be patched");
                                    })) : patchOrder(orderID, data, {
                                        facilitatorAccessToken: facilitatorAccessToken,
                                        buyerAccessToken: buyerAccessToken,
                                        partnerAttributionID: partnerAttributionID,
                                        forceRestAPI: forceRestAPI
                                    }).catch((function() {
                                        throw new Error("Order could not be patched");
                                    }));
                                }
                            }
                        };
                    }({
                        orderID: orderID,
                        facilitatorAccessToken: facilitatorAccessToken,
                        buyerAccessToken: buyerAccessToken,
                        actions: actions,
                        partnerAttributionID: partnerAttributionID,
                        forceRestAPI: forceRestAPI,
                        clientID: clientID,
                        experiments: experiments
                    }));
                }));
            };
        }({
            onShippingChange: inputOnShippingChange,
            partnerAttributionID: partnerAttributionID,
            experiments: experiments,
            featureFlags: featureFlags,
            clientID: clientID
        }, {
            facilitatorAccessToken: facilitatorAccessToken,
            createOrder: createOrder
        });
        var onShippingAddressChange = function(_ref5, _ref6) {
            var onShippingAddressChange = _ref5.onShippingAddressChange, clientID = _ref5.clientID;
            var createOrder = _ref6.createOrder;
            if (onShippingAddressChange) return function(_ref7, actions) {
                var data = _extends({}, (_objectDestructuringEmpty(_ref7), _ref7));
                return createOrder().then((function(orderID) {
                    var _getLogger$info$track;
                    getLogger().info("button_shipping_address_change").track((_getLogger$info$track = {}, 
                    _getLogger$info$track.transition_name = "process_checkout_shipping_address_change", 
                    _getLogger$info$track.event_name = "process_checkout_shipping_address_change", _getLogger$info$track.context_type = "EC-Token", 
                    _getLogger$info$track.token = orderID, _getLogger$info$track.context_id = orderID, 
                    _getLogger$info$track.shipping_callback_invoked = "1", _getLogger$info$track)).flush();
                    return onShippingAddressChange(function(data) {
                        var shippingAddress = data.shipping_address, rest = _objectWithoutPropertiesLoose(data, onShippingAddressChange_excluded);
                        return _extends({
                            errors: SHIPPING_ADDRESS_ERROR_MESSAGES,
                            shippingAddress: shippingAddress
                        }, rest);
                    }(data), function(_ref) {
                        var _data$amount;
                        var clientID = _ref.clientID, data = _ref.data, passedActions = _ref.actions, orderID = _ref.orderID;
                        var patchQueries = {};
                        var newAmount;
                        var breakdown = (null == (_data$amount = data.amount) ? void 0 : _data$amount.breakdown) || {};
                        if (0 === Object.keys(breakdown).length) throw new Error("Must pass amount with breakdown into data attribute for onShippingAddressChange callback.");
                        var actions = {
                            reject: passedActions.reject ? function(message) {
                                return -1 === Object.values(SHIPPING_ADDRESS_ERROR_MESSAGES).indexOf(message) ? passedActions.reject("Unable to update address. Please try again.") : passedActions.reject(message);
                            } : function() {
                                throw new Error("Missing reject action callback");
                            },
                            updateTax: function(_ref2) {
                                var _data$amount2;
                                var tax = _ref2.tax;
                                breakdown = buildBreakdown({
                                    breakdown: breakdown,
                                    updatedAmounts: {
                                        tax_total: tax
                                    }
                                });
                                newAmount = calculateTotalFromShippingBreakdownAmounts({
                                    breakdown: breakdown,
                                    updatedAmounts: {
                                        tax_total: tax
                                    }
                                });
                                patchQueries[ON_SHIPPING_CHANGE_PATHS_AMOUNT] = {
                                    op: "replace",
                                    path: ON_SHIPPING_CHANGE_PATHS_AMOUNT,
                                    value: {
                                        value: "" + newAmount,
                                        currency_code: null == data || null == (_data$amount2 = data.amount) ? void 0 : _data$amount2.currency_code,
                                        breakdown: breakdown
                                    }
                                };
                                return actions;
                            },
                            updateShippingOptions: function(_ref3) {
                                var _selectedShippingOpti, _selectedShippingOpti2, _data$amount3;
                                var options = _ref3.options;
                                var selectedShippingOption = options.filter((function(option) {
                                    return !0 === option.selected;
                                }));
                                var selectedShippingOptionAmount = selectedShippingOption && selectedShippingOption.length > 0 ? null == (_selectedShippingOpti = selectedShippingOption[0]) || null == (_selectedShippingOpti2 = _selectedShippingOpti.amount) ? void 0 : _selectedShippingOpti2.value : "0.00";
                                breakdown = buildBreakdown({
                                    breakdown: breakdown,
                                    updatedAmounts: {
                                        shipping: selectedShippingOptionAmount
                                    }
                                });
                                newAmount = calculateTotalFromShippingBreakdownAmounts({
                                    breakdown: breakdown,
                                    updatedAmounts: {
                                        shipping: selectedShippingOptionAmount
                                    }
                                });
                                patchQueries[ON_SHIPPING_CHANGE_PATHS_AMOUNT] = {
                                    op: "replace",
                                    path: ON_SHIPPING_CHANGE_PATHS_AMOUNT,
                                    value: {
                                        value: "" + newAmount,
                                        currency_code: null == data || null == (_data$amount3 = data.amount) ? void 0 : _data$amount3.currency_code,
                                        breakdown: breakdown
                                    }
                                };
                                patchQueries[ON_SHIPPING_CHANGE_PATHS_OPTIONS] = {
                                    op: (null == data ? void 0 : data.event) || "replace",
                                    path: ON_SHIPPING_CHANGE_PATHS_OPTIONS,
                                    value: options
                                };
                                return actions;
                            },
                            updateShippingDiscount: function(_ref4) {
                                var _data$amount4;
                                var discount = _ref4.discount;
                                newAmount = calculateTotalFromShippingBreakdownAmounts({
                                    breakdown: breakdown,
                                    updatedAmounts: {
                                        shipping_discount: discount
                                    }
                                });
                                breakdown = buildBreakdown({
                                    breakdown: breakdown,
                                    updatedAmounts: {
                                        shipping_discount: discount
                                    }
                                });
                                patchQueries[ON_SHIPPING_CHANGE_PATHS_AMOUNT] = {
                                    op: "replace",
                                    path: ON_SHIPPING_CHANGE_PATHS_AMOUNT,
                                    value: {
                                        value: "" + newAmount,
                                        currency_code: null == data || null == (_data$amount4 = data.amount) ? void 0 : _data$amount4.currency_code,
                                        breakdown: breakdown
                                    }
                                };
                                return actions;
                            },
                            patch: function() {
                                return order_getShippingOrderInfo(orderID).then((function(sessionData) {
                                    var _sessionData$checkout, _sessionData$checkout2;
                                    var queries;
                                    var shippingMethods = (null == sessionData || null == (_sessionData$checkout = sessionData.checkoutSession) || null == (_sessionData$checkout2 = _sessionData$checkout.cart) ? void 0 : _sessionData$checkout2.shippingMethods) || [];
                                    queries = Boolean(shippingMethods.length > 0) ? utils_updateOperationForShippingOptions({
                                        queries: patchQueries
                                    }) : convertQueriesToArray({
                                        queries: patchQueries
                                    });
                                    return patchShipping({
                                        clientID: clientID,
                                        orderID: orderID,
                                        data: queries
                                    }).catch((function() {
                                        throw new Error("Order could not be patched");
                                    }));
                                }));
                            },
                            query: function() {
                                return order_getShippingOrderInfo(orderID).then((function(sessionData) {
                                    var _sessionData$checkout3, _sessionData$checkout4;
                                    var shippingMethods = (null == sessionData || null == (_sessionData$checkout3 = sessionData.checkoutSession) || null == (_sessionData$checkout4 = _sessionData$checkout3.cart) ? void 0 : _sessionData$checkout4.shippingMethods) || [];
                                    return Boolean(shippingMethods.length > 0) ? utils_updateOperationForShippingOptions({
                                        queries: patchQueries
                                    }) : convertQueriesToArray({
                                        queries: patchQueries
                                    });
                                }));
                            }
                        };
                        return actions;
                    }({
                        clientID: clientID,
                        data: data,
                        actions: actions,
                        orderID: orderID
                    }));
                }));
            };
        }({
            onShippingAddressChange: inputOnShippingAddressChange,
            clientID: clientID
        }, {
            createOrder: createOrder
        });
        var onShippingOptionsChange = function(_ref4, _ref5) {
            var onShippingOptionsChange = _ref4.onShippingOptionsChange, clientID = _ref4.clientID;
            var createOrder = _ref5.createOrder;
            if (onShippingOptionsChange) return function(_ref6, actions) {
                var data = _extends({}, (_objectDestructuringEmpty(_ref6), _ref6));
                return createOrder().then((function(orderID) {
                    var _getLogger$info$track;
                    getLogger().info("button_shipping_options_change").track((_getLogger$info$track = {}, 
                    _getLogger$info$track.transition_name = "process_checkout_shipping_options_change", 
                    _getLogger$info$track.event_name = "process_checkout_shipping_options_change", _getLogger$info$track.context_type = "EC-Token", 
                    _getLogger$info$track.token = orderID, _getLogger$info$track.context_id = orderID, 
                    _getLogger$info$track.shipping_callback_invoked = "1", _getLogger$info$track)).flush();
                    return onShippingOptionsChange(function(data) {
                        var selectedShippingOption = data.selected_shipping_option, rest = _objectWithoutPropertiesLoose(data, onShippingOptionsChange_excluded);
                        return _extends({
                            errors: SHIPPING_OPTIONS_ERROR_MESSAGES,
                            selectedShippingOption: selectedShippingOption
                        }, rest);
                    }(data), function(_ref) {
                        var _data$amount;
                        var clientID = _ref.clientID, data = _ref.data, passedActions = _ref.actions, orderID = _ref.orderID;
                        var patchQueries = {};
                        var newAmount;
                        var breakdown = (null == (_data$amount = data.amount) ? void 0 : _data$amount.breakdown) || {};
                        if (0 === Object.keys(breakdown).length) throw new Error("Must pass breakdown into data attribute for onShippingAddressChange callback.");
                        var actions = {
                            reject: passedActions.reject ? function(message) {
                                return -1 === Object.values(SHIPPING_OPTIONS_ERROR_MESSAGES).indexOf(message) ? passedActions.reject("Unable to update address. Please try again.") : passedActions.reject(message);
                            } : function() {
                                throw new Error("Missing reject action callback");
                            },
                            updateShippingOption: function(_ref2) {
                                var option = _ref2.option;
                                if (option && data.options) {
                                    var _option$amount, _data$amount2, _data$amount3;
                                    var selectedShippingOptionAmount = null == option || null == (_option$amount = option.amount) ? void 0 : _option$amount.value;
                                    var options = function(_ref4) {
                                        var option = _ref4.option;
                                        var updatedOptions = [];
                                        _ref4.options.forEach((function(opt) {
                                            if (!opt.id) throw new Error("Must provide an id with each shipping option.");
                                            if (opt.id === option.id) {
                                                opt.selected = !0;
                                                updatedOptions.push(opt);
                                            } else {
                                                opt.selected = !1;
                                                updatedOptions.push(opt);
                                            }
                                        }));
                                        return updatedOptions;
                                    }({
                                        option: option,
                                        options: data.options
                                    });
                                    newAmount = calculateTotalFromShippingBreakdownAmounts({
                                        breakdown: (null == data || null == (_data$amount2 = data.amount) ? void 0 : _data$amount2.breakdown) || {},
                                        updatedAmounts: {
                                            shipping: selectedShippingOptionAmount
                                        }
                                    });
                                    breakdown = buildBreakdown({
                                        breakdown: breakdown,
                                        updatedAmounts: {
                                            shipping: selectedShippingOptionAmount
                                        }
                                    });
                                    options && options.length > 0 && (patchQueries[ON_SHIPPING_CHANGE_PATHS_OPTIONS] = {
                                        op: (null == data ? void 0 : data.event) || "replace",
                                        path: ON_SHIPPING_CHANGE_PATHS_OPTIONS,
                                        value: options
                                    });
                                    patchQueries[ON_SHIPPING_CHANGE_PATHS_AMOUNT] = {
                                        op: "replace",
                                        path: ON_SHIPPING_CHANGE_PATHS_AMOUNT,
                                        value: {
                                            value: "" + newAmount,
                                            currency_code: null == data || null == (_data$amount3 = data.amount) ? void 0 : _data$amount3.currency_code,
                                            breakdown: breakdown
                                        }
                                    };
                                }
                                return actions;
                            },
                            updateShippingDiscount: function(_ref3) {
                                var _data$amount4, _data$amount5;
                                var discount = _ref3.discount;
                                newAmount = calculateTotalFromShippingBreakdownAmounts({
                                    breakdown: (null == data || null == (_data$amount4 = data.amount) ? void 0 : _data$amount4.breakdown) || {},
                                    updatedAmounts: {
                                        shipping_discount: discount
                                    }
                                });
                                breakdown = buildBreakdown({
                                    breakdown: breakdown,
                                    updatedAmounts: {
                                        shipping_discount: discount
                                    }
                                });
                                patchQueries[ON_SHIPPING_CHANGE_PATHS_AMOUNT] = {
                                    op: "replace",
                                    path: ON_SHIPPING_CHANGE_PATHS_AMOUNT,
                                    value: {
                                        value: "" + newAmount,
                                        currency_code: null == data || null == (_data$amount5 = data.amount) ? void 0 : _data$amount5.currency_code,
                                        breakdown: breakdown
                                    }
                                };
                                return actions;
                            },
                            patch: function() {
                                return order_getShippingOrderInfo(orderID).then((function(sessionData) {
                                    var _sessionData$checkout, _sessionData$checkout2;
                                    var queries;
                                    var shippingMethods = (null == sessionData || null == (_sessionData$checkout = sessionData.checkoutSession) || null == (_sessionData$checkout2 = _sessionData$checkout.cart) ? void 0 : _sessionData$checkout2.shippingMethods) || [];
                                    queries = Boolean(shippingMethods.length > 0) ? utils_updateOperationForShippingOptions({
                                        queries: patchQueries
                                    }) : convertQueriesToArray({
                                        queries: patchQueries
                                    });
                                    return patchShipping({
                                        clientID: clientID,
                                        orderID: orderID,
                                        data: queries
                                    }).catch((function() {
                                        throw new Error("Order could not be patched");
                                    }));
                                }));
                            },
                            query: function() {
                                return order_getShippingOrderInfo(orderID).then((function(sessionData) {
                                    var _sessionData$checkout3, _sessionData$checkout4;
                                    var shippingMethods = (null == sessionData || null == (_sessionData$checkout3 = sessionData.checkoutSession) || null == (_sessionData$checkout4 = _sessionData$checkout3.cart) ? void 0 : _sessionData$checkout4.shippingMethods) || [];
                                    return Boolean(shippingMethods.length > 0) ? utils_updateOperationForShippingOptions({
                                        queries: patchQueries
                                    }) : convertQueriesToArray({
                                        queries: patchQueries
                                    });
                                }));
                            }
                        };
                        return actions;
                    }({
                        clientID: clientID,
                        data: data,
                        actions: actions,
                        orderID: orderID
                    }));
                }));
            };
        }({
            onShippingOptionsChange: inputOnShippingOptionsChange,
            clientID: clientID
        }, {
            createOrder: createOrder
        });
        var onAuth = function(_ref) {
            var facilitatorAccessToken = _ref.facilitatorAccessToken, createOrder = _ref.createOrder, createSubscription = _ref.createSubscription, featureFlags = _ref.featureFlags;
            return function(_ref2) {
                var accessToken = _ref2.accessToken;
                getLogger().info("spb_onauth_access_token_" + (accessToken ? "present" : "not_present"));
                return promise_ZalgoPromise.try((function() {
                    if (accessToken) return featureFlags.isLsatUpgradable ? createOrder().then((function(orderID) {
                        return createSubscription ? accessToken : function(facilitatorAccessToken, _ref3) {
                            var _headers;
                            var buyerAccessToken = _ref3.buyerAccessToken, orderID = _ref3.orderID;
                            !function() {
                                lsatUpgradeCalled = !1;
                                lsatUpgradeError = null;
                            }();
                            lsatUpgradeCalled = !0;
                            return callGraphQL({
                                name: "UpgradeFacilitatorAccessToken",
                                headers: (_headers = {}, _headers["x-paypal-internal-euat"] = buyerAccessToken, 
                                _headers["paypal-client-context"] = orderID, _headers),
                                query: "\n            mutation UpgradeFacilitatorAccessToken(\n                $orderID: String!\n                $buyerAccessToken: String!\n                $facilitatorAccessToken: String!\n            ) {\n                upgradeLowScopeAccessToken(\n                    token: $orderID\n                    buyerAccessToken: $buyerAccessToken\n                    merchantLSAT: $facilitatorAccessToken\n                )\n            }\n        ",
                                variables: {
                                    facilitatorAccessToken: facilitatorAccessToken,
                                    buyerAccessToken: buyerAccessToken,
                                    orderID: orderID
                                }
                            }).then(src_util_noop).catch((function(err) {
                                !function(err) {
                                    lsatUpgradeError = err;
                                }(err);
                                throw err;
                            }));
                        }(facilitatorAccessToken, {
                            buyerAccessToken: accessToken,
                            orderID: orderID
                        });
                    })).then((function() {
                        getLogger().info("upgrade_lsat_success");
                        return accessToken;
                    })).catch((function(err) {
                        getLogger().warn("upgrade_lsat_failure", {
                            error: stringifyError(err)
                        });
                        return accessToken;
                    })) : accessToken;
                }));
            };
        }({
            facilitatorAccessToken: facilitatorAccessToken,
            createOrder: createOrder,
            createSubscription: createSubscription,
            featureFlags: featureFlags
        });
        return {
            createBillingAgreement: createBillingAgreement,
            createSubscription: createSubscription,
            createOrder: createOrder,
            onApprove: onApprove,
            onComplete: onComplete,
            onCancel: onCancel,
            onShippingChange: onShippingChange,
            onShippingAddressChange: onShippingAddressChange,
            onShippingOptionsChange: onShippingOptionsChange,
            onAuth: onAuth
        };
    }
    var disallowedPropsWithSave = [ "createOrder" ];
    function getCardProps(_ref) {
        var _fundingEligibility$c, _fundingEligibility$c2;
        var facilitatorAccessToken = _ref.facilitatorAccessToken, featureFlags = _ref.featureFlags;
        var xprops = window.xprops;
        var type = xprops.type, cardSessionID = xprops.cardSessionID, style = xprops.style, placeholder = xprops.placeholder, minLength = xprops.minLength, maxLength = xprops.maxLength, fundingEligibility = xprops.fundingEligibility, inputEvents = xprops.inputEvents, _xprops$branded = xprops.branded, branded = void 0 === _xprops$branded ? null == (_fundingEligibility$c = null == fundingEligibility || null == (_fundingEligibility$c2 = fundingEligibility.card) ? void 0 : _fundingEligibility$c2.branded) || _fundingEligibility$c : _xprops$branded, parent = xprops.parent, xport = xprops.export, createVaultSetupToken = xprops.createVaultSetupToken, createOrder = xprops.createOrder, sdkCorrelationID = xprops.sdkCorrelationID, partnerAttributionID = xprops.partnerAttributionID, hcfSessionID = xprops.hcfSessionID;
        var returnData = {
            type: type,
            branded: branded,
            style: style,
            placeholder: placeholder,
            minLength: minLength,
            maxLength: maxLength,
            cardSessionID: cardSessionID,
            fundingEligibility: fundingEligibility,
            inputEvents: inputEvents,
            export: parent ? parent.export : xport,
            facilitatorAccessToken: facilitatorAccessToken,
            sdkCorrelationID: sdkCorrelationID,
            partnerAttributionID: partnerAttributionID,
            hcfSessionID: hcfSessionID
        };
        var baseProps = function(_ref) {
            var branded = _ref.branded, enableOrdersApprovalSmartWallet = _ref.enableOrdersApprovalSmartWallet, smartWalletOrderID = _ref.smartWalletOrderID;
            var xprops = window.xprops;
            var uid = xprops.uid, env = xprops.env, _xprops$vault = xprops.vault, vault = void 0 !== _xprops$vault && _xprops$vault, commit = xprops.commit, locale = xprops.locale, platform = xprops.platform, sessionID = xprops.sessionID, clientID = xprops.clientID, partnerAttributionID = xprops.partnerAttributionID, merchantRequestedPopupsDisabled = xprops.merchantRequestedPopupsDisabled, clientMetadataID = xprops.clientMetadataID, sdkCorrelationID = xprops.sdkCorrelationID, getParentDomain = xprops.getParentDomain, clientAccessToken = xprops.clientAccessToken, getPopupBridge = xprops.getPopupBridge, getPrerenderDetails = xprops.getPrerenderDetails, getPageUrl = xprops.getPageUrl, enableThreeDomainSecure = xprops.enableThreeDomainSecure, enableVaultInstallments = xprops.enableVaultInstallments, _xprops$enableNativeC = xprops.enableNativeCheckout, enableNativeCheckout = void 0 !== _xprops$enableNativeC && _xprops$enableNativeC, _xprops$experience = xprops.experience, experience = void 0 === _xprops$experience ? "" : _xprops$experience, rememberFunding = xprops.remember, stageHost = xprops.stageHost, apiStageHost = xprops.apiStageHost, getParent = xprops.getParent, fundingSource = xprops.fundingSource, currency = xprops.currency, connect = xprops.connect, intent = xprops.intent, merchantID = xprops.merchantID, amount = xprops.amount, userIDToken = xprops.userIDToken, enableFunding = xprops.enableFunding, disableFunding = xprops.disableFunding, disableCard = xprops.disableCard, disableAutocomplete = xprops.disableAutocomplete, wallet = xprops.wallet, _xprops$paymentMethod = xprops.paymentMethodToken, paymentMethodToken = void 0 === _xprops$paymentMethod ? xprops.paymentMethodNonce : _xprops$paymentMethod, _xprops$getQueriedEli = xprops.getQueriedEligibleFunding, getQueriedEligibleFunding = void 0 === _xprops$getQueriedEli ? function() {
                return promise_ZalgoPromise.resolve([]);
            } : _xprops$getQueriedEli, storageID = xprops.storageID, applePay = xprops.applePay, userExperienceFlow = xprops.userExperienceFlow, allowBillingPayments = xprops.allowBillingPayments, paymentRequest = xprops.paymentRequest;
            var onInit = function(_ref) {
                var onInit = _ref.onInit;
                return function(data) {
                    var enabled = !0;
                    return {
                        initPromise: promise_ZalgoPromise.try((function() {
                            if (onInit) return onInit(data, (set = function(val) {
                                enabled = val;
                            }, {
                                enable: function() {
                                    return promise_ZalgoPromise.try((function() {
                                        return set(!0);
                                    }));
                                },
                                disable: function() {
                                    return promise_ZalgoPromise.try((function() {
                                        return set(!1);
                                    }));
                                }
                            }));
                            var set;
                        })),
                        isEnabled: function() {
                            return enabled;
                        }
                    };
                };
            }({
                onInit: xprops.onInit
            });
            var merchantDomain = "function" == typeof getParentDomain ? getParentDomain() : "unknown";
            enableFunding = enableFunding || [];
            disableFunding = disableFunding || [];
            var onClick = function(_ref2) {
                var onClick = _ref2.onClick;
                if (onClick) return memoize((function(_ref3) {
                    return onClick((_ref = {
                        fundingSource: _ref3.fundingSource
                    }, {
                        fundingSource: _ref.fundingSource
                    }), {
                        resolve: function() {
                            return promise_ZalgoPromise.try((function() {
                                return !0;
                            }));
                        },
                        reject: function() {
                            return promise_ZalgoPromise.try((function() {
                                return !1;
                            }));
                        }
                    }).then((function(valid) {
                        return !1 !== valid;
                    }));
                    var _ref;
                }));
            }({
                onClick: xprops.onClick
            });
            var stickinessID = storageID && getSDKStorage().isStateFresh() ? storageID : getSDKStorage().getID();
            return {
                uid: uid,
                env: env,
                vault: vault,
                commit: commit,
                clientAccessToken: clientAccessToken,
                locale: locale,
                sessionID: sessionID,
                clientID: clientID,
                partnerAttributionID: partnerAttributionID,
                clientMetadataID: clientMetadataID,
                sdkCorrelationID: sdkCorrelationID,
                merchantDomain: merchantDomain,
                platform: platform,
                currency: currency,
                intent: intent,
                wallet: wallet,
                merchantRequestedPopupsDisabled: merchantRequestedPopupsDisabled,
                getPopupBridge: getPopupBridge,
                getPrerenderDetails: getPrerenderDetails,
                getPageUrl: getPageUrl,
                rememberFunding: rememberFunding,
                getParent: getParent,
                connect: connect,
                fundingSource: fundingSource,
                enableFunding: enableFunding,
                disableFunding: disableFunding,
                disableCard: disableCard,
                disableAutocomplete: disableAutocomplete,
                getQueriedEligibleFunding: getQueriedEligibleFunding,
                amount: amount,
                userIDToken: userIDToken,
                enableThreeDomainSecure: enableThreeDomainSecure,
                enableNativeCheckout: enableNativeCheckout,
                enableVaultInstallments: enableVaultInstallments,
                experience: experience,
                onClick: onClick,
                onInit: onInit,
                onError: getOnError({
                    onError: xprops.onError
                }),
                stageHost: stageHost,
                apiStageHost: apiStageHost,
                standaloneFundingSource: fundingSource,
                paymentMethodToken: paymentMethodToken,
                branded: branded,
                stickinessID: stickinessID,
                applePay: applePay,
                userExperienceFlow: userExperienceFlow,
                allowBillingPayments: allowBillingPayments,
                paymentRequest: paymentRequest,
                merchantID: merchantID,
                enableOrdersApprovalSmartWallet: enableOrdersApprovalSmartWallet,
                smartWalletOrderID: smartWalletOrderID
            };
        }({
            branded: branded
        });
        if (createVaultSetupToken) return _extends({}, baseProps, function(xprops, baseProps) {
            disallowedPropsWithSave.forEach((function(prop) {
                if (xprops[prop]) throw new Error("Do not pass " + prop + " with an action.");
            }));
            if (null == xprops || !xprops.createVaultSetupToken) throw new Error("createVaultSetupToken is required when saving card fields");
            if (null == xprops || !xprops.onApprove) throw new Error("onApprove is required when saving card fields");
            return {
                createVaultSetupToken: (_ref = {
                    createVaultSetupToken: xprops.createVaultSetupToken
                }, createVaultSetupToken = _ref.createVaultSetupToken, function() {
                    return createVaultSetupToken({}).then((function(vaultSetupToken) {
                        if (!vaultSetupToken || "string" != typeof vaultSetupToken) throw new Error("Expected a vault setup token to be returned from createVaultSetupToken");
                        return vaultSetupToken;
                    }));
                }),
                onApprove: (_ref20 = {
                    onApprove: xprops.onApprove,
                    onError: baseProps.onError
                }, onApprove = _ref20.onApprove, onError = _ref20.onError, function(data) {
                    return promise_ZalgoPromise.try((function() {
                        return onApprove(data);
                    })).catch((function(err) {
                        return promise_ZalgoPromise.try((function() {
                            onError(err);
                        })).finally((function() {
                            throw err;
                        }));
                    }));
                })
            };
            var _ref20, onApprove, onError;
            var _ref, createVaultSetupToken;
        }(xprops, baseProps), returnData);
        if (createOrder) return _extends({}, baseProps, getLegacyProps({
            paymentSource: null,
            partnerAttributionID: xprops.partnerAttributionID,
            merchantID: xprops.merchantID,
            clientID: xprops.clientID,
            currency: xprops.currency,
            intent: xprops.intent,
            clientAccessToken: xprops.clientAccessToken,
            branded: branded,
            vault: !1,
            facilitatorAccessToken: facilitatorAccessToken,
            featureFlags: featureFlags,
            onShippingChange: xprops.onShippingChange,
            onShippingAddressChange: xprops.onShippingAddressChange,
            onShippingOptionsChange: xprops.onShippingOptionsChange,
            onError: baseProps.onError,
            onCancel: xprops.onCancel,
            onApprove: xprops.onApprove,
            createSubscription: xprops.createSubscription,
            createOrder: xprops.createOrder,
            createBillingAgreement: xprops.createBillingAgreement
        }), {
            type: type,
            branded: branded,
            style: style,
            placeholder: placeholder,
            onApprove: xprops.onApprove,
            createOrder: xprops.createOrder,
            onError: xprops.onError,
            minLength: minLength,
            maxLength: maxLength,
            cardSessionID: cardSessionID,
            fundingEligibility: fundingEligibility,
            inputEvents: inputEvents,
            export: parent ? parent.export : xport,
            facilitatorAccessToken: facilitatorAccessToken,
            sdkCorrelationID: sdkCorrelationID,
            partnerAttributionID: partnerAttributionID,
            hcfSessionID: hcfSessionID
        });
        throw new Error("Must pass either createVaultSetupToken or createOrder");
    }
    var vault_without_purchase_savePaymentSource = function(_ref) {
        var onApprove = _ref.onApprove, onError = _ref.onError, clientID = _ref.clientID, paymentSource = _ref.paymentSource, idToken = _ref.idToken;
        var vaultToken;
        return (0, _ref.createVaultSetupToken)().then((function(vaultSetupToken) {
            vaultToken = vaultSetupToken;
            return callGraphQL({
                name: "UpdateVaultSetupToken",
                query: "\n      mutation UpdateVaultSetupToken(\n        $clientID: String!\n        $vaultSetupToken: String!\n        $paymentSource: PaymentSource\n        $idToken: String!\n      ) {\n        updateVaultSetupToken(\n          clientId: $clientID\n          vaultSetupToken: $vaultSetupToken\n          paymentSource: $paymentSource\n          idToken: $idToken\n        ) {\n          id,\n          status\n        }\n      }",
                variables: {
                    clientID: (_ref2 = {
                        vaultSetupToken: vaultSetupToken,
                        clientID: clientID,
                        paymentSource: paymentSource,
                        idToken: idToken
                    }).clientID,
                    vaultSetupToken: _ref2.vaultSetupToken,
                    paymentSource: _ref2.paymentSource,
                    idToken: _ref2.idToken
                }
            });
            var _ref2;
        })).then((function() {
            return onApprove({
                vaultSetupToken: vaultToken
            });
        })).then((function() {
            return function(_ref6) {
                var _getLogger$track3;
                var vaultToken = _ref6.vaultToken;
                getLogger().track((_getLogger$track3 = {}, _getLogger$track3.transition_name = "hcf_vault_without_purchase_success", 
                _getLogger$track3.event_name = "hcf_vault_without_purchase_success", _getLogger$track3.vault_token = vaultToken, 
                _getLogger$track3)).flush();
            }({
                vaultToken: vaultToken
            });
        })).catch((function(error) {
            "string" == typeof error && (error = new Error(error));
            !function(_ref7) {
                var _getLogger$track4;
                var vaultToken = _ref7.vaultToken, error = _ref7.error;
                getLogger().track((_getLogger$track4 = {}, _getLogger$track4.ext_error_code = "hcf_vault_without_purchase_error", 
                _getLogger$track4.ext_error_desc = stringifyErrorMessage(error), _getLogger$track4.vault_token = vaultToken, 
                _getLogger$track4)).flush();
            }({
                error: error,
                vaultToken: vaultToken
            });
            onError(error);
            throw error;
        }));
    };
    function submitCardFields(_ref) {
        var facilitatorAccessToken = _ref.facilitatorAccessToken, extraFields = _ref.extraFields;
        var cardProps = getCardProps({
            facilitatorAccessToken: facilitatorAccessToken,
            featureFlags: _ref.featureFlags
        });
        gql_resetGQLErrors();
        return promise_ZalgoPromise.try((function() {
            if (!hasCardFields()) throw new Error("Card fields not available to submit");
            var isVaultFlow = Boolean(cardProps.createVaultSetupToken);
            var card = getCardFields(isVaultFlow);
            return isVaultFlow ? vault_without_purchase_savePaymentSource({
                onApprove: cardProps.onApprove,
                createVaultSetupToken: cardProps.createVaultSetupToken,
                onError: cardProps.onError,
                clientID: cardProps.clientID,
                paymentSource: convertCardToPaymentSource(card, extraFields),
                idToken: cardProps.userIDToken || ""
            }) : cardProps.createOrder ? cardProps.createOrder().then((function(id) {
                if ("string" != typeof (null == id ? void 0 : id.valueOf())) throw new TypeError("Expected createOrder to return a promise that resolves with the order ID as a string.");
                var payment_source = convertCardToPaymentSource(card, extraFields);
                var data = {
                    payment_source: {
                        card: (paymentSource = payment_source.card, Object.keys(paymentSource).reduce((function(newObj, key) {
                            var transformedKey = reformatBillingKeys(key);
                            if ("billingAddress" === key) {
                                if (paymentSource.billingAddress && 0 !== Object.keys(paymentSource.billingAddress).length) {
                                    newObj.billing_address = {};
                                    Object.keys(paymentSource.billingAddress).forEach((function(billingKey) {
                                        var snakeCaseBillingKey = reformatBillingKeys(billingKey);
                                        newObj.billing_address[snakeCaseBillingKey] = paymentSource.billingAddress[billingKey];
                                    }));
                                }
                            } else newObj[transformedKey] = paymentSource[key];
                            return newObj;
                        }), {}))
                    }
                };
                var paymentSource;
                return function(orderID, data, _ref11) {
                    var _headers14;
                    return callRestAPI({
                        accessToken: _ref11.facilitatorAccessToken,
                        method: "post",
                        eventName: "order_confirm_payment_source",
                        url: ORDERS_API_URL + "/" + orderID + "/confirm-payment-source",
                        data: data,
                        headers: (_headers14 = {}, _headers14["paypal-partner-attribution-id"] = _ref11.partnerAttributionID || "", 
                        _headers14.prefer = "return=representation", _headers14)
                    });
                }(orderID = id, data, {
                    facilitatorAccessToken: facilitatorAccessToken,
                    partnerAttributionID: ""
                });
            })).then((function() {
                return cardProps.onApprove({
                    orderID: orderID
                }, {});
            })).then((function() {
                !function(_ref4) {
                    var _getLogger$track;
                    var orderID = _ref4.orderID;
                    getLogger().track((_getLogger$track = {}, _getLogger$track.transition_name = "hcf_transaction_success", 
                    _getLogger$track.event_name = "hcf_transaction_success", _getLogger$track.order_id = orderID, 
                    _getLogger$track)).flush();
                }({
                    orderID: orderID
                });
            })).catch((function(error) {
                "string" == typeof error && (error = new Error(error));
                !function(_ref5) {
                    var _getLogger$track2;
                    var orderID = _ref5.orderID, error = _ref5.error;
                    getLogger().track((_getLogger$track2 = {}, _getLogger$track2.ext_error_code = "hcf_transaction_error", 
                    _getLogger$track2.ext_error_desc = stringifyErrorMessage(error), _getLogger$track2.order_id = orderID, 
                    _getLogger$track2)).flush();
                }({
                    error: error,
                    orderID: orderID
                });
                cardProps.onError && cardProps.onError(error);
                throw error;
            })) : void 0;
            var orderID;
        }));
    }
    function Icons() {
        return y("svg", {
            class: "card-icons"
        }, y("defs", null, y("symbol", {
            id: "icon-visa",
            viewBox: "0 0 44 14.2"
        }, y("title", null, "Visa"), y("path", {
            fill: "#1434CB",
            d: "M16.8,0.2L11,13.9H7.3L4.5,3C4.3,2.3,4.2,2.1,3.6,1.8C2.8,1.3,1.4,0.9,0.1,0.6l0.1-0.4h6   c0.8,0,1.5,0.5,1.6,1.4l1.5,7.9L13,0.2H16.8z M31.4,9.4c0-3.6-5-3.8-5-5.4c0-0.5,0.5-1,1.5-1.1c0.5-0.1,1.9-0.1,3.5,0.6L32,0.6   C31.2,0.3,30.1,0,28.7,0c-3.5,0-6,1.9-6,4.5c0,2,1.8,3.1,3.1,3.7c1.4,0.7,1.8,1.1,1.8,1.7c0,0.9-1.1,1.3-2.1,1.3   c-1.8,0-2.8-0.5-3.6-0.9l-0.6,3c0.8,0.4,2.3,0.7,3.9,0.7C28.9,14.1,31.4,12.3,31.4,9.4 M40.6,13.9h3.3L41,0.2h-3   c-0.7,0-1.3,0.4-1.5,1l-5.3,12.7h3.7l0.7-2h4.5L40.6,13.9z M36.7,9.1l1.9-5.1l1.1,5.1H36.7z M21.8,0.2l-2.9,13.7h-3.5l2.9-13.7   H21.8z"
        })), y("symbol", {
            id: "icon-mastercard",
            viewBox: "0 0 40 24"
        }, y("title", null, "MasterCard"), y("path", {
            d: "M0 1.927C0 .863.892 0 1.992 0h36.016C39.108 0 40 .863 40 1.927v20.146C40 23.137 39.108 24 38.008 24H1.992C.892 24 0 23.137 0 22.073V1.927z",
            fill: "#FFF"
        }), y("path", {
            d: "M11.085 22.2v-1.36c0-.522-.318-.863-.864-.863-.272 0-.568.09-.773.386-.16-.25-.386-.386-.727-.386-.228 0-.455.068-.637.318v-.272h-.478V22.2h.478v-1.202c0-.386.204-.567.523-.567.318 0 .478.205.478.568V22.2h.477v-1.202c0-.386.23-.567.524-.567.32 0 .478.205.478.568V22.2h.523zm7.075-2.177h-.774v-.658h-.478v.658h-.432v.43h.432v.998c0 .5.205.795.75.795.206 0 .433-.068.592-.16l-.136-.407c-.136.09-.296.114-.41.114-.227 0-.318-.137-.318-.363v-.976h.774v-.43zm4.048-.046c-.273 0-.454.136-.568.318v-.272h-.478V22.2h.478v-1.225c0-.363.16-.567.455-.567.09 0 .204.023.295.046l.137-.454c-.09-.023-.228-.023-.32-.023zm-6.118.227c-.228-.16-.546-.227-.888-.227-.546 0-.91.272-.91.703 0 .363.274.567.75.635l.23.023c.25.045.385.113.385.227 0 .16-.182.272-.5.272-.32 0-.57-.113-.728-.227l-.228.363c.25.18.59.272.932.272.637 0 1-.295 1-.703 0-.385-.295-.59-.75-.658l-.227-.022c-.205-.023-.364-.068-.364-.204 0-.16.16-.25.41-.25.272 0 .545.114.682.182l.205-.386zm12.692-.227c-.273 0-.455.136-.568.318v-.272h-.478V22.2h.478v-1.225c0-.363.16-.567.455-.567.09 0 .203.023.294.046L29.1 20c-.09-.023-.227-.023-.318-.023zm-6.096 1.134c0 .66.455 1.135 1.16 1.135.32 0 .546-.068.774-.25l-.228-.385c-.182.136-.364.204-.57.204-.385 0-.658-.272-.658-.703 0-.407.273-.68.66-.702.204 0 .386.068.568.204l.228-.385c-.228-.182-.455-.25-.774-.25-.705 0-1.16.477-1.16 1.134zm4.413 0v-1.087h-.48v.272c-.158-.204-.385-.318-.68-.318-.615 0-1.093.477-1.093 1.134 0 .66.478 1.135 1.092 1.135.317 0 .545-.113.68-.317v.272h.48v-1.09zm-1.753 0c0-.384.25-.702.66-.702.387 0 .66.295.66.703 0 .387-.273.704-.66.704-.41-.022-.66-.317-.66-.703zm-5.71-1.133c-.636 0-1.09.454-1.09 1.134 0 .682.454 1.135 1.114 1.135.32 0 .638-.09.888-.295l-.228-.34c-.18.136-.41.227-.636.227-.296 0-.592-.136-.66-.522h1.615v-.18c.022-.704-.388-1.158-1.002-1.158zm0 .41c.297 0 .502.18.547.52h-1.137c.045-.295.25-.52.59-.52zm11.852.724v-1.95h-.48v1.135c-.158-.204-.385-.318-.68-.318-.615 0-1.093.477-1.093 1.134 0 .66.478 1.135 1.092 1.135.318 0 .545-.113.68-.317v.272h.48v-1.09zm-1.752 0c0-.384.25-.702.66-.702.386 0 .66.295.66.703 0 .387-.274.704-.66.704-.41-.022-.66-.317-.66-.703zm-15.97 0v-1.087h-.476v.272c-.16-.204-.387-.318-.683-.318-.615 0-1.093.477-1.093 1.134 0 .66.478 1.135 1.092 1.135.318 0 .545-.113.682-.317v.272h.477v-1.09zm-1.773 0c0-.384.25-.702.66-.702.386 0 .66.295.66.703 0 .387-.274.704-.66.704-.41-.022-.66-.317-.66-.703z",
            fill: "#000"
        }), y("path", {
            fill: "#FF5F00",
            d: "M23.095 3.49H15.93v12.836h7.165"
        }), y("path", {
            d: "M16.382 9.91c0-2.61 1.23-4.922 3.117-6.42-1.39-1.087-3.14-1.745-5.05-1.745-4.528 0-8.19 3.65-8.19 8.164 0 4.51 3.662 8.162 8.19 8.162 1.91 0 3.66-.657 5.05-1.746-1.89-1.474-3.118-3.81-3.118-6.417z",
            fill: "#EB001B"
        }), y("path", {
            d: "M32.76 9.91c0 4.51-3.664 8.162-8.19 8.162-1.91 0-3.662-.657-5.05-1.746 1.91-1.496 3.116-3.81 3.116-6.417 0-2.61-1.228-4.922-3.116-6.42 1.388-1.087 3.14-1.745 5.05-1.745 4.526 0 8.19 3.674 8.19 8.164z",
            fill: "#F79E1B"
        })), y("symbol", {
            id: "icon-unionpay",
            viewBox: "0 0 40 24"
        }, y("title", null, "Union Pay"), y("path", {
            d: "M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z",
            fill: "#FFF"
        }), y("path", {
            d: "M9.877 2h8.126c1.135 0 1.84.93 1.575 2.077l-3.783 16.35c-.267 1.142-1.403 2.073-2.538 2.073H5.13c-1.134 0-1.84-.93-1.574-2.073L7.34 4.076C7.607 2.93 8.74 2 9.878 2z",
            fill: "#E21836"
        }), y("path", {
            d: "M17.325 2h9.345c1.134 0 .623.93.356 2.077l-3.783 16.35c-.265 1.142-.182 2.073-1.32 2.073H12.58c-1.137 0-1.84-.93-1.574-2.073l3.783-16.35C15.056 2.93 16.19 2 17.324 2z",
            fill: "#00447B"
        }), y("path", {
            d: "M26.3 2h8.126c1.136 0 1.84.93 1.575 2.077l-3.782 16.35c-.266 1.142-1.402 2.073-2.54 2.073h-8.122c-1.137 0-1.842-.93-1.574-2.073l3.78-16.35C24.03 2.93 25.166 2 26.303 2z",
            fill: "#007B84"
        }), y("path", {
            d: "M27.633 14.072l-.99 3.3h.266l-.208.68h-.266l-.062.212h-.942l.064-.21H23.58l.193-.632h.194l1.005-3.35.2-.676h.962l-.1.34s.255-.184.498-.248c.242-.064 1.636-.088 1.636-.088l-.206.672h-.33zm-1.695 0l-.254.843s.285-.13.44-.172c.16-.04.395-.057.395-.057l.182-.614h-.764zm-.38 1.262l-.263.877s.29-.15.447-.196c.157-.037.396-.066.396-.066l.185-.614h-.766zm-.614 2.046h.767l.222-.74h-.765l-.223.74z",
            fill: "#FEFEFE"
        }), y("path", {
            d: "M28.055 13.4h1.027l.01.385c-.005.065.05.096.17.096h.208l-.19.637h-.555c-.48.035-.662-.172-.65-.406l-.02-.71zM28.193 16.415h-.978l.167-.566H28.5l.16-.517h-1.104l.19-.638h3.072l-.193.638h-1.03l-.16.516h1.032l-.17.565H29.18l-.2.24h.454l.11.712c.013.07.014.116.036.147.023.026.158.038.238.038h.137l-.21.694h-.348c-.054 0-.133-.004-.243-.01-.105-.008-.18-.07-.25-.105-.064-.03-.16-.11-.182-.24l-.11-.712-.507.7c-.162.222-.38.39-.748.39h-.712l.186-.62h.273c.078 0 .15-.03.2-.056.052-.023.098-.05.15-.126l.74-1.05zM17.478 14.867h2.59l-.19.622H18.84l-.16.53h1.06l-.194.64h-1.06l-.256.863c-.03.095.25.108.353.108l.53-.072-.212.71h-1.193c-.096 0-.168-.013-.272-.037-.1-.023-.145-.07-.19-.138-.043-.07-.11-.128-.064-.278l.343-1.143h-.588l.195-.65h.592l.156-.53h-.588l.188-.623zM19.223 13.75h1.063l-.194.65H18.64l-.157.136c-.067.066-.09.038-.18.087-.08.04-.254.123-.477.123h-.466l.19-.625h.14c.118 0 .198-.01.238-.036.046-.03.098-.096.157-.203l.267-.487h1.057l-.187.356zM20.74 13.4h.905l-.132.46s.286-.23.487-.313c.2-.075.65-.143.65-.143l1.464-.007-.498 1.672c-.085.286-.183.472-.244.555-.055.087-.12.16-.248.23-.124.066-.236.104-.34.115-.096.007-.244.01-.45.012h-1.41l-.4 1.324c-.037.13-.055.194-.03.23.02.03.068.066.135.066l.62-.06-.21.726h-.698c-.22 0-.383-.004-.495-.013-.108-.01-.22 0-.295-.058-.065-.058-.164-.133-.162-.21.007-.073.037-.192.082-.356l1.268-4.23zm1.922 1.69h-1.484l-.09.3h1.283c.152-.018.184.004.196-.003l.096-.297zm-1.402-.272s.29-.266.786-.353c.112-.022.82-.015.82-.015l.106-.357h-1.496l-.216.725z",
            fill: "#FEFEFE"
        }), y("path", {
            d: "M23.382 16.1l-.084.402c-.036.125-.067.22-.16.302-.1.084-.216.172-.488.172l-.502.02-.004.455c-.006.13.028.117.048.138.024.022.045.032.067.04l.157-.008.48-.028-.198.663h-.552c-.385 0-.67-.008-.765-.084-.092-.057-.105-.132-.103-.26l.035-1.77h.88l-.013.362h.212c.072 0 .12-.007.15-.026.027-.02.047-.048.06-.093l.087-.282h.692zM10.84 7.222c-.032.143-.596 2.763-.598 2.764-.12.53-.21.91-.508 1.152-.172.14-.37.21-.6.21-.37 0-.587-.185-.624-.537l-.007-.12.113-.712s.593-2.388.7-2.703c.002-.017.005-.026.007-.035-1.152.01-1.357 0-1.37-.018-.007.024-.037.173-.037.173l-.605 2.688-.05.23-.1.746c0 .22.042.4.13.553.275.485 1.06.557 1.504.557.573 0 1.11-.123 1.47-.345.63-.375.797-.962.944-1.48l.067-.267s.61-2.48.716-2.803c.003-.017.006-.026.01-.035-.835.01-1.08 0-1.16-.018zM14.21 12.144c-.407-.006-.55-.006-1.03.018l-.018-.036c.042-.182.087-.363.127-.548l.06-.25c.086-.39.173-.843.184-.98.007-.084.036-.29-.2-.29-.1 0-.203.048-.307.096-.058.207-.174.79-.23 1.055-.118.558-.126.62-.178.897l-.036.037c-.42-.006-.566-.006-1.05.018l-.024-.04c.08-.332.162-.668.24-.998.203-.9.25-1.245.307-1.702l.04-.028c.47-.067.585-.08 1.097-.185l.043.047-.077.287c.086-.052.168-.104.257-.15.242-.12.51-.155.658-.155.223 0 .468.062.57.323.098.232.034.52-.094 1.084l-.066.287c-.13.627-.152.743-.225 1.174l-.05.036zM15.87 12.144c-.245 0-.405-.006-.56 0-.153 0-.303.008-.532.018l-.013-.02-.015-.02c.062-.238.097-.322.128-.406.03-.084.06-.17.115-.41.072-.315.116-.535.147-.728.033-.187.052-.346.075-.53l.02-.014.02-.018c.244-.036.4-.057.56-.082.16-.024.32-.055.574-.103l.008.023.008.022c-.047.195-.094.39-.14.588-.047.197-.094.392-.137.587-.093.414-.13.57-.152.68-.02.105-.026.163-.063.377l-.022.02-.023.017zM19.542 10.728c.143-.633.033-.928-.108-1.11-.213-.273-.59-.36-.978-.36-.235 0-.793.023-1.23.43-.312.29-.458.687-.546 1.066-.088.387-.19 1.086.447 1.344.198.085.48.108.662.108.466 0 .945-.13 1.304-.513.278-.312.405-.775.448-.965zm-1.07-.046c-.02.106-.113.503-.24.673-.086.123-.19.198-.305.198-.033 0-.235 0-.238-.3-.003-.15.027-.304.063-.47.108-.478.236-.88.56-.88.255 0 .27.298.16.78zM29.536 12.187c-.493-.004-.635-.004-1.09.015l-.03-.037c.124-.472.248-.943.358-1.42.142-.62.175-.882.223-1.244l.037-.03c.49-.07.625-.09 1.135-.186l.015.044c-.093.388-.186.777-.275 1.166-.19.816-.258 1.23-.33 1.658l-.044.035z",
            fill: "#FEFEFE"
        }), y("path", {
            d: "M29.77 10.784c.144-.63-.432-.056-.525-.264-.14-.323-.052-.98-.62-1.2-.22-.085-.732.025-1.17.428-.31.29-.458.683-.544 1.062-.088.38-.19 1.078.444 1.328.2.085.384.11.567.103.638-.034 1.124-1.002 1.483-1.386.277-.303.326.115.368-.07zm-.974-.047c-.024.1-.117.503-.244.67-.083.117-.283.192-.397.192-.032 0-.232 0-.24-.3 0-.146.03-.3.067-.467.11-.47.235-.87.56-.87.254 0 .363.293.254.774zM22.332 12.144c-.41-.006-.55-.006-1.03.018l-.018-.036c.04-.182.087-.363.13-.548l.057-.25c.09-.39.176-.843.186-.98.008-.084.036-.29-.198-.29-.1 0-.203.048-.308.096-.057.207-.175.79-.232 1.055-.115.558-.124.62-.176.897l-.035.037c-.42-.006-.566-.006-1.05.018l-.022-.04.238-.998c.203-.9.25-1.245.307-1.702l.038-.028c.472-.067.587-.08 1.098-.185l.04.047-.073.287c.084-.052.17-.104.257-.15.24-.12.51-.155.655-.155.224 0 .47.062.575.323.095.232.03.52-.098 1.084l-.065.287c-.133.627-.154.743-.225 1.174l-.05.036zM26.32 8.756c-.07.326-.282.603-.554.736-.225.114-.498.123-.78.123h-.183l.013-.074.336-1.468.01-.076.007-.058.132.015.71.062c.275.105.388.38.31.74zM25.88 7.22l-.34.003c-.883.01-1.238.006-1.383-.012l-.037.182-.315 1.478-.793 3.288c.77-.01 1.088-.01 1.22.004l.21-1.024s.153-.644.163-.667c0 0 .047-.066.096-.092h.07c.665 0 1.417 0 2.005-.437.4-.298.675-.74.797-1.274.03-.132.054-.29.054-.446 0-.205-.04-.41-.16-.568-.3-.423-.896-.43-1.588-.433zM33.572 9.28l-.04-.043c-.502.1-.594.118-1.058.18l-.034.034-.005.023-.003-.007c-.345.803-.334.63-.615 1.26-.003-.03-.003-.048-.004-.077l-.07-1.37-.044-.043c-.53.1-.542.118-1.03.18l-.04.034-.006.056.003.007c.06.315.047.244.108.738.03.244.065.49.093.73.05.4.077.6.134 1.21-.328.55-.408.757-.722 1.238l.017.044c.478-.018.587-.018.94-.018l.08-.088c.265-.578 2.295-4.085 2.295-4.085zM16.318 9.62c.27-.19.304-.45.076-.586-.23-.137-.634-.094-.906.095-.273.186-.304.45-.075.586.228.134.633.094.905-.096z",
            fill: "#FEFEFE"
        }), y("path", {
            d: "M31.238 13.415l-.397.684c-.124.232-.357.407-.728.41l-.632-.01.184-.618h.124c.064 0 .11-.004.148-.022.03-.01.054-.035.08-.072l.233-.373h.988z",
            fill: "#FEFEFE"
        })), y("symbol", {
            id: "icon-american-express",
            viewBox: "0 0 40 24"
        }, y("title", null, "American Express"), y("path", {
            d: "M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z",
            fill: "#FFF"
        }), y("path", {
            fill: "#1478BE",
            d: "M6.26 12.32h2.313L7.415 9.66M27.353 9.977h-3.738v1.23h3.666v1.384h-3.675v1.385h3.821v1.005c.623-.77 1.33-1.466 2.025-2.235l.707-.77c-.934-1.004-1.87-2.08-2.804-3.075v1.077z"
        }), y("path", {
            d: "M38.25 7h-5.605l-1.328 1.4L30.072 7H16.984l-1.017 2.416L14.877 7h-9.58L1.25 16.5h4.826l.623-1.556h1.4l.623 1.556H29.99l1.327-1.483 1.328 1.483h5.605l-4.36-4.667L38.25 7zm-17.685 8.1h-1.557V9.883L16.673 15.1h-1.33L13.01 9.883l-.084 5.217H9.73l-.623-1.556h-3.27L5.132 15.1H3.42l2.884-6.772h2.42l2.645 6.233V8.33h2.646l2.107 4.51 1.868-4.51h2.575V15.1zm14.727 0h-2.024l-2.024-2.26-2.023 2.26H22.06V8.328H29.53l1.795 2.177 2.024-2.177h2.025L32.26 11.75l3.032 3.35z",
            fill: "#1478BE"
        })), y("symbol", {
            id: "icon-jcb",
            viewBox: "0 0 40 24"
        }, y("title", null, "JCB"), y("path", {
            d: "M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z",
            fill: "#FFF"
        }), y("path", {
            d: "M33.273 2.01h.013v17.062c-.004 1.078-.513 2.103-1.372 2.746-.63.47-1.366.67-2.14.67-.437 0-4.833.026-4.855 0-.01-.01 0-.07 0-.082v-6.82c0-.04.004-.064.033-.064h5.253c.867 0 1.344-.257 1.692-.61.44-.448.574-1.162.294-1.732-.24-.488-.736-.78-1.244-.913-.158-.04-.32-.068-.483-.083-.01 0-.064 0-.07-.006-.03-.034.023-.04.038-.046.102-.033.215-.042.32-.073.532-.164.993-.547 1.137-1.105.15-.577-.05-1.194-.524-1.552-.34-.257-.768-.376-1.187-.413-.43-.038-4.774-.022-5.21-.022-.072 0-.05-.02-.05-.09V5.63c0-.31.01-.616.073-.92.126-.592.41-1.144.815-1.59.558-.615 1.337-1.01 2.16-1.093.478-.048 4.89-.017 5.305-.017zm-4.06 8.616c.06.272-.01.567-.204.77-.173.176-.407.25-.648.253-.195.003-1.725 0-1.788 0l.003-1.645c.012-.027.02-.018.06-.018.097 0 1.713-.004 1.823.005.232.02.45.12.598.306.076.096.128.208.155.328zm-2.636 2.038h1.944c.242.002.47.063.652.228.226.204.327.515.283.815-.04.263-.194.5-.422.634-.187.112-.39.125-.6.125h-1.857v-1.8z",
            fill: "#53B230"
        }), y("path", {
            d: "M6.574 13.89c-.06-.03-.06-.018-.07-.06-.006-.026-.005-8.365.003-8.558.04-.95.487-1.857 1.21-2.47.517-.434 1.16-.71 1.83-.778.396-.04.803-.018 1.2-.018.69 0 4.11-.013 4.12 0 .008.008.002 16.758 0 17.074-.003.956-.403 1.878-1.105 2.523-.506.465-1.15.77-1.83.86-.41.056-5.02.032-5.363.032-.066 0-.054.013-.066-.024-.01-.025 0-7 0-7.17.66.178 1.35.28 2.03.348.662.067 1.33.093 1.993.062.93-.044 1.947-.192 2.712-.762.32-.238.574-.553.73-.922.148-.353.2-.736.2-1.117 0-.348.006-3.93-.016-3.942-.023-.014-2.885-.015-2.9.012-.012.022 0 3.87 0 3.95-.003.47-.16.933-.514 1.252-.468.42-1.11.47-1.707.423-.687-.055-1.357-.245-1.993-.508-.157-.065-.312-.135-.466-.208z",
            fill: "#006CB9"
        }), y("path", {
            d: "M15.95 9.835c-.025.02-.05.04-.072.06V6.05c0-.295-.012-.594.01-.888.12-1.593 1.373-2.923 2.944-3.126.382-.05 5.397-.042 5.41-.026.01.01 0 .062 0 .074v16.957c0 1.304-.725 2.52-1.89 3.1-.504.25-1.045.35-1.605.35-.322 0-4.757.015-4.834 0-.05-.01-.023.01-.035-.02-.007-.022 0-6.548 0-7.44v-.422c.554.48 1.256.75 1.96.908.536.12 1.084.176 1.63.196.537.02 1.076.01 1.61-.037.546-.05 1.088-.136 1.625-.244.137-.028.274-.057.41-.09.033-.006.17-.017.187-.044.013-.02 0-.097 0-.12v-1.324c-.582.292-1.19.525-1.83.652-.778.155-1.64.198-2.385-.123-.752-.326-1.2-1.024-1.274-1.837-.076-.837.173-1.716.883-2.212.736-.513 1.7-.517 2.553-.38.634.1 1.245.305 1.825.58.078.037.154.075.23.113V9.322c0-.02.013-.1 0-.118-.02-.028-.152-.038-.188-.046-.066-.016-.133-.03-.2-.045C22.38 9 21.84 8.908 21.3 8.85c-.533-.06-1.068-.077-1.603-.066-.542.01-1.086.054-1.62.154-.662.125-1.32.337-1.883.716-.085.056-.167.117-.245.18z",
            fill: "#E20138"
        })), y("symbol", {
            id: "icon-discover",
            viewBox: "0 0 40 24"
        }, y("title", null, "Discover"), y("path", {
            d: "M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z",
            fill: "#FFF"
        }), y("path", {
            d: "M38.995 11.75S27.522 20.1 6.5 23.5h31.495c.552 0 1-.448 1-1V11.75z",
            fill: "#F48024"
        }), y("path", {
            d: "M5.332 11.758c-.338.305-.776.438-1.47.438h-.29V8.55h.29c.694 0 1.115.124 1.47.446.37.33.595.844.595 1.372 0 .53-.224 1.06-.595 1.39zM4.077 7.615H2.5v5.515h1.57c.833 0 1.435-.197 1.963-.637.63-.52 1-1.305 1-2.116 0-1.628-1.214-2.762-2.956-2.762zM7.53 13.13h1.074V7.616H7.53M11.227 9.732c-.645-.24-.834-.397-.834-.695 0-.347.338-.61.8-.61.322 0 .587.132.867.446l.562-.737c-.462-.405-1.015-.612-1.618-.612-.975 0-1.718.678-1.718 1.58 0 .76.346 1.15 1.355 1.513.42.148.635.247.743.314.215.14.322.34.322.57 0 .448-.354.78-.834.78-.51 0-.924-.258-1.17-.736l-.695.67c.495.726 1.09 1.05 1.907 1.05 1.116 0 1.9-.745 1.9-1.812 0-.876-.363-1.273-1.585-1.72zM13.15 10.377c0 1.62 1.27 2.877 2.907 2.877.462 0 .858-.09 1.347-.32v-1.267c-.43.43-.81.604-1.297.604-1.082 0-1.85-.785-1.85-1.9 0-1.06.792-1.895 1.8-1.895.512 0 .9.183 1.347.62V7.83c-.472-.24-.86-.34-1.322-.34-1.627 0-2.932 1.283-2.932 2.887zM25.922 11.32l-1.468-3.705H23.28l2.337 5.656h.578l2.38-5.655H27.41M29.06 13.13h3.046v-.934h-1.973v-1.488h1.9v-.934h-1.9V8.55h1.973v-.935H29.06M34.207 10.154h-.314v-1.67h.33c.67 0 1.034.28 1.034.818 0 .554-.364.852-1.05.852zm2.155-.91c0-1.033-.71-1.628-1.95-1.628H32.82v5.514h1.073v-2.215h.14l1.487 2.215h1.32l-1.733-2.323c.81-.165 1.255-.72 1.255-1.563z",
            fill: "#221F20"
        }), y("path", {
            d: "M23.6 10.377c0 1.62-1.31 2.93-2.927 2.93-1.617.002-2.928-1.31-2.928-2.93s1.31-2.932 2.928-2.932c1.618 0 2.928 1.312 2.928 2.932z",
            fill: "#F48024"
        })), y("symbol", {
            id: "icon-diners-club",
            viewBox: "0 0 40 24"
        }, y("title", null, "Diners Club"), y("path", {
            d: "M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z",
            fill: "#FFF"
        }), y("path", {
            d: "M9.02 11.83c0-5.456 4.54-9.88 10.14-9.88 5.6 0 10.139 4.424 10.139 9.88-.002 5.456-4.54 9.88-10.14 9.88-5.6 0-10.14-4.424-10.14-9.88z",
            fill: "#FEFEFE"
        }), y("path", {
            fill: "#FFF",
            d: "M32.522 22H8.5V1.5h24.022"
        }), y("path", {
            d: "M25.02 11.732c-.003-2.534-1.607-4.695-3.868-5.55v11.102c2.26-.857 3.865-3.017 3.87-5.552zm-8.182 5.55V6.18c-2.26.86-3.86 3.017-3.867 5.55.007 2.533 1.61 4.69 3.868 5.55zm2.158-14.934c-5.25.002-9.503 4.202-9.504 9.384 0 5.182 4.254 9.38 9.504 9.382 5.25 0 9.504-4.2 9.505-9.382 0-5.182-4.254-9.382-9.504-9.384zM18.973 22C13.228 22.027 8.5 17.432 8.5 11.84 8.5 5.726 13.228 1.5 18.973 1.5h2.692c5.677 0 10.857 4.225 10.857 10.34 0 5.59-5.18 10.16-10.857 10.16h-2.692z",
            fill: "#004A97"
        })), y("symbol", {
            id: "icon-maestro",
            viewBox: "0 0 40 24"
        }, y("title", null, "Maestro"), y("path", {
            d: "M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z",
            fill: "#FFF"
        }), y("path", {
            d: "M14.67 22.39V21c.022-.465-.303-.86-.767-.882h-.116c-.3-.023-.603.14-.788.394-.164-.255-.442-.417-.743-.394-.256-.023-.51.116-.65.324v-.278h-.487v2.203h.487v-1.183c-.046-.278.162-.533.44-.58h.094c.325 0 .488.21.488.58v1.23h.487v-1.23c-.047-.278.162-.556.44-.58h.093c.325 0 .487.21.487.58v1.23l.534-.024zm2.712-1.09v-1.113h-.487v.28c-.162-.21-.417-.326-.695-.326-.65 0-1.16.51-1.16 1.16 0 .65.51 1.16 1.16 1.16.278 0 .533-.117.695-.325v.278h.487V21.3zm-1.786 0c.024-.37.348-.65.72-.626.37.023.65.348.626.72-.023.347-.302.625-.673.625-.372 0-.674-.28-.674-.65-.023-.047-.023-.047 0-.07zm12.085-1.16c.163 0 .325.024.465.094.14.046.278.14.37.255.117.115.186.23.256.37.117.3.117.626 0 .927-.046.14-.138.255-.254.37-.116.117-.232.186-.37.256-.303.116-.65.116-.952 0-.14-.046-.28-.14-.37-.255-.118-.116-.187-.232-.257-.37-.116-.302-.116-.627 0-.928.047-.14.14-.255.256-.37.115-.117.23-.187.37-.256.163-.07.325-.116.488-.093zm0 .465c-.092 0-.185.023-.278.046-.092.024-.162.094-.232.14-.07.07-.116.14-.14.232-.068.185-.068.394 0 .58.024.092.094.162.14.23.07.07.14.117.232.14.186.07.37.07.557 0 .092-.023.16-.092.23-.14.07-.068.117-.138.14-.23.07-.186.07-.395 0-.58-.023-.093-.093-.162-.14-.232-.07-.07-.138-.116-.23-.14-.094-.045-.187-.07-.28-.045zm-7.677.695c0-.695-.44-1.16-1.043-1.16-.65 0-1.16.534-1.137 1.183.023.65.534 1.16 1.183 1.136.325 0 .65-.093.905-.302l-.23-.348c-.187.14-.42.232-.65.232-.326.023-.627-.21-.673-.533h1.646v-.21zm-1.646-.21c.023-.3.278-.532.58-.532.3 0 .556.232.556.533h-1.136zm3.664-.346c-.207-.116-.44-.186-.695-.186-.255 0-.417.093-.417.255 0 .163.162.186.37.21l.233.022c.488.07.766.278.766.672 0 .395-.37.72-1.02.72-.348 0-.673-.094-.95-.28l.23-.37c.21.162.465.232.743.232.324 0 .51-.094.51-.28 0-.115-.117-.185-.395-.23l-.232-.024c-.487-.07-.765-.302-.765-.65 0-.44.37-.718.927-.718.325 0 .627.07.905.232l-.21.394zm2.32-.116h-.788v.997c0 .23.07.37.325.37.14 0 .3-.046.417-.115l.14.417c-.186.116-.395.162-.604.162-.58 0-.765-.302-.765-.812v-1.02h-.44v-.44h.44v-.673h.487v.672h.79v.44zm1.67-.51c.117 0 .233.023.35.07l-.14.463c-.093-.045-.21-.045-.302-.045-.325 0-.464.208-.464.58v1.25h-.487v-2.2h.487v.277c.116-.255.325-.37.557-.394z",
            fill: "#000"
        }), y("path", {
            fill: "#7673C0",
            d: "M23.64 3.287h-7.305V16.41h7.306"
        }), y("path", {
            d: "M16.8 9.848c0-2.55 1.183-4.985 3.2-6.56C16.384.435 11.12 1.06 8.29 4.7 5.435 8.32 6.06 13.58 9.703 16.41c3.038 2.387 7.283 2.387 10.32 0-2.04-1.578-3.223-3.99-3.223-6.562z",
            fill: "#EB001B"
        }), y("path", {
            d: "M33.5 9.848c0 4.613-3.735 8.346-8.35 8.346-1.88 0-3.69-.626-5.15-1.785 3.618-2.83 4.245-8.092 1.415-11.71-.418-.532-.882-.996-1.415-1.413C23.618.437 28.883 1.06 31.736 4.7 32.873 6.163 33.5 7.994 33.5 9.85z",
            fill: "#00A1DF"
        })), y("symbol", {
            id: "icon-unknown",
            viewBox: "0 0 48 29"
        }, y("path", {
            d: "M46.177 29H1.823C.9 29 0 28.13 0 27.187V1.813C0 .87.9 0 1.823 0h44.354C47.1 0 48 .87 48 1.813v25.375C48 28.13 47.1 29 46.177 29z",
            fill: "#FFF"
        }), y("path", {
            d: "M4.8 9.14c0-.427.57-.973 1.067-.973h7.466c.496 0 1.067.546 1.067.972v3.888c0 .425-.57.972-1.067.972H5.867c-.496 0-1.067-.547-1.067-.972v-3.89z",
            fill: "#828282"
        }), y("rect", {
            fill: "#828282",
            x: "10.8",
            y: "22.167",
            width: "3.6",
            height: "2.333",
            rx: "1.167"
        }), y("rect", {
            fill: "#828282",
            x: "4.8",
            y: "22.167",
            width: "3.6",
            height: "2.333",
            rx: "1.167"
        }), y("path", {
            d: "M6.55 16.333h34.9c.966 0 1.75.784 1.75 1.75 0 .967-.784 1.75-1.75 1.75H6.55c-.966 0-1.75-.783-1.75-1.75 0-.966.784-1.75 1.75-1.75z",
            fill: "#828282"
        }), y("ellipse", {
            fill: "#828282",
            cx: "40.2",
            cy: "6.417",
            rx: "3",
            ry: "2.917"
        })), y("symbol", {
            id: "icon-error",
            viewBox: "0 0 24 24"
        }, y("path", {
            d: "M21.64 17.34L14.05 4.2c-.92-1.59-3.22-1.59-4.14 0L2.32 17.34c-.92 1.59.23 3.59 2.07 3.59h15.18c1.84 0 2.99-2 2.07-3.59zM11.26 7.91h1.45c.26 0 .47.25.45.53l-.5 5.53c-.01.15-.13.27-.27.27h-.78c-.14 0-.26-.12-.27-.27l-.53-5.52c-.02-.29.18-.54.45-.54zm.73 10.19c-.64 0-1.17-.52-1.17-1.17 0-.64.53-1.17 1.17-1.17.65 0 1.17.53 1.17 1.17 0 .65-.52 1.17-1.17 1.17z"
        }))));
    }
    function Icon(_ref) {
        return y("svg", {
            className: _ref.iconClass,
            fill: "currentColor"
        }, y("use", {
            href: "#" + _ref.iconId
        }));
    }
    function AriaMessage(_ref) {
        return y("div", {
            style: {
                height: "1px",
                width: "1px",
                overflow: "hidden"
            },
            id: _ref.ariaMessageId,
            ref: _ref.ariaMessageRef
        });
    }
    function getIconId(type) {
        var iconId = "icon-" + type;
        return document.getElementById(iconId) ? iconId : "icon-unknown";
    }
    function CardNumber(_ref2) {
        var _ref2$name = _ref2.name, name = void 0 === _ref2$name ? "number" : _ref2$name, _ref2$autocomplete = _ref2.autocomplete, autocomplete = void 0 === _ref2$autocomplete ? "cc-number" : _ref2$autocomplete, _ref2$navigation = _ref2.navigation, navigation = void 0 === _ref2$navigation ? defaultNavigation : _ref2$navigation, _ref2$allowNavigation = _ref2.allowNavigation, allowNavigation = void 0 !== _ref2$allowNavigation && _ref2$allowNavigation, state = _ref2.state, type = _ref2.type, style = _ref2.style, onChange = _ref2.onChange, onFocus = _ref2.onFocus, onBlur = _ref2.onBlur, onKeyDown = _ref2.onKeyDown, onValidityChange = _ref2.onValidityChange, onEligibilityChange = _ref2.onEligibilityChange;
        var _useState = hooks_module_h({
            placeholder: _ref2.placeholder
        }), attributes = _useState[0], setAttributes = _useState[1];
        var _useState2 = hooks_module_h([ DEFAULT_CARD_TYPE ]), cardTypes = _useState2[0], setCardTypes = _useState2[1];
        var _useState3 = hooks_module_h(24), maxLength = _useState3[0], setMaxLength = _useState3[1];
        var _useState4 = hooks_module_h(_extends({}, defaultInputState, state)), inputState = _useState4[0], setInputState = _useState4[1];
        var inputValue = inputState.inputValue, maskedInputValue = inputState.maskedInputValue, cursorStart = inputState.cursorStart, cursorEnd = inputState.cursorEnd, keyStrokeCount = inputState.keyStrokeCount, isValid = inputState.isValid, isPotentiallyValid = inputState.isPotentiallyValid, contentPasted = inputState.contentPasted;
        var _useState5 = hooks_module_h(DEFAULT_CARD_TYPE), cardType = _useState5[0], setCardType = _useState5[1];
        var numberRef = hooks_module_();
        var ariaMessageRef = hooks_module_();
        hooks_module_p((function() {
            allowNavigation || exportMethods(numberRef, setAttributes, setInputState, ariaMessageRef);
        }), []);
        hooks_module_p((function() {
            setCardType(cardTypes[0]);
        }), [ cardTypes ]);
        hooks_module_p((function() {
            onChange({
                cardNumber: inputState.inputValue,
                potentialCardTypes: cardTypes
            });
        }), [ inputState ]);
        hooks_module_p((function() {
            "function" == typeof onEligibilityChange && onEligibilityChange(checkCardEligibility(inputValue, cardType));
            if (cardType && cardType.lengths) {
                var cardMaxLength = cardType.lengths.reduce((function(previousValue, currentValue) {
                    return Math.max(previousValue, currentValue);
                }));
                if (cardMaxLength) {
                    var _cardType$gaps$length, _cardType$gaps;
                    setMaxLength(cardMaxLength + (null != (_cardType$gaps$length = null == (_cardType$gaps = cardType.gaps) ? void 0 : _cardType$gaps.length) ? _cardType$gaps$length : 0));
                }
            }
            var postRobot = getPostRobot();
            if (postRobot) {
                var frames = window.parent.frames;
                for (var _i2 = 0; _i2 < frames.length; _i2++) postRobot.send(frames[_i2], "cardTypeChange", cardType, {
                    domain: window.location.origin,
                    fireAndForget: !0
                });
            }
        }), [ cardType ]);
        hooks_module_p((function() {
            "function" == typeof onValidityChange && onValidityChange({
                isValid: isValid,
                isPotentiallyValid: isPotentiallyValid
            });
            (function(_ref) {
                var inputState = _ref.inputState;
                return Boolean(_ref.allowNavigation && inputState.inputValue && inputState.isValid && (inputState.maskedInputValue.length === inputState.cursorStart || inputState.contentPasted));
            })({
                allowNavigation: allowNavigation,
                inputState: inputState
            }) && navigation.next();
        }), [ isValid, isPotentiallyValid ]);
        return y(_, null, y("input", _extends({
            "aria-describedby": "card-number-field-description",
            name: name,
            autocomplete: autocomplete,
            inputmode: "numeric",
            ref: numberRef,
            type: type,
            className: "card-field-number",
            value: maskedInputValue,
            style: style,
            maxLength: maxLength,
            onInput: function(event) {
                var _event$target = event.target, rawValue = _event$target.value, selectionStart = _event$target.selectionStart, selectionEnd = _event$target.selectionEnd;
                var value = removeNonDigits(rawValue);
                var detectedCardType = detectCardType(value);
                var validity = dist_default.a.number(value);
                var maskedValue = addGapsToCardNumber(value);
                var startCursorPosition = selectionStart;
                var endCursorPosition = selectionEnd;
                if (function(value) {
                    return /\D/g.test(removeSpaces(value));
                }(rawValue)) {
                    startCursorPosition = cursorStart;
                    endCursorPosition = cursorEnd;
                }
                if (contentPasted) {
                    startCursorPosition = maskedValue.length;
                    endCursorPosition = maskedValue.length;
                } else if (maskedValue.length > maskedInputValue.length && " " === maskedValue[selectionStart - 1]) {
                    startCursorPosition += 1;
                    endCursorPosition += 1;
                }
                moveCursor(event.target, startCursorPosition, endCursorPosition);
                setCardTypes(detectedCardType);
                setInputState(_extends({}, inputState, validity, {
                    inputValue: value,
                    maskedInputValue: maskedValue,
                    cursorStart: startCursorPosition,
                    cursorEnd: endCursorPosition,
                    contentPasted: !1,
                    keyStrokeCount: keyStrokeCount + 1
                }));
            },
            onFocus: function(event) {
                "function" == typeof onFocus && onFocus(event);
                var element = null == numberRef ? void 0 : numberRef.current;
                element && element.classList.add("display-icon");
                var maskedValue = addGapsToCardNumber(inputValue);
                var updatedState = _extends({}, inputState, {
                    maskedInputValue: maskedValue,
                    displayCardIcon: !0
                });
                setInputState((function(newState) {
                    return _extends({}, newState, updatedState);
                }));
            },
            onBlur: function(event) {
                var updatedState = {
                    maskedInputValue: maskedInputValue,
                    isPotentiallyValid: isPotentiallyValid,
                    contentPasted: !1,
                    displayCardIcon: inputState.inputValue.length > 0
                };
                var element = null == numberRef ? void 0 : numberRef.current;
                element && (inputState.inputValue.length > 0 ? element.classList.add("display-icon") : element.classList.remove("display-icon"));
                isValid && (updatedState.maskedInputValue = (lastFour = removeSpaces(number = maskedInputValue).slice(-4), 
                number.replace(/\d/g, "•").slice(0, -4) + lastFour));
                var number, lastFour;
                "function" == typeof onBlur && onBlur(event);
                "function" == typeof onKeyDown && onKeyDown(!1);
                setInputState((function(newState) {
                    return _extends({}, newState, updatedState);
                }));
            },
            onKeyDown: function(event) {
                "function" == typeof onKeyDown && onKeyDown("Enter" === event.key);
                allowNavigation && navigateOnKeyDown(event, navigation);
            },
            onPaste: function() {
                setInputState((function(newState) {
                    return _extends({}, newState, {
                        contentPasted: !0
                    });
                }));
            }
        }, attributes)), y(Icon, {
            iconId: getIconId(cardType.type),
            iconClass: "card-icon"
        }), y(AriaMessage, {
            ariaMessageId: "card-number-field-description",
            ariaMessageRef: ariaMessageRef
        }));
    }
    var main = __webpack_require__(12);
    var main_default = __webpack_require__.n(main);
    function CardExpiry(_ref) {
        var _ref$name = _ref.name, name = void 0 === _ref$name ? "expiry" : _ref$name, _ref$autocomplete = _ref.autocomplete, autocomplete = void 0 === _ref$autocomplete ? "cc-exp" : _ref$autocomplete, _ref$navigation = _ref.navigation, navigation = void 0 === _ref$navigation ? defaultNavigation : _ref$navigation, state = _ref.state, type = _ref.type, style = _ref.style, maxLength = _ref.maxLength, onChange = _ref.onChange, onFocus = _ref.onFocus, onBlur = _ref.onBlur, onKeyDown = _ref.onKeyDown, onValidityChange = _ref.onValidityChange, _ref$allowNavigation = _ref.allowNavigation, allowNavigation = void 0 !== _ref$allowNavigation && _ref$allowNavigation;
        var _useState = hooks_module_h({
            placeholder: _ref.placeholder
        }), attributes = _useState[0], setAttributes = _useState[1];
        var _useState2 = hooks_module_h(_extends({}, defaultInputState, state)), inputState = _useState2[0], setInputState = _useState2[1];
        var maskedInputValue = inputState.maskedInputValue, isValid = inputState.isValid, isPotentiallyValid = inputState.isPotentiallyValid;
        var _useState3 = hooks_module_h({}), restrictedInput = _useState3[0], setRestrictedInput = _useState3[1];
        var expiryRef = hooks_module_();
        var ariaMessageRef = hooks_module_();
        hooks_module_p((function() {
            allowNavigation || exportMethods(expiryRef, setAttributes, setInputState, ariaMessageRef);
            var element = null == expiryRef ? void 0 : expiryRef.current;
            if (element) {
                var initialRestrictedInput = new main_default.a({
                    element: element,
                    pattern: "{{99}} / {{9999}}"
                });
                setRestrictedInput(initialRestrictedInput);
            }
        }), []);
        hooks_module_p((function() {
            onChange({
                maskedDate: inputState.maskedInputValue
            });
        }), [ inputState ]);
        hooks_module_p((function() {
            "function" == typeof onValidityChange && onValidityChange({
                isValid: isValid,
                isPotentiallyValid: isPotentiallyValid
            });
            allowNavigation && maskedInputValue && isValid && navigation.next();
        }), [ isValid, isPotentiallyValid ]);
        return y(_, null, y("input", _extends({
            "aria-describedby": "card-expiry-field-description",
            name: name,
            autocomplete: autocomplete,
            inputmode: "numeric",
            ref: expiryRef,
            type: type,
            className: "card-field-expiry",
            style: style,
            maxLength: maxLength,
            onKeyUp: function(event) {
                var value = event.target.value;
                var validity = dist_default.a.expirationDate(value);
                value.includes("/") || (function(value, key) {
                    return 0 !== value.length && ("1" === value[0] && "/" === key || "1" !== value[0] && "0" !== value[0]);
                }(value, event.key) ? restrictedInput.setPattern("0{{9}} / {{9999}}") : restrictedInput.setPattern("{{99}} / {{9999}}"));
                setInputState(_extends({}, inputState, validity, {
                    inputValue: restrictedInput.getUnformattedValue(),
                    maskedInputValue: expiryRef.current.value
                }));
            },
            onKeyDown: function(event) {
                if ("function" == typeof onKeyDown) {
                    onKeyDown("Enter" === event.key);
                    allowNavigation && navigateOnKeyDown(event, navigation);
                }
            },
            onFocus: function(event) {
                "function" == typeof onFocus && onFocus(event);
            },
            onBlur: function(event) {
                "function" == typeof onBlur && onBlur(event);
                "function" == typeof onKeyDown && onKeyDown(!1);
            },
            onPaste: function() {
                setInputState((function(newState) {
                    return _extends({}, newState, {
                        contentPasted: !0
                    });
                }));
            }
        }, attributes)), y(AriaMessage, {
            ariaMessageId: "card-expiry-field-description",
            ariaMessageRef: ariaMessageRef
        }));
    }
    function CardCVV(_ref) {
        var _attributes$placehold;
        var _ref$name = _ref.name, name = void 0 === _ref$name ? "cvv" : _ref$name, _ref$autocomplete = _ref.autocomplete, autocomplete = void 0 === _ref$autocomplete ? "cc-csc" : _ref$autocomplete, _ref$navigation = _ref.navigation, navigation = void 0 === _ref$navigation ? defaultNavigation : _ref$navigation, _ref$allowNavigation = _ref.allowNavigation, allowNavigation = void 0 !== _ref$allowNavigation && _ref$allowNavigation, state = _ref.state, type = _ref.type, style = _ref.style, onChange = _ref.onChange, onFocus = _ref.onFocus, onBlur = _ref.onBlur, onKeyDown = _ref.onKeyDown, onValidityChange = _ref.onValidityChange;
        var _useState = hooks_module_h({
            placeholder: _ref.placeholder
        }), attributes = _useState[0], setAttributes = _useState[1];
        var _useState2 = hooks_module_h(_extends({}, defaultInputState, state)), inputState = _useState2[0], setInputState = _useState2[1];
        var _useState3 = hooks_module_h(DEFAULT_CARD_TYPE), cardType = _useState3[0], setCardType = _useState3[1];
        var _useState4 = hooks_module_h(!1), touched = _useState4[0], setTouched = _useState4[1];
        var inputValue = inputState.inputValue, keyStrokeCount = inputState.keyStrokeCount, isValid = inputState.isValid, isPotentiallyValid = inputState.isPotentiallyValid;
        var cvvRef = hooks_module_();
        var ariaMessageRef = hooks_module_();
        hooks_module_p((function() {
            allowNavigation || exportMethods(cvvRef, setAttributes, setInputState, ariaMessageRef);
            var postRobot = getPostRobot();
            if (postRobot) {
                var context = getContext(window);
                postRobot.on("cardTypeChange", {
                    domain: window.location.origin
                }, (function(event) {
                    getContext(event.source) === context && setCardType(event.data);
                }));
            }
        }), []);
        hooks_module_p((function() {
            onChange({
                cardCvv: inputState.inputValue
            });
        }), [ inputState ]);
        hooks_module_p((function() {
            var _cardType$code;
            var validity = dist_default.a.cvv(inputValue, null == cardType || null == (_cardType$code = cardType.code) ? void 0 : _cardType$code.size);
            touched && (validity.isPotentiallyValid = !1);
            setInputState((function(newState) {
                return _extends({}, newState, validity);
            }));
        }), [ cardType ]);
        hooks_module_p((function() {
            var _cardType$code2;
            var validity = dist_default.a.cvv(inputValue, null == cardType || null == (_cardType$code2 = cardType.code) ? void 0 : _cardType$code2.size);
            touched && (validity.isPotentiallyValid = !1);
            setInputState((function(newState) {
                return _extends({}, newState, validity);
            }));
        }), [ cardType ]);
        hooks_module_p((function() {
            "function" == typeof onValidityChange && onValidityChange({
                isValid: isValid,
                isPotentiallyValid: isPotentiallyValid
            });
            allowNavigation && inputValue && isValid && navigation.next();
        }), [ isValid, isPotentiallyValid ]);
        return y(_, null, y("input", _extends({
            "aria-describedby": "card-cvv-field-description",
            name: name,
            autocomplete: autocomplete,
            inputmode: "numeric",
            ref: cvvRef,
            type: type,
            className: "card-field-cvv",
            value: inputValue,
            style: style,
            maxLength: cardType.code.size,
            onKeyDown: function(event) {
                "function" == typeof onKeyDown && onKeyDown("Enter" === event.key);
                allowNavigation && navigateOnKeyDown(event, navigation);
            },
            onInput: function(event) {
                var _cardType$code3;
                var value = removeNonDigits(event.target.value);
                var validity = dist_default.a.cvv(value, null == cardType || null == (_cardType$code3 = cardType.code) ? void 0 : _cardType$code3.size);
                setInputState(_extends({}, inputState, validity, {
                    inputValue: value,
                    maskedInputValue: value,
                    keyStrokeCount: keyStrokeCount + 1
                }));
            },
            onFocus: function(event) {
                touched || setTouched(!0);
                "function" == typeof onFocus && onFocus(event);
            },
            onBlur: function(event) {
                "function" == typeof onBlur && onBlur(event);
                "function" == typeof onKeyDown && onKeyDown(!1);
            }
        }, attributes, {
            placeholder: null != (_attributes$placehold = attributes.placeholder) ? _attributes$placehold : cardType.code.name
        })), y(AriaMessage, {
            ariaMessageId: "card-cvv-field-description",
            ariaMessageRef: ariaMessageRef
        }));
    }
    function CardName(_ref) {
        var _ref$name = _ref.name, name = void 0 === _ref$name ? "name" : _ref$name, _ref$navigation = _ref.navigation, navigation = void 0 === _ref$navigation ? defaultNavigation : _ref$navigation, _ref$allowNavigation = _ref.allowNavigation, allowNavigation = void 0 !== _ref$allowNavigation && _ref$allowNavigation, state = _ref.state, type = _ref.type, style = _ref.style, maxLength = _ref.maxLength, onChange = _ref.onChange, onFocus = _ref.onFocus, onBlur = _ref.onBlur, onKeyDown = _ref.onKeyDown, onValidityChange = _ref.onValidityChange;
        var _useState = hooks_module_h({
            placeholder: _ref.placeholder
        }), attributes = _useState[0], setAttributes = _useState[1];
        var _useState2 = hooks_module_h(_extends({}, defaultInputState, state)), inputState = _useState2[0], setInputState = _useState2[1];
        var inputValue = inputState.inputValue, keyStrokeCount = inputState.keyStrokeCount, isValid = inputState.isValid, isPotentiallyValid = inputState.isPotentiallyValid;
        var nameRef = hooks_module_();
        var ariaMessageRef = hooks_module_();
        hooks_module_p((function() {
            exportMethods(nameRef, setAttributes, setInputState, ariaMessageRef);
        }), []);
        hooks_module_p((function() {
            onChange({
                cardName: inputState.inputValue
            });
        }), [ inputState ]);
        hooks_module_p((function() {
            "function" == typeof onValidityChange && onValidityChange({
                isValid: isValid,
                isPotentiallyValid: isPotentiallyValid
            });
            allowNavigation && inputValue && isValid && navigation.next();
        }), [ isValid, isPotentiallyValid ]);
        return y(_, null, y("input", _extends({
            "aria-describedby": "card-name-field-description",
            name: name,
            inputmode: "text",
            ref: nameRef,
            type: type,
            className: "card-field-name",
            value: inputValue,
            style: style,
            maxLength: maxLength,
            onKeyDown: function(event) {
                "function" == typeof onKeyDown && onKeyDown("Enter" === event.key);
                allowNavigation && navigateOnKeyDown(event, navigation);
            },
            onInput: function(event) {
                var value = event.target.value;
                var validity = dist_default.a.cardholderName(value);
                setInputState(_extends({}, inputState, validity, {
                    inputValue: value,
                    maskedInputValue: value,
                    keyStrokeCount: keyStrokeCount + 1
                }));
            },
            onFocus: function(event) {
                "function" == typeof onFocus && onFocus(event);
            },
            onBlur: function(event) {
                "function" == typeof onBlur && onBlur(event);
                "function" == typeof onKeyDown && onKeyDown(!1);
            }
        }, attributes)), y(AriaMessage, {
            ariaMessageId: "card-name-field-description",
            ariaMessageRef: ariaMessageRef
        }));
    }
    function CardPostalCode(_ref) {
        var _ref$name = _ref.name, name = void 0 === _ref$name ? "postal" : _ref$name, _ref$navigation = _ref.navigation, navigation = void 0 === _ref$navigation ? defaultNavigation : _ref$navigation, _ref$allowNavigation = _ref.allowNavigation, allowNavigation = void 0 !== _ref$allowNavigation && _ref$allowNavigation, state = _ref.state, type = _ref.type, style = _ref.style, maxLength = _ref.maxLength, onChange = _ref.onChange, onFocus = _ref.onFocus, onBlur = _ref.onBlur, onKeyDown = _ref.onKeyDown, onValidityChange = _ref.onValidityChange, minLength = _ref.minLength;
        var _useState = hooks_module_h({
            placeholder: _ref.placeholder
        }), attributes = _useState[0], setAttributes = _useState[1];
        var _useState2 = hooks_module_h(_extends({}, defaultInputState, state)), inputState = _useState2[0], setInputState = _useState2[1];
        var inputValue = inputState.inputValue, keyStrokeCount = inputState.keyStrokeCount, isValid = inputState.isValid, isPotentiallyValid = inputState.isPotentiallyValid;
        var postalCodeRef = hooks_module_();
        var ariaMessageRef = hooks_module_();
        hooks_module_p((function() {
            exportMethods(postalCodeRef, setAttributes, setInputState, ariaMessageRef);
        }), []);
        hooks_module_p((function() {
            onChange({
                cardPostalCode: inputState.inputValue
            });
        }), [ inputState ]);
        hooks_module_p((function() {
            "function" == typeof onValidityChange && onValidityChange({
                isValid: isValid,
                isPotentiallyValid: isPotentiallyValid
            });
            allowNavigation && inputValue && isValid && navigation.next();
        }), [ isValid, isPotentiallyValid ]);
        return y(_, null, y("input", _extends({
            "aria-describedby": "card-postalCode-field-description",
            name: name,
            inputmode: "numeric",
            ref: postalCodeRef,
            type: type,
            className: "card-field-postal-code",
            value: inputValue,
            style: style,
            maxLength: maxLength,
            onKeyDown: function(event) {
                "function" == typeof onKeyDown && onKeyDown("Enter" === event.key);
                allowNavigation && navigateOnKeyDown(event, navigation);
            },
            onInput: function(event) {
                var value = event.target.value;
                var validity = dist_default.a.postalCode(value, {
                    minLength: minLength
                });
                setInputState(_extends({}, inputState, validity, {
                    inputValue: value,
                    keyStrokeCount: keyStrokeCount + 1
                }));
            },
            onFocus: function(event) {
                "function" == typeof onFocus && onFocus(event);
            },
            onBlur: function(event) {
                "function" == typeof onBlur && onBlur(event);
                "function" == typeof onKeyDown && onKeyDown(!1);
            },
            minLength: minLength
        }, attributes)), y(AriaMessage, {
            ariaMessageId: "card-postalCode-field-description",
            ariaMessageRef: ariaMessageRef
        }));
    }
    function CardField(_ref) {
        var _placeholder$number, _placeholder$expiry;
        var cspNonce = _ref.cspNonce, onChange = _ref.onChange, _ref$styleObject = _ref.styleObject, styleObject = void 0 === _ref$styleObject ? {} : _ref$styleObject, _ref$placeholder = _ref.placeholder, placeholder = void 0 === _ref$placeholder ? {} : _ref$placeholder, _ref$gqlErrorsObject = _ref.gqlErrorsObject, gqlErrorsObject = void 0 === _ref$gqlErrorsObject ? {} : _ref$gqlErrorsObject, autoFocusRef = _ref.autoFocusRef, autocomplete = _ref.autocomplete;
        var _useState = hooks_module_h({}), attributes = _useState[0], setAttributes = _useState[1];
        var _useState2 = hooks_module_h(""), cssText = _useState2[0], setCSSText = _useState2[1];
        var _useState3 = hooks_module_h(""), number = _useState3[0], setNumber = _useState3[1];
        var _useState4 = hooks_module_h(""), cvv = _useState4[0], setCvv = _useState4[1];
        var _useState5 = hooks_module_h(""), expiry = _useState5[0], setExpiry = _useState5[1];
        var _useState6 = hooks_module_h(!0), isValid = _useState6[0], setIsValid = _useState6[1];
        var _useState7 = hooks_module_h(""), validationMessage = _useState7[0], setValidationMessage = _useState7[1];
        var _useState8 = hooks_module_h(!0), isCardEligible = _useState8[0], setIsCardEligible = _useState8[1];
        var _useState9 = hooks_module_h(initFieldValidity), numberValidity = _useState9[0], setNumberValidity = _useState9[1];
        var _useState10 = hooks_module_h(initFieldValidity), expiryValidity = _useState10[0], setExpiryValidity = _useState10[1];
        var _useState11 = hooks_module_h(initFieldValidity), cvvValidity = _useState11[0], setCvvValidity = _useState11[1];
        var _useState12 = hooks_module_h(!1), touched = _useState12[0], setTouched = _useState12[1];
        var _useState13 = hooks_module_h(!1), hasFocus = _useState13[0], setHasFocus = _useState13[1];
        var numberRef = hooks_module_();
        var expiryRef = hooks_module_();
        var cvvRef = hooks_module_();
        var cardFieldRef = hooks_module_();
        var cardNumberNavivation = {
            next: goToNextField(expiryRef),
            previous: function() {
                return belter.noop;
            }
        };
        var cardExpiryNavivation = {
            next: goToNextField(cvvRef),
            previous: goToPreviousField(numberRef)
        };
        var cardCvvNavivation = {
            next: function() {
                return belter.noop;
            },
            previous: goToPreviousField(expiryRef)
        };
        hooks_module_p((function() {
            autoFocusRef(numberRef);
            exportMethods(cardFieldRef, setAttributes);
        }), []);
        hooks_module_p((function() {
            setCSSText(getCSSText(DEFAULT_STYLE_SINGLE_CARD, styleObject));
        }), [ styleObject ]);
        hooks_module_p((function() {
            var field = gqlErrorsObject.field, errors = gqlErrorsObject.errors;
            "number" === field && errors.length > 0 && setNumberValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
            "expiry" === field && errors.length > 0 && setExpiryValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
            "cvv" === field && errors.length > 0 && setCvvValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
        }), [ gqlErrorsObject ]);
        hooks_module_p((function() {
            setValidationMessage(isCardEligible ? numberValidity.isPotentiallyValid || numberValidity.isValid ? expiryValidity.isPotentiallyValid || expiryValidity.isValid ? cvvValidity.isPotentiallyValid || cvvValidity.isValid ? "" : "This security code is not valid." : "This expiration date is not valid." : "This card number is not valid." : "This card vendor is not eligible.");
            var valid = Boolean(numberValidity.isValid && cvvValidity.isValid && expiryValidity.isValid);
            setIsValid(valid);
            var errors = function(_ref) {
                var isNumberValid = _ref.isNumberValid, isCvvValid = _ref.isCvvValid, isExpiryValid = _ref.isExpiryValid, isNameValid = _ref.isNameValid, isPostalCodeValid = _ref.isPostalCodeValid, _ref$gqlErrorsObject = _ref.gqlErrorsObject, gqlErrorsObject = void 0 === _ref$gqlErrorsObject ? {} : _ref$gqlErrorsObject;
                var errors = [];
                var field = gqlErrorsObject.field, gqlErrors = gqlErrorsObject.errors;
                !1 === _ref.isCardEligible && ("number" === field && gqlErrors.length ? errors.push.apply(errors, gqlErrors) : errors.push("INELIGIBLE_CARD_VENDOR"));
                !1 === isNumberValid && ("number" === field && gqlErrors.length ? errors.push.apply(errors, gqlErrors) : errors.push("INVALID_NUMBER"));
                !1 === isExpiryValid && ("expiry" === field && gqlErrors.length ? errors.push.apply(errors, gqlErrors) : errors.push("INVALID_EXPIRY"));
                !1 === isCvvValid && ("cvv" === field && gqlErrors.length ? errors.push.apply(errors, gqlErrors) : errors.push("INVALID_CVV"));
                !1 === isNameValid && ("name" === field && gqlErrors.length ? errors.push.apply(errors, gqlErrors) : errors.push("INVALID_NAME"));
                !1 === isPostalCodeValid && ("postal" === field && gqlErrors.length ? errors.push.apply(errors, gqlErrors) : errors.push("INVALID_POSTAL"));
                return errors;
            }({
                isCardEligible: isCardEligible,
                isNumberValid: numberValidity.isValid,
                isCvvValid: cvvValidity.isValid,
                isExpiryValid: expiryValidity.isValid,
                gqlErrorsObject: gqlErrorsObject
            });
            markValidity(numberRef, numberValidity, hasFocus, touched);
            markValidity(expiryRef, expiryValidity, hasFocus, touched);
            markValidity(cvvRef, cvvValidity, hasFocus, touched);
            onChange({
                value: {
                    number: number,
                    cvv: cvv,
                    expiry: expiry
                },
                valid: valid,
                errors: errors
            });
        }), [ number, cvv, expiry, isValid, numberValidity, isCardEligible, cvvValidity, expiryValidity ]);
        hooks_module_p((function() {
            var element = null == cardFieldRef ? void 0 : cardFieldRef.current;
            if (element) {
                hasFocus ? element.classList.add("focus") : element.classList.remove("focus");
                validationMessage.length > 0 ? element.classList.add("invalid") : element.classList.remove("invalid");
            }
        }), [ hasFocus, validationMessage ]);
        var handleFocus = function() {
            setTouched(!0);
            setHasFocus(!0);
        };
        return y(_, null, y("style", {
            nonce: cspNonce
        }, cssText), y(Icons, null), y("fieldset", _extends({
            ref: cardFieldRef,
            className: "card-field"
        }, attributes), y(CardNumber, {
            ref: numberRef,
            autocomplete: autocomplete,
            navigation: cardNumberNavivation,
            type: "text",
            allowNavigation: !0,
            placeholder: null != (_placeholder$number = placeholder.number) ? _placeholder$number : "Card number",
            onChange: function(_ref2) {
                setNumber(_ref2.cardNumber);
            },
            onEligibilityChange: function(eligibility) {
                return setIsCardEligible(eligibility);
            },
            onValidityChange: function(validity) {
                return setNumberValidity(_extends({}, validity));
            },
            onFocus: handleFocus,
            onBlur: function() {
                return setHasFocus(!1);
            }
        }), y(CardExpiry, {
            ref: expiryRef,
            autocomplete: autocomplete,
            navigation: cardExpiryNavivation,
            type: "text",
            allowNavigation: !0,
            placeholder: null != (_placeholder$expiry = placeholder.expiry) ? _placeholder$expiry : "MM / YY",
            maxLength: "7",
            onChange: function(_ref3) {
                return setExpiry(convertDateFormat(_ref3.maskedDate));
            },
            onValidityChange: function(validity) {
                return setExpiryValidity(_extends({}, validity));
            },
            onFocus: handleFocus,
            onBlur: function() {
                return setHasFocus(!1);
            }
        }), y(CardCVV, {
            ref: cvvRef,
            autocomplete: autocomplete,
            navigation: cardCvvNavivation,
            type: "text",
            allowNavigation: !0,
            placeholder: placeholder.cvv,
            onChange: function(_ref4) {
                return setCvv(_ref4.cardCvv);
            },
            onValidityChange: function(validity) {
                return setCvvValidity(_extends({}, validity));
            },
            onFocus: handleFocus,
            onBlur: function() {
                return setHasFocus(!1);
            }
        })), y(ValidationMessage, {
            message: validationMessage
        }));
    }
    function ValidationMessage(_ref5) {
        var message = _ref5.message;
        return y("div", {
            className: "card-field-validation-error " + (message.length ? "" : "hidden")
        }, y(Icon, {
            iconId: "icon-error"
        }), message);
    }
    function CardNumberField(_ref6) {
        var cspNonce = _ref6.cspNonce, onChange = _ref6.onChange, onFocus = _ref6.onFocus, _ref6$styleObject = _ref6.styleObject, styleObject = void 0 === _ref6$styleObject ? {} : _ref6$styleObject, placeholder = _ref6.placeholder, autoFocusRef = _ref6.autoFocusRef, autocomplete = _ref6.autocomplete, onKeyDown = _ref6.onKeyDown, _ref6$gqlErrors = _ref6.gqlErrors, gqlErrors = void 0 === _ref6$gqlErrors ? [] : _ref6$gqlErrors;
        var _useState14 = hooks_module_h(""), cssText = _useState14[0], setCSSText = _useState14[1];
        var _useState15 = hooks_module_h(""), number = _useState15[0], setNumber = _useState15[1];
        var _useState16 = hooks_module_h(!0), isCardEligible = _useState16[0], setIsCardEligible = _useState16[1];
        var _useState17 = hooks_module_h(initFieldValidity), numberValidity = _useState17[0], setNumberValidity = _useState17[1];
        var _useState18 = hooks_module_h([]), cards = _useState18[0], setCards = _useState18[1];
        var _useState19 = hooks_module_h(!1), hasFocus = _useState19[0], setHasFocus = _useState19[1];
        var _useState20 = hooks_module_h(!1), touched = _useState20[0], setTouched = _useState20[1];
        var _useState21 = hooks_module_h(!1), isSubmitRequest = _useState21[0], setIsSubmitRequest = _useState21[1];
        var numberRef = hooks_module_();
        var isValid = numberValidity.isValid, isPotentiallyValid = numberValidity.isPotentiallyValid;
        hooks_module_p((function() {
            autoFocusRef(numberRef);
        }), []);
        hooks_module_p((function() {
            setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
        }), [ styleObject ]);
        hooks_module_p((function() {
            gqlErrors.length > 0 && setNumberValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
        }), [ gqlErrors ]);
        hooks_module_p((function() {
            markValidity(numberRef, numberValidity, hasFocus, touched);
            onChange({
                value: number,
                valid: numberValidity.isValid,
                isFocused: hasFocus,
                potentiallyValid: numberValidity.isPotentiallyValid,
                potentialCardTypes: cards
            });
        }), [ number, isCardEligible, isValid, hasFocus, isPotentiallyValid, cards ]);
        hooks_module_p((function() {
            onFocus({
                isFocused: hasFocus
            });
        }), [ hasFocus ]);
        hooks_module_p((function() {
            onKeyDown({
                isInputSubmitRequest: isSubmitRequest
            });
        }), [ isSubmitRequest ]);
        return y(_, null, y("style", {
            nonce: cspNonce
        }, cssText), y(Icons, null), y(CardNumber, {
            ref: numberRef,
            type: "text",
            autocomplete: autocomplete,
            placeholder: null != placeholder ? placeholder : "Card number",
            onChange: function(_ref7) {
                return function(cardNumber, potentialCardTypes) {
                    setNumber(cardNumber);
                    setCards(potentialCardTypes);
                }(_ref7.cardNumber, _ref7.potentialCardTypes);
            },
            onEligibilityChange: function(eligibility) {
                return setIsCardEligible(eligibility);
            },
            onValidityChange: function(validity) {
                return setNumberValidity(validity);
            },
            onFocus: function() {
                setTouched(!0);
                setHasFocus(!0);
            },
            onBlur: function() {
                return setHasFocus(!1);
            },
            onKeyDown: function(keyDown) {
                return setIsSubmitRequest(keyDown);
            }
        }));
    }
    function CardExpiryField(_ref8) {
        var cspNonce = _ref8.cspNonce, onChange = _ref8.onChange, onFocus = _ref8.onFocus, onKeyDown = _ref8.onKeyDown, _ref8$styleObject = _ref8.styleObject, styleObject = void 0 === _ref8$styleObject ? {} : _ref8$styleObject, placeholder = _ref8.placeholder, autoFocusRef = _ref8.autoFocusRef, autocomplete = _ref8.autocomplete, _ref8$gqlErrors = _ref8.gqlErrors, gqlErrors = void 0 === _ref8$gqlErrors ? [] : _ref8$gqlErrors;
        var _useState22 = hooks_module_h(""), cssText = _useState22[0], setCSSText = _useState22[1];
        var _useState23 = hooks_module_h(""), expiry = _useState23[0], setExpiry = _useState23[1];
        var _useState24 = hooks_module_h(initFieldValidity), expiryValidity = _useState24[0], setExpiryValidity = _useState24[1];
        var expiryRef = hooks_module_();
        var _useState25 = hooks_module_h(!1), hasFocus = _useState25[0], setHasFocus = _useState25[1];
        var _useState26 = hooks_module_h(!1), touched = _useState26[0], setTouched = _useState26[1];
        var _useState27 = hooks_module_h(!1), isSubmitRequest = _useState27[0], setIsSubmitRequest = _useState27[1];
        var isValid = expiryValidity.isValid, isPotentiallyValid = expiryValidity.isPotentiallyValid;
        hooks_module_p((function() {
            autoFocusRef(expiryRef);
        }), []);
        hooks_module_p((function() {
            setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
        }), [ styleObject ]);
        hooks_module_p((function() {
            gqlErrors.length > 0 && setExpiryValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
        }), [ gqlErrors ]);
        hooks_module_p((function() {
            markValidity(expiryRef, expiryValidity, hasFocus, touched);
            onChange({
                value: expiry,
                valid: expiryValidity.isValid,
                isFocused: hasFocus,
                potentiallyValid: expiryValidity.isPotentiallyValid
            });
        }), [ expiry, isValid, hasFocus, isPotentiallyValid ]);
        hooks_module_p((function() {
            onFocus({
                isFocused: hasFocus
            });
        }), [ hasFocus ]);
        hooks_module_p((function() {
            onKeyDown({
                isInputSubmitRequest: isSubmitRequest
            });
        }), [ isSubmitRequest ]);
        return y(_, null, y("style", {
            nonce: cspNonce
        }, cssText), y(CardExpiry, {
            ref: expiryRef,
            type: "text",
            autocomplete: autocomplete,
            placeholder: null != placeholder ? placeholder : "MM / YY",
            maxLength: "7",
            onChange: function(_ref9) {
                return setExpiry(convertDateFormat(_ref9.maskedDate));
            },
            onValidityChange: function(validity) {
                return setExpiryValidity(validity);
            },
            onFocus: function() {
                setTouched(!0);
                setHasFocus(!0);
            },
            onBlur: function() {
                return setHasFocus(!1);
            },
            onKeyDown: function(value) {
                return setIsSubmitRequest(value);
            }
        }));
    }
    function CardCVVField(_ref10) {
        var cspNonce = _ref10.cspNonce, onChange = _ref10.onChange, onFocus = _ref10.onFocus, onKeyDown = _ref10.onKeyDown, _ref10$styleObject = _ref10.styleObject, styleObject = void 0 === _ref10$styleObject ? {} : _ref10$styleObject, placeholder = _ref10.placeholder, autoFocusRef = _ref10.autoFocusRef, autocomplete = _ref10.autocomplete, _ref10$gqlErrors = _ref10.gqlErrors, gqlErrors = void 0 === _ref10$gqlErrors ? [] : _ref10$gqlErrors;
        var _useState28 = hooks_module_h(""), cssText = _useState28[0], setCSSText = _useState28[1];
        var _useState29 = hooks_module_h(""), cvv = _useState29[0], setCvv = _useState29[1];
        var _useState30 = hooks_module_h(initFieldValidity), cvvValidity = _useState30[0], setCvvValidity = _useState30[1];
        var cvvRef = hooks_module_();
        var _useState31 = hooks_module_h(!1), hasFocus = _useState31[0], setHasFocus = _useState31[1];
        var _useState32 = hooks_module_h(!1), touched = _useState32[0], setTouched = _useState32[1];
        var _useState33 = hooks_module_h(!1), isSubmitRequest = _useState33[0], setIsSubmitRequest = _useState33[1];
        var isValid = cvvValidity.isValid, isPotentiallyValid = cvvValidity.isPotentiallyValid;
        hooks_module_p((function() {
            autoFocusRef(cvvRef);
        }), []);
        hooks_module_p((function() {
            setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
        }), [ styleObject ]);
        hooks_module_p((function() {
            gqlErrors.length > 0 && setCvvValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
        }), [ gqlErrors ]);
        hooks_module_p((function() {
            markValidity(cvvRef, cvvValidity, hasFocus, touched);
            onChange({
                value: cvv,
                valid: cvvValidity.isValid,
                isFocused: hasFocus,
                potentiallyValid: cvvValidity.isPotentiallyValid
            });
        }), [ cvv, isValid, hasFocus, isPotentiallyValid ]);
        hooks_module_p((function() {
            onFocus({
                isFocused: hasFocus
            });
        }), [ hasFocus ]);
        hooks_module_p((function() {
            onKeyDown({
                isInputSubmitRequest: isSubmitRequest
            });
        }), [ isSubmitRequest ]);
        return y(_, null, y("style", {
            nonce: cspNonce
        }, cssText), y(CardCVV, {
            ref: cvvRef,
            type: "text",
            autocomplete: autocomplete,
            placeholder: placeholder,
            onChange: function(_ref11) {
                return setCvv(_ref11.cardCvv);
            },
            onValidityChange: function(validity) {
                return setCvvValidity(validity);
            },
            onFocus: function() {
                setTouched(!0);
                setHasFocus(!0);
            },
            onBlur: function() {
                return setHasFocus(!1);
            },
            onKeyDown: function(value) {
                return setIsSubmitRequest(value);
            }
        }));
    }
    function CardNameField(_ref12) {
        var cspNonce = _ref12.cspNonce, onChange = _ref12.onChange, onFocus = _ref12.onFocus, onKeyDown = _ref12.onKeyDown, _ref12$styleObject = _ref12.styleObject, styleObject = void 0 === _ref12$styleObject ? {} : _ref12$styleObject, placeholder = _ref12.placeholder, autoFocusRef = _ref12.autoFocusRef, _ref12$gqlErrors = _ref12.gqlErrors, gqlErrors = void 0 === _ref12$gqlErrors ? [] : _ref12$gqlErrors;
        var _useState34 = hooks_module_h(""), cssText = _useState34[0], setCSSText = _useState34[1];
        var _useState35 = hooks_module_h(""), name = _useState35[0], setName = _useState35[1];
        var _useState36 = hooks_module_h(initFieldValidity), nameValidity = _useState36[0], setNameValidity = _useState36[1];
        var nameRef = hooks_module_();
        var _useState37 = hooks_module_h(!1), touched = _useState37[0], setTouched = _useState37[1];
        var _useState38 = hooks_module_h(!1), hasFocus = _useState38[0], setHasFocus = _useState38[1];
        var _useState39 = hooks_module_h(!1), isSubmitRequest = _useState39[0], setIsSubmitRequest = _useState39[1];
        var isValid = nameValidity.isValid, isPotentiallyValid = nameValidity.isPotentiallyValid;
        hooks_module_p((function() {
            autoFocusRef(nameRef);
        }), []);
        hooks_module_p((function() {
            setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
        }), [ styleObject ]);
        hooks_module_p((function() {
            gqlErrors.length > 0 && setNameValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
        }), [ gqlErrors ]);
        hooks_module_p((function() {
            markValidity(nameRef, nameValidity, hasFocus, touched);
            onChange({
                value: name,
                valid: nameValidity.isValid,
                isFocused: hasFocus,
                potentiallyValid: nameValidity.isPotentiallyValid
            });
        }), [ name, isValid, hasFocus, isPotentiallyValid ]);
        hooks_module_p((function() {
            onFocus({
                isFocused: hasFocus
            });
        }), [ hasFocus ]);
        hooks_module_p((function() {
            onKeyDown({
                isInputSubmitRequest: isSubmitRequest
            });
        }), [ isSubmitRequest ]);
        return y(_, null, y("style", {
            nonce: cspNonce
        }, cssText), y(CardName, {
            ref: nameRef,
            type: "text",
            placeholder: null != placeholder ? placeholder : "Cardholder Name (optional)",
            maxLength: "255",
            onChange: function(_ref13) {
                return setName(_ref13.cardName);
            },
            onValidityChange: function(validity) {
                return setNameValidity(validity);
            },
            onFocus: function() {
                setHasFocus(!0);
                setTouched(!0);
            },
            onBlur: function() {
                return setHasFocus(!1);
            },
            onKeyDown: function(value) {
                return setIsSubmitRequest(value);
            }
        }));
    }
    function CardPostalCodeField(_ref14) {
        var cspNonce = _ref14.cspNonce, onChange = _ref14.onChange, onFocus = _ref14.onFocus, onKeyDown = _ref14.onKeyDown, _ref14$styleObject = _ref14.styleObject, styleObject = void 0 === _ref14$styleObject ? {} : _ref14$styleObject, placeholder = _ref14.placeholder, minLength = _ref14.minLength, maxLength = _ref14.maxLength, autoFocusRef = _ref14.autoFocusRef, autocomplete = _ref14.autocomplete, _ref14$gqlErrors = _ref14.gqlErrors, gqlErrors = void 0 === _ref14$gqlErrors ? [] : _ref14$gqlErrors;
        var _useState40 = hooks_module_h(""), cssText = _useState40[0], setCSSText = _useState40[1];
        var _useState41 = hooks_module_h(""), postalCode = _useState41[0], setPostalCode = _useState41[1];
        var _useState42 = hooks_module_h(initFieldValidity), postalCodeValidity = _useState42[0], setPostalCodeValidity = _useState42[1];
        var postalRef = hooks_module_();
        var _useState43 = hooks_module_h(!1), hasFocus = _useState43[0], setHasFocus = _useState43[1];
        var _useState44 = hooks_module_h(!1), touched = _useState44[0], setTouched = _useState44[1];
        var _useState45 = hooks_module_h(!1), isSubmitRequest = _useState45[0], setIsSubmitRequest = _useState45[1];
        var isValid = postalCodeValidity.isValid, isPotentiallyValid = postalCodeValidity.isPotentiallyValid;
        hooks_module_p((function() {
            autoFocusRef(postalRef);
        }), []);
        hooks_module_p((function() {
            setCSSText(getCSSText(DEFAULT_STYLE_MULTI_CARD, styleObject));
        }), [ styleObject ]);
        hooks_module_p((function() {
            gqlErrors.length > 0 && setPostalCodeValidity({
                isPotentiallyValid: !1,
                isValid: !1
            });
        }), [ gqlErrors ]);
        hooks_module_p((function() {
            markValidity(postalRef, postalCodeValidity, hasFocus, touched);
            onChange({
                value: postalCode,
                valid: postalCodeValidity.isValid,
                isFocused: hasFocus,
                potentiallyValid: postalCodeValidity.isPotentiallyValid
            });
        }), [ postalCode, isValid, hasFocus, isPotentiallyValid ]);
        hooks_module_p((function() {
            onFocus({
                isFocused: hasFocus
            });
        }), [ hasFocus ]);
        hooks_module_p((function() {
            onKeyDown({
                isInputSubmitRequest: isSubmitRequest
            });
        }), [ isSubmitRequest ]);
        return y(_, null, y("style", {
            nonce: cspNonce
        }, cssText), y(CardPostalCode, {
            ref: postalRef,
            type: "text",
            autocomplete: autocomplete,
            placeholder: null != placeholder ? placeholder : "Postal code",
            minLength: minLength,
            maxLength: maxLength,
            onChange: function(_ref15) {
                return setPostalCode(_ref15.cardPostalCode);
            },
            onValidityChange: function(validity) {
                return setPostalCodeValidity(validity);
            },
            onFocus: function() {
                setTouched(!0);
                setHasFocus(!0);
            },
            onBlur: function() {
                return setHasFocus(!1);
            },
            onKeyDown: function(value) {
                return setIsSubmitRequest(value);
            }
        }));
    }
    function Page(_ref) {
        var cspNonce = _ref.cspNonce, props = _ref.props, featureFlags = _ref.featureFlags;
        var facilitatorAccessToken = props.facilitatorAccessToken, style = props.style, disableAutocomplete = props.disableAutocomplete, placeholder = props.placeholder, type = props.type, xport = props.export, minLength = props.minLength, maxLength = props.maxLength;
        var _ref2 = props.inputEvents || {}, onChange = _ref2.onChange, onFocus = _ref2.onFocus, onBlur = _ref2.onBlur, onInputSubmitRequest = _ref2.onInputSubmitRequest;
        var _useState = hooks_module_h(), fieldValue = _useState[0], setFieldValue = _useState[1];
        var _useState2 = hooks_module_h(!1), fieldValid = _useState2[0], setFieldValid = _useState2[1];
        var _useState3 = hooks_module_h(!0), fieldPotentiallyValid = _useState3[0], setFieldPotentiallyValid = _useState3[1];
        var _useState4 = hooks_module_h([]), cardTypes = _useState4[0], setCardTypes = _useState4[1];
        var _useState5 = hooks_module_h(!1), fieldFocus = _useState5[0], setFieldFocus = _useState5[1];
        var _useState6 = hooks_module_h(!1), inputSubmit = _useState6[0], setInputSubmit = _useState6[1];
        var _useState7 = hooks_module_h(), mainRef = _useState7[0], setRef = _useState7[1];
        var _useState8 = hooks_module_h({
            singleField: {},
            numberField: [],
            expiryField: [],
            cvvField: [],
            nameField: [],
            postalCodeField: []
        }), fieldGQLErrors = _useState8[0], setFieldGQLErrors = _useState8[1];
        var initialRender = hooks_module_(!0);
        var autocomplete;
        disableAutocomplete && (autocomplete = "off");
        var getFieldValue = function() {
            return fieldValue;
        };
        var isFieldValid = function() {
            return fieldValid;
        };
        var isFieldPotentiallyValid = function() {
            return fieldPotentiallyValid;
        };
        var isFieldFocused = function() {
            return fieldFocus;
        };
        var getPotentialCardTypes = function() {
            return cardTypes;
        };
        var setGqlErrors = function(errorData) {
            var errors = errorData.errors;
            var errorObject = _extends({}, fieldGQLErrors);
            if ("single" === type) errorObject.singleField = _extends({}, errorData); else if (errors && errors.length) switch (type) {
              case "number":
                errorObject.numberField = [].concat(errors);
                break;

              case "expiry":
                errorObject.expiryField = [].concat(errors);
                break;

              case "cvv":
                errorObject.cvvField = [].concat(errors);
                break;

              case "name":
                errorObject.nameField = [].concat(errors);
                break;

              case "postal":
                errorObject.postalCodeField = [].concat(errors);
            }
            setFieldGQLErrors(errorObject);
        };
        var resetGQLErrors = function() {
            setFieldGQLErrors({
                singleField: {},
                numberField: [],
                expiryField: [],
                cvvField: [],
                nameField: [],
                postalCodeField: []
            });
        };
        var getStateObject = function() {
            var _getCardFieldState = getCardFieldState(), cards = _getCardFieldState.cards, fields = _getCardFieldState.fields;
            var currentField = kebabToCamelCase(CARD_FIELD_TYPE_TO_FRAME_NAME[type]);
            fields[currentField] = {
                isEmpty: isEmpty(fieldValue),
                isFocused: fieldFocus,
                isFieldPotentiallyValid: fieldPotentiallyValid,
                isValid: fieldValid
            };
            return {
                fields: fields,
                potentialCardTypes: "cardNumberField" === currentField ? parsedCardType(cardTypes) : cards
            };
        };
        hooks_module_p((function() {
            if (initialRender.current && "" === fieldValue) initialRender.current = !1; else if (!initialRender.current && "function" == typeof onChange) {
                var _getStateObject = getStateObject(), fields = _getStateObject.fields, potentialCardTypes = _getStateObject.potentialCardTypes;
                var errors = getFieldErrors_getFieldErrors(fields);
                onChange({
                    fields: fields,
                    cards: potentialCardTypes,
                    emittedBy: type,
                    isFormValid: 0 === errors.length,
                    errors: errors
                });
            }
        }), [ fieldValue ]);
        hooks_module_p((function() {
            if (initialRender.current && "" === fieldValue) initialRender.current = !1; else if (!initialRender.current && "function" == typeof onFocus) {
                var _getStateObject2 = getStateObject(), fields = _getStateObject2.fields, potentialCardTypes = _getStateObject2.potentialCardTypes;
                var errors = getFieldErrors_getFieldErrors(fields);
                var fieldStateObject = {
                    fields: fields,
                    cards: potentialCardTypes,
                    emittedBy: type,
                    isFormValid: 0 === errors.length,
                    errors: errors
                };
                fieldFocus ? onFocus(_extends({}, fieldStateObject)) : "function" != typeof onBlur || fieldFocus || onBlur(_extends({}, fieldStateObject));
            }
        }), [ fieldFocus ]);
        hooks_module_p((function() {
            if (inputSubmit && "function" == typeof onInputSubmitRequest) {
                var _getStateObject3 = getStateObject(), fields = _getStateObject3.fields, potentialCardTypes = _getStateObject3.potentialCardTypes;
                var errors = getFieldErrors_getFieldErrors(fields);
                onInputSubmitRequest(_extends({}, {
                    fields: fields,
                    cards: potentialCardTypes,
                    emittedBy: type,
                    isFormValid: 0 === errors.length,
                    errors: errors
                }));
                setInputSubmit(!1);
            }
        }), [ inputSubmit ]);
        hooks_module_p((function() {
            !function(input) {
                if (input) {
                    var timeoutID = null;
                    window.addEventListener("focus", (function() {
                        timeoutID = setTimeout((function() {
                            timeoutID = null;
                            !function(input) {
                                var inputIsEmptyInitially = "" === input.value;
                                inputIsEmptyInitially && (input.value = " ");
                                var start = input.selectionStart;
                                var end = input.selectionEnd;
                                input.setSelectionRange(0, 0);
                                input.setSelectionRange(start, end);
                                inputIsEmptyInitially && (input.value = "");
                            }(input);
                            input.focus();
                        }));
                    }));
                    window.addEventListener("focusin", (function(event) {
                        if (timeoutID && event.target instanceof HTMLInputElement) {
                            clearTimeout(timeoutID);
                            timeoutID = null;
                        }
                    }));
                }
            }(mainRef);
        }), [ mainRef ]);
        hooks_module_p((function() {
            !function(_ref) {
                window.exports = {
                    name: _ref.name,
                    isFieldValid: _ref.isFieldValid,
                    isFieldPotentiallyValid: _ref.isFieldPotentiallyValid,
                    getPotentialCardTypes: _ref.getPotentialCardTypes,
                    isFieldFocused: _ref.isFieldFocused,
                    getFieldValue: _ref.getFieldValue,
                    setGqlErrors: _ref.setGqlErrors,
                    resetGQLErrors: _ref.resetGQLErrors
                };
            }({
                name: CARD_FIELD_TYPE_TO_FRAME_NAME[type],
                isFieldPotentiallyValid: isFieldPotentiallyValid,
                getPotentialCardTypes: getPotentialCardTypes,
                isFieldValid: isFieldValid,
                isFieldFocused: isFieldFocused,
                getFieldValue: getFieldValue,
                setGqlErrors: setGqlErrors,
                resetGQLErrors: resetGQLErrors
            });
            xport({
                submit: function(extraData) {
                    var extraFields = function(extraData) {
                        return !extraData || "object" != typeof extraData || Array.isArray(extraData) ? {} : Object.keys(extraData).reduce((function(acc, key) {
                            VALID_EXTRA_FIELDS.includes(key) && (acc[key] = extraData[key]);
                            return acc;
                        }), {});
                    }(extraData);
                    return submitCardFields({
                        facilitatorAccessToken: facilitatorAccessToken,
                        extraFields: extraFields,
                        featureFlags: featureFlags
                    });
                },
                getState: function() {
                    var cardFieldState = getCardFieldState();
                    var errors = getFieldErrors_getFieldErrors(cardFieldState.fields);
                    return _extends({}, cardFieldState, {
                        isFormValid: 0 === errors.length,
                        errors: errors
                    });
                }
            });
        }), [ fieldValid, fieldValue, fieldFocus, fieldPotentiallyValid, cardTypes ]);
        var onFieldChange = function(_ref3) {
            var valid = _ref3.valid, isFocused = _ref3.isFocused, potentiallyValid = _ref3.potentiallyValid, potentialCardTypes = _ref3.potentialCardTypes;
            setFieldValue(_ref3.value);
            setFieldFocus(isFocused);
            setFieldValid(valid);
            setFieldPotentiallyValid(potentiallyValid);
            resetGQLErrors();
            setCardTypes(potentialCardTypes);
        };
        var onFieldFocus = function(_ref4) {
            setFieldFocus(_ref4.isFocused);
        };
        var onInputSubmit = function(_ref5) {
            setInputSubmit(_ref5.isInputSubmitRequest);
        };
        return y(_, null, "single" === type ? y(CardField, {
            gqlErrorsObject: fieldGQLErrors.singleField,
            cspNonce: cspNonce,
            autocomplete: autocomplete,
            onChange: onFieldChange,
            styleObject: style,
            placeholder: placeholder,
            autoFocusRef: function(ref) {
                return setRef(ref.current.base);
            }
        }) : null, "number" === type ? y(CardNumberField, {
            ref: mainRef,
            gqlErrors: fieldGQLErrors.numberField,
            cspNonce: cspNonce,
            autocomplete: autocomplete,
            onChange: onFieldChange,
            onFocus: onFieldFocus,
            onKeyDown: onInputSubmit,
            styleObject: style,
            placeholder: placeholder,
            autoFocusRef: function(ref) {
                return setRef(ref.current.base);
            }
        }) : null, "cvv" === type ? y(CardCVVField, {
            ref: mainRef,
            gqlErrors: fieldGQLErrors.cvvField,
            cspNonce: cspNonce,
            autocomplete: autocomplete,
            onChange: onFieldChange,
            onKeyDown: onInputSubmit,
            onFocus: onFieldFocus,
            styleObject: style,
            placeholder: placeholder,
            autoFocusRef: function(ref) {
                return setRef(ref.current.base);
            }
        }) : null, "expiry" === type ? y(CardExpiryField, {
            ref: mainRef,
            gqlErrors: fieldGQLErrors.expiryField,
            cspNonce: cspNonce,
            autocomplete: autocomplete,
            onChange: onFieldChange,
            onFocus: onFieldFocus,
            onKeyDown: onInputSubmit,
            styleObject: style,
            placeholder: placeholder,
            autoFocusRef: function(ref) {
                return setRef(ref.current.base);
            }
        }) : null, "name" === type ? y(CardNameField, {
            ref: mainRef,
            gqlErrors: fieldGQLErrors.nameField,
            cspNonce: cspNonce,
            onChange: onFieldChange,
            onFocus: onFieldFocus,
            onKeyDown: onInputSubmit,
            styleObject: style,
            placeholder: placeholder,
            autoFocusRef: function(ref) {
                return setRef(ref.current.base);
            }
        }) : null, "postal" === type ? y(CardPostalCodeField, {
            ref: mainRef,
            gqlErrors: fieldGQLErrors.postalCodeField,
            cspNonce: cspNonce,
            onChange: onFieldChange,
            onFocus: onFieldFocus,
            onKeyDown: onInputSubmit,
            styleObject: style,
            placeholder: placeholder,
            minLength: minLength,
            maxLength: maxLength || 10,
            autoFocusRef: function(ref) {
                return setRef(ref.current.base);
            }
        }) : null);
    }
    function setupCard(_ref6) {
        var cspNonce = _ref6.cspNonce, featureFlags = _ref6.featureFlags, buyerCountry = _ref6.buyerCountry, metadata = _ref6.metadata;
        var props = getCardProps({
            facilitatorAccessToken: _ref6.facilitatorAccessToken,
            featureFlags: featureFlags
        });
        !function(_ref) {
            var _tracking;
            var env = _ref.env, sessionID = _ref.sessionID, clientID = _ref.clientID, partnerAttributionID = _ref.partnerAttributionID, sdkCorrelationID = _ref.sdkCorrelationID, cardCorrelationID = _ref.cardCorrelationID, locale = _ref.locale, merchantID = _ref.merchantID, merchantDomain = _ref.merchantDomain, buyerCountry = _ref.buyerCountry, type = _ref.type, hcfSessionID = _ref.hcfSessionID;
            var logger = getLogger();
            !function(_ref2) {
                var env = _ref2.env, sessionID = _ref2.sessionID, clientID = _ref2.clientID, sdkCorrelationID = _ref2.sdkCorrelationID, buyerCountry = _ref2.buyerCountry, locale = _ref2.locale, _ref2$sdkVersion = _ref2.sdkVersion, sdkVersion = void 0 === _ref2$sdkVersion ? window.paypal.version : _ref2$sdkVersion;
                var logger = getLogger();
                logger.addPayloadBuilder((function() {
                    return {
                        referer: window.location.host,
                        sdkCorrelationID: sdkCorrelationID,
                        sessionID: sessionID,
                        clientID: clientID,
                        env: env
                    };
                }));
                logger.addTrackingBuilder((function() {
                    var _ref3;
                    return (_ref3 = {}).feed_name = "payments_sdk", _ref3.serverside_data_source = "checkout", 
                    _ref3.client_id = clientID, _ref3.page_session_id = sessionID, _ref3.referer_url = window.location.host, 
                    _ref3.buyer_cntry = buyerCountry, _ref3.locale = locale.lang + "_" + locale.country, 
                    _ref3.integration_identifier = clientID, _ref3.sdk_environment = function(ua) {
                        void 0 === ua && (ua = getUserAgent());
                        return /iPhone|iPod|iPad/.test(ua);
                    }() ? "iOS" : function(ua) {
                        void 0 === ua && (ua = getUserAgent());
                        return /Android/.test(ua);
                    }() ? "android" : null, _ref3.sdk_name = "payments_sdk", _ref3.sdk_version = sdkVersion, 
                    _ref3.user_agent = window.navigator && window.navigator.userAgent, _ref3.context_correlation_id = sdkCorrelationID, 
                    _ref3.t = Date.now().toString(), _ref3;
                }));
                promise_ZalgoPromise.onPossiblyUnhandledException((function(err) {
                    var _logger$track;
                    logger.track(((_logger$track = {}).ext_error_code = "payments_sdk_error", _logger$track.ext_error_desc = stringifyErrorMessage(err), 
                    _logger$track));
                    logger.error("unhandled_error", {
                        err: stringifyError(err)
                    });
                    logger.flush().catch(src_util_noop);
                }));
            }({
                env: env,
                sessionID: sessionID,
                clientID: clientID,
                sdkCorrelationID: sdkCorrelationID,
                locale: locale,
                buyerCountry: buyerCountry
            });
            logger.addTrackingBuilder((function() {
                var _ref2;
                return (_ref2 = {}).context_type = "hcf_session_id", _ref2.context_id = hcfSessionID, 
                _ref2.button_version = "5.0.133", _ref2.hcf_session_id = hcfSessionID, _ref2.hcf_correlation_id = cardCorrelationID, 
                _ref2.bn_code = partnerAttributionID, _ref2.merchant_domain = merchantDomain, _ref2.t = Date.now().toString(), 
                _ref2.sdk_correlation_id = sdkCorrelationID, _ref2.checkout = clientID, _ref2.seller_id = null == merchantID ? void 0 : merchantID[0], 
                _ref2;
            }));
            var tracking = ((_tracking = {}).state_name = "card_field", _tracking.transition_name = "hcf_" + type + "_field_rendered", 
            _tracking.event_name = "hcf_" + type + "_field_rendered", _tracking);
            promise_ZalgoPromise.hash({
                pageRenderTime: waitForDocumentReady().then((function() {
                    var performance = getPerformance();
                    if (performance) {
                        var timing = performance.timing;
                        return timing.connectEnd && timing.domInteractive ? timing.domInteractive - timing.connectEnd : void 0;
                    }
                }))
            }).then((function(_ref3) {
                var _extends2;
                var pageRenderTime = _ref3.pageRenderTime;
                logger.track(_extends({}, tracking, ((_extends2 = {}).page_load_time = pageRenderTime ? pageRenderTime.toString() : "", 
                _extends2)));
                logger.flush();
            }));
        }({
            env: props.env,
            sessionID: props.sessionID,
            cardSessionID: props.cardSessionID,
            clientID: props.clientID,
            partnerAttributionID: props.partnerAttributionID,
            sdkCorrelationID: props.sdkCorrelationID,
            cardCorrelationID: null == metadata ? void 0 : metadata.correlationID,
            locale: props.locale,
            merchantID: props.merchantID,
            merchantDomain: props.merchantDomain,
            buyerCountry: buyerCountry,
            type: props.type,
            hcfSessionID: props.hcfSessionID
        });
        !function(u, i, t) {
            var o, f;
            l.__ && l.__(u, i), o = !1 ? null : i.__k, f = [], L(i, u = i.__k = y(_, null, [ u ]), o || c, c, void 0 !== i.ownerSVGElement, o ? null : i.firstChild ? n.call(i.childNodes) : null, f, o ? o.__e : i.firstChild, !1), 
            M(f, u);
        }(y(Page, {
            cspNonce: cspNonce,
            props: props,
            featureFlags: featureFlags
        }), util_getBody());
    }
} ]);