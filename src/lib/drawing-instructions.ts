/**
 * 绘图指令处理服务
 * 用于生成、解析和执行地理要素绘图指令
 * 支持后端渲染和 S-100 产品底图显示
 */

export interface DrawingInstruction {
  id: string
  type: 'draw' | 'edit' | 'delete' | 'style'
  featureType: string
  geometry: any
  properties?: Record<string, any>
  style?: Record<string, any>
  timestamp: number
}

export interface RenderedFeature {
  id: string
  type: string
  geometry: any
  properties: Record<string, any>
  style: Record<string, any>
  rendered: boolean
  renderTime?: number
}

export interface RenderingContext {
  canvas?: HTMLCanvasElement
  context?: CanvasRenderingContext2D
  scale: number
  offset: { x: number; y: number }
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
}

/**
 * 绘图指令生成器
 */
export class DrawingInstructionGenerator {
  /**
   * 从地理要素生成绘图指令
   */
  static generateFromFeature(feature: any): DrawingInstruction {
    return {
      id: `instruction_${feature.id}_${Date.now()}`,
      type: 'draw',
      featureType: feature.type,
      geometry: feature.geometry,
      properties: feature.properties || {},
      style: feature.style || {},
      timestamp: Date.now()
    }
  }

  /**
   * 生成编辑指令
   */
  static generateEditInstruction(
    featureId: string,
    updates: Partial<DrawingInstruction>
  ): DrawingInstruction {
    return {
      id: `edit_${featureId}_${Date.now()}`,
      type: 'edit',
      featureType: updates.featureType || 'unknown',
      geometry: updates.geometry || {},
      properties: updates.properties || {},
      style: updates.style || {},
      timestamp: Date.now()
    }
  }

  /**
   * 生成删除指令
   */
  static generateDeleteInstruction(featureId: string): DrawingInstruction {
    return {
      id: `delete_${featureId}_${Date.now()}`,
      type: 'delete',
      featureType: 'unknown',
      geometry: {},
      timestamp: Date.now()
    }
  }

  /**
   * 生成样式修改指令
   */
  static generateStyleInstruction(
    featureId: string,
    style: Record<string, any>
  ): DrawingInstruction {
    return {
      id: `style_${featureId}_${Date.now()}`,
      type: 'style',
      featureType: 'unknown',
      geometry: {},
      style,
      timestamp: Date.now()
    }
  }

  /**
   * 批量生成指令
   */
  static generateBatch(features: any[]): DrawingInstruction[] {
    return features.map(feature => this.generateFromFeature(feature))
  }
}

/**
 * 绘图指令解析器
 */
export class DrawingInstructionParser {
  /**
   * 解析指令字符串
   */
  static parseFromString(instructionString: string): DrawingInstruction {
    try {
      return JSON.parse(instructionString) as DrawingInstruction
    } catch (error) {
      throw new Error(`Invalid instruction format: ${error}`)
    }
  }

  /**
   * 验证指令格式
   */
  static validate(instruction: DrawingInstruction): boolean {
    const requiredFields = ['id', 'type', 'featureType', 'geometry', 'timestamp']
    return requiredFields.every(field => field in instruction)
  }

  /**
   * 过滤指令类型
   */
  static filterByType(instructions: DrawingInstruction[], type: string): DrawingInstruction[] {
    return instructions.filter(instruction => instruction.type === type)
  }

  /**
   * 按时间排序指令
   */
  static sortByTime(instructions: DrawingInstruction[], ascending = true): DrawingInstruction[] {
    return [...instructions].sort((a, b) => {
      return ascending ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    })
  }
}

/**
 * Canvas 渲染器
 * 用于后端渲染绘图指令到 Canvas
 */
export class CanvasRenderer {
  private context: RenderingContext

  constructor(context: RenderingContext) {
    this.context = context
  }

  /**
   * 执行绘图指令
   */
  async executeInstruction(instruction: DrawingInstruction): Promise<RenderedFeature> {
    const startTime = Date.now()
    
    try {
      switch (instruction.type) {
        case 'draw':
          return await this.drawFeature(instruction)
        case 'edit':
          return await this.editFeature(instruction)
        case 'delete':
          return await this.deleteFeature(instruction)
        case 'style':
          return await this.applyStyle(instruction)
        default:
          throw new Error(`Unknown instruction type: ${instruction.type}`)
      }
    } catch (error) {
      throw new Error(`Failed to execute instruction: ${error}`)
    }
  }

  /**
   * 绘制要素
   */
  private async drawFeature(instruction: DrawingInstruction): Promise<RenderedFeature> {
    if (!this.context.context) {
      throw new Error('Rendering context not available')
    }

    const ctx = this.context.context
    const { geometry, style } = instruction

    // 设置样式
    this.applyContextStyle(ctx, style)

    // 根据几何类型绘制
    switch (geometry.type) {
      case 'Point':
        this.drawPoint(geometry.coordinates, style)
        break
      case 'LineString':
        this.drawLineString(geometry.coordinates, style)
        break
      case 'Polygon':
        this.drawPolygon(geometry.coordinates, style)
        break
      default:
        throw new Error(`Unsupported geometry type: ${geometry.type}`)
    }

    return {
      id: instruction.id,
      type: instruction.featureType,
      geometry,
      properties: instruction.properties || {},
      style: style || {},
      rendered: true,
      renderTime: Date.now()
    }
  }

  /**
   * 编辑要素
   */
  private async editFeature(instruction: DrawingInstruction): Promise<RenderedFeature> {
    // 简化实现：重新绘制要素
    return await this.drawFeature(instruction)
  }

  /**
   * 删除要素
   */
  private async deleteFeature(instruction: DrawingInstruction): Promise<RenderedFeature> {
    // Canvas 渲染中删除需要重绘整个场景
    // 这里返回标记为已删除的要素
    return {
      id: instruction.id,
      type: instruction.featureType,
      geometry: instruction.geometry,
      properties: instruction.properties || {},
      style: instruction.style || {},
      rendered: false,
      renderTime: Date.now()
    }
  }

  /**
   * 应用样式
   */
  private async applyStyle(instruction: DrawingInstruction): Promise<RenderedFeature> {
    // 样式修改需要重新绘制要素
    return await this.drawFeature(instruction)
  }

  /**
   * 绘制点
   */
  private drawPoint(coordinates: number[], style: Record<string, any>) {
    if (!this.context.context) return

    const ctx = this.context.context
    const [lng, lat] = coordinates
    const { x, y } = this.geoToCanvas(lng, lat)

    ctx.beginPath()
    ctx.arc(x, y, style.radius || 5, 0, 2 * Math.PI)
    ctx.fill()
    
    if (style.color) {
      ctx.strokeStyle = style.color
      ctx.lineWidth = style.weight || 1
      ctx.stroke()
    }
  }

  /**
   * 绘制线
   */
  private drawLineString(coordinates: number[][], style: Record<string, any>) {
    if (!this.context.context) return

    const ctx = this.context.context
    
    if (coordinates.length < 2) return

    ctx.beginPath()
    
    const [startLng, startLat] = coordinates[0]
    const { x: startX, y: startY } = this.geoToCanvas(startLng, startLat)
    ctx.moveTo(startX, startY)

    for (let i = 1; i < coordinates.length; i++) {
      const [lng, lat] = coordinates[i]
      const { x, y } = this.geoToCanvas(lng, lat)
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  /**
   * 绘制多边形
   */
  private drawPolygon(coordinates: number[][][], style: Record<string, any>) {
    if (!this.context.context) return

    const ctx = this.context.context
    const rings = coordinates

    if (rings.length === 0) return

    // 绘制外环
    const exteriorRing = rings[0]
    if (exteriorRing.length < 3) return

    ctx.beginPath()
    
    const [startLng, startLat] = exteriorRing[0]
    const { x: startX, y: startY } = this.geoToCanvas(startLng, startLat)
    ctx.moveTo(startX, startY)

    for (let i = 1; i < exteriorRing.length; i++) {
      const [lng, lat] = exteriorRing[i]
      const { x, y } = this.geoToCanvas(lng, lat)
      ctx.lineTo(x, y)
    }

    ctx.closePath()

    // 填充
    if (style.fillColor && style.fillOpacity !== 0) {
      ctx.globalAlpha = style.fillOpacity || 0.2
      ctx.fillStyle = style.fillColor
      ctx.fill()
      ctx.globalAlpha = 1.0
    }

    // 描边
    ctx.stroke()
  }

  /**
   * 应用上下文样式
   */
  private applyContextStyle(ctx: CanvasRenderingContext2D, style: Record<string, any>) {
    if (style.color) {
      ctx.strokeStyle = style.color
    }
    if (style.fillColor) {
      ctx.fillStyle = style.fillColor
    }
    if (style.weight) {
      ctx.lineWidth = style.weight
    }
    if (style.opacity !== undefined) {
      ctx.globalAlpha = style.opacity
    }
  }

  /**
   * 地理坐标转 Canvas 坐标
   */
  private geoToCanvas(lng: number, lat: number): { x: number; y: number } {
    const { bounds, scale, offset } = this.context
    
    // 简化的墨卡托投影
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * scale + offset.x
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * scale + offset.y
    
    return { x, y }
  }
}

/**
 * S-100 绘图指令处理器
 * 专门用于 S-100 产品的底图显示
 */
export class S100DrawingProcessor {
  /**
   * 生成 S-100 兼容的绘图指令
   */
  static generateS100Instructions(features: any[]): DrawingInstruction[] {
    return features.map(feature => {
      const instruction = DrawingInstructionGenerator.generateFromFeature(feature)
      
      // 添加 S-100 特定属性
      instruction.properties = {
        ...instruction.properties,
        s100_compatible: true,
        s100_product: feature.properties?.s100_product || 'UNKNOWN',
        s100_version: feature.properties?.s100_version || '1.0'
      }
      
      return instruction
    })
  }

  /**
   * 验证 S-100 指令
   */
  static validateS100Instruction(instruction: DrawingInstruction): boolean {
    if (!DrawingInstructionParser.validate(instruction)) {
      return false
    }
    
    // 检查 S-100 特定要求
    return (
      instruction.properties?.s100_compatible === true &&
      instruction.properties?.s100_product !== undefined &&
      instruction.properties?.s100_version !== undefined
    )
  }

  /**
   * 转换为 S-100 渲染格式
   */
  static convertToS100Format(instructions: DrawingInstruction[]): any[] {
    return instructions.map(instruction => ({
      instruction_id: instruction.id,
      operation: instruction.type,
      feature_type: instruction.featureType,
      geometry: instruction.geometry,
      styling: instruction.style,
      metadata: {
        ...instruction.properties,
        timestamp: instruction.timestamp,
        s100_format: true
      }
    }))
  }
}

/**
 * 导出工具函数
 */
export const DrawingInstructions = {
  generate: DrawingInstructionGenerator.generateFromFeature,
  generateBatch: DrawingInstructionGenerator.generateBatch,
  parse: DrawingInstructionParser.parseFromString,
  validate: DrawingInstructionParser.validate,
  filter: DrawingInstructionParser.filterByType,
  sort: DrawingInstructionParser.sortByTime,
  generateS100: S100DrawingProcessor.generateS100Instructions,
  validateS100: S100DrawingProcessor.validateS100Instruction,
  convertToS100: S100DrawingProcessor.convertToS100Format
}