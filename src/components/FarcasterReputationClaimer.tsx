'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { verifyFarcasterCast } from '@/app/actions';
import { Loader2, CheckCircle, XCircle, Award, ArrowUpRight } from 'lucide-react';
import ABI from '@/abi/ReputationClaim.json';
import { toast as toaster } from '@/hooks/use-toast';

const CONTRACT_ADDRESS = '0x34272536B3c2fa0D21D63e451B490D0be56D26d0';
const BASE_SEPOLIA_SCAN_URL = 'https://sepolia.basescan.org';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

export function FarcasterReputationClaimer() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [castHash, setCastHash] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  
  const { data: hash, writeContract, isPending: isClaiming } = useWriteContract();

  const handleVerify = async () => {
    if (!castHash.trim() || !castHash.startsWith('0x')) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid cast hash.' });
      return;
    }
    setStatus('verifying');
    const result = await verifyFarcasterCast({ castHash });
    if (result.isValid) {
      setStatus('success');
      toast({ title: 'Cast Verified!', description: `Cast by FID ${result.authorFid} is valid. You can now claim.` });
    } else {
      setStatus('error');
      toast({ variant: 'destructive', title: 'Verification Failed', description: result.error || 'The cast could not be verified.' });
    }
  };

  const handleClaim = async () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'claimReputation',
      args: [],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      setStatus('idle');
      setCastHash('');
      toaster.toast({
        title: 'Reputation Claimed!',
        description: 'Your on-chain reputation has been recorded.',
        action: (
          <a href={`${BASE_SEPOLIA_SCAN_URL}/tx/${hash}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              View Tx <ArrowUpRight className="h-4 w-4" />
            </Button>
          </a>
        ),
      });
    }
  }, [isConfirmed, hash]);

  const canClaim = status === 'success' && address;

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
            <div className="relative">
              <Input
                id="castHash"
                type="text"
                placeholder="Enter cast hash (e.g., 0x...)"
                value={castHash}
                onChange={(e) => {
                  setCastHash(e.target.value);
                  if (status !== 'idle' && status !== 'verifying') {
                    setStatus('idle');
                  }
                }}
                disabled={status === 'verifying' || isClaiming || isConfirming}
                className="pr-12 text-base"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                {status === 'verifying' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
              </div>
            </div>
            <Button
              onClick={handleVerify}
              disabled={status === 'verifying' || !castHash.trim() || isClaiming || isConfirming}
              className="w-full"
            >
              {status === 'verifying' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify Cast'}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleClaim}
          disabled={!canClaim || isClaiming || isConfirming}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
        >
          {(isClaiming || isConfirming) ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isConfirming ? 'Confirming in wallet...' : 'Claiming...'}</>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" /> Claim Reputation
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
