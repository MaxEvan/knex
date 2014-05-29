var testConfig = process.env.KNEX_TEST && require(process.env.KNEX_TEST) || {};
var _          = require('lodash');
var Promise    = require('bluebird');

var pool = {
  afterCreate: function(connection, callback) {
    expect(connection).to.have.property('__cid');
    callback(null, connection);
  },
  beforeDestroy: function(connection) {
    expect(connection).to.have.property('__cid');
  }
};

var migrations = {
  directory: __dirname + '/integration/migrate/migration'
};

module.exports = {

  mysql: {
    client: 'mysql',
    connection: testConfig.mysql || {
      database: "knex_test",
      user: "root"
    },
    pool: _.extend({}, pool, {
      afterCreate: function(connection, callback) {
        Promise.promisify(connection.query, connection)("SET sql_mode='TRADITIONAL';", []).then(function() {
          callback(null, connection);
        });
      }
    }),
    migrations: migrations
  },

  postgres: {
    client: 'postgres',
    connection: testConfig.postgres || {
      adapter:  "postgresql",
      database: "knex_test",
      user:     "postgres"
    },
    pool: pool,
    migrations: migrations
  },

  sqlite3: {
    client: 'sqlite3',
    connection: {
      filename: ":memory:"
    },
    pool: pool,
    migrations: migrations
  }

};