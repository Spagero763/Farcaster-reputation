import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md mx-auto shadow-xl border-2 border-primary/20 text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Farcaster Reputation Claim</CardTitle>
          <CardDescription>Verify a Farcaster cast to claim your on-chain reputation on Base Sepolia.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/claim" passHref>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              Get Started
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
