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
  // Predefined color options
  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green  
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#1E40AF', // Dark Blue
    '#059669', // Dark Green
    '#DC2626', // Dark Red
    '#7C3AED', // Dark Purple
    '#EA580C', // Dark Orange
    '#0891B2', // Dark Cyan
    '#65A30D', // Dark Lime
    '#DB2777', // Dark Pink
    '#374151', // Dark Gray
    '#FDE047', // Bright Yellow
    '#34D399', // Mint Green
    '#F472B6', // Light Pink
    '#A78BFA', // Light Purple
    '#FBBF24', // Amber
    '#60A5FA', // Light Blue
  ];

  // Memoize initial form data to prevent unnecessary updates
  const initialFormData = useMemo(() => ({
    name: initialData.name || '',
    size: initialData.size || 8, // Default to 8 players
    color: initialData.color || colorOptions[0], // Default to first color
    coachIds: [...initialCoachIds], // Create a new array to avoid reference issues
  }), [initialData.name, initialData.size, initialData.color, initialCoachIds.join(',')]); // Use join to create stable dependency

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

        {/* Group Color */}
        <div className="space-y-2">
          <Typography variant="small" weight="medium">
            Group Color
          </Typography>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color 
                    ? 'border-neutral-900 scale-110' 
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border border-neutral-300"
              style={{ backgroundColor: formData.color }}
            />
            <Typography variant="small" className="text-neutral-600">
              Selected: {formData.color}
            </Typography>
          </div>
        </div>

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