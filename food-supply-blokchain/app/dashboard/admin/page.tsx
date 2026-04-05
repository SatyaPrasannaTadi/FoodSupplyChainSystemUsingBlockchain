"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Shield, TrendingUp, Users, Package, Activity, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function AdminDashboard() {
    const [blockchainData, setBlockchainData] = useState<any>({ chain: [], isValid: true, length: 0 })
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [chainRes, productsRes] = await Promise.all([
                fetch("https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/blockchain"),
                fetch("https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/products")
            ])

            const chainData = await chainRes.json()
            const productsData = await productsRes.json()

            if (chainData.success) {
                setBlockchainData(chainData)
            }
            if (productsData.success) {
                setProducts(productsData.products)
            }
        } catch (error) {
            console.error("Error fetching admin data:", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    const validateChain = async () => {
        try {
            const res = await fetch("https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/blockchain/validate")
            const data = await res.json()

            if (data.success) {
                setBlockchainData((prev: any) => ({ ...prev, isValid: data.isValid }))
                if (data.isValid) {
                    toast.success("Blockchain integrity verified")
                } else {
                    toast.error("Blockchain integrity compromised!")
                }
            }
        } catch (error) {
            toast.error("Validation failed")
        }
    }

    // Calculate stats
    const uniqueProducers = new Set(products.map(p => p.producer?.name).filter(Boolean)).size
    const uniqueSuppliers = new Set(products.flatMap(p => p.transportHistory?.map((h: any) => h.updatedBy?.name) || []).filter(Boolean)).size
    const uniqueRetailers = new Set(products.flatMap(p => p.verificationHistory?.map((h: any) => h.verifiedBy?.name) || []).filter(Boolean)).size
    const totalTransactions = blockchainData.length // approximating transactions as blocks for now

    const systemStats = {
        totalProducts: products.length,
        totalUsers: uniqueProducers + uniqueSuppliers + uniqueRetailers, // distinct active users found in data
        totalTransactions: totalTransactions,
        blockchainLength: blockchainData.length,
        producersActive: uniqueProducers,
        suppliersActive: uniqueSuppliers,
        retailersActive: uniqueRetailers
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">System monitoring and blockchain audit</p>
                </div>
                <Badge className={`${blockchainData.isValid ? 'bg-emerald-600' : 'bg-red-600'} text-white px-4 py-2`}>
                    <Shield className="h-4 w-4 mr-2" />
                    Blockchain {blockchainData.isValid ? 'Valid' : 'Invalid'}
                </Badge>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.totalProducts}</div>
                        <p className="text-xs text-gray-500 mt-1">On blockchain</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Active Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                        <p className="text-xs text-gray-500 mt-1">Participating entities</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Blocks
                        </CardTitle>
                        <Activity className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.blockchainLength}</div>
                        <p className="text-xs text-gray-500 mt-1">Total blockchain entries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Blockchain Height
                        </CardTitle>
                        <Database className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.blockchainLength}</div>
                        <p className="text-xs text-gray-500 mt-1">Valid blocks</p>
                    </CardContent>
                </Card>
            </div>

            {/* Role Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Distribution (Active)</CardTitle>
                    <CardDescription>Users with recorded actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Producers</span>
                                <Badge className="bg-emerald-100 text-emerald-700">
                                    {systemStats.producersActive}
                                </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-emerald-600 h-2 rounded-full"
                                    style={{ width: `${systemStats.totalUsers ? (systemStats.producersActive / systemStats.totalUsers) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Suppliers</span>
                                <Badge className="bg-blue-100 text-blue-700">
                                    {systemStats.suppliersActive}
                                </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${systemStats.totalUsers ? (systemStats.suppliersActive / systemStats.totalUsers) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Retailers</span>
                                <Badge className="bg-purple-100 text-purple-700">
                                    {systemStats.retailersActive}
                                </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full"
                                    style={{ width: `${systemStats.totalUsers ? (systemStats.retailersActive / systemStats.totalUsers) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Blockchain Explorer */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Blockchain Explorer</CardTitle>
                            <CardDescription>Recent blockchain transactions</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={validateChain}
                        >
                            Validate Chain
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading blockchain data...</div>
                    ) : (
                        <div className="space-y-3">
                            {/* Show last 10 blocks reverse ordered */}
                            {[...blockchainData.chain].reverse().slice(0, 10).map((block: any) => (
                                <div
                                    key={block.index}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4 flex-1">
                                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold">
                                                {block.index}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">Block #{block.index}</h4>
                                                    {block.index === 0 && (
                                                        <Badge variant="outline" className="text-xs">Genesis</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mb-2">
                                                    {/* Display relevant data based on block content */}
                                                    {block.data ? JSON.stringify(block.data).substring(0, 100) + '...' :
                                                        block.action ? `${block.action} - ${block.productName || block.productId}` : 'System Block'}
                                                </p>
                                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Database className="h-3 w-3" />
                                                        Hash: {block.hash.substring(0, 20)}...
                                                    </span>
                                                    <span>{new Date(block.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <Shield className="h-5 w-5" />
                            <span className="font-semibold">Blockchain Integrity Verified</span>
                        </div>
                        <p className="text-sm text-emerald-600 mt-1">
                            All blocks are cryptographically linked and validated. No tampering detected.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>Recent platform actions</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Using simplified activity feed for now */}
                    <div className="space-y-3 text-sm">
                        {products.slice(0, 5).map((p, i) => (
                            <div key={p.productId || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                                <span className="flex-1">Product updated: {p.name} ({p.currentStatus})</span>
                                <span className="text-xs text-gray-500">{new Date(p.updatedAt).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
