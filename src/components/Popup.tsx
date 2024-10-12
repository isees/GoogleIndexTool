'use client'

import React, { useState, useEffect, ErrorInfo } from 'react'
import SettingsModal from './SettingsModal'
import UrlInput from './UrlInput'
import { getConfigurations, getLastSelectedConfiguration, setLastSelectedConfiguration, getLastInputUrls, setLastInputUrls, getConfiguration } from '@/utils/storage'
import { submitUrls } from '@/utils/indexing'

interface FailedUrl {
  url: string;
  message: string;
}

interface SubmitResult {
  success: number;
  failed: number;
  failedUrls: FailedUrl[];
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h1 className="text-xl font-bold mb-2">Something went wrong.</h1>
        <p>{this.state.error?.message}</p>
      </div>
    }

    return this.props.children
  }
}

const Popup: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [configurations, setConfigurations] = useState<string[]>([])
  const [selectedConfig, setSelectedConfig] = useState('')
  const [urls, setUrls] = useState('')
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const configs = await getConfigurations()
        setConfigurations(configs)
        const lastSelected = await getLastSelectedConfiguration()
        if (lastSelected && configs.includes(lastSelected)) {
          setSelectedConfig(lastSelected)
        } else if (configs.length > 0) {
          setSelectedConfig(configs[0])
        }
        const lastUrls = await getLastInputUrls()
        setUrls(lastUrls)
      } catch (error) {
        console.error('Error loading initial data:', error)
        setSubmitResult({
          success: 0,
          failed: 0,
          failedUrls: []
        })
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  if (!isLoaded) return null;

  const handleConfigChange = async (config: string) => {
    setSelectedConfig(config)
    await setLastSelectedConfiguration(config)
  }

  const handleUrlsChange = async (newUrls: string) => {
    setUrls(newUrls)
    await setLastInputUrls(newUrls)
  }

  const handleClearUrls = async () => {
    setUrls('')
    await setLastInputUrls('')
  }

  const handleSubmit = async () => {
    if (!selectedConfig || !urls.trim()) {
      alert('Please select a configuration and enter URLs')
      return
    }
    const urlList = urls.split('\n').filter(url => url.trim())
    setIsLoading(true);
    try {
      setSubmitResult({ success: 0, failed: 0, failedUrls: [] })

      const config = await getConfiguration(selectedConfig);
      if (!config) {
        throw new Error('Configuration not found');
      }
      const result = await submitUrls(config, urlList)

      const successCount = result.filter(r => r.status === 'success').length
      const failedResults = result.filter(r => r.status === 'error')
      const failedCount = failedResults.length
      const failedUrls = failedResults.map(r => ({
        url: r.url,
        message: r.message || 'Unknown error'
      }))

      setSubmitResult({
        success: successCount,
        failed: failedCount,
        failedUrls: failedUrls
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setSubmitResult({
        success: 0,
        failed: urlList.length,
        failedUrls: urlList.map(url => ({ url, message: errorToString(error) }))
      })
    } finally {
      setIsLoading(false);
    }
  }

  const renderSubmitResult = () => {
    if (isLoading) {
      return (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Processing URLs...</span>
          </div>
        </div>
      );
    }

    if (!submitResult) return null;

    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Submit Result:</h2>
        <p>Success: {submitResult.success}</p>
        <p>Failed: {submitResult.failed}</p>
        {submitResult.failedUrls.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mt-2 mb-1">Failed URLs:</h3>
            <textarea
              className="w-full p-2 border rounded"
              rows={10}
              readOnly
              value={submitResult.failedUrls.map(f => `${f.url} - ${f.message}`).join('\n')}
            />
            <button
              onClick={() => navigator.clipboard.writeText(submitResult.failedUrls.map(f => f.url).join('\n'))}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded transition duration-300"
            >
              Copy Failed URLs
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="p-6 w-[600px] mx-auto bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center">URL Indexer</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mb-6 w-full transition duration-300"
        >
          Settings
        </button>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onConfigurationsChange={setConfigurations}
        />
        <UrlInput
          urls={urls}
          setUrls={handleUrlsChange}
          configurations={configurations}
          selectedConfig={selectedConfig}
          setSelectedConfig={handleConfigChange}
          onClearUrls={handleClearUrls}
        />
        <button
          onClick={handleSubmit}
          className={`${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            } text-white px-6 py-2 rounded-lg mt-6 w-full transition duration-300`}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
        {renderSubmitResult()}
      </div>
    </ErrorBoundary>
  )
}

function errorToString(error: unknown): string {
  console.log('Error object:', error);
  console.log('Error type:', typeof error);
  console.log('Is Error instance:', error instanceof Error);
  if (error instanceof Error) {
    return error.message
  } else {
    return String(error)
  }
}

export default Popup
