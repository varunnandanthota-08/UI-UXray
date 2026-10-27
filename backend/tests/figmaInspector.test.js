const test = require('node:test')
const assert = require('node:assert')
const {
  inspectFigmaDesign,
  extractHexColor,
  extractDimensions,
  extractLayout,
  extractTypography,
  normalizeFigmaTree,
} = require('../services/figmaInspector')

// Sample realistic Figma REST API document structure
function createSampleFigmaDocument() {
  return {
    name: 'Mobile Checkout Flow Sprint 04',
    role: 'viewer',
    lastModified: '2026-09-20T12:00:00Z',
    version: '10928374',
    document: {
      id: '0:0',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '0:1',
          name: 'Page 1',
          type: 'CANVAS',
          children: [
            {
              id: '1:2',
              name: 'Checkout Screen Frame',
              type: 'FRAME',
              layoutMode: 'VERTICAL',
              itemSpacing: 16,
              paddingTop: 24,
              paddingRight: 16,
              paddingBottom: 24,
              paddingLeft: 16,
              primaryAxisAlignItems: 'MIN',
              counterAxisAlignItems: 'CENTER',
              absoluteBoundingBox: { x: 0, y: 0, width: 390, height: 844 },
              fills: [
                {
                  type: 'SOLID',
                  visible: true,
                  color: { r: 0.98, g: 0.98, b: 0.98 },
                },
              ],
              children: [
                {
                  id: '1:3',
                  name: 'Order Summary Header',
                  type: 'TEXT',
                  characters: 'Order Review & Payment Details',
                  style: {
                    fontFamily: 'Inter',
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeightPx: 28,
                    textAlignHorizontal: 'LEFT',
                  },
                  fills: [
                    {
                      type: 'SOLID',
                      visible: true,
                      color: { r: 0.1, g: 0.1, b: 0.1 },
                    },
                  ],
                },
                {
                  id: '1:4',
                  name: 'Primary Button Component',
                  type: 'COMPONENT',
                  absoluteBoundingBox: { x: 16, y: 700, width: 358, height: 48 },
                  fills: [
                    {
                      type: 'SOLID',
                      visible: true,
                      color: { r: 0.15, g: 0.35, b: 0.95 },
                    },
                  ],
                  children: [
                    {
                      id: '1:5',
                      name: 'Button Label',
                      type: 'TEXT',
                      characters: 'Complete Purchase',
                      style: {
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fontWeight: 600,
                      },
                      fills: [
                        {
                          type: 'SOLID',
                          visible: true,
                          color: { r: 1.0, g: 1.0, b: 1.0 },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  }
}

test('Figma Inspector Service Suite', async (t) => {
  const dummyToken = 'figd_mock_test_token_secret_99999'
  const validUrl = 'https://www.figma.com/design/sample-key-1234/Checkout-App'

  await t.test('1. Successful inspection with realistic Figma AST and evidence normalization', async () => {
    let capturedUrl = ''
    let capturedHeaders = {}

    const mockFetch = async (url, options) => {
      capturedUrl = url
      capturedHeaders = options.headers
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        json: async () => createSampleFigmaDocument(),
      }
    }

    const res = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: mockFetch,
    })

    assert.strictEqual(res.ok, true)
    assert.ok(res.metadata)
    assert.strictEqual(res.metadata.fileKey, 'sample-key-1234')
    assert.strictEqual(res.metadata.documentName, 'Mobile Checkout Flow Sprint 04')
    assert.strictEqual(res.metadata.version, '10928374')

    // Verify official API endpoint was called
    assert.match(capturedUrl, /^https:\/\/api\.figma\.com\/v1\/files\/sample-key-1234/)
    assert.strictEqual(capturedHeaders['X-Figma-Token'], dummyToken)

    // Verify extracted evidence
    const { summary, nodes } = res.evidence
    assert.ok(summary)
    assert.strictEqual(summary.totalFramesCount >= 1, true)
    assert.strictEqual(summary.totalTextNodesCount >= 2, true)
    assert.strictEqual(summary.totalComponentsCount >= 1, true)
    assert.ok(summary.colors.length > 0)
    assert.ok(summary.typography.length > 0)

    // Verify specific node properties
    const frameNode = nodes.find((n) => n.id === '1:2')
    assert.ok(frameNode)
    assert.strictEqual(frameNode.name, 'Checkout Screen Frame')
    assert.strictEqual(frameNode.type, 'FRAME')
    assert.deepStrictEqual(frameNode.dimensions, { x: 0, y: 0, width: 390, height: 844 })
    assert.strictEqual(frameNode.layout.mode, 'VERTICAL')
    assert.strictEqual(frameNode.layout.itemSpacing, 16)
    assert.strictEqual(frameNode.layout.paddingTop, 24)

    const textNode = nodes.find((n) => n.id === '1:3')
    assert.ok(textNode)
    assert.strictEqual(textNode.text, 'Order Review & Payment Details')
    assert.strictEqual(textNode.typography.fontFamily, 'Inter')
    assert.strictEqual(textNode.typography.fontSize, 20)
    assert.strictEqual(textNode.typography.fontWeight, 700)
  })

  await t.test('2. Rejects invalid or deceptive URLs without making network requests', async () => {
    let fetchCalled = false
    const mockFetch = async () => {
      fetchCalled = true
      throw new Error('Fetch should not have been called!')
    }

    const invalidUrls = [
      'https://figma.com.evil-attacker.com/design/fake-key',
      'http://www.figma.com/design/sample-key',
      'https://www.canva.com/design/DAF_sample/view',
      'https://127.0.0.1/file/fake-key',
      'not-a-valid-url',
    ]

    for (const url of invalidUrls) {
      const res = await inspectFigmaDesign(url, {
        accessToken: dummyToken,
        fetchImpl: mockFetch,
      })
      assert.strictEqual(res.ok, false)
      assert.strictEqual(res.statusCode, 400)
      assert.ok(res.error)
    }

    assert.strictEqual(fetchCalled, false, 'No network requests must occur for invalid URLs')
  })

  await t.test('3. Missing FIGMA_ACCESS_TOKEN returns clear configuration error without network call', async () => {
    let fetchCalled = false
    const mockFetch = async () => {
      fetchCalled = true
      throw new Error('Fetch should not have been called!')
    }

    const origEnv = process.env.FIGMA_ACCESS_TOKEN
    delete process.env.FIGMA_ACCESS_TOKEN

    try {
      const res = await inspectFigmaDesign(validUrl, {
        accessToken: '', // explicitly empty
        fetchImpl: mockFetch,
      })
      assert.strictEqual(res.ok, false)
      assert.strictEqual(res.statusCode, 500)
      assert.match(res.error, /FIGMA_ACCESS_TOKEN is not configured/i)
      assert.strictEqual(fetchCalled, false)
    } finally {
      if (origEnv !== undefined) process.env.FIGMA_ACCESS_TOKEN = origEnv
    }
  })

  await t.test('4. Token is never leaked in returned errors or objects', async () => {
    const mockFetch = async () => ({
      ok: false,
      status: 401,
      headers: new Map(),
      json: async () => ({ status: 401, err: 'Invalid token' }),
    })

    const res = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: mockFetch,
    })

    assert.strictEqual(res.ok, false)
    assert.strictEqual(res.statusCode, 401)
    const serialized = JSON.stringify(res)
    assert.strictEqual(serialized.includes(dummyToken), false, 'Token must never appear in response')
  })

  await t.test('5. Timeout handling returns safe 504 error', async () => {
    const mockFetch = async (url, options) => {
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    }

    const res = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: mockFetch,
      timeoutMs: 50, // fast timeout for test
    })

    assert.strictEqual(res.ok, false)
    assert.strictEqual(res.statusCode, 504)
    assert.match(res.error, /timed out/i)
  })

  await t.test('6. Rate limiting (429) extracts Retry-After safely', async () => {
    const headersMap = new Map([['retry-after', '45']])
    const mockFetch = async () => ({
      ok: false,
      status: 429,
      headers: {
        get: (h) => headersMap.get(h.toLowerCase()),
      },
      json: async () => ({ status: 429, message: 'Too many requests' }),
    })

    const res = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: mockFetch,
    })

    assert.strictEqual(res.ok, false)
    assert.strictEqual(res.statusCode, 429)
    assert.strictEqual(res.retryAfter, 45)
    assert.match(res.error, /rate limit exceeded.*45 seconds/i)
  })

  await t.test('7. HTTP 403 / 404 / 500 error handling', async () => {
    // 403 Forbidden / Private file
    const res403 = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: async () => ({
        ok: false,
        status: 403,
        json: async () => ({}),
      }),
    })
    assert.strictEqual(res403.ok, false)
    assert.strictEqual(res403.statusCode, 403)
    assert.match(res403.error, /private or access is restricted/i)

    // 404 Not Found
    const res404 = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: async () => ({
        ok: false,
        status: 404,
        json: async () => ({}),
      }),
    })
    assert.strictEqual(res404.ok, false)
    assert.strictEqual(res404.statusCode, 404)
    assert.match(res404.error, /file not found/i)

    // 500 Internal server error
    const res500 = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    })
    assert.strictEqual(res500.ok, false)
    assert.strictEqual(res500.statusCode, 500)
    assert.match(res500.error, /HTTP error 500/i)
  })

  await t.test('8. Malformed or unparseable JSON responses', async () => {
    // JSON parse error
    const resParse = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON')
        },
      }),
    })
    assert.strictEqual(resParse.ok, false)
    assert.strictEqual(resParse.statusCode, 502)
    assert.match(resParse.error, /unparseable/i)

    // Missing document structure
    const resNoDoc = await inspectFigmaDesign(validUrl, {
      accessToken: dummyToken,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ name: 'Test File' }), // no document property
      }),
    })
    assert.strictEqual(resNoDoc.ok, false)
    assert.strictEqual(resNoDoc.statusCode, 502)
    assert.match(resNoDoc.error, /missing document structure/i)
  })

  await t.test('9. Traversal boundaries (maxItems, maxDepth, text length limits)', () => {
    // Create a deeply nested tree
    const deepTree = {
      id: '0:0',
      name: 'Root Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '1:0',
          name: 'Canvas',
          type: 'CANVAS',
          children: [
            {
              id: '2:0',
              name: 'Level 2 Frame',
              type: 'FRAME',
              children: [
                {
                  id: '3:0',
                  name: 'Level 3 Frame',
                  type: 'FRAME',
                  children: [
                    {
                      id: '4:0',
                      name: 'Level 4 Frame',
                      type: 'FRAME',
                      children: [
                        {
                          id: '5:0',
                          name: 'Level 5 Frame (should be pruned by depth limit 3)',
                          type: 'FRAME',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    // Depth limit 2
    const depthResult = normalizeFigmaTree(deepTree, { maxDepth: 2 })
    assert.strictEqual(depthResult.summary.truncated, true)
    assert.strictEqual(depthResult.summary.maxDepthReached <= 2, true)
    assert.strictEqual(depthResult.nodes.some((n) => n.id === '3:0'), false)

    // Item count limit 3
    const itemResult = normalizeFigmaTree(deepTree, { maxItems: 3 })
    assert.strictEqual(itemResult.summary.truncated, true)
    assert.strictEqual(itemResult.nodes.length, 3)

    // Text truncation
    const longTextTree = {
      id: '0:0',
      type: 'TEXT',
      characters: 'A'.repeat(500),
      name: 'Very Long Name '.repeat(20),
    }
    const textResult = normalizeFigmaTree(longTextTree, {
      maxTextLength: 50,
      maxNameLength: 30,
    })
    assert.strictEqual(textResult.nodes[0].text.length, 50)
    assert.strictEqual(textResult.nodes[0].name.length, 30)
  })

  await t.test('10. Pure helper unit tests (hex color, dimensions, layout, typography)', () => {
    // Hex conversion
    assert.strictEqual(
      extractHexColor({ type: 'SOLID', visible: true, color: { r: 1, g: 0, b: 0 } }),
      '#FF0000'
    )
    assert.strictEqual(
      extractHexColor({ type: 'SOLID', visible: true, color: { r: 0, g: 1, b: 0.5 } }),
      '#00FF80'
    )
    assert.strictEqual(extractHexColor({ type: 'IMAGE' }), null)
    assert.strictEqual(extractHexColor({ type: 'SOLID', visible: false }), null)

    // Dimensions
    const dims = extractDimensions({
      absoluteBoundingBox: { x: 10.456, y: 20.789, width: 100.123, height: 200.456 },
    })
    assert.deepStrictEqual(dims, { x: 10.46, y: 20.79, width: 100.12, height: 200.46 })

    // Layout
    const layout = extractLayout({
      layoutMode: 'HORIZONTAL',
      itemSpacing: 8,
      paddingLeft: 12,
      paddingRight: 12,
    })
    assert.strictEqual(layout.mode, 'HORIZONTAL')
    assert.strictEqual(layout.itemSpacing, 8)
    assert.strictEqual(layout.paddingLeft, 12)
    assert.strictEqual(extractLayout({ layoutMode: 'NONE' }), null)

    // Typography
    const typo = extractTypography({
      type: 'TEXT',
      style: { fontFamily: 'Roboto', fontSize: 14, fontWeight: 500, lineHeightPx: 20 },
    })
    assert.strictEqual(typo.fontFamily, 'Roboto')
    assert.strictEqual(typo.fontSize, 14)
    assert.strictEqual(extractTypography({ type: 'FRAME' }), null)
  })
})
