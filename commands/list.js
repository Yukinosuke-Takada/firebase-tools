'use strict';

var Command = require('../lib/command');
var api = require('../lib/api');
var requireAuth = require('../lib/requireAuth');
var chalk = require('chalk');
var Table = require('cli-table');
var _ = require('lodash');
var logger = require('../lib/logger');
var Config = require('../lib/config');

module.exports = new Command('list')
  .description('list the Firebases to which you have access')
  .before(requireAuth)
  .action(function(options) {
    var config = Config.load(options, true);

    return api.getProjects().then(function(projects) {
      var table = new Table({
        head: ['Name', 'Permissions'],
        style: {head: ['yellow']}
      });

      var out = [];
      _.forEach(projects, function(data, name) {
        var project = {
          id: name,
          permission: data.permission
        };

        var displayPermission;
        switch (data.permission) {
        case 'own':
          displayPermission = chalk.bold('Is owner');
          break;
        case 'edit':
          displayPermission = chalk.bold('Can edit');
          break;
        case 'view':
        default:
          displayPermission = 'Can view';
        }

        var displayName = name;
        if (_.get(config, 'defaults.project') === name) {
          displayName = chalk.cyan.bold(displayName + ' (current)');
        }
        out.push(project);
        table.push([
          displayName,
          displayPermission
        ]);
      });

      logger.info(table.toString());
      return out;
    });
  });
