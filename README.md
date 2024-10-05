# Google Indexing API 提交工具

这个项目是一个使用 Google Indexing API 提交 URL 的工具。它允许您通过配置文件指定要提交的 URL，并使用 Google 服务账号进行身份验证。

## 配置

### 1. 创建配置文件

在 `config` 目录下创建 `key.json` 和 `url.json` 文件。

### 2. 配置 `key.json`

要生成 `key.json`，请按照以下步骤在 Google Cloud Console 中创建服务账号和密钥：

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
12. 将下载的文件重命名为 `key.json` 并移动到项目的 `config` 目录中

生成的 `key.json` 文件格式如下：

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"
}
```

### 3. 配置 `url.json`

1. 复制 `config/url.json.example` 并重命名为 `url.json`
2. 在 `urls` 数组中添加您想要提交的 URL，格式如下：

```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3"
  ]
}
```

每个 URL 应该是一个完整的网址，包括 "https://" 或 "http://" 前缀。

## 安装依赖

运行以下命令安装所需的依赖：

```bash
pnpm install
```

## 使用

运行以下命令提交 URL：

```bash
ts-node indexing.ts
```
