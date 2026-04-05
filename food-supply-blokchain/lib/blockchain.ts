import { ethers, BrowserProvider, Contract } from 'ethers';
import FoodSupplyChainObj from './abis/FoodSupplyChain.json';

// ✅ CONTRACT DETAILS
const CONTRACT_ADDRESS = FoodSupplyChainObj.address;
const CONTRACT_ABI = FoodSupplyChainObj.abi;

// ✅ PRODUCT TYPE
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

// ✅ CONNECT WALLET + FORCE SEPOLIA
export const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            // Request wallet access
            await (window as any).ethereum.request({
                method: 'eth_requestAccounts'
            });

            // 🔥 FORCE SEPOLIA NETWORK
            const chainId = '0xaa36a7';

            try {
                await (window as any).ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId }],
                });
            } catch (switchError: any) {
                // If network not added → add it
                if (switchError.code === 4902) {
                    await (window as any).ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0xaa36a7',
                                chainName: 'Sepolia Test Network',
                                rpcUrls: ['https://rpc.sepolia.org'], // ✅ safe public RPC
                                nativeCurrency: {
                                    name: 'SepoliaETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                            },
                        ],
                    });
                } else {
                    console.error("Network switch error:", switchError);
                }
            }

            const provider = new BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            return { provider, signer, address };

        } catch (error) {
            console.error("Wallet connection error:", error);
            throw new Error("User rejected wallet connection");
        }
    } else {
        throw new Error("MetaMask not found");
    }
};

// ✅ GET CONTRACT INSTANCE
export const getContract = (signerOrProvider: any) => {
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

// ✅ CREATE PRODUCT
export const createProductOnBlockchain = async (signer: any, product: ProductData) => {
    try {
        const contract = getContract(signer);

        const tx = await contract.createProduct(
            product.productId,
            product.name,
            product.category,
            product.originLocation,
            product.producerName,
            product.quantity,
            product.quantityUnit,
            product.productionDate
        );

        await tx.wait(); // wait for confirmation
        return tx;

    } catch (error) {
        console.error("Create product error:", error);
        throw error;
    }
};

// ✅ TRANSFER OWNERSHIP
export const transferOwnershipOnBlockchain = async (
    signer: any,
    productId: string,
    newOwnerAddress: string,
    location: string,
    action: string
) => {
    try {
        const contract = getContract(signer);

        const tx = await contract.transferOwnership(
            productId,
            newOwnerAddress,
            location,
            action
        );

        await tx.wait();
        return tx;

    } catch (error) {
        console.error("Transfer ownership error:", error);
        throw error;
    }
};

// ✅ UPDATE STATE
export const updateStateOnBlockchain = async (
    signer: any,
    productId: string,
    newState: number,
    location: string,
    action: string
) => {
    try {
        const contract = getContract(signer);

        const tx = await contract.updateState(
            productId,
            newState,
            location,
            action
        );

        await tx.wait();
        return tx;

    } catch (error) {
        console.error("Update state error:", error);
        throw error;
    }
};