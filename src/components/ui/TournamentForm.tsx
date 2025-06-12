import { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Typography from './Typography';
import Checkbox from './Checkbox';
import { CreateTournamentData, Coach } from '../../types';

interface TournamentFormProps {
  initialData?: Partial<CreateTournamentData & { id: string }>;
  onSubmit: (data: CreateTournamentData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  coaches?: Coach[];
  initialCoachIds?: string[];
}

export default function TournamentForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  coaches = [],
  initialCoachIds = []
}: TournamentFormProps) {
  const [formData, setFormData] = useState<CreateTournamentData>({
    name: initialData?.name || '',
    location: initialData?.location || '',
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || new Date(),
    coachIds: initialCoachIds
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when initial data changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        location: initialData.location || '',
        startDate: initialData.startDate || new Date(),
        endDate: initialData.endDate || new Date(),
        coachIds: initialCoachIds
      });
    }
  }, [initialData, initialCoachIds]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Date validation
    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
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
    }
  };

  const handleInputChange = (field: keyof CreateTournamentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCoachToggle = (coachId: string) => {
    setFormData(prev => ({
      ...prev,
      coachIds: prev.coachIds?.includes(coachId)
        ? prev.coachIds.filter(id => id !== coachId)
        : [...(prev.coachIds || []), coachId]
    }));
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const parseInputDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Tournament Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            placeholder="Enter tournament name"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            error={errors.location}
            required
            placeholder="Enter tournament location"
          />
        </div>

        <div>
          <Input
            label="Start Date"
            type="date"
            value={formatDateForInput(formData.startDate)}
            onChange={(e) => handleInputChange('startDate', parseInputDate(e.target.value))}
            error={errors.startDate}
            required
          />
        </div>

        <div>
          <Input
            label="End Date"
            type="date"
            value={formatDateForInput(formData.endDate)}
            onChange={(e) => handleInputChange('endDate', parseInputDate(e.target.value))}
            error={errors.endDate}
            required
          />
        </div>
      </div>

      {/* Coach Assignment Section */}
      {coaches.length > 0 && (
        <div className="space-y-3">
          <Typography weight="medium">Assign Coaches (optional)</Typography>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-neutral-200 rounded-md p-3">
            {coaches.map(coach => (
              <div key={coach.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.coachIds?.includes(coach.id) || false}
                  onChange={() => handleCoachToggle(coach.id)}
                />
                <div className="flex-1">
                  <Typography className="font-medium">{coach.name}</Typography>
                  <Typography variant="small" className="text-neutral-500">
                    {coach.role === 'head' ? 'Head Coach' : 'Assistant Coach'} • {coach.email}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          {formData.coachIds && formData.coachIds.length > 0 && (
            <Typography variant="small" className="text-neutral-600">
              {formData.coachIds.length} coach{formData.coachIds.length !== 1 ? 'es' : ''} selected
            </Typography>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-3">
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
          {loading ? 'Saving...' : (isEdit ? 'Update Tournament' : 'Add Tournament')}
        </Button>
      </div>
    </form>
  );
} 