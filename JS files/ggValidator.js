// GG Universal Validator
// 1.0.4
//
// Provides an interface for creating on-the-fly validation for elements.
//
// Changlog:
// [1.0.4] - 10/27/2016
// ### Added
//  - Rulesets can now include an OR clause, denoted by double pipe symbols (||), which will allow either rule/criteria to validate.
//  - New validation criteria types, empty and notempty. These criterias determine if any non whitespace characters are present.
// [1.0.3] - 10/07/2016
// ### Added
//  - New function: ggValidator.clearTooltip(). This will clear any tooltip for a given jQuery object.
// [1.0.2] - 07/01/2016
// ### Added
//  - New function: ggValidator.addRuleset().setTooltipSelector(). This changes which element to show the tooltip popup on
//    when field validation fails. If there are multiple elements found using the selector, it will attempt to follow
//    the index count of the field selector. For example, if there are three hidden input fields of the same class that
//    are targeted with the field selector and three visible input boxes that are targeted with the tooltip selector, and the first
//    hidden field failed validation, the first visible input box would have the tooltip appear over it.
// [1.0.1] - 06/28/2016
// ### Added
//  - Rules can now use custom functions returning boolean values in place of strings or regular expressions to
//    test for field validity. The functions must either have 0 or 1 parameters, in which the latter would have
//    the field's value passed as an argument.
//  - The object returned on ggValidator.addRuleset() now includes functions:
//    - addFailedCallback()
//    - addSuccessCallback()
//    - removeFailedCallback()
//    - removeSuccessCallback()
//    - triggerFailedCallback()
//    - triggerSuccessCallback()
//    - toggleIgnoreInvisible()
//  - Custom validation functions can now be added to a validator by calling ggValidator.addRuleCallback(). To use, pass in a name for the rule and a callback function.
//  - Registered rule callbacks can be retrieved by name from calling ggValidator.getRuleCallback().
//  - IE8 support for String.trim().
// ### Changed
//  - Renamed public function ggValidator.add() to ggValidator.addRuleset().
//  - Renamed property ggValidator.addRuleset().skipInvisible to ggValidator.addRuleset().ignoreInvisible.
// ### Fixed
//  - Upon a field failing multiple validation rules within separate rulesets, the first-added failed ruleset
//    will display its tooltip popup instead of all of the failed ruleset tooltips at once.
//  - CSS adjustments to more accurately position the tooltip message shown.
//
//
// Known Issues:
// - In IE8, performing a validation more than once will cause tooltips to not show.


// Add IE8 support for the String.trim() function.
if(typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	}
}


// Singleton that provides functions to test for various types of validity.
var ggValidatorTesterSingleton = (function() {

	var instance;

	function createInstance() {
		var singleton = new Object();

		singleton.testNot = function(value, cantEqual) {
			if (parseFloat(value).toString() !== "NaN" && parseFloat(cantEqual).toString() !== "NaN")
				return parseFloat(value).toString() !== parseFloat(cantEqual).toString();
			return value.toString().toLowerCase().trim() !== cantEqual.toString().toLowerCase().trim();
		};

		singleton.testIs = function(value, mustEqual) {
			if (parseFloat(value).toString() !== "NaN" && parseFloat(mustEqual).toString() !== "NaN")
				return parseFloat(value).toString() === parseFloat(mustEqual).toString();
			return value.toString().toLowerCase().trim() === mustEqual.toString().toLowerCase().trim();
		};

		singleton.testGreaterThan = function(value, gtValue) {
			if (parseFloat(gtValue).toString() === "NaN") {
				console.log("testGreaterThan: invalid gtValue of " + gtValue.toString())
				return false;
			}
			if (parseFloat(value).toString() === "NaN")
				return false;
			return parseFloat(value) > parseFloat(gtValue);
		};

		singleton.testLessThan = function(value, ltValue) {
			if (parseFloat(ltValue).toString() === "NaN") {
				console.log("testLessThan: invalid ltValue of " + ltValue.toString())
				return false;
			}
			if (parseFloat(value).toString() === "NaN")
				return false;
			return parseFloat(value) < parseFloat(ltValue);
		};

		singleton.testGreaterThanOrEquals = function(value, gtValue) {
			if (parseFloat(gtValue).toString() === "NaN") {
				console.log("testGreaterThanOrEquals: invalid gtValue of " + gtValue.toString())
				return false;
			}
			if (parseFloat(value).toString() === "NaN")
				return false;
			return parseFloat(value) >= parseFloat(gtValue);
		};

		singleton.testLessThanOrEquals = function(value, ltValue) {
			if (parseFloat(ltValue).toString() === "NaN") {
				console.log("testLessThanOrEquals: invalid ltValue of " + ltValue.toString())
				return false;
			}
			if (parseFloat(value).toString() === "NaN")
				return false;
			return parseFloat(value) <= parseFloat(ltValue);
		};

		singleton.testMinLength = function(value, minLength) {
			if (parseInt(minLength).toString() === "NaN") {
				console.log("testMinLength: invalid minLength of " + minLength.toString())
				return false;
			}
			return value.toString().length >= parseInt(minLength);
		};
		
		singleton.testMaxLength = function(value, maxLength) {
			if (parseInt(maxLength).toString() === "NaN") {
				console.log("testMaxLength: invalid maxLength of " + maxLength.toString())
				return false;
			}
			return value.toString().length <= parseInt(maxLength);
		};

		singleton.testIsEmpty = function(value) {
			return /\S/.test(value) === false;
		};

		singleton.testIsNotEmpty = function(value) {
			return /\S/.test(value) === true;
		};

		singleton.testMinLineCount = function(value, minLineCount) {
			if (parseInt(minLineCount).toString() === "NaN") {
				console.log("testMinLineCount: invalid minLineCount of " + minLineCount.toString())
				return false;
			}
			return value.toString().trim().split("\n").length >= minLineCount;
		};

		singleton.testMaxLineCount = function(value, maxLineCount) {
			if (parseInt(maxLineCount).toString() === "NaN") {
				console.log("testMaxLineCount: invalid maxLineCount of " + maxLineCount.toString())
				return false;
			}
			return value.toString().trim().split("\n").length <= maxLineCount;
		};

		singleton.testInteger = function(value) {
			return parseInt(value).toString().trim() === value.trim();
		};

		singleton.testEmail = function(value) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(value);
		};

		singleton.testDecimalNumber = function(value) {
			var re = /^\-?[0-9]*\.?[0-9]+$/;
			return re.test(value);
		};

		singleton.testAlphaNumeric = function(value) {
			var re = /^[a-z0-9]+$/i;
			return re.test(value);
		};

		singleton.testAlphaNumericDash = function(value) {
			var re = /^[a-z0-9_\-]+$/i;
			return re.test(value);
		};

		singleton.testNumericDash = function(value) {
			var re = /^[\d\-\s]+$/;
			return re.test(value);
		};

		singleton.testContains = function(value, contained) {
			return value.toString().toLowerCase().indexOf(contained.toLowerCase()) > -1;
		};

		singleton.testNotContains = function(value, contained) {
			return value.toString().toLowerCase().indexOf(contained.toLowerCase()) === -1;
		};

		singleton.testDate = function(value) {
			// First check for the pattern
			if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value))
				return false;

			// Parse the date parts to integers
			var parts = value.split("/");
			var day = parseInt(parts[1], 10);
			var month = parseInt(parts[0], 10);
			var year = parseInt(parts[2], 10);

			// Check the ranges of month and year
			if(year < 1000 || year > 3000 || month == 0 || month > 12)
				return false;

			var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

			// Adjust for leap years
			if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
				monthLength[1] = 29;

			// Check the range of the day
			return day > 0 && day <= monthLength[month - 1];
		};

		singleton.testJQueryMatch = function(value, selector) {
			var jq = jQuery(selector);
			if (jq.length === 0)
				return false;
			return value === jq.val();
		};

		return singleton;
	}

	
	return {
		getInstance: function() {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		}
	};
})();
var ggValidatorTester = ggValidatorTesterSingleton.getInstance();


// Manages validation rules and provides an interface for testing.
// @param 	validatorName 			Name of the new validator instance.
var ggValidator = function(validatorName) {

	var validations = [];				// Master list of validation objects: {selector: jQuery selector/string function to provide value to test, pattern: string rules/regex object, response: failed validation response/callback function}
	var originalHighlights = {};		// Original highlights of objects that failed validation.
	var keyCount = 0;

	// Rules function map.
	var rulesFunctionMap = {
		"not": 			ggValidatorTester.testNot,
		"is": 			ggValidatorTester.testIs,
		"eq": 			ggValidatorTester.testIs,
		"equals":		ggValidatorTester.testIs,
		"gt": 			ggValidatorTester.testGreaterThan,
		"greater":		ggValidatorTester.testGreaterThan,
		"lt":			ggValidatorTester.testLessThan,
		"less":			ggValidatorTester.testLessThan,
		"ge": 			ggValidatorTester.testGreaterThanOrEquals,
		"greaterequals": ggValidatorTester.testGreaterThanOrEquals,
		"le":			ggValidatorTester.testLessThanOrEquals,
		"lessequals":	ggValidatorTester.testLessThanOrEquals,
		"minlength": 	ggValidatorTester.testMinLength,
		"minlen": 		ggValidatorTester.testMinLength,
		"maxlength": 	ggValidatorTester.testMaxLength,
		"maxlen": 		ggValidatorTester.testMaxLength,
		"empty": 		ggValidatorTester.testIsEmpty,
		"notempty": 	ggValidatorTester.testIsNotEmpty,
		"minlinecount":	ggValidatorTester.testMinLineCount,
		"minlines":		ggValidatorTester.testMinLineCount,
		"maxlinecount":	ggValidatorTester.testMaxLineCount,
		"maxlines":		ggValidatorTester.testMaxLineCount,
		"int": 			ggValidatorTester.testInteger,
		"integer":		ggValidatorTester.testInteger,
		"email": 		ggValidatorTester.testEmail,
		"dec": 			ggValidatorTester.testDecimalNumber,
		"decimal": 		ggValidatorTester.testDecimalNumber,
		"alphanum":		ggValidatorTester.testAlphaNumeric,
		"alphanumeric":	ggValidatorTester.testAlphaNumeric,
		"alphanumdash":	ggValidatorTester.testAlphaNumericDash,
		"alphanumericdash":	ggValidatorTester.testAlphaNumericDash,
		"numdash":		ggValidatorTester.testNumericDash,
		"numericdash":	ggValidatorTester.testNumericDash,
		"contains": 	ggValidatorTester.testContains,
		"has": 			ggValidatorTester.testContains,
		"notcontains": 	ggValidatorTester.testNotContains,
		"nothas":		ggValidatorTester.testNotContains,
		"date": 		ggValidatorTester.testDate,
		"jquerymatch":	ggValidatorTester.testJQueryMatch,
		"valmatch":		ggValidatorTester.testJQueryMatch,
		"jqmatch":		ggValidatorTester.testJQueryMatch,
		"match":		ggValidatorTester.testJQueryMatch
	};


	// Returns a generated key for a result object from a validation test.
	// @param 	resultObject	Result object, which will contain the jQuery object.
	var getResultKey = function(resultObject) {
		//return resultObject.jQueryObject.attr("name") + " id:" + resultObject.jQueryObject.attr("id") + " validationsIndex:" + resultObject.validationsIndex + " jQueryObjectIndex:" + resultObject.jQueryObjectIndex;
		if (typeof resultObject.jQueryTooltipTargetObject.data("ggValidatorKey") === "undefined") {
			keyCount++;
			resultObject.jQueryTooltipTargetObject.data("ggValidatorKey", keyCount.toString());
		}
		return resultObject.jQueryTooltipTargetObject.data("ggValidatorKey");
	};


	// Assigns a unique ID for a jQuery object.
	// @param 	jQueryObject	The jQuery object.
	var assignUniqueId = function(jQueryObject) {
		var idCount = 0;
		if (typeof jQueryObject.attr("id") !== "undefined")
			return;
		if (typeof jQueryObject.uniqueId === "function") {
			jQueryObject.uniqueId();
			return;
		}
		//Older version of jQuery?
		while(jQuery("#ui-id-" + idCount).length > 0)
			idCount++;
		jQueryObject.attr("id", "ui-id-" + idCount);
	};


	// Changes the highlighting of an object to invalidated highlighting.
	// @param 	resultObject	Result object, which will contain the jQuery object to change the highlighting of.
	var changeHighlight = function(resultObject) {
		assignUniqueId(resultObject.jQueryTooltipTargetObject);
		var key = getResultKey(resultObject);
		var responseMessage;
		var tooltipDialog;
		var objBottom;
		var newMarginLeft, newMarginTop;
		var isJQueryObjectHidden = resultObject.jQueryTooltipTargetObject.is(":visible") == false;

		// No tooltip dialog stored? Build a new one.
		if (typeof originalHighlights[key] === "undefined") {
			if (typeof resultObject.response === "string")
				responseMessage = resultObject.response;
			else if (typeof resultObject.response === "function")
				responseMessage = resultObject.response(resultObject);
			tooltipDialog = jQuery("<div class='invalidValueTooltip'><div class='invalidValueTooltipArrow'></div><div class='invalidValueTooltipMessage'>" + responseMessage + "</div></div>");
			assignUniqueId(resultObject.jQueryTooltipTargetObject);
			assignUniqueId(tooltipDialog);
			tooltipDialog.hide();
			tooltipDialog.on("click", function () {
				resultObject.jQueryTooltipTargetObject.focus();
			});
			tooltipDialog.hover(function () {
				setTimeout(function() {tooltipDialog.fadeOut();}, 1200);
			});
			resultObject.jQueryTooltipTargetObject.parent().append(tooltipDialog);
			resultObject.tooltipDialog = tooltipDialog;
			validations[resultObject.validationsIndex].tooltipDialogs[key] = tooltipDialog;
			originalHighlights[key] = resultObject;
		}

		// Temporarily show control to determine position.
		if (isJQueryObjectHidden) {
			resultObject.jQueryTooltipTargetObject.show();
		}
		originalHighlights[key].tooltipDialog.show();

		if (typeof resultObject.jQueryTooltipTargetObject.outerHeight() !== "number") {
			// Older version of jQuery?
			objBottom = resultObject.jQueryTooltipTargetObject.position().top + 
			            parseInt(resultObject.jQueryTooltipTargetObject.css("height")) +
		                parseInt(resultObject.jQueryTooltipTargetObject.css("margin-bottom")) +
		                parseInt(resultObject.jQueryTooltipTargetObject.css("margin-top")) +
		                parseInt(resultObject.jQueryTooltipTargetObject.css("border-bottom")) +
		                parseInt(resultObject.jQueryTooltipTargetObject.css("border-top")) +
		                parseInt(resultObject.jQueryTooltipTargetObject.css("padding-bottom")) +
		                parseInt(resultObject.jQueryTooltipTargetObject.css("padding-top"));
		} else {
			objBottom = resultObject.jQueryTooltipTargetObject.position().top + resultObject.jQueryTooltipTargetObject.outerHeight();
		}
		newMarginTop = objBottom - originalHighlights[key].tooltipDialog.position().top;
		newMarginLeft = resultObject.jQueryTooltipTargetObject.position().left - originalHighlights[key].tooltipDialog.position().left;
		validations[resultObject.validationsIndex].tooltipDialogs[key].css({marginTop:	newMarginTop + "px",
		                                                                    marginLeft:	newMarginLeft + "px"});
		// validations[resultObject.validationsIndex].tooltipDialogs[key].css({top:		newTop + "px",
		//                                                                     left:		resultObject.jQueryTooltipTargetObject.position().left + "px",
		//                                                                     marginTop:	resultObject.jQueryTooltipTargetObject.css("margin-top"),
		//                                                                     marginLeft:	resultObject.jQueryTooltipTargetObject.css("margin-left")});

		// Hide temporarily visible control.
		if (isJQueryObjectHidden) {
			resultObject.jQueryTooltipTargetObject.hide();
		}
		originalHighlights[key].tooltipDialog.hide();

		originalHighlights[key].tooltipDialog.fadeIn("fast");
		resultObject.jQueryTooltipTargetObject.addClass(resultObject.invalidClass);
	};


	// Called whenever an object that was invalidated gains focus, clearing the tooltips.
	// @param 	resultObject	Result object, which will contain the jQuery object to change the highlighting of.
	var highlightFocus = function (resultObject) {
		var key = getResultKey(resultObject);
		var tooltipDialog;
		if (typeof originalHighlights[key] === "undefined") {
			return;
		}
		tooltipDialog = originalHighlights[key].tooltipDialog;
		resultObject.jQueryTooltipTargetObject.removeClass(resultObject.invalidClass);
		delete originalHighlights[key];
		tooltipDialog.fadeOut("fast");
		setTimeout(function() {tooltipDialog.remove();}, 2000);
	};


	// Default function called whenever an object fails validation. This can be changed per validation object by changing the .failedCallback property.
	// @param 	resultObject	Result object.
	var validationFailed = function (resultObject) {
		var key;
		if (resultObject.jQueryTooltipTargetObject !== null) {
			key = getResultKey(resultObject);
			if (typeof originalHighlights[key] !== "undefined")
				return;
			changeHighlight(resultObject);
			resultObject.jQueryTooltipTargetObject.bind("change paste keyup focus propertychange input click",
				(function(r) {return function(){highlightFocus(r);}}) (resultObject)
			);
		}
	};


	// Accepts a comma-delimited string of validation rules and returns an equivalent list of objects.
	// Each element within the returned list will either be an object with the properties .rule and .criteria,
	// or will be another list with .rule/.criteria objects to be evaluated with an OR clause.
	// @param	rulesString		String of validation rules, comma-delimited.
	// @return 					List of objects: [[{rule: type of rule, criteria: rule criteria}, ...], [{rule: type of rule, criteria: rule criteria}], ... ]
	var getRulesList = function(rulesString) {
		var rulesListRaw = rulesString.split(",");
		var rtn = [];
		for (var i = 0; i < rulesListRaw.length; i++) {
			var subRulesList = [];
			var allSubRules = rulesListRaw[i].split("||");
			for (var j = 0; j < allSubRules.length; j++) {
				var ruleSplit = allSubRules[j].split("=");
				var ruleName = ruleSplit[0].toLowerCase().trim();
				var ruleCriteria = "";
				if (ruleSplit.length > 1) {
					ruleCriteria = ruleSplit[1].trim();
				}
				subRulesList.push({rule: ruleName, criteria: ruleCriteria});
			}
			rtn.push(subRulesList);
		}
		return rtn;
	};


	// Tests a value against specific rule(s).
	// @param 	value 			Value to test.
	// @param 	rule 			Rules to test against.
	// @return 					Object: {passed: did value pass rule?, reason: list that may contain reason(s) for validation failure (for multiple rules within a string)}
	var testValue = function(value, rule) {
		var failedReasons = [];
		var rtn;
		if(typeof(rule) === "string") {
			var rulesList = getRulesList(rule);
			rtn = true;
			for (var i = 0; i < rulesList.length; i++) {
				var ruleFunctionResults = false;
				for (var j = 0; j < rulesList[i].length; j++) {
					var currentRule = rulesList[i][j];
					var ruleFunction = rulesFunctionMap[currentRule.rule];
					if (typeof(ruleFunction) !== "undefined") {
						if (ruleFunction.length === 0) {
							ruleFunctionResults = ruleFunction() || ruleFunctionResults;
						} else if (ruleFunction.length === 1) {
							ruleFunctionResults = ruleFunction(value) || ruleFunctionResults;
						} else if (ruleFunction.length === 2) {
							ruleFunctionResults = ruleFunction(value, currentRule.criteria) || ruleFunctionResults;
						} else {
							console.log("rule function contains an unexpected number of parameters");
							ruleFunctionResults = true;
						}
						if (ruleFunctionResults === false) {
							failedReasons.push(currentRule.rule);
						}
					} else {
						console.log("unknown rule: " + currentRule.rule);
					}					
				}
				rtn = rtn && ruleFunctionResults;
			}
			return {passed: rtn, failedReasons: failedReasons};
		} else if (typeof(rule) === "object" && typeof(rule.test) === "function" && rule.test.length === 1) {
			//Regular expression (or something else that has the test() function).
			return {passed: t.test(value), failedReasons: failedReasons};
		} else if (typeof(rule) === "function") {
			//Function. It must either accept 0 or 1 arguments, and must return a boolean value.
			if (rule.length === 0) {
				rtn = rule();
			} else if (rule.length === 1) {
				rtn = rule(value);
			} else {
				console.log("custom validation function contains an unexpected number of parameters");
				rtn = true;
			}
			if (rtn !== true && rtn !== false) {
				console.log("custom validation function returned a non-boolean value");
				rtn = true;
			}
			return {passed: rtn, failedReasons: failedReasons};
		} else {
			// Other object. Test for strict equality.
			return {passed: value === rule, failedReasons: failedReasons};
		}
	};


	// Registers a new rule along with a callback.
	// @param 	ruleName		Name to assign the rule callback.
	// @param 	ruleCallback 	Rule callback function.
	this.addRuleCallback = function(ruleName, ruleCallback) {
		if (typeof ruleName !== "string")
			throw new Error("ruleName needs to be a string");
		if (typeof ruleCallback !== "function")
			throw new Error("ruleCallback needs to be a function");
		if (typeof rulesFunctionMap[ruleName] !== "undefined")
			throw new Error("'" + ruleName + "' rule callback already exists");
		rulesFunctionMap[ruleName] = ruleCallback;
	};


	// Returns a rule callback. Undefined if not found.
	// @param 	ruleName 		Name of rule.
	// @return 					Rule callback function. Undefined if not found.
	this.getRuleCallback = function(ruleName) {
		return rulesFunctionMap[ruleName];
	};


	// Adds a validation ruleset.
	// @param	selector 		Can either be a jQuery selector or a function that returns a value.
	// @param	pattern 		Pattern to test for. This can be a string of comma-delimited rules, a regular expression, or a function returning a boolean.
	// @param	response 		Response to use upon validation failure.
	// @param 	failedCallback	Optional. Callback function to use upon validation failure.
	// @param	invalidClass	Optional. The class to apply to any elements that have been determined as invalid. Default: invalidValue
	// @return 					Returns the new validation rule object: {selector: jQuery selector/string function, pattern: string for rules/regex object, response: string/callback function, ignoreInvisible: will always pass validation if invisible element (jQuery selectors only), invalidClass: class to apply to elements that don't have valid values}
	this.addRuleset = function(selector, pattern, response, failedCallback, invalidClass) {
		failedCallback = failedCallback || validationFailed;
		invalidClass = invalidClass || "invalidValue";
		if (typeof invalidClass !== "string")
			throw new Error("invalidClass needs to be a string");
		if (typeof failedCallback !== "function")
			throw new Error("failedCallback needs to be a function");

		// New ruleset object.
		var rtn = {};

		// Private members.
		var failedCallbacks = [];
		var successCallbacks = [];
		var rtnSelector = selector;
		var rtnTooltipSelector = selector;
		var rtnPattern = pattern;
		var rtnResponse = response;
		var rtnIgnoreInvisible = true;
		var rtnInvalidClass = invalidClass;

		// Object properties.
		rtn.tooltipDialogs = {};
		try {
			Object.defineProperty(rtn, "selector", {
				get: function() {return rtnSelector;}
			});
			Object.defineProperty(rtn, "tooltipSelector", {
				get: function() {return rtnTooltipSelector;}
			});
			Object.defineProperty(rtn, "pattern", {
				get: function() {return rtnPattern;}
			});
			Object.defineProperty(rtn, "response", {
				get: function() {return rtnResponse;}
			});
			Object.defineProperty(rtn, "invalidClass", {
				get: function() {return rtnInvalidClass;},
				set: function(newValue) {rtnInvalidClass = newValue;}
			});
			Object.defineProperty(rtn, "ignoreInvisible", {
				get: function() {return rtnIgnoreInvisible;},
				set: function(newValue) {rtnIgnoreInvisible = newValue == true;}
			});
		} catch(e) {
			//IE8 support.
			rtn.selector = rtnSelector;
			rtn.tooltipSelector = rtnSelector;
			rtn.pattern = rtnPattern;
			rtn.response = rtnResponse;
			rtn.invalidClass = rtnInvalidClass;
			rtn.ignoreInvisible = rtnIgnoreInvisible;
		}

		// Public methods.
		rtn.addFailedCallback = function(f) {
			failedCallbacks.push(f);
			return rtn;
		};

		rtn.addSuccessCallback = function(f) {
			successCallbacks.push(f);
			return rtn;
		};

		rtn.removeFailedCallback = function(f) {
			var index = failedCallbacks.indexOf(f);
			if (index > -1)
				failedCallbacks.splice(index, 1);
			return rtn;
		};

		rtn.removeSuccessCallback = function(f) {
			var index = successCallback.indexOf(f);
			if (index > -1)
				successCallback.splice(index, 1);
			return rtn;
		}

		rtn.triggerFailedCallbacks = function(resultObject) {
			for (var i = 0; i < failedCallbacks.length; i++)
				failedCallbacks[i](resultObject);
			return rtn;
		}

		rtn.triggerSuccessCallbacks = function(resultObject) {
			for (var i = 0; i < successCallbacks.length; i++)
				successCallbacks[i](resultObject);
			return rtn;
		}

		rtn.toggleIgnoreInvisible = function (toggleValue) {
			rtn.ignoreInvisible = toggleValue;
			return rtn;
		}

		rtn.setTooltipSelector = function (targetSelector) {
			rtnTooltipSelector = targetSelector;
			return rtn;
		};

		rtn.addFailedCallback(failedCallback);

		//var newRule = {selector: selector, pattern: pattern, response: response, ignoreInvisible: true, invalidClass: invalidClass, failedCallback: failedCallback, tooltipDialogs: {}};
		validations.push(rtn);
		return rtn;
	};


	// Introduces a validation check by unbinding current click events, storing those events, and binding a new
	// click event that will trigger a validation check and the other unbinded click handlers.
	// @param 	jQuerySelector	jQuery selector to use when (un)binding click handlers. Will only use the first element found.
	// @param 	successCallback	Function called if validation is successful.
	// @param 	failedCallback	Function called when validation fails.
	this.addClickValidation = function (jQuerySelector, successCallback, failedCallback) {

		// Cushion the unbinding/binding with waiting for the document to load and calling
		// as a delayed timeout function to help with executing the unbinding/binding last.
		jQuery(document).ready(function() {
			setTimeout( function() {

				// Grab cart click handlers and unbind them, and add validation handler.
				// This will prevent a form submission that doesn't pass our validation first.
				var newHandlers = Array();
				var newOnClick = "";
				var newDisabled;
				var triggering = false;
				var elementEvents = jQuery._data(jQuery(jQuerySelector)[0], "events");
				var previousClickHandlers = [];
				if (typeof elementEvents !== "undefined" && elementEvents['click'] !== "undefined") {
					previousClickHandlers = elementEvents['click'];
				}

				for (var i = 0; i < previousClickHandlers.length; i++)
					newHandlers[i] = previousClickHandlers[i];
				if (typeof jQuery(jQuerySelector).attr("onclick") !== "undefined") {
					newOnClick = jQuery(jQuerySelector).attr("onclick");
					jQuery(jQuerySelector).attr("onclick", "");
				}
				if (typeof jQuery(jQuerySelector).attr("disabled") !== "undefined") {
					newOnClick = jQuery(jQuerySelector).attr("disabled");
					jQuery(jQuerySelector).removeAttr("disabled");
				}
				jQuery(jQuerySelector).unbind("click");

				jQuery(jQuerySelector).click( function(event) {

					if (triggering)
						return;

					if (ggValidator.validators[validatorName].validate()) {
						
						// Fields are valid. Trigger callback/normal handlers.
						if (typeof successCallback === "function")
							successCallback();
						for (var i = 0; i < newHandlers.length; i++)
							jQuery(jQuerySelector).click(newHandlers[i]);
						jQuery(jQuerySelector).attr("onclick", newOnClick);
						if (typeof newDisabled !== "undefined") {
							jQuery(jQuerySelector).attr("disabled", newDisabled);
						}

						triggering = true;
						jQuery(jQuerySelector).trigger("click");
						triggering = false;

					} else {

						// Fields are invalid. Prevent further click triggers.
						if (typeof failedCallback === "function")
							failedCallback();

						event.preventDefault();
						event.stopPropagation();

					}

				});
			}, 1);
		});
	};


	// Tests validation rules.
	// @return					Returns two lists of validation objects that passed/failed validation: Each list's elements = {selector: jQuery selector/string function, pattern: string for rules/regex object, response: string/callback function, jQueryObject: jQuery object (if jQuery selector was used), failedReason: list that may contain reason(s) for validation failure (for multiple rules within a string)}
	this.test = function() {
		var rtn = [];
		var rtnPassed = [];
		var testResults;
		var tooltipTarget;
		for (var i = 0; i < validations.length; i++) {
			var validation = validations[i];

			//Are we dealing with a jQuery selector/object or a string function?
			if(typeof(validation.selector) === "string" || (typeof(validation.selector) === "object" && typeof(validation.selector.jquery) === "string")) {
				var jqObjects = jQuery(validation.selector);
				var jqTooltipTargets = jQuery(validation.tooltipSelector);
				for (var j = 0; j < jqObjects.length; j++) {

					// Evaluate whether this control passes validation or not.
					testResults = testValue(jqObjects.eq(j).val(), validation.pattern);

					// Determine where to show tooltip.
					// Either following alongside the index count for test value selector, or use the
					// highest index available for the tooltip target selector.
					if (jqTooltipTargets.length > j) {
						tooltipTarget = jqTooltipTargets.eq(j);
					} else {
						tooltipTarget = jqTooltipTargets.eq(jqTooltipTargets.length - 1);
					}

					if (jqObjects.eq(j).is(":visible") === true || validation.ignoreInvisible !== true) {
						if (testResults.passed === false) {
							rtn.push(jQuery.extend(true, {jQueryObject: jQuery(jqObjects.eq(j)),
								                    jQueryTooltipTargetObject: tooltipTarget,
								                    failedReasons: testResults.failedReasons,
								                    validationsIndex: i,
								                    jQueryObjectIndex: j,
								                    selector: validation.selector,
								                    pattern: validation.pattern,
								                    response: validation.response,
								                    invalidClass: validation.invalidClass,
								                    ignoreInvisible: validation.ignoreInvisible},
								                   validation));
						} else {
							rtnPassed.push(jQuery.extend(true, {jQueryObject: jQuery(jqObjects.eq(j)),
								                    jQueryTooltipTargetObject: tooltipTarget,
								                    failedReasons: false,
								                    validationsIndex: i,
								                    jQueryObjectIndex: j,
								                    selector: validation.selector,
								                    pattern: validation.pattern,
								                    response: validation.response,
								                    invalidClass: validation.invalidClass,
								                    ignoreInvisible: validation.ignoreInvisible},
								                   validation));
						}
					}
					
				}
			} else if(typeof(validation.selector) === "function") {
				testResults = testValue(validation.selector().toString(), validation.pattern);
				if (testResults.passed === false) {								
					rtn.push(jQuery.extend(true, {jQueryObject: null,
					                        jQueryTooltipTargetObject: null,
						                    failedReasons: testResults.failedReasons,
						                    validationsIndex: i,
						                    jQueryObjectIndex: -1},
						                   validation));
				} else {
					rtnPassed.push(jQuery.extend(true, {jQueryObject: null,
					                        jQueryTooltipTargetObject: null,
						                    failedReasons: false,
						                    validationsIndex: i,
						                    jQueryObjectIndex: -1},
						                   validation));
				}
			}
		}
		return {failed: rtn, passed: rtnPassed};
	};


	// Tests validation rules and executes failed-validation callbacks.
	// @return 				True if validation passes.
	this.validate = function() {
		var result;
		var topmostElement;
		var testResults = this.test();
		var testResultsFailed = testResults.failed;
		var testResultsPassed = testResults.passed;
		this.clearTooltips();
		for (var i = 0; i < testResultsPassed.length; i++) {
			result = testResultsPassed[i];
			result.triggerSuccessCallbacks(result);
		}
		for (var i = 0; i < testResultsFailed.length; i++) {
			result = testResultsFailed[i];
			result.triggerFailedCallbacks(result);
			if (result.jQueryObject !== null) {
				if (topmostElement === undefined) {
					topmostElement = result.jQueryObject.offset().top;
				}
				if (topmostElement > result.jQueryObject.offset().top) {
					topmostElement = result.jQueryObject.offset().top;
				}
			}
		}
		if (topmostElement !== undefined) {
			jQuery("html, body").animate({scrollTop: topmostElement}, 1000);
		}
		return testResultsFailed.length === 0;
	}


	// Hides any showing validation tooltip dialog boxes.
	this.clearTooltips = function () {
		for (var key in originalHighlights) {
			highlightFocus(originalHighlights[key]);
		}
	}


	// Clears the tooltip on a given jQuery object.
	// @param 	jQueryObject 		Object to clear tooltip from.
	this.clearTooltip = function(jQueryObject) {
		jQueryObject = jQuery(jQueryObject);
		for (var key in originalHighlights) {
			var testObj1 = jQueryObject[0] || jQueryObject["context"];
			var testObj2 = originalHighlights[key].tooltipDialog.prev()[0] || originalHighlights[key].tooltipDialog.prev()["context"];
			if(testObj1 === testObj2) {
				highlightFocus(originalHighlights[key]);
			}
		}
	}


	// Static variable.
	// Holds a list of ggValidator objects.
	if (ggValidator.validators === undefined) {
		ggValidator.validators = {};
	}

	if (ggValidator.validators[validatorName] === undefined) {
		ggValidator.validators[validatorName] = this;
	} else {
		throw new Error("ggValidator with key " + validatorName + " already exists");
	}


};
