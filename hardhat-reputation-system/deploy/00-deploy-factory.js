const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const { developmentChain } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const factory = await deploy("ReputationFactory", {
    contract: "ReputationFactory",
    from: deployer,
    logs: true,
  });
  console.log("Factory deployed through hardhat deploy!");
  // Deploy a dummy service provider to get ABI for frontend

  const dummyServiceProvider = await deploy("ServiceProvider", {
    contract: "ServiceProvider",
    from: deployer,
    logs: true,
    args:[factory.address, factory.address]
  });

  //console.log(dummyServiceProvider.address)

  if (!developmentChain.includes(network.name)) {
    await verify(factory.address, []);
  }
};

module.exports.tags = ["all", "ReputationFactory"];
