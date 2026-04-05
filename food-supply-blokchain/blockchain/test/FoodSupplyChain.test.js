const { expect } = require("chai");
const hre = require("hardhat");

describe("FoodSupplyChain", function () {
    let FoodSupplyChain, foodSupplyChain, owner, farmer, distributor, retailer, consumer;

    beforeEach(async function () {
        [owner, farmer, distributor, retailer, consumer] = await hre.ethers.getSigners();
        FoodSupplyChain = await hre.ethers.getContractFactory("FoodSupplyChain");
        foodSupplyChain = await FoodSupplyChain.deploy();
        await foodSupplyChain.waitForDeployment();
    });

    it("should create a new product", async function () {
        await foodSupplyChain.connect(farmer).createProduct(
            "prod-123",
            "Organic Apple",
            "Fruits",
            "Green Valley Farm",
            "Alice Farmer",
            100,
            "kg",
            Math.floor(Date.now() / 1000)
        );

        const product = await foodSupplyChain.getProduct("prod-123");
        expect(product.name).to.equal("Organic Apple");
        expect(product.currentOwner).to.equal(farmer.address);
        // Hardhat ethers v6 returns BigInt for uint
        expect(product.currentState).to.equal(0n); // State.Created (BigInt)
    });

    it("should transfer ownership and update state", async function () {
        // Create product
        await foodSupplyChain.connect(farmer).createProduct(
            "prod-123", "Banana", "Fruits", "Tropics", "Bob", 50, "kg", Math.floor(Date.now() / 1000)
        );

        // Transfer to Distributor
        await foodSupplyChain.connect(farmer).transferOwnership(
            "prod-123",
            distributor.address,
            "Port of Entry",
            "Handover to Distributor"
        );

        const product = await foodSupplyChain.getProduct("prod-123");
        expect(product.currentOwner).to.equal(distributor.address);
        // State.InTransit
        expect(product.currentState).to.equal(1n);

        const history = await foodSupplyChain.getProductHistory("prod-123");
        expect(history.length).to.equal(2);
        expect(history[1].owner).to.equal(distributor.address);
    });

    it("should fail if non-owner tries to transfer", async function () {
        await foodSupplyChain.connect(farmer).createProduct(
            "prod-123", "Pear", "Fruits", "Hillside", "Charlie", 20, "kg", Math.floor(Date.now() / 1000)
        );

        await expect(
            foodSupplyChain.connect(distributor).transferOwnership(
                "prod-123",
                retailer.address,
                "somewhere",
                "steal"
            )
        ).to.be.revertedWith("Only current owner can transfer ownership");
    });
});
