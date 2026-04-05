// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FoodSupplyChain
 * @dev Smart contract for tracking food products through the supply chain
 * Supports 5 roles: Producer, Supplier, Retailer, Consumer, Admin
 */
contract FoodSupplyChain {
    
    // Enums
    enum Role { None, Producer, Supplier, Retailer, Consumer, Admin }
    enum ProductStatus { Registered, InTransit, Delivered, Verified }
    
    // Structs
    struct User {
        address userAddress;
        string name;
        string email;
        Role role;
        string organization;
        bool isRegistered;
    }
    
    struct TransportRecord {
        uint256 timestamp;
        string location;
        int256 temperature;
        address updatedBy;
        string status;
    }
    
    struct VerificationRecord {
        uint256 timestamp;
        address verifiedBy;
        bool isAuthentic;
        string remarks;
    }
    
    struct Product {
        uint256 productId;
        string name;
        string category;
        address producer;
        string producerName;
        string origin;
        uint256 productionDate;
        uint256 expiryDate;
        ProductStatus status;
        TransportRecord[] transportHistory;
        VerificationRecord[] verifications;
        bool exists;
    }
    
    // State variables
    address public admin;
    uint256 public productCounter;
    
    mapping(address => User) public users;
    mapping(uint256 => Product) public products;
    uint256[] public productIds;
    
    // Events
    event UserRegistered(address indexed userAddress, string name, Role role);
    event ProductRegistered(uint256 indexed productId, string name, address indexed producer);
    event TransportUpdated(uint256 indexed productId, string location, int256 temperature);
    event ProductVerified(uint256 indexed productId, address indexed verifier, bool isAuthentic);
    event ProductStatusChanged(uint256 indexed productId, ProductStatus newStatus);
    
    // Modifiers
    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyProducer() {
        require(users[msg.sender].role == Role.Producer, "Only producer can perform this action");
        _;
    }
    
    modifier onlySupplier() {
        require(users[msg.sender].role == Role.Supplier, "Only supplier can perform this action");
        _;
    }
    
    modifier onlyRetailer() {
        require(users[msg.sender].role == Role.Retailer, "Only retailer can perform this action");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(products[_productId].exists, "Product does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        users[msg.sender] = User({
            userAddress: msg.sender,
            name: "Admin",
            email: "admin@foodchain.com",
            role: Role.Admin,
            organization: "Food Supply Chain Admin",
            isRegistered: true
        });
        productCounter = 0;
    }
    
    // User Management Functions
    
    /**
     * @dev Register a new user with a specific role
     */
    function registerUser(
        address _userAddress,
        string memory _name,
        string memory _email,
        Role _role,
        string memory _organization
    ) public onlyAdmin {
        require(!users[_userAddress].isRegistered, "User already registered");
        require(_role != Role.None, "Invalid role");
        
        users[_userAddress] = User({
            userAddress: _userAddress,
            name: _name,
            email: _email,
            role: _role,
            organization: _organization,
            isRegistered: true
        });
        
        emit UserRegistered(_userAddress, _name, _role);
    }
    
    /**
     * @dev Self-registration for consumers
     */
    function registerAsConsumer(
        string memory _name,
        string memory _email
    ) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            name: _name,
            email: _email,
            role: Role.Consumer,
            organization: "Consumer",
            isRegistered: true
        });
        
        emit UserRegistered(msg.sender, _name, Role.Consumer);
    }
    
    /**
     * @dev Get user details
     */
    function getUserDetails(address _userAddress) public view returns (
        string memory name,
        string memory email,
        Role role,
        string memory organization,
        bool isRegistered
    ) {
        User memory user = users[_userAddress];
        return (user.name, user.email, user.role, user.organization, user.isRegistered);
    }
    
    // Product Management Functions
    
    /**
     * @dev Register a new product (Producer only)
     */
    function registerProduct(
        string memory _name,
        string memory _category,
        string memory _origin,
        uint256 _productionDate,
        uint256 _expiryDate
    ) public onlyProducer returns (uint256) {
        productCounter++;
        uint256 newProductId = productCounter;
        
        Product storage newProduct = products[newProductId];
        newProduct.productId = newProductId;
        newProduct.name = _name;
        newProduct.category = _category;
        newProduct.producer = msg.sender;
        newProduct.producerName = users[msg.sender].name;
        newProduct.origin = _origin;
        newProduct.productionDate = _productionDate;
        newProduct.expiryDate = _expiryDate;
        newProduct.status = ProductStatus.Registered;
        newProduct.exists = true;
        
        productIds.push(newProductId);
        
        emit ProductRegistered(newProductId, _name, msg.sender);
        
        return newProductId;
    }
    
    /**
     * @dev Update transport status (Supplier only)
     */
    function updateTransport(
        uint256 _productId,
        string memory _location,
        int256 _temperature,
        string memory _status
    ) public onlySupplier productExists(_productId) {
        Product storage product = products[_productId];
        
        TransportRecord memory newRecord = TransportRecord({
            timestamp: block.timestamp,
            location: _location,
            temperature: _temperature,
            updatedBy: msg.sender,
            status: _status
        });
        
        product.transportHistory.push(newRecord);
        
        // Update product status to InTransit if it was Registered
        if (product.status == ProductStatus.Registered) {
            product.status = ProductStatus.InTransit;
            emit ProductStatusChanged(_productId, ProductStatus.InTransit);
        }
        
        emit TransportUpdated(_productId, _location, _temperature);
    }
    
    /**
     * @dev Mark product as delivered
     */
    function markAsDelivered(uint256 _productId) public onlySupplier productExists(_productId) {
        Product storage product = products[_productId];
        require(product.status == ProductStatus.InTransit, "Product must be in transit");
        
        product.status = ProductStatus.Delivered;
        emit ProductStatusChanged(_productId, ProductStatus.Delivered);
    }
    
    /**
     * @dev Verify product authenticity (Retailer only)
     */
    function verifyProduct(
        uint256 _productId,
        bool _isAuthentic,
        string memory _remarks
    ) public onlyRetailer productExists(_productId) {
        Product storage product = products[_productId];
        
        VerificationRecord memory newVerification = VerificationRecord({
            timestamp: block.timestamp,
            verifiedBy: msg.sender,
            isAuthentic: _isAuthentic,
            remarks: _remarks
        });
        
        product.verifications.push(newVerification);
        
        if (_isAuthentic) {
            product.status = ProductStatus.Verified;
            emit ProductStatusChanged(_productId, ProductStatus.Verified);
        }
        
        emit ProductVerified(_productId, msg.sender, _isAuthentic);
    }
    
    // Query Functions
    
    /**
     * @dev Get product details
     */
    function getProduct(uint256 _productId) public view productExists(_productId) returns (
        string memory name,
        string memory category,
        address producer,
        string memory producerName,
        string memory origin,
        uint256 productionDate,
        uint256 expiryDate,
        ProductStatus status
    ) {
        Product memory product = products[_productId];
        return (
            product.name,
            product.category,
            product.producer,
            product.producerName,
            product.origin,
            product.productionDate,
            product.expiryDate,
            product.status
        );
    }
    
    /**
     * @dev Get transport history for a product
     */
    function getTransportHistory(uint256 _productId) public view productExists(_productId) returns (TransportRecord[] memory) {
        return products[_productId].transportHistory;
    }
    
    /**
     * @dev Get verification records for a product
     */
    function getVerifications(uint256 _productId) public view productExists(_productId) returns (VerificationRecord[] memory) {
        return products[_productId].verifications;
    }
    
    /**
     * @dev Get all product IDs
     */
    function getAllProductIds() public view returns (uint256[] memory) {
        return productIds;
    }
    
    /**
     * @dev Get total number of products
     */
    function getTotalProducts() public view returns (uint256) {
        return productCounter;
    }
    
    /**
     * @dev Get products by producer
     */
    function getProductsByProducer(address _producer) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](productCounter);
        uint256 counter = 0;
        
        for (uint256 i = 0; i < productIds.length; i++) {
            if (products[productIds[i]].producer == _producer) {
                result[counter] = productIds[i];
                counter++;
            }
        }
        
        // Resize array to actual size
        uint256[] memory finalResult = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            finalResult[i] = result[i];
        }
        
        return finalResult;
    }
    
    /**
     * @dev Get complete product journey (for consumers)
     */
    function getProductJourney(uint256 _productId) public view productExists(_productId) returns (
        string memory name,
        string memory category,
        string memory producerName,
        string memory origin,
        uint256 productionDate,
        uint256 expiryDate,
        ProductStatus status,
        uint256 transportRecordCount,
        uint256 verificationCount
    ) {
        Product memory product = products[_productId];
        return (
            product.name,
            product.category,
            product.producerName,
            product.origin,
            product.productionDate,
            product.expiryDate,
            product.status,
            product.transportHistory.length,
            product.verifications.length
        );
    }
}
