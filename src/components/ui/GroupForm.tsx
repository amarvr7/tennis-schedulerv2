import { useState, useMemo } from 'react';
import Button from './Button';
import Input from './Input';
import Checkbox from './Checkbox';
import Typography from './Typography';
import { CreateGroupData, Coach } from '../../types';

interface GroupFormProps {
  initialData?: Partial<CreateGroupData>;
  onSubmit: (data: CreateGroupData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  coaches: Coach[];
  initialCoachIds?: string[];
}

interface FormErrors {
  name?: string;
  size?: string;
}

export default function GroupForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  coaches,
  initialCoachIds = []
}: GroupFormProps) {
  // Memoize initial form data to prevent unnecessary updates
  const initialFormData = useMemo(() => ({
    name: initialData.name || '',
    size: initialData.size || 8, // Default to 8 players
    coachIds: [...initialCoachIds], // Create a new array to avoid reference issues
  }), [initialData.name, initialData.size, initialCoachIds.join(',')]); // Use join to create stable dependency

  const [formData, setFormData] = useState<CreateGroupData>(() => initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Group name must be at least 2 characters';
    }

    // Size validation
    if (!formData.size || formData.size < 1) {
      newErrors.size = 'Group size must be at least 1 player';
    } else if (formData.size > 50) {
      newErrors.size = 'Group size cannot exceed 50 players';
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

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value
    }));
    
    // Clear field error when user starts typing
    if (errors.name) {
      setErrors(prev => ({
        ...prev,
        name: undefined
      }));
    }
  };

  const handleSizeChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      size: numValue
    }));
    
    // Clear field error when user starts typing
    if (errors.size) {
      setErrors(prev => ({
        ...prev,
        size: undefined
      }));
    }
  };

  const handleCoachToggle = (coachId: string, isChecked: boolean) => {
    setFormData(prev => {
      const currentCoachIds = prev.coachIds || [];
      
      if (isChecked) {
        // Add coach if not already in the list
        return {
          ...prev,
          coachIds: currentCoachIds.includes(coachId) 
            ? currentCoachIds 
            : [...currentCoachIds, coachId]
        };
      } else {
        // Remove coach from the list
        return {
          ...prev,
          coachIds: currentCoachIds.filter(id => id !== coachId)
        };
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Group Name */}
        <Input
          label="Group Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
          placeholder="Enter group name"
          required
        />

        {/* Group Size */}
        <Input
          label="Number of Players"
          type="number"
          value={formData.size.toString()}
          onChange={(e) => handleSizeChange(e.target.value)}
          error={errors.size}
          placeholder="8"
          min="1"
          max="50"
          required
        />

        {/* Coach Assignment */}
        <div className="space-y-3">
          <Typography variant="small" weight="medium">
            Assign Coaches (optional)
          </Typography>
          
          {coaches.length === 0 ? (
            <Typography variant="small" className="text-neutral-500">
              No coaches available. Add coaches first to assign them to groups.
            </Typography>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-md p-3">
              {coaches.map((coach) => (
                <Checkbox
                  key={coach.id}
                  checked={formData.coachIds?.includes(coach.id) || false}
                  onChange={(checked) => handleCoachToggle(coach.id, checked)}
                  label={
                    <div>
                      <Typography variant="small" weight="medium">
                        {coach.name}
                      </Typography>
                      <Typography variant="subtle" className="text-xs">
                        {coach.role === 'head' ? 'Head Coach' : 'Assistant Coach'} • {coach.email}
                      </Typography>
                    </div>
                  }
                />
              ))}
            </div>
          )}
          
          {formData.coachIds && formData.coachIds.length > 0 && (
            <Typography variant="small" className="text-neutral-600">
              {formData.coachIds.length} coach{formData.coachIds.length === 1 ? '' : 'es'} selected
            </Typography>
          )}
        </div>
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
          {loading ? 'Saving...' : (isEdit ? 'Update Group' : 'Create Group')}
        </Button>
      </div>
    </form>
  );
} 