// var Migrations = artifacts.require("./Migrations.sol");

// module.exports = function(deployer) {
//   deployer.deploy(Migrations);
// };
var Conference = artifacts.require("./Conference.sol");

module.exports = function(deployer) {
  deployer.deploy(Conference);
};