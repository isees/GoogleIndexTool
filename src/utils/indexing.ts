import { Buffer } from 'buffer';
import * as jsrsasign from 'jsrsasign';

declare global {
  interface Window {
    process: any;
    Buffer: typeof Buffer;
  }
}

import { Configuration } from '@/utils/storage';

const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

function log(...args: any[]) {
  if (DEBUG) {
    console.log(...args);
  }
}

async function getAccessToken(config: Configuration): Promise<string> {
  const { client_email, private_key } = config;
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  try {
    log('Payload:', JSON.stringify(payload));
    log('Private key:', private_key.substring(0, 20) + '...');  // Log only the beginning of the private key for security

    const header = { alg: 'RS256', typ: 'JWT' };
    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload);

    // 确保私钥格式正确
    let formattedPrivateKey = private_key;
    if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${formattedPrivateKey}\n-----END PRIVATE KEY-----`;
    }
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');

    log('Formatted private key:', formattedPrivateKey.substring(0, 40) + '...');

    const privateKey = jsrsasign.KEYUTIL.getKey(formattedPrivateKey);

    if (!(privateKey instanceof jsrsasign.RSAKey)) {
      throw new Error('Invalid private key format');
    }

    const jwtToken = jsrsasign.KJUR.jws.JWS.sign(
      'RS256',
      sHeader,
      sPayload,
      privateKey as jsrsasign.RSAKey
    );

    log('Requesting access token with the following configuration:');
    log('Client Email:', client_email);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
    });

    log('OAuth2 Response Status:', response.status);
    log('OAuth2 Response Headers:', JSON.stringify(response.headers));

    if (!response.ok) {
      const responseText = await response.text();
      log('OAuth2 Error Response Body:', responseText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    const data = await response.json();
    log('OAuth2 Response Body:', JSON.stringify(data));
    return data.access_token;
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function submitUrls(config: Configuration, urls: string[]): Promise<Array<{ url: string; status: string; message: string }>> {
  try {
    if (!config) {
      throw new Error('Configuration not found');
    }

    log('Attempting to get access token...');
    const accessToken = await getAccessToken(config);
    log('Access token obtained successfully');

    return await Promise.all(urls.map(url => submitUrl(url, accessToken)));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error));
    }
  }
}

async function submitUrl(url: string, accessToken: string): Promise<{ url: string; status: string; message: string }> {
  try {
    log('Submitting URL:', url);
    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
    });

    log('URL Submission Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      log('URL Submission Error Response:', JSON.stringify(errorData));
      throw new Error(errorData.error?.message || 'Unknown error');
    }

    const data = await response.json();
    log('URL Submission Response:', JSON.stringify(data));
    return { url, status: 'success', message: `URL submitted successfully: ${JSON.stringify(data)}` };
  } catch (error) {
    log('Error submitting URL:', url, error);
    return { url, status: 'error', message: `Error submitting URL: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
