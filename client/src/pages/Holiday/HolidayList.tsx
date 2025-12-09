import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Loader2, Calendar } from "lucide-react";

interface Holiday {
    id: string;
    doctor_id: string;
    doctor_name?: string;
    holiday_date: string;
    holiday_name: string;
    holiday_type: number;
    reason: string;
    status?: number;
}

interface Doctor {
    id: string;
    first_name: string;
    last_name: string;
}

const HolidayList: React.FC = () => {
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [doctorFilter, setDoctorFilter] = useState("");
    const [holidayTypeFilter, setHolidayTypeFilter] = useState("");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

    // Fetch doctors for filter
    const { data: doctorsData } = useQuery({
        queryKey: ["doctors-all"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/doctor/doctors/GetAllDoctors");
            if (!response.ok) throw new Error("Failed to fetch doctors");
            const result = await response.json();
            return result.data;
        },
    });

    // Build query params
    const buildQueryParams = () => {
        const params = new URLSearchParams({
            pageNo: currentPage.toString(),
            pagesize: pageSize.toString(),
            pagination_required: "true",
        });

        if (doctorFilter) params.append("doctor_id", doctorFilter);
        if (holidayTypeFilter) params.append("holiday_type", holidayTypeFilter);
        if (startDateFilter) params.append("start_date", startDateFilter);
        if (endDateFilter) params.append("end_date", endDateFilter);

        return params.toString();
    };

    // Fetch holidays
    const { data: holidaysResponse, isLoading } = useQuery({
        queryKey: ["holidays", currentPage, doctorFilter, holidayTypeFilter, startDateFilter, endDateFilter],
        queryFn: async () => {
            const queryParams = buildQueryParams();
            const response = await apiRequest(
                "GET",
                `/doctor/holidays/GetAllHolidays?${queryParams}`
            );
            if (!response.ok) throw new Error("Failed to fetch holidays");
            return response.json();
        },
    });

    const holidaysData = holidaysResponse?.data || [];
    const totalPages = holidaysResponse?.totalPages || 1;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest("DELETE", `/doctor/holidays/DeleteHoliday/${id}`);
            if (!response.ok) throw new Error("Failed to delete holiday");
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Holiday deleted successfully!",
            });
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            setDeleteDialogOpen(false);
            setHolidayToDelete(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete holiday",
                variant: "destructive",
            });
        },
    });

    const handleDelete = (id: string) => {
        setHolidayToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (holidayToDelete) {
            deleteMutation.mutate(holidayToDelete);
        }
    };

    const getHolidayTypeLabel = (type: number) => {
        return type === 1 ? "Full Day" : type === 2 ? "Half Day" : "Unknown";
    };

    const resetFilters = () => {
        setDoctorFilter("");
        setHolidayTypeFilter("");
        setStartDateFilter("");
        setEndDateFilter("");
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-12">
            <div className="max-w-7xl w-full mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 justify-center mb-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-bold text-gray-900">AIWO</span>
                        <span className="text-xl text-gray-600"> Healthcation</span>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Holiday Management
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Manage doctor holidays and time off
                            </p>
                        </div>
                        <Link href="/holidays/add">
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Holiday
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Doctor Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Doctor
                                </label>
                                <Select value={doctorFilter || undefined} onValueChange={(value) => setDoctorFilter(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Doctors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctorsData?.map((doctor: Doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id}>
                                                Dr. {doctor.first_name} {doctor.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Holiday Type Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Holiday Type
                                </label>
                                <Select value={holidayTypeFilter || undefined} onValueChange={(value) => setHolidayTypeFilter(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Full Day</SelectItem>
                                        <SelectItem value="2">Half Day</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Start Date Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Start Date
                                </label>
                                <Input
                                    type="date"
                                    value={startDateFilter}
                                    onChange={(e) => setStartDateFilter(e.target.value)}
                                />
                            </div>

                            {/* End Date Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    End Date
                                </label>
                                <Input
                                    type="date"
                                    value={endDateFilter}
                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button variant="outline" onClick={resetFilters}>
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
                        </div>
                    ) : holidaysData.length === 0 ? (
                        <div className="text-center p-12">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No holidays found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Get started by creating a new holiday.
                            </p>
                            <Link href="/holidays/add">
                                <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Holiday
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            Doctor
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            Holiday Date
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            Holiday Name
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            Type
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            Reason
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {holidaysData.map((holiday: Holiday) => (
                                        <TableRow key={holiday.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-gray-900">
                                                {holiday.doctor_name || holiday.doctor_id}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {holiday.holiday_date}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {holiday.holiday_name}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${holiday.holiday_type === 1
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {getHolidayTypeLabel(holiday.holiday_type)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-600 max-w-xs truncate">
                                                {holiday.reason}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/holidays/edit/${holiday.id}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(holiday.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the holiday.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default HolidayList;
