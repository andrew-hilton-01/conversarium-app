import { ReactFlowProvider, ReactFlow, Background, Controls } from '@xyflow/react';
import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css'

const customStyles = `
  .node-available { animation: pulse-glow 2s ease-in-out infinite alternate; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  .node-visited { opacity: 0.7; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
  .node-highlighted { animation: highlight-glow 1s ease-in-out infinite alternate; box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
  @keyframes pulse-glow { 0% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); } 100% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.8); } }
  @keyframes highlight-glow { 0% { box-shadow: 0 0 15px rgba(34, 197, 94, 0.5); } 100% { box-shadow: 0 0 35px rgba(34, 197, 94, 1); } }
  .recording { animation: record-pulse 1s ease-in-out infinite; }
  @keyframes record-pulse { 0% { background-color: #dc2626; } 50% { background-color: #ef4444; } 100% { background-color: #dc2626; } }
`;

const ConvoNode = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = data.stageColor || '#6b7280';
  const getNodeClassName = () => {
    let c = "px-4 py-3 border-2 rounded-lg text-white min-w-[200px] max-w-[300px] flex flex-col relative transition-all duration-300";
    if (data.isVisited) c += " node-visited bg-slate-800";
    else if (data.isHighlighted) c += " node-highlighted bg-slate-700";
    else if (data.isAvailable) c += " node-available bg-slate-800";
    else c += " bg-slate-900 opacity-50";
    return c;
  };
  return (
    <div className={getNodeClassName()} style={{ borderColor: color, height: '140px' }} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <Handle type="target" position={Position.Top} id="top" style={{ background: color, opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top-out" style={{ background: color, left: '60%', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: color, opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom-in" style={{ background: color, left: '60%', opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: color, opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left-out" style={{ background: color, top: '60%', opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: color, opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right-in" style={{ background: color, top: '60%', opacity: 0 }} />
      {showTooltip && (
        <div className="fixed bg-slate-900 border border-slate-600 rounded-lg p-4 shadow-2xl text-xs pointer-events-none" style={{ zIndex: 9999, left: '50%', top: '20%', transform: 'translateX(-50%)', width: '400px', maxWidth: '90vw' }}>
          <div className="font-medium mb-3 text-sm" style={{ color }}>{data.name} {data.isVisited && '✓'} {data.isAvailable && '🔓'}</div>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-2">{data.content}</div>
          {data.score !== undefined && (<div className="text-xs text-yellow-400">Score: {data.score.toFixed(1)}/10</div>)}
        </div>
      )}
      <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-300">
        <span>#{data.order_index}</span>
        <div className="flex items-center gap-2">
          {data.difficulty && (<span className={`px-2 py-1 rounded bg-opacity-80 ${{1: 'bg-green-500', 2: 'bg-yellow-500', 3: 'bg-orange-500', 4: 'bg-red-500', 5: 'bg-purple-500'}[data.difficulty]}`}>D{data.difficulty}</span>)}
          {data.isVisited && <span className="text-green-400">✓</span>}
          {data.isAvailable && !data.isVisited && <span className="text-blue-400">🔓</span>}
        </div>
      </div>
      <div className="font-medium text-sm mb-2" style={{ color }}>{data.name}</div>
      <div className="text-xs text-slate-300 flex-1 overflow-hidden"><div className="line-clamp-4 leading-relaxed">{data.content}</div></div>
    </div>
  );
};

const nodeTypes = { convoNode: ConvoNode };

export default function Demo() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [visitedNodeIds, setVisitedNodeIds] = useState(new Set());
  const [totalScore, setTotalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [rawEdges, setRawEdges] = useState([]);
  
  const recognitionRef = useRef(null);
  const workerRef = useRef(null);
  
  // Create refs to hold the latest state values to prevent stale closures.
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const visitedNodeIdsRef = useRef(visitedNodeIds);
  visitedNodeIdsRef.current = visitedNodeIds;

  // This master useEffect handles ALL setup and cleanup. It runs only once.
  useEffect(() => {
    workerRef.current = new Worker('/similarity-worker.js');

    const handleWorkerMessage = (e) => {
        const { type, results, message } = e.data;
        switch (type) {
            case 'model_loaded':
                setIsModelReady(true);
                break;
            case 'similarity_result':
                setIsProcessing(false);
                const bestMatch = results[0]; 
                
                // Use the refs to get the CURRENT state inside this handler
                const currentVisitedIds = visitedNodeIdsRef.current;
                const currentNodes = nodesRef.current;

                if (bestMatch && bestMatch.similarity > 0.5 && !currentVisitedIds.has(bestMatch.nodeId)) {
                    const nodeToVisit = currentNodes.find(n => n.id === bestMatch.nodeId);
                    if (!nodeToVisit) return;
                    
                    const baseScore = bestMatch.similarity * 10;
                    const difficultyBonus = (nodeToVisit.data.difficulty || 1) * 2;
                    const nodeScore = Math.min(10, baseScore + difficultyBonus);
                    
                    setVisitedNodeIds(prevIds => new Set([...prevIds, bestMatch.nodeId]));
                    setTotalScore(prevScore => prevScore + nodeScore);
                    setNodes(prevNodes => prevNodes.map(n => n.id === bestMatch.nodeId ? { ...n, data: { ...n.data, score: nodeScore } } : n));
                    setHighlightedNodeId(bestMatch.nodeId);
                    setTimeout(() => setHighlightedNodeId(null), 2000);
                } else {
                    console.log("No confident match found. Best similarity:", bestMatch?.similarity);
                }
                break;
            case 'error':
                console.error('Worker Error:', message);
                setIsProcessing(false);
                break;
        }
    };
    
    workerRef.current.onmessage = handleWorkerMessage;
    workerRef.current.postMessage({ type: 'init' });

    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        setTranscript(event.results[0][0].transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event) => { console.error('Speech recognition error:', event.error); setIsRecording(false); };
      recognitionRef.current = recognition;
    }
    
    return () => {
      if(workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []); // The empty array is CRITICAL. This entire setup runs only once.

  // This useEffect fetches the initial graph data once.
  useEffect(() => {
    async function fetchGraphData() {
        setLoading(true); setError(null);
        try {
          const response = await fetch('/convograph.json');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setStages(data.stages || []);
          const loadedEdges = data.edges || [];
          setRawEdges(loadedEdges);
          setMaxPossibleScore((data.nodes || []).reduce((sum, node) => sum + (10 + (node.meta?.difficulty || 1) * 2), 0));
          const generateStageColors = (stages) => {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'];
            return stages.reduce((acc, stage, index) => { acc[stage.id] = colors[index % colors.length]; return acc; }, {});
          };
          const stageColorMap = generateStageColors(data.stages || []);
          const layoutNodesByStage = (nodesToLayout, stagesToLayout) => {
            const nodesByStage = {}; stagesToLayout.forEach(s => { nodesByStage[s.id] = []; });
            nodesToLayout.forEach(n => { if (nodesByStage[n.stage_id]) nodesByStage[n.stage_id].push(n); });
            const layoutedNodes = [];
            stagesToLayout.forEach((stage, stageIndex) => {
              const stageNodes = nodesByStage[stage.id] || [];
              const totalWidth = stageNodes.length * 320 + (stageNodes.length - 1) * 50;
              const startX = Math.max(100, (window.innerWidth - totalWidth) / 2);
              stageNodes.forEach((node, nodeIndex) => { layoutedNodes.push({ ...node, position: { x: startX + nodeIndex * (320 + 50), y: stageIndex * 250 + 100 } }); });
            });
            return layoutedNodes;
          };
          const initialNodes = (data.nodes || []).map((node) => ({
            id: node.id, type: 'convoNode', stage_id: node.stage_id,
            data: { ...node, name: node.meta?.name || node.node_type?.replace(/_/g, ' '), stageColor: stageColorMap[node.stage_id] || '#6b7280', isAvailable: false, isVisited: false, isHighlighted: false }
          }));
          const layoutedNodes = layoutNodesByStage(initialNodes, data.stages || []);
          setNodes(layoutedNodes);
          const determineHandles = (sourceId, targetId, isIntraStage, currentNodes) => {
            if (!isIntraStage) return { sourceHandle: 'bottom', targetHandle: 'top' };
            const sourceNode = currentNodes.find(n => n.id === sourceId);
            const targetNode = currentNodes.find(n => n.id === targetId);
            return (sourceNode && targetNode && sourceNode.position.x < targetNode.position.x) ? { sourceHandle: 'right', targetHandle: 'left' } : { sourceHandle: 'left-out', targetHandle: 'right-in' };
          };
          setEdges(loadedEdges.map((edge, index) => {
            const handles = determineHandles(edge.from_node, edge.to_node, edge.meta?.edge_type === 'intra_stage', layoutedNodes);
            return { id: `e-${edge.from_node}-${edge.to_node}-${index}`, source: edge.from_node, target: edge.to_node, type: 'step', ...handles, style: { stroke: edge.meta?.edge_type === 'intra_stage' ? 'rgba(0,0,0,0)' : '#64748b', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: edge.meta?.edge_type === 'intra_stage' ? 'rgba(0,0,0,0)' : '#64748b' } };
          }).filter(edge => edge.source && edge.target));
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }
    fetchGraphData();
  }, []);

  // ✅ THIS IS THE CORRECTED EFFECT. It ONLY depends on the transcript.
  useEffect(() => {
    // Ensure the transcript is new and not an empty string from a reset.
    if (transcript.trim()) {
      setIsProcessing(true);

      // Use the refs to get the most current state without causing a dependency loop.
      const currentNodes = nodesRef.current;
      const currentVisitedIds = visitedNodeIdsRef.current;

      const availableNodes = currentNodes.filter(node => 
        node.data.isAvailable && !currentVisitedIds.has(node.id)
      );
      
      if (availableNodes.length === 0) {
        setIsProcessing(false);
        return;
      }

      if (workerRef.current) {
        workerRef.current.postMessage({ 
          type: 'similarity', 
          userInput: transcript, 
          nodes: availableNodes.map(node => ({ id: node.id, content: node.data.content })) 
        });
      }
    }
  }, [transcript]); // ✅ The dependency array is now correct.

  // When visited nodes change, recalculate availability.
  useEffect(() => {
    if (nodes.length === 0) return;
    const sameStage = (n1, n2) => String(n1?.stage_id) === String(n2?.stage_id);
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    const normEdges = rawEdges.map(e => ({ src: e.source ?? e.from_node, dst: e.target ?? e.to_node }));
    
    setNodes(currentNodes => currentNodes.map(node => {
      const visited = new Set(visitedNodeIds);
      const incoming = normEdges.filter(e => String(e.dst) === String(node.id) && byId[e.src] && byId[node.id] && !sameStage(byId[e.src], byId[node.id]));
      const hasGate = incoming.length > 0;
      const gateOpen = incoming.every(e => visited.has(e.src));
      return { ...node, data: { ...node.data, isAvailable: !hasGate || gateOpen, isVisited: visited.has(node.id), isHighlighted: node.id === highlightedNodeId } };
    }));
  }, [visitedNodeIds, highlightedNodeId, rawEdges]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert('Speech recognition not supported');
    if (isRecording) { 
      recognitionRef.current.stop(); 
    } else { 
      setTranscript(''); // Clear old transcript before starting
      recognitionRef.current.start(); 
      setIsRecording(true); 
    }
  };
  
  const handleReset = () => {
    setVisitedNodeIds(new Set()); setTotalScore(0); setTranscript(''); setHighlightedNodeId(null); setIsProcessing(false);
  };
  
  const progressPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const availableCount = nodes.filter(n => n.data.isAvailable && !n.data.isVisited).length;
  const visitedCount = visitedNodeIds.size;
  
  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p>Loading conversation graph...</p></div></div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><div className="text-center"><div className="text-red-400 mb-4">⚠️ Error loading graph</div><p className="text-slate-300">{error}</p><button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Retry</button></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <style>{customStyles}</style>
      <div className="fixed top-0 inset-x-0 bg-slate-900/90 border-b border-slate-700 p-4 backdrop-blur z-50">
        <div className="flex justify-between items-center"><div className="flex items-center gap-4"><h1 className="text-xl font-bold">Conversation Flow</h1><div className="text-sm text-slate-400">Progress: {visitedCount}/{nodes.length} nodes • {availableCount} available</div></div><div className="flex items-center gap-4"><div className="text-sm">Score: {totalScore.toFixed(1)}/{maxPossibleScore.toFixed(1)} ({progressPercentage.toFixed(1)}%)</div><div className="w-32 bg-slate-700 rounded-full h-2"><div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}/></div></div></div>
      </div>
      <ReactFlowProvider>
        <div className="h-[calc(100vh-8rem)] mt-16">
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView className="bg-slate-950" defaultViewport={{ x: 0, y: 0, zoom: 0.8 }} fitViewOptions={{ padding: 0.2 }}>
            <Background color="#1e293b" gap={20} size={1} variant="dots" />
            <Controls showZoom={true} showFitView={true} showInteractive={false} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/90 border-t border-slate-700 p-4 backdrop-blur">
        <div className="flex justify-center items-center gap-4">
          <button onClick={toggleRecording} className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isRecording ? 'bg-red-600 hover:bg-red-700 recording' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={isProcessing || !isModelReady}>
            {isRecording ? '🛑 Stop Recording' : (isModelReady ? '🎤 Start Recording' : '🧠 Model Loading...')}
          </button>
          <div className="flex flex-col items-center gap-1 max-w-md">
            {transcript && (<div className="text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded">"{transcript}"</div>)}
            {isProcessing && (<div className="text-xs text-yellow-400 animate-pulse">Processing speech...</div>)}
          </div>
          <button onClick={handleReset} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">🔄 Reset</button>
        </div>
      </div>
    </div>
  );
}