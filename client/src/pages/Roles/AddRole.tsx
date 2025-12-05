import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Shield, Users, Plus, Eye, Pencil, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useRoute } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Role types
const ROLE_TYPES = [
    { value: 'doctor', label: 'Doctor', icon: Users, color: 'bg-blue-500' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-purple-500' },
];

// Modules/Permissions
const MODULES = [
    { id: 'patients', name: 'Patients', icon: '👤' },
    { id: 'doctors', name: 'Doctors', icon: '👨‍⚕️' },
    { id: 'appointments', name: 'Appointments', icon: '📅' },
    { id: 'billing_payment', name: 'Billing Payment', icon: '💳' },
    { id: 'schedule', name: 'Schedule', icon: '🕐' },
    { id: 'billing_package', name: 'Billing Package', icon: '📦' },
    { id: 'billing_sub_package', name: 'Billing Sub Package', icon: '📦' },
    { id: 'purchase', name: 'Purchase', icon: '🛒' },
    { id: 'purchase_return', name: 'Purchase Return', icon: '↩️' },
    { id: 'purchase_request', name: 'Purchase Request', icon: '📝' },
    { id: 'sales', name: 'Sales', icon: '💰' },
    { id: 'sales_return', name: 'Sales Return', icon: '↩️' },
];

const PERMISSIONS = ['add', 'view', 'edit', 'delete', 'full_access'];

interface Role {
    id: string;
    role_type: 'doctor' | 'admin';
    role_name: string;
    permissions: Record<string, string[]>;
    created_at: string;
}

export default function AddRolePage() {
    const [, setLocation] = useLocation();
    const [, params] = useRoute('/roles/edit/:id');
    const roleId = params?.id;
    const isEditMode = !!roleId;

    const [roleType, setRoleType] = useState<string>('');
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState<Record<string, string[]>>({});
    const { toast } = useToast();

    // Fetch role for editing
    const { data: existingRole } = useQuery<Role>({
        queryKey: ['/api/roles', roleId],
        queryFn: async () => {
            const response: any = await apiRequest('GET', `/auth/roles/${roleId}`, undefined);
            return response.data;
        },
        enabled: isEditMode,
    });

    // Load existing role data
    useEffect(() => {
        if (existingRole) {
            setRoleType(existingRole.role_type);
            setRoleName(existingRole.role_name);
            setPermissions(existingRole.permissions || {});
        }
    }, [existingRole]);

    // Create/Update role mutation
    const saveRoleMutation = useMutation({
        mutationFn: async (data: { role_type: string; role_name: string; permissions: Record<string, string[]> }) => {
            if (isEditMode) {
                return await apiRequest('PUT', `/auth/roles/${roleId}`, data);
            }
            return await apiRequest('POST', '/auth/roles', data);
        },
        onSuccess: () => {
            toast({
                title: isEditMode ? 'Role Updated' : 'Role Created',
                description: `Role has been ${isEditMode ? 'updated' : 'created'} successfully.`,
            });
            queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
            setLocation('/roles');
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save role.',
                variant: 'destructive',
            });
        },
    });

    const handlePermissionToggle = (moduleId: string, permission: string) => {
        setPermissions((prev) => {
            const modulePerms = prev[moduleId] || [];
            const hasPermission = modulePerms.includes(permission);

            if (permission === 'full_access') {
                return {
                    ...prev,
                    [moduleId]: hasPermission ? [] : [...PERMISSIONS],
                };
            }

            const newPerms = hasPermission
                ? modulePerms.filter((p) => p !== permission && p !== 'full_access')
                : [...modulePerms.filter((p) => p !== 'full_access'), permission];

            const allSelected = PERMISSIONS.filter((p) => p !== 'full_access').every((p) => newPerms.includes(p));
            if (allSelected && !newPerms.includes('full_access')) {
                newPerms.push('full_access');
            }

            return {
                ...prev,
                [moduleId]: newPerms,
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleType || !roleName) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        saveRoleMutation.mutate({
            role_type: roleType,
            role_name: roleName,
            permissions,
        });
    };

    const getModulesWithFullAccess = () => {
        return Object.entries(permissions).filter(([_, perms]) => perms.includes('full_access')).length;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => setLocation('/roles')}
                    className="mb-4 text-teal-600 hover:text-teal-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Roles List
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-teal-600" />
                    {isEditMode ? 'Edit Role' : 'Add New Role'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEditMode ? 'Update role information and permissions' : 'Create a new role with specific permissions'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal-600" />
                        Role Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">
                                Role Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={roleType} onValueChange={setRoleType}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select role type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <type.icon className="w-4 h-4" />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">
                                Role Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Enter Role Name"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Role Permissions */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-teal-500 text-white p-4">
                        <h3 className="text-lg font-semibold flex items-center justify-between">
                            <span>Role Permissions</span>
                            <span className="text-sm bg-white text-teal-600 px-3 py-1 rounded-full">
                                {getModulesWithFullAccess()} modules with full access
                            </span>
                        </h3>
                    </div>

                    <div>
                        {/* Permission Headers */}
                        <div className="bg-teal-500 text-white grid grid-cols-6 gap-2 p-3 text-sm font-medium">
                            <div className="col-span-1"></div>
                            <div className="flex items-center justify-center gap-1">
                                <Plus className="w-4 h-4" />
                                Add
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <Eye className="w-4 h-4" />
                                View
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <Pencil className="w-4 h-4" />
                                Edit
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <Check className="w-4 h-4" />
                                Full Access
                            </div>
                        </div>

                        {/* Permission Rows */}
                        {MODULES.map((module, index) => (
                            <div
                                key={module.id}
                                className={`grid grid-cols-6 gap-2 p-3 items-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } border-t border-gray-200`}
                            >
                                <div className="col-span-1 flex items-center gap-2 text-sm text-gray-700">
                                    <span>{module.icon}</span>
                                    {module.name}
                                </div>
                                {PERMISSIONS.map((permission) => (
                                    <div key={permission} className="flex justify-center">
                                        <input
                                            type="checkbox"
                                            checked={permissions[module.id]?.includes(permission) || false}
                                            onChange={() => handlePermissionToggle(module.id, permission)}
                                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation('/roles')}
                        disabled={saveRoleMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-teal-500 hover:bg-teal-600"
                        disabled={saveRoleMutation.isPending}
                    >
                        {saveRoleMutation.isPending ? 'Saving...' : isEditMode ? 'Update Role' : 'Create Role'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
