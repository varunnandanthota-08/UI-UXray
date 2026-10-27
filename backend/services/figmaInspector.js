/**
 * Figma Design Inspection Service
 *
 * Securely retrieves accessible Figma document structure via the official Figma REST API.
 * Uses only validated file keys, bounds traversal depth/counts, extracts factual design
 * evidence (nodes, text, colors, dimensions, layout), and never logs or exposes access tokens.
 */

const { validateFigmaUrl } = require('./designUrlValidator')

const FIGMA_API_BASE = 'https://api.figma.com/v1/files'
const DEFAULT_TIMEOUT_MS = 10000
const DEFAULT_MAX_DEPTH = 4
const DEFAULT_MAX_ITEMS = 150
const DEFAULT_MAX_TEXT_LENGTH = 200
const DEFAULT_MAX_NAME_LENGTH = 100

/**
 * Converts a Figma solid paint object into a standardized uppercase hex color (#RRGGBB).
 *
 * @param {object} paint
 * @returns {string|null}
 */
function extractHexColor(paint) {
  if (!paint || typeof paint !== 'object') return null
  if (paint.type !== 'SOLID' || paint.visible === false) return null

  const c = paint.color
  if (!c || typeof c !== 'object') return null

  const r = Math.round(Math.max(0, Math.min(1, Number(c.r) || 0)) * 255)
  const g = Math.round(Math.max(0, Math.min(1, Number(c.g) || 0)) * 255)
  const b = Math.round(Math.max(0, Math.min(1, Number(c.b) || 0)) * 255)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
}

/**
 * Extracts normalized bounding box dimensions.
 *
 * @param {object} node
 * @returns {{ width: number, height: number, x: number, y: number }|null}
 */
function extractDimensions(node) {
  const box = node.absoluteBoundingBox
  if (!box || typeof box !== 'object') return null

  const width = Number(box.width)
  const height = Number(box.height)
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null

  return {
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
    x: Number.isFinite(Number(box.x)) ? Math.round(Number(box.x) * 100) / 100 : 0,
    y: Number.isFinite(Number(box.y)) ? Math.round(Number(box.y) * 100) / 100 : 0,
  }
}

/**
 * Extracts auto-layout properties from frame containers.
 *
 * @param {object} node
 * @returns {object|null}
 */
function extractLayout(node) {
  if (!node.layoutMode || node.layoutMode === 'NONE') return null

  return {
    mode: node.layoutMode,
    itemSpacing: Number.isFinite(Number(node.itemSpacing)) ? Number(node.itemSpacing) : 0,
    paddingTop: Number.isFinite(Number(node.paddingTop)) ? Number(node.paddingTop) : 0,
    paddingRight: Number.isFinite(Number(node.paddingRight)) ? Number(node.paddingRight) : 0,
    paddingBottom: Number.isFinite(Number(node.paddingBottom)) ? Number(node.paddingBottom) : 0,
    paddingLeft: Number.isFinite(Number(node.paddingLeft)) ? Number(node.paddingLeft) : 0,
    primaryAxisAlign: node.primaryAxisAlignItems || 'MIN',
    counterAxisAlign: node.counterAxisAlignItems || 'MIN',
  }
}

/**
 * Extracts typography attributes from text nodes.
 *
 * @param {object} node
 * @returns {object|null}
 */
function extractTypography(node) {
  if (node.type !== 'TEXT' || !node.style || typeof node.style !== 'object') return null

  const s = node.style
  return {
    fontFamily: typeof s.fontFamily === 'string' ? s.fontFamily.slice(0, 100) : null,
    fontSize: Number.isFinite(Number(s.fontSize)) ? Number(s.fontSize) : null,
    fontWeight: Number.isFinite(Number(s.fontWeight)) ? Number(s.fontWeight) : null,
    lineHeightPx: Number.isFinite(Number(s.lineHeightPx)) ? Math.round(Number(s.lineHeightPx) * 100) / 100 : null,
    textAlignHorizontal: typeof s.textAlignHorizontal === 'string' ? s.textAlignHorizontal : null,
  }
}

/**
 * Normalizes Figma document tree into bounded evidence items with depth, count and length limits.
 *
 * @param {object} rootNode
 * @param {object} options
 * @returns {{ nodes: Array<object>, summary: object }}
 */
function normalizeFigmaTree(rootNode, options = {}) {
  const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : DEFAULT_MAX_DEPTH
  const maxItems = Number.isFinite(options.maxItems) ? options.maxItems : DEFAULT_MAX_ITEMS
  const maxTextLength = Number.isFinite(options.maxTextLength) ? options.maxTextLength : DEFAULT_MAX_TEXT_LENGTH
  const maxNameLength = Number.isFinite(options.maxNameLength) ? options.maxNameLength : DEFAULT_MAX_NAME_LENGTH

  const items = []
  const uniqueColors = new Set()
  const typographyMap = new Map()
  let totalNodesScanned = 0
  let totalFramesCount = 0
  let totalTextNodesCount = 0
  let totalComponentsCount = 0
  let truncated = false

  function walk(node, depth, parentId = null) {
    if (!node || typeof node !== 'object') return
    totalNodesScanned += 1

    if (items.length >= maxItems) {
      truncated = true
      return
    }

    const type = typeof node.type === 'string' ? node.type : 'UNKNOWN'
    if (type === 'FRAME' || type === 'CANVAS' || type === 'SECTION') {
      totalFramesCount += 1
    } else if (type === 'TEXT') {
      totalTextNodesCount += 1
    } else if (type === 'COMPONENT' || type === 'INSTANCE' || type === 'COMPONENT_SET') {
      totalComponentsCount += 1
    }

    // Colors
    const nodeColors = []
    if (Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        const hex = extractHexColor(fill)
        if (hex) {
          nodeColors.push(hex)
          if (uniqueColors.size < 50) uniqueColors.add(hex)
        }
      }
    }
    if (Array.isArray(node.strokes)) {
      for (const stroke of node.strokes) {
        const hex = extractHexColor(stroke)
        if (hex) {
          nodeColors.push(hex)
          if (uniqueColors.size < 50) uniqueColors.add(hex)
        }
      }
    }

    // Typography
    const typo = extractTypography(node)
    if (typo && typo.fontFamily) {
      const key = `${typo.fontFamily}-${typo.fontSize}-${typo.fontWeight}`
      if (!typographyMap.has(key) && typographyMap.size < 30) {
        typographyMap.set(key, typo)
      }
    }

    // Text content
    let textContent = null
    if (type === 'TEXT' && typeof node.characters === 'string') {
      textContent = node.characters.trim().slice(0, maxTextLength)
    }

    // Normalized node entry
    const entry = {
      id: String(node.id || `node-${items.length + 1}`),
      name: typeof node.name === 'string' ? node.name.slice(0, maxNameLength) : '',
      type,
      depth,
      parentId,
      visible: node.visible !== false,
      dimensions: extractDimensions(node),
      layout: extractLayout(node),
      colors: nodeColors,
    }

    if (textContent !== null) {
      entry.text = textContent
    }
    if (typo) {
      entry.typography = typo
    }

    items.push(entry)

    // Recurse on children if within maxDepth
    if (depth < maxDepth && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (items.length >= maxItems) {
          truncated = true
          break
        }
        walk(child, depth + 1, entry.id)
      }
    } else if (depth >= maxDepth && Array.isArray(node.children) && node.children.length > 0) {
      truncated = true
    }
  }

  walk(rootNode, 0)

  return {
    nodes: items,
    summary: {
      totalNodesScanned,
      nodesRetained: items.length,
      totalFramesCount,
      totalTextNodesCount,
      totalComponentsCount,
      uniqueColorCount: uniqueColors.size,
      colors: Array.from(uniqueColors),
      typography: Array.from(typographyMap.values()),
      maxDepthReached: items.reduce((max, i) => Math.max(max, i.depth), 0),
      truncated,
    },
  }
}

/**
 * Inspects a Figma design file via the official Figma REST API.
 *
 * @param {string} designUrl - Submitted Figma link
 * @param {object} [options]
 * @param {string} [options.accessToken] - Optional token override for testing (defaults to process.env.FIGMA_ACCESS_TOKEN)
 * @param {number} [options.timeoutMs=10000] - Request timeout in ms
 * @param {number} [options.maxDepth=4] - Max document tree depth to traverse
 * @param {number} [options.maxItems=150] - Max node items to retain in evidence
 * @param {number} [options.maxTextLength=200] - Max characters retained per text node
 * @param {Function} [options.fetchImpl] - Optional fetch override for dependency injection / testing
 * @returns {Promise<{ ok: boolean, metadata?: object, evidence?: object, error?: string, statusCode?: number, retryAfter?: number }>}
 */
async function inspectFigmaDesign(designUrl, options = {}) {
  // 1. Validate URL using existing validator (pure URL parsing, zero network calls)
  const validation = validateFigmaUrl(designUrl)
  if (!validation.isValid) {
    return {
      ok: false,
      error: validation.error || 'Invalid Figma URL format',
      statusCode: 400,
    }
  }

  // 2. Read token securely without exposing or logging it
  const token = options.accessToken || process.env.FIGMA_ACCESS_TOKEN
  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      ok: false,
      error: 'FIGMA_ACCESS_TOKEN is not configured on the server. Please set the environment variable.',
      statusCode: 500,
    }
  }

  // 3. Construct strictly the official Figma REST API endpoint over HTTPS
  const fileKey = validation.fileKey
  const queryDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : DEFAULT_MAX_DEPTH
  const apiUrl = new URL(`${FIGMA_API_BASE}/${encodeURIComponent(fileKey)}`)
  apiUrl.searchParams.set('depth', String(queryDepth))

  if (validation.nodeId) {
    apiUrl.searchParams.set('ids', validation.nodeId)
  }

  // 4. Execute fetch with timeout guard
  const fetchFn = options.fetchImpl || globalThis.fetch
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetchFn(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'X-Figma-Token': token.trim(),
        Accept: 'application/json',
        'User-Agent': 'Barabari-UI-UXray-Inspector/1.0',
      },
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError' || controller.signal.aborted) {
      return {
        ok: false,
        error: `Figma API request timed out after ${timeoutMs}ms.`,
        statusCode: 504,
      }
    }
    return {
      ok: false,
      error: 'Failed to establish connection to Figma API.',
      statusCode: 502,
    }
  } finally {
    clearTimeout(timer)
  }

  // 5. Handle HTTP status codes and rate limits safely
  if (!response.ok) {
    const status = response.status
    if (status === 401 || status === 403) {
      return {
        ok: false,
        error: 'Figma file is private or access is restricted. Ensure file sharing is set to "Anyone with the link can view".',
        statusCode: status,
      }
    }
    if (status === 404) {
      return {
        ok: false,
        error: 'Figma file not found. Please verify the URL.',
        statusCode: 404,
      }
    }
    if (status === 429) {
      const retryAfter = response.headers ? response.headers.get('retry-after') : null
      return {
        ok: false,
        error: `Figma API rate limit exceeded.${retryAfter ? ` Retry after ${retryAfter} seconds.` : ' Please try again later.'}`,
        statusCode: 429,
        retryAfter: retryAfter && Number.isFinite(Number(retryAfter)) ? Number(retryAfter) : undefined,
      }
    }
    return {
      ok: false,
      error: `Figma API returned HTTP error ${status}.`,
      statusCode: status,
    }
  }

  // 6. Parse JSON safely
  let data
  try {
    data = await response.json()
  } catch {
    return {
      ok: false,
      error: 'Figma API returned an unparseable response.',
      statusCode: 502,
    }
  }

  if (!data || typeof data !== 'object' || !data.document) {
    return {
      ok: false,
      error: 'Figma API response is missing document structure.',
      statusCode: 502,
    }
  }

  // 7. Normalize bounded factual evidence
  const normalized = normalizeFigmaTree(data.document, {
    maxDepth: options.maxDepth,
    maxItems: options.maxItems,
    maxTextLength: options.maxTextLength,
    maxNameLength: options.maxNameLength,
  })

  return {
    ok: true,
    metadata: {
      fileKey,
      documentName: typeof data.name === 'string' ? data.name.slice(0, 100) : 'Untitled',
      lastModified: typeof data.lastModified === 'string' ? data.lastModified : null,
      version: data.version !== undefined ? String(data.version) : null,
      role: typeof data.role === 'string' ? data.role : null,
    },
    evidence: {
      summary: normalized.summary,
      nodes: normalized.nodes,
    },
    inspectedAt: new Date().toISOString(),
  }
}

module.exports = {
  FIGMA_API_BASE,
  extractDimensions,
  extractHexColor,
  extractLayout,
  extractTypography,
  inspectFigmaDesign,
  normalizeFigmaTree,
}
