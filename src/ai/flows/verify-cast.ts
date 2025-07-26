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
});
export type VerifyCastOutput = z.infer<typeof VerifyCastOutputSchema>;

export async function verifyCast(input: VerifyCastInput): Promise<VerifyCastOutput> {
  return verifyCastFlow(input);
}

const verifyCastPrompt = ai.definePrompt({
  name: 'verifyCastPrompt',
  input: {schema: VerifyCastInputSchema},
  output: {schema: VerifyCastOutputSchema},
  prompt: `You are a service that verifies Farcaster casts using the Neynar API.

  Determine if the provided cast hash is valid according to the Neynar API.
  If the cast is valid, return isValid as true and include the author's Farcaster ID (fid).
  If the cast is invalid or the Neynar API returns an error, return isValid as false.

  Cast Hash: {{{castHash}}}
  Neynar API Key: {{{neynarApiKey}}}

  Make an HTTP request to the Neynar API to verify the cast.
  The API endpoint is https://api.neynar.com/v2/farcaster/cast?identifier={{{castHash}}}&type=hash
  Include the Neynar API key in the headers as 'api_key'.

  Return the results as JSON in the following format:
  {
    "isValid": true or false,
    "authorFid": (integer, only if isValid is true)
  }`,
});

const verifyCastFlow = ai.defineFlow(
  {
    name: 'verifyCastFlow',
    inputSchema: VerifyCastInputSchema,
    outputSchema: VerifyCastOutputSchema,
  },
  async input => {
    try {
      const res = await fetch(`https://api.neynar.com/v2/farcaster/cast?identifier=${input.castHash}&type=hash`, {
        headers: {
          'api_key': input.neynarApiKey,
        },
      });

      if (!res.ok) {
        console.error('Neynar API error:', res.status, res.statusText);
        return {
          isValid: false,
        };
      }

      const data = await res.json();

      if (data.cast && data.cast.author && data.cast.author.fid) {
        return {
          isValid: true,
          authorFid: data.cast.author.fid,
        };
      } else {
        console.warn('Cast not found or author fid missing.');
        return {
          isValid: false,
        };
      }
    } catch (error) {
      console.error('Error verifying cast:', error);
      return {
        isValid: false,
      };
    }
  }
);
