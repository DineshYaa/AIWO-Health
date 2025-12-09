import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, ArrowLeft, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface SubPackage {
  sub_package_id: string;
  quantity: number;
  price: number;
  package_discount: number;
  discount_price: number;
  org_sub_total: number;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  patient_serial_no: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  discount: number;
  discount_value: number;
}

const billingSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  doctor_id: z.string().min(1, "Doctor is required"),
  discount: z.coerce.number().min(0, "Discount must be a positive number").default(0),
  paid_amount: z.coerce.number().min(0, "Paid amount must be a positive number"),
  payment_method: z.enum(["Cash", "Online"], { required_error: "Payment method is required" }),
  remarks: z.string().optional(),
  DATE: z.string().min(1, "Date is required"),
  sub_packages: z.array(z.object({
    sub_package_id: z.string().min(1, "Package is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    package_discount: z.coerce.number().min(0, "Package discount must be a positive number").default(0),
    discount_price: z.coerce.number().min(0, "Discount price must be a positive number").default(0),
    org_sub_total: z.coerce.number().min(0, "Original subtotal must be a positive number").default(0),
  })).min(1, "At least one package is required"),
});

type BillingFormData = z.infer<typeof billingSchema>;

const AddBillingForm = () => {
      const [, setLocation] = useLocation();
    
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [subPackages, setSubPackages] = useState<SubPackage[]>([
    { sub_package_id: "", quantity: 1, price: 0, package_discount: 0, discount_price: 0, org_sub_total: 0 }
  ]);
  const [subTotal, setSubTotal] = useState(0);
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      discount: 0,
      paid_amount: 0,
      payment_method: "Cash",
      DATE: new Date().toISOString().split('T')[0],
      sub_packages: [{ sub_package_id: "", quantity: 1, price: 0, package_discount: 0, discount_price: 0, org_sub_total: 0 }]
    }
  });

  // Fetch patients, doctors, and packages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, packagesRes] = await Promise.all([
          apiRequest("GET", `/doctor/patients/GetAllPatients?pageNo=1&pagesize=1000&pagination_required=true`),
          apiRequest("GET", `/doctor/doctors/GetAllDoctors?pageNo=1&pagesize=1000&pagination_required=true`),
          apiRequest("GET", `/billing/api/billing/packages/getAll?pageNo=1&pagesize=1000&pagination_required=true`)
        ]);

        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          setPatients(patientsData.data || patientsData || []);
        }

        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          setDoctors(doctorsData.data || doctorsData || []);
        }

        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          setPackages(packagesData.data || packagesData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  // Calculate sub_total whenever sub_packages change
  useEffect(() => {
    const total = subPackages.reduce((sum, pkg) => sum + (pkg.org_sub_total * pkg.quantity), 0);
    setSubTotal(total);
    setValue("sub_packages", subPackages);
  }, [subPackages, setValue]);

  const addSubPackage = () => {
    setSubPackages([...subPackages, { sub_package_id: "", quantity: 1, price: 0, package_discount: 0, discount_price: 0, org_sub_total: 0 }]);
  };

  const removeSubPackage = (index: number) => {
    const newSubPackages = subPackages.filter((_, i) => i !== index);
    setSubPackages(newSubPackages.length > 0 ? newSubPackages : [{ sub_package_id: "", quantity: 1, price: 0, package_discount: 0, discount_price: 0, org_sub_total: 0 }]);
  };

  const updateSubPackage = (index: number, field: keyof SubPackage, value: string | number) => {
    const newSubPackages = [...subPackages];
    newSubPackages[index] = { ...newSubPackages[index], [field]: value };
    
    // If package is selected, update price and discount from packages list
    if (field === 'sub_package_id' && typeof value === 'string') {
      const selectedPackage = packages.find(pkg => pkg.id === value);
      if (selectedPackage) {
        const discountPrice = (selectedPackage.price * selectedPackage.discount) / 100;
        const orgSubTotal = selectedPackage.price - discountPrice;
        
        newSubPackages[index] = {
          ...newSubPackages[index],
          price: selectedPackage.price,
          package_discount: selectedPackage.discount,
          discount_price: discountPrice,
          org_sub_total: orgSubTotal
        };
      }
    }
    
    // If quantity changes, recalculate totals
    if (field === 'quantity' && typeof value === 'number') {
      const currentPackage = newSubPackages[index];
      const totalDiscountPrice = currentPackage.discount_price * value;
      const totalOrgSubTotal = currentPackage.org_sub_total * value;
      
      newSubPackages[index] = {
        ...currentPackage,
        quantity: value
      };
    }
    
    setSubPackages(newSubPackages);
  };

  const onSubmit = async (data: BillingFormData) => {
    try {
      setIsLoading(true);

      const billingData = {
        ...data,
        sub_total: subTotal,
        sub_packages: subPackages.filter(pkg => pkg.sub_package_id && pkg.quantity > 0)
      };

      const response = await apiRequest("POST", "/billing/api/billing/billings/create", billingData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create billing");
      }

      await queryClient.invalidateQueries({ queryKey: ["billings"] });

      toast({
        title: "Success",
        description: "Billing created successfully",
      });

      setTimeout(() => setLocation("/billings"), 1000);
    } catch (error) {
      console.error("Error creating billing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create billing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center gap-3 justify-between mb-4 text-center mb-10 relative">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create New Billing
            </h2>
            <p className="text-gray-600 text-sm">
              Enter the details to create a new billing record
            </p>
          </div>
          <Link href="/billings">
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
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patient_id" className="text-gray-700">
                    Patient *
                  </Label>
                  <select
                    {...register("patient_id")}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.patient_serial_no} - {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.patient_id && (
                    <p className="text-sm text-red-500">
                      {errors.patient_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor_id" className="text-gray-700">
                    Doctor *
                  </Label>
                  <select
                    {...register("doctor_id")}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.doctor_id && (
                    <p className="text-sm text-red-500">
                      {errors.doctor_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="DATE" className="text-gray-700">
                    Date *
                  </Label>
                  <Input
                    id="DATE"
                    type="date"
                    {...register("DATE")}
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.DATE && (
                    <p className="text-sm text-red-500">
                      {errors.DATE.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sub Packages */}
            <div>
                <div className="flex border-b border-gray-100 items-center justify-between  mb-4 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 ">
                        Packages
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addSubPackage}
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Package
                    </Button>
                </div>
{/*               
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSubPackage}
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Package
                </Button> */}
              <div className="space-y-4">
                {subPackages.map((subPackage, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Package *
                      </Label>
                      <select
                        value={subPackage.sub_package_id}
                        onChange={(e) => updateSubPackage(index, 'sub_package_id', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                      >
                        <option value="">Select package</option>
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - ₹{pkg.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Quantity *
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={subPackage.quantity}
                        onChange={(e) => updateSubPackage(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Total Price
                      </Label>
                      <Input
                        type="number"
                        value={subPackage.price * subPackage.quantity}
                        readOnly
                        className="border-gray-300 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Discount %
                      </Label>
                      <Input
                        type="number"
                        value={subPackage.package_discount}
                        readOnly
                        className="border-gray-300 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Disc Amount
                      </Label>
                      <Input
                        type="number"
                        value={subPackage.discount_price * subPackage.quantity}
                        readOnly
                        className="border-gray-300 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Total Disc. Price
                      </Label>
                      <Input
                        type="number"
                        value={subPackage.org_sub_total * subPackage.quantity}
                        readOnly
                        className="border-gray-300 bg-gray-50"
                      />
                    </div>

                    <div>
                      {subPackages.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubPackage(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Sub Total
                  </Label>
                  <Input
                    type="number"
                    value={subTotal}
                    readOnly
                    className="border-gray-300 bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-gray-700">
                    Discount
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    {...register("discount")}
                    placeholder="Enter discount"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.discount && (
                    <p className="text-sm text-red-500">
                      {errors.discount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paid_amount" className="text-gray-700">
                    Paid Amount *
                  </Label>
                  <Input
                    id="paid_amount"
                    type="number"
                    {...register("paid_amount")}
                    placeholder="Enter paid amount"
                    className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.paid_amount && (
                    <p className="text-sm text-red-500">
                      {errors.paid_amount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method" className="text-gray-700">
                    Payment Method *
                  </Label>
                  <select
                    {...register("payment_method")}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                  {errors.payment_method && (
                    <p className="text-sm text-red-500">
                      {errors.payment_method.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Balance
                  </Label>
                  <Input
                    type="number"
                    value={subTotal - (watch("discount") || 0) - (watch("paid_amount") || 0)}
                    readOnly
                    className="border-gray-300 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Additional Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-gray-700">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  {...register("remarks")}
                  placeholder="Enter any additional remarks"
                  className="min-h-[100px] border-gray-300 focus:ring-teal-500 focus:border-transparent"
                />
                {errors.remarks && (
                  <p className="text-sm text-red-500">
                    {errors.remarks.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Create Billing
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

export default AddBillingForm;
// export default AddBillingForm