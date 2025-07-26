# **App Name**: Farcaster Reputation Claimer

## Core Features:

- Wallet Connection: Connect to a wallet using RainbowKit.
- Cast Hash Input: Input a Farcaster cast hash into a text field.
- Cast Verification: Verify the cast hash using the Neynar API; the AI tool checks whether the cast meets the on-chain conditions.
- Claim Button: Display a button to claim reputation if the cast is verified.
- Reputation Claim: Call the `claimReputation` function on the deployed smart contract on Base Sepolia when the claim button is pressed.
- Success Notification: Show a success message upon successful claim.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) to represent trust and verification.
- Background color: A light gray (#F5F5F5) for a clean and modern look.
- Accent color: A bright green (#90EE90) to indicate success and completion of reputation claim.
- Body and headline font: 'Inter' (sans-serif) for a modern and readable interface.
- Use simple, clear icons from a library like Phosphor to represent actions and status.
- Center the main content with a clean, single-column layout for ease of use.
- Use subtle animations to provide feedback on interactions (e.g., button clicks, successful claims).