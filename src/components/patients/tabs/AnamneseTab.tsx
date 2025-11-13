import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Heart, Activity, Pill, Cigarette, Wine, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnamneseTabProps {
  patient: any;
}

export function AnamneseTab({ patient }: AnamneseTabProps) {
  const hasHighRiskConditions = patient.has_cardiovascular_disease || 
    patient.has_diabetes || 
    patient.has_bleeding_disorder || 
    patient.has_hiv;

  return (
    <div className="space-y-6">
      {/* Alerta de Alto Risco */}
      {hasHighRiskConditions && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            Paciente com condições de saúde que requerem atenção especial
          </AlertDescription>
        </Alert>
      )}

      {/* Doenças Sistêmicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Doenças Sistêmicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patient.has_systemic_disease ? (
            <div className="space-y-3">
              <Badge variant="destructive">Possui doenças sistêmicas</Badge>
              {patient.systemic_diseases && patient.systemic_diseases.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {patient.systemic_diseases.map((disease: string, index: number) => (
                    <Badge key={index} variant="outline">{disease}</Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma doença sistêmica reportada</p>
          )}
        </CardContent>
      </Card>

      {/* Condições Cardiovasculares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Condições Cardiovasculares
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Doenças Cardiovasculares</label>
            <p className="text-lg">
              {patient.has_cardiovascular_disease ? (
                <Badge variant="destructive">Sim</Badge>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
            {patient.cardiovascular_details && (
              <p className="text-sm text-muted-foreground mt-2">{patient.cardiovascular_details}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Hipertensão</label>
            <p className="text-lg">
              {patient.has_hypertension ? (
                <>
                  <Badge variant="destructive">Sim</Badge>
                  {patient.hypertension_controlled !== null && (
                    <Badge className="ml-2" variant={patient.hypertension_controlled ? "success" : "warning"}>
                      {patient.hypertension_controlled ? "Controlada" : "Não Controlada"}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Diabetes</label>
            <p className="text-lg">
              {patient.has_diabetes ? (
                <>
                  <Badge variant="destructive">Sim</Badge>
                  {patient.diabetes_type && (
                    <span className="ml-2 text-sm">Tipo: {patient.diabetes_type}</span>
                  )}
                  {patient.diabetes_controlled !== null && (
                    <Badge className="ml-2" variant={patient.diabetes_controlled ? "success" : "warning"}>
                      {patient.diabetes_controlled ? "Controlada" : "Não Controlada"}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Distúrbios de Coagulação</label>
            <p className="text-lg">
              {patient.has_bleeding_disorder ? (
                <>
                  <Badge variant="destructive">Sim</Badge>
                  {patient.bleeding_disorder_details && (
                    <p className="text-sm text-muted-foreground mt-2">{patient.bleeding_disorder_details}</p>
                  )}
                </>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alergias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alergias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Alergias Gerais</label>
            {patient.has_allergies ? (
              <div className="mt-2 space-y-2">
                <Badge variant="warning">Possui alergias</Badge>
                {patient.allergies_list && patient.allergies_list.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies_list.map((allergy: string, index: number) => (
                      <Badge key={index} variant="outline">{allergy}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem alergias conhecidas</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Alergias a Medicamentos</label>
            {patient.has_medication_allergy ? (
              <div className="mt-2 space-y-2">
                <Badge variant="destructive">Possui alergias medicamentosas</Badge>
                {patient.medication_allergies && patient.medication_allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {patient.medication_allergies.map((med: string, index: number) => (
                      <Badge key={index} variant="destructive">{med}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem alergias medicamentosas conhecidas</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medicamentos em Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicamentos em Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.current_medications && patient.current_medications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.current_medications.map((med: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-base py-1.5">
                  {med}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum medicamento em uso reportado</p>
          )}
        </CardContent>
      </Card>

      {/* Doenças Infectocontagiosas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Doenças Infectocontagiosas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Hepatite</label>
            <p className="text-lg">
              {patient.has_hepatitis ? (
                <>
                  <Badge variant="destructive">Sim</Badge>
                  {patient.hepatitis_type && (
                    <span className="ml-2 text-sm">Tipo: {patient.hepatitis_type}</span>
                  )}
                </>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">HIV</label>
            <p className="text-lg">
              {patient.has_hiv ? (
                <Badge variant="destructive">Sim</Badge>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Tipo Sanguíneo</label>
            <p className="text-lg font-mono">{patient.blood_type || 'Não informado'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Hábitos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cigarette className="h-5 w-5" />
            Hábitos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cigarette className="h-4 w-4" />
              Tabagismo
            </label>
            <p className="text-lg">
              {patient.has_smoking_habit ? (
                <>
                  <Badge variant="warning">Sim</Badge>
                  {patient.smoking_frequency && (
                    <span className="ml-2 text-sm">{patient.smoking_frequency}</span>
                  )}
                </>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wine className="h-4 w-4" />
              Consumo de Álcool
            </label>
            <p className="text-lg">
              {patient.has_alcohol_habit ? (
                <>
                  <Badge variant="warning">Sim</Badge>
                  {patient.alcohol_frequency && (
                    <span className="ml-2 text-sm">{patient.alcohol_frequency}</span>
                  )}
                </>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Condições Especiais (Mulheres) */}
      {(patient.gender === 'feminino' && (patient.is_pregnant || patient.is_breastfeeding)) && (
        <Card>
          <CardHeader>
            <CardTitle>Condições Especiais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {patient.is_pregnant && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gestação</label>
                <p className="text-lg">
                  <Badge variant="warning">Gestante</Badge>
                  {patient.pregnancy_trimester && (
                    <span className="ml-2 text-sm">{patient.pregnancy_trimester}º Trimestre</span>
                  )}
                </p>
              </div>
            )}
            {patient.is_breastfeeding && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amamentação</label>
                <p className="text-lg">
                  <Badge variant="info">Amamentando</Badge>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
