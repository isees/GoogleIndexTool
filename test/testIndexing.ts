import { submitUrls } from '@/utils/indexing';
import { Configuration } from '@/utils/storage';
import fs from 'fs';
import JSON5 from 'json5';
import { webcrypto } from 'node:crypto';
import path from 'path';

// @ts-ignore
global.crypto = webcrypto;

// 读取配置文件
let config: {
  google_api: {
    client_email: string;
    private_key: string;
  };
  test_urls: string[];
  proxy?: string;
};

try {
  const fileContent = fs.readFileSync(path.resolve(__dirname, 'test_data.json'), 'utf-8');
  config = JSON5.parse(fileContent);
} catch (error) {
  console.error('Error reading test_data.json. Make sure you have created this file based on test_data.json.example');
  process.exit(1);
}

process.env.DEBUG = 'true';

describe('indexUrl function', () => {
  it('should submit URLs successfully', async () => {
    // 设置测试配置
    const testConfig: Configuration = {
      client_email: config.google_api.client_email,
      private_key: config.google_api.private_key.replace(/\\n/g, '\n'), // 确保换行符被正确处理
    };

    console.log('Test config:', JSON5.stringify(testConfig, null, 2)); // 添加这行来检查配置

    // 测试 URL 列表
    const testUrls = config.test_urls;

    try {
      console.log('Starting test...');
      const results = await submitUrls(testConfig, testUrls);
      console.log('Test results:', JSON5.stringify(results, null, 2));

      // 添加一些断言
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(testUrls.length);
      results.forEach((result: { url: string; status: string }, index: number) => {
        expect(result.url).toBe(testUrls[index]);
        expect(['success', 'error']).toContain(result.status);
      });
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  }, 30000); // 增加超时时间到 30 秒，因为真实 API 调用可能需要更长时间
});
