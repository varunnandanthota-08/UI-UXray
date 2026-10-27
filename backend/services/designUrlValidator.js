/**
 * Design URL Validator Service
 *
 * Validates design submission URLs (Figma & Canva) for security, correct hostname,
 * protocol, and format, without performing external network requests (SSRF prevention).
 */

const APPROVED_FIGMA_HOSTS = new Set(['figma.com', 'www.figma.com'])
const FIGMA_PATH_TYPES = new Set(['file', 'design', 'proto', 'board'])
const CANVA_HOST_REGEX = /^(?:[a-zA-Z0-9-]+\.)*canva\.(?:com|link)$/i
const FIGMA_FILE_KEY_REGEX = /^[a-zA-Z0-9_-]{5,128}$/
const NODE_ID_REGEX = /^(\d{1,10})[-:](\d{1,10})$/
const PRIVATE_IP_REGEX = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|0\.0\.0\.0|localhost|::1|\[::1\])/i

const CANVA_GUIDANCE_MESSAGE =
  'Canva links cannot be inspected directly by the automated evaluation pipeline. The current workflow requires an exported PDF or PNG file instead.'

/**
 * Checks whether a URL points to a Canva domain.
 * Pure string parsing; does not make any network calls.
 *
 * @param {string} urlString
 * @returns {boolean}
 */
function isCanvaUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false
  const trimmed = urlString.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    return CANVA_HOST_REGEX.test(parsed.hostname.toLowerCase())
  } catch {
    return false
  }
}

/**
 * Validates a Figma URL according to security constraints:
 * - Must be HTTPS
 * - Host must be strictly figma.com or www.figma.com
 * - No credentials (user:pass)
 * - Standard HTTPS port only (443 or default)
 * - Path must be one of file, design, proto, board with a valid file key
 * - Rejects deceptive hosts, HTTP, and private/internal destinations
 * - Pure parsing; zero external network requests
 *
 * @param {string} urlString
 * @param {object} [options]
 * @param {boolean} [options.optional=false] - If true, empty/null values return isValid: true with isEmpty: true
 * @returns {{ isValid: boolean, isEmpty?: boolean, isCanva?: boolean, url?: string|null, host?: string|null, pathType?: string|null, fileKey?: string|null, nodeId?: string|null, error?: string|null, message?: string|null }}
 */
function validateFigmaUrl(urlString, options = {}) {
  const { optional = false } = options

  if (!urlString || typeof urlString !== 'string' || !urlString.trim()) {
    if (optional) {
      return { isValid: true, isEmpty: true, url: null, fileKey: null, nodeId: null, error: null }
    }
    return { isValid: false, isEmpty: true, error: 'Figma URL is required', fileKey: null, nodeId: null }
  }

  const raw = urlString.trim()
  if (raw.length > 2048) {
    return { isValid: false, error: 'URL exceeds maximum length of 2048 characters', fileKey: null, nodeId: null }
  }

  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    return { isValid: false, error: 'Malformed URL format', fileKey: null, nodeId: null }
  }

  // 1. Enforce HTTPS only
  if (parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: 'Insecure protocol: only HTTPS URLs are allowed',
      fileKey: null,
      nodeId: null,
    }
  }

  // 2. Reject embedded credentials (e.g. https://user:pass@figma.com/...)
  if (parsed.username || parsed.password) {
    return {
      isValid: false,
      error: 'URLs with embedded credentials are not allowed',
      fileKey: null,
      nodeId: null,
    }
  }

  // 3. Reject non-standard ports
  if (parsed.port && parsed.port !== '443' && parsed.port !== '') {
    return {
      isValid: false,
      error: 'Unexpected port specified in URL',
      fileKey: null,
      nodeId: null,
    }
  }

  const host = parsed.hostname.toLowerCase()

  // 4. Detect Canva links and provide clear workflow guidance
  if (CANVA_HOST_REGEX.test(host)) {
    return {
      isValid: false,
      isCanva: true,
      error: CANVA_GUIDANCE_MESSAGE,
      message: CANVA_GUIDANCE_MESSAGE,
      fileKey: null,
      nodeId: null,
    }
  }

  // 5. Hostname check against approved list & explicit rejection categories
  if (!APPROVED_FIGMA_HOSTS.has(host)) {
    if (PRIVATE_IP_REGEX.test(host)) {
      return {
        isValid: false,
        error: 'Private or internal network destinations are not allowed',
        fileKey: null,
        nodeId: null,
      }
    }

    if (host.includes('figma')) {
      return {
        isValid: false,
        error: `Deceptive or unsupported Figma hostname "${host}"`,
        fileKey: null,
        nodeId: null,
      }
    }

    return {
      isValid: false,
      error: `Invalid design host "${host}". Only official Figma URLs are supported.`,
      fileKey: null,
      nodeId: null,
    }
  }

  // 6. Validate path and extract file key
  const pathSegments = parsed.pathname.split('/').filter(Boolean)
  if (pathSegments.length < 2) {
    return {
      isValid: false,
      error: 'Figma URL path must specify a design type (file, design, proto, board) and file key',
      fileKey: null,
      nodeId: null,
    }
  }

  const pathType = pathSegments[0].toLowerCase()
  if (!FIGMA_PATH_TYPES.has(pathType)) {
    return {
      isValid: false,
      error: `Unsupported Figma path type "${pathType}". Expected file, design, proto, or board.`,
      fileKey: null,
      nodeId: null,
    }
  }

  const rawKey = pathSegments[1]
  if (!FIGMA_FILE_KEY_REGEX.test(rawKey)) {
    return {
      isValid: false,
      error: 'Invalid or missing Figma file key in URL',
      fileKey: null,
      nodeId: null,
    }
  }

  // 7. Extract optional node-id if present
  let nodeId = null
  const nodeParam = parsed.searchParams.get('node-id')
  if (nodeParam) {
    const nodeMatch = NODE_ID_REGEX.exec(nodeParam)
    if (nodeMatch) {
      nodeId = `${nodeMatch[1]}:${nodeMatch[2]}`
    } else {
      nodeId = nodeParam
    }
  }

  return {
    isValid: true,
    url: parsed.href,
    host,
    pathType,
    fileKey: rawKey,
    nodeId,
    error: null,
  }
}

/**
 * Validates any design URL submitted by a student.
 * If Canva is detected, flags isCanva: true and returns guidance.
 *
 * @param {string} urlString
 * @param {object} [options]
 */
function validateDesignUrl(urlString, options = {}) {
  if (isCanvaUrl(urlString)) {
    return {
      isValid: false,
      isCanva: true,
      urlType: 'canva',
      error: CANVA_GUIDANCE_MESSAGE,
      message: CANVA_GUIDANCE_MESSAGE,
      fileKey: null,
      nodeId: null,
    }
  }

  const result = validateFigmaUrl(urlString, options)
  return {
    ...result,
    urlType: result.isValid ? 'figma' : result.isCanva ? 'canva' : 'unknown',
  }
}

module.exports = {
  CANVA_GUIDANCE_MESSAGE,
  isCanvaUrl,
  validateDesignUrl,
  validateFigmaUrl,
}
