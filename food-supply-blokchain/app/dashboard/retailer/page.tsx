"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Store, CheckCircle, AlertTriangle, Package } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { connectWallet, updateStateOnBlockchain } from "@/lib/blockchain"
import { Wallet } from "lucide-react"

export default function RetailerDashboard() {
    const [searchId, setSearchId] = useState("")
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [verificationNotes, setVerificationNotes] = useState("")
    const [verifying, setVerifying] = useState(false)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [signer, setSigner] = useState<any>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch("https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/products")
            const data = await res.json()
            if (data.success) {
                setProducts(data.products)
            }
        } catch (error) {
            console.error("Error fetching products:", error)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }

    const handleConnectWallet = async () => {
        try {
            const { address, signer } = await connectWallet()
            setWalletAddress(address)
            setSigner(signer)
            toast.success("Wallet connected successfully!")
        } catch (error) {
            console.error("Error connecting wallet:", error)
            toast.error("Failed to connect wallet")
        }
    }

    const handleVerify = async () => {
        if (!selectedProduct || !user) return

        if (!walletAddress || !signer) {
            toast.error("Please connect your wallet first")
            return
        }

        setVerifying(true)
        try {
            // 1. Blockchain Update
            // Verify maps to AtRetailer (State 3) or we could have a specific state if enum allowed. 
            // Using AtRetailer (3) as it confirms receipt and verification by retailer.
            const stateEnum = 3

            toast.info("Please sign verification in MetaMask...")
            let transactionHash = ""
            let blockNumber = 0

            try {
                const tx = await updateStateOnBlockchain(
                    signer,
                    selectedProduct.productId,
                    stateEnum,
                    "Retail Store",
                    `Verified by Retailer: ${verificationNotes}`
                )
                toast.info("Transaction sent... waiting...")
                const receipt = await tx.wait()
                transactionHash = receipt.hash
                blockNumber = receipt.blockNumber
                toast.success("Blockchain verification confirmed!")
            } catch (err: any) {
                console.error("Blockchain error:", err)
                toast.error("Blockchain verification failed: " + (err.message || "Unknown error"))
                setVerifying(false)
                return
            }

            // 2. Backend Update
            const body = {
                verifiedBy: {
                    name: user.name,
                    userId: user.id,
                    role: user.role
                },
                status: "verified",
                notes: verificationNotes,
                transactionHash,
                blockNumber
            }

            const res = await fetch(`https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/products/${selectedProduct.productId}/verify`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Product verified successfully")
                fetchProducts()
                setSelectedProduct(null)
                setVerificationNotes("")
                setSearchId("")
            } else {
                toast.error(data.message || "Verification failed")
            }
        } catch (error) {
            console.error("Error verifying product:", error)
            toast.error("An error occurred")
        } finally {
            setVerifying(false)
        }
    }

    const handleSearch = () => {
        const found = products.find(p => p.productId === searchId)
        if (found) {
            setSelectedProduct(found)
        } else {
            toast.error("Product not found")
            setSelectedProduct(null)
        }
    }

    // Products relevant to retailer: those at_retailer, delivered, or verified
    const inventory = products.filter(p =>
        ['at_retailer', 'delivered', 'verified'].includes(p.currentStatus)
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Retailer Dashboard</h1>
                <p className="text-gray-600 mt-1">Verify and manage product inventory</p>
                <div className="mt-2">
                    <Button
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        onClick={handleConnectWallet}
                    >
                        <Wallet className="h-4 w-4 mr-2" />
                        {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "Connect Wallet"}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Inventory
                        </CardTitle>
                        <Package className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventory.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Products in stock</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Verified
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {inventory.filter(p => p.currentStatus === 'verified').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Authenticated</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pending
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {inventory.filter(p => p.currentStatus !== 'verified').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Quality Score
                        </CardTitle>
                        <Store className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">96%</div>
                        <p className="text-xs text-gray-500 mt-1">Average quality</p>
                    </CardContent>
                </Card>
            </div>

            {/* Product Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Verify Product</CardTitle>
                        <CardDescription>Check product authenticity from blockchain</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Product ID (e.g., FSC-001)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                                Search
                            </Button>
                        </div>

                        {selectedProduct && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                                        <p className="text-sm text-gray-600">{selectedProduct.productId}</p>
                                    </div>
                                    <Badge variant={selectedProduct.currentStatus === 'verified' ? 'default' : 'secondary'}>
                                        {selectedProduct.currentStatus}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-medium">{selectedProduct.quantity?.value} {selectedProduct.quantity?.unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-medium">{selectedProduct.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Blockchain Status:</span>
                                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4" />
                                            {selectedProduct.blockchainHashes?.length > 0 ? 'Valid' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {selectedProduct.currentStatus !== 'verified' && (
                                    <div className="mt-4 space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Verification Notes</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Add any observations or notes..."
                                                value={verificationNotes}
                                                onChange={(e) => setVerificationNotes(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleVerify}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                                            disabled={verifying}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {verifying ? "Verifying..." : "Verify & Add to Blockchain"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Inventory List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Inventory</CardTitle>
                        <CardDescription>Products received at your store</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading inventory...</div>
                        ) : inventory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No products in inventory</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {inventory.map((product) => (
                                    <div
                                        key={product.productId}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedProduct(product)
                                            setSearchId(product.productId)
                                        }}
                                    >
                                        <div>
                                            <h4 className="font-medium">{product.name}</h4>
                                            <p className="text-sm text-gray-600">{product.quantity?.value} {product.quantity?.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={product.currentStatus === 'verified' ? 'default' : 'secondary'}
                                                className={product.currentStatus === 'verified' ? 'bg-emerald-600' : 'bg-orange-500'}
                                            >
                                                {product.currentStatus === 'verified' ? (
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                )}
                                                {product.currentStatus}
                                            </Badge>
                                            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
