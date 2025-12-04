// import React from 'react'

// const AddDoctor = () => {
//   return (
//     <div>AddDoctor</div>
//   )
// }

// export default AddDoctor

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const doctorSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  contact: z.string().min(10, 'Contact number must be at least 10 digits'),
  address1: z.string().min(5, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country_code: z.string().min(2, 'Country code is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  license_no: z.string().min(2, 'License number is required'),
  experience: z.string().min(1, 'Experience is required'),
  about_me: z.string().min(10, 'Please provide more information'),
  inperson_consultation: z.string().min(1, 'In-person consultation fee is required'),
  tele_consultation: z.string().min(1, 'Tele-consultation fee is required'),
  doctor_commission: z.string().min(1, 'Commission is required'),
  gender_type: z.string().min(1, 'Gender is required'),
  status: z.string().min(1, 'Status is required'),
  doctor_type: z.string().min(1, 'Doctor type is required'),
  // Hidden fields
  designation_id: z.string().uuid('Invalid designation').default('e6a3877c-19bc-4fd3-a2e4-4ca5ca5b8106'),
  specialization_id: z.string().uuid('Invalid specialization').default('55f8cc83-c4c2-4330-8ef5-695aa6bf2781'),
  user_id: z.string().uuid('Invalid user ID').default('3b544aa0-755a-47b3-8457-c4d4d952675b'),
  role_id: z.string().min(1, 'Role is required').default('1'),
  profile_url: z.string().url('Invalid URL').or(z.literal('')).default(''),
  doctor_serial_no: z.string().min(1, 'Serial number is required').default('1'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const AddDoctor = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      contact: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country_code: '',
      qualification: '',
      license_no: '',
      gender_type: '',
      experience: '',
      about_me: '',
      inperson_consultation: '',
      tele_consultation: '',
      status: '',
      doctor_type: '',
      doctor_commission: '',
    },
  });

  const onSubmit = async (data: DoctorFormData) => {
    try {
      setIsLoading(true);
      console.log('Submitting doctor data:', data);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Doctor added successfully',
      });
      
      reset();
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add doctor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Doctor</CardTitle>
          <CardDescription>Fill in the details below to add a new doctor to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  {...register('contact')}
                  placeholder="Enter contact number"
                />
                {errors.contact && (
                  <p className="text-sm text-red-500">{errors.contact.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender_type">Gender</Label>
                <Select
                  onValueChange={(value) => setValue('gender_type', value)}
                  defaultValue="1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Male</SelectItem>
                    <SelectItem value="2">Female</SelectItem>
                    <SelectItem value="3">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender_type && (
                  <p className="text-sm text-red-500">{errors.gender_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  {...register('experience')}
                  placeholder="Enter years of experience"
                />
                {errors.experience && (
                  <p className="text-sm text-red-500">{errors.experience.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  {...register('qualification')}
                  placeholder="Enter qualifications"
                />
                {errors.qualification && (
                  <p className="text-sm text-red-500">{errors.qualification.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_no">License Number</Label>
                <Input
                  id="license_no"
                  {...register('license_no')}
                  placeholder="Enter license number"
                />
                {errors.license_no && (
                  <p className="text-sm text-red-500">{errors.license_no.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inperson_consultation">In-person Consultation Fee</Label>
                <Input
                  id="inperson_consultation"
                  type="number"
                  {...register('inperson_consultation')}
                  placeholder="Enter fee amount"
                />
                {errors.inperson_consultation && (
                  <p className="text-sm text-red-500">{errors.inperson_consultation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tele_consultation">Tele-consultation Fee</Label>
                <Input
                  id="tele_consultation"
                  type="number"
                  {...register('tele_consultation')}
                  placeholder="Enter fee amount"
                />
                {errors.tele_consultation && (
                  <p className="text-sm text-red-500">{errors.tele_consultation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_commission">Doctor Commission (%)</Label>
                <Input
                  id="doctor_commission"
                  type="number"
                  {...register('doctor_commission')}
                  placeholder="Enter commission percentage"
                />
                {errors.doctor_commission && (
                  <p className="text-sm text-red-500">{errors.doctor_commission.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => setValue('status', value)}
                  defaultValue="1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_type">Doctor Type</Label>
                <Select
                  onValueChange={(value) => setValue('doctor_type', value)}
                  defaultValue="1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">General Practitioner</SelectItem>
                    <SelectItem value="2">Specialist</SelectItem>
                  </SelectContent>
                </Select>
                {errors.doctor_type && (
                  <p className="text-sm text-red-500">{errors.doctor_type.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="about_me">About Me</Label>
                <Textarea
                  id="about_me"
                  {...register('about_me')}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
                {errors.about_me && (
                  <p className="text-sm text-red-500">{errors.about_me.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Doctor'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDoctor;