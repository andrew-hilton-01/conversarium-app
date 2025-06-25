import { ReactFlowProvider, ReactFlow, Background, Controls, MiniMap} from '@xyflow/react';
import { useState, useEffect, useCallback } from 'react';
import '@xyflow/react/dist/style.css';
import Nav from './Nav';

// Custom node component
import { Handle, Position } from '@xyflow/react';

const ConvoNode = ({ data }) => {
  const color = data.stageColor || '#6b7280';

  return (
    <div
      className="px-4 py-3 border-2 rounded-lg bg-slate-800 text-white min-w-[200px] max-w-[300px]"
      style={{ borderColor: color }}
    >
      {/* handles - bidirectional */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: color }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-out"
        style={{ background: color, left: '60%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: color }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-in"
        style={{ background: color, left: '60%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: color }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-out"
        style={{ background: color, top: '60%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: color }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-in"
        style={{ background: color, top: '60%' }}
      />

      {/* node body */}
      <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-300">
        <span>#{data.order_index}</span>
        {data.difficulty && (
          <span className={`px-2 py-1 rounded bg-opacity-80 ${{
            1: 'bg-green-500',
            2: 'bg-yellow-500',
            3: 'bg-orange-500',
            4: 'bg-red-500',
            5: 'bg-purple-500'
          }[data.difficulty]}`}>
            D{data.difficulty}
          </span>
        )}
      </div>

      <div className="font-medium text-sm mb-1" style={{ color }}>
        {data.name}
      </div>

      <div className="text-xs text-slate-300 line-clamp-3">
        {data.content}
      </div>
    </div>
  );
};

const nodeTypes = {
  convoNode: ConvoNode,
};

export default function Demo() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateStageColors = (stages) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    const stageColorMap = {};
    stages.forEach((stage, index) => {
      stageColorMap[stage.id] = colors[index % colors.length];
    });
    return stageColorMap;
  };

  const layoutNodesByStage = (nodes, stages) => {
    // Group nodes by stage
    const nodesByStage = {};
    stages.forEach(stage => {
      nodesByStage[stage.id] = [];
    });

    nodes.forEach(node => {
      if (nodesByStage[node.stage_id]) {
        nodesByStage[node.stage_id].push(node);
      }
    });

    // Layout nodes stage by stage
    const layoutedNodes = [];
    const stageHeight = 250;
    const nodeWidth = 320;
    const nodeSpacing = 50;

    stages.forEach((stage, stageIndex) => {
      const stageNodes = nodesByStage[stage.id] || [];
      const stageY = stageIndex * stageHeight + 100;
      
      // Calculate total width needed for this stage
      const totalWidth = stageNodes.length * nodeWidth + (stageNodes.length - 1) * nodeSpacing;
      const startX = Math.max(100, (window.innerWidth - totalWidth) / 2);

      stageNodes.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * (nodeWidth + nodeSpacing);
        layoutedNodes.push({
          ...node,
          position: { x, y: stageY }
        });
      });
    });

    return layoutedNodes;
  };

  const loadConvoGraph = useCallback(async () => {
    try {
      const response = await fetch('/convograph.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setStages(data.stages || []);
      
      // Create stage color mapping
      const stageColorMap = generateStageColors(data.stages || []);

      // Process nodes
      const processedNodes = (data.nodes || []).map((node) => {
        const stageColor = stageColorMap[node.stage_id] || '#6b7280';
        
        return {
          id: node.id,
          type: 'convoNode',
          stage_id: node.stage_id,
          data: {
            ...node,
            name: node.meta?.name || node.node_type?.replace('_', ' '),
            stageColor
          }
        };
      });

  const determineHandles = (sourceId, targetId, isIntraStage, nodes) => {
    if (!isIntraStage) {
      // Inter-stage: always vertical flow
      return { sourceHandle: 'bottom', targetHandle: 'top' };
    }
    
    // Intra-stage: determine direction based on node positions
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (sourceNode && targetNode) {
      if (sourceNode.position.x < targetNode.position.x) {
        // Source is to the left of target
        return { sourceHandle: 'right', targetHandle: 'left' };
      } else {
        // Source is to the right of target
        return { sourceHandle: 'left-out', targetHandle: 'right-in' };
      }
    }
    
    // Default fallback
    return { sourceHandle: 'right', targetHandle: 'left' };
  };

      // Layout nodes by stage
      const layoutedNodes = layoutNodesByStage(processedNodes, data.stages || []);

      // Process edges - clean and validate with bidirectional intra-stage detection
      const validEdges = [];
      
      (data.edges || []).forEach((edge, index) => {
        const sourceId = edge.from_node;
        const targetId = edge.to_node;
        
        if (sourceId && targetId && typeof sourceId === 'string' && typeof targetId === 'string' && sourceId.length > 0 && targetId.length > 0) {
          const isIntraStage = edge.meta?.edge_type === 'intra_stage';
          const handles = determineHandles(sourceId, targetId, isIntraStage, layoutedNodes);
          
          validEdges.push({
            id: `edge-${sourceId}-${targetId}-${index}`,
            source: sourceId,
            target: targetId,
            type: 'bezier',
            sourceHandle: handles.sourceHandle,
            targetHandle: handles.targetHandle,
            style: {
              stroke: isIntraStage ? '#f59e0b' : '#64748b',
              strokeWidth: 2,
            },
            markerEnd: {
              type: 'arrowclosed',
              color: isIntraStage ? '#f59e0b' : '#64748b',
            }
          });
        }
      });
      
      setNodes(layoutedNodes);
      setEdges(validEdges);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConvoGraph();
  }, [loadConvoGraph]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading conversation graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ Error loading graph</div>
          <p className="text-slate-300">{error}</p>
          <button 
            onClick={loadConvoGraph}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <Nav />

      {/* React Flow Graph */}
      <ReactFlowProvider>
        <div className="h-[calc(100vh-8rem)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-950"
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background 
              color="#1e293b" 
              gap={20} 
              size={1}
              variant="dots"
            />
            <Controls 
              className="bg-slate-800 border-slate-600 text-white"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>

      {/* Control Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/80 border-t border-slate-700/50 p-4 flex justify-center gap-4 backdrop-blur">
        <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
          🎤 Enable Mic
        </button>
        <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors">
          ▶️ Start Flow
        </button>
        <button 
          onClick={loadConvoGraph}
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Reload Graph
        </button>
      </div>
    </div>
  );
}