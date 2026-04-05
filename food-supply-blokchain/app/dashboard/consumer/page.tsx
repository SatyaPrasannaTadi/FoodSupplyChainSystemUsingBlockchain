"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    QrCode,
    Search,
    MapPin,
    User,
    Calendar,
    Shield,
    ChevronRight,
    X,
    Camera,
    Thermometer,
    Package,
    CheckCircle,
    Clock,
    Truck,
    Store,
    Leaf,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { Scanner } from "@yudiel/react-qr-scanner"

interface Product {
    _id: string
    productId: string
    name: string
    category: string
    origin: {
        location: string
        farmName: string
        coordinates?: {
            lat: number
            lng: number
        }
    }
    producer: {
        userId?: string
        name: string
        contact?: string
    }
    productionDate: string
    expiryDate?: string
    quantity: {
        value: number
        unit: string
    }
    currentStatus: string
    transportHistory: Array<{
        status: string
        location: string
        temperature: number
        condition: string
        timestamp: string
        updatedBy: {
            userId?: string
            name: string
        }
        blockchainBlockIndex: number
    }>
    verificationHistory: Array<{
        verifiedBy: {
            userId?: string
            name: string
            role: string
        }
        timestamp: string
        status: string
        notes: string
        blockchainBlockIndex: number
    }>
    blockchainHashes: Array<{
        blockIndex: number
        hash: string
        action: string
        timestamp: string
    }>
    metadata?: {
        certifications?: string[]
        qualityGrade?: string
        description?: string
    }
    createdAt: string
}

interface JourneyStep {
    stage: string
    actor: string
    location: string
    date: string
    status: string
    icon: React.ReactNode
    details?: {
        temperature?: number
        condition?: string
        notes?: string
    }
}

export default function ConsumerDashboard() {
    const searchParams = useSearchParams()
    const [productId, setProductId] = useState("")
    const [productData, setProductData] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [journey, setJourney] = useState<JourneyStep[]>([])
    const [showScanner, setShowScanner] = useState(false)
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [isBlockchainValid, setIsBlockchainValid] = useState(true)
    const [initialLoad, setInitialLoad] = useState(true)

    // Fetch all products for search functionality
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const res = await fetch("https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/products")
                const data = await res.json()
                if (data.success) {
                    setAllProducts(data.products)
                }
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchAllProducts()
    }, [])

    // Handle URL query parameter for auto-search
    useEffect(() => {
        if (initialLoad) {
            const idFromUrl = searchParams.get('id')
            if (idFromUrl) {
                setProductId(idFromUrl)
                // Trigger search after setting the ID
                setTimeout(() => {
                    handleSearchById(idFromUrl)
                }, 100)
            }
            setInitialLoad(false)
        }
    }, [searchParams, initialLoad])

    // Map product history to journey steps for timeline display
    const mapHistoryToJourney = (product: Product): JourneyStep[] => {
        const journeySteps: JourneyStep[] = []

        // 1. Production
        journeySteps.push({
            stage: "Production",
            actor: product.producer?.name || "Producer",
            location: product.origin?.location || "Origin",
            date: product.productionDate || product.createdAt,
            status: "Product registered on blockchain",
            icon: <Leaf className="h-5 w-5" />,
            details: {
                notes: product.expiryDate ? `Expires on: ${new Date(product.expiryDate).toLocaleDateString()}` : undefined
            }
        })

        // 2. Transport updates
        if (product.transportHistory && product.transportHistory.length > 0) {
            product.transportHistory.forEach((item) => {
                journeySteps.push({
                    stage: "In Transit",
                    actor: item.updatedBy?.name || "Distributor",
                    location: item.location,
                    date: item.timestamp,
                    status: `Status: ${item.status}`,
                    icon: <Truck className="h-5 w-5" />,
                    details: {
                        temperature: item.temperature,
                        condition: item.condition
                    }
                })
            })
        }

        // 3. Verification
        if (product.verificationHistory && product.verificationHistory.length > 0) {
            product.verificationHistory.forEach((item) => {
                journeySteps.push({
                    stage: "Retail Verification",
                    actor: item.verifiedBy?.name || "Retailer",
                    location: "Retail Store",
                    date: item.timestamp,
                    status: `Verified by ${item.verifiedBy?.role || 'retailer'}`,
                    icon: <Store className="h-5 w-5" />,
                    details: {
                        notes: item.notes
                    }
                })
            })
        }

        // Sort by date
        return journeySteps.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    // Direct search function for URL parameters
    const handleSearchById = async (id: string) => {
        if (!id) return
        setLoading(true)
        setShowDropdown(false)
        try {
            const res = await fetch(`https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/products/${id}`)
            const data = await res.json()

            if (data.success) {
                setProductData(data.product)
                setIsBlockchainValid(data.isBlockchainValid)
                const history = mapHistoryToJourney(data.product)
                setJourney(history)
                toast.success(`Product "${data.product.name}" found!`)
            } else {
                toast.error("Product not found")
                setProductData(null)
                setJourney([])
            }
        } catch (error) {
            console.error("Error fetching product:", error)
            toast.error("Error fetching product. Make sure the backend is running.")
        } finally {
            setLoading(false)
        }
    }

    // Filter products based on search input
    useEffect(() => {
        if (productId.length > 0) {
            const filtered = allProducts.filter(p =>
                p.productId.toLowerCase().includes(productId.toLowerCase()) ||
                p.name.toLowerCase().includes(productId.toLowerCase())
            )
            setSearchResults(filtered.slice(0, 5))
            setShowDropdown(true)
        } else {
            setSearchResults([])
            setShowDropdown(false)
        }
    }, [productId, allProducts])

    const handleSearch = useCallback(async (id?: string) => {
        const searchId = id || productId
        if (!searchId) return

        setLoading(true)
        setShowDropdown(false)
        try {
            const res = await fetch(`https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/products/${searchId}`)
            const data = await res.json()

            if (data.success) {
                setProductData(data.product)
                setIsBlockchainValid(data.isBlockchainValid)
                const history = mapHistoryToJourney(data.product)
                setJourney(history)
                toast.success(`Product "${data.product.name}" found!`)
            } else {
                toast.error("Product not found")
                setProductData(null)
                setJourney([])
            }
        } catch (error) {
            console.error("Error fetching product:", error)
            toast.error("Error fetching product. Make sure the backend is running.")
        } finally {
            setLoading(false)
        }
    }, [productId])



    const handleQrScan = (result: any) => {
        if (result && result.length > 0) {
            const scannedData = result[0].rawValue

            // Try to parse as JSON first (for QR codes containing JSON data)
            try {
                const parsed = JSON.parse(scannedData)
                if (parsed.productId) {
                    setProductId(parsed.productId)
                    setShowScanner(false)
                    toast.success("QR Code scanned successfully!")
                    handleSearch(parsed.productId)
                    return
                }
            } catch {
                // Not JSON, treat as plain product ID
            }

            // Check if it's a direct product ID
            if (scannedData.startsWith("FSC-") || scannedData.includes("FSC-")) {
                const extractedId = scannedData.match(/FSC-[A-Z0-9-]+/)?.[0] || scannedData
                setProductId(extractedId)
                setShowScanner(false)
                toast.success("QR Code scanned successfully!")
                handleSearch(extractedId)
            } else {
                setProductId(scannedData)
                setShowScanner(false)
                toast.info("QR Code scanned - searching...")
                handleSearch(scannedData)
            }
        }
    }

    const selectProduct = (product: Product) => {
        setProductId(product.productId)
        setShowDropdown(false)
        handleSearch(product.productId)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'registered':
                return 'bg-blue-500'
            case 'in_transit':
                return 'bg-amber-500'
            case 'at_warehouse':
                return 'bg-purple-500'
            case 'at_retailer':
                return 'bg-indigo-500'
            case 'delivered':
                return 'bg-teal-500'
            case 'verified':
                return 'bg-emerald-500'
            default:
                return 'bg-gray-500'
        }
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Consumer Portal
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Verify product authenticity and trace the complete journey from farm to table
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Blockchain Protected
                    </Badge>
                </div>
            </div>

            {/* Search Card */}
            <Card className="border-2 border-emerald-100 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-50" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-emerald-600" />
                        Verify Your Product
                    </CardTitle>
                    <CardDescription>
                        Scan a QR code or enter the Product ID to view the complete supply chain history
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <div className="relative flex-1">
                                <Select
                                    value={productId}
                                    onValueChange={(value) => {
                                        setProductId(value)
                                        handleSearch(value)
                                    }}
                                >
                                    <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-400 bg-white">
                                        <SelectValue placeholder="Select a product to view journey" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {allProducts.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                No products found. Register some first!
                                            </div>
                                        ) : (
                                            allProducts.map((product) => (
                                                <SelectItem key={product.productId} value={product.productId} className="py-3">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <span className="text-xl">{getCategoryIcon(product.category)}</span>
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium text-gray-900">{product.name}</span>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span>{product.productId}</span>
                                                                <Badge variant="outline" className={`${getStatusColor(product.currentStatus)} text-white border-0 px-1.5 py-0 h-5`}>
                                                                    {product.currentStatus.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowScanner(true)}
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md"
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            Scan QR Code
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* QR Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    <CardTitle className="text-white">Scan QR Code</CardTitle>
                                </div>
                                <Button
                                    onClick={() => setShowScanner(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <CardDescription className="text-emerald-100">
                                Point your camera at the QR code on the product packaging
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative aspect-square bg-black">
                                <Scanner
                                    onScan={handleQrScan}
                                    onError={(error) => {
                                        console.error("Scanner error:", error)
                                        toast.error("Camera access error. Please allow camera permissions.")
                                    }}
                                    constraints={{
                                        facingMode: "environment"
                                    }}
                                    styles={{
                                        container: {
                                            width: '100%',
                                            height: '100%'
                                        }
                                    }}
                                />
                                {/* Scanner overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl animate-pulse shadow-lg shadow-emerald-500/30" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 text-center">
                                <p className="text-sm text-gray-600">
                                    Make sure the QR code is well-lit and within the frame
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Product Details */}
            {productData && (
                <>
                    {/* Product Info Card */}
                    <Card className="overflow-hidden shadow-lg border-0">
                        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-4xl">{getCategoryIcon(productData.category)}</span>
                                        <div>
                                            <h2 className="text-2xl font-bold">{productData.name}</h2>
                                            <p className="text-emerald-100 font-mono text-sm">
                                                {productData.productId}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={`${getStatusColor(productData.currentStatus)} text-white border-0 text-sm px-3 py-1`}>
                                        {productData.currentStatus.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {isBlockchainValid ? (
                                        <Badge className="bg-white/20 text-white border border-white/30 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Blockchain Verified
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-500/20 text-white border border-red-300 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Verification Failed
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                        <User className="h-4 w-4" />
                                        <p className="text-sm font-medium">Producer</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{productData.producer?.name}</p>
                                    <p className="text-sm text-gray-500">{productData.origin?.farmName}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <MapPin className="h-4 w-4" />
                                        <p className="text-sm font-medium">Origin</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{productData.origin?.location}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                                        <Package className="h-4 w-4" />
                                        <p className="text-sm font-medium">Quantity</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {productData.quantity?.value} {productData.quantity?.unit}
                                    </p>
                                    <p className="text-sm text-gray-500 capitalize">{productData.category}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                        <Calendar className="h-4 w-4" />
                                        <p className="text-xs font-medium">Production Date</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(productData.productionDate).toLocaleDateString()}
                                    </p>
                                </div>
                                {productData.expiryDate && (
                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                        <div className="flex items-center gap-2 text-orange-600 mb-1">
                                            <Clock className="h-4 w-4" />
                                            <p className="text-xs font-medium">Expiry Date</p>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(productData.expiryDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                        <Shield className="h-4 w-4" />
                                        <p className="text-xs font-medium">Blockchain Records</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {productData.blockchainHashes?.length || 0} Blocks
                                    </p>
                                </div>
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                                    <div className="flex items-center gap-2 text-teal-600 mb-1">
                                        <Truck className="h-4 w-4" />
                                        <p className="text-xs font-medium">Transport Updates</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {productData.transportHistory?.length || 0} Updates
                                    </p>
                                </div>
                            </div>

                            {/* Certifications & Quality */}
                            {productData.metadata && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                                    <h4 className="font-semibold text-amber-800 mb-2">Quality Information</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {productData.metadata.qualityGrade && (
                                            <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                                                Grade: {productData.metadata.qualityGrade}
                                            </Badge>
                                        )}
                                        {productData.metadata.certifications?.map((cert, idx) => (
                                            <Badge key={idx} className="bg-green-100 text-green-700 border border-green-200">
                                                {cert}
                                            </Badge>
                                        ))}
                                    </div>
                                    {productData.metadata.description && (
                                        <p className="text-sm text-gray-600 mt-2">{productData.metadata.description}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Product Journey Timeline */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle>Supply Chain Journey</CardTitle>
                                    <CardDescription>Complete blockchain-verified history from farm to table</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="relative">
                                {journey.map((stage, index) => (
                                    <div key={index} className="relative pb-8 last:pb-0">
                                        {/* Vertical Line */}
                                        {index !== journey.length - 1 && (
                                            <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 to-emerald-100" />
                                        )}
                                        <div className="flex gap-4">
                                            {/* Icon Circle */}
                                            <div className="relative z-10">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${index === journey.length - 1
                                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                                    : 'bg-white border-2 border-emerald-300 text-emerald-600'
                                                    }`}>
                                                    {stage.icon}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-200">
                                                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                                                        <div>
                                                            <h3 className="font-semibold text-lg text-gray-900">{stage.stage}</h3>
                                                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                                <User className="h-3 w-3" />
                                                                {stage.actor}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="bg-gray-50">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(stage.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-gray-700 mb-2">{stage.status}</p>

                                                    {/* Additional Details */}
                                                    {stage.details && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {stage.details.temperature !== undefined && (
                                                                <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                                                                    <Thermometer className="h-3 w-3 mr-1" />
                                                                    {stage.details.temperature}°C
                                                                </Badge>
                                                            )}
                                                            {stage.details.condition && (
                                                                <Badge className="bg-green-50 text-green-700 border border-green-200">
                                                                    {stage.details.condition}
                                                                </Badge>
                                                            )}
                                                            {stage.details.notes && (
                                                                <p className="text-xs text-gray-500 italic w-full mt-1">
                                                                    Note: {stage.details.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-3 pt-2 border-t border-gray-100">
                                                        <MapPin className="h-3 w-3" />
                                                        {stage.location}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Blockchain Verification Footer */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-full">
                                        <Shield className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-emerald-800 block">Blockchain Verified</span>
                                        <p className="text-sm text-emerald-600">
                                            All {productData.blockchainHashes?.length || 0} records have been verified on the blockchain and cannot be tampered with.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Instructions - Only show when no product is selected */}
            {!productData && !loading && (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <QrCode className="h-5 w-5 text-emerald-600" />
                            </div>
                            How to Verify Your Product
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                                    1
                                </div>
                                <h4 className="font-semibold mb-2">Find the QR Code</h4>
                                <p className="text-sm text-gray-600">
                                    Look for the QR code on your product packaging
                                </p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                                    2
                                </div>
                                <h4 className="font-semibold mb-2">Scan or Enter ID</h4>
                                <p className="text-sm text-gray-600">
                                    Click "Scan QR Code" or manually enter the Product ID
                                </p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                                    3
                                </div>
                                <h4 className="font-semibold mb-2">View Journey</h4>
                                <p className="text-sm text-gray-600">
                                    See the complete blockchain-verified journey from farm to table
                                </p>
                            </div>
                        </div>

                        {/* Quick Access to Products */}
                        {allProducts.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                                <h4 className="font-semibold text-gray-700 mb-4">Or select a product to explore:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {allProducts.slice(0, 6).map((product) => (
                                        <button
                                            key={product.productId}
                                            onClick={() => selectProduct(product)}
                                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-left"
                                        >
                                            <span className="text-2xl">{getCategoryIcon(product.category)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.producer?.name}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
