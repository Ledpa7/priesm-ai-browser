const { handleMCPRequest } = require('../dist-electron/mcp/server.js');

async function testAgentAdvancedFeatures() {
  try {
    console.log('--- Testing Agent-Centric Advanced Features ---');
    
    // 1. Test priesm_smart_digest (Multi-URL + Query RAG)
    const mcpRes = await handleMCPRequest({
      id: 10,
      method: 'tools/call',
      params: {
        name: 'priesm_smart_digest',
        arguments: {
          urls: ['https://example.com'],
          agentTaskQuery: 'illustrative examples documentation',
          maxTokensBudget: 100
        }
      }
    });

    console.log('[priesm_smart_digest Success]:', {
      isError: mcpRes.result?.isError || false,
      responsePreview: mcpRes.result?.content[0]?.text?.slice(0, 250)
    });
  } catch (e) {
    console.error('[Advanced Test Failed]:', e);
  }
}

testAgentAdvancedFeatures();
