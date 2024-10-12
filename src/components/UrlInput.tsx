'use client'

import React from 'react'

interface UrlInputProps {
  urls: string
  setUrls: (urls: string) => void
  configurations: string[]
  selectedConfig: string
  setSelectedConfig: (config: string) => void
  onClearUrls: () => void
}

const UrlInput: React.FC<UrlInputProps> = ({
  urls,
  setUrls,
  configurations,
  selectedConfig,
  setSelectedConfig,
  onClearUrls,
}) => {
  return (
    <div>
      <select
        value={selectedConfig}
        onChange={(e) => setSelectedConfig(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a configuration</option>
        {configurations.map((config) => (
          <option key={config} value={config}>
            {config}
          </option>
        ))}
      </select>
      <div className="relative">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Enter URLs (one per line)"
          className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={10}
        />
        <button
          onClick={onClearUrls}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default UrlInput