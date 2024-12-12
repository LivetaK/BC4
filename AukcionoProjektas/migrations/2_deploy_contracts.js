const MultiItemAuction = artifacts.require("MultiItemAuction");

module.exports = function (deployer) {
  const bidIncrement = 1000000000000000;
  deployer.deploy(MultiItemAuction, bidIncrement);
};
