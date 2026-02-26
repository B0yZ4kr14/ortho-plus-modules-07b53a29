/**
 * Input com formatação automática para campos brasileiros
 * @component FormattedInput
 * @category Shared/Components/Forms
 * 
 * @example
 * ```tsx
 * <FormattedInput
 *   type="cpf"
 *   value={cpf}
 *   onChange={(e) => setCPF(e.target.value)}
 *   placeholder="000.000.000-00"
 * />
 * ```
 */

import { forwardRef, InputHTMLAttributes, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatCPF, formatCNPJ, formatCEP, formatPhone, formatRG, cleanFormat } from '@/lib/utils/formatting.utils';
import { useCEPLookup, CEPAddress } from '@/hooks/useCEPLookup';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FormattedInputType = 'cpf' | 'cnpj' | 'cpf-cnpj' | 'cep' | 'phone' | 'rg';

export interface FormattedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  type: FormattedInputType;
  value?: string;
  onChange?: (value: string, rawValue: string) => void;
  onAddressFound?: (address: CEPAddress) => void;
}

/**
 * Input com formatação automática baseada no tipo
 */
export const FormattedInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  ({ type, value = '', onChange, onAddressFound, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value);
    const { lookupCEP, isLoading } = useCEPLookup();

    // Atualizar valor quando prop mudar
    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const formatValue = (rawValue: string): string => {
      switch (type) {
        case 'cpf':
          return formatCPF(rawValue);
        case 'cnpj':
          return formatCNPJ(rawValue);
        case 'cpf-cnpj': {
          const cleaned = cleanFormat(rawValue);
          return cleaned.length <= 11 ? formatCPF(rawValue) : formatCNPJ(rawValue);
        }
        case 'cep':
          return formatCEP(rawValue);
        case 'phone':
          return formatPhone(rawValue);
        case 'rg':
          return formatRG(rawValue);
        default:
          return rawValue;
      }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatValue(inputValue);
      const raw = cleanFormat(inputValue);

      setDisplayValue(formatted);
      
      if (onChange) {
        onChange(formatted, raw);
      }

      // Busca automática de CEP quando completo
      if (type === 'cep' && raw.length === 8 && onAddressFound) {
        const address = await lookupCEP(raw);
        if (address) {
          onAddressFound(address);
        }
      }
    };

    const getPlaceholder = (): string => {
      if (props.placeholder) return props.placeholder;
      
      switch (type) {
        case 'cpf':
          return '000.000.000-00';
        case 'cnpj':
          return '00.000.000/0000-00';
        case 'cpf-cnpj':
          return 'CPF ou CNPJ';
        case 'cep':
          return '00000-000';
        case 'phone':
          return '(00) 00000-0000';
        case 'rg':
          return '00.000.000-0';
        default:
          return '';
      }
    };

    const getMaxLength = (): number => {
      switch (type) {
        case 'cpf':
          return 14; // 000.000.000-00
        case 'cnpj':
          return 18; // 00.000.000/0000-00
        case 'cpf-cnpj':
          return 18; // CNPJ é maior
        case 'cep':
          return 9; // 00000-000
        case 'phone':
          return 15; // (00) 00000-0000
        case 'rg':
          return 12; // 00.000.000-0
        default:
          return undefined;
      }
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={getPlaceholder()}
          maxLength={getMaxLength()}
          className={cn(className, type === 'cep' && isLoading && 'pr-10')}
        />
        
        {type === 'cep' && isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {type === 'cep' && !isLoading && displayValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }
);

FormattedInput.displayName = 'FormattedInput';
