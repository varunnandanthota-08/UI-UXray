const test = require('node:test')
const assert = require('node:assert')
const {
  CANVA_GUIDANCE_MESSAGE,
  isCanvaUrl,
  validateDesignUrl,
  validateFigmaUrl,
} = require('../services/designUrlValidator')

test('Design URL Validator Suite', async (t) => {
  // Spy on fetch to strictly guarantee no network requests are made
  let networkCallAttempted = false
  const originalFetch = global.fetch
  global.fetch = () => {
    networkCallAttempted = true
    throw new Error('Network call attempted during URL validation!')
  }

  t.after(() => {
    global.fetch = originalFetch
  })

  await t.test('Valid Figma URLs with file key and optional node-id extraction', () => {
    // 1. Standard web design URL
    const res1 = validateFigmaUrl('https://www.figma.com/design/sample-key-12345/Mobile-Checkout')
    assert.strictEqual(res1.isValid, true)
    assert.strictEqual(res1.fileKey, 'sample-key-12345')
    assert.strictEqual(res1.pathType, 'design')
    assert.strictEqual(res1.host, 'www.figma.com')

    // 2. Direct apex figma.com file URL
    const res2 = validateFigmaUrl('https://figma.com/file/abc_DEF-999/Design-System')
    assert.strictEqual(res2.isValid, true)
    assert.strictEqual(res2.fileKey, 'abc_DEF-999')
    assert.strictEqual(res2.pathType, 'file')

    // 3. Prototype URL with node-id query parameter
    const res3 = validateFigmaUrl('https://www.figma.com/proto/proto-xyz-001/Interactive-Flow?node-id=10:25')
    assert.strictEqual(res3.isValid, true)
    assert.strictEqual(res3.fileKey, 'proto-xyz-001')
    assert.strictEqual(res3.nodeId, '10:25')
    assert.strictEqual(res3.pathType, 'proto')

    // 4. FigJam board URL
    const res4 = validateFigmaUrl('https://www.figma.com/board/board-key-456/Research-Affinity-Map')
    assert.strictEqual(res4.isValid, true)
    assert.strictEqual(res4.fileKey, 'board-key-456')
    assert.strictEqual(res4.pathType, 'board')

    // 5. Explicit standard HTTPS port 443
    const res5 = validateFigmaUrl('https://figma.com:443/design/sample-key-443/Screen')
    assert.strictEqual(res5.isValid, true)
    assert.strictEqual(res5.fileKey, 'sample-key-443')
  })

  await t.test('Rejects insecure HTTP URLs', () => {
    const res = validateFigmaUrl('http://www.figma.com/file/abc12345/App')
    assert.strictEqual(res.isValid, false)
    assert.match(res.error, /insecure protocol/i)
  })

  await t.test('Rejects malformed and non-URL strings', () => {
    assert.strictEqual(validateFigmaUrl('not-a-url').isValid, false)
    assert.strictEqual(validateFigmaUrl('https://').isValid, false)
    assert.strictEqual(validateFigmaUrl('javascript:alert(1)').isValid, false)
    assert.strictEqual(validateFigmaUrl('').isValid, false)
    assert.strictEqual(validateFigmaUrl(null).isValid, false)
  })

  await t.test('Handles optional/empty URLs safely when optional: true', () => {
    const resEmpty = validateFigmaUrl('', { optional: true })
    assert.strictEqual(resEmpty.isValid, true)
    assert.strictEqual(resEmpty.isEmpty, true)
    assert.strictEqual(resEmpty.fileKey, null)

    const resNull = validateFigmaUrl(null, { optional: true })
    assert.strictEqual(resNull.isValid, true)
    assert.strictEqual(resNull.isEmpty, true)
  })

  await t.test('Rejects deceptive hostnames and domain spoofing', () => {
    // Spoofed domain with figma.com prefix
    const res1 = validateFigmaUrl('https://figma.com.evil.com/design/sample-key/Title')
    assert.strictEqual(res1.isValid, false)
    assert.match(res1.error, /deceptive/i)

    // Typosquatting / similar domain
    const res2 = validateFigmaUrl('https://evilfigma.com/design/sample-key/Title')
    assert.strictEqual(res2.isValid, false)
    assert.match(res2.error, /deceptive/i)

    // Unrelated domain
    const res3 = validateFigmaUrl('https://attacker.org/design/sample-key/Title')
    assert.strictEqual(res3.isValid, false)
    assert.match(res3.error, /invalid design host/i)
  })

  await t.test('Rejects URLs with embedded user credentials', () => {
    const res = validateFigmaUrl('https://admin:secret123@www.figma.com/file/sample-key/Title')
    assert.strictEqual(res.isValid, false)
    assert.match(res.error, /embedded credentials/i)
  })

  await t.test('Rejects non-standard / unexpected ports', () => {
    const res8080 = validateFigmaUrl('https://www.figma.com:8080/file/sample-key/Title')
    assert.strictEqual(res8080.isValid, false)
    assert.match(res8080.error, /unexpected port/i)

    const res22 = validateFigmaUrl('https://figma.com:22/file/sample-key/Title')
    assert.strictEqual(res22.isValid, false)
    assert.match(res22.error, /unexpected port/i)
  })

  await t.test('Rejects private, loopback, and internal network IP destinations', () => {
    const internalUrls = [
      'https://127.0.0.1/file/sample-key/Title',
      'https://localhost/file/sample-key/Title',
      'https://192.168.1.100/file/sample-key/Title',
      'https://10.0.0.1/file/sample-key/Title',
      'https://172.16.0.1/file/sample-key/Title',
      'https://169.254.169.254/latest/meta-data',
    ]

    for (const url of internalUrls) {
      const res = validateFigmaUrl(url)
      assert.strictEqual(res.isValid, false, `Expected ${url} to be rejected`)
      assert.match(res.error, /private or internal/i)
    }
  })

  await t.test('Detects Canva links and returns actionable export guidance', () => {
    const canvaUrls = [
      'https://www.canva.com/design/DAF12345/view',
      'https://canva.com/design/DAF_sample/edit',
      'https://my-team.canva.com/design/DAF_sample',
      'https://canva.link/project123',
    ]

    for (const url of canvaUrls) {
      assert.strictEqual(isCanvaUrl(url), true, `isCanvaUrl should recognize ${url}`)
      const res = validateDesignUrl(url)
      assert.strictEqual(res.isValid, false)
      assert.strictEqual(res.isCanva, true)
      assert.strictEqual(res.urlType, 'canva')
      assert.strictEqual(res.error, CANVA_GUIDANCE_MESSAGE)
    }
  })

  await t.test('Zero network requests were performed during validation', () => {
    assert.strictEqual(networkCallAttempted, false, 'Validation helper must never initiate network calls')
  })
})
