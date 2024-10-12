# Google Indexing API 提交工具 (Chrome 扩展)

这个 Chrome 扩展程序允许您使用 Google Indexing API 提交 URL。它提供了一个用户友好的界面，让您可以轻松管理配置和提交 URL。

## 安装扩展

1. 克隆或下载此仓库到本地机器。

2. 安装依赖：

   ```bash
   pnpm install
   ```

3. 构建扩展：

   ```bash
   pnpm run build
   ```

4. 在 Chrome 浏览器中安装扩展：
   - 打开 Chrome 浏览器，进入 `chrome://extensions/`
   - 开启右上角的 "开发者模式"
   - 点击 "加载已解压的扩展程序"
   - 选择项目中的 `dist` 目录

现在，您应该能在 Chrome 工具栏中看到扩展图标了。

## 使用说明

1. 点击 Chrome 工具栏中的扩展图标打开扩展界面。

2. 首次使用时，点击 "Settings" 按钮进行配置：
   - 点击 "Add Configuration" 按钮
   - 输入配置名称
   - 粘贴您的 Private Key（参见下方 "获取 Private Key 和 Client Email" 部分）
   - 输入您的 Client Email
   - 点击 "Save" 保存配置

3. 在主界面中：
   - 从下拉菜单选择您创建的配置
   - 在文本框中输入要提交的 URL（每行一个）
   - 点击 "Submit" 按钮提交 URL

4. 提交后，您将看到成功和失败的 URL 数量统计，以及失败 URL 的详细列表。

5. 您可以使用 "Copy Failed URLs" 按钮复制失败的 URL，以便稍后重新提交。

## 获取 Private Key 和 Client Email

要获取 Private Key 和 Client Email，请按照以下步骤在 Google Cloud Console 中创建服务账号和密钥：

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择或创建一个项目
3. 在左侧菜单中，选择 "IAM & Admin" > "Service Accounts"
4. 点击页面顶部的 "CREATE SERVICE ACCOUNT"
5. 输入服务账号名称，然后点击 "CREATE"
6. 在 "Service account permissions" 步骤中，选择适当的角色（至少需要 "Indexing API > Indexing API User" 角色）
7. 点击 "CONTINUE"，然后点击 "DONE"
8. 在服务账号列表中，找到刚刚创建的服务账号，点击右侧的三个点，选择 "Manage keys"
9. 在 "Keys" 页面，点击 "ADD KEY" > "Create new key"
10. 选择 "JSON" 格式，然后点击 "CREATE"
11. 浏览器将自动下载生成的 JSON 密钥文件
12. 打开下载的 JSON 文件，您将在其中找到 "private_key" 和 "client_email" 字段
13. 使用这些值在扩展程序中创建新的配置

## 注意事项

- 确保您的 Google Cloud 项目已启用 Indexing API。
- 保护好您的 Private Key，不要分享给他人。
- 遵守 Google Indexing API 的使用限制和最佳实践。

## 故障排除

如果遇到问题：

- 检查 Chrome 控制台是否有错误信息
- 确保您的 Private Key 和 Client Email 正确无误
- 验证您提交的 URL 格式是否正确（应包含 http:// 或 https://）

如果问题持续，请提交 issue 或联系开发者。
