import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// 读取服务账号密钥
const key = require('./config/key.json');

// 读取URL配置文件
const urlConfigPath = path.join(__dirname, 'config', 'url.json');
const urlConfig = JSON.parse(fs.readFileSync(urlConfigPath, 'utf-8'));

// 使用配置文件中的URLs
const urls = urlConfig.urls;

async function submitUrl(url: string) {
  const jwtClient = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({
    version: 'v3',
    auth: jwtClient
  });

  try {
    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    console.log(`URL ${url} submitted successfully:`, res.data);
  } catch (error) {
    console.error(`Error submitting URL ${url}:`, error);
  }
}

// 使用示例
urls.forEach((url: string) => submitUrl(url));