async function testCustomExtraction() {
  try {
    // Standard Mode
    const res1 = await fetch('http://localhost:37100/v1/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' })
    }).then(r => r.json());

    console.log('[Test 1 - Standard Full Mode]:', {
      appliedMode: res1.appliedMode,
      tokensEst: res1.tokensEst,
      savedRatioPercentage: `${res1.savedRatioPercentage}%`
    });

    // Custom Token Budget Mode (Max 20 Tokens Limit with Code Preservation)
    const res2 = await fetch('http://localhost:37100/v1/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com',
        options: {
          mode: 'full',
          maxTokenBudget: 20
        }
      })
    }).then(r => r.json());

    console.log('[Test 2 - Max Token Budget (20 tokens) Truncation]:', {
      appliedMode: res2.appliedMode,
      tokensEst: res2.tokensEst,
      extractedMarkdown: res2.extractedMarkdown
    });
  } catch (e) {
    console.error('[Test Failed]:', e);
  }
}

testCustomExtraction();
