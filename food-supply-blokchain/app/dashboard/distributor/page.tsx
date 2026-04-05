"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, MapPin, Thermometer, Wallet } from "lucide-react"
import { toast } from "sonner"
import { connectWallet, updateStateOnBlockchain } from "@/lib/blockchain"

export default function SupplierDashboard() {
    const [selectedProduct, setSelectedProduct] = useState("")
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [transportData, setTransportData] = useState({
        location: "",
        temperature: "",
        condition: "",
        status: "in_transit"
    })
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
            const res = await fetch("http://localhost:5001/api/products")
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProduct) {
            toast.error("Please select a product")
            return
        }

        setSubmitting(true)
        try {
            if (!walletAddress || !signer) {
                toast.error("Please connect your wallet first")
                setSubmitting(false)
                return
            }

            // Map status to enum
            let stateEnum = 1 // InTransit
            if (transportData.status === 'at_warehouse') stateEnum = 2
            if (transportData.status === 'at_retailer') stateEnum = 3
            if (transportData.status === 'delivered') stateEnum = 3 // Delivered usually means at retailer

            // 1. Update on Blockchain
            toast.info("Please sign the update in MetaMask...")
            let transactionHash = ""
            let blockNumber = 0

            try {
                // updateState(productId, newState, location, action)
                // Action can be generic "Transport Update" or status
                const tx = await updateStateOnBlockchain(signer, selectedProduct, stateEnum, transportData.location, `Update: ${transportData.status}`)
                toast.info("Transaction sent... waiting...")
                const receipt = await tx.wait()
                transactionHash = receipt.hash
                blockNumber = receipt.blockNumber
                toast.success("Blockchain update confirmed!")
            } catch (err: any) {
                console.error("Blockchain error:", err)
                toast.error("Blockchain update failed: " + (err.message || "Unknown error"))
                setSubmitting(false)
                return
            }

            // 2. Update Backend
            const body = {
                status: transportData.status,
                location: transportData.location,
                temperature: parseFloat(transportData.temperature),
                condition: transportData.condition,
                updatedBy: {
                    name: user?.name || "Unknown Driver",
                    userId: user?.id, // Optional depending on schema
                    role: user?.role || "distributor"
                },
                transactionHash,
                blockNumber
            }

            const res = await fetch(`http://localhost:5001/api/products/${selectedProduct}/transport`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Transport status updated successfully")
                // Refresh products
                fetchProducts()
                // Reset form
                setTransportData({
                    location: "",
                    temperature: "",
                    condition: "",
                    status: "in_transit"
                })
                setSelectedProduct("")
            } else {
                toast.error(data.message || "Update failed")
            }
        } catch (error) {
            console.error("Error updating transport:", error)
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    // Filter products that are relevant for a supplier (e.g. not delivered yet, or just all active ones)
    // For now, listing all non-delivered products as potential candidates for transport updates
    const activeProducts = products.filter(p => p.currentStatus !== 'delivered' && p.currentStatus !== 'verified')
    const inTransitProducts = products.filter(p => p.currentStatus === 'in_transit')

    // Calculated stats
    const avgTemp = inTransitProducts.reduce((acc, curr) => {
        // Get last transport history entry's temp
        const lastUpdate = curr.transportHistory && curr.transportHistory.length > 0
            ? curr.transportHistory[curr.transportHistory.length - 1]
            : null
        return acc + (lastUpdate?.temperature || 0)
    }, 0) / (inTransitProducts.length || 1)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
                <p className="text-gray-600 mt-1">Track and update transport status</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            In Transit
                        </CardTitle>
                        <Truck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inTransitProducts.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Active deliveries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Completed
                        </CardTitle>
                        <MapPin className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {products.filter(p => p.currentStatus === 'delivered' || p.currentStatus === 'verified').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total delivered</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Avg. Temperature
                        </CardTitle>
                        <Thermometer className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgTemp.toFixed(1)}°C</div>
                        <p className="text-xs text-gray-500 mt-1">Active deliveries</p>
                    </CardContent>
                </Card>
            </div>

            {/* Update Transport Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Update Transport Status</CardTitle>
                    <CardDescription>Add location and condition updates to blockchain</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="product">Select Product</Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeProducts.map(product => (
                                        <SelectItem key={product.productId} value={product.productId}>
                                            {product.name} ({product.productId})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Current Location</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Highway NH-44, Near Panipat"
                                    value={transportData.location}
                                    onChange={(e) => setTransportData({ ...transportData, location: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="temperature">Temperature (°C)</Label>
                                <Input
                                    id="temperature"
                                    type="number"
                                    placeholder="e.g., 4"
                                    value={transportData.temperature}
                                    onChange={(e) => setTransportData({ ...transportData, temperature: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={transportData.status}
                                    onValueChange={(value) => setTransportData({ ...transportData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in_transit">In Transit</SelectItem>
                                        <SelectItem value="at_warehouse">At Warehouse</SelectItem>
                                        <SelectItem value="at_retailer">At Retailer</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Select
                                    value={transportData.condition}
                                    onValueChange={(value) => setTransportData({ ...transportData, condition: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="excellent">Excellent</SelectItem>
                                        <SelectItem value="good">Good</SelectItem>
                                        <SelectItem value="fair">Fair</SelectItem>
                                        <SelectItem value="poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                            <Truck className="h-4 w-4 mr-2" />
                            {submitting ? "Updating..." : "Update on Blockchain"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Products in Transit */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Deliveries</CardTitle>
                    <CardDescription>Products currently in your care</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading products...</div>
                    ) : inTransitProducts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No products in transit</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {inTransitProducts.map((product) => {
                                const lastStatus = product.transportHistory?.[product.transportHistory.length - 1]
                                return (
                                    <div
                                        key={product.productId}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 rounded-lg">
                                                <Truck className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{product.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    <MapPin className="inline h-3 w-3 mr-1" />
                                                    {lastStatus ? `${lastStatus.location}` : 'Just Registered'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{product.productId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 text-orange-600">
                                                <Thermometer className="h-4 w-4" />
                                                <span className="font-semibold">{lastStatus?.temperature || '--'}°C</span>
                                            </div>
                                            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 mt-2">
                                                In Transit
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
