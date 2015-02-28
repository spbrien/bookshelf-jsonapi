'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..'),
  db = require('./util/db'),
  migrate = require('./util/migrations'),
  expect = require('expect.js'),
  helper = require('./util/helper');

describe('Valid resource items', function () {
  var app = express();
  app.use('/api', jsonapi(db.models));

  before(function(done) {
    migrate.up(db.knex)
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.log(err);
      });
  });
  after(function(done) {
    migrate.down(db.knex)
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  describe('Resource item methods', function () {

    it('POST should return a new item with id', function(done) {
      var reqBody = {
        data: {
          type: 'authors',
          name: 'Josh Thomas',
          email: 'jthoms1@gmail.com',
          'follower_count': 0
        }
      };
      request(app)
        .post('/api/authors')
        .send(reqBody)
        .expect(201)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('object');
          expect(body.data).to.have.keys(['name', 'email', 'follower_count', 'type', 'id']);
          expect(body.data.id).to.be.equal(1);
          expect(body.data.type).to.be.equal('authors');
          done();
        });
    });

    it('GET a resource should return an object', function(done) {
      request(app)
        .get('/api/authors/1')
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('object');
          expect(body.data).to.have.keys(['name', 'email', 'follower_count', 'type', 'id']);
          expect(body.data.id).to.be.equal(1);
          expect(body.data.type).to.be.equal('authors');
          done();
        });
    });

    it('PUT a resource', function(done) {
      var reqBody = {
        data: {
          id: 1,
          type: 'authors',
          'follower_count': 10
        }
      };
      request(app)
        .put('/api/authors/1')
        .send(reqBody)
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('object');
          expect(body.data).to.have.keys(['follower_count', 'type', 'id']);
          expect(body.data.type).to.be.equal('authors');
          expect(body.data.id).to.be.equal(1);
          expect(body.data.follower_count).to.be.equal(10);
          done();
        });
    });

    it('GET resources should return an object with a data array', function(done) {
      request(app)
        .get('/api/authors')
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('array');
          expect(body.data).to.have.length(1);
          done();
        });
    });

    it('DELETE a resource should return an empty body and a 204', function(done) {
      request(app)
        .del('/api/authors/1')
        .expect(204)
        .end(function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
          done();
        });
    });
  });
});
