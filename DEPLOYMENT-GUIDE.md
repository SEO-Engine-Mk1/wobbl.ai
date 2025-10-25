# Z.ai 部署配置
# 简化的部署和环境管理

# ================================
# 🚀 部署脚本使用说明
# ================================

## 快速开始

### 1. 使用 Python 脚本（推荐）
```bash
# 完整部署流程
python3 deploy.py

# 或者使用 pnpm 脚本
pnpm run deploy
```

### 2. 使用 Make 命令
```bash
# 完整部署
make deploy

# 快速部署
make deploy-quick

# 查看所有命令
make help
```

### 3. 手动部署
```bash
# 构建项目
pnpm run build

# 部署到 Vercel
vercel --prod
```

## 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Python 3.x（用于部署脚本）
- Vercel CLI（用于部署）

## 部署流程

1. **环境检查** - 验证 Node.js、pnpm 版本
2. **依赖安装** - 安装项目依赖
3. **质量检查** - ESLint、TypeScript 检查
4. **项目构建** - 构建生产版本
5. **Git 操作** - 提交并推送代码（可选）
6. **Vercel 部署** - 部署到生产环境
7. **健康检查** - 验证部署状态

## 配置说明

### Vercel 环境变量
在 Vercel 控制台中设置以下环境变量：

```bash
# 数据库
DATABASE_URL="your_database_url"

# AI 服务
OPENAI_API_KEY="your_openai_key"

# 其他服务
NEXTAUTH_SECRET="your_secret_key"
```

### GitHub Secrets
在 GitHub 仓库设置中配置：

```bash
VERCEL_TOKEN="your_vercel_token"
VERCEL_ORG_ID="your_org_id"
VERCEL_PROJECT_ID="your_project_id"
```

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理缓存
   pnpm store prune
   rm -rf node_modules .next
   pnpm install
   ```

2. **部署失败**
   ```bash
   # 检查 Vercel 配置
   vercel link
   vercel --prod
   ```

3. **类型错误**
   ```bash
   # 重新生成类型
   pnpm run type-check
   pnpm run db:generate
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* python3 deploy.py

# 或者在部署脚本中设置
export DEBUG=true
python3 deploy.py
```

## 自动化部署

### GitHub Actions
项目配置了自动化部署：

- **推送到 wobbl.ai 分支** → 自动部署到生产环境
- **Pull Request** → 运行质量检查
- **手动触发** → 可选择部署环境

### 本地部署
```bash
# 开发环境
pnpm run dev

# 预览部署
pnpm run deploy:preview

# 生产部署
pnpm run deploy:vercel
```

## 监控和日志

### Vercel 日志
```bash
# 查看部署日志
vercel logs

# 实时日志
vercel logs --follow
```

### 健康检查
```bash
# 检查 API 状态
curl https://wobbl.ai/api/health

# 检查部署状态
curl https://api.vercel.com/v13/deployments
```

## 最佳实践

1. **部署前检查**
   - 运行 `pnpm run lint` 和 `pnpm run type-check`
   - 确保所有测试通过
   - 检查环境变量配置

2. **分支管理**
   - 主分支：`wobbl.ai`
   - 开发分支：`feature/*`
   - 修复分支：`hotfix/*`

3. **版本控制**
   - 使用语义化版本
   - 编写清晰的提交信息
   - 定期更新依赖

## 联系支持

如果遇到问题，请：

1. 检查本文档的故障排除部分
2. 查看 GitHub Actions 日志
3. 检查 Vercel 部署日志
4. 联系开发团队

---

*最后更新：2024年*