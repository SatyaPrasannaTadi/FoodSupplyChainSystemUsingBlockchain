const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const FoodSupplyChain = await hre.ethers.getContractFactory("FoodSupplyChain");
    const foodSupplyChain = await FoodSupplyChain.deploy();

    await foodSupplyChain.waitForDeployment();
    const address = await foodSupplyChain.getAddress();

    console.log("FoodSupplyChain deployed to:", address);

    const deploymentInfo = {
        address: address,
        abi: JSON.parse(foodSupplyChain.interface.formatJson())
    };

    // Ensure directories exist
    const backendAbiDir = path.join(__dirname, "../../backend/abis");
    const frontendAbiDir = path.join(__dirname, "../../lib/abis");

    if (!fs.existsSync(backendAbiDir)) {
        fs.mkdirSync(backendAbiDir, { recursive: true });
    }
    if (!fs.existsSync(frontendAbiDir)) {
        fs.mkdirSync(frontendAbiDir, { recursive: true });
    }

    // Save to backend
    fs.writeFileSync(
        path.join(backendAbiDir, "FoodSupplyChain.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    // Save to frontend
    fs.writeFileSync(
        path.join(frontendAbiDir, "FoodSupplyChain.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Deployment info saved to backend and frontend.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
