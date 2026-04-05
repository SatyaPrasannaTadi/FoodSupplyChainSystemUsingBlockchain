import { ethers, BrowserProvider, Contract } from 'ethers';
import FoodSupplyChainObj from './abis/FoodSupplyChain.json';

const CONTRACT_ADDRESS = FoodSupplyChainObj.address; // From deployment
const CONTRACT_ABI = FoodSupplyChainObj.abi;

export interface ProductData {
    productId: string;
    name: string;
    category: string;
    originLocation: string;
    producerName: string;
    quantity: number;
    quantityUnit: string;
    productionDate: number;
}

export const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            // Request account access
            await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

            // Switch to Localhost 7545 (Ganache)
            const chainId = '0x539'; // 1337 in hex
            try {
                await (window as any).ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId }],
                });
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await (window as any).ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId,
                                    chainName: 'Localhost 7545',
                                    rpcUrls: ['http://127.0.0.1:7545'],
                                    nativeCurrency: {
                                        name: 'ETH',
                                        symbol: 'ETH',
                                        decimals: 18,
                                    },
                                },
                            ],
                        });
                    } catch (addError) {
                        console.error("Failed to add network", addError);
                    }
                } else {
                    console.error("Failed to switch network", switchError);
                }
            }

            const provider = new BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            return { provider, signer, address: await signer.getAddress() };
        } catch (error) {
            console.error("User rejected request", error);
            throw new Error("User rejected wallet connection");
        }
    } else {
        throw new Error("MetaMask not found");
    }
};

export const getContract = async (signerOrProvider: any) => {
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

export const createProductOnBlockchain = async (signer: any, product: ProductData) => {
    const contract = await getContract(signer);

    // Call createProduct function
    // function createProduct(string _productId, string _name, string _category, string _originLocation, string _producerName, uint256 _quantity, string _quantityUnit, uint256 _productionDate)
    const tx = await contract.createProduct(
        product.productId,
        product.name,
        product.category,
        product.originLocation,
        product.producerName,
        product.quantity,
        product.quantityUnit,
        product.productionDate,
        { gasLimit: 500000 } // Manual gas limit to prevent estimation errors
    );

    return tx; // Returns transaction response
};

export const transferOwnershipOnBlockchain = async (signer: any, productId: string, newOwnerAddress: string, location: string, action: string) => {
    const contract = await getContract(signer);
    const tx = await contract.transferOwnership(productId, newOwnerAddress, location, action, { gasLimit: 300000 });
    return tx;
};

export const updateStateOnBlockchain = async (signer: any, productId: string, newState: number, location: string, action: string) => {
    const contract = await getContract(signer);
    // newState is enum (0-4)
    const tx = await contract.updateState(productId, newState, location, action, { gasLimit: 300000 });
    return tx;
};
