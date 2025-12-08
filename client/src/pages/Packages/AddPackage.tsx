import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link, useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

const packageSchema = z.object({
  name: z.string().min(2, "Name is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
});

type PackageFormData = z.infer<typeof packageSchema>;

const AddPackage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/packages/:action/:id?");
  const queryClient = useQueryClient();

  const isEditMode = match && params?.action === "edit" && params?.id;
  const packageId = params?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      type: "",
    },
  });

  // Fetch package data when in edit mode
  useEffect(() => {
    const fetchPackageData = async () => {
      if (!isEditMode || !packageId) return;

      try {
        setIsFetching(true);
        const response = await apiRequest(
          "GET",
          `/billing/api/billing/packages/${packageId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch package data");
        }

        const responseData = await response.json();
        const packageData = responseData.data || responseData;

        // Populate form
        setValue("name", packageData.name);
        setValue("price", packageData.price);
        setValue("description", packageData.description);
        setValue("type", String(packageData.type));

        toast({
          title: "Data loaded",
          description: "You can now edit the package information",
        });
      } catch (error) {
        console.error("Error fetching package:", error);
        toast({
          title: "Error",
          description: "Failed to load package data",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPackageData();
  }, [isEditMode, packageId, setValue]);

  const onSubmit = async (data: PackageFormData) => {
    try {
      setIsLoading(true);

      const url = isEditMode
        ? `/billing/api/billing/packages/update/${packageId}`
        : `/billing/api/billing/packages/create`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await apiRequest(method, url, data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save package");
      }

      await queryClient.invalidateQueries({ queryKey: ["packages"] });

      toast({
        title: "Success",
        description: isEditMode
          ? "Package updated successfully"
          : "Package added successfully",
      });

      setTimeout(() => setLocation("/packages"), 1000);
    } catch (error) {
      console.error("Error saving package:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save package",
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
          <p className="text-gray-600">Loading package data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-12">
      <div className="max-w-3xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 justify-between mb-10">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditMode ? "Edit Package" : "Add New Package"}
            </h2>
            <p className="text-gray-600 text-sm">
              {isEditMode
                ? "Update package information"
                : "Enter the details to create a new package"}
            </p>
          </div>
          <Link href="/packages">
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Package Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter package name"
                  className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-700">
                    Type *
                  </Label>
                  <Select
                    value={watch("type")}
                    onValueChange={(value) => setValue("type", value)}
                  >
                    <SelectTrigger className="border-gray-300 focus:ring-teal-500 focus:border-transparent">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Appointment</SelectItem>
                      <SelectItem value="2">Scan</SelectItem>
                      <SelectItem value="3">Blood Test</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700">
                    Price (₹) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price")}
                    placeholder="Enter price"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter package description"
                  className="min-h-[100px] border-gray-300 focus:ring-teal-500 focus:border-transparent"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <Link href="/packages">
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
                className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    {isEditMode ? "Update Package" : "Add Package"}
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

export default AddPackage;
