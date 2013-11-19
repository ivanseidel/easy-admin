/**
 * Module dependencies.
 */
var _ = require('lodash');
var ejs = require('ejs');
var express = require('express');
var fs = require('fs');
var path = require('path');

/**
 * Expose 'CMS' constructor
 */
module.exports = Tournament;


/**
 * CMS class constructor
 */
function Tournament(options){

	// Global access to self class
	var self = this;
	
	// Data about this Object
	this.name = 'CMS';
	this.desc = 'Adming manager';

	// Root url for the CMS
	this.rootUrl = '';

	// Template to use and views path
	this.template = 'bootstrap';
	this.views = path.join(__dirname, '../views');

	// Express app instance
	this.app = null;

	// Cached menuItems
	this._menus = [];

	// Private menus, that will appear on the right side
	this._menusPrivate = [
		{name: 'Configurations', path: '/configure', icon: 'cog'},
	];

	// Modules installed
	this.modules = [];

	/**
	 * Initialize tournament on the given Express app
	 */
	this.initialize = function(options){

		options = options || {};

		// Load options
		for(var k in options)
			self[k] = options[k];

		if(!self.app)
			console.log("Failed to initialize CMS Controller. Missing 'app'".red);

		// Setup Express
		self.app.set('views', self.views);
		self.app.set('view engine', 'ejs');
		self.app.use(express.favicon());
		self.app.use(express.logger('dev'));
		self.app.use(express.json());
		self.app.use(express.urlencoded());
		self.app.use(express.methodOverride());
		self.app.use(self.app.router);
		self.app.use(express.static(path.join(__dirname, '../public')));

		if ('development' == self.app.get('env'))
			self.app.use(express.errorHandler());

		// Setup EJS
		// EJS Filter to output real URL
		ejs.filters.url = function(path) {
			if(!path)
				return '#';

			if(path.path)
				path = path.path;

			return (self.rootUrl + path).toLowerCase();
		};

		// Initialize Modules
		for(var i in self.modules){
			var module = self.modules[i];
			
			// Initialize module
			module.initialize(self);

			// Log message
			console.log(('Initialized Module: '+module.name.cyan).green);
		}

		// Route itself, so that we can have the index file
		self.route(self.routes);

		// console.log('Menus: '.magenta + JSON.stringify(self._menus, null, 2).magenta);
	};

	/**
	 * Install a module inside this controller
	 */
	this.use = function(module)
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

			// Fix path, to be an array 
			if(!_.isArray(route.path))
				route.path = [route.path];

			for(var subRoute in route.path){
				var method = route.method || 'get';
				self.app[method](self.rootUrl + route.path[subRoute], route.callback);
			}
		}
	}

	/*
	 * Redirect to the given path, with the curren root
	 */
	this.redirect = function(res, path){
		res.redirect(self.rootUrl + path);
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
			self._menus.push(menus[index]);
		}
	};

	/*************************************************
	 				Template Methods
	 *************************************************/

	this.renderWithView = function(res, pathToView, data){
		if(data)
			data._startRenderTime = (new Date).getTime(); 

		// Render sub-view html
		content = ejs.render(self.readFile(pathToView), data);

		// Render template with the given generated content 
		self.renderWithContent(res, content, data);

	};

	this.renderWithContent = function(res, content, data){
		var startRenderTime = (new Date).getTime(); 

		// Filter data
		data = data || {};

		// Filter content
		content = content || '';

		// Default data
		renderData = {
			// Private
			_content: content,
			_projectName: self.name,
			_rootUrl: self.rootUrl,
			_menus: self._menus,
			_menusPrivate: self._menusPrivate,
			_pathName: (res.req ? res.req.route.path : ''),

			// Not important
			_startRenderTime: startRenderTime,

			// Public
			sideMenu: false,
			title: self.name,
		};

		// Merge objects (data overrides renderData)
		for (var key in data)
			renderData[key] = data[key];

		// Render a templated html with the content as the main body
		res.render(self.template, renderData);

	};



	/*************************************************
	 				File Caching
	 *************************************************/
	this.cachedFiles = {};

	this.readFile = function(path){
		if(!self.cachedFiles[path])
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
		self.renderWithView(
			res,
			path.join(__dirname, '../views/configure.ejs'),
			{
				modules: self.modules
			});
	};

	this.routes = [
		{method: 'get', path: '/', callback: self.index},
		{method: 'get', path: '/configure', callback: self.configure},
	];
}