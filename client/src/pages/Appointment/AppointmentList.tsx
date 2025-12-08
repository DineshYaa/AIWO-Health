import React from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Eye,
    Edit,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Appointment {
    id: string;
    patient_id: string;
    patient_name?: string;
    doctor_id: string;
    doctor_name?: string;
    slot_id: string;
    date: string;
    reason: string;
    symptom: string;
    appointment_type: number;
    service_fees: number;
    remarks: string;
    reshedule: number;
    week_day_id: string;
    week_day: string;
    start_time: string;
    end_time: string;
    status?: number;
    created_at?: string;
}

interface AppointmentsResponse {
    data: Appointment[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pagesize: number;
}

const fetchAppointments = async ({
    queryKey,
}: {
    queryKey: readonly unknown[];
}): Promise<AppointmentsResponse> => {
    const [_, page, pageSize] = queryKey;

    const response = await apiRequest(
        "GET",
        `/appointment/appointments/GetAllAppointments?pageNo=${page}&pagesize=${pageSize}&pagination_required=true`
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Network response was not ok");
    }

    return response.json();
};

const AppointmentList: React.FC = () => {
    const [page, setPage] = React.useState(1);
    const [pageSize] = React.useState(10);

    const { token } = useAuth();

    const {
        data: appointmentsResponse,
        isLoading,
        isError,
        error,
    } = useQuery<AppointmentsResponse, Error>({
        queryKey: ["appointments", page, pageSize],
        queryFn: ({ queryKey }) => fetchAppointments({ queryKey }),
        enabled: !!token,
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage((p) => p - 1);
        }
    };

    const handleNextPage = () => {
        if (appointmentsResponse && page < appointmentsResponse?.totalPages) {
            setPage((p) => p + 1);
        }
    };

    const getAppointmentTypeLabel = (type: number) => {
        const types: Record<number, string> = {
            1: "In-Person",
            2: "Telemedicine",
            3: "Follow-up",
        };
        return types[type] || "Unknown";
    };

    const getStatusLabel = (status?: number) => {
        const statuses: Record<number, { label: string; className: string }> = {
            1: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
            2: { label: "Completed", className: "bg-green-100 text-green-800" },
            3: { label: "Cancelled", className: "bg-red-100 text-red-800" },
            4: { label: "Rescheduled", className: "bg-yellow-100 text-yellow-800" },
        };
        return statuses[status || 1] || { label: "Scheduled", className: "bg-blue-100 text-blue-800" };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-500 bg-white p-8 rounded-xl shadow-lg">
                    Error: {error?.message}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-12">
            <div className="max-w-7xl w-full mx-auto">
                {/* Header Section */}
                <div className="flex items-center gap-3 justify-center mb-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-gray-900">AIWO</span>
                        <span className="text-xl text-gray-600"> Healthcation</span>
                    </div>
                </div>
                <div className="text-left mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Appointments
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Manage and view all appointments
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Controls Header */}
                    <div className="flex flex-col md:flex-row justify-end items-center mb-8 gap-4">
                        <Link href="/appointments/add">
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Appointment
                            </Button>
                        </Link>
                    </div>

                    {!appointmentsResponse?.data?.length ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No appointments found
                        </div>
                    ) : (
                        <>
                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-gray-700">
                                                Patient
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Doctor
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Date
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Time
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Type
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Reason
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Status
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointmentsResponse.data.map((appointment: Appointment) => {
                                            const statusInfo = getStatusLabel(appointment.status);
                                            return (
                                                <TableRow
                                                    key={appointment.id}
                                                    className="hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <TableCell className="font-medium text-gray-900">
                                                        {appointment.patient_name || appointment.patient_id}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {appointment.doctor_name || appointment.doctor_id}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {new Date(appointment.date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {appointment.start_time && appointment.end_time
                                                            ? `${appointment.start_time} - ${appointment.end_time}`
                                                            : "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {getAppointmentTypeLabel(appointment.appointment_type)}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {appointment.reason}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                                                        >
                                                            {statusInfo.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link href={`/appointments/view/${appointment.id}`}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="hover:bg-teal-50 hover:text-teal-600"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/appointments/edit/${appointment.id}`}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="hover:bg-teal-50 hover:text-teal-600"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                    Showing{" "}
                                    <span className="font-medium text-gray-900">
                                        {(page - 1) * pageSize + 1}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium text-gray-900">
                                        {Math.min(
                                            page * pageSize,
                                            appointmentsResponse?.totalRecords || 0
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium text-gray-900">
                                        {appointmentsResponse?.totalRecords || 0}
                                    </span>{" "}
                                    appointments
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={page === 1}
                                        className="hover:bg-gray-50 hover:text-teal-600"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Page {page} of {appointmentsResponse?.totalPages || 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={
                                            !appointmentsResponse || page >= appointmentsResponse.totalPages
                                        }
                                        className="hover:bg-gray-50 hover:text-teal-600"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentList;
