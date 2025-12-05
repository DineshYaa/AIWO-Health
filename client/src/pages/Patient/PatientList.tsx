import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus,
  Search,
  Eye,
  Edit,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  gender_type: number;
  patient_serial_no: string;
  created_at: string;
}

interface PatientsResponse {
  data: Patient[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pagesize: number;
}

const fetchPatients = async ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<PatientsResponse> => {
  const [_, page, pageSize] = queryKey;

  const response = await apiRequest(
    "GET",
    `/doctor/patients/GetAllPatients?pageNo=${page}&pagesize=${pageSize}&pagination_required=true`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
};

const PatientList: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { token } = useAuth();

  const {
    data: patientsResponse,
    isLoading,
    isError,
    error,
  } = useQuery<PatientsResponse, Error>({
    queryKey: ["patients", page, pageSize, searchTerm],
    queryFn: ({ queryKey }) => fetchPatients({ queryKey }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  } as const);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (patientsResponse && page < patientsResponse?.totalPages) {
      setPage((p) => p + 1);
    }
  };

  const genderMap: { [key: number]: string } = {
    1: "Male",
    2: "Female",
    3: "Other",
  };

  // const statusMap: { [key: string]: string } = {
  //   "1": "Active",
  //   "0": "Inactive",
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error?.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const patients = patientsResponse?.data || [];
  const totalPages = patientsResponse?.totalPages || 1;

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
            Patient Management
          </h2>
          <p className="text-gray-600 text-sm">
            Manage and view all registered patients
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 border-gray-300 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <Link href="/patients/add">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Patient
              </Button>
            </Link>
          </div>

          {!patientsResponse?.data?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No patients found
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">
                        Serial No
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Patient Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Contact
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Gender
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Joined Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">
                          {patient.patient_serial_no}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {patient.email}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {patient.contact}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {genderMap[patient.gender_type] ||
                            patient.gender_type}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(patient.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/patients/view/${patient.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-teal-50 hover:text-teal-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/patients/edit/${patient.id}`}>
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
                    ))}
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
                      patientsResponse?.totalRecords || 0
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900">
                    {patientsResponse?.totalRecords || 0}
                  </span>{" "}
                  patients
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
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
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

export default PatientList;
