const { deployments } = require("hardhat");
const fs = require("fs");

const ABI_FILE = "../backend/constants/abi.json";
const SP_ABI_FILE = "../backend/constants/SPabi.json";

module.exports = async function () {
  console.log("Updating frontend...");
  await updateABI();
  console.log("Factory Address and ABI written!");
};


async function updateABI() {
  const factory = await deployments.get("ReputationFactory");
  fs.writeFileSync(ABI_FILE, JSON.stringify(factory.abi));

  const serviceProvider = await deployments.get("ServiceProvider");
  fs.writeFileSync(SP_ABI_FILE, JSON.stringify(serviceProvider.abi));
}

module.exports.tags = ["all", "frontend"];
