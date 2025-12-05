import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Designation {
    id: string;
    name: string;
    status: 'Active' | 'Inactive';
    created_at?: string;
}

export default function DesignationsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Designation | null>(null);
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10;
    const { toast } = useToast();

    // Fetch designations
    const { data: response, isLoading } = useQuery({
        queryKey: ['/api/designations', pageNo, searchTerm],
        queryFn: async () => {
            const res: any = await apiRequest(
                'GET',
                `/doctor/designations/GetAllDesignations?pageNo=${pageNo}&pagesize=${pageSize}&pagination_required=true`,
                undefined
            );
            return res.json();
        },
    });

    const designations = response?.data || [];
    const totalPages = response?.totalPages || 1;

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data: { name: string; status: string }) => {
            if (editingItem) {
                return await apiRequest(
                    'PUT',
                    `/doctor/designations/UpdateDesignation/${editingItem.id}`,
                    data
                );
            }
            return await apiRequest('POST', '/doctor/designations/InsertDesignation', data);
        },
        onSuccess: () => {
            toast({
                title: editingItem ? 'Designation Updated' : 'Designation Created',
                description: `Designation has been ${editingItem ? 'updated' : 'created'} successfully.`,
            });
            queryClient.invalidateQueries({ queryKey: ['/api/designations'] });
            handleCloseDialog();
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save designation.',
                variant: 'destructive',
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiRequest('DELETE', `/doctor/designations/DeleteDesignation/${id}`, undefined);
        },
        onSuccess: () => {
            toast({
                title: 'Designation Deleted',
                description: 'Designation has been deleted successfully.',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/designations'] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete designation.',
                variant: 'destructive',
            });
        },
    });

    const handleOpenDialog = (item?: Designation) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setStatus(item.status);
        } else {
            setEditingItem(null);
            setName('');
            setStatus('Active');
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        setName('');
        setStatus('Active');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a designation name.',
                variant: 'destructive',
            });
            return;
        }

        saveMutation.mutate({ name, status });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this designation?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Designations</h1>
                        <p className="text-gray-600 mt-1">Manage doctor designations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search"
                                className="pl-10 w-64"
                            />
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => handleOpenDialog()}
                                    className="bg-teal-500 hover:bg-teal-600 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingItem ? 'Edit Designation' : 'Add New Designation'}</DialogTitle>
                                    <DialogDescription>
                                        {editingItem ? 'Update designation details' : 'Create a new designation'}
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label>Designation Name *</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter designation name"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label>Status</Label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-teal-500 hover:bg-teal-600"
                                            disabled={saveMutation.isPending}
                                        >
                                            {saveMutation.isPending ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <table className="w-full">
                    <thead className="bg-teal-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : designations.length > 0 ? (
                            designations.map((item: Designation) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(item)}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    No designations found. Click "Add New" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
