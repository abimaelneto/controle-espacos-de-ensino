import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import type { Student, CreateStudentDto, UpdateStudentDto } from '@/services/students.service';

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSubmit: (data: CreateStudentDto | UpdateStudentDto) => Promise<void>;
}

export function StudentForm({ open, onOpenChange, student, onSubmit }: StudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateStudentDto>({
    userId: '',
    firstName: '',
    lastName: '',
    cpf: '',
    email: '',
    matricula: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        userId: student.userId || '',
        firstName: student.firstName,
        lastName: student.lastName,
        cpf: student.cpf,
        email: student.email,
        matricula: student.matricula,
      });
    } else {
      setFormData({
        userId: '',
        firstName: '',
        lastName: '',
        cpf: '',
        email: '',
        matricula: '',
      });
    }
    setErrors({});
  }, [student, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.matricula.trim()) {
      newErrors.matricula = 'Matrícula é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (student) {
        await onSubmit({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });
      } else {
        await onSubmit(formData);
      }
      onOpenChange(false);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao salvar aluno' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <FormField>
              <FormLabel htmlFor="firstName">Nome *</FormLabel>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={loading}
              />
              {errors.firstName && <FormMessage>{errors.firstName}</FormMessage>}
            </FormField>

            <FormField>
              <FormLabel htmlFor="lastName">Sobrenome *</FormLabel>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={loading}
              />
              {errors.lastName && <FormMessage>{errors.lastName}</FormMessage>}
            </FormField>

            {!student && (
              <>
                <FormField>
                  <FormLabel htmlFor="cpf">CPF *</FormLabel>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    disabled={loading}
                  />
                  {errors.cpf && <FormMessage>{errors.cpf}</FormMessage>}
                </FormField>

                <FormField>
                  <FormLabel htmlFor="matricula">Matrícula *</FormLabel>
                  <Input
                    id="matricula"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    disabled={loading}
                  />
                  {errors.matricula && <FormMessage>{errors.matricula}</FormMessage>}
                </FormField>
              </>
            )}

            <FormField>
              <FormLabel htmlFor="email">Email *</FormLabel>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
              {errors.email && <FormMessage>{errors.email}</FormMessage>}
            </FormField>

            {errors.submit && <FormMessage>{errors.submit}</FormMessage>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

