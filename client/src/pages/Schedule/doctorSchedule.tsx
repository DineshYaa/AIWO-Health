import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, ArrowLeft, Loader2, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const scheduleSchema = z.object({
  doctor_id: z.string().min(1, "Doctor ID is required"),
  week_day_id: z.string().min(1, "Week day is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  interval: z.string().min(1, "Interval is required"),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export default function DoctorSchedulePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/schedules/:action/:id?");
  const queryClient = useQueryClient();

  const isEditMode = match && params?.action === "edit" && params?.id;
  const scheduleId = params?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      doctor_id: "",
      week_day_id: "",
      start_time: "",
      end_time: "",
      interval: "30",
    },
  });

  const formData = watch();

  const weekDays = [
    { id: "1", name: "Monday" },
    { id: "2", name: "Tuesday" },
    { id: "3", name: "Wednesday" },
    { id: "4", name: "Thursday" },
    { id: "5", name: "Friday" },
    { id: "6", name: "Saturday" },
    { id: "7", name: "Sunday" },
  ];

  const intervals = [
    { value: "15", Label: "15 minutes" },
    { value: "30", Label: "30 minutes" },
    { value: "45", Label: "45 minutes" },
    { value: "60", Label: "1 hour" },
  ];

  // Fetch schedule data when in edit mode
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!isEditMode || !scheduleId) return;

      try {
        setIsFetching(true);
        const response = await apiRequest(
          "GET",
          `/doctor/schedules/${scheduleId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedule data");
        }

        const responseData = await response.json();
        const scheduleData = responseData.data;

        // Populate form with fetched data
        if (scheduleData) {
          setValue("doctor_id", scheduleData.doctor_id);
          setValue("week_day_id", String(scheduleData.week_day_id));
          setValue("start_time", scheduleData.start_time);
          setValue("end_time", scheduleData.end_time);
          setValue("interval", String(scheduleData.interval));
        }

        toast({
          title: "Schedule loaded",
          description: "You can now edit the schedule",
        });
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast({
          title: "Error",
          description: "Failed to load schedule data",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchScheduleData();
  }, [isEditMode, scheduleId, setValue]);

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      setIsLoading(true);

      const url = isEditMode
        ? `/doctor/schedules/update/${scheduleId}`
        : `/doctor/schedules/create`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await apiRequest(method, url, data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save schedule");
      }

      await queryClient.invalidateQueries({ queryKey: ["schedules"] });

      toast({
        title: "Success",
        description: isEditMode
          ? "Schedule updated successfully"
          : "Schedule added successfully",
      });

      // Redirect to schedule list after success
      setTimeout(() => setLocation("/schedules"), 1000);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 relative">
          <Link href="/schedules">
            <Button
              variant="ghost"
              className="absolute left-0 top-0 text-gray-500 hover:text-teal-600 -ml-16"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? "Edit Schedule" : "Doctor Schedule"}
          </h2>
          <p className="text-gray-600">
            {isEditMode
              ? "Update appointment availability"
              : "Configure your appointment availability"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Doctor ID Input */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Doctor ID
                </div>
              </Label>
              <Input
                type="text"
                {...register("doctor_id")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 0b2feb8f-230f-4e57-9b1f-cdd692fd86e8"
              />
              {errors.doctor_id && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.doctor_id.message}
                </p>
              )}
            </div>

            {/* Week Day Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Week Day
                </div>
              </Label>
              <select
                {...register("week_day_id")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select a day</option>
                {weekDays.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
              {errors.week_day_id && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.week_day_id.message}
                </p>
              )}
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Start Time
                  </div>
                </Label>
                <Input
                  type="time"
                  {...register("start_time")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
                {errors.start_time && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.start_time.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    End Time
                  </div>
                </Label>
                <Input
                  type="time"
                  {...register("end_time")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
                {errors.end_time && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.end_time.message}
                  </p>
                )}
              </div>
            </div>

            {/* Interval Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Interval
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {intervals.map((interval) => (
                  <button
                    key={interval.value}
                    type="button"
                    onClick={() => setValue("interval", interval.value)}
                    className={`py-3 px-4 rounded-lg border-2 transition font-medium ${
                      formData.interval === interval.value
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-teal-300"
                    }`}
                  >
                    {interval.Label}
                  </button>
                ))}
              </div>
              {errors.interval && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.interval.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Schedule
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="text-center text-sm text-gray-600 bg-teal-50 p-4 rounded-lg">
              <p className="font-medium text-teal-700 mb-1">Quick Tip</p>
              <p>
                Your schedule will be available for patients to book
                appointments during the configured time slots.
              </p>
            </div>
          </form>

          {/* Preview Section */}
          {formData.week_day_id && formData.start_time && formData.end_time && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Schedule Preview
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Day:</span>
                  <span className="font-medium text-gray-900">
                    {weekDays.find((d) => d.id === formData.week_day_id)
                      ?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium text-gray-900">
                    {formData.start_time} - {formData.end_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interval:</span>
                  <span className="font-medium text-gray-900">
                    {intervals.find((i) => i.value === formData.interval)
                      ?.Label || "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
