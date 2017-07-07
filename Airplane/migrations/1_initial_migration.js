// var Migrations = artifacts.require("./Migrations.sol");

// module.exports = function(deployer) {
//   deployer.deploy(Migrations);
// };

var Flight = artifacts.require("./Flight.sol");

module.exports = function(deployer) {
  deployer.deploy(Flight);
};