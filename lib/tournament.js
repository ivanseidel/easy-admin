/**
 * Module dependencies.
 */
var _ = require('lodash');
var ejs = require('ejs');
var fs = require('fs');

/**
 * Expose 'Tournament' constructor
 */
module.exports = Tournament;


/**
 * Tournament class constructor
 */
function Tournament(options){

	// Global access to self class
	var self = this;
	
	// Data about this Object
	this.name = 'Tournament Manager';
	this.desc = 'Manages tournament';	

	// Load options
	var opt = options || {
		// Template page used by Express
		template: 'index'
	};

	// Save options
	this.opt = opt;

	// Express app instance
	this.app = null;

	// Cached menuItems
	this.menus = [
	];

	// Private menus, that will appear on the right side
	this.menusPrivate = [
		{name: 'Configurations', path: '/configure', icon: 'cog'},
	];

	// Modules installed
	this.modules = [];

	/**
	 * Initialize tournament on the given Express app
	 */
	this.initialize = function(app){
		self.app = app;

		// Setup Express


		// Initialize Modules
		for(var i in self.modules){
			var module = self.modules[i];
			
			// Initialize module
			module.initialize(self);

			// Log message
			console.log(('Initialized '+module.opt.name).green);
		}

		// Route itself, so that we can have the index file
		self.route(self.routes);

		console.log('Menus: '.magenta + JSON.stringify(self.menus, null, 2).magenta);
	};

	/**
	 * Install a module inside this controller
	 */
	this.addModule = function(module)
	{
		self.modules.push(module);
	};

	/*
	 * Route the given object to current Express app
	 */
	this.route = function(routes){
		// Check if valid
		if( !(routes && _.isArray(routes)) )
			return;

		for(var i in routes){
			var route = routes[i];

			if(_.isArray(route.path)){
				for(var subRoute in route.path){
					self.app.get(route.path[subRoute], route.callback);
				}
			}else{
				self.app.get(route.path, route.callback);
			}

		}
	}

	/**
	 * Add's menu items
	 * (This will be called from install methods)
	 *
	 * Pattern: [{name:'name', path:'path', childs:[{...},{...}]];
	 *
	 */
	this.addMenus = function(menus){
		// Filter menus
		if(!_.isArray(menus))
			return;

		// Adds all menus to current menus
		for(var index in menus){
			self.menus.push(menus[index]);
		}
	};

	/*************************************************
	 				Template Methods
	 *************************************************/

	this.renderWithView = function(res, pathToView, data){

		// Render sub-view html
		content = ejs.render(self.readFile(pathToView), data);

		// Render template with the given generated content 
		self.renderWithContent(res, content, data);

	};

	this.renderWithContent = function(res, content, data){
		// Filter data
		data = data || {};

		// Filter content
		content = content || '';

		// Default data
		renderData = {
			// Private
			_content: content,
			_projectName: self.name,
			_projectPath: '/',
			_menus: self.menus,
			_menusPrivate: self.menusPrivate,

			// Public
			pathname: (res.req ? res.req.route.path : ''),
			sideMenu: false,
			title: self.name,
		};

		// Merge objects (data overrides renderData)
		for (var key in data)
			renderData[key] = data[key];

		// Render a templated html with the content as the main body
		res.render('layout', renderData);

	};



	/*************************************************
	 				File Caching
	 *************************************************/
	this.cachedFiles = {};

	this.readFile = function(path){
		// if(!self.cachedFiles[path])
			self.cachedFiles[path] = fs.readFileSync(path, 'utf8');

		return self.cachedFiles[path];
	}

	this.clearCache = function(){
		self.cachedFiles = {};
	}

	/*************************************************
	 				Index View
	 *************************************************/

	this.index = function(req, res){
		self.renderWithContent(res, 'Welcome to Tournament Manager!', {});
	};

	this.configure = function(req, res){
		self.renderWithContent(res, 'Configurations', {});
	};

	this.routes = [
		{path: '/', callback: self.index},
		{path: '/configure', callback: self.configure},
	];
}