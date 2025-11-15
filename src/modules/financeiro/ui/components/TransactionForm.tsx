import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '../../domain/entities/Category';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: {
    type: 'RECEITA' | 'DESPESA';
    amount: number;
    description: string;
    categoryId?: string;
    dueDate: Date;
    paymentMethod?: string;
    notes?: string;
  }) => Promise<void>;
}

export function TransactionForm({ categories, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<'RECEITA' | 'DESPESA'>('RECEITA');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        type,
        amount: parseFloat(amount),
        description,
        categoryId: categoryId || undefined,
        dueDate: new Date(dueDate),
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDueDate('');
      setPaymentMethod('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao criar transação:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) => cat.type === type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(value: 'RECEITA' | 'DESPESA') => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEITA">Receita</SelectItem>
                  <SelectItem value="DESPESA">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Input
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Ex: Dinheiro, Cartão, PIX..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Transação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
