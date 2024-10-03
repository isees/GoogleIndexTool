import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

// 读取服务账号密钥
const key = require('./lovector-437304-6e3ab2c8f8d9.json');

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
const urls = [
  'https://lovector.me/page1',
  'https://lovector.me/page2',
  // ... 更多 URL
];

urls.forEach(url => submitUrl(url));