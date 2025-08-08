'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/auth/permissions'
import { Permission, UserRole } from '@prisma/client'
import {
  FileText,
  Copy,
  Download,
  Code,
  Database,
  Map,
  Globe,
  Terminal,
  CheckCircle,
  ExternalLink,
  Github,
  Package,
  Braces,
  Coffee
} from 'lucide-react'

export default function CodeExamples() {
  const { user } = useAuth()
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedCategory, setSelectedCategory] = useState('all')

  if (!user || !hasPermission(user.role as UserRole, Permission.API_READ)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              访问受限
            </CardTitle>
            <CardDescription>
              您需要登录并拥有API访问权限才能查看代码示例
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'}>
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 代码示例数据
  const codeExamples = [
    {
      category: '基础认证',
      description: 'API认证和基础请求',
      examples: {
        javascript: {
          title: 'JavaScript SDK 基础使用',
          code: `// 导入SDK
import { S100Client } from 's100-maritime-sdk';

// 初始化客户端
const client = new S100Client({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.example.com'
});

// 获取S-101电子海图数据
async function getNauticalChart() {
  try {
    const response = await client.s101.wfs.getFeatures({
      bbox: '120.0,30.0,122.0,32.0',
      featureCodes: ['DEPARE', 'DRGARE'],
      format: 'GeoJSON'
    });
    
    console.log('获取到要素数量:', response.features.length);
    return response.features;
  } catch (error) {
    console.error('API调用失败:', error);
  }
}

// 使用示例
getNauticalChart().then(features => {
  features.forEach(feature => {
    console.log('要素类型:', feature.properties.featureCode);
  });
});`,
          dependencies: ['s100-maritime-sdk'],
          install: 'npm install s100-maritime-sdk'
        },
        python: {
          title: 'Python SDK 基础使用',
          code: `# 导入SDK
import s100_maritime
import matplotlib.pyplot as plt

# 初始化客户端
client = s100_maritime.Client(
    api_key='YOUR_API_KEY',
    base_url='https://api.example.com'
)

# 获取S-102高精度水深数据
def get_bathymetry_data():
    try:
        response = client.s102.wcs.get_coverage({
            bbox: '120.0,30.0,122.0,32.0',
            format: 'GeoTIFF',
            resolution: '1m'
        })
        
        # 保存为文件
        with open('bathymetry.tif', 'wb') as f:
            f.write(response.data)
        
        print('水深数据已保存为 bathymetry.tif')
        return response
    except Exception as e:
        print(f'API调用失败: {e}')

# 使用示例
get_bathymetry_data()`,
          dependencies: ['s100-maritime', 'matplotlib'],
          install: 'pip install s100-maritime matplotlib'
        },
        java: {
          title: 'Java SDK 基础使用',
          code: `// 导入SDK
import org.iho.s100.*;
import org.iho.s100.client.*;

public class MaritimeDataExample {
    public static void main(String[] args) {
        // 初始化客户端
        S100Client client = new S100Client.Builder()
            .apiKey("YOUR_API_KEY")
            .baseUrl("https://api.example.com")
            .build();
        
        try {
            // 获取服务能力
            CapabilitiesResponse capabilities = client.getCapabilities();
            System.out.println("可用服务数量: " + capabilities.getServices().size());
            
            // 获取S-101数据
            WFSService wfsService = client.getS101WFSService();
            GetFeaturesRequest request = new GetFeaturesRequest.Builder()
                .bbox("120.0,30.0,122.0,32.0")
                .featureCodes(Arrays.asList("DEPARE", "DRGARE"))
                .build();
            
            FeatureCollection features = wfsService.getFeatures(request);
            System.out.println("获取到要素数量: " + features.getFeatures().size());
            
        } catch (S100Exception e) {
            System.err.println("API调用失败: " + e.getMessage());
        }
    }
}`,
          dependencies: ['s100-maritime-java-sdk'],
          install: 'implementation "org.iho:s100-maritime:1.0.0"'
        },
        curl: {
          title: 'cURL 基础请求',
          code: `# 获取S-101电子海图数据
curl -X GET "https://api.example.com/api/v1/s101/wfs" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -G \\
  --data-urlencode "bbox=120.0,30.0,122.0,32.0" \\
  --data-urlencode "featureCodes=DEPARE,DRGARE"

# 获取S-102高精度水深数据
curl -X GET "https://api.example.com/api/v1/s102/wcs" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -G \\
  --data-urlencode "SERVICE=WCS" \\
  --data-urlencode "VERSION=2.0.1" \\
  --data-urlencode "REQUEST=GetCoverage" \\
  --data-urlencode "COVERAGE=s102_bathymetry" \\
  --data-urlencode "FORMAT=GeoTIFF" \\
  --data-urlencode "BBOX=120.0,30.0,122.0,32.0"`,
          dependencies: [],
          install: ''
        }
      }
    },
    {
      category: '数据处理',
      description: '数据获取和处理示例',
      examples: {
        javascript: {
          title: '数据处理和可视化',
          code: `import { S100Client } from 's100-maritime-sdk';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 初始化地图
const map = L.map('map').setView([31.0, 121.0], 10);

// 添加底图
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 初始化S100客户端
const client = new S100Client({
  apiKey: 'YOUR_API_KEY'
});

// 获取并显示水深数据
async function displayBathymetry() {
  try {
    // 获取S-102水深数据
    const bathymetryData = await client.s102.wcs.getCoverage({
      bbox: '120.5,30.5,121.5,31.5',
      format: 'GeoTIFF'
    });
    
    // 转换为GeoJSON并添加到地图
    const geoJsonLayer = L.geoJSON(bathymetryData.toGeoJSON(), {
      style: function(feature) {
        const depth = feature.properties.depth;
        return {
          fillColor: getDepthColor(depth),
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
        };
      }
    }).addTo(map);
    
    // 添加图例
    addLegend(map);
    
  } catch (error) {
    console.error('获取水深数据失败:', error);
  }
}

// 根据深度获取颜色
function getDepthColor(depth) {
  if (depth < 0) return '#000080'; // 深蓝
  if (depth < 10) return '#0000FF'; // 蓝
  if (depth < 20) return '#00FFFF'; // 青
  if (depth < 50) return '#00FF00'; // 绿
  return '#FFFF00'; // 黄
}

// 添加图例
function addLegend(map) {
  const legend = L.control({position: 'bottomright'});
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const depths = [0, 10, 20, 50];
    const colors = ['#000080', '#0000FF', '#00FFFF', '#00FF00', '#FFFF00'];
    
    let labels = ['<strong>水深 (m)</strong>'];
    for (let i = 0; i < depths.length; i++) {
      labels.push(
        '<i style="background:' + colors[i] + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' m' : '+ m')
      );
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };
  legend.addTo(map);
}

// 执行
displayBathymetry();`,
          dependencies: ['s100-maritime-sdk', 'leaflet'],
          install: 'npm install s100-maritime-sdk leaflet'
        },
        python: {
          title: '数据分析和可视化',
          code: `import s100_maritime
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.basemap import Basemap
import geopandas as gpd

# 初始化客户端
client = s100_maritime.Client(api_key='YOUR_API_KEY')

# 获取S-101电子海图数据
def get_and_analyze_nautical_chart():
    try:
        # 获取电子海图数据
        response = client.s101.wfs.get_features({
            bbox: '120.0,30.0,122.0,32.0',
            feature_codes: ['DEPARE', 'DRGARE', 'BUAARE']
        })
        
        # 转换为GeoDataFrame
        gdf = gpd.GeoDataFrame.from_features(response.features)
        
        # 数据分析
        print(f"总要素数量: {len(gdf)}")
        print(f"要素类型分布:")
        print(gdf['featureCode'].value_counts())
        
        # 水深统计分析
        depth_features = gdf[gdf['featureCode'] == 'DEPARE']
        if not depth_features.empty and 'depth' in depth_features.columns:
            depths = depth_features['depth']
            print(f"水深统计:")
            print(f"  平均水深: {depths.mean():.2f} m")
            print(f"  最大水深: {depths.max():.2f} m")
            print(f"  最小水深: {depths.min():.2f} m")
            print(f"  标准差: {depths.std():.2f} m")
        
        # 创建地图可视化
        create_map_visualization(gdf)
        
        return gdf
        
    except Exception as e:
        print(f"数据处理失败: {e}")
        return None

def create_map_visualization(gdf):
    """创建地图可视化"""
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # 创建底图
    m = Basemap(
        llcrnrlon=120.0, llcrnrlat=30.0,
        urcrnrlon=122.0, urcrnrlat=32.0,
        resolution='h', projection='merc'
    )
    
    # 绘制海岸线
    m.drawcoastlines()
    m.drawcountries()
    m.drawmapboundary(fill_color='lightblue')
    
    # 转换坐标系并绘制要素
    for idx, row in gdf.iterrows():
        if row.geometry.geom_type == 'Polygon':
            x, y = row.geometry.exterior.xy
            x_proj, y_proj = m(list(x), list(y))
            m.plot(x_proj, y_proj, 'r-', linewidth=1)
    
    plt.title('S-101电子海图数据可视化')
    plt.xlabel('经度')
    plt.ylabel('纬度')
    plt.colorbar(label='水深 (m)')
    plt.tight_layout()
    plt.savefig('nautical_chart.png', dpi=300, bbox_inches='tight')
    plt.show()

# 执行分析
chart_data = get_and_analyze_nautical_chart()`,
          dependencies: ['s100-maritime', 'pandas', 'matplotlib', 'numpy', 'geopandas', 'basemap'],
          install: 'pip install s100-maritime pandas matplotlib numpy geopandas basemap'
        },
        java: {
          title: '企业级数据处理',
          code: `import org.iho.s100.*;
import org.iho.s100.client.*;
import org.iho.s100.processing.*;
import org.geojson.*;
import java.util.List;
import java.util.Arrays;

public class MaritimeDataProcessor {
    private final S100Client client;
    
    public MaritimeDataProcessor(String apiKey) {
        this.client = new S100Client.Builder()
            .apiKey(apiKey)
            .baseUrl("https://api.example.com")
            .build();
    }
    
    /**
     * 获取并处理S-101电子海图数据
     */
    public ProcessedNauticalData processNauticalChart(String bbox) throws S100Exception {
        // 获取原始数据
        WFSService wfsService = client.getS101WFSService();
        GetFeaturesRequest request = new GetFeaturesRequest.Builder()
            .bbox(bbox)
            .featureCodes(Arrays.asList("DEPARE", "DRGARE", "BUAARE"))
            .build();
        
        FeatureCollection rawFeatures = wfsService.getFeatures(request);
        
        // 数据处理
        DataProcessor processor = new DataProcessor();
        ProcessedNauticalData processedData = processor.processNauticalData(rawFeatures);
        
        // 数据验证
        DataValidator validator = new DataValidator();
        ValidationResult validationResult = validator.validate(processedData);
        
        if (!validationResult.isValid()) {
            throw new S100Exception("数据验证失败: " + validationResult.getErrors());
        }
        
        return processedData;
    }
    
    /**
     * 生成航行安全报告
     */
    public NavigationSafetyReport generateSafetyReport(ProcessedNauticalData data) {
        SafetyAnalyzer analyzer = new SafetyAnalyzer();
        
        // 分析水深数据
        DepthAnalysis depthAnalysis = analyzer.analyzeDepths(data.getDepthFeatures());
        
        // 分析碍航物
        ObstacleAnalysis obstacleAnalysis = analyzer.analyzeObstacles(data.getObstacleFeatures());
        
        // 生成报告
        NavigationSafetyReport report = new NavigationSafetyReport.Builder()
            .depthAnalysis(depthAnalysis)
            .obstacleAnalysis(obstacleAnalysis)
            .generatedAt(java.time.LocalDateTime.now())
            .build();
        
        return report;
    }
    
    /**
     * 导出为多种格式
     */
    public void exportData(ProcessedNauticalData data, String outputPath) {
        DataExporter exporter = new DataExporter();
        
        // 导出为GeoJSON
        exporter.exportToGeoJSON(data, outputPath + ".geojson");
        
        // 导出为Shapefile
        exporter.exportToShapefile(data, outputPath + ".shp");
        
        // 导出为PDF报告
        ReportGenerator reportGenerator = new ReportGenerator();
        reportGenerator.generatePDFReport(data, outputPath + ".pdf");
    }
    
    public static void main(String[] args) {
        try {
            MaritimeDataProcessor processor = new MaritimeDataProcessor("YOUR_API_KEY");
            
            // 处理数据
            ProcessedNauticalData data = processor.processNauticalChart("120.0,30.0,122.0,32.0");
            
            // 生成安全报告
            NavigationSafetyReport report = processor.generateSafetyReport(data);
            
            // 导出数据
            processor.exportData(data, "shanghai_port_nautical_data");
            
            System.out.println("数据处理完成！");
            System.out.println("发现碍航物: " + report.getObstacleAnalysis().getObstacleCount());
            System.out.println("最小安全水深: " + report.getDepthAnalysis().getMinimumSafeDepth() + "m");
            
        } catch (Exception e) {
            System.err.println("处理失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`,
          dependencies: ['s100-maritime-java-sdk', 'geojson-java'],
          install: 'implementation "org.iho:s100-maritime:1.0.0"\\nimplementation "org.geojson:geojson:1.0.0"'
        },
        curl: {
          title: '批量数据获取',
          code: `#!/bin/bash

# S-100海事数据批量获取脚本
API_KEY="YOUR_API_KEY"
BASE_URL="https://api.example.com"
OUTPUT_DIR="./maritime_data"

# 创建输出目录
mkdir -p $OUTPUT_DIR

# 获取上海港数据
echo "获取上海港数据..."
curl -X GET "$BASE_URL/api/v1/s101/wfs" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -G \\
  --data-urlencode "bbox=120.0,30.0,122.0,32.0" \\
  -o "$OUTPUT_DIR/shanghai_s101.geojson"

curl -X GET "$BASE_URL/api/v1/s102/wcs" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -G \\
  --data-urlencode "SERVICE=WCS" \\
  --data-urlencode "VERSION=2.0.1" \\
  --data-urlencode "REQUEST=GetCoverage" \\
  --data-urlencode "COVERAGE=s102_bathymetry" \\
  --data-urlencode "FORMAT=GeoTIFF" \\
  --data-urlencode "BBOX=120.0,30.0,122.0,32.0" \\
  -o "$OUTPUT_DIR/shanghai_s102.tif"

echo "数据获取完成！"
echo "输出目录: $OUTPUT_DIR"`,
          dependencies: ['curl'],
          install: '# 需要安装 curl\\n# Ubuntu/Debian: sudo apt-get install curl\\n# CentOS/RHEL: sudo yum install curl'
        }
      }
    }
  ]

  const getLanguageIcon = (language: string) => {
    const icons = {
      javascript: <Braces className="h-5 w-5 text-yellow-500" />,
      python: <Coffee className="h-5 w-5 text-blue-500" />,
      java: <Package className="h-5 w-5 text-red-500" />,
      curl: <Terminal className="h-5 w-5 text-gray-600" />
    }
    return icons[language as keyof typeof icons] || <Code className="h-5 w-5" />
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredExamples = selectedCategory === 'all' 
    ? codeExamples 
    : codeExamples.filter(example => example.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 pt-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            代码示例
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            各种编程语言的S-100海事服务集成示例，帮助开发者快速上手
          </p>
        </div>

        {/* Language and Category Filters */}
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex gap-2">
            <Button
              variant={selectedLanguage === 'javascript' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('javascript')}
              className="flex items-center gap-2"
            >
              <Javascript className="h-4 w-4" />
              JavaScript
            </Button>
            <Button
              variant={selectedLanguage === 'python' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('python')}
              className="flex items-center gap-2"
            >
              <Python className="h-4 w-4" />
              Python
            </Button>
            <Button
              variant={selectedLanguage === 'java' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('java')}
              className="flex items-center gap-2"
            >
              <Java className="h-4 w-4" />
              Java
            </Button>
            <Button
              variant={selectedLanguage === 'curl' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('curl')}
              className="flex items-center gap-2"
            >
              <Terminal className="h-4 w-4" />
              cURL
            </Button>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-8">
          {filteredExamples.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {category.category}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Example Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getLanguageIcon(selectedLanguage)}
                          <span className="font-medium">
                            {category.examples[selectedLanguage as keyof typeof category.examples].title}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {category.examples[selectedLanguage as keyof typeof category.examples].dependencies.map((dep, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(category.examples[selectedLanguage as keyof typeof category.examples].code)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          复制代码
                        </Button>
                        {category.examples[selectedLanguage as keyof typeof category.examples].install && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(category.examples[selectedLanguage as keyof typeof category.examples].install)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            复制安装命令
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Installation */}
                    {category.examples[selectedLanguage as keyof typeof category.examples].install && (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">安装依赖:</h4>
                        <code className="block bg-gray-900 text-gray-100 p-2 rounded text-sm">
                          {category.examples[selectedLanguage as keyof typeof category.examples].install}
                        </code>
                      </div>
                    )}

                    {/* Code */}
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{category.examples[selectedLanguage as keyof typeof category.examples].code}</code>
                      </pre>
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        查看文档
                      </Button>
                      <Button variant="outline" size="sm">
                        <Github className="h-3 w-3 mr-1" />
                        GitHub示例
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>更多资源</CardTitle>
            <CardDescription>
              额外的开发工具和资源链接
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Github className="h-8 w-8 text-gray-600" />
                <div>
                  <h4 className="font-medium">GitHub仓库</h4>
                  <p className="text-sm text-gray-600">完整的SDK源码和示例</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Npm className="h-8 w-8 text-red-500" />
                <div>
                  <h4 className="font-medium">NPM包</h4>
                  <p className="text-sm text-gray-600">JavaScript SDK包</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Python className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">PyPI包</h4>
                  <p className="text-sm text-gray-600">Python SDK包</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}