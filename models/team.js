/**
 * Module dependencies.
 */
var Waterline = require('waterline');

/**
 * Expose 'Team' constructor
 */
module.exports = Waterline.Collection.extend({

	attributes: {
		name: 'string',
		category: 'string',

		country: 'string',
		state: 'string',
		city: 'string',

		active: 'boolean',
	}

});