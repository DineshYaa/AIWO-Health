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
import { apiRequest } from "@/lib/queryClient";

const teamMemberSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    contact: z.string().min(10, "Contact number must be at least 10 digits"),
    address: z.string().min(5, "Address is required"),
    gender_type: z.string().min(1, "Gender is required"),
    dob: z.string().min(1, "Date of birth is required"),
    members_serial_no: z.string().min(1, "Serial number is required"),
    access_role_id: z.string().min(1, "Access Role ID is required"),
    status: z.coerce.number().optional(),
    profile_url: z.string().optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface Role {
    id: string;
    Name: string;
    Description?: string;
}

const TeamMemberForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const { token } = useAuth();
    const [, setLocation] = useLocation();
    const [match, params] = useRoute("/teammembers/:action/:id?");

    const isEditMode = match && params?.action === "edit" && params?.id;
    const memberId = params?.id;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm<TeamMemberFormData>({
        resolver: zodResolver(teamMemberSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            contact: "",
            address: "",
            gender_type: "",
            dob: "",
            members_serial_no: "",
            access_role_id: "",
            status: 1,
            profile_url: "",
        },
    });

    // Fetch team member data when in edit mode
    useEffect(() => {
        const fetchMemberData = async () => {
            if (!isEditMode || !memberId) return;

            try {
                setIsFetching(true);
                const response = await apiRequest(
                    "GET",
                    `/user/team-member/detail/${memberId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch team member data");
                }

                const responseData = await response.json();
                const memberData = responseData.teamMember || responseData.data || responseData;

                // Populate form with fetched data
                Object.keys(memberData).forEach((key) => {
                    if (key === "dob" && memberData[key]) {
                        const date = new Date(memberData[key]);
                        const formattedDate = date.toISOString().split('T')[0];
                        setValue("dob", formattedDate);
                    } else if (key in teamMemberSchema.shape) {
                        setValue(
                            key as keyof TeamMemberFormData,
                            memberData[key]
                        );
                    }
                });

                if (memberData.status !== undefined) {
                    setValue("status", memberData.status);
                }

                toast({
                    title: "Data loaded",
                    description: "You can now edit the team member information",
                });
            } catch (error) {
                console.error("Error fetching team member:", error);
                toast({
                    title: "Error",
                    description: "Failed to load team member data",
                    variant: "destructive",
                });
            } finally {
                setIsFetching(false);
            }
        };

        fetchMemberData();
    }, [isEditMode, memberId, token, setValue]);

    // Fetch roles list
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await apiRequest("GET", "/user/role?page=1&limit=10");
                if (!response.ok) {
                    throw new Error("Failed to fetch roles");
                }
                const data = await response.json();
                console.log(data, "data");
                setRoles(data.roles || data.data || data);
            } catch (error) {
                console.error("Error fetching roles:", error);
                toast({
                    title: "Warning",
                    description: "Failed to load roles list",
                    variant: "destructive",
                });
            }
        };

        fetchRoles();
    }, [token]);
    console.log(roles, "roles");
    const onSubmit = async (data: TeamMemberFormData) => {
        try {
            setIsLoading(true);

            const url = isEditMode
                ? `/user/team-member/update/${memberId}`
                : `/user/team-member/create`;

            const method = isEditMode ? "PUT" : "POST";

            const response = await apiRequest(method, url, data);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to save team member");
            }

            toast({
                title: "Success",
                description: isEditMode
                    ? "Team member updated successfully"
                    : "Team member added successfully",
            });

            setTimeout(() => setLocation("/teamMembers"), 1000);
        } catch (error) {
            console.error("Error saving team member:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error ? error.message : "Failed to save team member",
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
                    <p className="text-gray-600">Loading team member data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-12">
            <div className="max-w-5xl w-full mx-auto">
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
                            {isEditMode ? "Edit Team Member" : "Add New Team Member"}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {isEditMode
                                ? "Update the team member's information below"
                                : "Enter the details to register a new team member"}
                        </p>
                    </div>
                    <Link href="/teamMembers">
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
                                        defaultValue={watch("gender_type")}
                                    >
                                        <SelectTrigger className="border-gray-300 focus:ring-teal-500 focus:border-transparent">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Male</SelectItem>
                                            <SelectItem value="F">Female</SelectItem>
                                            <SelectItem value="O">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender_type && (
                                        <p className="text-sm text-red-500">
                                            {errors.gender_type.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="text-gray-700">
                                        Date of Birth
                                    </Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        {...register("dob")}
                                        className="border-gray-300 focus:ring-teal-500 focus:border-transparent"
                                    />
                                    {errors.dob && (
                                        <p className="text-sm text-red-500">
                                            {errors.dob.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                Additional Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="access_role_id" className="text-gray-700">
                                        Access Role
                                    </Label>
                                    <Select
                                        onValueChange={(value) => setValue("access_role_id", value)}
                                        value={watch("access_role_id")}
                                    >
                                        <SelectTrigger className="border-gray-300 focus:ring-teal-500 focus:border-transparent">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.name} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.access_role_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.access_role_id.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address" className="text-gray-700">
                                        Address
                                    </Label>
                                    <Textarea
                                        id="address"
                                        {...register("address")}
                                        placeholder="Enter full address"
                                        className="min-h-[80px] border-gray-300 focus:ring-teal-500 focus:border-transparent"
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">
                                            {errors.address.message}
                                        </p>
                                    )}
                                </div>

                                {isEditMode && (
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-gray-700">
                                            Status
                                        </Label>
                                        <Select
                                            onValueChange={(value) => setValue("status", parseInt(value))}
                                            defaultValue={watch("status")?.toString()}
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
                                )}
                            </div>
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
                                        {isEditMode ? "Updating..." : "Adding..."}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {isEditMode ? "Update Team Member" : "Add Team Member"}
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

export default TeamMemberForm;
