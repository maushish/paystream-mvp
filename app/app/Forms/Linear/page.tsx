"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet, ChevronDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import "@solana/wallet-adapter-react-ui/styles.css";

// Define the type for chart data
type ChartData = {
  second: number;
  percentage: number;
}

type Stream = {
  id: string;
  amount: number;
  duration: number;
  claimed: number;
}

export default function StreamManagement() {
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [streams, setStreams] = useState<Stream[]>([
    { id: "stream1", amount: 100, duration: 3600, claimed: 0 },
    { id: "stream2", amount: 200, duration: 7200, claimed: 50 },
  ])

  // Set up Solana connection and wallet network
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  useEffect(() => {
    const parsedDuration = Number(duration);
    const parsedAmount = Number(amount);

    if (duration && amount && !isNaN(parsedDuration) && !isNaN(parsedAmount) && parsedDuration > 0 && parsedAmount > 0) {
      const seconds = parseInt(duration, 10);
      const amountPerSecond = parsedAmount / seconds;
      const newChartData: ChartData[] = [];

      for (let i = 0; i <= seconds; i++) {
        newChartData.push({
          second: i,
          percentage: (i * amountPerSecond / parsedAmount) * 100
        });
      }

      setChartData(newChartData);
    } else {
      setChartData([]);
    }
  }, [duration, amount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!address || !amount || !duration) {
      setError("All fields are required.")
      return
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0.")
      return
    }

    if (parseInt(duration) <= 0) {
      setError("Duration must be greater than 0 seconds.")
      return
    }

    console.log("Form submitted:", { address, amount, duration: `${duration} seconds` })
  }

  const handleClaim = (streamId: string) => {
    console.log(`Claiming stream: ${streamId}`)
    // Implement claim logic here
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className="flex justify-center items-center min-h-screen bg-black text-blue-100 transition-colors duration-200 p-4">
            <div className="flex flex-col w-full max-w-5xl">
              <Card className="bg-gray-900 border-blue-800 rounded-xl shadow-lg mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-blue-300">Stream Management</CardTitle>
                  <WalletMultiButton className="text-white rounded-lg px-4 py-2" />
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="creator" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                      <TabsTrigger value="creator" className="text-blue-300 data-[state=active]:bg-blue-700">Creator</TabsTrigger>
                      <TabsTrigger value="recipient" className="text-blue-300 data-[state=active]:bg-blue-700">Recipient</TabsTrigger>
                    </TabsList>
                    <TabsContent value="creator">
                      <div className="flex flex-col md:flex-row gap-12 w-full">
                        <div className="w-full md:w-2/5">
                          <Card className="bg-gray-800 border-blue-700 rounded-xl shadow-lg">
                            <CardHeader>
                              <CardTitle className="text-blue-300">Linear Stream Graph</CardTitle>
                              <CardDescription className="text-blue-200">Percentage over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[250px]">
                                {chartData.length > 0 ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                      data={chartData} 
                                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                                    >
                                      <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="#1e3a8a" 
                                        opacity={0.4}
                                      />
                                      <XAxis 
                                        dataKey="second" 
                                        type="number"
                                        domain={[0, 'dataMax']}
                                        axisLine={{ stroke: "#3b82f6", strokeWidth: 2 }}
                                        tick={{ fill: "#93c5fd" }}
                                        label={{ value: 'Seconds', position: 'insideBottomRight', offset: -5, fill: '#93c5fd' }}
                                      />
                                      <YAxis 
                                        domain={[0, 100]}
                                        axisLine={{ stroke: "#3b82f6", strokeWidth: 2 }}
                                        tick={{ fill: "#93c5fd" }}
                                        label={{ value: 'Percentage', angle: -90, position: 'insideLeft', offset: 10, fill: '#93c5fd' }}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: "#1e3a8a",
                                          borderColor: "#3b82f6",
                                          borderRadius: "0.5rem",
                                          color: "#bfdbfe"
                                        }}
                                        labelStyle={{ color: "#bfdbfe" }}
                                        itemStyle={{ color: "#bfdbfe" }}
                                        formatter={(value: any) => [`${value.toFixed(2)}%`, 'Percentage']}
                                        labelFormatter={(label) => `Second: ${label}`}
                                      />
                                      <Line 
                                        type="linear"
                                        dataKey="percentage" 
                                        stroke="#60a5fa"
                                        strokeWidth={3}
                                        dot={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-blue-300">
                                    Enter amount and duration to see the graph
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="w-full md:w-3/5">
                          <Card className="bg-gray-800 border-blue-700 rounded-xl shadow-lg">
                            <CardHeader>
                              <CardTitle className="text-blue-300">Stream Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="address" className="text-blue-200">Receiver's Address</Label>
                                  <Input
                                    id="address"
                                    placeholder="Enter receiver's address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="bg-gray-700 border-blue-600 text-blue-100 placeholder-blue-400 focus:border-blue-500 rounded-lg"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="amount" className="text-blue-200">Amount</Label>
                                  <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-gray-700 border-blue-600 text-blue-100 placeholder-blue-400 focus:border-blue-500 rounded-lg"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="duration" className="text-blue-200">Duration (in seconds)</Label>
                                  <Input
                                    id="duration"
                                    type="number"
                                    step="1"
                                    min="0"
                                    placeholder="Enter duration in seconds"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="bg-gray-700 border-blue-600 text-blue-100 placeholder-blue-400 focus:border-blue-500 rounded-lg"
                                  />
                                </div>
                                {error && (
                                  <Alert className="bg-red-700 text-white rounded-lg px-4 py-2">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    <AlertDescription>{error}</AlertDescription>
                                  </Alert>
                                )}
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2">Create Stream</Button>
                              </form>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="recipient">
                      <div className="flex flex-col gap-12 w-full">
                        <Card className="bg-gray-800 border-blue-700 rounded-xl shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-blue-300">My Streams</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {streams.length > 0 ? (
                              <ul className="space-y-4">
                                {streams.map((stream) => (
                                  <li key={stream.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                                    <div>
                                      <h4 className="text-blue-100">Stream ID: {stream.id}</h4>
                                      <p className="text-blue-200">Amount: {stream.amount} SOL</p>
                                      <p className="text-blue-200">Claimed: {stream.claimed} SOL</p>
                                      <p className="text-blue-200">Duration: {stream.duration} seconds</p>
                                    </div>
                                    <Button 
                                      onClick={() => handleClaim(stream.id)}
                                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2"
                                    >
                                      Claim
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-blue-300">No active streams</div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
