import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Form validation schema
const holidaySchema = z.object({
    doctor_id: z.string().min(1, "Please select a doctor"),
    holiday_date: z.string().min(1, "Please select a date"),
    holiday_name: z.string().min(1, "Please enter holiday name"),
    holiday_type: z.string().min(1, "Please select holiday type"),
    reason: z.string().min(1, "Please enter reason"),
});

type HolidayFormData = z.infer<typeof holidaySchema>;

interface Doctor {
    id: string;
    first_name: string;
    last_name: string;
    specialization_name?: string;
}

const AddHoliday: React.FC = () => {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [match, params] = useRoute("/holidays/edit/:id");
    const holidayId = params?.id;
    const isEditMode = !!holidayId;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<HolidayFormData>({
        resolver: zodResolver(holidaySchema),
        defaultValues: {
            doctor_id: "",
            holiday_date: "",
            holiday_name: "",
            holiday_type: "1",
            reason: "",
        },
    });

    // Fetch existing holiday data for edit mode
    const { data: holidayData, isLoading: loadingHoliday } = useQuery({
        queryKey: ["holiday", holidayId],
        queryFn: async () => {
            if (!holidayId) return null;
            const response = await apiRequest(
                "GET",
                `/doctor/holidays/GetHolidayById/${holidayId}`
            );
            if (!response.ok) throw new Error("Failed to fetch holiday");
            const result = await response.json();
            return result.data;
        },
        enabled: isEditMode && !!holidayId,
        refetchOnMount: "always",
        staleTime: 0,
    });

    // Pre-populate form when holiday data is loaded
    useEffect(() => {
        if (holidayData && isEditMode) {
            // Convert DD-MM-YYYY to YYYY-MM-DD for input[type="date"]
            const convertDateToInput = (dateStr: string) => {
                if (!dateStr) return "";
                const [day, month, year] = dateStr.split("-");
                return `${year}-${month}-${day}`;
            };

            reset({
                doctor_id: holidayData.doctor_id || "",
                holiday_date: convertDateToInput(holidayData.holiday_date) || "",
                holiday_name: holidayData.holiday_name || "",
                holiday_type: holidayData.holiday_type?.toString() || "1",
                reason: holidayData.reason || "",
            });
        }
    }, [holidayData, isEditMode, reset]);

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
            return result.data;
        },
    });

    // Save holiday mutation
    const saveHolidayMutation = useMutation({
        mutationFn: async (data: HolidayFormData) => {
            // Convert YYYY-MM-DD to DD-MM-YYYY for API
            const convertDateToAPI = (dateStr: string) => {
                if (!dateStr) return "";
                const [year, month, day] = dateStr.split("-");
                return `${day}-${month}-${year}`;
            };

            const payload = {
                doctor_id: data.doctor_id,
                holiday_date: convertDateToAPI(data.holiday_date),
                holiday_name: data.holiday_name,
                holiday_type: parseInt(data.holiday_type),
                reason: data.reason,
            };

            const response = await apiRequest(
                isEditMode ? "PUT" : "POST",
                isEditMode
                    ? `/doctor/holidays/UpdateHoliday/${holidayId}`
                    : "/doctor/holidays/InsertHoliday",
                payload
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} holiday`);
            }

            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: `Holiday ${isEditMode ? 'updated' : 'created'} successfully!`,
            });
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            if (isEditMode) {
                queryClient.invalidateQueries({ queryKey: ["holiday", holidayId] });
            }
            setLocation("/holidays");
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} holiday`,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: HolidayFormData) => {
        saveHolidayMutation.mutate(data);
    };

    const isLoading = loadingDoctors || loadingHoliday;

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
                    <Link href="/holidays">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Holidays
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isEditMode ? "Edit Holiday" : "Add New Holiday"}
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {isEditMode
                            ? "Update the holiday details"
                            : "Fill in the details to create a new holiday"}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Two-column grid for form fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Doctor Selection */}
                            <div>
                                <Label htmlFor="doctor_id">
                                    Doctor <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    key={`doctor-${watch("doctor_id")}`}
                                    onValueChange={(value) => setValue("doctor_id", value)}
                                    disabled={isLoading}
                                    value={watch("doctor_id")}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctorsData?.map((doctor: Doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id}>
                                                Dr. {doctor.first_name} {doctor.last_name}
                                                {doctor.specialization_name && ` - ${doctor.specialization_name}`}
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

                            {/* Holiday Date */}
                            <div>
                                <Label htmlFor="holiday_date">
                                    Holiday Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    {...register("holiday_date")}
                                    type="date"
                                    className="w-full"
                                />
                                {errors.holiday_date && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.holiday_date.message}
                                    </p>
                                )}
                            </div>

                            {/* Holiday Name */}
                            <div>
                                <Label htmlFor="holiday_name">
                                    Holiday Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    {...register("holiday_name")}
                                    placeholder="e.g., Christmas, Diwali"
                                    className="w-full"
                                />
                                {errors.holiday_name && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.holiday_name.message}
                                    </p>
                                )}
                            </div>

                            {/* Holiday Type */}
                            <div>
                                <Label htmlFor="holiday_type">
                                    Holiday Type <span className="text-red-500">*</span>
                                </Label>
                                <RadioGroup
                                    value={watch("holiday_type")}
                                    onValueChange={(value) => setValue("holiday_type", value)}
                                    className="flex gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="1" id="full_day" />
                                        <Label htmlFor="full_day" className="font-normal cursor-pointer">
                                            Full Day
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="2" id="half_day" />
                                        <Label htmlFor="half_day" className="font-normal cursor-pointer">
                                            Half Day
                                        </Label>
                                    </div>
                                </RadioGroup>
                                {errors.holiday_type && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.holiday_type.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Reason - Full width */}
                        <div>
                            <Label htmlFor="reason">
                                Reason <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                {...register("reason")}
                                placeholder="Enter reason for holiday..."
                                className="w-full"
                                rows={3}
                            />
                            {errors.reason && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.reason.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={saveHolidayMutation.isPending}
                                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                            >
                                {saveHolidayMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditMode ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    isEditMode ? "Update Holiday" : "Create Holiday"
                                )}
                            </Button>
                            <Link href="/holidays">
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

export default AddHoliday;
