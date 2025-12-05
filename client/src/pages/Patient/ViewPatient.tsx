import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  dob: string;
  gender_type: number;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  spouseName?: string;
  alternative_contact?: string;
  status: number;
  patient_serial_no?: string;
  created_at?: string;
  updated_at?: string;
}

const ViewPatient = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const { token } = useAuth();
  const [match, params] = useRoute("/patients/view/:id");

  const patientId = params?.id;

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        setIsLoading(true);
        const response = await apiRequest(
          "GET",
          `/doctor/patients/GetPatientById/${patientId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const responseData = await response.json();
        setPatientData(responseData.data);
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Patient not found</p>
          <Link href="/patients">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const genderMap: { [key: number]: string } = {
    1: "Male",
    2: "Female",
    3: "Other",
  };

  const statusMap: { [key: string]: string } = {
    "1": "Active",
    "0": "Inactive",
  };

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

        <div className="flex items-center gap-3 justify-between mb-10 relative">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Patient Details
            </h2>
            <p className="text-gray-600 text-sm">
              View comprehensive information about the patient
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/patients">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            </Link>
            <Link href={`/patients/edit/${patientId}`}>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                <Edit className="mr-2 h-4 w-4" />
                Edit Patient
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Patient Name and Status Banner */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {patientData.firstName} {patientData.lastName}
                  </h3>
                  <p className="text-gray-600">
                    Patient ID: {patientData.patient_serial_no || "N/A"}
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  patientData.status === 1
                    ? "bg-teal-100 text-teal-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {statusMap[String(patientData.status)] || "Unknown"}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-500 text-sm">First Name</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.firstName}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Last Name</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.lastName}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date of Birth
                </Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.dob}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.email}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Contact
                </Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.contact}
                </p>
              </div>
              {patientData.alternative_contact && (
                <div>
                  <Label className="text-gray-500 text-sm">
                    Alternative Contact
                  </Label>
                  <p className="text-gray-900 font-medium mt-1">
                    {patientData.alternative_contact}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-gray-500 text-sm">Gender</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {genderMap[patientData.gender_type] || "Not specified"}
                </p>
              </div>
              {patientData.spouseName && (
                <div>
                  <Label className="text-gray-500 text-sm">Spouse Name</Label>
                  <p className="text-gray-900 font-medium mt-1">
                    {patientData.spouseName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-500 text-sm">Address Line 1</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.address1}
                </p>
              </div>
              {patientData.address2 && (
                <div>
                  <Label className="text-gray-500 text-sm">
                    Address Line 2
                  </Label>
                  <p className="text-gray-900 font-medium mt-1">
                    {patientData.address2}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-gray-500 text-sm">City</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.city}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">State</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.state}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Country</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.country}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Country Code</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {patientData.country_code}
                </p>
              </div>
            </div>
          </div>

          {/* Joined Date */}
          {patientData.created_at && (
            <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-100">
              Registered on{" "}
              {new Date(patientData.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;
