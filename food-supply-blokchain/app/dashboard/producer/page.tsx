"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    Plus,
    TrendingUp,
    QrCode,
    Download,
    X,
    CheckCircle,
    Copy,
    Shield,
    Leaf,
    MapPin,
    Calendar
} from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import { connectWallet, createProductOnBlockchain, ProductData } from "@/lib/blockchain"
import { Wallet } from "lucide-react"

interface Product {
    _id: string
    productId: string
    name: string
    category: string
    origin: {
        location: string
        farmName: string
    }
    producer: {
        userId?: string
        name: string
        contact?: string
    }
    productionDate: string
    quantity: {
        value: number
        unit: string
    }
    currentStatus: string
    blockchainHashes: Array<{
        blockIndex: number
        hash: string
        action: string
        timestamp: string
    }>
    createdAt: string
}

export default function ProducerDashboard() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [newlyRegisteredProduct, setNewlyRegisteredProduct] = useState<Product | null>(null)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [signer, setSigner] = useState<any>(null)
    const qrRef = useRef<HTMLDivElement>(null)

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        location: "",
        farmName: "",
        quantity: "",
        unit: "kg",
        price: "",
        expiryDate: ""
    })

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            if (!user) {
                toast.error("You must be logged in to register products")
                return
            }

            if (!walletAddress || !signer) {
                toast.error("Please connect your wallet first to register on blockchain")
                return
            }

            const productionDateTs = Math.floor(Date.now() / 1000)
            // Generate a unique ID that we will use for both Blockchain and Backend
            const generatedProductId = `FSC-${Date.now()}-${Math.floor(Math.random() * 10000)}`

            // 1. Register on Blockchain
            toast.info("Please sign the transaction in MetaMask...")

            const productDataForChain: ProductData = {
                productId: generatedProductId,
                name: formData.name,
                category: formData.category,
                originLocation: `${formData.farmName}, ${formData.location}`,
                producerName: user.name,
                quantity: parseFloat(formData.quantity),
                quantityUnit: formData.unit,
                productionDate: productionDateTs
            }

            let transactionHash = ""
            let blockNumber = 0

            try {
                const tx = await createProductOnBlockchain(signer, productDataForChain)
                toast.info("Transaction sent! Waiting for confirmation...")
                const receipt = await tx.wait()
                transactionHash = receipt.hash
                blockNumber = receipt.blockNumber
                toast.success("Blockchain transaction confirmed!")
            } catch (err: any) {
                console.error("Blockchain error:", err)
                toast.error("Blockchain transaction failed: " + (err.message || "Unknown error"))
                setSubmitting(false)
                return
            }

            // 2. Register in Backend
            const productData = {
                productId: generatedProductId, // Send the ID we generated
                name: formData.name,
                category: formData.category,
                origin: {
                    location: formData.location,
                    farmName: formData.farmName
                },
                producer: {
                    name: user.name,
                    contact: user.email,
                    userId: user.id
                },
                quantity: {
                    value: parseFloat(formData.quantity),
                    unit: formData.unit
                },
                productionDate: new Date().toISOString(),
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
                price: formData.price,
                transactionHash,
                blockNumber
            }

            const res = await fetch("https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/products/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Product registered successfully on blockchain & backend!")
                setProducts([data.product, ...products])
                setNewlyRegisteredProduct(data.product)
                setSelectedProduct(data.product)
                setShowQRModal(true)

                // Reset form
                setFormData({
                    name: "",
                    category: "",
                    location: "",
                    farmName: "",
                    quantity: "",
                    unit: "kg",
                    price: "",
                    expiryDate: ""
                })
            } else {
                toast.error(data.message || "Failed to register product")
            }
        } catch (error) {
            console.error("Error registering product:", error)
            toast.error("An error occurred while registering the product")
        } finally {
            setSubmitting(false)
        }
    }

    const generateQRData = (product: Product) => {
        // Create QR data that the consumer can scan
        return JSON.stringify({
            productId: product.productId,
            name: product.name,
            producer: product.producer?.name,
            origin: product.origin?.location,
            productionDate: product.productionDate,
            verifyUrl: `http://localhost:3000/dashboard/consumer?id=${product.productId}`
        })
    }

    const downloadQRCode = () => {
        if (!selectedProduct) return

        const svg = qrRef.current?.querySelector('svg')
        if (!svg) return

        // Create canvas and draw SVG
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()

        img.onload = () => {
            canvas.width = 400
            canvas.height = 500

            if (ctx) {
                // White background
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw QR code centered
                ctx.drawImage(img, 50, 50, 300, 300)

                // Add product info text
                ctx.fillStyle = '#1f2937'
                ctx.font = 'bold 16px Arial'
                ctx.textAlign = 'center'
                ctx.fillText(selectedProduct.name, canvas.width / 2, 380)

                ctx.font = '12px Arial'
                ctx.fillStyle = '#6b7280'
                ctx.fillText(selectedProduct.productId, canvas.width / 2, 405)
                ctx.fillText(`Producer: ${selectedProduct.producer?.name}`, canvas.width / 2, 425)
                ctx.fillText(`Origin: ${selectedProduct.origin?.location}`, canvas.width / 2, 445)
                ctx.fillText('Scan to verify on FoodTrace Blockchain', canvas.width / 2, 475)

                // Download
                const link = document.createElement('a')
                link.download = `QR-${selectedProduct.productId}.png`
                link.href = canvas.toDataURL('image/png')
                link.click()

                toast.success('QR Code downloaded successfully!')
            }
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }

    const copyProductId = (productId: string) => {
        navigator.clipboard.writeText(productId)
        toast.success('Product ID copied to clipboard!')
    }

    const openQRModal = (product: Product) => {
        setSelectedProduct(product)
        setNewlyRegisteredProduct(null)
        setShowQRModal(true)
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'fruits':
            case 'vegetables':
                return '🥬'
            case 'dairy':
                return '🥛'
            case 'meat':
                return '🥩'
            case 'grains':
                return '🌾'
            case 'seafood':
                return '🐟'
            case 'beverages':
                return '🥤'
            default:
                return '📦'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'registered':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'in_transit':
                return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'at_warehouse':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'at_retailer':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200'
            case 'delivered':
                return 'bg-teal-100 text-teal-700 border-teal-200'
            case 'verified':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Producer Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Register and manage your food products on the blockchain</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 w-fit cursor-pointer hover:bg-emerald-200" onClick={handleConnectWallet}>
                    {walletAddress ? (
                        <>
                            <Wallet className="h-3 w-3 mr-1" />
                            {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                        </>
                    ) : (
                        <>
                            <Leaf className="h-3 w-3 mr-1" />
                            Connect Wallet
                        </>
                    )}
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700">
                            Total Products
                        </CardTitle>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Package className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-800">{products.length}</div>
                        <p className="text-xs text-emerald-600 mt-1">Registered on blockchain</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">
                            In Transit
                        </CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">
                            {products.filter(p => p.currentStatus !== 'registered').length}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Currently being delivered</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">
                            Active Today
                        </CardTitle>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Plus className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-800">
                            {products.filter(p => {
                                const today = new Date().toDateString()
                                return new Date(p.createdAt || p.productionDate).toDateString() === today
                            }).length}
                        </div>
                        <p className="text-xs text-purple-600 mt-1">Registered today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Registration Form */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Plus className="h-5 w-5 text-emerald-600" />
                        </div>
                        Register New Product
                    </CardTitle>
                    <CardDescription>Add a new food item to the blockchain and generate a QR code for tracking</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Organic Apples"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="border-gray-200 focus:border-emerald-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    required
                                >
                                    <SelectTrigger className="border-gray-200">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fruits">🍎 Fruits</SelectItem>
                                        <SelectItem value="vegetables">🥬 Vegetables</SelectItem>
                                        <SelectItem value="dairy">🥛 Dairy</SelectItem>
                                        <SelectItem value="meat">🥩 Meat</SelectItem>
                                        <SelectItem value="grains">🌾 Grains</SelectItem>
                                        <SelectItem value="seafood">🐟 Seafood</SelectItem>
                                        <SelectItem value="beverages">🥤 Beverages</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="farmName">Farm Name</Label>
                                <Input
                                    id="farmName"
                                    placeholder="e.g., Green Valley Orchards"
                                    value={formData.farmName}
                                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                                    required
                                    className="border-gray-200 focus:border-emerald-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Kashmir Valley"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                    className="border-gray-200 focus:border-emerald-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder="e.g., 500"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                    className="border-gray-200 focus:border-emerald-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Select
                                    value={formData.unit}
                                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                                >
                                    <SelectTrigger className="border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                        <SelectItem value="liters">Liters</SelectItem>
                                        <SelectItem value="pieces">Pieces</SelectItem>
                                        <SelectItem value="tons">Tons</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    required
                                    className="border-gray-200 focus:border-emerald-400"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Registering on Blockchain...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Register on Blockchain & Generate QR
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Products List */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        Registered Products
                    </CardTitle>
                    <CardDescription>Your products on the blockchain - click to view QR code</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto mb-2" />
                            <p className="text-gray-500">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No products registered yet</p>
                            <p className="text-sm">Use the form above to register your first product</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {products.map((product) => (
                                <div
                                    key={product.productId || product._id}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer group"
                                    onClick={() => openQRModal(product)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">{getCategoryIcon(product.category)}</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {product.origin?.farmName} • {product.origin?.location}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {product.quantity?.value} {product.quantity?.unit} • {product.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <Badge className={`${getStatusColor(product.currentStatus)} border`}>
                                                {product.currentStatus.replace('_', ' ')}
                                            </Badge>
                                            <p className="text-xs text-gray-500 mt-2 font-mono">{product.productId}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openQRModal(product)
                                            }}
                                        >
                                            <QrCode className="h-4 w-4 mr-1" />
                                            QR Code
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* QR Code Modal */}
            {showQRModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
                        {newlyRegisteredProduct && (
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-semibold">Product Registered Successfully!</span>
                                </div>
                                <p className="text-emerald-100 text-sm mt-1">
                                    Your product has been added to the blockchain. Print or save the QR code below.
                                </p>
                            </div>
                        )}
                        <CardHeader className={newlyRegisteredProduct ? '' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'}>
                            <div className="flex items-center justify-between">
                                <CardTitle className={newlyRegisteredProduct ? 'text-gray-900' : 'text-white'}>
                                    <div className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5" />
                                        Product QR Code
                                    </div>
                                </CardTitle>
                                <Button
                                    onClick={() => setShowQRModal(false)}
                                    variant="ghost"
                                    size="sm"
                                    className={newlyRegisteredProduct ? '' : 'text-white hover:bg-white/20'}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <CardDescription className={newlyRegisteredProduct ? '' : 'text-emerald-100'}>
                                Consumers can scan this to verify the product
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {/* QR Code Display */}
                            <div
                                ref={qrRef}
                                className="flex flex-col items-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl"
                            >
                                <QRCodeSVG
                                    value={generateQRData(selectedProduct)}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    bgColor="#ffffff"
                                    fgColor="#059669"
                                />
                                <div className="text-center mt-4">
                                    <h3 className="font-bold text-lg text-gray-900">{selectedProduct.name}</h3>
                                    <p className="text-sm text-gray-500 font-mono mt-1">{selectedProduct.productId}</p>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Producer:</span>
                                    <span className="font-medium">{selectedProduct.producer?.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Origin:</span>
                                    <span className="font-medium">{selectedProduct.origin?.location}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="font-medium">{selectedProduct.quantity?.value} {selectedProduct.quantity?.unit}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Production Date:</span>
                                    <span className="font-medium">{new Date(selectedProduct.productionDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-3">
                                <Button
                                    onClick={downloadQRCode}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download QR Code
                                </Button>
                                <Button
                                    onClick={() => copyProductId(selectedProduct.productId)}
                                    variant="outline"
                                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Blockchain Info */}
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-700 text-sm">
                                    <Shield className="h-4 w-4" />
                                    <span className="font-medium">Secured on Blockchain</span>
                                </div>
                                <p className="text-xs text-emerald-600 mt-1">
                                    {selectedProduct.blockchainHashes?.length || 1} block(s) recorded
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
