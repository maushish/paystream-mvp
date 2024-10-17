"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"

type ChartData = {
  second: number;
  value: number;
}

export default function CliffStreamUI() {
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [cliffDuration, setCliffDuration] = useState("")
  const [cliffAmount, setCliffAmount] = useState("")
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { connected } = useWallet()

  useEffect(() => {
    const parsedDuration = Number(duration);
    const parsedCliffDuration = Number(cliffDuration);
    const parsedCliffAmount = Number(cliffAmount);
    const parsedAmount = Number(amount);

    if (duration && cliffDuration && cliffAmount && amount &&
        !isNaN(parsedDuration) && !isNaN(parsedCliffDuration) &&
        !isNaN(parsedCliffAmount) && !isNaN(parsedAmount)) {
      const cliffValue = parsedCliffAmount / parsedAmount;
      setChartData([
        { second: 0, value: 0 },
        { second: parsedCliffDuration, value: 0 },
        { second: parsedCliffDuration, value: cliffValue },
        { second: parsedDuration, value: 1 }
      ])
    } else {
      setChartData([])
    }
  }, [duration, cliffDuration, cliffAmount, amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!connected) {
      setError("Please connect your wallet")
      setIsLoading(false)
      return
    }

    if (!address || !amount || !duration || !cliffDuration || !cliffAmount) {
      setError("All fields are required.")
      setIsLoading(false)
      return
    }

    if (parseFloat(amount) <= 0 || parseFloat(cliffAmount) <= 0) {
      setError("Amount and cliff amount must be greater than 0.")
      setIsLoading(false)
      return
    }

    if (parseInt(duration) <= 0 || parseInt(cliffDuration) <= 0) {
      setError("Duration and cliff duration must be greater than 0 seconds.")
      setIsLoading(false)
      return
    }

    if (parseInt(cliffDuration) > parseInt(duration)) {
      setError("Cliff duration cannot be greater than total duration.")
      setIsLoading(false)
      return
    }

    if (parseFloat(cliffAmount) > parseFloat(amount)) {
      setError("Cliff amount cannot be greater than total amount.")
      setIsLoading(false)
      return
    }

    // Simulating a submission process
    setTimeout(() => {
      console.log("Form submitted:", { address, amount, duration, cliffDuration, cliffAmount })
      setIsLoading(false)
      // You can add a success message here if needed
    }, 2000)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950 text-gray-200 p-8">
      <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-2xl w-full max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between bg-blue-900 rounded-t-xl p-6">
          <CardTitle className="text-3xl font-bold text-gray-100">Cliff Stream UI</CardTitle>
          <WalletMultiButton className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200" />
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">Cliff Stream Visualization</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                  <XAxis 
                    dataKey="second" 
                    stroke="#60a5fa"
                    label={{ value: 'Seconds', position: 'insideBottomRight', offset: -5, fill: '#60a5fa' }}
                  />
                  <YAxis 
                    stroke="#60a5fa"
                    label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: 10, fill: '#60a5fa' }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '8px' }} />
                  <Line 
                    type="stepAfter" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={false} 
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-lg font-medium text-gray-300">Receiver's Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter receiver's address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                    disabled={!connected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-lg font-medium text-gray-300">Total Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter total amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                    disabled={!connected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-lg font-medium text-gray-300">Total Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter total duration in seconds"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                    disabled={!connected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliffDuration" className="text-lg font-medium text-gray-300">Cliff Duration (seconds)</Label>
                  <Input
                    id="cliffDuration"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter cliff duration in seconds"
                    value={cliffDuration}
                    onChange={(e) => setCliffDuration(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                    disabled={!connected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliffAmount" className="text-lg font-medium text-gray-300">Cliff Amount</Label>
                  <Input
                    id="cliffAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter cliff amount"
                    value={cliffAmount}
                    onChange={(e) => setCliffAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                    disabled={!connected}
                  />
                </div>
                {error && (
                  <Alert className="bg-red-900 text-white rounded-lg px-4 py-3">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-6 py-3 w-full text-lg font-medium transition-colors duration-200"
                  disabled={!connected || isLoading}
                >
                  {isLoading ? 'Processing...' : 'Create Cliff Stream'}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}