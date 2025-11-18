import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquare, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Comunicacao() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  return (
    <div className="h-[calc(100vh-4rem)] p-6">
      <h1 className="text-3xl font-bold mb-6">Comunicação com Pacientes</h1>
      
      <Card className="h-[calc(100%-5rem)]">
        <div className="grid grid-cols-12 h-full">
          {/* Conversation List */}
          <div className="col-span-3 border-r p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h2 className="font-semibold">Conversas</h2>
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma conversa disponível</p>
          </div>
          
          {/* Message Thread */}
          <div className="col-span-6 border-r flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Paciente Selecionado</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <p className="text-muted-foreground text-center">Mensagens serão exibidas aqui</p>
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input placeholder="Digite sua mensagem..." />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione uma conversa</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Patient Info */}
          <div className="col-span-3 p-4">
            {selectedConversation ? (
              <div>
                <h3 className="font-semibold mb-4">Informações do Paciente</h3>
                <p className="text-muted-foreground">Dados do paciente serão exibidos aqui</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Selecione uma conversa para ver detalhes</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
