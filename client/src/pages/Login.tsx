import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { setAuthData } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/auth/login", {
        email: data.email,
        password: data.password,
      });
      // Parse the JSON response
      return response.json();
    },
    onSuccess: (responseData: any) => {
      console.log("Login Success ✅", responseData);

      // Extract data from the new response structure
      const { data } = responseData;

      // Store auth data in localStorage and query cache
      if (data && data.token) {
        // Build user object from response fields
        const user = {
          id: data.user_id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          user_type: data.user_type,
          role_base_id: data.role_base_id,
          status: data.status,
          contact: data.contact,
        };

        setAuthData({
          user: user,
          token: data.token,
          refreshToken: data.refreshToken,
        });

        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.first_name || "User"}!`,
        });

        // Invalidate any existing auth queries
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

        // Redirect to dashboard
        setLocation("/");
      } else {
        throw new Error("Invalid response from server");
      }
    },
    onError: (error: Error) => {
      console.error("Login Error ❌", error);
      toast({
        title: "Login Failed",
        description:
          error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex">
        {/* LEFT HERO */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80")',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-teal-800/70 to-cyan-900/80"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
            <div className="max-w-lg text-center">
              <p className="text-sm font-semibold mb-4 tracking-widest uppercase opacity-90">
                The Future of Longevity
              </p>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Transform Your Health.
                <br />
                Extend Your Life.
              </h1>
              <p className="text-lg leading-relaxed opacity-90">
                Experience precision health optimization with AI-powered
                wellness.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">Sign in to continue</p>
            </div>

            {/* ✅ Important: wrap with form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* EMAIL */}
              <div>
                <Label>Email Address</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className={`w-full px-4 py-3 border rounded-lg pr-12 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* REMEMBER ME */}
              <div className="flex justify-between items-center">
                <Label className="flex items-center">
                  <Input type="checkbox" {...register("rememberMe")} />
                  <span className="ml-1">Remember me</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setLocation("/forgot-password")}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium transition"
                >
                  Forgot password?
                </button>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed text-white py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
