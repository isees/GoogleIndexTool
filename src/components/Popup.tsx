'use client'

import React, { useState, useEffect, ErrorInfo } from 'react'
import SettingsModal from './SettingsModal'
import UrlInput from './UrlInput'
import { getConfigurations, getLastSelectedConfiguration, setLastSelectedConfiguration, getLastInputUrls, setLastInputUrls, getConfiguration } from '@/utils/storage'
import { submitUrls } from '@/utils/indexing'

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
  const [submitResult, setSubmitResult] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false);

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
        setSubmitResult(`Error loading initial data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    try {
      setSubmitResult('Submitting URLs...')

      const config = await getConfiguration(selectedConfig);
      if (!config) {
        throw new Error('Configuration not found');
      }
      const result = await submitUrls(config, urlList)
      setSubmitResult(JSON.stringify(result, null, 2))
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setSubmitResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

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
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg mt-6 w-full transition duration-300"
        >
          Submit
        </button>
        {submitResult && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Submit Result:</h2>
            <pre className="whitespace-pre-wrap overflow-auto max-h-60">{submitResult}</pre>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default Popup