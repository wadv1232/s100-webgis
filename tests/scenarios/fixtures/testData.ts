/**
 * Test data fixtures for S-100 Federal Maritime Web Service Platform scenarios
 * @author Development Team
 * @since 2024-01-01
 * @version 3.0.0
 */

export const testData = {
  // Dataset publication data for Story #1
  validS102Dataset: {
    filename: 's102_bathymetry_2024Q1.h5',
    size: 1024 * 1024 * 100, // 100MB
    checksum: 'sha256:abc123def456...',
    productType: 'S-102',
    version: '1.0.0',
    metadata: {
      coverage: {
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
      },
      resolution: '1m',
      accuracy: '0.5m',
      timestamp: '2024-01-01T00:00:00Z'
    }
  },

  // Service update data for Story #2
  serviceUpdateData: {
    existingService: {
      id: 's101-navigation-v1',
      name: 'S-101 Navigation Chart v1.0',
      productType: 'S-101',
      version: '1.0.0',
      status: 'active'
    },
    newVersion: {
      version: '2.0.0',
      filename: 's101_navigation_v2.h5',
      changes: ['Updated depth contours', 'Added new hazards', 'Improved accuracy']
    }
  },

  // Service retirement data for Story #3
  serviceRetirementData: {
    serviceId: 's124-warning-2023',
    serviceName: 'S-124 Navigational Warning 2023',
    reason: 'Expired warning - replaced by 2024 version',
    archiveDate: '2024-01-01T00:00:00Z'
  },

  // Regional nodes data for Story #6
  eastChinaNodes: [
    {
      id: 'shanghai-port',
      name: 'Shanghai Port Node',
      type: 'LEAF',
      location: { lat: 31.2000, lng: 121.5000 },
      status: 'HEALTHY',
      services: ['S-101', 'S-102', 'S-124'],
      coverage: {
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
      }
    },
    {
      id: 'ningbo-port',
      name: 'Ningbo Port Node',
      type: 'LEAF',
      location: { lat: 29.8000, lng: 121.6000 },
      status: 'WARNING',
      services: ['S-101', 'S-102'],
      coverage: {
        type: 'Polygon',
        coordinates: [[[121.0, 29.0], [122.0, 29.0], [122.0, 30.0], [121.0, 30.0], [121.0, 29.0]]]
      }
    },
    {
      id: 'qingdao-port',
      name: 'Qingdao Port Node',
      type: 'LEAF',
      location: { lat: 36.1000, lng: 120.4000 },
      status: 'ERROR',
      services: ['S-101'],
      coverage: {
        type: 'Polygon',
        coordinates: [[[120.0, 36.0], [121.0, 36.0], [121.0, 37.0], [120.0, 37.0], [120.0, 36.0]]]
      }
    }
  ],

  // Federal hierarchy data for Story #11
  federalHierarchy: {
    root: { 
      id: 'global-root', 
      name: 'IHO Global Node',
      type: 'GLOBAL_ROOT',
      level: 0
    },
    national: [
      { 
        id: 'china-node', 
        name: 'China National Node',
        type: 'NATIONAL',
        level: 1,
        parentId: 'global-root'
      },
      { 
        id: 'brazil-node', 
        name: 'Brazil National Node',
        type: 'NATIONAL',
        level: 1,
        parentId: 'global-root'
      }
    ],
    regional: [
      { 
        id: 'east-china', 
        name: 'East China Regional Node',
        type: 'REGIONAL',
        level: 2,
        parentId: 'china-node'
      },
      { 
        id: 'south-china', 
        name: 'South China Regional Node',
        type: 'REGIONAL',
        level: 2,
        parentId: 'china-node'
      }
    ]
  },

  // Product catalog data for Story #12
  globalProductCatalog: [
    {
      productId: 'S-101',
      name: 'Electronic Navigational Chart',
      version: '1.0.0',
      dataType: 'vector',
      description: 'Standard electronic navigational charts',
      official: true,
      ihoStandard: true
    },
    {
      productId: 'S-102',
      name: 'Bathymetric Data',
      version: '1.0.0',
      dataType: 'grid',
      description: 'High-resolution bathymetric data',
      official: true,
      ihoStandard: true
    },
    {
      productId: 'S-124',
      name: 'Navigational Warnings',
      version: '1.0.0',
      dataType: 'vector',
      description: 'Maritime navigational warnings',
      official: true,
      ihoStandard: true
    },
    {
      productId: 'S-412',
      name: 'Underwater Noise Forecast',
      version: '1.0.0',
      dataType: 'time-varying-grid',
      description: 'Underwater noise level forecasting',
      official: true,
      ihoStandard: true,
      specUrl: 'https://iho.int/pubs/s-412/1.0/'
    }
  ],

  // Experimental service data for Story #19
  experimentalServices: [
    {
      id: 'x-mpa-berth-status',
      name: 'MPA Berth Status Service',
      productType: 'X-MPA-BerthStatus',
      status: 'experimental',
      description: 'Real-time berth availability and status information',
      dataModel: 'custom',
      version: '0.1.0',
      provider: 'Singapore MPA',
      accessControl: 'restricted'
    },
    {
      id: 'x-vessel-tracking',
      name: 'Vessel Tracking Enhancement',
      productType: 'X-VesselTracking',
      status: 'experimental',
      description: 'Enhanced vessel tracking with AI predictions',
      dataModel: 'custom',
      version: '0.2.0',
      provider: 'Innovation Lab',
      accessControl: 'partners'
    }
  ],

  // Security configurations for Story #27
  securityConfig: {
    authentication: {
      method: 'OAuth 2.0 + JWT',
      tokenExpiry: 3600,
      refreshEnabled: true
    },
    authorization: {
      model: 'RBAC',
      permissionLevels: ['read', 'write', 'admin', 'superadmin']
    },
    encryption: {
      atRest: 'AES-256',
      inTransit: 'TLS 1.3',
      keyRotation: 90 // days
    },
    auditing: {
      level: 'comprehensive',
      retention: 365, // days
      realTimeAlerts: true
    }
  },

  // API compliance data for Story #11
  compliantNodeApi: {
    baseUrl: 'https://brazil-node.maritime.gov.br',
    endpoints: {
      capabilities: '/api/capabilities',
      health: '/api/health',
      services: '/api/services',
      datasets: '/api/datasets'
    },
    authentication: {
      type: 'JWT Bearer Token',
      issuer: 'brazil-maritime-authority'
    },
    specifications: {
      s100Version: '1.0.0',
      apiVersion: 'v1.0',
      complianceLevel: 'full'
    }
  },

  // Data contract schema for Story #21
  dataContractSchema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['Coverage'] },
      domain: { type: 'string', enum: ['http://www.opengis.net/def/crs/EPSG/0/4326'] },
      parameters: {
        type: 'object',
        properties: {
          's100:metadata': {
            type: 'object',
            properties: {
              productType: { type: 'string' },
              version: { type: 'string' },
              datasetId: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            },
            required: ['productType', 'version', 'datasetId', 'timestamp']
          }
        }
      }
    },
    required: ['type', 'domain', 'parameters']
  },

  // Performance testing data
  performanceData: {
    loadTesting: {
      concurrentUsers: [10, 50, 100, 500, 1000],
      duration: 300, // seconds
      rampUp: 30 // seconds
    },
    responseTimeThresholds: {
      critical: 5000, // ms
      warning: 2000, // ms
      good: 1000 // ms
    },
    availabilityTargets: {
      critical: 0.99, // 99%
      warning: 0.95, // 95%
      good: 0.99 // 99%
    }
  },

  // Error scenarios for testing
  errorScenarios: {
    invalidDataset: {
      filename: 'invalid_file.txt',
      size: 1024,
      checksum: 'invalid',
      productType: 'INVALID',
      error: 'Invalid file format'
    },
    networkFailure: {
      type: 'network_timeout',
      timeout: 30000,
      retryAttempts: 3,
      recovery: 'auto'
    },
    authenticationFailure: {
      type: 'invalid_token',
      errorCode: 401,
      message: 'Invalid or expired authentication token'
    },
    serviceOverload: {
      type: 'capacity_exceeded',
      concurrentRequests: 1000,
      threshold: 500,
      mitigation: 'queue_and_throttle'
    }
  },

  // Compliance policy data for Story #9
  compliancePolicies: {
    eastChinaRegion: {
      name: 'East China Regional Compliance Policy',
      mandatoryServices: ['S-101', 'S-124'],
      recommendedServices: ['S-102', 'S-104'],
      standards: {
        dataFormat: 'S-100 v1.0',
        security: 'Federal Security Framework v2.0',
        availability: '99.5%'
      },
      enforcement: 'automatic',
      reporting: 'weekly'
    }
  },

  // Service area management data for Story #8
  serviceAreas: {
    overlappingAreas: [
      {
        nodes: ['shanghai-port', 'ningbo-port'],
        overlapType: 'partial',
        overlapPercentage: 15,
        recommendation: 'adjust boundaries to minimize overlap'
      }
    ],
    coverageGaps: [
      {
        location: { lat: 30.5, lng: 122.5 },
        size: 'medium',
        priority: 'high',
        recommendation: 'establish new node or expand existing coverage'
      }
    ]
  }
};

// Mock response data
export const mockResponses = {
  successResponse: {
    status: 200,
    data: {
      success: true,
      message: 'Operation completed successfully',
      timestamp: new Date().toISOString()
    }
  },
  
  validationResponse: {
    status: 200,
    data: {
      valid: true,
      errors: [],
      warnings: [],
      metadata: {
        fileSize: 104857600,
        checksum: 'verified',
        format: 'valid'
      }
    }
  },
  
  serviceCreationResponse: {
    status: 201,
    data: {
      serviceId: 's102-bathymetry-2024q1',
      endpoints: {
        wms: 'https://shanghai-port.maritime.gov.cn/wms/s102-bathymetry-2024q1',
        wcs: 'https://shanghai-port.maritime.gov.cn/wcs/s102-bathymetry-2024q1'
      },
      metadata: {
        productType: 'S-102',
        version: '1.0.0',
        coverage: testData.validS102Dataset.metadata.coverage,
        publishedAt: new Date().toISOString()
      }
    }
  },
  
  healthStatusResponse: {
    status: 200,
    data: {
      overall: 'HEALTHY',
      nodes: {
        healthy: ['shanghai-port'],
        warning: ['ningbo-port'],
        error: ['qingdao-port']
      },
      services: {
        available: 8,
        degraded: 2,
        unavailable: 1
      },
      lastUpdated: new Date().toISOString()
    }
  },
  
  capabilitiesResponse: {
    status: 200,
    data: {
      node: {
        id: 'china-national',
        name: 'China National Node',
        type: 'NATIONAL',
        status: 'HEALTHY'
      },
      supportedProducts: ['S-101', 'S-102', 'S-104', 'S-111', 'S-124'],
      services: [
        {
          id: 's101-navigation',
          productType: 'S-101',
          serviceTypes: ['WMS', 'WFS'],
          status: 'active'
        },
        {
          id: 's102-bathymetry',
          productType: 'S-102',
          serviceTypes: ['WMS', 'WCS'],
          status: 'active'
        }
      ],
      coverage: {
        type: 'Polygon',
        coordinates: [[[73.0, 18.0], [135.0, 18.0], [135.0, 54.0], [73.0, 54.0], [73.0, 18.0]]]
      }
    }
  }
};

// Test constants
export const testConstants = {
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    extended: 60000
  },
  
  thresholds: {
    performance: {
      responseTime: 5000,
      throughput: 100,
      errorRate: 0.05
    },
    availability: {
      uptime: 0.99,
      responseTime: 10000
    }
  },
  
  urls: {
    baseUrl: 'http://localhost:3000',
    apiBase: 'http://localhost:3000/api',
    authBase: 'http://localhost:3000/api/auth',
    adminBase: 'http://localhost:3000/api/admin'
  },
  
  headers: {
    contentType: 'application/json',
    authorization: 'Bearer test-token',
    apiVersion: 'v1.0'
  }
};