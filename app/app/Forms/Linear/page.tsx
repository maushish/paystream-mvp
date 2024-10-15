"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, PublicKey, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "@solana/wallet-adapter-react-ui/styles.css";
import idl from "./idl.json"

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

const programID = new PublicKey("E11ndvgpyqmnw9zwFsB6MH9qW3D8PFifAYGz9ypy88B7");

export default function StreamManagement() {
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const wallet = useWallet();
  const { connection } = useConnection();
  const streams = useState<Stream[]>([
    { id: "stream1", amount: 100, duration: 3600, claimed: 0 },
    { id: "stream2", amount: 200, duration: 7200, claimed: 50 },
  ]);

  // Set up Solana connection and wallet network
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const getProgram = () => {
    const provider = new AnchorProvider(connection, wallet as any, AnchorProvider.defaultOptions());
    return new Program(idl as any, programID, provider);
  };

  const StreamManagementContent = () => {
    useEffect(() => {
      setIsWalletConnected(wallet.connected);
    }, [wallet.connected]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")

      if (!isWalletConnected) {
        setError("Please connect your wallet to create a stream.")
        return
      }

      if (!address || !amount || !duration) {
        setError("Please fill in all fields.")
        return
      }

      try {
        const program = getProgram();
        const receiver = new PublicKey(address);
        const durationBN = new web3.BN(parseInt(duration));
        const amountBN = new web3.BN(parseFloat(amount) * web3.LAMPORTS_PER_SOL);

        const [streamPDA] = await PublicKey.findProgramAddress(
          [Buffer.from("stream"), wallet.publicKey!.toBuffer()],
          programID
        );

        const tx = await program.methods.createStream(receiver, durationBN, amountBN)
          .accounts({
            streamAccount: streamPDA,
            authority: wallet.publicKey!,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        console.log("Stream created successfully. Transaction signature:", tx);
        // Clear form fields after successful creation
        setAddress("");
        setAmount("");
        setDuration("");
      } catch (err) {
        console.error("Error creating stream:", err);
        setError("Failed to create stream. Please check the console for details.");
      }
    }

    const handleClaim = (streamId: string) => {
      console.log(`Claiming stream: ${streamId}`)
      // Implement claim logic here
    }

    return (
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
                                min="1"
                                placeholder="Enter duration in seconds"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="bg-gray-700 border-blue-600 text-blue-100 placeholder-blue-400 focus:border-blue-500 rounded-lg"
                              />
                            </div>
                            {error && (
                              <Alert className="bg-red-500 text-white rounded-lg">
                                <AlertCircle className="mr-2 w-5 h-5" />
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            )}
                            <Button 
                              type="submit" 
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full mt-4"
                              disabled={!isWalletConnected || !address || !amount || !duration}
                            >
                              Create Stream
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="recipient">
                  <div className="flex flex-col space-y-6">
                    {streams.map((stream) => (
                      <Card key={stream.id} className="bg-gray-800 border-blue-700 rounded-xl shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-blue-300">Stream ID: {stream.id}</CardTitle>
                          <CardDescription className="text-blue-200">Total Amount: {stream.amount} SOL</CardDescription>
                          <CardDescription className="text-blue-200">Duration: {stream.duration} seconds</CardDescription>
                          <CardDescription className="text-blue-200">Claimed: {stream.claimed} SOL</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            onClick={() => handleClaim(stream.id)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            Claim Stream
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <StreamManagementContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
