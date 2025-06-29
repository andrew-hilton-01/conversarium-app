import { ReactFlowProvider, ReactFlow, Background, Controls } from '@xyflow/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import TutorialOverlay from './TutorialOverlay'; // Make sure path is correct
import { Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css'
import { Link } from 'react-router-dom';

// customStyles, pickBestResponse, ConvoNode, nodeTypes remain the same...
const customStyles = `
  .node-available { animation: pulse-glow 2s ease-in-out infinite alternate; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  .node-visited { opacity: 0.7; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
  .node-highlighted { animation: highlight-glow 1s ease-in-out infinite alternate; box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
  @keyframes pulse-glow { 0% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); } 100% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.8); } }
  @keyframes highlight-glow { 0% { box-shadow: 0 0 15px rgba(34, 197, 94, 0.5); } 100% { box-shadow: 0 0 35px rgba(34, 197, 94, 1); } }
  .recording { animation: record-pulse 1s ease-in-out infinite; }
  @keyframes record-pulse { 0% { background-color: #dc2626; } 50% { background-color: #ef4444; } 100% { background-color: #dc2626; } }
`;
const pickBestResponse = (responses = [], similarity) => {
  if (!responses.length) return null;
  const target = Math.max(0, (similarity - 0.5) / 0.5);
  return responses.reduce((best, r) => {
    const d = Math.abs((r.score ?? 0) - target);
    return d < Math.abs((best.score ?? 0) - target) ? r : best;
  });
};
const ConvoNode = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = data.stageColor || '#6b7280';
  const cls = () => {
    let c = 'px-4 py-3 border-2 rounded-lg text-white min-w-[200px] max-w-[300px] flex flex-col relative transition-all duration-300';
    if (data.isVisited) c += ' node-visited bg-slate-800';
    else if (data.isHighlighted) c += ' node-highlighted bg-slate-700';
    else if (data.isAvailable) c += ' node-available bg-slate-800';
    else c += ' bg-slate-900 opacity-50';
    return c;
  };
  return (
    <div className={cls()} style={{ borderColor: color, height: '140px' }} onMouseEnter={()=>setShowTooltip(true)} onMouseLeave={()=>setShowTooltip(false)}>
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
          {data.score !== undefined && <div className="text-xs text-yellow-400">Score: {data.score.toFixed(0)}%</div>}
        </div>
      )}
      <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-300">
        <span>#{data.order_index}</span>
        <div className="flex items-center gap-2">
          {data.difficulty && <span className={`px-2 py-1 rounded bg-opacity-80 ${ {1:'bg-green-500',2:'bg-yellow-500',3:'bg-orange-500',4:'bg-red-500',5:'bg-purple-500'}[data.difficulty] }`}>D{data.difficulty}</span>}
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
  const [showTutorial, setShowTutorial] = useState(true);
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
  const [isDebugMode, setIsDebugMode] = useState(true);
  const [isPracticeComplete, setIsPracticeComplete] = useState(false);
  const [finalNodeId, setFinalNodeId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // ✅ ADD a state to track if the welcome message has been played
  const [hasWelcomed, setHasWelcomed] = useState(false);

  const recognitionRef = useRef(null);
  const workerRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const visitedNodeIdsRef = useRef(visitedNodeIds);
  visitedNodeIdsRef.current = visitedNodeIds;
  const [voices, setVoices] = useState([]);
  const chosenVoiceRef = useRef(null);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  // The 'speak' and other functions remain the same
  // ...
  const speak = useCallback((text) => {
      if (!window.speechSynthesis || !text || !text.trim()) {
          console.log("SpeechSynthesis skipped: Not available or text is empty.");
          return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (chosenVoiceRef.current) {
          u.voice = chosenVoiceRef.current;
      }
      
      let timeoutId;
      const cleanupAndStop = () => {
          clearTimeout(timeoutId);
          setIsSpeaking(false);
      };

      timeoutId = setTimeout(() => {
          console.warn("SpeechSynthesis TIMEOUT: Forcing cleanup.");
          cleanupAndStop();
      }, 10000);

      u.onend = () => {
          console.log("Speech finished normally.");
          cleanupAndStop();
      };

      u.onerror = (e) => {
          console.error("SpeechSynthesis error:", e.error);
          cleanupAndStop();
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(u);
      console.log("Attempting to say:", text, "with voice:", chosenVoiceRef.current?.name);
  }, []);

  // ✅ ADD this useEffect to play the welcome message
  useEffect(() => {
    // This effect runs when the model is ready, the tutorial is closed, and we haven't welcomed the user yet.
    if (isModelReady && !showTutorial && !hasWelcomed) {
      speak("Welcome! The system is ready. Click the microphone to begin when it has appeared.");
      setHasWelcomed(true); // Mark that we've welcomed them so it doesn't repeat.
    }
  }, [isModelReady, showTutorial, hasWelcomed, speak]);

  // ✅ REMOVED the previous speechResumeInterval useEffect

  // ✅ MODIFICATION: Update handleReset to reset the welcome message state
  const handleReset = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setVisitedNodeIds(new Set());
    setTotalScore(0);
    setTranscript('');
    setHighlightedNodeId(null);
    setIsProcessing(false);
    setShowTutorial(true); // Show tutorial again
    setHasWelcomed(false); // Allow welcome message to be played again
  }, []);
  
  // All other functions and useEffects remain unchanged...
  // ... (I've included them all below for a complete file)

  useEffect(() => {
    if (!window.speechSynthesis) return;
    function pickBestVoice(vs) {
      return (
        vs.find(v => v.name.toLowerCase().includes('google') && (v.lang || '').toLowerCase().includes('en-us')) ||
        vs.find(v => (v.lang || '').toLowerCase().includes('en-us')) ||
        vs.find(v => v.name.toLowerCase().includes('google')) ||
        vs[0] ||
        null
      );
    }
    function handleVoicesChanged() {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
      const best = pickBestVoice(vs);
      chosenVoiceRef.current = best;
    }
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const visitNode = useCallback((nodeId, similarity) => {
    if (visitedNodeIdsRef.current.has(nodeId)) return;
    const nodeToVisit = nodesRef.current.find(n => n.id === nodeId);
    if (!nodeToVisit) return;
    const nodeScore = similarity * 100;
    setVisitedNodeIds(prev => new Set([...prev, nodeId]));
    setTotalScore(prev => prev + nodeScore);
    setNodes(curr => curr.map(n => n.id === nodeId ? { ...n, data: { ...n.data, score: nodeScore } } : n));
    setHighlightedNodeId(nodeId);
    setTimeout(() => setHighlightedNodeId(null), 2000);
    const best = pickBestResponse(nodeToVisit.data?.meta?.responses || [], similarity);
    if (best) {
        const responseText = best.response_text || best.meta?.response_text || '';
        if (responseText) {
            speak(responseText);
        }
    }
  }, [speak]);

  const handleNodeClick = useCallback((event, node) => {
    if (!isDebugMode) return;
    visitNode(node.id, 1.0);
  }, [isDebugMode, visitNode]);

  const calculateAvailableNodes = useCallback((nodesToCalc, edgesToCalc, visitedIds) => {
    const visited = new Set(visitedIds);
    const byId = Object.fromEntries(nodesToCalc.map(n => [n.id, n]));
    const normEdges = edgesToCalc.map(e => ({ src: e.source ?? e.from_node, dst: e.target ?? e.to_node }));
    const sameStage = (n1, n2) => String(n1?.stage_id) === String(n2?.stage_id);
    return nodesToCalc.map(node => {
      const incomingPrereqEdges = normEdges.filter(e => String(e.dst) === String(node.id) && byId[e.src] && byId[node.id] && !sameStage(byId[e.src], byId[node.id]));
      const hasGate = incomingPrereqEdges.length > 0;
      const gateOpen = hasGate ? incomingPrereqEdges.some(e => visited.has(String(e.src))) : false;
      const isAvailable = !hasGate || gateOpen;
      return { ...node, data: { ...node.data, isAvailable, isVisited: visited.has(node.id) } };
    });
  }, []);

  useEffect(() => {
    workerRef.current = new Worker('/similarity-worker.js');
    const handleWorkerMessage = (e) => {
      const { type, results } = e.data;
      switch (type) {
        case 'model_loaded':
          setIsModelReady(true);
          break;
        case 'similarity_result': {
          setIsProcessing(false);
          const bestMatch = results[0];
          if (bestMatch && bestMatch.similarity > 0.5 && !visitedNodeIdsRef.current.has(bestMatch.nodeId)) {
            visitNode(bestMatch.nodeId, bestMatch.similarity);
          } else {
            speak("I'm sorry, I didn't quite understand. Could you try rephrasing that?");
          }
          break;
        }
        case 'error':
          setIsProcessing(false);
          break;
      }
    };
    workerRef.current.onmessage = handleWorkerMessage;
    workerRef.current.postMessage({ type: 'init' });
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-US';
      recognition.onresult = (event) => setTranscript(event.results[0][0].transcript);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
      recognitionRef.current = recognition;
    }
    return () => { if (workerRef.current) workerRef.current.terminate(); };
  }, [visitNode, speak]);

  useEffect(() => {
    async function fetchGraphData() {
        setLoading(true); setError(null);
        try {
          const response = await fetch('/convograph.json');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          const loadedNodes = data.nodes || [];
          const loadedEdges = data.edges || [];
          const loadedStages = data.stages || [];
          setStages(loadedStages);
          setRawEdges(loadedEdges);
          setMaxPossibleScore(loadedNodes.length * 100);
          if (loadedNodes.length > 0 && loadedStages.length > 0) {
            const lastStage = loadedStages[loadedStages.length - 1];
            if (lastStage && lastStage.id) {
              const nodesInLastStage = loadedNodes.filter(n => n.stage_id === lastStage.id);
              if (nodesInLastStage.length > 0) {
                nodesInLastStage.sort((a, b) => (parseInt(b.order_index, 10) || 0) - (parseInt(a.order_index, 10) || 0));
                const endNode = nodesInLastStage[0];
                if (endNode && endNode.id) {
                    setFinalNodeId(endNode.id);
                }
              }
            }
          }
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
          const initialNodes = loadedNodes.map((node) => ({
            id: String(node.id), type: 'convoNode', stage_id: node.stage_id,
            data: { ...node, name: node.meta?.name || node.node_type?.replace(/_/g, ' '), stageColor: stageColorMap[node.stage_id] || '#6b7280', isAvailable: false, isVisited: false, isHighlighted: false }
          }));
          const layoutedNodes = layoutNodesByStage(initialNodes, data.stages || []);
          setNodes(layoutedNodes);
          const determineHandles = (sourceId, targetId, isIntraStage, currentNodes) => {
            if (!isIntraStage) return { sourceHandle: 'bottom', targetHandle: 'top' };
            const sourceNode = currentNodes.find(n => n.id === String(sourceId));
            const targetNode = currentNodes.find(n => n.id === String(targetId));
            return (sourceNode && targetNode && sourceNode.position.x < targetNode.position.x) ? { sourceHandle: 'right', targetHandle: 'left' } : { sourceHandle: 'left-out', targetHandle: 'right-in' };
          };
          setEdges(loadedEdges.map((edge, index) => {
            const handles = determineHandles(edge.from_node, edge.to_node, edge.meta?.edge_type === 'intra_stage', layoutedNodes);
            return { id: `e-${edge.from_node}-${edge.to_node}-${index}`, source: String(edge.from_node), target: String(edge.to_node), type: 'step', ...handles, style: { stroke: edge.meta?.edge_type === 'intra_stage' ? 'rgba(0,0,0,0)' : '#64748b', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: edge.meta?.edge_type === 'intra_stage' ? 'rgba(0,0,0,0)' : '#64748b' } };
          }).filter(edge => edge.source && edge.target));
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (transcript.trim()) {
      setIsProcessing(true);
      const availableNodes = nodesRef.current.filter(node =>
        node.data.isAvailable && !visitedNodeIdsRef.current.has(node.id)
      );
      if (availableNodes.length === 0) { setIsProcessing(false); return; }
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'similarity', userInput: transcript, nodes: availableNodes.map(node => ({ id: node.id, content: node.data.content })) });
      }
    }
  }, [transcript]);

  useEffect(() => {
    setNodes(currentNodes => {
      if (currentNodes.length === 0) return currentNodes;
      const visitedStringIds = new Set(Array.from(visitedNodeIds).map(String));
      const updatedNodes = calculateAvailableNodes(currentNodes, rawEdges, visitedStringIds);
      return updatedNodes.map(n => ({...n, data: { ...n.data, isHighlighted: String(n.id) === String(highlightedNodeId) }}));
    });
  }, [visitedNodeIds, highlightedNodeId, rawEdges, calculateAvailableNodes]);

  useEffect(() => {
    if (finalNodeId && visitedNodeIds.has(String(finalNodeId))) {
      setIsPracticeComplete(true);
    } else {
      setIsPracticeComplete(false);
    }
  }, [visitedNodeIds, finalNodeId]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert('Speech recognition not supported');
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      if (isSpeaking) {
        return; 
      }
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };


  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p>Loading conversation graph...</p></div></div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><div className="text-center"><div className="text-red-400 mb-4">⚠️ Error loading graph</div><p className="text-slate-300">{error}</p><button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Retry</button></div></div>;
  
  const progressPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const visitedCount = visitedNodeIds.size;
  const availableCount = nodes.filter(n => n.data.isAvailable && !n.data.isVisited).length;
  
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        <TutorialOverlay show={showTutorial} onClose={handleCloseTutorial} />
        <style>{customStyles}</style>
        {isPracticeComplete && (
            <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                <div className="p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
                    <h2 className="text-3xl font-bold text-green-400 mb-4">Practice Complete!</h2>
                    <p className="text-slate-300 mb-2">You've reached the final objective.</p>
                    <p className="text-lg text-yellow-400 mb-6">Final Score: {progressPercentage.toFixed(1)}%</p>
                    <button onClick={handleReset} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors">Practice Again</button>
                </div>
            </div>
        )}
        <div className="fixed top-0 inset-x-0 bg-slate-900/90 border-b border-slate-700 p-4 backdrop-blur z-40">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center justify-center md:justify-start gap-4">
              
        <Link to="/">
          <div className="flex items-center space-x-2">
            <img
              src="/favicon.ico"
              alt="Conversarium logo"
              className="w-8 h-8"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  style={{marginLeft: '-0.8rem'}}>
                    onversarium</span>
          </div>
        </Link>
              <div className="text-sm text-slate-400">Progress: {visitedCount}/{nodes.length} • {availableCount} available</div>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-4 md:gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-amber-400">
                <input type="checkbox" checked={isDebugMode} onChange={() => setIsDebugMode(prev => !prev)} className="w-4 h-4 rounded text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"/>
                Click-to-Visit
              </label>
              <div className="flex items-center gap-4">
                <div className="text-sm">Score: {progressPercentage.toFixed(1)}%</div>
                <div className="w-32 bg-slate-700 rounded-full h-2"><div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}/></div>
              </div>
            </div>
          </div>
        </div>
        <ReactFlowProvider>
            <div className="h-screen pt-16">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-slate-950"
                    proOptions={{ hideAttribution: true }}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    fitViewOptions={{ padding: 0.2 }}
                    onNodeClick={handleNodeClick}
                >
                    <Background color="#1e293b" gap={20} size={1} variant="dots" />
                </ReactFlow>
                <div style={{ position: "absolute", 
                  left: 16, 
                  bottom: 80, 
                  zIndex: 10, 
                  }}>
                  <Controls />
                </div>
            </div>
        </ReactFlowProvider>
        {!isPracticeComplete && (
          <div className="fixed bottom-0 inset-x-0 bg-slate-900/90 border-t border-slate-700 p-4 backdrop-blur z-40">
            <div className="flex justify-center items-center gap-4">
              <button onClick={toggleRecording} className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isRecording ? 'bg-red-600 hover:bg-red-700 recording' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={isProcessing || !isModelReady || isSpeaking}>
                {isSpeaking ? '🔊 Speaking...' : (isRecording ? '🛑 Stop' : (isModelReady ? '🎤 Record' : '🧠 Loading...'))}
              </button>
              <div className="flex flex-col items-center gap-1 max-w-md">
                {transcript && (<div className="text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded">"{transcript}"</div>)}
                {isProcessing && (<div className="text-xs text-yellow-400 animate-pulse">Processing...</div>)}
              </div>
              <button onClick={handleReset} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">🔄 Reset</button>
            </div>
          </div>
        )}
    </div>
  );
}