'use server';

/**
 * @fileOverview A Farcaster cast verification AI agent using Neynar API.
 *
 * - verifyCast - A function that verifies a Farcaster cast hash using the Neynar API.
 * - VerifyCastInput - The input type for the verifyCast function.
 * - VerifyCastOutput - The return type for the verifyCast function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

const VerifyCastInputSchema = z.object({
  castHash: z.string().describe('The hash of the Farcaster cast to verify.'),
  neynarApiKey: z.string().describe('The API key for accessing the Neynar API.'),
});
export type VerifyCastInput = z.infer<typeof VerifyCastInputSchema>;

const VerifyCastOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the cast is valid based on Neynar API verification.'),
  authorFid: z.number().optional().describe('The Farcaster ID of the cast author, if the cast is valid.'),
  error: z.string().optional().describe('An error message if verification fails.'),
  username: z.string().optional().describe('The username of the cast author.'),
  pfp: z.string().optional().describe("The author's profile picture URL."),
});
export type VerifyCastOutput = z.infer<typeof VerifyCastOutputSchema>;

export async function verifyCast(input: VerifyCastInput): Promise<VerifyCastOutput> {
  return verifyCastFlow(input);
}

const verifyCastFlow = ai.defineFlow(
  {
    name: 'verifyCastFlow',
    inputSchema: VerifyCastInputSchema,
    outputSchema: VerifyCastOutputSchema,
  },
  async ({ castHash, neynarApiKey }) => {
    if (!neynarApiKey) {
      const error = 'Neynar API key is not configured.';
      console.error(error);
      return { isValid: false, error };
    }

    const client = new NeynarAPIClient(neynarApiKey);

    try {
      const { cast } = await client.lookupCastByHash(castHash);
      const { author } = cast;

      return {
        isValid: true,
        authorFid: author.fid,
        username: author.username,
        pfp: author.pfp_url,
      };
    } catch (error) {
      console.error('Error verifying cast with Neynar SDK:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      return {
        isValid: false,
        error: errorMessage,
      };
    }
  }
);
