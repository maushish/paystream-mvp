"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"

type ChartData = {
  period: string;
  amount: number;
}

type PaymentPeriod = "weekly" | "bi-weekly" | "monthly"

export default function PeriodicPaymentStreamUI() {
  const [address, setAddress] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [perAmount, setPerAmount] = useState("")
  const [paymentPeriod, setPaymentPeriod] = useState<PaymentPeriod>("weekly")
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { connected } = useWallet()

  useEffect(() => {
    const parsedTotalAmount = Number(totalAmount)
    const parsedPerAmount = Number(perAmount)

    if (totalAmount && perAmount && !isNaN(parsedTotalAmount) && !isNaN(parsedPerAmount) && parsedPerAmount > 0) {
      const periods = Math.ceil(parsedTotalAmount / parsedPerAmount)
      const data: ChartData[] = []

      for (let i = 1; i <= periods; i++) {
        const amount = Math.min(i * parsedPerAmount, parsedTotalAmount)
        let periodLabel: string

        switch (paymentPeriod) {
          case "weekly":
            periodLabel = `Week ${i}`
            break
          case "bi-weekly":
            periodLabel = `Week ${i * 2}`
            break
          case "monthly":
            periodLabel = `Month ${i}`
            break
        }

        data.push({ period: periodLabel, amount })
      }

      setChartData(data)
    } else {
      setChartData([])
    }
  }, [totalAmount, perAmount, paymentPeriod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!connected) {
      setError("Please connect your wallet")
      setIsLoading(false)
      return
    }

    if (!address || !totalAmount || !perAmount) {
      setError("All fields are required.")
      setIsLoading(false)
      return
    }

    if (parseFloat(totalAmount) <= 0 || parseFloat(perAmount) <= 0) {
      setError("Amounts must be greater than 0.")
      setIsLoading(false)
      return
    }

    if (parseFloat(perAmount) > parseFloat(totalAmount)) {
      setError("Per-period amount cannot be greater than total amount.")
      setIsLoading(false)
      return
    }

    // Simulating a submission process
    setTimeout(() => {
      console.log("Form submitted:", { address, totalAmount, perAmount, paymentPeriod })
      setIsLoading(false)
      // You can add a success message here if needed
    }, 2000)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950 text-gray-200 p-8">
      <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-2xl w-full max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between bg-blue-900 rounded-t-xl p-6">
          <CardTitle className="text-3xl font-bold text-gray-100">Periodic Payment Stream</CardTitle>
          <WalletMultiButton className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200" />
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">Payment Stream Visualization</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#60a5fa"
                    label={{ value: 'Period', position: 'insideBottomRight', offset: -5, fill: '#60a5fa' }}
                  />
                  <YAxis 
                    stroke="#60a5fa"
                    label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: 10, fill: '#60a5fa' }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '8px' }} />
                  <Line 
                    type="stepAfter" 
                    dataKey="amount" 
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-lg font-medium text-gray-300">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter total amount"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perAmount" className="text-lg font-medium text-gray-300">Per-Period Amount</Label>
                  <Input
                    id="perAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter per-period amount"
                    value={perAmount}
                    onChange={(e) => setPerAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentPeriod" className="text-lg font-medium text-gray-300">Payment Period</Label>
                  <Select
                    value={paymentPeriod}
                    onValueChange={(value: PaymentPeriod) => setPaymentPeriod(value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-500 rounded-lg p-3">
                      <SelectValue placeholder="Select payment period" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {isLoading ? 'Processing...' : 'Create Payment Stream'}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}