import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { jest } from '@jest/globals'

// Mock TextEncoder and TextDecoder for MSW
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => (
    React.createElement('div', { 'data-testid': 'map-container', ...props }, children)
  ),
  TileLayer: () => React.createElement('div', { 'data-testid': 'tile-layer' }),
  Marker: ({ children, ...props }) => (
    React.createElement('div', { 'data-testid': 'marker', ...props }, children)
  ),
  Popup: ({ children, ...props }) => (
    React.createElement('div', { 'data-testid': 'popup', ...props }, children)
  ),
  useMap: () => ({
    getContainer: () => ({
      getBoundingClientRect: () => ({ width: 1024, height: 768 })
    }),
    getCenter: () => ({ lat: 31.2, lng: 121.5 }),
    getZoom: () => 10,
    setView: jest.fn(),
    flyTo: jest.fn()
  }),
  CircleMarker: ({ children, ...props }) => (
    React.createElement('div', { 'data-testid': 'circle-marker', ...props }, children)
  )
}))

// Mock leaflet
jest.mock('leaflet', () => ({
  map: () => ({
    setView: jest.fn(),
    getCenter: () => ({ lat: 31.2, lng: 121.5 }),
    getZoom: () => 10,
    on: jest.fn(),
    off: jest.fn()
  }),
  tileLayer: () => ({
    addTo: jest.fn()
  }),
  marker: () => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    openPopup: jest.fn()
  }),
  icon: () => ({
    options: {}
  }),
  divIcon: () => ({
    options: {}
  }),
  circleMarker: () => ({
    addTo: jest.fn(),
    bindPopup: jest.fn()
  }),
  latLng: (lat, lng) => ({ lat, lng }),
  latLngBounds: () => ({
    getCenter: () => ({ lat: 31.2, lng: 121.5 }),
    getNorthEast: () => ({ lat: 32, lng: 122 }),
    getSouthWest: () => ({ lat: 30, lng: 121 })
  }),
  control: {
    scale: () => ({
      addTo: jest.fn()
    }),
    zoom: () => ({
      addTo: jest.fn()
    })
  },
  popup: () => ({
    setLatLng: jest.fn(),
    setContent: jest.fn(),
    openOn: jest.fn()
  })
}))

// 测试数据
const mockNodes = [
  {
    id: '1',
    name: '上海海事服务中心',
    type: 'NATIONAL',
    healthStatus: 'HEALTHY',
    location: { lat: 31.2, lng: 121.5 },
    description: '国家级海事服务中心',
    services: ['S-101', 'S-102', 'S-104'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: '北京海事服务中心',
    type: 'REGIONAL',
    healthStatus: 'WARNING',
    location: { lat: 39.9, lng: 116.4 },
    description: '区域级海事服务中心',
    services: ['S-101', 'S-102'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: '广州海事服务中心',
    type: 'REGIONAL',
    healthStatus: 'ERROR',
    location: { lat: 23.1, lng: 113.3 },
    description: '区域级海事服务中心',
    services: ['S-101'],
    lastUpdated: new Date().toISOString()
  }
]

const mockServices = [
  {
    id: '1',
    name: 'S-101电子海图服务',
    type: 'WMS',
    productType: 'S-101',
    status: 'ACTIVE',
    nodeId: '1',
    endpoint: 'http://example.com/wms',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: 'S-102水深服务',
    type: 'WCS',
    productType: 'S-102',
    status: 'ACTIVE',
    nodeId: '1',
    endpoint: 'http://example.com/wcs',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'S-104航行信息服务',
    type: 'WFS',
    productType: 'S-104',
    status: 'ACTIVE',
    nodeId: '2',
    endpoint: 'http://example.com/wfs',
    lastUpdated: new Date().toISOString()
  }
]

const userStoryTestData = {
  story1: {
    title: '海事服务浏览',
    description: '用户能够浏览和查看海事服务的地理分布',
    actor: '海事服务用户',
    scenarios: [
      '访问地图服务页面',
      '查看节点标记',
      '点击节点查看详情',
      '验证节点状态显示',
      '使用地图交互功能',
      '使用搜索功能',
      '响应式设计',
      '无障碍访问',
      '性能优化',
      '错误处理和恢复'
    ]
  },
  story3: {
    title: '坐标测试',
    description: '测试坐标系统的显示和标准化功能',
    actor: '系统测试人员',
    scenarios: [
      '访问坐标测试页面',
      '查看测试坐标点',
      '验证坐标标准化功能',
      '测试边界处理',
      '地图交互测试',
      '重置地图功能',
      '坐标格式显示',
      '响应式设计',
      '性能测试',
      '错误处理',
      '无障碍访问',
      '数据验证'
    ]
  }
}

// 测试工具函数
const renderWithProviders = (component: React.ReactElement) => {
  return render(component)
}

const waitForMapToLoad = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })
}

const simulateUserInteraction = async (element: HTMLElement, eventType: string, eventData?: any) => {
  fireEvent[eventType](element, eventData)
}

// 导出测试数据供其他测试文件使用
export { mockNodes, mockServices, userStoryTestData, renderWithProviders, waitForMapToLoad, simulateUserInteraction }