import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Shield, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
    name: string;
    user_type: string;
    is_primary: string;
    created_at: string;
}

interface RolesResponse {
    message: string;
    roles: Role[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function RolesListPage() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Fetch roles
    const { data: response, isLoading } = useQuery<RolesResponse>({
        queryKey: ['/api/roles', currentPage],
        queryFn: async () => {
            const res: any = await apiRequest('GET', `/user/role?page=${currentPage}&limit=${pageSize}`, undefined);
            return res.json();
        },
    });

    const roles = response?.roles || [];
    const pagination = response?.pagination;

    // Delete role mutation
    const deleteRoleMutation = useMutation({
        mutationFn: async (roleId: string) => {
            return await apiRequest('DELETE', `/user/role/${roleId}`, undefined);
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

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
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
                        <thead className="bg-teal-600 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                    Role Name
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                    User Type
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Loading roles...
                                    </td>
                                </tr>
                            ) : roles && roles.length > 0 ? (
                                roles.map((role) => {
                                    const roleTypeInfo = ROLE_TYPES.find((t) => t.value === role.name);
                                    const RoleIcon = roleTypeInfo?.icon || Shield;
                                    return (
                                        <tr key={role.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${roleTypeInfo?.color || 'bg-gray-500'}`}>
                                                        <RoleIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 capitalize">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                                                    {role.user_type === '1' ? 'Admin' : 'User'}
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
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
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
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No roles found. Click "Add Role" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total roles)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
