/**
 * Module dependencies.
 */


/**
 * Expose 'ViewController' constructor
 */
module.exports = ViewController;

/**
 * View class constructor
 * (This is just a skeleton for other classes)
 */
function ViewController(options){

	// Load options
	var options = options || {};
	
	// Data about this Object
	this.opt.name = 'ViewController';
	this.opt.desc = 'Controlls some views';

	// Save options
	this.opt = opt;

	// TournamentController instance
	this.tournament = null;

	// Expose menu_items to show
	this.menuItems = {
		topMenu:[
			{
				name: 'Home',
			},
			{
				path: '/test',
				name: 'View Module',
				childs: [
					{name: 'group 1', childs: [
						{path: '/test/a', name: 'subItem 1'},
						{path: '/test/b', name: 'subItem 2'},
						{path: '/test/c', name: 'subItem 3', hidden: true},

					]}
				]
			},
			{
				path: '/test',
				name: 'View Module 2',
				childs: [
					{name: 'AEWWE', childs: [
						{path: '/test/a', name: 'subItem 1'},
						{path: '/test/b', name: 'subItem 2'},
						{path: '/test/c', name: 'subItem 3', hidden: true},

					]},
					{childs: [
						{path: '/test/a', name: 'subItem 1'},
						{path: '/test/b', name: 'subItem 2'},
						{path: '/test/c', name: 'subItem 3', hidden: true},

					]}
				]
			},
			{
				path: '/test',
				name: 'Menu 2',
				childs: [
					{path: '/test/a', name: 'subItem 2.1'},
					{path: '/test/b', name: 'subItem 2.2'},
					{path: '/test/c', name: 'subItem 2.3', hidden: true},

				]
			}
		],
	};

	this.sideMenu = [
		{path: '/test', name: 'Link 1', badge: 54},
		{path: '/test', name: 'Link 2'},
		{path: '/test', name: 'Link 3'},
		{path: '/test', name: 'Link 4'},
		{path: '/test', name: 'Link 5'}
	];

	// Global access to self class
	var self = this;

	/**
	 * Initialize View on the given app
	 * (Will be called from Tournament controller)
	 */
	this.initialize = function(tournament){
		self.tournament = tournament;

		// // Setup local pages (CRUD of Teams and Configurations)
		// tournament.app.get('/teams/list', self.list);
		// tournament.app.get('/teams/create', self.create);

		console.log((self.opt.name+' initialized!').green);
	};

	/*************************************************
	 				Pages Callbacks
	 *************************************************/

	/*this.index = function(req, res){
		var data = {
			title: 'Teams controller',
			sideMenu: teamsSideMenu,
			pathname: '/teams/list'
		};

		self.tournament.renderWithView(res, __dirname+'/views/test.ejs', data);
	}*/

}