import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useOdontogramaStore } from '../hooks/useOdontogramaStore';
import {
  ToothStatus,
  TOOTH_STATUS_COLORS,
  TOOTH_STATUS_LABELS,
  UPPER_RIGHT_TEETH,
  UPPER_LEFT_TEETH,
  LOWER_LEFT_TEETH,
  LOWER_RIGHT_TEETH,
} from '../types/odontograma.types';
import { Loader2 } from 'lucide-react';

interface ToothMeshProps {
  position: [number, number, number];
  toothNumber: number;
  status: ToothStatus;
  selectedStatus: ToothStatus;
  onToothClick: (toothNumber: number) => void;
}

function ToothMesh({ position, toothNumber, status, selectedStatus, onToothClick }: ToothMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = TOOTH_STATUS_COLORS[status];
  const isExtraido = status === 'extraido';

  return (
    <group position={position}>
      {/* Corpo do dente - formato cônico realista */}
      <mesh
        ref={meshRef}
        onClick={() => onToothClick(toothNumber)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.3, 0.4, 1.2, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={hovered ? '#4444ff' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.3}
          metalness={isExtraido ? 0.8 : 0.1}
        />
      </mesh>

      {/* Coroa do dente */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.2}
          metalness={isExtraido ? 0.8 : 0.1}
        />
      </mesh>

      {/* Raiz do dente */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <coneGeometry args={[0.25, 0.6, 16]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.4}
          metalness={isExtraido ? 0.8 : 0.1}
        />
      </mesh>

      {/* Número do dente */}
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.25}
        color={isExtraido ? '#ffffff' : '#1e293b'}
        anchorX="center"
        anchorY="middle"
      >
        {String(toothNumber)}
      </Text>

      {/* Indicador de hover */}
      {hovered && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#4444ff" />
        </mesh>
      )}
    </group>
  );
}

interface Odontograma3DProps {
  prontuarioId: string;
}

export const Odontograma3D = ({ prontuarioId }: Odontograma3DProps) => {
  const {
    teethData,
    isLoading,
    updateToothStatus,
    resetOdontograma,
    getStatusCount,
  } = useOdontogramaStore(prontuarioId);

  const [selectedStatus, setSelectedStatus] = useState<ToothStatus>('higido');

  const handleToothClick = (toothNumber: number) => {
    updateToothStatus(toothNumber, selectedStatus);
    toast.success(`Dente ${toothNumber} marcado como ${TOOTH_STATUS_LABELS[selectedStatus]}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Carregando odontograma...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selecione o Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[]).map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
                />
                {TOOTH_STATUS_LABELS[status]}
              </Button>
            ))}
            <Button variant="destructive" onClick={resetOdontograma}>
              Resetar Odontograma
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Odontograma 3D Interativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] bg-slate-50 rounded-lg border border-border">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[0, 5, 12]} />
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={8}
                maxDistance={25}
              />

              {/* Iluminação */}
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <pointLight position={[-10, 5, -10]} intensity={0.5} />
              <spotLight
                position={[0, 15, 0]}
                angle={0.3}
                penumbra={1}
                intensity={0.5}
                castShadow
              />

              <Suspense fallback={null}>
                {/* Arcada Superior Direita */}
                {UPPER_RIGHT_TEETH.map((num, idx) => (
                  <ToothMesh
                    key={num}
                    position={[-7 + idx * 1.2, 2, 2]}
                    toothNumber={num}
                    status={teethData[num]?.status || 'higido'}
                    selectedStatus={selectedStatus}
                    onToothClick={handleToothClick}
                  />
                ))}

                {/* Arcada Superior Esquerda */}
                {UPPER_LEFT_TEETH.map((num, idx) => (
                  <ToothMesh
                    key={num}
                    position={[0.5 + idx * 1.2, 2, 2]}
                    toothNumber={num}
                    status={teethData[num]?.status || 'higido'}
                    selectedStatus={selectedStatus}
                    onToothClick={handleToothClick}
                  />
                ))}

                {/* Arcada Inferior Esquerda */}
                {LOWER_LEFT_TEETH.map((num, idx) => (
                  <ToothMesh
                    key={num}
                    position={[0.5 + idx * 1.2, -2, 2]}
                    toothNumber={num}
                    status={teethData[num]?.status || 'higido'}
                    selectedStatus={selectedStatus}
                    onToothClick={handleToothClick}
                  />
                ))}

                {/* Arcada Inferior Direita */}
                {LOWER_RIGHT_TEETH.map((num, idx) => (
                  <ToothMesh
                    key={num}
                    position={[-7 + idx * 1.2, -2, 2]}
                    toothNumber={num}
                    status={teethData[num]?.status || 'higido'}
                    selectedStatus={selectedStatus}
                    onToothClick={handleToothClick}
                  />
                ))}

                {/* Base/Gengiva */}
                <mesh position={[0, 0, 1.5]} receiveShadow>
                  <boxGeometry args={[18, 5, 1]} />
                  <meshStandardMaterial color="#ffb3ba" roughness={0.8} />
                </mesh>

                {/* Labels */}
                <Text position={[-4, 3.5, 2]} fontSize={0.4} color="#64748b">
                  Superior Direito
                </Text>
                <Text position={[4, 3.5, 2]} fontSize={0.4} color="#64748b">
                  Superior Esquerdo
                </Text>
                <Text position={[4, -3.5, 2]} fontSize={0.4} color="#64748b">
                  Inferior Esquerdo
                </Text>
                <Text position={[-4, -3.5, 2]} fontSize={0.4} color="#64748b">
                  Inferior Direito
                </Text>
              </Suspense>

              {/* Grid de referência */}
              <gridHelper args={[20, 20, '#cccccc', '#eeeeee']} position={[0, -4, 0]} />
            </Canvas>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Controles:</strong> Clique nos dentes para marcar o status selecionado. 
              Use o mouse para rotacionar (arrastar), aproximar/afastar (scroll) e mover (botão direito + arrastar) a visualização.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[]).map(status => (
              <div key={status} className="text-center">
                <Badge variant="outline" className="w-full justify-center mb-2">
                  {TOOTH_STATUS_LABELS[status]}
                </Badge>
                <p className="text-2xl font-bold">{getStatusCount(status)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
