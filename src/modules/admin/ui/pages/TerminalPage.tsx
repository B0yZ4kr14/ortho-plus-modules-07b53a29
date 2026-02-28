import { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, History } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CommandHistory {
  command: string;
  output: string;
  exitCode: number;
  timestamp: Date;
}

export default function TerminalPage() {
  const { clinicId } = useAuth();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async () => {
    if (!command.trim() || !clinicId) return;

    setIsExecuting(true);
    const currentCommand = command;
    setCommand('');

    try {
      const { data, error } = await supabase.functions.invoke('execute-command', {
        body: { command: currentCommand }
      });

      if (error) throw error;

      setHistory(prev => [...prev, {
        command: currentCommand,
        output: data.output || '',
        exitCode: data.exitCode || 0,
        timestamp: new Date()
      }]);

      if (data.exitCode !== 0) {
        toast.error('Comando falhou');
      } else {
        toast.success('Comando executado');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setHistory(prev => [...prev, {
        command: currentCommand,
        output: `Error: ${errorMessage}`,
        exitCode: 1,
        timestamp: new Date()
      }]);
      toast.error('Erro ao executar comando');
    } finally {
      setIsExecuting(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('Histórico limpo');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      executeCommand();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Terminal Shell"
        description="Execute comandos shell seguros com whitelist de comandos permitidos"
        icon={Terminal}
      />

      <Card>
        <CardHeader>
          <CardTitle>Console Interativo</CardTitle>
          <CardDescription>
            Comandos permitidos: ls, pwd, whoami, date, uptime, df, free, ps, git status, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terminal Output */}
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
            <ScrollArea className="h-[400px]" ref={scrollRef}>
              <div className="space-y-3">
                <div className="text-green-400">
                  Ortho+ Terminal Shell v1.0 - DEMO MODE
                </div>
                <div className="text-muted-foreground">
                  Digite 'help' para ver comandos disponíveis
                </div>
                <div className="border-t border-border my-2" />

                {history.map((entry, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">$</span>
                      <span className="text-foreground">{entry.command}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={entry.exitCode === 0 ? 'text-green-400' : 'text-red-400'}>
                      <pre className="whitespace-pre-wrap break-words">{entry.output}</pre>
                    </div>
                    {entry.exitCode !== 0 && (
                      <div className="text-yellow-400 text-xs">
                        Exit code: {entry.exitCode}
                      </div>
                    )}
                  </div>
                ))}

                {isExecuting && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="animate-pulse">Executando...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Command Input */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-2">
              <span className="text-blue-400 font-mono">$</span>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite um comando..."
                className="border-0 bg-transparent focus-visible:ring-0 font-mono"
                disabled={isExecuting}
              />
            </div>
            <Button 
              onClick={executeCommand} 
              disabled={!command.trim() || isExecuting}
            >
              <Send className="h-4 w-4 mr-2" />
              Executar
            </Button>
            <Button 
              variant="outline" 
              onClick={clearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* Command Suggestions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['ls -la', 'pwd', 'date', 'uptime', 'git status', 'git log --oneline'].map((cmd) => (
              <Button
                key={cmd}
                variant="secondary"
                size="sm"
                onClick={() => setCommand(cmd)}
                className="font-mono text-xs justify-start"
              >
                {cmd}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Comandos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {history.length === 0 ? (
              <p>Nenhum comando executado ainda</p>
            ) : (
              <p>{history.length} comando(s) executado(s) nesta sessão</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
