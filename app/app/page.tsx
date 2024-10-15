"use client";
import React from "react";
import { WavyBackground } from "../components/ui/wavy-background";
import Link from "next/link";

export default function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-4xl mx-auto pb-40">
      <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
        No need of trust, just Paystream
      </p>
      <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
        Leveraging the power of streams to create a trustless payment system.
      </p>
      <div className="flex justify-center mt-8"> {/* Flexbox wrapper for centering */}
        <Link href="/Forms">
          <button className="w-40 h-10 rounded-xl bg-black border border-white text-white text-sm hover:bg-white hover:text-black">
            Pay
          </button>
        </Link>
      </div>
      <div className="text-red-600 flex  justify-center">under development - maushish :) </div>
    </WavyBackground>
    
  );
}
