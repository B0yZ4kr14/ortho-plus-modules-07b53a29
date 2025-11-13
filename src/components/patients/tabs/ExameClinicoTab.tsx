import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Droplet, Scale, Ruler, Smile, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ExameClinicoTabProps {
  patient: any;
}

export function ExameClinicoTab({ patient }: ExameClinicoTabProps) {
  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-info' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-success' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-warning' };
    return { label: 'Obesidade', color: 'text-destructive' };
  };

  const bmiCategory = getBMICategory(patient.bmi);

  const getBPStatus = (systolic: number | null, diastolic: number | null) => {
    if (!systolic || !diastolic) return null;
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-success' };
    if (systolic < 130 && diastolic < 85) return { label: 'Elevada', color: 'text-info' };
    if (systolic < 140 || diastolic < 90) return { label: 'Hipertensão Estágio 1', color: 'text-warning' };
    return { label: 'Hipertensão Estágio 2', color: 'text-destructive' };
  };

  const bpStatus = getBPStatus(patient.blood_pressure_systolic, patient.blood_pressure_diastolic);

  return (
    <div className="space-y-6">
      {/* Queixa Principal */}
      {patient.main_complaint && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Queixa Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg italic">"{patient.main_complaint}"</p>
            {patient.pain_level !== null && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Nível de Dor (0-10)
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <Progress value={patient.pain_level * 10} className="flex-1" />
                  <span className="text-2xl font-bold">{patient.pain_level}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sinais Vitais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sinais Vitais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Pressão Arterial
            </label>
            {patient.blood_pressure_systolic && patient.blood_pressure_diastolic ? (
              <div className="mt-2">
                <p className="text-3xl font-bold font-mono">
                  {patient.blood_pressure_systolic}/{patient.blood_pressure_diastolic}
                </p>
                <p className="text-sm text-muted-foreground">mmHg</p>
                {bpStatus && (
                  <Badge className={`mt-2 ${bpStatus.color}`} variant="outline">
                    {bpStatus.label}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não medido</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Frequência Cardíaca
            </label>
            {patient.heart_rate ? (
              <div className="mt-2">
                <p className="text-3xl font-bold font-mono">{patient.heart_rate}</p>
                <p className="text-sm text-muted-foreground">bpm</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não medido</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Tipo Sanguíneo
            </label>
            {patient.blood_type ? (
              <div className="mt-2">
                <p className="text-3xl font-bold font-mono">{patient.blood_type}</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não informado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medidas Antropométricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Medidas Antropométricas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Peso
            </label>
            {patient.weight_kg ? (
              <div className="mt-2">
                <p className="text-3xl font-bold">{patient.weight_kg}</p>
                <p className="text-sm text-muted-foreground">kg</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não medido</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Altura
            </label>
            {patient.height_cm ? (
              <div className="mt-2">
                <p className="text-3xl font-bold">{patient.height_cm}</p>
                <p className="text-sm text-muted-foreground">cm</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não medido</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">IMC</label>
            {patient.bmi ? (
              <div className="mt-2">
                <p className="text-3xl font-bold">{patient.bmi.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">kg/m²</p>
                {bmiCategory && (
                  <Badge className={`mt-2 ${bmiCategory.color}`} variant="outline">
                    {bmiCategory.label}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não calculado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Avaliação Bucal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5" />
            Avaliação Bucal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Qualidade da Higiene Oral
            </label>
            {patient.oral_hygiene_quality ? (
              <div className="mt-2">
                <Badge 
                  variant={
                    patient.oral_hygiene_quality === 'excelente' ? 'default' :
                    patient.oral_hygiene_quality === 'boa' ? 'secondary' :
                    patient.oral_hygiene_quality === 'regular' ? 'outline' :
                    'destructive'
                  }
                  className="text-base py-1.5"
                >
                  {patient.oral_hygiene_quality}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não avaliado</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Condição Gengival
            </label>
            {patient.gum_condition ? (
              <div className="mt-2">
                <Badge 
                  variant={
                    patient.gum_condition === 'saudavel' ? 'default' :
                    patient.gum_condition === 'gengivite' ? 'outline' :
                    'destructive'
                  }
                  className="text-base py-1.5"
                >
                  {patient.gum_condition}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Não avaliado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações Clínicas */}
      {patient.clinical_observations && (
        <Card>
          <CardHeader>
            <CardTitle>Observações Clínicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{patient.clinical_observations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
