import React from 'react';
import { useLocation } from 'wouter';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsLayoutProps {
    children: React.ReactNode;
}

const settingsTabs = [
    {
        id: 'specializations',
        label: 'Specializations',
        path: '/settings/specializations',
    },
    {
        id: 'designations',
        label: 'Designations',
        path: '/settings/designations',
    },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const [location] = useLocation();

    return (
        <div className="flex h-full">
            {/* Side Navigation Tabs */}
            <div className="w-64 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-teal-600" />
                        Settings
                    </h2>
                </div>
                <nav className="p-3">
                    <ul className="space-y-1">
                        {settingsTabs.map((tab) => {
                            const isActive = location === tab.path;
                            return (
                                <li key={tab.id}>
                                    <a
                                        href={tab.path}
                                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 pl-3'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-50">
                {children}
            </div>
        </div>
    );
}
