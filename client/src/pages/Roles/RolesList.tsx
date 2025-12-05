import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Role types
const ROLE_TYPES = [
    { value: 'doctor', label: 'Doctor', icon: Users, color: 'bg-blue-500' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-purple-500' },
];

interface Role {
    id: string;
    role_type: 'doctor' | 'admin';
    role_name: string;
    permissions: Record<string, string[]>;
    created_at: string;
}

export default function RolesListPage() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Fetch roles
    const { data: roles, isLoading } = useQuery<Role[]>({
        queryKey: ['/api/roles'],
        queryFn: async () => {
            const response: any = await apiRequest('GET', '/auth/roles', undefined);
            return response.data || [];
        },
    });

    // Delete role mutation
    const deleteRoleMutation = useMutation({
        mutationFn: async (roleId: string) => {
            return await apiRequest('DELETE', `/auth/roles/${roleId}`, undefined);
        },
        onSuccess: () => {
            toast({
                title: 'Role Deleted',
                description: 'Role has been deleted successfully.',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete role.',
                variant: 'destructive',
            });
        },
    });

    const getModulesWithFullAccess = (rolePermissions: Record<string, string[]>) => {
        return Object.entries(rolePermissions).filter(([_, perms]) => perms.includes('full_access')).length;
    };

    const handleAddRole = () => {
        setLocation('/roles/add');
    };

    const handleEditRole = (roleId: string) => {
        setLocation(`/roles/edit/${roleId}`);
    };

    const handleDeleteRole = (roleId: string) => {
        if (confirm('Are you sure you want to delete this role?')) {
            deleteRoleMutation.mutate(roleId);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
                    <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
                </div>
                <Button
                    onClick={handleAddRole}
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
                </Button>
            </div>

            {/* Roles List */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Loading roles...
                                    </td>
                                </tr>
                            ) : roles && roles.length > 0 ? (
                                roles.map((role) => {
                                    const roleTypeInfo = ROLE_TYPES.find((t) => t.value === role.role_type);
                                    const RoleIcon = roleTypeInfo?.icon || Shield;
                                    return (
                                        <tr key={role.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${roleTypeInfo?.color || 'bg-gray-500'}`}>
                                                        <RoleIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 capitalize">{role.role_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{role.role_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                                    {getModulesWithFullAccess(role.permissions)} modules with full access
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(role.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditRole(role.id)}
                                                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No roles found. Click "Add Role" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
