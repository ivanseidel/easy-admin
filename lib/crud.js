/**
 * Module dependencies.
 */
var _ = require('lodash');
// var Team = require('./team');

/**
 * Expose 'ModelViewController' constructor
 */
module.exports = ModelViewController;


/**
 * ModelViewController Module constructor
 */
function ModelViewController(options){

	// Global access to self class
	var self = this;

	
	// Data about this Object
	this.name = 'Model View Controller';
	this.desc = 'Manages a model';
	this.version = '1.0.0';

	// CMS app instance
	this.cms = null;

	// Name of model
	this.modelName = 'Model';
	this.modelNamePlural = 'Models';

	// Model
	this.model = new function(){

		this.attributes = {
			id: 'int',
			name: {type: 'int'}
		}

		this.find = function(cb){
			cb(false, [{id: 1, name: 'a'}, {id: 2, name: '123'}]);
		};
		this.saveOne = function(data, cb){cb(false, false);};
		this.destroy = function(data, cb){cb(false, false);};
		this.updateOne =  function(data, cb){cb(false, false);};

		this.count = function(cb){
			this.find(function(err, data){
				cb(false, data.length);
			});
		};
	}

	this.listAttributes = [
		'id', 'name'
	];

	// Routes
	this.routes = [];

	// Save options
	for(var k in options)
		this[k] = options[k];

	/**
	 * Initialize module with the given TournamentController
	 */
	this.initialize = function(cms){
		self.cms = cms;

		// Configure plural name
		if(self.modelName != 'Model' && self.modelNamePlural == 'Models')
			self.modelNamePlural = self.modelName+'s';


		var rootUrl = '/'+self.modelNamePlural.toLowerCase();

		// View route
		this.routes.push({
			path: [rootUrl, rootUrl+':format?'],
			callback: self.view,
			method: 'get'
		});

		// Create route
		// this.routes.push({
		// 	path: rootUrl+'/create',
		// 	callback: self.saveOne,
		// 	method: 'post'
		// });

		// // Delete route
		this.routes.push({
			path: rootUrl+'/delete/:id',
			callback: self.deleteOne,
			method: 'del'
		});

		// // Update route
		// this.routes.push({
		// 	path: rootUrl+'/update/:id',
		// 	callback: self.updateOne,
		// 	method: 'put'
		// });

		self.menuItems.push(
			{name: self.modelNamePlural, path: rootUrl, badge: '-'});

		self.cms.route(self.routes);
		self.cms.addMenus(self.menuItems);

		// Refresh count
		self._refreshCount();
	};

	/*************************************************
	 				Teams Views
	 *************************************************/

	this._refreshCount = function(){
		self.model.count(function(err, count){
			self.menuItems[0].badge = count;
		});
	}

	// Cached menuItems
	this.menuItems = [];

	// this.viewMenu = {
	// 	name: 'List Teams',
	// 	path: '/teams',
	// 	badge: '-',
	// 	icon: 'list'
	// }

	// this.createMenu  = {
	// 	name: 'Create Team',
	// 	path: '/teams/create',
	// 	icon: 'plus'
	// }

	// this.sideMenu = [
	// 	this.viewMenu,
	// 	this.createMenu,
	// ];

	this.view = function(req, res){

		var data = {
			title: 'List '+self.modelNamePlural,
			modelName: self.modelName,
			modelNamePlural: self.modelNamePlural,
			// sideMenu: self.sideMenu,

			model: self.model,

			listAttributes: self.listAttributes,

			listItems: []
		};

		self.model.find(onData);

		function onData(err, modelData){
			data.listItems = modelData;

			var format = req.param('format');

			if( req.xhr || format == '.json' ){
				res.send(modelData);
				return;
			}else if(!format){
				finishRender();
			}else{
				res.send(406, 'Sorry! We cannot accept that file format: "'+format+'"');
			}
		}

		function finishRender(){



			self.cms.renderWithView(res, __dirname+'/../views/crud.ejs', data);
		}
	}

	/*this.create = function(req, res){
		var data = {
			title: 'Create Team',
			sideMenu: self.sideMenu,

			teams: null,
			teamModel: [
				'name', 'id', 'country', 'state'
			]
		};

		self.cms.renderWithView(res, __dirname+'/list_teams.ejs', data);
	}

	this.edit = function(req, res){
		var data = {
			title: 'Edit Team',
			sideMenu: self.sideMenu,

			teams: null,
			teamModel: [
				'name', 'id', 'country', 'state'
			]
		};

		self.cms.renderWithView(res, __dirname+'/list_teams.ejs', data);
	}*/

	this.deleteOne = function(req, res){

		self.model.destroy({id: req.param('id')}, function(err){

			if(err) return res.json({ err: err }, 500);
		    res.json({ status: 'ok' });

			// self.cms.redirect(res, '/teams');
			self._refreshCount();
		});

	}



}