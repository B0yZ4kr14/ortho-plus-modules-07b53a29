import { Code2, BookOpen, Globe, Lock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ApiDocsPage() {
  const edgeFunctions = [
    {
      name: 'execute-command',
      method: 'POST',
      description: 'Executa comandos shell com whitelist de segurança',
      auth: 'ADMIN',
      endpoint: '/functions/v1/execute-command',
      params: [
        { name: 'command', type: 'string', required: true, description: 'Comando a ser executado' }
      ]
    },
    {
      name: 'get-crypto-rates',
      method: 'GET',
      description: 'Retorna cotações de criptomoedas em tempo real',
      auth: 'PUBLIC',
      endpoint: '/functions/v1/get-crypto-rates',
      params: []
    },
    {
      name: 'db-maintenance',
      method: 'POST',
      description: 'Executa operações de manutenção no banco de dados',
      auth: 'ADMIN',
      endpoint: '/functions/v1/db-maintenance',
      params: [
        { name: 'action', type: 'string', required: true, description: 'VACUUM, ANALYZE ou REINDEX' },
        { name: 'table', type: 'string', required: false, description: 'Nome da tabela (opcional)' }
      ]
    },
    {
      name: 'github-proxy',
      method: 'POST',
      description: 'Proxy para integração com GitHub API',
      auth: 'ADMIN',
      endpoint: '/functions/v1/github-proxy',
      params: [
        { name: 'action', type: 'string', required: false, description: 'Ação a ser executada' }
      ]
    },
    {
      name: 'manual-backup',
      method: 'POST',
      description: 'Cria backup manual do banco de dados',
      auth: 'ADMIN',
      endpoint: '/functions/v1/manual-backup',
      params: [
        { name: 'includeModules', type: 'boolean', required: true },
        { name: 'includePatients', type: 'boolean', required: true },
        { name: 'enableCompression', type: 'boolean', required: true },
        { name: 'enableEncryption', type: 'boolean', required: true }
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="API Documentation"
        description="Documentação completa das Edge Functions e APIs"
        icon={Code2}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BookOpen className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="functions">
            <Globe className="h-4 w-4 mr-2" />
            Edge Functions
          </TabsTrigger>
          <TabsTrigger value="auth">
            <Lock className="h-4 w-4 mr-2" />
            Autenticação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo à API do Ortho+</CardTitle>
              <CardDescription>
                Sistema de APIs RESTful baseado em Supabase Edge Functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="bg-muted px-3 py-1 rounded">
                  https://yxpoqjyfgotkytwtifau.supabase.co/functions/v1
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Autenticação</h3>
                <p className="text-sm text-muted-foreground">
                  Todas as requisições devem incluir o header <code>Authorization: Bearer TOKEN</code>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  100 requisições por minuto por IP
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Response Format</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "data": { ... },
  "error": null
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          {edgeFunctions.map((func) => (
            <Card key={func.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{func.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={func.method === 'GET' ? 'default' : 'secondary'}>
                      {func.method}
                    </Badge>
                    <Badge variant={func.auth === 'ADMIN' ? 'destructive' : 'outline'}>
                      {func.auth}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{func.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Endpoint</h4>
                  <code className="bg-muted px-3 py-1 rounded text-sm">
                    {func.endpoint}
                  </code>
                </div>

                {func.params.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Parâmetros</h4>
                    <div className="space-y-2">
                      {func.params.map((param) => (
                        <div key={param.name} className="border rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-medium">{param.name}</code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {param.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Exemplo de Chamada</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`fetch('${func.endpoint}', {
  method: '${func.method}',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ${func.params.map(p => `${p.name}: ${p.type === 'string' ? '"value"' : p.type === 'boolean' ? 'true' : 'null'}`).join(',\n    ')}
  })
})`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação e Autorização</CardTitle>
              <CardDescription>
                Sistema de autenticação baseado em JWT e RBAC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Obtendo Token</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

const token = data.session.access_token`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Roles</h3>
                <div className="space-y-2">
                  <div className="border rounded p-3">
                    <Badge variant="destructive" className="mb-2">ADMIN</Badge>
                    <p className="text-sm text-muted-foreground">
                      Acesso total a todas as funcionalidades administrativas
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <Badge variant="default" className="mb-2">MEMBER</Badge>
                    <p className="text-sm text-muted-foreground">
                      Acesso padrão às funcionalidades da clínica
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Headers Requeridos</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
