import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Form validation schema
const appointmentSchema = z.object({
    patient_id: z.string().min(1, "Please select a patient"),
    doctor_id: z.string().min(1, "Please select a doctor"),
    slot_id: z.string().optional(),
    date: z.string().min(1, "Please select a date"),
    reason: z.string().min(1, "Please enter a reason"),
    symptom: z.string().min(1, "Please enter symptoms"),
    appointment_type: z.string().min(1, "Please select appointment type"),
    service_fees: z.string().min(1, "Please enter service fees"),
    remarks: z.string().optional(),
    reshedule: z.string().optional(),
    week_day_id: z.string().optional(),
    week_day: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Doctor {
    id: string;
    first_name: string;
    last_name: string;
    specialization_name: string;
}

interface Slot {
    id: string;
    doctor_id: string;
    week_day_id: string;
    week_day: string;
    start_time: string;
    end_time: string;
    interval: string;
}

interface Weekday {
    id: string;
    name: string;
}

const AddAppointment: React.FC = () => {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [weekdayIdFromDate, setWeekdayIdFromDate] = useState<string>("");
    const [hasSlots, setHasSlots] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            patient_id: "",
            doctor_id: "",
            slot_id: "",
            date: "",
            reason: "",
            symptom: "",
            appointment_type: "1",
            service_fees: "",
            remarks: "",
            reshedule: "1",
            week_day_id: "",
            week_day: "",
            start_time: "",
            end_time: "",
        },
    });

    // Function to get weekday ID from date (1=Sunday, 2=Monday, etc.)
    const getWeekdayIdFromDate = (dateString: string): string => {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        return (dayOfWeek + 1).toString(); // Convert to 1=Sunday, 2=Monday, etc.
    };

    // Fetch patients
    const { data: patientsData, isLoading: loadingPatients } = useQuery({
        queryKey: ["patients-all"],
        queryFn: async () => {
            const response = await apiRequest(
                "GET",
                "/doctor/patients/GetAllPatients?pagination_required=false"
            );
            if (!response.ok) throw new Error("Failed to fetch patients");
            const result = await response.json();
            return result.data || [];
        },
    });

    // Fetch doctors
    const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
        queryKey: ["doctors-all"],
        queryFn: async () => {
            const response = await apiRequest(
                "GET",
                "/doctor/doctors/GetAllDoctors?pagination_required=false"
            );
            if (!response.ok) throw new Error("Failed to fetch doctors");
            const result = await response.json();
            return result.data || [];
        },
    });

    // Fetch slots based on selected doctor and weekday from date
    const { data: slotsData, isLoading: loadingSlots } = useQuery({
        queryKey: ["slots", selectedDoctorId, weekdayIdFromDate],
        queryFn: async () => {
            if (!selectedDoctorId || !weekdayIdFromDate) return [];
            const response = await apiRequest(
                "GET",
                `/doctor/slots/weekday?week_day_id=${weekdayIdFromDate}&doctor_id=${selectedDoctorId}`
            );
            if (!response.ok) throw new Error("Failed to fetch slots");
            const result = await response.json();
            return result.data || [];
        },
        enabled: !!selectedDoctorId && !!weekdayIdFromDate,
    });

    // Fetch weekdays
    const { data: weekdaysData, isLoading: loadingWeekdays } = useQuery({
        queryKey: ["weekdays"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/doctor/weekdays/list");
            if (!response.ok) throw new Error("Failed to fetch weekdays");
            const result = await response.json();
            return result.data || [];
        },
    });

    // Handle date change - calculate weekday and fetch slots
    const handleDateChange = (dateString: string) => {
        setSelectedDate(dateString);
        setValue("date", dateString);

        if (dateString && selectedDoctorId) {
            const weekdayId = getWeekdayIdFromDate(dateString);
            setWeekdayIdFromDate(weekdayId);
        }
    };

    // Update hasSlots when slots data changes
    useEffect(() => {
        if (slotsData && slotsData.length > 0) {
            setHasSlots(true);
        } else {
            setHasSlots(false);
            // Clear slot_id if no slots available
            setValue("slot_id", "");
        }
    }, [slotsData, setValue]);

    // Handle slot selection - auto-fill time fields
    const handleSlotChange = (slotId: string) => {
        setValue("slot_id", slotId);
        const selectedSlot = slotsData?.find((slot: Slot) => slot.id === slotId);
        if (selectedSlot) {
            setValue("week_day_id", selectedSlot.week_day_id);
            setValue("week_day", selectedSlot.week_day);
            setValue("start_time", selectedSlot.start_time);
            setValue("end_time", selectedSlot.end_time);
        }
    };

    // Create appointment mutation
    const createAppointmentMutation = useMutation({
        mutationFn: async (data: AppointmentFormData) => {
            const payload = {
                patient_id: data.patient_id,
                doctor_id: data.doctor_id,
                slot_id: hasSlots ? data.slot_id : "",
                date: data.date,
                reason: data.reason,
                symptom: data.symptom,
                appointment_type: parseInt(data.appointment_type),
                service_fees: parseFloat(data.service_fees),
                remarks: data.remarks || "",
                reshedule: parseInt(data.reshedule || "1"),
                week_day_id: hasSlots ? "" : data.week_day_id || "",
                week_day: hasSlots ? "" : data.week_day || "",
                start_time: hasSlots ? "" : data.start_time || "",
                end_time: hasSlots ? "" : data.end_time || "",
            };

            const response = await apiRequest(
                "POST",
                "/appointment/appointments/InsertAppointment",
                payload
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Failed to create appointment");
            }

            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Appointment created successfully!",
            });
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            setLocation("/appointments");
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create appointment",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: AppointmentFormData) => {
        createAppointmentMutation.mutate(data);
    };

    const isLoading =
        loadingPatients || loadingDoctors || loadingWeekdays || loadingSlots;

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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Add New Appointment
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Fill in the details to create a new appointment
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Patient Selection */}
                        <div>
                            <Label htmlFor="patient_id">
                                Patient <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                onValueChange={(value) => setValue("patient_id", value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patientsData?.map((patient: Patient) => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.firstName} {patient.lastName} - {patient.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.patient_id && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.patient_id.message}
                                </p>
                            )}
                        </div>

                        {/* Doctor Selection */}
                        <div>
                            <Label htmlFor="doctor_id">
                                Doctor <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    setValue("doctor_id", value);
                                    setSelectedDoctorId(value);
                                }}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctorsData?.map((doctor: Doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.first_name} {doctor.last_name} -{" "}
                                            {doctor.specialization_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.doctor_id && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.doctor_id.message}
                                </p>
                            )}
                        </div>

                        {/* Appointment Date */}
                        <div>
                            <Label htmlFor="date">
                                Appointment Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                className="w-full"
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                            {errors.date && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.date.message}
                                </p>
                            )}
                        </div>

                        {/* Conditional Slot Selection or Manual Time Entry */}
                        {selectedDoctorId && selectedDate && (
                            <>
                                {hasSlots ? (
                                    <div>
                                        <Label htmlFor="slot_id">
                                            Available Slot <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            onValueChange={handleSlotChange}
                                            disabled={loadingSlots}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a time slot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {slotsData?.map((slot: Slot) => (
                                                    <SelectItem key={slot.id} value={slot.id}>
                                                        {slot.week_day} - {slot.start_time} to{" "}
                                                        {slot.end_time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.slot_id && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.slot_id.message}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                            <p className="text-sm text-yellow-800">
                                                No slots available for this doctor on the selected date. Please enter the
                                                appointment time manually.
                                            </p>
                                        </div>

                                        {/* Weekday Selection */}
                                        <div>
                                            <Label htmlFor="week_day_id">
                                                Weekday <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                onValueChange={(value) => {
                                                    setValue("week_day_id", value);
                                                    const weekday = weekdaysData?.find(
                                                        (w: Weekday) => w.id === value
                                                    );
                                                    if (weekday) setValue("week_day", weekday.name);
                                                }}
                                                disabled={loadingWeekdays}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select weekday" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {weekdaysData?.map((weekday: Weekday) => (
                                                        <SelectItem key={weekday.id} value={weekday.id}>
                                                            {weekday.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.week_day_id && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors.week_day_id.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Start Time */}
                                        <div>
                                            <Label htmlFor="start_time">
                                                Start Time <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                {...register("start_time")}
                                                type="time"
                                                className="w-full"
                                            />
                                            {errors.start_time && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors.start_time.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* End Time */}
                                        <div>
                                            <Label htmlFor="end_time">
                                                End Time <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                {...register("end_time")}
                                                type="time"
                                                className="w-full"
                                            />
                                            {errors.end_time && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors.end_time.message}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Appointment Type */}
                        <div>
                            <Label htmlFor="appointment_type">
                                Appointment Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                onValueChange={(value) => setValue("appointment_type", value)}
                                defaultValue="1"
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select appointment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">In-Person</SelectItem>
                                    <SelectItem value="2">Telemedicine</SelectItem>
                                    <SelectItem value="3">Follow-up</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.appointment_type && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.appointment_type.message}
                                </p>
                            )}
                        </div>

                        {/* Reason */}
                        <div>
                            <Label htmlFor="reason">
                                Reason for Visit <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                {...register("reason")}
                                placeholder="e.g., Regular checkup"
                                className="w-full"
                            />
                            {errors.reason && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.reason.message}
                                </p>
                            )}
                        </div>

                        {/* Symptoms */}
                        <div>
                            <Label htmlFor="symptom">
                                Symptoms <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                {...register("symptom")}
                                placeholder="Describe symptoms..."
                                className="w-full"
                                rows={3}
                            />
                            {errors.symptom && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.symptom.message}
                                </p>
                            )}
                        </div>

                        {/* Service Fees */}
                        <div>
                            <Label htmlFor="service_fees">
                                Service Fees <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                {...register("service_fees")}
                                type="number"
                                placeholder="500"
                                className="w-full"
                                min="0"
                                step="0.01"
                            />
                            {errors.service_fees && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.service_fees.message}
                                </p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div>
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Textarea
                                {...register("remarks")}
                                placeholder="Additional notes..."
                                className="w-full"
                                rows={2}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={createAppointmentMutation.isPending}
                                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                            >
                                {createAppointmentMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Appointment"
                                )}
                            </Button>
                            <Link href="/appointments">
                                <Button type="button" variant="outline" className="px-8">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAppointment;
