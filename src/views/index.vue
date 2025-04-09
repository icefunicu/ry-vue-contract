<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :span="24" class="welcome-header">
        <div class="welcome-title">
          <h1>电子合同签署平台</h1>
          <p class="version-info">
            <b>当前版本:</b> <span>v{{ version }}</span>
          </p>
        </div>
      </el-col>
    </el-row>

    <el-divider content-position="center">平台功能</el-divider>

    <el-row :gutter="20" class="feature-section">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(feature, index) in features" :key="index">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <div class="feature-content">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-divider content-position="center">快捷入口</el-divider>

    <el-row :gutter="20" class="shortcut-section">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(shortcut, index) in shortcuts" :key="index">
        <el-card shadow="hover" class="shortcut-card" @click.native="goTarget(shortcut.link)">
          <div class="shortcut-icon">
            <i :class="shortcut.icon"></i>
          </div>
          <div class="shortcut-content">
            <h3>{{ shortcut.title }}</h3>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      // 版本号
      version: "3.8.9",
      // 功能特点
      features: [
        {
          icon: "el-icon-document-checked",
          title: "电子签名",
          description: "支持多种电子签名方式，确保合同签署的合法性和有效性"
        },
        {
          icon: "el-icon-lock",
          title: "安全保障",
          description: "采用先进加密技术，保障合同数据安全和用户隐私"
        },
        {
          icon: "el-icon-time",
          title: "高效处理",
          description: "快速完成合同签署流程，提高工作效率"
        },
        {
          icon: "el-icon-folder",
          title: "合同管理",
          description: "便捷的合同存储、查询和管理功能"
        }
      ],
      // 快捷入口
      shortcuts: [
        {
          icon: "el-icon-plus",
          title: "新建合同",
          link: "/contract/index"
        },
        {
          icon: "el-icon-edit",
          title: "待签合同",
          link: "/gosign/index"
        },
        {
          icon: "el-icon-document",
          title: "合同模板",
          link: "/template/index"
        }
      ]
    };
  },
  methods: {
    goTarget(href) {
      window.open(href, "_blank");
    },
  },
};
</script>

<style scoped lang="scss">
.home {
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #676a6c;
  overflow-x: hidden;

  .welcome-header {
    text-align: center;
    padding: 30px 0;
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    border-radius: 8px;
    margin-bottom: 20px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .welcome-title {
      h1 {
        font-size: 36px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .version-info {
        font-size: 16px;
        opacity: 0.9;
      }
    }
  }

  .el-divider {
    margin: 30px 0;
    
    .el-divider__text {
      font-size: 18px;
      font-weight: 600;
      color: #1890ff;
    }
  }

  .feature-section, .shortcut-section {
    margin-bottom: 30px;
    
    .el-col {
      margin-bottom: 20px;
    }
  }

  .feature-card {
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 48px;
      color: #1890ff;
      margin-bottom: 15px;
    }

    .feature-content {
      h3 {
        font-size: 18px;
        margin-bottom: 10px;
        color: #333;
      }

      p {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }
    }
  }

  .shortcut-card {
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      background-color: #f0f9ff;
    }

    .shortcut-icon {
      font-size: 36px;
      color: #1890ff;
      margin-bottom: 10px;
    }

    .shortcut-content {
      h3 {
        font-size: 16px;
        color: #333;
      }
    }
  }

  .stats-section {
    margin-bottom: 30px;

    .stat-item {
      text-align: center;
      padding: 20px 0;

      .stat-number {
        font-size: 36px;
        font-weight: 600;
        color: #1890ff;
        margin-bottom: 10px;
      }

      .stat-title {
        font-size: 16px;
        color: #666;
      }
    }
  }

  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  
  ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  h4 {
    margin-top: 0px;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>