'use client'

import React, { useState, useEffect } from 'react'
import { saveConfiguration, getConfigurations, deleteConfiguration, getConfiguration } from '@/utils/storage'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfigurationsChange: (configurations: string[]) => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConfigurationsChange }) => {
  const [configurations, setConfigurations] = useState<string[]>([])
  const [isConfigFormOpen, setIsConfigFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [configName, setConfigName] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [clientEmail, setClientEmail] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadConfigurations()
    }
  }, [isOpen])

  const loadConfigurations = async () => {
    const configs = await getConfigurations()
    setConfigurations(configs)
  }

  const handleAddNew = () => {
    setEditingConfig(null)
    setConfigName('')
    setPrivateKey('')
    setClientEmail('')
    setIsConfigFormOpen(true)
  }

  const handleEdit = async (name: string) => {
    const config = await getConfiguration(name)
    if (config) {
      setEditingConfig(name)
      setConfigName(name)
      setPrivateKey(config.private_key)
      setClientEmail(config.client_email)
      setIsConfigFormOpen(true)
    }
  }

  const handleDelete = async (name: string) => {
    if (window.confirm(`Are you sure you want to delete the configuration "${name}"?`)) {
      await deleteConfiguration(name)
      await loadConfigurations()
      onConfigurationsChange(await getConfigurations())
    }
  }

  const handleSave = async () => {
    if (!configName || !privateKey || !clientEmail) {
      alert('Please fill in all fields')
      return
    }

    await saveConfiguration(configName, { private_key: privateKey, client_email: clientEmail }, editingConfig)
    setIsConfigFormOpen(false)
    await loadConfigurations()
    onConfigurationsChange(await getConfigurations())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-[500px] max-w-full">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        {!isConfigFormOpen ? (
          <>
            <ul className="mb-4">
              {configurations.map((config) => (
                <li key={config} className="flex justify-between items-center mb-2">
                  <span>{config}</span>
                  <div>
                    <button onClick={() => handleEdit(config)} className="mr-2 px-3 py-1 bg-blue-500 text-white rounded">Edit</button>
                    <button onClick={() => handleDelete(config)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={handleAddNew} className="w-full px-6 py-2 bg-green-500 text-white rounded-lg mb-4">Add New Configuration</button>
            <button onClick={onClose} className="w-full px-6 py-2 bg-gray-200 rounded-lg">Close</button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Configuration Name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Private Key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
            <input
              type="text"
              placeholder="Client Email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <button onClick={() => setIsConfigFormOpen(false)} className="mr-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-300">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-300">Save</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SettingsModal