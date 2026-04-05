const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy("SFIT Student Council Election 2026");
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("✓ Contract deployed to:", address);
  console.log("✓ Phase: REGISTRATION (add candidates and voters from Admin panel)");
  console.log("\nSave this contract address:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});