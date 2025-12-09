import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calculator,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const BillingsList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch billings
  const { data: billings = [], isLoading, isError } = useTableQuery({
    queryKey: ["billings"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/billing/api/billing/billings/getAll"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch billings");
      }
      const data = await response.json();
      return data.data || data || [];
    },
    errorMessage: "Failed to load billings data",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
      </div>
    );
  }

  if (isError || !billings.length) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Billings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your billing records and transactions
              </p>
            </div>
            <Link href="/billing/add">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all hover:shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Billing
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search billings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-600">
                    Patient
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Doctor
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Payment Method
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Calculator className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No billings found</p>
                      <p className="text-sm">
                        Create your first billing record
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
  console.log(billings);
  const filteredBillings = billings.filter((billing: any) =>
    billing.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    billing.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredBillings);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Billings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your billing records and transactions
            </p>
          </div>
          <Link href="/billing/add">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all hover:shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Add Billing
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search billings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="font-semibold text-gray-600">
                  Patient
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Doctor
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Payment Method
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Calculator className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No billings found</p>
                      <p className="text-sm">
                        Try adjusting your search or create a new billing
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                billings.map((billing: any) => (
                  <TableRow
                    key={billing.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {billing.patient_name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {billing.doctor_name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(billing.DATE).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{billing.sub_total || 0}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        billing.payment_method === 'Cash' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {billing.paid_amount || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/billing/edit/${billing.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-teal-50 hover:text-teal-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BillingsList;