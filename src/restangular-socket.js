angular
  .module('restangular-socket', [])
  .provider('RestangularSocket', function() {
    'use strict';

    this.host = "ws://" + window.location.hostname + ":1082";

    var config = this;

    this.$get = ['Restangular', 'socketFactory', '$rootScope', function (Restangular, socketFactory, $rootScope) {
      console.log("config", config);
      var ioSocket = io.connect(config.host);
      var socket = socketFactory({
        ioSocket: ioSocket
      });

      socket.emit('connection');

      // a chaque GET, on s'inscrit a un channel de socket
      Restangular.addResponseInterceptor(function (data, operation, what, url, response) {
        if (operation.indexOf("get") !== -1) {
          var urlSplit = url.split("://")[1].split("/");
          urlSplit.splice(0, 1);
          var ressource = urlSplit.join("/");
          if (response.config.params) {
            var keys = Object.keys(response.config.params);
            if (keys.length > 0) {
              for (var i = 0; i < keys.length; i++) {
                if (i === 0) {
                  ressource += "?" + keys[i] + "=" + response.config.params[keys[i]];
                } else {
                  ressource += "&" + keys[i] + "=" + response.config.params[keys[i]];
                }
              }
            }
          }
          socket.emit('join', ressource);
        }
        return data;
      });

      // a chaque POST, PUT ou DELETE, on demande une diffusion du channel
      Restangular.addResponseInterceptor(function (data, operation, what, url, response) {
        if (operation.indexOf("get") === -1) {
          var urlSplit = url.split("://")[1].split("/");
          urlSplit.splice(0, 1);
          var ressource = urlSplit.join("/");
          if (response.config.params) {
            var keys = Object.keys(response.config.params);
            if (keys.length > 0) {
              for (var i = 0; i < keys.length; i++) {
                if (i === 0) {
                  ressource += "?" + keys[i] + "=" + response.config.params[keys[i]];
                } else {
                  ressource += "&" + keys[i] + "=" + response.config.params[keys[i]];
                }
              }
            }
          }
          socket.emit('updateAll', ressource);
        }
        return data;
      });

      // a chaque update de channel, on fait un GET pour récupérer les nouvelles données
      socket.on('update', function(msg) {
        console.log("restangular-socket reception socket", msg) // eslint-disable-line
        Restangular.one(msg).withHttpConfig({cache: false}).get();
        $rootScope.$broadcast("restangularSocket", msg);
      });
    }];
  })
  .run(['RestangularSocket', angular.noop]);