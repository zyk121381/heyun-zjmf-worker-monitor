@echo off
chcp 65001 >nul
setlocal EnableExtensions

cd /d "%~dp0"
where pwsh >nul 2>nul
if %ERRORLEVEL%==0 (set "PS_EXE=pwsh") else (set "PS_EXE=powershell")

echo.
echo ========================================
echo heyun-zjmf-worker-monitor 步骤2-一键部署
echo ========================================
echo 接下来会引导你填写 Cloudflare Token、Account ID、仓库地址和网站密码。
echo.
echo 准备方式：
echo 1. Cloudflare Token：打开 https://dash.cloudflare.com/profile/api-tokens
echo    创建令牌，再到 API 令牌模板，选择 编辑 Cloudflare Workers，点击 使用模板。
echo    增加更多帐户，添加 D1 / 编辑；账户资源选包括所有账户，区域资源选包括所有区域。
echo    最后继续以显示摘要，再创建令牌，并复制保存生成的 Token。
echo 2. 账户 ID：复制脚本检测显示的账户 ID，或在 Cloudflare 账户主页右侧三个点复制账户 ID。
echo 3. GitHub 仓库地址：复制你 Fork 后仓库的地址。
echo.

if not exist ".\deploy-one-click.ps1" (
  echo [ERROR] 缺少 deploy-one-click.ps1，请先运行 步骤1-一键安装.bat。
  pause
  exit /b 1
)

call :normalize_utf8_bom ".\deploy-one-click.ps1"
if errorlevel 1 exit /b 1

if /I "%~1"=="--self-test" (
  set "ZJMF_ADMIN_TOKEN=admin"
  "%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File ".\deploy-one-click.ps1" -ConfigPath ".\one-click.config.jsonc" -PreflightOnly
  exit /b %ERRORLEVEL%
)

"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File ".\deploy-one-click.ps1" -ConfigPath ".\one-click.config.jsonc" -Interactive -RefreshSource
set "SCRIPT_EXIT=%ERRORLEVEL%"
echo.
if not "%SCRIPT_EXIT%"=="0" (
  echo [ERROR] 部署已中断，退出码：%SCRIPT_EXIT%
  echo 请查看上方错误信息。
) else (
  echo [OK] 部署脚本执行完成。
)
pause
exit /b %SCRIPT_EXIT%

:normalize_utf8_bom
"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -Command "$p='%~1'; $t=Get-Content -LiteralPath $p -Raw -Encoding UTF8; [System.IO.File]::WriteAllText($p,$t,[System.Text.UTF8Encoding]::new($true))"
exit /b %ERRORLEVEL%
