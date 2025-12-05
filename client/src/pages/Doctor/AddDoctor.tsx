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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Link, useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const doctorSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  contact: z.string().min(10, "Contact number must be at least 10 digits"),
  address1: z.string().min(5, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country_code: z.string().min(2, "Country code is required"),
  qualification: z.string().min(2, "Qualification is required"),
  license_no: z.string().min(2, "License number is required"),
  experience: z.string().min(1, "Experience is required"),
  about_me: z.string().min(10, "Please provide more information"),
  inperson_consultation: z
    .string()
    .min(1, "In-person consultation fee is required"),
  tele_consultation: z.string().min(1, "Tele-consultation fee is required"),
  doctor_commission: z.string().min(1, "Commission is required"),
  gender_type: z.string().min(1, "Gender is required"),
  status: z.string().min(1, "Status is required"),
  doctor_type: z.string().min(1, "Doctor type is required"),
  // Hidden fields
  designation_id: z
    .string()
    .uuid("Invalid designation")
    .default("e6a3877c-19bc-4fd3-a2e4-4ca5ca5b8106"),
  specialization_id: z
    .string()
    .uuid("Invalid specialization")
    .default("55f8cc83-c4c2-4330-8ef5-695aa6bf2781"),
  user_id: z
    .string()
    .uuid("Invalid user ID")
    .default("3b544aa0-755a-47b3-8457-c4d4d952675b"),
  role_id: z.string().min(1, "Role is required").default("1"),
  profile_url: z.string().url("Invalid URL").or(z.literal("")).default(""),
  doctor_serial_no: z.string().min(1, "Serial number is required").default("1"),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const BaseURL = "http://192.168.0.197:7001";

const AddDoctor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/doctors/:action/:id?");

  const isEditMode = match && params?.action === "edit" && params?.id;
  const doctorId = params?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      contact: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country_code: "",
      qualification: "",
      license_no: "",
      gender_type: "",
      experience: "",
      about_me: "",
      inperson_consultation: "",
      tele_consultation: "",
      status: "",
      doctor_type: "",
      doctor_commission: "",
    },
  });

  // Fetch doctor data when in edit mode
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!isEditMode || !doctorId) return;

      try {
        setIsFetching(true);
        const response = await fetch(
          `${BaseURL}/doctor/doctors/GetDoctorById/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch doctor data");
        }

        const doctorData = await response.json();

        // Populate form with fetched data
        Object.keys(doctorData).forEach((key) => {
          if (key in doctorData) {
            setValue(
              key as keyof DoctorFormData,
              String(doctorData[key] || "")
            );
          }
        });

        toast({
          title: "Doctor data loaded",
          description: "You can now edit the doctor information",
        });
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast({
          title: "Error",
          description: "Failed to load doctor data",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchDoctorData();
  }, [isEditMode, doctorId, token, setValue]);

  const onSubmit = async (data: DoctorFormData) => {
    try {
      setIsLoading(true);

      const url = isEditMode
        ? `${BaseURL}/doctor/doctors/UpdateDoctor/${doctorId}`
        : `${BaseURL}/doctor/doctors/InsertDoctor`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save doctor");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: isEditMode
          ? "Doctor updated successfully"
          : "Doctor added successfully",
      });

      // Redirect to doctor list after success
      setTimeout(() => setLocation("/doctors"), 1000);
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save doctor",
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
          <p className="text-gray-600">Loading doctor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-12">
      <div className="max-w-5xl w-full mx-auto">
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
        <div className="flex items-center gap-3 justify-between mb-4 text-center mb-10 relative">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditMode ? "Edit Doctor" : "Add New Doctor"}
            </h2>
            <p className="text-gray-600 text-sm">
              {isEditMode
                ? "Update the doctor's information below"
                : "Enter the details to register a new doctor"}
            </p>
          </div>
          <Link href="/doctors">
            <Button
              variant="ghost"
              className="absolute left-0 top-0 text-gray-500 hover:text-teal-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    placeholder="Enter first name"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    placeholder="Enter last name"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
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
                    Contact Number
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
                  <Label htmlFor="gender_type" className="text-gray-700">
                    Gender
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("gender_type", value)}
                    defaultValue="1"
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
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="qualification" className="text-gray-700">
                    Qualification
                  </Label>
                  <Input
                    id="qualification"
                    {...register("qualification")}
                    placeholder="Enter qualifications"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.qualification && (
                    <p className="text-sm text-red-500">
                      {errors.qualification.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_no" className="text-gray-700">
                    License Number
                  </Label>
                  <Input
                    id="license_no"
                    {...register("license_no")}
                    placeholder="Enter license number"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.license_no && (
                    <p className="text-sm text-red-500">
                      {errors.license_no.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-700">
                    Experience (Years)
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    {...register("experience")}
                    placeholder="Enter years of experience"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500">
                      {errors.experience.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor_type" className="text-gray-700">
                    Doctor Type
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("doctor_type", value)}
                    defaultValue="1"
                  >
                    <SelectTrigger className="border-gray-300 focus:ring-teal-500 focus:border-transparent">
                      <SelectValue placeholder="Select doctor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">General Practitioner</SelectItem>
                      <SelectItem value="2">Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.doctor_type && (
                    <p className="text-sm text-red-500">
                      {errors.doctor_type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700">
                    Status
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("status", value)}
                    defaultValue="1"
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

            {/* Financials */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="inperson_consultation"
                    className="text-gray-700"
                  >
                    In-person Fee
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="inperson_consultation"
                      type="number"
                      {...register("inperson_consultation")}
                      placeholder="0.00"
                      className="pl-7 border-gray-300 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  {errors.inperson_consultation && (
                    <p className="text-sm text-red-500">
                      {errors.inperson_consultation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tele_consultation" className="text-gray-700">
                    Tele-consultation Fee
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="tele_consultation"
                      type="number"
                      {...register("tele_consultation")}
                      placeholder="0.00"
                      className="pl-7 border-gray-300 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  {errors.tele_consultation && (
                    <p className="text-sm text-red-500">
                      {errors.tele_consultation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor_commission" className="text-gray-700">
                    Commission (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="doctor_commission"
                      type="number"
                      {...register("doctor_commission")}
                      placeholder="0"
                      className="pr-8 border-gray-300 focus:ring-teal-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  {errors.doctor_commission && (
                    <p className="text-sm text-red-500">
                      {errors.doctor_commission.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address1" className="text-gray-700">
                    Address Line 1
                  </Label>
                  <Input
                    id="address1"
                    {...register("address1")}
                    placeholder="Street address"
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
                    placeholder="Apartment, suite, etc."
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700">
                    City
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
                    State
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
                  <Label htmlFor="country_code" className="text-gray-700">
                    Country Code
                  </Label>
                  <Input
                    id="country_code"
                    {...register("country_code")}
                    placeholder="e.g. US, IN"
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

            {/* About Me */}
            <div className="space-y-2">
              <Label htmlFor="about_me" className="text-gray-700">
                About Me
              </Label>
              <Textarea
                id="about_me"
                {...register("about_me")}
                placeholder="Tell us about yourself..."
                className="min-h-[100px] border-gray-300 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.about_me && (
                <p className="text-sm text-red-500">
                  {errors.about_me.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isLoading}
                className="hover:bg-gray-50 border-gray-300 text-gray-700"
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating Doctor..." : "Adding Doctor..."}
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isEditMode ? "Update Doctor" : "Add Doctor"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
