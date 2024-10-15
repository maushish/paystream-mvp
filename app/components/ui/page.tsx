"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TransactionForm() {
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [error, setError] = useState("")

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

    const [hours, minutes] = duration.split(":").map(Number)
    if (isNaN(hours) || isNaN(minutes) || hours < 1 || minutes < 0 || minutes > 59) {
      setError("Invalid duration. Minimum duration is 1 hour.")
      return
    }

    console.log("Form submitted:", { address, amount, duration })
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Card className="w-full max-w-md border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-purple-700 dark:text-purple-300">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Receiver's Address</Label>
              <Input
                id="address"
                placeholder="Enter receiver's address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-purple-200 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-purple-200 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-700 dark:text-gray-300">Duration (HH:MM)</Label>
              <Input
                id="duration"
                type="time"
                min="01:00"
                step="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-purple-200 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-600"
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}