/**
 * Module dependencies.
 */
var _ = require('lodash');
var Team = require('./../models/team');

/**
 * Expose 'TeamController' constructor
 */
module.exports = TeamController;


/**
 * TeamController Module constructor
 */
function TeamController(modelConfig){

	// Global access to self class
	var self = this;
	
	// Data about this Object
	this.name = 'Teams Controller';
	this.desc = 'Manages teams';

	// Express app instance
	this.tournament = null;

	// Cached menuItems
	this.menuItems = [
		{name: 'Teams', path: '/teams'}
	];

	/**
	 * Initialize module with the given TournamentController
	 */
	this.initialize = function(tournament){
		self.tournament = tournament;

		self.tournament.route(self.routes);
		self.tournament.addMenus(self.menuItems);
	};
	
	/*************************************************
	 				Teams Model
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
	 				Teams Views
	 *************************************************/

	this.sideMenu = [
		{
			name: 'List Teams',
			path: '/teams',
			badge: 9,
			icon: 'list'
		},
		{
			name: 'Create Team',
			path: '/teams/create',
			icon: 'plus'
		},
	];

	this.list = function(req, res){
		var data = {
			title: 'List Teams',
			sideMenu: self.sideMenu,
			pathname: '/teams',

			teams: self.getTeams()
		};

		self.tournament.renderWithView(res, __dirname+'/../views/list_teams.ejs', data);
	}

	this.create = function(req, res){
		var data = {
			title: 'Create Team',
			sideMenu: self.sideMenu,

			teams: null,
			teamModel: [
				'name', 'id', 'country', 'state'
			]
		};

		self.tournament.renderWithView(res, __dirname+'/../views/list_teams.ejs', data);
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

		self.tournament.renderWithView(res, __dirname+'/../views/list_teams.ejs', data);
	}

	this.remove = function(req, res){
		var data = {
			title: 'Remove Team',
			sideMenu: self.sideMenu,
			// pathname: '/teams/create',

			teams: null,
			teamModel: [
				'name', 'id', 'country', 'state'
			]
		};

		self.tournament.renderWithView(res, __dirname+'/../views/list_teams.ejs', data);
	}

	// Routes
	this.routes = [
		{path: '/teams', callback: self.list},
		{path: '/teams/create', callback: self.create},
		{path: '/teams/edit/:id', callback: self.edit},
		{path: '/teams/delete/:id', callback: self.remove},
	];


}