'use client';

import { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { verifyFarcasterCast } from '@/app/actions';
import { Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import { CONTRACT_ABI } from '@/lib/contractAbi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const BASE_SEPOLIA_SCAN_URL = 'https://sepolia.basescan.org';

export function FarcasterReputationClaimer() {
  const { isConnected } = useAccount();
  const [castHash, setCastHash] = useState('');
  const [fid, setFid] = useState<number | null>(null);

  const { data: hash, writeContract, isPending: isClaiming, error: claimError } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast.success('Claim transaction sent! Waiting for confirmation...');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  });
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });

  const handleVerifyAndClaim = async () => {
    if (!castHash.trim() || !castHash.startsWith('0x')) {
      toast.error('Please enter a valid cast hash.');
      return;
    }

    try {
      toast.loading('Verifying cast...');
      const result = await verifyFarcasterCast({ castHash });
      toast.dismiss();

      if (result.isValid && result.authorFid) {
        setFid(result.authorFid);
        toast.success(`Verified cast from @${result.username} (FID: ${result.authorFid})`, {
            description: "You can now claim your reputation."
        });
        
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'claimReputation',
          args: [BigInt(result.authorFid)],
        });

      } else {
        toast.error('Verification Failed', { description: result.error || 'The cast could not be verified.' });
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "An unexpected error occurred during verification.");
    }
  };
  
  if (isConfirmed && hash) {
      toast.success('Reputation Claimed!', {
        description: 'Your on-chain reputation has been recorded.',
        action: {
            label: "View Transaction",
            onClick: () => window.open(`${BASE_SEPOLIA_SCAN_URL}/tx/${hash}`, '_blank')
        },
        duration: 5000,
        important: true,
      });
  }


  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-2 border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="font-headline text-2xl">Farcaster Reputation Claim</CardTitle>
        <CardDescription>Verify a Farcaster cast to claim your on-chain reputation on Base Sepolia.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <ConnectButton />
        </div>
        {isConnected && (
            <div className="space-y-4 pt-4">
                <Input
                    id="castHash"
                    type="text"
                    placeholder="Enter cast hash (e.g., 0x...)"
                    value={castHash}
                    onChange={(e) => setCastHash(e.target.value)}
                    disabled={isClaiming || isConfirming}
                    className="w-full border p-3 rounded-lg mb-4"
                />
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleVerifyAndClaim}
          disabled={!isConnected || isClaiming || isConfirming || !castHash}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          {(isClaiming || isConfirming) ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isConfirming ? 'Confirming in wallet...' : 'Claiming...'}</>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" /> Verify & Claim Reputation
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
