import { NextRequest, NextResponse } from 'next/server'
import { 
  DrawingInstruction, 
  DrawingInstructions,
  CanvasRenderer,
  S100DrawingProcessor 
} from '@/lib/drawing-instructions'

/**
 * 绘图指令 API 端点
 * 支持生成、验证和执行绘图指令
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'generate':
        return handleGenerateInstructions(data)
      
      case 'validate':
        return handleValidateInstructions(data)
      
      case 'render':
        return handleRenderInstructions(data)
      
      case 's100_convert':
        return handleS100Convert(data)
      
      case 'batch_process':
        return handleBatchProcess(data)
      
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Drawing instructions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 生成绘图指令
 */
async function handleGenerateInstructions(data: any) {
  const { features, options = {} } = data
  
  if (!Array.isArray(features)) {
    return NextResponse.json(
      { error: 'Features must be an array' },
      { status: 400 }
    )
  }

  try {
    let instructions: DrawingInstruction[]
    
    if (options.s100Compatible) {
      instructions = S100DrawingProcessor.generateS100Instructions(features)
    } else {
      instructions = DrawingInstructions.generateBatch(features)
    }

    return NextResponse.json({
      success: true,
      instructions,
      count: instructions.length,
      metadata: {
        generatedAt: new Date().toISOString(),
        s100Compatible: options.s100Compatible || false
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to generate instructions: ${error}` },
      { status: 500 }
    )
  }
}

/**
 * 验证绘图指令
 */
async function handleValidateInstructions(data: any) {
  const { instructions } = data
  
  if (!Array.isArray(instructions)) {
    return NextResponse.json(
      { error: 'Instructions must be an array' },
      { status: 400 }
    )
  }

  try {
    const validationResults = instructions.map((instruction, index) => {
      const isValid = DrawingInstructions.validate(instruction)
      const isS100Valid = S100DrawingProcessor.validateS100Instruction(instruction)
      
      return {
        index,
        id: instruction.id,
        valid: isValid,
        s100Valid: isS100Valid,
        errors: isValid ? [] : ['Invalid instruction format']
      }
    })

    const validCount = validationResults.filter(r => r.valid).length
    const s100ValidCount = validationResults.filter(r => r.s100Valid).length

    return NextResponse.json({
      success: true,
      validationResults,
      summary: {
        total: instructions.length,
        valid: validCount,
        invalid: instructions.length - validCount,
        s100Valid: s100ValidCount,
        s100Invalid: instructions.length - s100ValidCount
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to validate instructions: ${error}` },
      { status: 500 }
    )
  }
}

/**
 * 渲染绘图指令
 */
async function handleRenderInstructions(data: any) {
  const { instructions, renderOptions = {} } = data
  
  if (!Array.isArray(instructions)) {
    return NextResponse.json(
      { error: 'Instructions must be an array' },
      { status: 400 }
    )
  }

  try {
    // 模拟渲染过程
    const renderResults = await Promise.all(
      instructions.map(async (instruction, index) => {
        const startTime = Date.now()
        
        // 模拟渲染延迟
        await new Promise(resolve => setTimeout(resolve, 10))
        
        return {
          index,
          id: instruction.id,
          rendered: true,
          renderTime: Date.now() - startTime,
          success: true
        }
      })
    )

    const totalRenderTime = renderResults.reduce((sum, result) => sum + result.renderTime, 0)
    const successCount = renderResults.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      renderResults,
      summary: {
        total: instructions.length,
        success: successCount,
        failed: instructions.length - successCount,
        totalRenderTime,
        averageRenderTime: totalRenderTime / instructions.length
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to render instructions: ${error}` },
      { status: 500 }
    )
  }
}

/**
 * 转换为 S-100 格式
 */
async function handleS100Convert(data: any) {
  const { instructions } = data
  
  if (!Array.isArray(instructions)) {
    return NextResponse.json(
      { error: 'Instructions must be an array' },
      { status: 400 }
    )
  }

  try {
    const s100Format = S100DrawingProcessor.convertToS100Format(instructions)

    return NextResponse.json({
      success: true,
      s100Format,
      originalCount: instructions.length,
      convertedCount: s100Format.length,
      metadata: {
        convertedAt: new Date().toISOString(),
        format: 'S-100 Drawing Instructions v1.0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to convert to S-100 format: ${error}` },
      { status: 500 }
    )
  }
}

/**
 * 批量处理绘图指令
 */
async function handleBatchProcess(data: any) {
  const { operations } = data
  
  if (!Array.isArray(operations)) {
    return NextResponse.json(
      { error: 'Operations must be an array' },
      { status: 400 }
    )
  }

  try {
    const results = await Promise.all(
      operations.map(async (operation, index) => {
        const { action, data: opData } = operation
        
        switch (action) {
          case 'generate':
            const instructions = DrawingInstructions.generateBatch(opData.features || [])
            return { index, action, success: true, result: { instructions, count: instructions.length } }
          
          case 'validate':
            const validationResults = (opData.instructions || []).map((instruction: any, i: number) => ({
              index: i,
              valid: DrawingInstructions.validate(instruction)
            }))
            return { index, action, success: true, result: { validationResults } }
          
          case 's100_convert':
            const s100Format = S100DrawingProcessor.convertToS100Format(opData.instructions || [])
            return { index, action, success: true, result: { s100Format, count: s100Format.length } }
          
          default:
            return { index, action, success: false, error: 'Unknown operation' }
        }
      })
    )

    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: operations.length,
        success: successCount,
        failed: operations.length - successCount
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process batch operations: ${error}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Drawing Instructions API',
    version: '1.0.0',
    endpoints: {
      generate: 'Generate drawing instructions from features',
      validate: 'Validate drawing instructions format',
      render: 'Execute drawing instructions for rendering',
      s100_convert: 'Convert instructions to S-100 format',
      batch_process: 'Process multiple operations in batch'
    },
    supportedFeatures: [
      'Point, LineString, Polygon geometry types',
      'Draw, Edit, Delete, Style operations',
      'S-100 product compatibility',
      'Canvas rendering backend',
      'Batch processing',
      'Instruction validation'
    ]
  })
}