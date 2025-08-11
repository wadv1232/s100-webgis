// 国际化配置
export const i18nConfig = {
  resources: {
    en: {
      translation: {
        // 导航
        navigation: {
          home: "Home",
          users: "User Management",
          datasets: "Dataset Management",
          services: "Service Management",
          nodes: "Node Management",
          monitoring: "System Monitoring",
          mapServices: "Map Services",
          developer: "Developer Portal",
          apiTestConsole: "API Test Console",
          complianceDashboard: "Compliance Dashboard",
          enhancedMap: "Enhanced Map Editor",
          nodeMapEnhanced: "Node Geographic Distribution"
        },
        
        // 通用
        common: {
          save: "Save",
          cancel: "Cancel",
          delete: "Delete",
          edit: "Edit",
          create: "Create",
          update: "Update",
          search: "Search",
          filter: "Filter",
          refresh: "Refresh",
          loading: "Loading...",
          error: "Error",
          success: "Success",
          warning: "Warning",
          info: "Information",
          close: "Close",
          back: "Back",
          next: "Next",
          previous: "Previous",
          finish: "Finish",
          submit: "Submit",
          reset: "Reset",
          clear: "Clear",
          upload: "Upload",
          download: "Download",
          export: "Export",
          import: "Import",
          view: "View",
          settings: "Settings",
          help: "Help",
          about: "About"
        },
        
        // 用户管理
        users: {
          title: "User Management",
          description: "Manage system users, roles and permissions",
          createUser: "Create User",
          editUser: "Edit User",
          deleteUser: "Delete User",
          userScenarios: "User Scenarios",
          userList: "User List",
          searchUsers: "Search Users",
          roleFilter: "Role Filter",
          allRoles: "All Roles",
          userInfo: "User Information",
          role: "Role",
          node: "Node",
          status: "Status",
          lastLogin: "Last Login",
          userScenario: "User Scenario",
          actions: "Actions",
          email: "Email",
          username: "Username",
          name: "Name",
          isActive: "Active",
          assignNode: "Assign Node",
          permissions: "Permissions"
        },
        
        // 数据集管理
        datasets: {
          title: "Dataset Management",
          description: "Manage S-100 maritime dataset upload, processing and publishing",
          uploadDataset: "Upload Dataset",
          editDataset: "Edit Dataset",
          deleteDataset: "Delete Dataset",
          publishDataset: "Publish Dataset",
          datasetList: "Dataset List",
          datasetDetails: "Dataset Details",
          basicInfo: "Basic Information",
          services: "Services",
          features: "Features",
          files: "Files",
          nodeFilter: "Node Filter",
          productTypeFilter: "Product Type Filter",
          statusFilter: "Status Filter",
          allNodes: "All Nodes",
          allTypes: "All Types",
          allStatus: "All Status",
          fileName: "File Name",
          fileSize: "File Size",
          mimeType: "MIME Type",
          coverage: "Coverage",
          metadata: "Metadata",
          publishedAt: "Published At",
          createdAt: "Created At",
          updatedAt: "Updated At",
          availableServices: "Available Services",
          dataFeatures: "Data Features",
          addFeature: "Add Feature",
          featureStats: "Feature Statistics",
          totalFeatures: "Total Features",
          verified: "Verified",
          pending: "Pending",
          error: "Error",
          filePath: "File Path",
          fileInfo: "File Information",
          operations: "Operations",
          preview: "Preview"
        },
        
        // 监控
        monitoring: {
          title: "Node Health Monitoring",
          description: "Real-time monitoring of health status and service availability for all nodes in S-100 architecture",
          systemHealth: "System Health",
          onlineNodes: "Online Nodes",
          activeServices: "Active Services",
          publishedDatasets: "Published Datasets",
          nodeHealthDistribution: "Node Health Distribution",
          datasetStatusDistribution: "Dataset Status Distribution",
          s100ProductDistribution: "S-100 Product Distribution",
          recentHealthChecks: "Recent Health Checks",
          systemStatusSummary: "System Status Summary",
          nodeAvailability: "Node Availability",
          serviceAvailability: "Service Availability",
          dataProcessingSuccess: "Data Processing Success",
          lastUpdate: "Last Update",
          nodeDetails: "Node Details",
          nodeName: "Node Name",
          nodeType: "Node Type",
          healthStatus: "Health Status",
          datasets: "Datasets",
          services: "Services",
          lastCheck: "Last Check",
          timeRange: {
            '1h': "1 Hour",
            '24h': "24 Hours",
            '7d': "7 Days",
            '30d': "30 Days"
          }
        },
        
        // 状态
        status: {
          healthy: "Healthy",
          warning: "Warning",
          error: "Error",
          offline: "Offline",
          uploaded: "Uploaded",
          processing: "Processing",
          published: "Published",
          archived: "Archived",
          active: "Active",
          inactive: "Inactive"
        },
        
        // 角色
        roles: {
          ADMIN: "System Administrator",
          NODE_ADMIN: "Node Administrator",
          DATA_MANAGER: "Data Manager",
          SERVICE_MANAGER: "Service Manager",
          DEVELOPER: "Developer",
          USER: "User",
          GUEST: "Guest"
        },
        
        // S-100 产品
        s100Products: {
          S101: "S-101 Electronic Nautical Chart",
          S102: "S-102 High Precision Bathymetry",
          S104: "S-104 Dynamic Water Level",
          S111: "S-111 Real-time Current",
          S124: "S-124 Navigational Warnings",
          S125: "S-125 Navigational Information",
          S131: "S-131 Marine Protected Areas"
        },
        
        // 节点类型
        nodeTypes: {
          GLOBAL_ROOT: "Global Root Node",
          NATIONAL: "National Node",
          REGIONAL: "Regional Node",
          LEAF: "Leaf Node"
        },
        
        // 主题
        theme: {
          light: "Light Theme",
          dark: "Dark Theme",
          system: "Follow System"
        }
      }
    },
    zh: {
      translation: {
        // 导航
        navigation: {
          home: "首页",
          users: "用户管理",
          datasets: "数据集管理",
          services: "服务管理",
          nodes: "节点管理",
          monitoring: "系统监控",
          mapServices: "地图服务",
          developer: "开发者门户",
          apiTestConsole: "API测试控制台",
          complianceDashboard: "合规监控",
          enhancedMap: "增强地图编辑器",
          nodeMapEnhanced: "节点地理分布"
        },
        
        // 通用
        common: {
          save: "保存",
          cancel: "取消",
          delete: "删除",
          edit: "编辑",
          create: "创建",
          update: "更新",
          search: "搜索",
          filter: "筛选",
          refresh: "刷新",
          loading: "加载中...",
          error: "错误",
          success: "成功",
          warning: "警告",
          info: "信息",
          close: "关闭",
          back: "返回",
          next: "下一步",
          previous: "上一步",
          finish: "完成",
          submit: "提交",
          reset: "重置",
          clear: "清空",
          upload: "上传",
          download: "下载",
          export: "导出",
          import: "导入",
          view: "查看",
          settings: "设置",
          help: "帮助",
          about: "关于"
        },
        
        // 用户管理
        users: {
          title: "用户管理",
          description: "管理系统用户、角色和权限分配",
          createUser: "创建用户",
          editUser: "编辑用户",
          deleteUser: "删除用户",
          userScenarios: "用户场景参考",
          userList: "用户列表",
          searchUsers: "搜索用户",
          roleFilter: "角色筛选",
          allRoles: "所有角色",
          userInfo: "用户信息",
          role: "角色",
          node: "所属节点",
          status: "状态",
          lastLogin: "最后登录",
          userScenario: "用户场景",
          actions: "操作",
          email: "邮箱",
          username: "用户名",
          name: "姓名",
          isActive: "激活",
          assignNode: "分配节点",
          permissions: "权限"
        },
        
        // 数据集管理
        datasets: {
          title: "数据集管理",
          description: "管理S-100海事数据集的上传、处理和发布",
          uploadDataset: "上传数据集",
          editDataset: "编辑数据集",
          deleteDataset: "删除数据集",
          publishDataset: "发布数据集",
          datasetList: "数据集列表",
          datasetDetails: "数据集详情",
          basicInfo: "基本信息",
          services: "服务",
          features: "要素管理",
          files: "文件",
          nodeFilter: "节点筛选",
          productTypeFilter: "产品类型筛选",
          statusFilter: "状态筛选",
          allNodes: "全部节点",
          allTypes: "全部类型",
          allStatus: "全部状态",
          fileName: "文件名",
          fileSize: "文件大小",
          mimeType: "文件类型",
          coverage: "覆盖范围",
          metadata: "元数据",
          publishedAt: "发布时间",
          createdAt: "创建时间",
          updatedAt: "更新时间",
          availableServices: "可用服务",
          dataFeatures: "数据要素",
          addFeature: "添加要素",
          featureStats: "要素统计",
          totalFeatures: "总要素数",
          verified: "已验证",
          pending: "待处理",
          error: "错误",
          filePath: "文件路径",
          fileInfo: "文件信息",
          operations: "操作",
          preview: "预览"
        },
        
        // 监控
        monitoring: {
          title: "节点健康监控",
          description: "实时监控S-100架构中所有节点的健康状态和服务可用性",
          systemHealth: "系统健康度",
          onlineNodes: "在线节点",
          activeServices: "活跃服务",
          publishedDatasets: "已发布数据集",
          nodeHealthDistribution: "节点健康状态分布",
          datasetStatusDistribution: "数据集状态分布",
          s100ProductDistribution: "S-100产品分布",
          recentHealthChecks: "最近健康检查",
          systemStatusSummary: "系统状态摘要",
          nodeAvailability: "节点可用性",
          serviceAvailability: "服务可用性",
          dataProcessingSuccess: "数据处理成功率",
          lastUpdate: "最后更新",
          nodeDetails: "节点详细状态",
          nodeName: "节点名称",
          nodeType: "节点类型",
          healthStatus: "健康状态",
          datasets: "数据集",
          services: "服务",
          lastCheck: "最后检查",
          timeRange: {
            '1h': "1小时",
            '24h': "24小时",
            '7d': "7天",
            '30d': "30天"
          }
        },
        
        // 状态
        status: {
          healthy: "健康",
          warning: "警告",
          error: "错误",
          offline: "离线",
          uploaded: "已上传",
          processing: "处理中",
          published: "已发布",
          archived: "已归档",
          active: "激活",
          inactive: "禁用"
        },
        
        // 角色
        roles: {
          ADMIN: "系统管理员",
          NODE_ADMIN: "节点管理员",
          DATA_MANAGER: "数据管理员",
          SERVICE_MANAGER: "服务管理员",
          DEVELOPER: "开发者",
          USER: "普通用户",
          GUEST: "游客"
        },
        
        // S-100 产品
        s100Products: {
          S101: "S-101 电子海图",
          S102: "S-102 高精度水深",
          S104: "S-104 动态水位",
          S111: "S-111 实时海流",
          S124: "S-124 航行警告",
          S125: "S-125 航行信息",
          S131: "S-131 海洋保护区"
        },
        
        // 节点类型
        nodeTypes: {
          GLOBAL_ROOT: "全球根节点",
          NATIONAL: "国家级节点",
          REGIONAL: "区域节点",
          LEAF: "叶子节点"
        },
        
        // 主题
        theme: {
          light: "浅色主题",
          dark: "深色主题",
          system: "跟随系统"
        }
      }
    }
  },
  lng: "zh",
  fallbackLng: "en",
  
  // 插件配置
  interpolation: {
    escapeValue: false // 不转义HTML内容
  },
  
  // React 配置
  react: {
    useSuspense: false
  }
}