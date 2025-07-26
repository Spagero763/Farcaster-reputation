// src/ai/flows/verify-cast.ts
'use server';

/**
 * @fileOverview A Farcaster cast verification AI agent using Neynar API.
 *
 * - verifyCast - A function that verifies a Farcaster cast hash using the Neynar API.
 * - VerifyCastInput - The input type for the verifyCast function.
 * - VerifyCastOutput - The return type for the verifyCast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyCastInputSchema = z.object({
  castHash: z.string().describe('The hash of the Farcaster cast to verify.'),
  neynarApiKey: z.string().describe('The API key for accessing the Neynar API.'),
});
export type VerifyCastInput = z.infer<typeof VerifyCastInputSchema>;

const VerifyCastOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the cast is valid based on Neynar API verification.'),
  authorFid: z.number().optional().describe('The Farcaster ID of the cast author, if the cast is valid.'),
  error: z.string().optional().describe('An error message if verification fails.'),
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
  async input => {
    try {
      const endpoint = `https://api.neynar.com/v2/farcaster/cast?identifier=${input.castHash}&type=hash`;
      const res = await fetch(endpoint, {
        headers: {
          'accept': 'application/json',
          'api_key': input.neynarApiKey,
        },
      });

      if (!res.ok) {
        console.error('Neynar API error:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({ message: 'Unknown API error' }));
        return {
          isValid: false,
          error: errorData.message || `API Error: ${res.statusText}`,
        };
      }

      const data = await res.json();

      if (data.cast && data.cast.author && data.cast.author.fid) {
        return {
          isValid: true,
          authorFid: data.cast.author.fid,
        };
      } else {
        console.warn('Cast not found or author fid missing in Neynar response.');
        return {
          isValid: false,
          error: data.message || 'Cast not found or author fid missing.',
        };
      }
    } catch (error) {
      console.error('Error verifying cast:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      return {
        isValid: false,
        error: errorMessage,
      };
    }
  }
);
