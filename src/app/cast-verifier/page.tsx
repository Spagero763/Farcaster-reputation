// app/cast-verifier/page.tsx
'use client';
import { useState } from 'react';
import { verifyFarcasterCast } from '@/app/actions';

export default function CastVerifier() {
  const [castHash, setCastHash] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const verifyCast = async () => {
    setLoading(true);
    const data = await verifyFarcasterCast({ castHash });
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">🔍 Farcaster Cast Verifier</h1>
      <input
        type="text"
        className="border p-2 w-full max-w-md"
        placeholder="Enter cast hash..."
        value={castHash}
        onChange={(e) => setCastHash(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
        onClick={verifyCast}
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify Cast'}
      </button>

      {result && (
        <pre className="mt-6 bg-white p-4 rounded shadow text-sm overflow-auto max-w-2xl">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
