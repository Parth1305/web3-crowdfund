import { network } from "hardhat";

async function main() {
  console.log("Deploying Crowdfund contract to Sepolia...");

  const { viem } = await network.connect();

  const crowdfund = await viem.deployContract("Crowdfund");

  console.log("✅ Crowdfund deployed to:", crowdfund.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});