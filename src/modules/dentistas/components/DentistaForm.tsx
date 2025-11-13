import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dentista, dentistaSchema, especialidadesDisponiveis, diasSemana, coresCalendario } from '../types/dentista.types';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/shared/AvatarUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DentistaFormProps {
  dentista?: Dentista;
  onSubmit: (data: Dentista) => void;
  onCancel: () => void;
}

export function DentistaForm({ dentista, onSubmit, onCancel }: DentistaFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(dentista?.avatar_url || null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Dentista>({
    resolver: zodResolver(dentistaSchema),
    defaultValues: dentista || {
      status: 'Ativo',
      especialidades: [],
      diasAtendimento: [],
      corCalendario: coresCalendario[0],
      horariosAtendimento: {
        inicio: '08:00',
        fim: '18:00',
      },
    },
  });

  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>(
    dentista?.especialidades || []
  );
  const [selectedDias, setSelectedDias] = useState<number[]>(
    dentista?.diasAtendimento || []
  );

  const dataNascimento = watch('dataNascimento');
  const corCalendario = watch('corCalendario');

  const handleEspecialidadeToggle = (especialidade: string) => {
    const updated = selectedEspecialidades.includes(especialidade)
      ? selectedEspecialidades.filter(e => e !== especialidade)
      : [...selectedEspecialidades, especialidade];
    setSelectedEspecialidades(updated);
    setValue('especialidades', updated);
  };

  const handleDiaToggle = (dia: number) => {
    const updated = selectedDias.includes(dia)
      ? selectedDias.filter(d => d !== dia)
      : [...selectedDias, dia];
    setSelectedDias(updated);
    setValue('diasAtendimento', updated);
  };

  const handleFormSubmit = (data: Dentista) => {
    onSubmit({
      ...data,
      especialidades: selectedEspecialidades,
      diasAtendimento: selectedDias,
      avatar_url: avatarUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex justify-center py-4">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
          fallbackText={dentista?.nome.substring(0, 2).toUpperCase() || 'DR'}
          size="xl"
        />
      </div>

      <Tabs defaultValue="pessoal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="profissional">Profissional</TabsTrigger>
          <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="pessoal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Nome completo do dentista"
                className={errors.nome ? 'border-destructive' : ''}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                {...register('cpf')}
                placeholder="000.000.000-00"
                className={errors.cpf ? 'border-destructive' : ''}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive">{errors.cpf.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                {...register('rg')}
                placeholder="00.000.000-0"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Nascimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dataNascimento && 'text-muted-foreground',
                      errors.dataNascimento && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataNascimento ? format(new Date(dataNascimento), 'PPP', { locale: ptBR }) : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataNascimento ? new Date(dataNascimento) : undefined}
                    onSelect={(date) => date && setValue('dataNascimento', format(date, 'yyyy-MM-dd'))}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.dataNascimento && (
                <p className="text-sm text-destructive">{errors.dataNascimento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo *</Label>
              <Select
                value={watch('sexo')}
                onValueChange={(value) => setValue('sexo', value as 'M' | 'F' | 'Outro')}
              >
                <SelectTrigger className={errors.sexo ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.sexo && (
                <p className="text-sm text-destructive">{errors.sexo.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Contato */}
        <TabsContent value="contato" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                {...register('telefone')}
                placeholder="(00) 0000-0000"
                className={errors.telefone ? 'border-destructive' : ''}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular">Celular *</Label>
              <Input
                id="celular"
                {...register('celular')}
                placeholder="(00) 00000-0000"
                className={errors.celular ? 'border-destructive' : ''}
              />
              {errors.celular && (
                <p className="text-sm text-destructive">{errors.celular.message}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco.cep">CEP *</Label>
              <Input
                id="endereco.cep"
                {...register('endereco.cep')}
                placeholder="00000-000"
                className={errors.endereco?.cep ? 'border-destructive' : ''}
              />
              {errors.endereco?.cep && (
                <p className="text-sm text-destructive">{errors.endereco.cep.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco.logradouro">Logradouro *</Label>
              <Input
                id="endereco.logradouro"
                {...register('endereco.logradouro')}
                placeholder="Rua, Avenida, etc."
                className={errors.endereco?.logradouro ? 'border-destructive' : ''}
              />
              {errors.endereco?.logradouro && (
                <p className="text-sm text-destructive">{errors.endereco.logradouro.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco.numero">Número *</Label>
              <Input
                id="endereco.numero"
                {...register('endereco.numero')}
                placeholder="123"
                className={errors.endereco?.numero ? 'border-destructive' : ''}
              />
              {errors.endereco?.numero && (
                <p className="text-sm text-destructive">{errors.endereco.numero.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco.complemento">Complemento</Label>
              <Input
                id="endereco.complemento"
                {...register('endereco.complemento')}
                placeholder="Apto, Sala, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco.bairro">Bairro *</Label>
              <Input
                id="endereco.bairro"
                {...register('endereco.bairro')}
                placeholder="Nome do bairro"
                className={errors.endereco?.bairro ? 'border-destructive' : ''}
              />
              {errors.endereco?.bairro && (
                <p className="text-sm text-destructive">{errors.endereco.bairro.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco.cidade">Cidade *</Label>
              <Input
                id="endereco.cidade"
                {...register('endereco.cidade')}
                placeholder="Nome da cidade"
                className={errors.endereco?.cidade ? 'border-destructive' : ''}
              />
              {errors.endereco?.cidade && (
                <p className="text-sm text-destructive">{errors.endereco.cidade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco.estado">Estado *</Label>
              <Input
                id="endereco.estado"
                {...register('endereco.estado')}
                placeholder="SP"
                maxLength={2}
                className={errors.endereco?.estado ? 'border-destructive' : ''}
              />
              {errors.endereco?.estado && (
                <p className="text-sm text-destructive">{errors.endereco.estado.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Profissional */}
        <TabsContent value="profissional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cro">CRO *</Label>
              <Input
                id="cro"
                {...register('cro')}
                placeholder="CRO-SP 12345"
                className={errors.cro ? 'border-destructive' : ''}
              />
              {errors.cro && (
                <p className="text-sm text-destructive">{errors.cro.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as Dentista['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Férias">Férias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Especialidades *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-lg">
                {especialidadesDisponiveis.map((esp) => (
                  <div key={esp} className="flex items-center space-x-2">
                    <Checkbox
                      id={esp}
                      checked={selectedEspecialidades.includes(esp)}
                      onCheckedChange={() => handleEspecialidadeToggle(esp)}
                    />
                    <label
                      htmlFor={esp}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {esp}
                    </label>
                  </div>
                ))}
              </div>
              {errors.especialidades && (
                <p className="text-sm text-destructive">{errors.especialidades.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorConsulta">Valor da Consulta (R$)</Label>
              <Input
                id="valorConsulta"
                type="number"
                step="0.01"
                {...register('valorConsulta', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor no Calendário *</Label>
              <div className="flex gap-2">
                {coresCalendario.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setValue('corCalendario', cor)}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 transition-all',
                      corCalendario === cor ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Informações adicionais sobre o dentista..."
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        {/* Atendimento */}
        <TabsContent value="atendimento" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dias de Atendimento *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 border rounded-lg">
                {diasSemana.map((dia) => (
                  <div key={dia.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dia-${dia.value}`}
                      checked={selectedDias.includes(dia.value)}
                      onCheckedChange={() => handleDiaToggle(dia.value)}
                    />
                    <label
                      htmlFor={`dia-${dia.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {dia.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.diasAtendimento && (
                <p className="text-sm text-destructive">{errors.diasAtendimento.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horariosAtendimento.inicio">Horário de Início *</Label>
                <Input
                  id="horariosAtendimento.inicio"
                  type="time"
                  {...register('horariosAtendimento.inicio')}
                  className={errors.horariosAtendimento?.inicio ? 'border-destructive' : ''}
                />
                {errors.horariosAtendimento?.inicio && (
                  <p className="text-sm text-destructive">{errors.horariosAtendimento.inicio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horariosAtendimento.fim">Horário de Fim *</Label>
                <Input
                  id="horariosAtendimento.fim"
                  type="time"
                  {...register('horariosAtendimento.fim')}
                  className={errors.horariosAtendimento?.fim ? 'border-destructive' : ''}
                />
                {errors.horariosAtendimento?.fim && (
                  <p className="text-sm text-destructive">{errors.horariosAtendimento.fim.message}</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {dentista ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
