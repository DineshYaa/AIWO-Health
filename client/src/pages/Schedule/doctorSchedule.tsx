import React, { useState } from "react";
import { Calendar, Clock, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function DoctorSchedulePage() {
  const [formData, setFormData] = useState({
    doctor_id: "",
    week_day_id: "",
    start_time: "",
    end_time: "",
    interval: "30",
  });

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

  const handleSubmit = () => {
    const scheduleData = {
      doctor_id: formData.doctor_id,
      week_day_id: formData.week_day_id,
      start_time: formData.start_time,
      end_time: formData.end_time,
      interval: formData.interval,
    };
    console.log("Schedule submitted:", scheduleData);
    // API call would go here
  };

  const handleChange = (field: any, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
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
            Doctor Schedule
          </h2>
          <p className="text-gray-600">
            Configure your appointment availability
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-5">
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
                value={formData.doctor_id}
                onChange={(e) => handleChange("doctor_id", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 0b2feb8f-230f-4e57-9b1f-cdd692fd86e8"
              />
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
                value={formData.week_day_id}
                onChange={(e) => handleChange("week_day_id", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select a day</option>
                {weekDays.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
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
                  value={formData.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
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
                  value={formData.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
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
                    onClick={() => handleChange("interval", interval.value)}
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
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Save Schedule
            </button>

            {/* Additional Info */}
            <div className="text-center text-sm text-gray-600 bg-teal-50 p-4 rounded-lg">
              <p className="font-medium text-teal-700 mb-1">Quick Tip</p>
              <p>
                Your schedule will be available for patients to book
                appointments during the configured time slots.
              </p>
            </div>
          </div>

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
