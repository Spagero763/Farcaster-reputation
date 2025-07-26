'use server';

import { verifyCast, type VerifyCastInput, type VerifyCastOutput } from '@/ai/flows/verify-cast';
import { z } from 'zod';

const actionSchema = z.object({
  castHash: z.string(),
});

export async function verifyFarcasterCast(
  data: z.infer<typeof actionSchema>
): Promise<VerifyCastOutput & { error?: string }> {
  const validatedData = actionSchema.safeParse(data);
  if (!validatedData.success) {
    return { isValid: false, error: 'Invalid input.' };
  }

  const neynarApiKey = process.env.NEYNAR_API_KEY;

  if (!neynarApiKey) {
    console.error('NEYNAR_API_KEY is not set in environment variables.');
    return { isValid: false, error: 'Server configuration error. Administrator needs to set NEYNAR_API_KEY.' };
  }

  try {
    const input: VerifyCastInput = {
      castHash: validatedData.data.castHash,
      neynarApiKey: neynarApiKey,
    };
    const result = await verifyCast(input);
    return result;
  } catch (error) {
    console.error('Error in verifyFarcasterCast action:', error);
    return { isValid: false, error: 'Failed to verify cast.' };
  }
}
