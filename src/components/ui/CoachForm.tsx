import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Typography from './Typography';
import { CreateCoachData, UpdateCoachData } from '../../types';

interface CoachFormProps {
  initialData?: Partial<CreateCoachData>;
  onSubmit: (data: CreateCoachData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

interface FormErrors {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export default function CoachForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false
}: CoachFormProps) {
  const [formData, setFormData] = useState<CreateCoachData>({
    name: initialData.name || '',
    role: initialData.role || '' as any,
    email: initialData.email || '',
    phone: initialData.phone || '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return cleanPhone.length >= 10 && phoneRegex.test(cleanPhone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Role validation (should always be valid due to select, but just in case)
    if (!formData.role || !['head', 'assistant'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error (could set a general error state here)
    }
  };

  const handleChange = (field: keyof CreateCoachData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name */}
        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter coach's full name"
          required
        />

        {/* Role */}
        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value as 'head' | 'assistant')}
          error={errors.role}
          required
        >
          <option value="">Select a role</option>
          <option value="assistant">Assistant Coach</option>
          <option value="head">Head Coach</option>
        </Select>

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="coach@example.com"
          required
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="(555) 123-4567"
          required
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Coach' : 'Add Coach')}
        </Button>
      </div>
    </form>
  );
} 