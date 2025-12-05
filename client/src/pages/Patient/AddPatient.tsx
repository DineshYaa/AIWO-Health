import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Link, useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

const patientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  contact: z.string().min(10, "Contact number must be at least 10 digits"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => new Date(date) < new Date(), {
      message: "Date of birth must be in the past",
    }),
  gender_type: z.number().min(1, "Gender is required"),
  address1: z.string().min(5, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  country_code: z.string().min(2, "Country code is required"),
  spouseName: z.string().optional(),
  alternative_contact: z.string().optional(),
  status: z.number().min(0, "Status is required"),
  // Hidden fields
  role_id: z.string().min(1, "Role is required").default("2"),
  profile_url: z.string().url("Invalid URL").or(z.literal("")).default(""),
  patient_serial_no: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const AddPatient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/patients/:action/:id?");
  const queryClient = useQueryClient();

  const isEditMode = match && params?.action === "edit" && params?.id;
  const patientId = params?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      dob: "",
      gender_type: 0,
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "",
      country_code: "",
      spouseName: "",
      alternative_contact: "",
      status: 1,
    },
  });

  // Fetch patient data when in edit mode
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!isEditMode || !patientId) return;

      try {
        setIsFetching(true);
        const response = await apiRequest(
          "GET",
          `/doctor/patients/GetPatientById/${patientId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const responseData = await response.json();
        const patientData = responseData.data;

        // Populate form with fetched data
        Object.keys(patientData).forEach((key) => {
          if (key in patientData) {
            const value = patientData[key];
            if (key === "gender_type" || key === "status") {
              setValue(key as keyof PatientFormData, Number(value));
            } else {
              setValue(key as keyof PatientFormData, String(value || ""));
            }
          }
        });

        toast({
          title: "Patient data loaded",
          description: "You can now edit the patient information",
        });
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPatientData();
  }, [isEditMode, patientId, token, setValue]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsLoading(true);

      const url = isEditMode
        ? `/doctor/patients/UpdatePatient/${patientId}`
        : `/doctor/patients/InsertPatient`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await apiRequest(method, url, data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save patient");
      }

      const result = await response.json();

      await queryClient.invalidateQueries({ queryKey: ["patients"] });

      toast({
        title: "Success",
        description: isEditMode
          ? "Patient updated successfully"
          : "Patient added successfully",
      });

      // Redirect to patient list after success
      setTimeout(() => setLocation("/patients"), 1000);
    } catch (error) {
      console.error("Error saving patient:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save patient",
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
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-12">
      <div className="max-w-5xl w-full mx-auto">
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

        <div className="flex items-center gap-3 justify-between mb-10">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditMode ? "Edit Patient" : "Add New Patient"}
            </h2>
            <p className="text-gray-600 text-sm">
              {isEditMode
                ? "Update patient information"
                : "Fill in the patient details below"}
            </p>
          </div>
          <Link href="/patients">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-gray-700">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    {...register("dob")}
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.dob && (
                    <p className="text-sm text-red-500">{errors.dob.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email address"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-gray-700">
                    Contact Number *
                  </Label>
                  <Input
                    id="contact"
                    {...register("contact")}
                    placeholder="Enter contact number"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.contact && (
                    <p className="text-sm text-red-500">
                      {errors.contact.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="alternative_contact"
                    className="text-gray-700"
                  >
                    Alternative Contact
                  </Label>
                  <Input
                    id="alternative_contact"
                    {...register("alternative_contact")}
                    placeholder="Enter alternative contact"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender_type" className="text-gray-700">
                    Gender *
                  </Label>
                  <Select
                    value={String(watch("gender_type") || "")}
                    onValueChange={(value) =>
                      setValue("gender_type", Number(value))
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:ring-teal-500 focus:border-transparent">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Female</SelectItem>
                      <SelectItem value="3">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender_type && (
                    <p className="text-sm text-red-500">
                      {errors.gender_type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouseName" className="text-gray-700">
                    Spouse Name
                  </Label>
                  <Input
                    id="spouseName"
                    {...register("spouseName")}
                    placeholder="Enter spouse name"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address1" className="text-gray-700">
                    Address Line 1 *
                  </Label>
                  <Input
                    id="address1"
                    {...register("address1")}
                    placeholder="Enter address"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.address1 && (
                    <p className="text-sm text-red-500">
                      {errors.address1.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2" className="text-gray-700">
                    Address Line 2
                  </Label>
                  <Input
                    id="address2"
                    {...register("address2")}
                    placeholder="Enter address line 2"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700">
                    City *
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Enter city"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-700">
                    State *
                  </Label>
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="Enter state"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-700">
                    Country *
                  </Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Enter country"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country_code" className="text-gray-700">
                    Country Code *
                  </Label>
                  <Input
                    id="country_code"
                    {...register("country_code")}
                    placeholder="Enter country code"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.country_code && (
                    <p className="text-sm text-red-500">
                      {errors.country_code.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700">
                    Status *
                  </Label>
                  <Select
                    value={String(watch("status") || "1")}
                    onValueChange={(value) => setValue("status", Number(value))}
                  >
                    <SelectTrigger className="border-gray-300 focus:ring-teal-500 focus:border-transparent">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <Link href="/patients">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-teal-500 hover:bg-teal-600 text-white min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isEditMode ? "Update Patient" : "Add Patient"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;
