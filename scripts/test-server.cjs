const { handleMCPRequest } = require('../dist-electron/mcp/server.js');

async function testFactVerificationSeal() {
  try {
    console.log('--- Testing Fact Verification Seal System ---');
    
    const mcpRes = await handleMCPRequest({
      id: 20,
      method: 'tools/call',
      params: {
        name: 'priesm_extract_web_context',
        arguments: {
          url: 'https://example.com',
          mode: 'full'
        }
      }
    });

    const text = mcpRes.result?.content[0]?.text || '';
    console.log('[Fact Verification Seal Output Test]:', {
      hasMasterSeal: text.includes('Verification Seal: Priesm-Verified-'),
      hasParagraphSeal: text.includes('[Priesm-Seal: #'),
      textPreview: text.slice(0, 300)
    });
  } catch (e) {
    console.error('[Fact Seal Test Failed]:', e);
  }
}

testFactVerificationSeal();
