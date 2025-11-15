interface VideoRoomProps {
  token: any;
  appId: any;
  channelName: any;
  uid: any;
  teleconsultaId: any;
  onLeave: () => void;
}

export function VideoRoom({ token, appId, channelName, uid, teleconsultaId, onLeave }: VideoRoomProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-4xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Sala de Vídeo</h2>
        <div className="bg-muted rounded-lg aspect-video flex items-center justify-center mb-4">
          <p className="text-muted-foreground">VideoRoom Component - Em desenvolvimento</p>
        </div>
        <button 
          onClick={onLeave}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
        >
          Sair da Consulta
        </button>
      </div>
    </div>
  );
}
