import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint para revalidar el cache de datos
 *
 * Uso: POST /api/revalidate?tag=banners
 *
 * Esto permite invalidar el cache cuando se actualizan banners en el POS
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tag = searchParams.get('tag')

    // Validar que se proporcione un tag
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag parameter is required' },
        { status: 400 }
      )
    }

    // Validar que sea un tag permitido
    const allowedTags = ['banners', 'products', 'categories', 'all']
    if (!allowedTags.includes(tag)) {
      return NextResponse.json(
        { error: `Invalid tag. Allowed tags: ${allowedTags.join(', ')}` },
        { status: 400 }
      )
    }

    // Revalidar el tag específico o todos
    if (tag === 'all') {
      revalidateTag('banners')
      revalidateTag('products')
      revalidateTag('categories')
    } else {
      revalidateTag(tag)
    }

    return NextResponse.json({
      revalidated: true,
      tag,
      now: Date.now(),
      message: `Cache for '${tag}' has been revalidated`
    })
  } catch (error) {
    console.error('Error revalidating cache:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint para información sobre la API
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/revalidate',
    method: 'POST',
    description: 'Revalidate Next.js cache for specific tags',
    parameters: {
      tag: {
        type: 'string',
        required: true,
        allowed: ['banners', 'products', 'categories', 'all'],
        description: 'Cache tag to revalidate'
      }
    },
    examples: [
      'POST /api/revalidate?tag=banners',
      'POST /api/revalidate?tag=products',
      'POST /api/revalidate?tag=all'
    ]
  })
}
