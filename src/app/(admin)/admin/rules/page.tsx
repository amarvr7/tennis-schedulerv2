"use client";

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import Textarea from '@/components/ui/Textarea';
import { Rule, CreateRuleData, TableColumn } from '@/types';
import { ruleService } from '@/lib/services/ruleService';

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Rule | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateRuleData>({
    content: '',
    priority: 1,
  });

  // Load rules on component mount
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const rulesData = await ruleService.getAll();
      setRules(rulesData);
    } catch (error) {
      console.error('Failed to load rules:', error);
      // TODO: Add toast notification for error
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      priority: rules.length + 1, // Add to end of list
    });
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      // Add new rule at the end of the list
      await ruleService.create({
        ...formData,
        priority: rules.length + 1,
      });
      setShowAddModal(false);
      resetForm();
      await loadRules(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to add rule:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      setFormLoading(true);
      await ruleService.update({
        id: editingRule.id,
        content: formData.content,
        // Keep existing priority when editing
      });
      setEditingRule(null);
      resetForm();
      await loadRules(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to update rule:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRule = async (rule: Rule) => {
    try {
      await ruleService.delete(rule.id);
      setDeleteConfirm(null);
      await loadRules(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to delete rule:', error);
      // TODO: Add error toast
    }
  };

  const moveRule = async (ruleId: string, direction: 'up' | 'down') => {
    const currentIndex = rules.findIndex(r => r.id === ruleId);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex === 0) return; // Can't move up from first position
    if (direction === 'down' && currentIndex === rules.length - 1) return; // Can't move down from last position

    const newRules = [...rules];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Swap the rules
    [newRules[currentIndex], newRules[targetIndex]] = [newRules[targetIndex], newRules[currentIndex]];

    try {
      // Update local state immediately for better UX
      setRules(newRules);
      
      // Update priorities in database
      await ruleService.reorder(newRules);
    } catch (error) {
      console.error('Failed to reorder rules:', error);
      // Revert local state on error
      await loadRules();
      // TODO: Add error toast
    }
  };

  const openEditModal = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      content: rule.content,
      priority: rule.priority, // Keep existing priority
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingRule(null);
    resetForm();
  };

  // Define table columns
  const columns: TableColumn<Rule>[] = [
    {
      key: 'priority',
      label: '#',
      sortable: false,
      render: (value, rule) => {
        const currentIndex = rules.findIndex(r => r.id === rule.id);
        return (
          <div className="flex items-center space-x-1">
            <Typography variant="small" weight="medium" className="text-neutral-600 w-6">
              {currentIndex + 1}
            </Typography>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveRule(rule.id, 'up')}
                disabled={currentIndex === 0}
                className="p-1 h-6 w-6 flex items-center justify-center text-xs"
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveRule(rule.id, 'down')}
                disabled={currentIndex === rules.length - 1}
                className="p-1 h-6 w-6 flex items-center justify-center text-xs"
              >
                ↓
              </Button>
            </div>
          </div>
        )
      }
    },
    {
      key: 'content',
      label: 'Rule Content',
      sortable: false,
      render: (value) => (
        <Typography className="max-w-md">{value}</Typography>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: false,
      render: (value) => (
        <Typography variant="small" className="text-neutral-500">
          {new Date(value).toLocaleDateString()}
        </Typography>
      )
    }
  ];

  // Define row actions
  const rowActions = (rule: Rule) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openEditModal(rule)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(rule)}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <Typography variant="h1" weight="bold" className="text-2xl sm:text-3xl md:text-4xl">
          Scheduling Rules
        </Typography>
        <Typography variant="lead" className="text-neutral-600">
          Manage rules and constraints for the scheduling algorithm. Rules at the top have higher priority.
        </Typography>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Typography variant="p" className="text-neutral-600">
          {rules.length} rule{rules.length !== 1 ? 's' : ''} total
        </Typography>
        <Button 
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Rules Table */}
      <DataTable
        data={rules}
        columns={columns}
        loading={loading}
        actions={rowActions}
        emptyMessage="No rules found. Add your first scheduling rule to get started."
      />

      {/* Add Rule Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={closeModals}
        title="Add New Rule"
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          <div>
            <Typography variant="label" className="block mb-2">
              Rule Content *
            </Typography>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="e.g., I don't want Alex to work with David"
              required
              rows={3}
            />
            <Typography variant="small" className="text-neutral-500 mt-1">
              This rule will be added to the bottom of the list. Use the up/down arrows to reorder.
            </Typography>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!formData.content.trim() || formLoading}
            >
              {formLoading ? 'Adding...' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Rule Modal */}
      <Dialog
        isOpen={!!editingRule}
        onClose={closeModals}
        title="Edit Rule"
      >
        <form onSubmit={handleEditRule} className="space-y-4">
          <div>
            <Typography variant="label" className="block mb-2">
              Rule Content *
            </Typography>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="e.g., I don't want Alex to work with David"
              required
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!formData.content.trim() || formLoading}
            >
              {formLoading ? 'Updating...' : 'Update Rule'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Rule"
      >
        <div className="space-y-4">
          <Typography variant="p">
            Are you sure you want to delete this rule? This action cannot be undone.
          </Typography>
          
          <div className="bg-neutral-50 p-3 rounded border">
            <Typography variant="small" weight="medium" className="text-neutral-700">
              {deleteConfirm?.content}
            </Typography>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="error"
              onClick={() => deleteConfirm && handleDeleteRule(deleteConfirm)}
            >
              Delete Rule
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 