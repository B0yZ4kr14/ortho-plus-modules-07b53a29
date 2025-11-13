import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileImage, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DocumentosTabProps {
  patient: any;
}

export function DocumentosTab({ patient }: DocumentosTabProps) {
  return (
    <div className="space-y-6">
      {/* Consentimentos LGPD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consentimentos e Termos (LGPD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Consentimento LGPD</p>
                <p className="text-sm text-muted-foreground">
                  Uso e tratamento de dados pessoais
                </p>
                {patient.lgpd_consent_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(patient.lgpd_consent_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              {patient.lgpd_consent ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Uso de Imagem</p>
                <p className="text-sm text-muted-foreground">
                  Consentimento para fotos e vídeos
                </p>
              </div>
              {patient.image_usage_consent ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Termo de Tratamento</p>
                <p className="text-sm text-muted-foreground">
                  Consentimento para procedimentos
                </p>
              </div>
              {patient.treatment_consent ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Compartilhamento de Dados</p>
                <p className="text-sm text-muted-foreground">
                  Autorização para compartilhamento
                </p>
              </div>
              {patient.data_sharing_consent ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos e Anexos - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Documentos e Imagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Módulo de documentos em desenvolvimento</p>
            <p className="text-sm mt-2">
              Aqui serão exibidos documentos, imagens radiográficas, fotos e anexos do paciente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
