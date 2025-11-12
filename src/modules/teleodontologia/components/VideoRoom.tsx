import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRoomProps {
  token: string;
  appId: string;
  channelName: string;
  uid: number;
  onLeave: () => void;
}

export const VideoRoom = ({ token, appId, channelName, uid, onLeave }: VideoRoomProps) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // In production, initialize Agora SDK here
    // import AgoraRTC from 'agora-rtc-sdk-ng';
    // const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    const initializeVideo = async () => {
      try {
        toast({
          title: 'Sala de vídeo inicializada',
          description: 'Conectando à videochamada...',
        });

        // Mock video initialization
        console.log('Video room initialized:', {
          token,
          appId,
          channelName,
          uid,
        });

        // In production:
        // await client.join(appId, channelName, token, uid);
        // const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        // const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        // await client.publish([localVideoTrack, localAudioTrack]);
        // localVideoTrack.play(localVideoRef.current);
      } catch (error: any) {
        console.error('Error initializing video:', error);
        toast({
          title: 'Erro na videochamada',
          description: error.message,
          variant: 'destructive',
        });
      }
    };

    initializeVideo();

    return () => {
      // Cleanup: leave channel and unpublish tracks
      // client.leave();
    };
  }, [token, appId, channelName, uid]);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In production: localAudioTrack.setEnabled(!isAudioEnabled);
    toast({
      title: isAudioEnabled ? 'Microfone desligado' : 'Microfone ligado',
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In production: localVideoTrack.setEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? 'Câmera desligada' : 'Câmera ligada',
    });
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // In production:
        // const screenTrack = await AgoraRTC.createScreenVideoTrack();
        // await client.unpublish(localVideoTrack);
        // await client.publish(screenTrack);
        setIsScreenSharing(true);
        toast({
          title: 'Compartilhamento de tela iniciado',
        });
      } else {
        // Stop screen sharing and return to camera
        setIsScreenSharing(false);
        toast({
          title: 'Compartilhamento de tela encerrado',
        });
      }
    } catch (error: any) {
      console.error('Error toggling screen share:', error);
      toast({
        title: 'Erro ao compartilhar tela',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLeave = () => {
    // In production: cleanup tracks and leave channel
    onLeave();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Remote video (main area) */}
      <div className="flex-1 relative bg-muted/50">
        <div
          ref={remoteVideoRef}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="text-center text-muted-foreground">
            <VideoIcon className="h-24 w-24 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aguardando participante...</p>
            <p className="text-sm mt-2">Canal: {channelName}</p>
          </div>
        </div>

        {/* Local video (picture-in-picture) */}
        <Card className="absolute bottom-4 right-4 w-64 h-48 overflow-hidden shadow-xl">
          <div
            ref={localVideoRef}
            className="w-full h-full bg-muted flex items-center justify-center"
          >
            {isVideoEnabled ? (
              <div className="text-muted-foreground text-sm">Sua câmera</div>
            ) : (
              <div className="text-center text-muted-foreground">
                <VideoOff className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">Câmera desligada</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="bg-card border-t p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioEnabled ? 'elevated' : 'destructive'}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full h-14 w-14"
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant={isVideoEnabled ? 'elevated' : 'destructive'}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full h-14 w-14"
          >
            {isVideoEnabled ? (
              <VideoIcon className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'elevated'}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full h-14 w-14"
          >
            <Monitor className="h-6 w-6" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleLeave}
            className="rounded-full h-14 w-14"
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Pressione o botão vermelho para encerrar a chamada</p>
        </div>
      </div>
    </div>
  );
};
