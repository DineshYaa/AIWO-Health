import React, { useState } from 'react';
import { useLocation } from 'wouter';
import DesignationsPage from './Designations';
import SpecializationsPage from './Specializations';

export default function SettingsPage() {
    const [location, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState<'specializations' | 'designations'>('specializations');

    return (
        <div className="flex h-full">
            {/* Side Tabs */}
            <div className="w-64 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                </div>
                <nav className="p-3">
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={() => setActiveTab('specializations')}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'specializations'
                                    ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 pl-3'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                Specializations
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('designations')}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'designations'
                                    ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 pl-3'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                Designations
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-50 overflow-auto">
                {activeTab === 'specializations' && <SpecializationsPage key="specializations" />}
                {activeTab === 'designations' && <DesignationsPage key="designations" />}
            </div>
        </div>
    );
}
