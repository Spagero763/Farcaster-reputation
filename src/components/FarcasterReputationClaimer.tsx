'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { verifyFarcasterCast } from '@/app/actions';
import type { VerifyCastOutput } from '@/ai/flows/verify-cast';
import { Loader2, Award, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CONTRACT_ABI } from '@/lib/contractAbi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const BASE_SEPOLIA_SCAN_URL = 'https://sepolia.basescan.org';

type VerificationResult = VerifyCastOutput;

export function FarcasterReputationClaimer() {
  const { isConnected } = useAccount();
  const [castHash, setCastHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: hash, writeContract, isPending: isClaiming, error: claimError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });

  const handleVerify = async () => {
    if (!castHash.trim() || !castHash.startsWith('0x')) {
      toast.error('Please enter a valid cast hash.');
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);
    toast.loading('Verifying cast...');

    try {
      const result = await verifyFarcasterCast({ castHash });
      toast.dismiss();

      if (result.isValid && result.authorFid) {
        setVerificationResult(result);
        toast.success(`Verified cast from @${result.username}`, {
          description: "You can now claim your reputation."
        });
      } else {
        toast.error('Verification Failed', { description: result.error || 'The cast could not be verified.' });
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "An unexpected error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClaim = () => {
    if (!verificationResult?.authorFid) {
      toast.error("Cannot claim without a verified Farcaster ID.");
      return;
    }
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'claimReputation',
      args: [BigInt(verificationResult.authorFid)],
    });
  }

  useEffect(() => {
    if (claimError) {
      toast.error('Claim Transaction Failed', {
        description: claimError.message
      });
    }
  }, [claimError]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Reputation Claimed!', {
        description: 'Your on-chain reputation has been recorded.',
        action: {
            label: "View Transaction",
            onClick: () => window.open(`${BASE_SEPOLIA_SCAN_URL}/tx/${hash}`, '_blank')
        },
        duration: 8000,
        important: true,
      });
      setVerificationResult(null);
      setCastHash('');
    }
  }, [isConfirmed, hash]);


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
                    disabled={isVerifying || isClaiming || isConfirming || !!verificationResult}
                    className="w-full border p-3 rounded-lg"
                />

                <Button
                  onClick={handleVerify}
                  disabled={!castHash || isVerifying || !!verificationResult}
                  className="w-full"
                  variant="secondary"
                >
                  {isVerifying ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    <>Verify Cast</>
                  )}
                </Button>
            </div>
        )}
      </CardContent>
      {isConnected && verificationResult && (
        <CardFooter className="flex-col gap-4">
          <div className="text-center text-sm text-green-600 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md w-full justify-center">
            <CheckCircle className="h-5 w-5"/>
            <span>
              Verified! You can claim for FID: <strong>{verificationResult.authorFid}</strong>
            </span>
          </div>
          <Button
            onClick={handleClaim}
            disabled={isClaiming || isConfirming}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            {(isClaiming || isConfirming) ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isConfirming ? 'Waiting for confirmation...' : 'Claiming in wallet...'}</>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" /> Claim Reputation
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
