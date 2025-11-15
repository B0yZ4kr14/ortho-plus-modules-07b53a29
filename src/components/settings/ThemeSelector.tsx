import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';
import { clinicalThemes, applyClinicalTheme, getClinicalTheme, ClinicalTheme } from '@/themes/clinical';

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<ClinicalTheme>(getClinicalTheme());

  const handleThemeChange = (theme: ClinicalTheme) => {
    setSelectedTheme(theme);
    applyClinicalTheme(theme);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tema Clínico</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Escolha o tema visual que melhor se adapta ao ambiente da sua clínica
      </p>

      <RadioGroup value={selectedTheme} onValueChange={handleThemeChange as (value: string) => void}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(clinicalThemes).map(([key, theme]) => (
            <Label
              key={key}
              htmlFor={key}
              className="cursor-pointer"
            >
              <Card
                className={`
                  p-4 transition-all hover:shadow-md relative
                  ${selectedTheme === key ? 'ring-2 ring-primary' : ''}
                `}
              >
                {selectedTheme === key && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <RadioGroupItem value={key} id={key} />
                  <span className="font-medium">{theme.name}</span>
                </div>

                {/* Preview de cores */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ background: theme.background }}
                      title="Background"
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ background: theme.primary }}
                      title="Primary"
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">Odontograma:</div>
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ background: theme.odontograma.higido }}
                      title="Hígido"
                    />
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ background: theme.odontograma.carie }}
                      title="Cárie"
                    />
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ background: theme.odontograma.tratado }}
                      title="Tratado"
                    />
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ background: theme.odontograma.implante }}
                      title="Implante"
                    />
                  </div>
                </div>
              </Card>
            </Label>
          ))}
        </div>
      </RadioGroup>
    </Card>
  );
}
