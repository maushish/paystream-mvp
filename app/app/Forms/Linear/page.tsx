"use client"
import { useState, useMemo, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useConnection,
  useWallet
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, AnchorProvider, web3, Idl } from "@coral-xyz/anchor";
import BN from 'bn.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "@solana/wallet-adapter-react-ui/styles.css";
import {IDL } from "@/data/idl"

const programId = new PublicKey("GHsd2cgzpaoyFQ9hoQkhcXmAegbLaVh2zLFCjBFdotNn");

interface GraphDataPoint {
  second: number;
  percentage: number;
}

function StreamManagementContent() {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [txSignature, setTxSignature] = useState<string>("");

  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey, connected } = useWallet();

  const program = useMemo(() => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      return new Program(IDL, provider);
    }
    return null;
  }, [connection, wallet]);

  useEffect(() => {
    if (amount && duration) {
      const amountNum = parseFloat(amount);
      const durationNum = parseInt(duration);
      const data: GraphDataPoint[] = [];
      for (let i = 0; i <= durationNum; i++) {
        data.push({
          second: i,
          percentage: (i / durationNum) * 100
        });
      }
      setGraphData(data);
    }
  }, [amount, duration]);

  const createStream = async () => {
    if (!publicKey || !program) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError("");
    setTxSignature("");

    try {
      const receiverPubkey = new PublicKey(address);
      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const durationInSeconds = parseInt(duration);

      // Generate PDA for streamAccount
      const [streamAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("stream"), publicKey.toBuffer()],
        program.programId
      );

      // Initialize streamAccount
      const initSignature = await program.rpc.initialize({
        accounts:{
          streamAccount: streamAccountPDA,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        }});

      console.log(`StreamAccount initialized. Signature: ${initSignature}`);

      // Create stream
      const createStreamSignature = await program.rpc.createStream(
        receiverPubkey,
        new BN(700),
        new BN(amountInLamports),
        {
          accounts: {
            streamAccount: streamAccountPDA,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          },
        }
      );

      setTxSignature(createStreamSignature);
      console.log(
        `Stream created successfully! View on explorer: https://explorer.solana.com/tx/${createStreamSignature}?cluster=devnet`
      );
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error creating stream:", err);
        setError(err.message || "Failed to create stream");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStream();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950 text-gray-200 p-8">
      <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-2xl w-full max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-800 rounded-t-xl p-6">
          <CardTitle className="text-3xl font-bold text-gray-100">Stream Management</CardTitle>
          <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200" />
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">Stream Visualization</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="second" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="percentage" stroke="#3B82F6" strokeWidth={3} dot={false} />
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
                  <Label htmlFor="amount" className="text-lg font-medium text-gray-300">Amount (SOL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount in SOL"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 rounded-lg p-3"
                    disabled={!connected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-lg font-medium text-gray-300">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Enter duration in seconds"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 w-full text-lg font-medium transition-colors duration-200"
                  disabled={!connected || isLoading}
                >
                  {isLoading ? 'Creating Stream...' : 'Create Stream'}
                </Button>
              </form>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}

export default function StreamManagement() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <StreamManagementContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
