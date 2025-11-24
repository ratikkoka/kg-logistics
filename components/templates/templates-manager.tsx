'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Spinner,
} from '@heroui/react';
import { Icon } from '@iconify/react';

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();

      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', body: '' });
    onOpen();
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    onOpen();
  };

  const handleDelete = (id: string) => {
    setDeleteTemplateId(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTemplateId) return;

    try {
      const response = await fetch(`/api/templates/${deleteTemplateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTemplates();
        onDeleteClose();
        setDeleteTemplateId(null);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = editingTemplate
        ? `/api/templates/${editingTemplate.id}`
        : '/api/templates';
      const method = editingTemplate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTemplates();
        onClose();
        setFormData({ name: '', subject: '', body: '' });
        setEditingTemplate(null);
      } else {
        const error = await response.json();

        alert(error.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Templates</h2>
          <Button color='primary' onPress={handleCreate}>
            <Icon icon='solar:add-circle-outline' width={20} />
            Create Template
          </Button>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className='flex justify-center py-8'>
              <Spinner size='lg' />
            </div>
          ) : templates.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              No templates yet. Create your first template to get started.
            </div>
          ) : (
            <Table aria-label='Templates table'>
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>SUBJECT</TableColumn>
                <TableColumn>UPDATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className='font-medium'>
                      {template.name}
                    </TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='light'
                          onPress={() => handleEdit(template)}
                        >
                          <Icon icon='solar:pen-outline' width={18} />
                          Edit
                        </Button>
                        <Button
                          color='danger'
                          size='sm'
                          variant='light'
                          onPress={() => handleDelete(template.id)}
                        >
                          <Icon icon='solar:trash-bin-outline' width={18} />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isOpen}
        scrollBehavior='inside'
        size='2xl'
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <Input
                    isRequired
                    label='Template Name'
                    placeholder='e.g., Welcome Email'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    label='Subject'
                    placeholder='e.g., Welcome {{lead.name}}!'
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                  <Textarea
                    isRequired
                    label='Body'
                    minRows={10}
                    placeholder='Enter your email template body...'
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                  />
                  <div className='bg-default-100 rounded-lg p-3 text-sm'>
                    <p className='mb-2 font-semibold'>Available Variables:</p>
                    <ul className='text-default-600 list-inside list-disc space-y-1'>
                      <li>
                        <code>{'{{lead.name}}'}</code> - Full name
                      </li>
                      <li>
                        <code>{'{{lead.firstName}}'}</code> - First name
                      </li>
                      <li>
                        <code>{'{{lead.lastName}}'}</code> - Last name
                      </li>
                      <li>
                        <code>{'{{lead.email}}'}</code> - Email address
                      </li>
                      <li>
                        <code>{'{{lead.phone}}'}</code> - Phone number
                      </li>
                      <li>
                        <code>{'{{lead.vehicle}}'}</code> - Vehicle (Year Make
                        Model)
                      </li>
                      <li>
                        <code>{'{{lead.pickupLocation}}'}</code> - Pickup
                        address
                      </li>
                      <li>
                        <code>{'{{lead.dropoffLocation}}'}</code> - Drop-off
                        address
                      </li>
                      <li>
                        <code>{'{{lead.openQuote}}'}</code> - Open transport
                        quote
                      </li>
                      <li>
                        <code>{'{{lead.enclosedQuote}}'}</code> - Enclosed
                        transport quote
                      </li>
                    </ul>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isLoading={isSaving}
                  onPress={handleSave}
                >
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Template</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this template? This action
                  cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='danger' onPress={confirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
