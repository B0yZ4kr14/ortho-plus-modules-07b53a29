import { useCallback, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng, toSvg } from 'html-to-image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertCircle, Lock, Play, RotateCcw, Filter, Zap, Download, Image as ImageIcon, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ModuleData {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  is_subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  blocking_dependencies: string[];
}

interface ModuleDependencyGraphProps {
  modules?: ModuleData[];
}

interface SimulationState {
  active: boolean;
  targetModule: string | null;
  targetAction: 'activate' | 'deactivate' | null;
  affectedModules: Set<string>;
  wouldBlock: string[];
  wouldEnable: string[];
}

// Custom Node Component with Simulation Support
function ModuleNode({ data }: NodeProps) {
  const module = data.module as ModuleData;
  const isSimulated = data.isSimulated as boolean;
  const isAffected = data.isAffected as boolean;
  const simulatedActive = data.simulatedActive as boolean;
  const isTarget = data.isTarget as boolean;
  
  const getStatusColor = () => {
    if (isTarget) return 'bg-primary/20 border-primary ring-2 ring-primary';
    if (isAffected) return 'bg-warning/20 border-warning ring-2 ring-warning';
    if (!module.is_subscribed) return 'bg-muted border-muted-foreground/30';
    
    const active = isSimulated ? simulatedActive : module.is_active;
    if (active) return 'bg-success/10 border-success';
    return 'bg-background border-muted-foreground/50';
  };

  const getStatusIcon = () => {
    if (!module.is_subscribed) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    
    const active = isSimulated ? simulatedActive : module.is_active;
    if (active) return <CheckCircle2 className="h-4 w-4 text-success" />;
    return <XCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const hasBlockers = module.unmet_dependencies.length > 0 && !module.is_active;

  return (
    <Card 
      className={cn(
        "min-w-[200px] p-3 transition-all hover:shadow-lg border-2",
        getStatusColor()
      )}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-primary !w-2 !h-2"
      />
      
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm leading-tight text-foreground">
              {module.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {module.description}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {isTarget && (
            <Badge className="text-xs h-5 bg-primary">
              <Zap className="h-3 w-3 mr-1" />
              Simulando
            </Badge>
          )}
          
          {isAffected && !isTarget && (
            <Badge className="text-xs h-5 bg-warning text-warning-foreground">
              Afetado
            </Badge>
          )}
          
          <Badge 
            variant={(isSimulated ? simulatedActive : module.is_active) ? 'default' : 'secondary'}
            className="text-xs h-5"
          >
            {(isSimulated ? simulatedActive : module.is_active) ? 'Ativo' : 'Inativo'}
          </Badge>
          
          {!module.is_subscribed && (
            <Badge variant="outline" className="text-xs h-5">
              Não contratado
            </Badge>
          )}
          
          {hasBlockers && (
            <Badge variant="outline" className="text-xs h-5 text-destructive border-destructive/50">
              <Lock className="h-3 w-3 mr-1" />
              Bloqueado
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs h-5 bg-muted">
            {module.category}
          </Badge>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-primary !w-2 !h-2"
      />
    </Card>
  );
}

const nodeTypes = {
  moduleNode: ModuleNode,
};

function ModuleDependencyGraphContent({ modules = [] }: ModuleDependencyGraphProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNodes } = useReactFlow();
  
  // Ensure modules is always an array
  const safeModules = Array.isArray(modules) ? modules : [];
  
  const [simulationState, setSimulationState] = useState<SimulationState>({
    active: false,
    targetModule: null,
    targetAction: null,
    affectedModules: new Set(),
    wouldBlock: [],
    wouldEnable: [],
  });

  const [filters, setFilters] = useState({
    category: 'all',
    hideUnsubscribed: false,
  });

  // Get unique categories
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(safeModules.map(m => m.category)))];
  }, [safeModules]);

  // Filter modules based on filters
  const filteredModules = useMemo(() => {
    return safeModules.filter(module => {
      if (filters.hideUnsubscribed && !module.is_subscribed) return false;
      if (filters.category !== 'all' && module.category !== filters.category) return false;
      return true;
    });
  }, [modules, filters]);

  // Calculate cascade impact of toggling a module
  const calculateImpact = useCallback((moduleKey: string, action: 'activate' | 'deactivate') => {
    const affected = new Set<string>();
    const wouldBlock: string[] = [];
    const wouldEnable: string[] = [];

    const module = safeModules.find(m => m.module_key === moduleKey);
    if (!module) return { affected, wouldBlock, wouldEnable };

    if (action === 'deactivate') {
      // Find all modules that depend on this one
      safeModules.forEach(m => {
        if (m.is_active && m.unmet_dependencies.includes(moduleKey)) {
          wouldBlock.push(m.module_key);
          affected.add(m.module_key);
        }
        if (m.is_active && m.blocking_dependencies.includes(moduleKey)) {
          wouldBlock.push(m.module_key);
          affected.add(m.module_key);
        }
      });
    } else {
      // If activating, check what would become available
      safeModules.forEach(m => {
        if (!m.is_active && m.unmet_dependencies.includes(moduleKey)) {
          // Check if this is the ONLY missing dependency
          const otherDeps = m.unmet_dependencies.filter(d => d !== moduleKey);
          const otherDepsActive = otherDeps.every(dep => 
            safeModules.find(mod => mod.module_key === dep)?.is_active
          );
          
          if (otherDepsActive) {
            wouldEnable.push(m.module_key);
            affected.add(m.module_key);
          }
        }
      });
    }

    return { affected, wouldBlock, wouldEnable };
  }, [safeModules]);

  // Start simulation
  const startSimulation = useCallback((moduleKey: string) => {
    const module = safeModules.find(m => m.module_key === moduleKey);
    if (!module || !module.is_subscribed) return;

    const action = module.is_active ? 'deactivate' : 'activate';
    const impact = calculateImpact(moduleKey, action);

    setSimulationState({
      active: true,
      targetModule: moduleKey,
      targetAction: action,
      affectedModules: impact.affected,
      wouldBlock: impact.wouldBlock,
      wouldEnable: impact.wouldEnable,
    });
  }, [safeModules, calculateImpact]);

  // Clear simulation
  const clearSimulation = useCallback(() => {
    setSimulationState({
      active: false,
      targetModule: null,
      targetAction: null,
      affectedModules: new Set(),
      wouldBlock: [],
      wouldEnable: [],
    });
  }, []);

  // Create nodes with simulation support
  const initialNodes: Node[] = useMemo(() => {
    const categoryPositions: Record<string, number> = {};
    const categories = Array.from(new Set(filteredModules.map(m => m.category)));
    const categorySpacing = 400;
    const nodeSpacing = 180;
    
    return filteredModules.map((module) => {
      const category = module.category;
      
      if (!(category in categoryPositions)) {
        categoryPositions[category] = 0;
      }
      
      const categoryIndex = categories.indexOf(category);
      const positionInCategory = categoryPositions[category];
      
      categoryPositions[category]++;
      
      const x = categoryIndex * categorySpacing;
      const y = positionInCategory * nodeSpacing;

      const isTarget = simulationState.targetModule === module.module_key;
      const isAffected = simulationState.affectedModules.has(module.module_key);
      const simulatedActive = isTarget 
        ? simulationState.targetAction === 'activate'
        : module.is_active;
      
      return {
        id: module.module_key,
        type: 'moduleNode',
        position: { x, y },
        data: { 
          module,
          label: module.name,
          isSimulated: simulationState.active,
          isAffected,
          isTarget,
          simulatedActive,
        },
      };
    });
  }, [filteredModules, simulationState]);

  // Create edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    const moduleKeys = new Set(filteredModules.map(m => m.module_key));
    
    filteredModules.forEach(module => {
      module.unmet_dependencies.forEach(depKey => {
        if (!moduleKeys.has(depKey)) return;
        
        const depModule = safeModules.find(m => m.module_key === depKey);
        if (depModule) {
          const isAffected = simulationState.affectedModules.has(module.module_key) || 
                           simulationState.affectedModules.has(depKey);
          
          edges.push({
            id: `${depKey}-${module.module_key}`,
            source: depKey,
            target: module.module_key,
            type: 'smoothstep',
            animated: !depModule.is_active || isAffected,
            style: { 
              stroke: isAffected 
                ? 'hsl(var(--warning))' 
                : depModule.is_active ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
              strokeWidth: isAffected ? 3 : 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isAffected 
                ? 'hsl(var(--warning))' 
                : depModule.is_active ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
            },
            label: depModule.is_active ? '' : 'Requer',
            labelStyle: {
              fill: 'hsl(var(--destructive))',
              fontSize: 10,
              fontWeight: 600,
            },
            labelBgStyle: {
              fill: 'hsl(var(--background))',
              fillOpacity: 0.9,
            },
          });
        }
      });
      
      module.blocking_dependencies.forEach(blockingKey => {
        if (!moduleKeys.has(blockingKey)) return;
        
        const blockingModule = safeModules.find(m => m.module_key === blockingKey);
        if (blockingModule) {
          const edgeExists = edges.some(
            e => e.source === module.module_key && e.target === blockingKey
          );
          
          if (!edgeExists) {
            const isAffected = simulationState.affectedModules.has(module.module_key) || 
                             simulationState.affectedModules.has(blockingKey);
            
            edges.push({
              id: `${module.module_key}-${blockingKey}`,
              source: module.module_key,
              target: blockingKey,
              type: 'smoothstep',
              animated: isAffected,
              style: { 
                stroke: isAffected ? 'hsl(var(--warning))' : 'hsl(var(--primary))',
                strokeWidth: isAffected ? 3 : 2,
                strokeDasharray: '5,5',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isAffected ? 'hsl(var(--warning))' : 'hsl(var(--primary))',
              },
            });
          }
        }
      });
    });
    
    return edges;
  }, [filteredModules, modules, simulationState]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const module = node.data.module as ModuleData;
    if (!module.is_subscribed) return;
    
    if (simulationState.active && simulationState.targetModule === module.module_key) {
      clearSimulation();
    } else {
      startSimulation(module.module_key);
    }
  }, [simulationState, startSimulation, clearSimulation]);

  // Export functions
  const downloadImage = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.setAttribute('download', filename);
    a.setAttribute('href', dataUrl);
    a.click();
  };

  const exportToPng = useCallback(async () => {
    if (!reactFlowWrapper.current) return;

    try {
      toast.info('Preparando exportação...', { description: 'Gerando imagem PNG' });
      
      const dataUrl = await toPng(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        quality: 1,
        pixelRatio: 2, // Higher quality
      });

      downloadImage(dataUrl, `grafo-modulos-${new Date().toISOString().split('T')[0]}.png`);
      toast.success('Grafo exportado!', { description: 'Imagem PNG baixada com sucesso.' });
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      toast.error('Erro ao exportar', { description: 'Não foi possível gerar a imagem PNG.' });
    }
  }, [reactFlowWrapper]);

  const exportToSvg = useCallback(async () => {
    if (!reactFlowWrapper.current) return;

    try {
      toast.info('Preparando exportação...', { description: 'Gerando imagem SVG' });
      
      const dataUrl = await toSvg(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
      });

      downloadImage(dataUrl, `grafo-modulos-${new Date().toISOString().split('T')[0]}.svg`);
      toast.success('Grafo exportado!', { description: 'Imagem SVG baixada com sucesso.' });
    } catch (error) {
      console.error('Error exporting to SVG:', error);
      toast.error('Erro ao exportar', { description: 'Não foi possível gerar a imagem SVG.' });
    }
  }, [reactFlowWrapper]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredModules.length;
    const active = filteredModules.filter(m => m.is_active).length;
    const subscribed = filteredModules.filter(m => m.is_subscribed).length;
    const blocked = filteredModules.filter(m => m.unmet_dependencies.length > 0 && !m.is_active).length;
    
    return { total, active, subscribed, blocked };
  }, [filteredModules]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Todas as categorias' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              checked={filters.hideUnsubscribed} 
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hideUnsubscribed: checked }))}
            />
            <Label className="text-sm cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, hideUnsubscribed: !prev.hideUnsubscribed }))}>
              Ocultar não contratados
            </Label>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{stats.active}</strong> ativos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{stats.blocked}</strong> bloqueados
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {simulationState.active && (
            <Button variant="outline" size="sm" onClick={clearSimulation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar Simulação
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToPng} className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Exportar como PNG
                <span className="ml-auto text-xs text-muted-foreground">Alta qualidade</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToSvg} className="gap-2">
                <FileCode className="h-4 w-4" />
                Exportar como SVG
                <span className="ml-auto text-xs text-muted-foreground">Vetorial</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Simulation Alert */}
      {simulationState.active && (
        <Alert className="mx-4 mt-4 border-warning bg-warning/10">
          <Play className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <strong>Simulação Ativa:</strong> {simulationState.targetAction === 'activate' ? 'Ativando' : 'Desativando'}{' '}
            <strong>{safeModules.find(m => m.module_key === simulationState.targetModule)?.name}</strong>
            {simulationState.wouldBlock.length > 0 && (
              <span className="block mt-1 text-destructive">
                ⚠️ Bloquearia: {simulationState.wouldBlock.map(key => safeModules.find(m => m.module_key === key)?.name).join(', ')}
              </span>
            )}
            {simulationState.wouldEnable.length > 0 && (
              <span className="block mt-1 text-success">
                ✓ Habilitaria: {simulationState.wouldEnable.map(key => safeModules.find(m => m.module_key === key)?.name).join(', ')}
              </span>
            )}
            <span className="block mt-2 text-xs text-muted-foreground">
              Clique no módulo novamente para sair da simulação
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
          className="bg-background"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls className="bg-card border-border" />
          <MiniMap 
            nodeColor={(node) => {
              const module = node.data.module as ModuleData;
              const isTarget = node.data.isTarget as boolean;
              const isAffected = node.data.isAffected as boolean;
              
              if (isTarget) return 'hsl(var(--primary))';
              if (isAffected) return 'hsl(var(--warning))';
              if (!module.is_subscribed) return 'hsl(var(--muted))';
              if (module.is_active) return 'hsl(var(--success))';
              return 'hsl(var(--muted-foreground))';
            }}
            className="bg-card border-border"
            maskColor="hsl(var(--background) / 0.6)"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-success" />
            <span>Dependência atendida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-destructive animate-pulse" />
            <span>Dependência não atendida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-warning animate-pulse" />
            <span>Impacto da simulação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-primary" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 3px, transparent 3px, transparent 6px)' }} />
            <span>É requerido por</span>
          </div>
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            <span>Clique em um módulo para simular ativação/desativação</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export function ModuleDependencyGraph(props: ModuleDependencyGraphProps) {
  return (
    <ReactFlowProvider>
      <ModuleDependencyGraphContent {...props} />
    </ReactFlowProvider>
  );
}