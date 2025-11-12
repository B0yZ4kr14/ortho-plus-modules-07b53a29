import { useCallback, useMemo } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  modules: ModuleData[];
}

// Custom Node Component
function ModuleNode({ data }: NodeProps) {
  const module = data.module as ModuleData;
  
  const getStatusColor = () => {
    if (!module.is_subscribed) return 'bg-muted border-muted-foreground/30';
    if (module.is_active) return 'bg-success/10 border-success';
    return 'bg-background border-muted-foreground/50';
  };

  const getStatusIcon = () => {
    if (!module.is_subscribed) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    if (module.is_active) return <CheckCircle2 className="h-4 w-4 text-success" />;
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
          <Badge 
            variant={module.is_active ? 'default' : 'secondary'}
            className="text-xs h-5"
          >
            {module.is_active ? 'Ativo' : 'Inativo'}
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

export function ModuleDependencyGraph({ modules }: ModuleDependencyGraphProps) {
  // Build dependency map from modules
  const dependencyMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    
    modules.forEach(module => {
      // Combine both unmet and blocking to get full dependency picture
      const allDeps = [...module.unmet_dependencies, ...module.blocking_dependencies];
      if (allDeps.length > 0) {
        map[module.module_key] = allDeps;
      }
    });
    
    return map;
  }, [modules]);

  // Create nodes from modules with hierarchical layout
  const initialNodes: Node[] = useMemo(() => {
    const categoryPositions: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    
    // Count modules per category
    modules.forEach(module => {
      categoryCounts[module.category] = (categoryCounts[module.category] || 0) + 1;
    });
    
    const categories = Array.from(new Set(modules.map(m => m.category)));
    const categorySpacing = 400;
    const nodeSpacing = 180;
    
    return modules.map((module, index) => {
      const category = module.category;
      
      if (!(category in categoryPositions)) {
        categoryPositions[category] = 0;
      }
      
      const categoryIndex = categories.indexOf(category);
      const positionInCategory = categoryPositions[category];
      
      categoryPositions[category]++;
      
      const x = categoryIndex * categorySpacing;
      const y = positionInCategory * nodeSpacing;
      
      return {
        id: module.module_key,
        type: 'moduleNode',
        position: { x, y },
        data: { 
          module,
          label: module.name,
        },
      };
    });
  }, [modules]);

  // Create edges from dependencies
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    modules.forEach(module => {
      // For each dependency this module has, create an edge FROM the dependency TO this module
      module.unmet_dependencies.forEach(depKey => {
        const depModule = modules.find(m => m.module_key === depKey);
        if (depModule) {
          edges.push({
            id: `${depKey}-${module.module_key}`,
            source: depKey,
            target: module.module_key,
            type: 'smoothstep',
            animated: !depModule.is_active, // Animate if dependency is not met
            style: { 
              stroke: depModule.is_active ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: depModule.is_active ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
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
      
      // For blocking dependencies (modules that depend on this one)
      module.blocking_dependencies.forEach(blockingKey => {
        const blockingModule = modules.find(m => m.module_key === blockingKey);
        if (blockingModule) {
          // Only add if we haven't already added this edge from unmet_dependencies
          const edgeExists = edges.some(
            e => e.source === module.module_key && e.target === blockingKey
          );
          
          if (!edgeExists) {
            edges.push({
              id: `${module.module_key}-${blockingKey}`,
              source: module.module_key,
              target: blockingKey,
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'hsl(var(--primary))',
              },
            });
          }
        }
      });
    });
    
    return edges;
  }, [modules]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const module = node.data.module as ModuleData;
    console.log('Module clicked:', module);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = modules.length;
    const active = modules.filter(m => m.is_active).length;
    const subscribed = modules.filter(m => m.is_subscribed).length;
    const blocked = modules.filter(m => m.unmet_dependencies.length > 0 && !m.is_active).length;
    
    return { total, active, subscribed, blocked };
  }, [modules]);

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">
              Ativos: <strong className="text-foreground">{stats.active}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Inativos: <strong className="text-foreground">{stats.subscribed - stats.active}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">
              Bloqueados: <strong className="text-foreground">{stats.blocked}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span className="text-sm text-muted-foreground">
              Total: <strong className="text-foreground">{stats.total}</strong>
            </span>
          </div>
        </div>
      </div>

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
            <div className="h-0.5 w-6 bg-primary" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 3px, transparent 3px, transparent 6px)' }} />
            <span>É requerido por</span>
          </div>
        </div>
      </div>
    </div>
  );
}