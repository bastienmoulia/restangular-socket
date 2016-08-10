angular
  .module('app', ["restangular", "restangular-socket", "btford.socket-io",])
  .config(appConfig)
  .controller('appController', appController);

function appConfig(RestangularProvider) {
  RestangularProvider.setBaseUrl("http://localhost:8090");
}

function appController(Restangular) {
  this.input = "";
  this.messages = [];
  var _this = this;

  this.$onInit = function() {
    this.messages = ["loading"];
    Restangular.all('messages').getList()
      .then(function(messages) {
        _this.messages = messages;
      })
  }

  this.submit = function() {
    this.messages = this.input;
    this.input = "";
  }
};