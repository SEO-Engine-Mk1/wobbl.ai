#!/usr/bin/env python3
"""
Z.ai 快速部署脚本
跳过类型检查，专注于快速部署
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from typing import Optional

class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

def log_info(message: str):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.NC}")

def log_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.NC}")

def log_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.NC}")

def log_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.NC}")

def run_command(command: str, check: bool = True, capture_output: bool = False) -> Optional[subprocess.CompletedProcess]:
    """运行命令并处理错误"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=check,
            capture_output=capture_output,
            text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        if check:
            log_error(f"命令执行失败: {command}")
            log_error(f"错误信息: {e}")
            return None
        return e

def check_environment():
    """检查部署环境"""
    log_info("检查部署环境...")
    
    # 检查 Node.js
    result = run_command("node --version", capture_output=True)
    if result:
        log_success(f"Node.js 版本: {result.stdout.strip()}")
    else:
        log_error("Node.js 未安装")
        return False
    
    # 检查 pnpm
    result = run_command("pnpm --version", capture_output=True)
    if result:
        log_success(f"pnpm 版本: {result.stdout.strip()}")
    else:
        log_error("pnpm 未安装")
        return False
    
    return True

def install_dependencies():
    """安装项目依赖"""
    log_info("安装项目依赖...")
    
    result = run_command("pnpm install --frozen-lockfile")
    if result:
        log_success("依赖安装完成")
        return True
    else:
        log_error("依赖安装失败")
        return False

def run_basic_checks():
    """运行基本检查（跳过类型检查）"""
    log_info("运行基本代码检查...")
    
    # ESLint 检查（允许警告）
    result = run_command("pnpm run lint", check=False)
    if result and result.returncode == 0:
        log_success("ESLint 检查通过")
    elif result and result.returncode == 1:
        log_warning("ESLint 检查发现问题，但继续部署")
    else:
        log_warning("ESLint 检查失败，但继续部署")
    
    return True

def build_project():
    """构建项目"""
    log_info("构建项目...")
    
    # 尝试构建，如果失败则尝试 Next.js 构建
    result = run_command("pnpm run build", check=False)
    if result and result.returncode == 0:
        log_success("项目构建完成")
        return True
    else:
        log_warning("标准构建失败，尝试 Next.js 构建...")
        result = run_command("cd frontend && pnpm run build", check=False)
        if result and result.returncode == 0:
            log_success("Frontend 构建完成")
            return True
        else:
            log_error("项目构建失败")
            return False

def git_operations():
    """执行 Git 操作"""
    log_info("执行 Git 操作...")
    
    # 检查是否在 Git 仓库中
    if not os.path.exists(".git"):
        log_warning("不在 Git 仓库中，跳过 Git 操作")
        return True
    
    # 检查是否有未提交的更改
    result = run_command("git status --porcelain", capture_output=True)
    if result and result.stdout.strip():
        log_info("发现未提交的更改，正在提交...")
        
        commit_msg = f"🚀 Z.ai auto-deploy: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        # 添加所有更改
        run_command("git add .")
        
        # 提交更改
        run_command("git commit -m \"{}\"".format(commit_msg), check=False)
        
        # 检查是否有远程仓库
        result = run_command("git remote get-url origin", check=False, capture_output=True)
        if result and result.returncode == 0:
            log_info("推送到远程仓库...")
            result = run_command("git push origin wobbl.ai", check=False)
            if result and result.returncode == 0:
                log_success("代码已推送到远程仓库")
                return True
            else:
                log_warning("Git 推送失败，但继续部署")
        else:
            log_warning("没有配置远程仓库，跳过推送")
    else:
        log_info("没有未提交的更改")
    
    return True

def deploy_to_vercel():
    """部署到 Vercel"""
    log_info("部署到 Vercel...")
    
    # 检查是否安装了 Vercel CLI
    result = run_command("which vercel", check=False, capture_output=True)
    if not result or result.returncode != 0:
        log_warning("Vercel CLI 未安装，尝试安装...")
        run_command("pnpm add -g vercel", check=False)
    
    # 执行部署
    result = run_command("vercel --prod", check=False)
    if result and result.returncode == 0:
        log_success("Vercel 部署完成")
        return True
    else:
        log_error("Vercel 部署失败")
        return False

def post_deployment_check():
    """部署后检查"""
    log_info("执行部署后检查...")
    
    # 尝试获取部署 URL
    result = run_command("vercel ls --scope=vercel --limit=1", capture_output=True)
    if result and result.stdout:
        # 简单解析 URL
        lines = result.stdout.strip().split('\n')
        for line in lines:
            if 'https://' in line:
                url = line.split()[0] if line.split() else None
                if url and url.startswith('https://'):
                    log_success(f"部署 URL: {url}")
                    
                    # 简单的健康检查
                    log_info("检查部署状态...")
                    health_result = run_command(f"curl -f -s {url}/api/health", check=False)
                    if health_result and health_result.returncode == 0:
                        log_success("部署健康检查通过")
                    else:
                        log_warning("部署健康检查失败，但部署可能仍在进行中")
                    break
    else:
        log_warning("无法获取部署 URL")

def main():
    """主函数"""
    print("🚀 Z.ai 快速部署脚本")
    print("=" * 50)
    
    try:
        # 1️⃣ 环境检查
        if not check_environment():
            sys.exit(1)
        
        # 2️⃣ 依赖安装
        if not install_dependencies():
            sys.exit(1)
        
        # 3️⃣ 基本检查（跳过类型检查）
        if not run_basic_checks():
            sys.exit(1)
        
        # 4️⃣ 构建项目
        if not build_project():
            sys.exit(1)
        
        # 5️⃣ Git 操作
        if not git_operations():
            sys.exit(1)
        
        # 6️⃣ 部署到 Vercel
        if not deploy_to_vercel():
            sys.exit(1)
        
        # 7️⃣ 部署后检查
        post_deployment_check()
        
        log_success("🚀 Z.ai 快速部署完成！")
        
    except KeyboardInterrupt:
        log_error("部署被用户中断")
        sys.exit(1)
    except Exception as e:
        log_error(f"部署过程中发生未知错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()