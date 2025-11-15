/**
 * FASE 1 - TASK 1.3: PASSWORD STRENGTH INDICATOR
 * 
 * Componente para indicar visualmente a força da senha
 * Auxilia o usuário a criar senhas fortes conforme política de segurança
 */

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  minimal?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true,
  minimal = false 
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrength>(calculateStrength(''));

  useEffect(() => {
    setStrength(calculateStrength(password));
  }, [password]);

  if (minimal) {
    return (
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded transition-colors ${
              i < strength.score ? strength.color : 'bg-muted'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Barra de força */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded transition-all duration-300 ${
                i < strength.score ? strength.color : 'bg-muted/50'
              }`}
            />
          ))}
        </div>
        
        {/* Label com cor dinâmica */}
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium transition-colors ${getTextColorClass(strength.color)}`}>
            {password.length > 0 ? strength.label : 'Digite uma senha'}
          </p>
          
          {password.length > 0 && strength.score === 4 && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>

      {/* Requisitos */}
      {showRequirements && password.length > 0 && (
        <div className="space-y-1.5 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Requisitos de Segurança
            </p>
          </div>
          
          <ul className="space-y-1">
            <Requirement met={strength.requirements.length}>
              Mínimo 12 caracteres
            </Requirement>
            <Requirement met={strength.requirements.uppercase}>
              Pelo menos uma letra maiúscula (A-Z)
            </Requirement>
            <Requirement met={strength.requirements.lowercase}>
              Pelo menos uma letra minúscula (a-z)
            </Requirement>
            <Requirement met={strength.requirements.number}>
              Pelo menos um número (0-9)
            </Requirement>
            <Requirement met={strength.requirements.symbol}>
              Pelo menos um símbolo (@$!%*?&#)
            </Requirement>
          </ul>
        </div>
      )}

      {/* Dica de segurança */}
      {password.length > 0 && strength.score < 4 && (
        <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
          <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Dica:</strong> Use uma combinação de letras, números e símbolos. 
            Evite sequências óbvias (123, abc) e informações pessoais.
          </p>
        </div>
      )}
    </div>
  );
}

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
      )}
      <span className={met ? 'text-foreground font-medium' : 'text-muted-foreground'}>
        {children}
      </span>
    </li>
  );
}

function calculateStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[@$!%*?&#]/.test(password)
  };

  const metCount = Object.values(requirements).filter(Boolean).length;

  // Cálculo de score baseado em requisitos + comprimento adicional
  let score = 0;
  
  if (metCount === 5) {
    score = 4; // Muito Forte
  } else if (metCount >= 4) {
    score = 3; // Forte
  } else if (metCount >= 3) {
    score = 2; // Média
  } else if (metCount >= 1) {
    score = 1; // Fraca
  }

  // Bonus por comprimento extra (15+ caracteres)
  if (password.length >= 15 && metCount >= 4) {
    score = Math.min(4, score + 1);
  }

  const strengthMap = {
    0: { label: 'Muito Fraca', color: 'bg-red-500 dark:bg-red-600' },
    1: { label: 'Fraca', color: 'bg-orange-500 dark:bg-orange-600' },
    2: { label: 'Média', color: 'bg-yellow-500 dark:bg-yellow-600' },
    3: { label: 'Forte', color: 'bg-lime-500 dark:bg-lime-600' },
    4: { label: 'Muito Forte', color: 'bg-green-500 dark:bg-green-600' }
  };

  const { label, color } = strengthMap[score as keyof typeof strengthMap];

  return { score, label, color, requirements };
}

function getTextColorClass(bgColor: string): string {
  if (bgColor.includes('red')) return 'text-red-600 dark:text-red-400';
  if (bgColor.includes('orange')) return 'text-orange-600 dark:text-orange-400';
  if (bgColor.includes('yellow')) return 'text-yellow-600 dark:text-yellow-400';
  if (bgColor.includes('lime')) return 'text-lime-600 dark:text-lime-400';
  if (bgColor.includes('green')) return 'text-green-600 dark:text-green-400';
  return 'text-muted-foreground';
}
