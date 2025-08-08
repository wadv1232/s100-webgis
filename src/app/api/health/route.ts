/**
 * @api {GET} /health/ get_health_
 * @apiName GEThealth_
 * @apiGroup 对外数据服务API
 * @apiCategory PUBLIC
 * @apiVersion 1.0.0
 * 
 * @apiDescription GET endpoint for health
 * 
 * @apiCategoryDescription 节点对外提供S-100数据服务的统一入口。对最终用户可见。
 * 
 * @apiAuthentication 推荐使用`Authorization: Bearer <token>`或`?apikey=<key>`进行访问控制。
 * 
 * 
 * @apiSuccess {Response} response HTTP response object
 * 
 * @apiError {Number} code Error code
 * @apiError {String} message Error message
 * 
 * @apiExample {curl} Example usage:
 * curl -X GET http://localhost:3000/health/
 * 
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Good!" });
}