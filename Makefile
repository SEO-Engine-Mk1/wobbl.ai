# Z.ai 项目 Makefile
# 简化的构建和部署命令

.PHONY: help install build lint test deploy clean

# 默认目标
help:
	@echo "🚀 Z.ai 项目命令:"
	@echo ""
	@echo "📦 安装依赖:"
	@echo "  make install     - 安装所有依赖"
	@echo ""
	@echo "🔧 开发:"
	@echo "  make dev         - 启动开发服务器"
	@echo "  make build       - 构建项目"
	@echo ""
	@echo "🧪 质量检查:"
	@echo "  make lint        - 运行 ESLint"
	@echo "  make test        - 运行测试"
	@echo "  make check       - 运行所有质量检查"
	@echo ""
	@echo "🚀 部署:"
	@echo "  make deploy      - 完整部署流程"
	@echo "  make deploy-quick - 快速部署"
	@echo ""
	@echo "🧹 清理:"
	@echo "  make clean       - 清理构建文件"

# 安装依赖
install:
	@echo "📦 安装依赖..."
	pnpm install

# 开发服务器
dev:
	@echo "🔧 启动开发服务器..."
	pnpm run dev

# 构建项目
build:
	@echo "🏗️  构建项目..."
	pnpm run build

# 代码检查
lint:
	@echo "🔍 运行 ESLint..."
	pnpm run lint

# 运行测试
test:
	@echo "🧪 运行测试..."
	pnpm run test

# 完整质量检查
check: lint test
	@echo "✅ 所有质量检查完成"

# 完整部署流程
deploy:
	@echo "🚀 开始完整部署流程..."
	python3 deploy.py

# 快速部署
deploy-quick:
	@echo "⚡ 快速部署..."
	pnpm run build && vercel --prod

# 清理构建文件
clean:
	@echo "🧹 清理构建文件..."
	rm -rf node_modules/.cache
	rm -rf frontend/.next
	rm -rf frontend/dist
	rm -rf backend/dist
	find . -name "*.log" -delete
	@echo "✅ 清理完成"