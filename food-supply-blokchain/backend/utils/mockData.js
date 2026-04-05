const { randomUUID } = require('crypto');

// Generate realistic mock data for food supply chain
const generateMockProducts = () => {
    const products = [
        // Fruits
        {
            name: "Organic Apples",
            category: "fruits",
            origin: { location: "Kashmir Valley", farmName: "Green Valley Orchards", coordinates: { lat: 34.0837, lng: 74.7973 } },
            producer: { name: "Rajesh Kumar", contact: "+91-9876543210" },
            quantity: { value: 500, unit: "kg" },
            certifications: ["Organic", "FSSAI"],
            qualityGrade: "A+"
        },
        {
            name: "Fresh Mangoes",
            category: "fruits",
            origin: { location: "Ratnagiri, Maharashtra", farmName: "Alphonso Farms", coordinates: { lat: 16.9902, lng: 73.3120 } },
            producer: { name: "Sunita Patil", contact: "+91-9123456789" },
            quantity: { value: 300, unit: "kg" },
            certifications: ["GI Tag", "FSSAI"],
            qualityGrade: "Premium"
        },
        {
            name: "Banana Bunches",
            category: "fruits",
            origin: { location: "Tamil Nadu", farmName: "South India Plantations", coordinates: { lat: 11.1271, lng: 78.6569 } },
            producer: { name: "Murugan Selvam", contact: "+91-8765432109" },
            quantity: { value: 800, unit: "kg" },
            certifications: ["FSSAI"],
            qualityGrade: "A"
        },

        // Vegetables
        {
            name: "Organic Tomatoes",
            category: "vegetables",
            origin: { location: "Pune, Maharashtra", farmName: "Fresh Harvest Farms", coordinates: { lat: 18.5204, lng: 73.8567 } },
            producer: { name: "Amit Deshmukh", contact: "+91-9988776655" },
            quantity: { value: 600, unit: "kg" },
            certifications: ["Organic", "FSSAI"],
            qualityGrade: "A"
        },
        {
            name: "Green Spinach",
            category: "vegetables",
            origin: { location: "Punjab", farmName: "Leafy Greens Co.", coordinates: { lat: 31.1471, lng: 75.3412 } },
            producer: { name: "Harpreet Singh", contact: "+91-9234567890" },
            quantity: { value: 200, unit: "kg" },
            certifications: ["Organic", "FSSAI"],
            qualityGrade: "A+"
        },
        {
            name: "Fresh Potatoes",
            category: "vegetables",
            origin: { location: "Uttar Pradesh", farmName: "Golden Fields", coordinates: { lat: 26.8467, lng: 80.9462 } },
            producer: { name: "Ramesh Yadav", contact: "+91-9876501234" },
            quantity: { value: 1000, unit: "kg" },
            certifications: ["FSSAI"],
            qualityGrade: "B+"
        },

        // Dairy
        {
            name: "Organic Milk",
            category: "dairy",
            origin: { location: "Amul, Gujarat", farmName: "White Gold Dairy", coordinates: { lat: 22.5448, lng: 72.9275 } },
            producer: { name: "Dairy Cooperative", contact: "+91-9012345678" },
            quantity: { value: 500, unit: "liters" },
            certifications: ["Organic", "FSSAI", "ISO 22000"],
            qualityGrade: "Premium"
        },
        {
            name: "Fresh Paneer",
            category: "dairy",
            origin: { location: "Haryana", farmName: "Dairy Fresh Industries", coordinates: { lat: 29.0588, lng: 76.0856 } },
            producer: { name: "Suresh Dairy", contact: "+91-9345678901" },
            quantity: { value: 100, unit: "kg" },
            certifications: ["FSSAI"],
            qualityGrade: "A"
        },

        // Meat
        {
            name: "Chicken (Farm Fresh)",
            category: "meat",
            origin: { location: "Andhra Pradesh", farmName: "Poultry Paradise", coordinates: { lat: 15.9129, lng: 79.7400 } },
            producer: { name: "Venkat Farms", contact: "+91-9456789012" },
            quantity: { value: 300, unit: "kg" },
            certifications: ["FSSAI", "Halal"],
            qualityGrade: "A+"
        },

        // Grains
        {
            name: "Basmati Rice",
            category: "grains",
            origin: { location: "Haryana", farmName: "Golden Grain Mills", coordinates: { lat: 29.0588, lng: 76.0856 } },
            producer: { name: "Rice Mills Ltd", contact: "+91-9567890123" },
            quantity: { value: 2000, unit: "kg" },
            certifications: ["GI Tag", "FSSAI"],
            qualityGrade: "Premium"
        },
        {
            name: "Organic Wheat",
            category: "grains",
            origin: { location: "Punjab", farmName: "Wheat Fields Co.", coordinates: { lat: 31.1471, lng: 75.3412 } },
            producer: { name: "Punjab Grains", contact: "+91-9678901234" },
            quantity: { value: 1500, unit: "kg" },
            certifications: ["Organic", "FSSAI"],
            qualityGrade: "A"
        },

        // Seafood
        {
            name: "Fresh Prawns",
            category: "seafood",
            origin: { location: "Kerala Coast", farmName: "Ocean Harvest", coordinates: { lat: 10.8505, lng: 76.2711 } },
            producer: { name: "Marine Foods", contact: "+91-9789012345" },
            quantity: { value: 150, unit: "kg" },
            certifications: ["FSSAI", "Export Grade"],
            qualityGrade: "Premium"
        },

        // Additional variety
        {
            name: "Green Chillies",
            category: "vegetables",
            origin: { location: "Karnataka", farmName: "Spice Gardens", coordinates: { lat: 15.3173, lng: 75.7139 } },
            producer: { name: "Spice Growers", contact: "+91-9890123456" },
            quantity: { value: 100, unit: "kg" },
            certifications: ["FSSAI"],
            qualityGrade: "A"
        },
        {
            name: "Fresh Coriander",
            category: "vegetables",
            origin: { location: "Rajasthan", farmName: "Herb Haven", coordinates: { lat: 27.0238, lng: 74.2179 } },
            producer: { name: "Green Herbs Ltd", contact: "+91-9901234567" },
            quantity: { value: 50, unit: "kg" },
            certifications: ["Organic", "FSSAI"],
            qualityGrade: "A+"
        },
        {
            name: "Farm Eggs",
            category: "dairy",
            origin: { location: "Telangana", farmName: "Egg Farms India", coordinates: { lat: 17.3850, lng: 78.4867 } },
            producer: { name: "Egg Producers Co-op", contact: "+91-9012345679" },
            quantity: { value: 1000, unit: "pieces" },
            certifications: ["FSSAI"],
            qualityGrade: "A"
        }
    ];

    // Generate complete product objects with IDs and dates
    return products.map(product => {
        const productionDate = new Date();
        productionDate.setDate(productionDate.getDate() - Math.floor(Math.random() * 15)); // 0-15 days ago

        const expiryDays = product.category === 'dairy' ? 7 :
            product.category === 'meat' || product.category === 'seafood' ? 3 :
                product.category === 'vegetables' ? 10 :
                    product.category === 'fruits' ? 15 : 60;

        const expiryDate = new Date(productionDate);
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        return {
            productId: `FSC-${Date.now()}-${randomUUID().substring(0, 8).toUpperCase()}`,
            name: product.name,
            category: product.category,
            origin: product.origin,
            producer: {
                name: product.producer.name,
                contact: product.producer.contact
            },
            productionDate,
            expiryDate,
            quantity: product.quantity,
            currentStatus: getRandomStatus(),
            metadata: {
                certifications: product.certifications,
                qualityGrade: product.qualityGrade,
                description: `High-quality ${product.name.toLowerCase()} from ${product.origin.location}`
            }
        };
    });
};

function getRandomStatus() {
    const statuses = ['registered', 'in_transit', 'at_warehouse', 'at_retailer', 'verified'];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

module.exports = { generateMockProducts };
