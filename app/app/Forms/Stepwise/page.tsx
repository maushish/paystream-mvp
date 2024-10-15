// import React, { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { AlertCircle } from "lucide-react"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// // Define the type for chart data
// type ChartData = {
//   time: number;
//   value: number;
// }

// export default function TransactionForm() {
//   const [address, setAddress] = useState("")
//   const [amount, setAmount] = useState("")
//   const [durationType, setDurationType] = useState("weekly")
//   const [durationValue, setDurationValue] = useState("")
//   const [error, setError] = useState("")
//   const [chartData, setChartData] = useState<ChartData[]>([])

//   useEffect(() => {
//     if (amount && durationValue && !isNaN(Number(durationValue))) {
//       const periods = parseInt(durationValue, 10)
//       const totalAmount = parseFloat(amount)
//       const data: ChartData[] = []

//       for (let i = 0; i <= periods; i++) {
//         data.push({
//           time: i,
//           value: (i / periods) * totalAmount
//         })
//       }

//       setChartData(data)
//     } else {
//       setChartData([])
//     }
//   }, [amount, durationValue, durationType])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")

//     if (!address || !amount || !durationValue) {
//       setError("All fields are required.")
//       return
//     }

//     if (parseFloat(amount) <= 0) {
//       setError("Amount must be greater than 0.")
//       return
//     }

//     if (parseInt(durationValue) <= 0) {
//       setError("Duration must be greater than 0.")
//       return
//     }

//     console.log("Form submitted:", { address, amount, duration: `${durationValue} ${durationType}` })
//   }

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-black text-blue-100 transition-colors duration-200 p-4">
//       <div className="flex flex-col md:flex-row gap-12 w-full max-w-5xl">
//         <div className="w-full md:w-2/5">
//           <Card className="bg-gray-900 border-blue-800 rounded-xl shadow-lg">
//             <CardHeader>
//               <CardTitle className="text-blue-300">Step-wise Stream Graph</CardTitle>
//               <CardDescription className="text-blue-200">Amount over time</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[250px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart 
//                     data={chartData} 
//                     margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
//                   >
//                     <CartesianGrid 
//                       strokeDasharray="3 3" 
//                       stroke="#1e3a8a" 
//                       opacity={0.4}
//                     />
//                     <XAxis 
//                       dataKey="time" 
//                       type="number"
//                       domain={[0, 'dataMax']}
//                       axisLine={{ stroke: "#3b82f6", strokeWidth: 2 }}
//                       tick={{ fill: "#93c5fd" }}
//                       label={{ value: durationType === 'weekly' ? 'Weeks' : 'Months', position: 'insideBottomRight', offset: -5, fill: '#93c5fd' }}
//                     />
//                     <YAxis 
//                       axisLine={{ stroke: "#3b82f6", strokeWidth: 2 }}
//                       tick={{ fill: "#93c5fd" }}
//                       label={{ value: 'Amount', angle: -90, position: 'insideLeft', fill: '#93c5fd' }}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: "#1e3a8a",
//                         borderColor: "#3b82f6",
//                         borderRadius: "0.5rem",
//                         color: "#bfdbfe"
//                       }}
//                       labelStyle={{ color: "#bfdbfe" }}
//                       itemStyle={{ color: "#bfdbfe" }}
//                       formatter={(value: any) => [`${parseFloat(value).toFixed(2)}`, 'Amount']}
//                       labelFormatter={(label) => `${durationType === 'weekly' ? 'Week' : 'Month'}: ${label}`}
//                     />
//                     <Line 
//                       type="stepAfter"
//                       dataKey="value" 
//                       stroke="#60a5fa"
//                       strokeWidth={3}
//                       dot={false}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//         <div className="w-full md:w-3/5">
//           <Card className="bg-gray-900 border-blue-800 rounded-xl shadow-lg">
//             <CardHeader>
//               <CardTitle className="text-blue-300">Stream Details</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="address" className="text-blue-200">Receiver's Address</Label>
//                   <Input
//                     id="address"
//                     placeholder="Enter receiver's address"
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                     className="bg-gray-800 border-blue-700 text-blue-100 placeholder-blue-400 focus:border-blue-500 rounded-lg"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="amount" className="text-blue-200">Amount</Label>
//                   <Input
//                     id="amount"
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     placeholder="Enter amount"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     className="bg-gray-800 border-blue-700 text-blue-100 placeholder-blue-400 focus:border-blue-500 rounded-lg"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="durationType" className="text-blue-200">Duration Type</Label>
//                   <Select onValueChange={setDurationType} defaultValue={durationType}>
//                     <SelectTrigger className="bg-gray-800 border-blue-700 text-blue-100 focus:border-blue-500 rounded-lg">
//                       <SelectValue placeholder="Select duration type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="weekly">Weekly</SelectItem>
//                       <SelectItem value="monthly">Monthly</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="durationValue" className="text-blue-200">Duration Value</Label>
//                   <Input
//                     id="durationValue"
//                     type="number"
//                     min="1"
//                     step="1"
//                     placeholder={`Enter number of ${durationType === 'weekly' ? 'weeks' : 'months'}`}
//                     value={durationValue}
//                     onChange={(e) => setDurationValue(e.target.value)}
//                     className="bg-gray-800 border-blue-700 text-blue-100 placeholder-blue-400 focus:border-blue-500 rounded-lg"
//                   />
//                 </div>
//                 {error && (
//                   <Alert variant="destructive" className="bg-red-900 border-red-800 rounded-lg">
//                     <AlertCircle className="h-4 w-4 text-red-400" />
//                     <AlertDescription className="text-red-400">{error}</AlertDescription>
//                   </Alert>
//                 )}
//                 <Button 
//                   type="submit" 
//                   className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg"
//                 >
//                   Submit
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
import React from 'react'

function page() {
  return (
    <div>Work in progress</div>
  )
}

export default page