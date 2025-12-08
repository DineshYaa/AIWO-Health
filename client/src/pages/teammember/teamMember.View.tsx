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
    Hash,
    Shield,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMemberData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact: string;
    address: string;
    gender_type: string;
    dob: string;
    members_serial_no: string;
    access_role_id: string;
    user_id: string;
    profile_url: string;
    status: number;
    created_at?: string;
    updated_at?: string;
}

const TeamMemberView = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [memberData, setMemberData] = useState<TeamMemberData | null>(null);
    const { token } = useAuth();
    const [match, params] = useRoute("/teammembers/view/:id");

    const memberId = params?.id;

    useEffect(() => {
        const fetchMemberData = async () => {
            if (!memberId) return;

            try {
                setIsLoading(true);
                const response = await apiRequest(
                    "GET",
                    `/user/team-member/detail/${memberId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch team member data");
                }

                const responseData = await response.json();
                console.log(responseData, "responseData");
                // Extract data from response.teamMember (based on console log) or fallback
                setMemberData(responseData.teamMember || responseData.data || responseData);
            } catch (error) {
                console.error("Error fetching team member:", error);
                toast({
                    title: "Error",
                    description: "Failed to load team member data",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchMemberData();
    }, [memberId, token]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading team member data...</p>
                </div>
            </div>
        );
    }

    if (!memberData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Team member not found</p>
                    <Link href="/teamMembers">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const genderMap: { [key: string]: string } = {
        "M": "Male",
        "F": "Female",
        "O": "Other",
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
                            Team Member Details
                        </h2>
                        <p className="text-gray-600 text-sm">
                            View comprehensive information about the team member
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/teamMembers">
                            <Button
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <Link href={`/teammembers/edit/${memberId}`}>
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Team Member
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Member Name and Status Banner */}
                    <div className="mb-8 pb-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={memberData.profile_url} alt={memberData.first_name} />
                                    <AvatarFallback className="bg-teal-100 text-teal-600 text-xl font-bold">
                                        {memberData.first_name?.charAt(0) || ""}{memberData.last_name?.charAt(0) || ""}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {memberData.first_name} {memberData.last_name}
                                    </h3>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <Hash className="w-4 h-4" />
                                        {memberData.members_serial_no}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${memberData.status === 1
                                    ? "bg-teal-100 text-teal-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {statusMap[String(memberData.status)] || "Unknown"}
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
                                    {memberData.first_name}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-sm">Last Name</Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {memberData.last_name}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-sm flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    Email
                                </Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {memberData.email}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-sm flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    Contact
                                </Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {memberData.contact}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-sm">Gender</Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {genderMap[memberData.gender_type] || memberData.gender_type || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-sm flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Date of Birth
                                </Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {new Date(memberData.dob).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Role & Access Information */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-teal-600" />
                            Role & Access
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-gray-500 text-sm">Access Role ID</Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {memberData.access_role_id}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-sm">User ID</Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {memberData.user_id}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-teal-600" />
                            Address Details
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Label className="text-gray-500 text-sm">Address</Label>
                                <p className="text-gray-900 font-medium mt-1">
                                    {memberData.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Joined Date */}
                    {memberData.created_at && (
                        <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-100">
                            Joined on{" "}
                            {new Date(memberData.created_at).toLocaleDateString("en-US", {
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

export default TeamMemberView;
