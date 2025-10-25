#!/usr/bin/env bash

# ================================
# 🚀 Z.ai 简化部署脚本
# 自动构建、测试和部署到 Vercel
# ================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# ================================
# 配置
COMMIT_MSG="🚀 Z.ai auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
BRANCH="main"

# ================================
# 1️⃣ 环境检查
log_info "检查部署环境..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装"
    exit 1
fi

NODE_VERSION=$(node --version)
log_success "Node.js 版本: $NODE_VERSION"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm 未安装"
    exit 1
fi

PNPM_VERSION=$(pnpm --version)
log_success "pnpm 版本: $PNPM_VERSION"

# ================================
# 2️⃣ 依赖安装
log_info "安装项目依赖..."
if ! pnpm install --frozen-lockfile; then
    log_error "依赖安装失败"
    exit 1
fi
log_success "依赖安装完成"

# ================================
# 3️⃣ 代码质量检查
log_info "运行代码质量检查..."

# ESLint 检查
if ! pnpm lint; then
    log_error "ESLint 检查失败"
    exit 1
fi
log_success "ESLint 检查通过"

# TypeScript 类型检查
if ! pnpm type-check; then
    log_error "TypeScript 类型检查失败"
    exit 1
fi
log_success "TypeScript 类型检查通过"

# ================================
# 4️⃣ 构建项目
log_info "构建项目..."
if ! pnpm build; then
    log_error "项目构建失败"
    exit 1
fi
log_success "项目构建完成"

# ================================
# 5️⃣ Git 操作
log_info "执行 Git 操作..."

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
    log_warning "不在 Git 仓库中，跳过 Git 操作"
else
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_info "发现未提交的更改，正在提交..."
        
        # 添加所有更改
        git add .
        
        # 提交更改
        git commit -m "$COMMIT_MSG" || log_warning "没有新的更改需要提交"
        
        # 推送到远程仓库
        if git remote get-url origin &> /dev/null; then
            log_info "推送到远程仓库..."
            if ! git push origin $BRANCH; then
                log_error "Git 推送失败"
                exit 1
            fi
            log_success "代码已推送到远程仓库"
        else
            log_warning "没有配置远程仓库，跳过推送"
        fi
    else
        log_info "没有未提交的更改"
    fi
fi

# ================================
# 6️⃣ 部署到 Vercel
log_info "部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -l vercel &> /dev/null; then
    log_warning "Vercel CLI 未安装，尝试安装..."
    pnpm add -g vercel
fi

# 执行部署
if ! vercel --prod; then
    log_error "Vercel 部署失败"
    exit 1
fi

log_success "🎉 部署完成！"

# ================================
# 7️⃣ 部署后检查
log_info "执行部署后检查..."

# 获取部署的 URL
DEPLOY_URL=$(vercel ls --scope=vercel --limit=1 | grep -o 'https://[^[:space:]]*' | head -1)

if [ -n "$DEPLOY_URL" ]; then
    log_success "部署 URL: $DEPLOY_URL"
    
    # 简单的健康检查
    log_info "检查部署状态..."
    if curl -f -s "$DEPLOY_URL/api/health" > /dev/null; then
        log_success "部署健康检查通过"
    else
        log_warning "部署健康检查失败，但部署可能仍在进行中"
    fi
else
    log_warning "无法获取部署 URL"
fi

log_success "🚀 Z.ai 部署流程完成！"