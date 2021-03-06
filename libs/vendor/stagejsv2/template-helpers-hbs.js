/**
 * Common template helpers for Handlebars.
 *
 * Helpers
 * -------
 * 1. xif - {{#xif "..."}} ... {{else}} ... {{/xif}}
 * 2. x - {{#x "..."}}
 *
 * Gotcha
 * ------
 * 1. "..." in helper x has NO upper level context access, and need this.<var> to access variables.
 *
 * Reference
 * ---------
 * stackoverflow - http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
 *
 * @author Tim Lauv
 * @created 2015.06.12
 */

(function(Handlebars){

	//-------------------------If with "js expressions"-------------------------------
	Handlebars.registerHelper("xif", function(expression, options) {
	    return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
	});

	//-----------------------Result from "js expressions"-----------------------------
	//Limitations: no upper level context access.
	Handlebars.registerHelper("x", function(expression, options) {
	    var fn = function() {},
	        result;

	    // in a try block in case the expression have invalid javascript
	    try {
	        // create a new function using Function.apply, notice the capital F in Function
	        fn = Function.apply(
	            this, [
	                'window', // or add more '_this, window, a, b' you can add more params if you have references for them when you call fn(window, a, b, c);
	                'return ' + expression + ';' // edit that if you know what you're doing
	            ]
	        );
	    } catch (e) {
	        console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
	    }

	    // then let's execute this new function, and pass it window, like we promised
	    // so you can actually use window in your expression
	    // i.e expression ==> 'window.config.userLimit + 10 - 5 + 2 - user.count' //
	    // or whatever
	    try {
	        // if you have created the function with more params
	        // that would like fn(window, a, b, c)
	        result = fn.call(this, window);
	    } catch (e) {
	        console.warn('[warning] {{x ' + expression + '}} runtime error', e);
	    }
	    // return the output of that result, or undefined if some error occured
	    return result;
	});

})(Handlebars);