// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FoodSupplyChain {
    enum State { Created, InTransit, AtWarehouse, AtRetailer, Sold }

    struct Product {
        string productId; // Unique identifier (e.g., UUID from frontend)
        string name;
        string category;
        string originLocation; // String representation of origin
        string producerName;
        uint256 quantity;
        string quantityUnit;
        uint256 productionDate;
        State currentState;
        address currentOwner;
        address creator; // Farmer/Producer
    }

    struct History {
        State state;
        address owner;
        uint256 timestamp;
        string action; // Description of the action
        string location; // Location of the action
    }

    mapping(string => Product) public products;
    mapping(string => History[]) public productHistory;
    
    // Mapping to check if product exists
    mapping(string => bool) public productExists;

    event ProductCreated(string productId, string name, address indexed owner, uint256 timestamp);
    event OwnershipTransferred(string productId, address indexed oldOwner, address indexed newOwner, string location, uint256 timestamp);
    event ProductStateUpdated(string productId, State newState, string location, uint256 timestamp);

    function createProduct(
        string memory _productId,
        string memory _name,
        string memory _category,
        string memory _originLocation,
        string memory _producerName,
        uint256 _quantity,
        string memory _quantityUnit,
        uint256 _productionDate
    ) public {
        require(!productExists[_productId], "Product ID already exists");

        Product memory newProduct = Product({
            productId: _productId,
            name: _name,
            category: _category,
            originLocation: _originLocation,
            producerName: _producerName,
            quantity: _quantity,
            quantityUnit: _quantityUnit,
            productionDate: _productionDate,
            currentState: State.Created,
            currentOwner: msg.sender,
            creator: msg.sender
        });

        products[_productId] = newProduct;
        productExists[_productId] = true;

        // Record initial history
        History memory initialHistory = History({
            state: State.Created,
            owner: msg.sender,
            timestamp: block.timestamp,
            action: "Product Created",
            location: _originLocation
        });
        productHistory[_productId].push(initialHistory);

        emit ProductCreated(_productId, _name, msg.sender, block.timestamp);
    }

    function transferOwnership(string memory _productId, address _newOwner, string memory _location, string memory _action) public {
        require(productExists[_productId], "Product does not exist");
        require(msg.sender == products[_productId].currentOwner, "Only current owner can transfer ownership");
        require(_newOwner != address(0), "New owner cannot be zero address");

        address oldOwner = products[_productId].currentOwner;
        products[_productId].currentOwner = _newOwner;

        // Automatically update state based on transfer (simplified logic, can be enhanced)
        // If Farmer transfers to Distributor -> InTransit
        if (products[_productId].currentState == State.Created) {
            products[_productId].currentState = State.InTransit;
        } 
        // If Distributor transfers to Retailer -> AtRetailer
        else if (products[_productId].currentState == State.InTransit) {
             products[_productId].currentState = State.AtRetailer;
        }
        // If Retailer transfers to Consumer -> Sold
        else if (products[_productId].currentState == State.AtRetailer) {
            products[_productId].currentState = State.Sold;
        }

        History memory newHistory = History({
            state: products[_productId].currentState,
            owner: _newOwner,
            timestamp: block.timestamp,
            action: _action,
            location: _location
        });
        productHistory[_productId].push(newHistory);

        emit OwnershipTransferred(_productId, oldOwner, _newOwner, _location, block.timestamp);
        emit ProductStateUpdated(_productId, products[_productId].currentState, _location, block.timestamp);
    }

    function updateState(string memory _productId, State _newState, string memory _location, string memory _action) public {
        require(productExists[_productId], "Product does not exist");
        require(msg.sender == products[_productId].currentOwner, "Only current owner can update state");

        products[_productId].currentState = _newState;

        History memory newHistory = History({
            state: _newState,
            owner: msg.sender,
            timestamp: block.timestamp,
            action: _action,
            location: _location
        });
        productHistory[_productId].push(newHistory);

        emit ProductStateUpdated(_productId, _newState, _location, block.timestamp);
    }

    function getProduct(string memory _productId) public view returns (Product memory) {
        require(productExists[_productId], "Product does not exist");
        return products[_productId];
    }

    function getProductHistory(string memory _productId) public view returns (History[] memory) {
        require(productExists[_productId], "Product does not exist");
        return productHistory[_productId];
    }
}
