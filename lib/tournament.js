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
	this.menuItems = {
		topMenu: [
			{name: 'Teams', path: '/teams'}
		],
		// leftMenu: [],
		gadgetTop: [],
	};

	// Modules installed
	this.modules = [];

	/**
	 * Initialize tournament on the given Express app
	 */
	this.initialize = function(app){
		self.app = app;

		// Initialize Modules
		for(var i in self.module){
			var module = self.modules[i];
			
			console.log(('Initializing '+module.opt.name).grey);
			
			module.initialize(self);

			self.route(module);

			self.addMenuItems(module.menuItems);
		}

		// Self route
		// self.route(self);

		console.log('Menu Items: '.magenta + JSON.stringify(self.menuItems, null, 2).magenta);
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
	this.route = function(obj){
		// Check if valid
		if( !(obj && _.isArray(obj.routes)) )
			return;

		for(var i in obj.routes){
			var route = obj.routes[i];

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
	 * Add's menu items to the viewController
	 * (This will be called from install methods)
	 *
	 * Pattern: [{name:'name', path:'path', childs:[{...},{...}]];
	 *
	 */
	this.addMenuItems = function(menuItems){
		// Filter menuItems
		if(!_.isObject(menuItems))
			return;

		for(var key in self.menuItems){
			// menuItems contain the key?
			if(menuItems[key]){
				var relative = menuItems[key];

				// Add all elements
				for(var elem in relative)
					self.menuItems[key].push(relative[elem]);
			}
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
			_menuItems: self.menuItems,

			// Public
			pathname: '',
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
	 				Teams Controller
	 *************************************************/
	this._teams = [
		{id: 1, category: 'robocup-soccer-open', name: 'Time 1', country: 'BR'},
		{id: 2, category: 'robocup-soccer-open', name: 'Team 2', country: 'PT'},
		{id: 3, category: 'robocup-soccer-open', name: 'Time 3', country: 'EN'},
		{id: 4, category: 'robocup-soccer-open', name: 'Time 4', country: 'US'},
		{id: 5, category: 'robocup-soccer-open', name: 'Time 5', country: 'BR'},
	];

	this.loadTeams = function(cb){

	}

	this.getTeams = function(cb){
		return self._teams;
	}

	this.saveTeam = function(team, cb){
		
	}

	this.deleteTeam = function(team, cb){
		
	}

	/*************************************************
	 				Pages Callbacks
	 *************************************************/

	this.teamsSideMenu = [
		{name: 'List Teams', path: '/teams/list', badge: 9},
		{name: 'Create Team', path: '/teams/create'},
	];

	this.list = function(req, res){
		var data = {
			title: 'List Teams',
			sideMenu: self.teamsSideMenu,
			pathname: '/teams/list',

			teams: self.getTeams()
		};

		self.renderWithView(res, './views/list_teams.ejs', data);
	}

	this.create = function(req, res){
		var data = {
			title: 'Create Team',
			sideMenu: self.teamsSideMenu,
			pathname: '/teams/create',

			teams: null,
			teamModel: [
				'name', 'id', 'country', 'state'
			]
		};

		self.renderWithView(res, './views/list_teams.ejs', data);
	}

	// Routes
	this.routes = [
		{path: ['/teams/list', '/teams'], callback: self.list},
		{path: '/teams/create', callback: self.create},
	];


}