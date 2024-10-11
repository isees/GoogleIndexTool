import JSON5 from 'json5';
import jwt from 'jsonwebtoken';
import { Configuration } from './storage';

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
    const jwtToken = jwt.sign(payload, private_key, { algorithm: 'RS256' });

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
    throw error;
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
    console.error('Error in submitUrls:', error);
    throw error;
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
      body: JSON5.stringify({ url, type: 'URL_UPDATED' }),
    });

    log('URL Submission Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      log('URL Submission Error Response:', JSON.stringify(errorData));
      throw new Error(errorData.error?.message || 'Unknown error');
    }

    const data = await response.json();
    log('URL Submission Response:', JSON.stringify(data));
    return { url, status: 'success', message: `URL submitted successfully: ${JSON5.stringify(data)}` };
  } catch (error) {
    log('Error submitting URL:', url, error);
    return { url, status: 'error', message: `Error submitting URL: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}