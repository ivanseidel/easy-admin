/**
    This class provides a helper to create an CRUD REST API
    for a given Model. The url methods is as follows:

    # Backbone Conventions
    GET   :    /                => findAll()
    GET   :    /read/:id        => find(id)
    POST  :    /create          => create()
    POST  :    /create/:id      => create(id)
    PUT   :    /update/:id      => update(id)
    DELETE:    /destroy/:id     => destroy(id)

    # You can also explicitly state the action
    GET   :    /find            => findAll()
    GET   :    /find/:id        => find(id)
    POST  :    /create          => create(id)
 */

/**
 * Module dependencies.
 */
 var _ = require('lodash');

 /**
 * Expose 'REST' helper
 */
module.exports = REST;

function REST(options){

	var self = this;

	self._defaults = {
		basePath: '/',
		model: false,
		app: false,
	};

	// Setup default options
	for(k in self._defaults)
		self[k] = self._defaults[k];

	// Set options
	for(k in options)
		self[k] = options[k];

	self.find = function(req, res, next){
		console.log('FUCK: find');

		// Locate and validate id parameter
		var id = req.param('id');
		// if (!id) {
			// Id was invalid-- and probably unintentional.
			// return next();
		// }

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = self.model;
		if (!Model) {
			return next();
		}

		
		/**
		 * If a valid id was specified, find that model in particular
		 *
		 */

		if (id) {
			
			Model.findOne(id).done(function(err, model) {

				// An error occurred
				if(err) return next(err);

				// Model not found
				if(!model) return next();

				// If the model is silent, don't use the built-in pubsub
				// (also ignore pubsub logic if the hook is not enabled)
				// if (sails.config.hooks.pubsub && !Model.silent) {

					// Subscribe to the models that were returned
					// Model.subscribe(req.socket, model);
				// }

				// Otherwise serve a JSON API
				return res.json(model.toJSON());
			});
		}


		/**
		 * If no id was specified, find models using the criteria passed in as params
		 *
		 */

		else {

			var where = req.param('where');

			// If WHERE is a string, try to interpret it as JSON
			if (_.isString(where)) {
				where = tryToParseJSON(where);
			}

			// If WHERE has not been specified, but other params ARE specified build the WHERE option using them
			var params;
			if (!where) {
				params = _.extend(req.query || {}, req.params || {}, req.body || {});

				// Remove undefined params
				// (as well as limit, skip, and sort)
				// to build a proper where query
				params = objReject(params, function (param, key) {
					return _.isUndefined(param) ||
						key === 'limit' || key === 'skip' || key === 'sort';
				});

				where = params;
			}

			// Build options object
			var options = {
				limit: req.param('limit') || undefined,
				skip: req.param('skip') || req.param('offset') || undefined,
				sort: req.param('sort') || req.param('order') || undefined,
				where: where || undefined
			};

			// Respond to queries
			var finding = Model.find(options);

			finding.done(function afterFound(err, models) {
				console.log('finding DONE');
				// An error occurred
				if(err) return next(err);

				// No models found
				if(!models) return next();

				// If the model is silent, don't use the built-in pubsub
				// if (sails.config.hooks.pubsub && !Model.silent) {

					// Subscribe to the collection itself
					// (listen for `create`s)
					// Model.subscribe(req.socket);

					// Subscribe to the models that were returned
					// (listen for `updates` and `destroy`s)
					// Model.subscribe(req.socket, models);
				// }

				// Build set of model values
				var modelValues = [];

				models.forEach(function(model) {
					modelValues.push(model.toJSON());
				});

				// Otherwise serve a JSON API
				return res.json(modelValues);
			});
		}


		// Attempt to parse JSON
		// If the parse fails, return the error object
		// If JSON is falsey, return null
		// (this is so that it will be ignored if not specified)
		function tryToParseJSON (json) {
			if (!_.isString(json)) return null;
			try {
				return JSON.parse(json);
			}
			catch (e) {
				return e;
			}
		}
	}

	self.create = function(req, res, next){
		console.log('FUCK: create');

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = self.model;
		if (!Model) {
			return next();
		}

		// Create monolithic parameter object
		var params = _.extend(req.query || {}, req.params || {}, req.body || {});


		Model.create(params, function(err, model) {
			if (err) return next(err);

			// Otherwise return JSON
			return res.json(model.toJSON());
		});
	}

	self.update = function(req, res, next){
		console.log('FUCK: update');

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = self.model;
		if (!Model) {
			return next();
		}

		
		// Locate and validate id parameter
		var id = req.param('id');
		if (!id) {
			return next('400 Bad Request: No id provided.');
		}


		// Create monolithic parameter object
		var params = _.extend(req.query || {}, req.params || {}, req.body || {});
		var clonedParams = _.clone(params);


		// Otherwise find and update the models in question
		Model.update(id, clonedParams, function(err, models) {
			if(err) return next(err);
			if(!models || models.length === 0) return next();

			// Because this should only update a single record and update
			// returns an array, just use the first item
			var model = models[0];

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			// if (sails.hooks.pubsub && !Model.silent) {
				// Model.publishUpdate(model.id, model.toJSON(), req.socket);
			// }

			return res.json(model.toJSON());
		});
	}

	self.destroy = function(req, res, next){
		console.log('FUCK: destroy');

		// Locate and validate id parameter
		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = self.model;
		if (!Model) {
			return next();
		}
		
		var id = req.param('id');
		if (!id) {
			return next('400 Bad Request: No id provided.');
		}


		// Create monolithic parameter object
		var params = _.extend(req.query || {}, req.params || {}, req.body || {});

		if (!id) {
			return next('400 Bad Request: No id provided.');
		}

		// Otherwise, find and destroy the model in question
		Model.findOne(id).done(function(err, result) {
			if(err) return next(err);
			if(!result) return next();

			Model.destroy(id, function(err) {
				if(err) return next(err);

				// If the model is silent, don't use the built-in pubsub
				// (also ignore pubsub logic if the hook is not enabled)
				// if (sails.hooks.pubsub && !Model.silent) {
					// Model.publishDestroy(result.id, req.socket);
				// }

				// Respond with model which was destroyed
				return res.json(result);
			});
		});
	}

	// Setup callbacks
	self.app.route([
		{method: 'get',    	path: [ self.basePath + '/:id?',
							self.basePath + '/find/:id?'],			callback: self.find},

		{method: 'post',   	path: [ self.basePath + '',
							self.basePath + '/create'],				callback: self.create},

		{method: 'put',    	path: [ self.basePath + '/update/:id?',
							self.basePath + '/:id?'],				callback: self.update},

		{method: 'delete', 	path: [ self.basePath + '/destroy/:id?',
							self.basePath + '/:id?'], 				callback: self.destroy},
		{method: 'get', 	path: self.basePath + '/destroy/:id?', 	callback: self.destroy},
	]);

};

// ### _.objReject
//
// _.reject for objects, keeps key/value associations
// but does not include the properties that pass test().
function objReject(input, test, context) {
	return _.reduce(input, function(obj, v, k) {
		if(!test.call(context, v, k, input)) {
			obj[k] = v;
		}
		return obj;
	}, {}, context);
};


