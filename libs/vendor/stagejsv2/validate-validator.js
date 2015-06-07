/**
 * Pre-made data validators, useful for forms. (through validator-js)
 *
 * @author Tim Lauv
 * @created 2015.06.06
 */

(function(_, app, validator){

	//validators
	app.validate = _.pick(validator, [
		'matches',
		'isLength', 'isByteLength',
		'isDate', 'isAfter', 'isBefore',
		'isCreditCard', 'isCurrency',
		'isAlpha', 'isAlphanumeric', 'isNumeric', 'isAscii', 'isLowercase', 'isUppercase',
		'isBoolean', 
		'isFloat', 'isInt', 'isHexadecimal', 'isDivisibleBy',
		'isHexColor',
		'isMongoId', 'isUUID',
		'isEmail', 'isMobilePhone',
		'isFQDN', 'isIP', 'isURL',
		'isISBN', 'isISIN',
		'isFullWidth', 'isHalfWidth', 'isVariableWidth', 'isMultibyte', 'isSurrogatePair', 'isIn',
		'isJSON', 'isBase64',
		'isNull'
	], validator);

	//sanitizors
	app.sanitize = _.pick(validator, [
		'blacklist', 'whitelist',
		'escape',
		'normalizeEmail',
		'stripLow',
		'toBoolean', 'toDate', 'toFloat', 'toInt', 'toString'
		//'xss'? see https://github.com/yahoo/xss-filters used in template helpers (handlebar)
	], validator);

	//extension point
	_.extend(app.validate, {
		add: function(name, fn){
			app.validate[name] = fn;
		}
	});
	_.extend(app.sanitize, {
		add: function(name, fn){
			app.sanitize[name] = fn;
		}
	});
})(_, Application, validator);