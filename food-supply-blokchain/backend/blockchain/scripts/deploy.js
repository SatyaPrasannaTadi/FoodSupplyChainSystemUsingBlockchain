import hre from "hardhat";

async function main() {
    console.log("Deploying FoodSupplyChain contract...");

    const FoodSupplyChain = await hre.ethers.deployContract("FoodSupplyChain");
    await FoodSupplyChain.waitForDeployment();

    const contractAddress = await FoodSupplyChain.getAddress();
    console.log("FoodSupplyChain contract deployed to:", contractAddress);

    // Log deployment details
    console.log("\n=== Deployment Summary ===");
    console.log("Contract: FoodSupplyChain");
    console.log("Address:", contractAddress);
    console.log("Network:", hre.network.name);
    console.log("========================\n");

    return contractAddress;
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
