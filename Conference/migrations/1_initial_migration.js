var Conference = artifacts.require("./Conference.sol");

module.exports = function(deployer) {
  deployer.deploy(Conference, web3.eth.accounts[9]);
};
