import React, { useState } from "react";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTableQuery } from "@/hooks/useTableQuery";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { convertTo12Hour } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Schedule {
  id: string;
  doctor_id: string;
  week_day_id: string;
  start_time: string;
  end_time: string;
  interval: string;
  Doctor?: {
    first_name: string;
    last_name: string;
  };
}

interface SchedulesResponse {
  data: Schedule[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pagesize: number;
}

const fetchSchedules = async ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<SchedulesResponse> => {
  const [_, page, pageSize] = queryKey;

  const response = await apiRequest(
    "GET",
    `/doctor/schedules/list?pageNo=${page}&pagesize=${pageSize}&pagination_required=true`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
};

const weekDays: Record<string, string> = {
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
  "7": "Sunday",
};

const ScheduleList: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { token } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: schedulesResponse,
    isLoading,
    isError,
  } = useTableQuery<SchedulesResponse>({
    queryKey: ["schedules", page, pageSize],
    queryFn: ({ queryKey }) => fetchSchedules({ queryKey }),
    enabled: !!token,
    errorMessage: "Failed to load schedules data",
  });

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (schedulesResponse && page < (schedulesResponse?.totalPages || 1)) {
      setPage((p) => p + 1);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await apiRequest(
        "DELETE",
        `/doctor/schedules/delete/${deleteId}`
      );

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      await queryClient.invalidateQueries({ queryKey: ["schedules"] });

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
      </div>
    );
  }

  if (isError || !schedulesResponse?.data) {
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
              Schedules Directory
            </h2>
            <p className="text-gray-600 text-sm">
              Manage and view all doctor schedules
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Controls Header */}
            <div className="flex justify-between items-center mb-8">
              <Link href="/schedules/add">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Schedule
                </Button>
              </Link>
            </div>

            {/* Table with No Data Message */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                    <TableHead className="font-semibold text-gray-700">Day</TableHead>
                    <TableHead className="font-semibold text-gray-700">Start Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">End Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">Interval</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-gray-500">
                        <div className="text-lg font-medium mb-2">No data found</div>
                        <div className="text-sm text-gray-400">Unable to load schedules information</div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const schedules = schedulesResponse?.data || [];
  const totalPages = schedulesResponse?.totalPages || 1;
  const totalRecords = schedulesResponse?.totalRecords || 0;

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
            Doctor Schedules
          </h2>
          <p className="text-gray-600 text-sm">
            Manage doctor availability and time slots
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row justify-end items-center mb-8 gap-4">
            <Link href="/schedules/add">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add New Schedule
              </Button>
            </Link>
          </div>

          {!schedulesResponse?.data?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No schedules found
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">
                        Doctor
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Day
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Start Time
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        End Time
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Interval (mins)
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedulesResponse.data.map((schedule: any) => (
                      <TableRow
                        key={schedule.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">
                          {schedule?.Doctor?.first_name +
                            " " +
                            schedule?.Doctor?.last_name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {weekDays[schedule.week_day_id] ||
                            schedule.week_day_id}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {convertTo12Hour(schedule.start_time)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {convertTo12Hour(schedule.end_time)}
                        </TableCell>
                        <TableCell className="text-gray-600 ">
                          {schedule.interval}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/schedules/edit/${schedule.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-teal-50 hover:text-teal-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDeleteClick(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                      schedulesResponse?.totalRecords || 0
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900">
                    {schedulesResponse?.totalRecords || 0}
                  </span>{" "}
                  schedules
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
                    Page {page} of {schedulesResponse?.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={
                      !schedulesResponse || page >= schedulesResponse.totalPages
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleList;
