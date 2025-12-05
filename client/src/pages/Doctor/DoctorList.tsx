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

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  specialization_name: string;
  designation_name: string;
  status: number;
  created_at: string;
}

interface DoctorsResponse {
  data: Doctor[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pagesize: number;
}
const BaseURL = "http://192.168.0.197:7001";

const fetchDoctors = async ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<DoctorsResponse> => {
  const [_, page, pageSize] = queryKey;
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${BaseURL}/api/doctors?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
};

const DoctorList: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { token } = useAuth();

  const {
    data: doctorsResponse,
    isLoading,
    isError,
    error,
  } = useQuery<DoctorsResponse, Error>({
    queryKey: ["doctors", page, pageSize, searchTerm],
    queryFn: ({ queryKey }) => fetchDoctors({ queryKey }),
    enabled: !!token,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  } as const);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (doctorsResponse && page < doctorsResponse?.totalPages) {
      setPage((p) => p + 1);
    }
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
            Doctors Directory
          </h2>
          <p className="text-gray-600 text-sm">
            Manage and view all registered doctors
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 border-gray-300 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <Link href="/doctors/add">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Doctor
              </Button>
            </Link>
          </div>

          {!doctorsResponse?.data?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No doctors found
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Contact
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Specialization
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Designation
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Joined Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorsResponse.data.map((doctor: any) => (
                      <TableRow
                        key={doctor.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">
                          {`${doctor.first_name} ${doctor.last_name}`}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {doctor.email}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {doctor.contact}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {doctor.specialization_name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {doctor.designation_name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              doctor.status === 1
                                ? "bg-teal-100 text-teal-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {doctor.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(doctor.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/doctors/view/${doctor.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-teal-50 hover:text-teal-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/doctors/edit/${doctor.id}`}>
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
                      doctorsResponse?.totalRecords || 0
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900">
                    {doctorsResponse?.totalRecords || 0}
                  </span>{" "}
                  doctors
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
                    Page {page} of {doctorsResponse?.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={
                      !doctorsResponse || page >= doctorsResponse.totalPages
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

export default DoctorList;
