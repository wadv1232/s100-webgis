import { NextRequest, NextResponse } from 'next/server'
import { datasetService } from '@/lib/services/dataset-service'
import { handleError, formatErrorResponse, logError } from '@/lib/utils/errors'

// GET /api/datasets - Get all datasets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const productType = searchParams.get('productType')
    const status = searchParams.get('status')
    const nodeId = searchParams.get('nodeId')
    const search = searchParams.get('search')

    const params: any = {
      page,
      limit
    }

    if (productType) {
      params.productType = productType
    }

    if (status) {
      params.status = status
    }

    if (nodeId) {
      params.nodeId = nodeId
    }

    if (search) {
      params.search = search
    }

    const result = await datasetService.getDatasets(params)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    const appError = handleError(error)
    logError(appError, { url: request.url, method: 'GET' })
    
    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}

// POST /api/datasets - Create new dataset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, productType, version, fileName, filePath, fileSize, mimeType, coverage, metadata, nodeId } = body

    const result = await datasetService.createDataset({
      name,
      description,
      productType,
      version,
      fileName,
      filePath,
      fileSize,
      mimeType,
      coverage,
      metadata,
      nodeId
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })
  } catch (error) {
    const appError = handleError(error)
    logError(appError, { url: request.url, method: 'POST' })
    
    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}