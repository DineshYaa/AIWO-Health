import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { convertTo12Hour, changeDateFormate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";

interface AppointmentDetails {
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

const ViewAppointment: React.FC = () => {
    const [match, params] = useRoute("/appointments/view/:id");
    const appointmentId = params?.id;

    const { data: appointmentData, isLoading, isError, error } = useQuery({
        queryKey: ["appointment", appointmentId],
        queryFn: async () => {
            if (!appointmentId) throw new Error("No appointment ID provided");
            const response = await apiRequest(
                "GET",
                `/appointment/appointments/GetAppointmentById/${appointmentId}`
            );
            if (!response.ok) throw new Error("Failed to fetch appointment");
            const result = await response.json();
            return result.data as AppointmentDetails;
        },
        enabled: !!appointmentId,
        refetchOnMount: "always", // Always refetch when component mounts
        staleTime: 0, // Consider data stale immediately
    });

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

    if (isError || !appointmentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-500 bg-white p-8 rounded-xl shadow-lg">
                    Error: {error?.message || "Failed to load appointment"}
                </div>
            </div>
        );
    }

    const statusInfo = getStatusLabel(appointmentData.status);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-12">
            <div className="max-w-4xl w-full mx-auto">
                {/* Header */}
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

                <div className="mb-6">
                    <Link href="/appointments">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Appointments
                        </Button>
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Appointment Details
                            </h2>
                            <p className="text-gray-600 text-sm">
                                View complete appointment information
                            </p>
                        </div>
                        <Link href={`/appointments/edit/${appointmentId}`}>
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Appointment
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
                            >
                                {statusInfo.label}
                            </span>
                        </div>

                        {/* Patient Information */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Patient Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Patient Name
                                    </label>
                                    <p className="text-base text-gray-900 mt-1">
                                        {appointmentData.patient_name || appointmentData.patient_id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Information */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Doctor Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Doctor Name
                                    </label>
                                    <p className="text-base text-gray-900 mt-1">
                                        {appointmentData.doctor_name || appointmentData.doctor_id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Appointment Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Date
                                    </label>
                                    <p className="text-base text-gray-900 mt-1">
                                        {changeDateFormate(appointmentData.date)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Time
                                    </label>
                                    <p className="text-base text-gray-900 mt-1">
                                        {appointmentData.start_time && appointmentData.end_time
                                            ? `${convertTo12Hour(appointmentData.start_time)} - ${convertTo12Hour(appointmentData.end_time)}`
                                            : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Day
                                    </label>
                                    <p className="text-base text-gray-900 mt-1">
                                        {appointmentData.week_day || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Appointment Type
                                    </label>
                                    <p className="text-base text-gray-900 mt-1">
                                        {getAppointmentTypeLabel(appointmentData.appointment_type)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Medical Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Reason for Visit
                                    </label>
                                    <p className="text-base text-gray-900 mt-1">
                                        {appointmentData.reason}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Symptoms
                                    </label>
                                    <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                                        {appointmentData.symptom}
                                    </p>
                                </div>
                                {appointmentData.remarks && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Remarks
                                        </label>
                                        <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                                            {appointmentData.remarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Link href={`/appointments/edit/${appointmentId}`}>
                                <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Appointment
                                </Button>
                            </Link>
                            <Link href="/appointments">
                                <Button variant="outline">
                                    Back to List
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAppointment;
