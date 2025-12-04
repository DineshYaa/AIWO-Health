import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
const BaseURL = "http://192.168.0.197:7001"

const fetchDoctors = async (page: number, pageSize: number): Promise<DoctorsResponse> => {
  const response = await fetch(
    `${BaseURL}/doctor/doctors/GetAllDoctors?pageNo=${page}&pagesize=${pageSize}&pagination_required=true`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }
  return response.json();
};

const DoctorList: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  const { 
    data: doctorsResponse, 
    isLoading, 
    isError, 
    error 
  } = useQuery<DoctorsResponse, Error>({
    queryKey: ['doctors', page, pageSize, searchTerm],
    queryFn: () => fetchDoctors(page, pageSize),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (doctorsResponse && page < doctorsResponse?.totalPages) {
      setPage(p => p + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error: {error?.message}</div>
      </div>
    );
  }

  if (!doctorsResponse?.data?.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">No doctors found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <div className='flex gap-2'>
            <div className="w-64">
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <a href="/doctors/add">
            <Button>
                Add Doctor
            </Button>
        </a>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctorsResponse.data.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell className="font-medium">
                  {`${doctor.first_name} ${doctor.last_name}`}
                </TableCell>
                <TableCell>{doctor.email}</TableCell>
                <TableCell>{doctor.contact}</TableCell>
                <TableCell>{doctor.specialization_name}</TableCell>
                <TableCell>{doctor.designation_name}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      doctor.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {doctor.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(doctor.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium">
            {(page - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(
              page * pageSize,
              doctorsResponse?.totalRecords || 0
            )}
          </span>{' '}
          of{' '}
          <span className="font-medium">
            {doctorsResponse?.totalRecords || 0}
          </span>{' '}
          doctors
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {doctorsResponse?.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!doctorsResponse || page >= doctorsResponse.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorList;