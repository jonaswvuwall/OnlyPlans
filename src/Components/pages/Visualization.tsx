import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { FC } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

// Define the structure for an activity from createPlan
interface PlanActivity {
  id: string;
  referenceNumber: number;
  activityName: string;
  dauer: string;
  vorgaengerid: string;
}

// Enhanced activity with network plan calculations
interface NetworkActivity extends PlanActivity {
  duration: number;                // Parsed duration
  predecessors: number[];          // Array of predecessor reference numbers
  faz: number;                     // Earliest Start Time
  fez: number;                     // Earliest Finish Time
  saz: number;                     // Latest Start Time
  sez: number;                     // Latest Finish Time
  totalFloat: number;              // Total Float
  freeFloat: number;               // Free Float
  isCritical: boolean;             // On critical path
}

// Position interface for draggable nodes
interface NodePosition {
  x: number;
  y: number;
}

interface NetworkPlanData {
  planName: string;
  planDescription: string;
  activities: PlanActivity[];
}

const Visualization: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const visualizationRef = useRef<HTMLDivElement>(null);
  const [networkActivities, setNetworkActivities] = useState<NetworkActivity[]>([]);
  const [planData, setPlanData] = useState<NetworkPlanData | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedNodeId: string | null;
    startPos: { x: number; y: number };
    startMousePos: { x: number; y: number };
  }>({
    isDragging: false,
    draggedNodeId: null,
    startPos: { x: 0, y: 0 },
    startMousePos: { x: 0, y: 0 }
  });

  useEffect(() => {
    const state = location.state as NetworkPlanData;
    if (state && state.activities) {
      setPlanData(state);
      const calculatedActivities = calculateNetworkPlan(state.activities);
      setNetworkActivities(calculatedActivities);
      
      // Initialize node positions with grid layout
      const positions = new Map<string, NodePosition>();
      calculatedActivities.forEach((activity, index) => {
        const spacing = 300;
        const x = 150 + (index % 4) * spacing;
        const y = 150 + Math.floor(index / 4) * 280;
        positions.set(activity.id, { x, y });
      });
      setNodePositions(positions);
    }
  }, [location.state]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element)?.closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Drag event handlers
  const handleMouseDown = (event: React.MouseEvent, nodeId: string) => {
    event.preventDefault();
    const svgRect = (event.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect();
    if (!svgRect) return;

    const currentPos = nodePositions.get(nodeId);
    if (!currentPos) return;

    setDragState({
      isDragging: true,
      draggedNodeId: nodeId,
      startPos: { x: currentPos.x, y: currentPos.y },
      startMousePos: { 
        x: event.clientX - svgRect.left, 
        y: event.clientY - svgRect.top 
      }
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedNodeId) return;

    const svgRect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const currentMousePos = {
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top
    };

    const deltaX = currentMousePos.x - dragState.startMousePos.x;
    const deltaY = currentMousePos.y - dragState.startMousePos.y;

    const newPos = {
      x: dragState.startPos.x + deltaX,
      y: dragState.startPos.y + deltaY
    };

    // Constrain to viewbox bounds
    const nodeSize = 200;
    const maxX = 1600 - nodeSize/2;
    const maxY = 800 - nodeSize/2;
    newPos.x = Math.max(nodeSize/2, Math.min(maxX, newPos.x));
    newPos.y = Math.max(nodeSize/2, Math.min(maxY, newPos.y));

    setNodePositions(prev => new Map(prev.set(dragState.draggedNodeId!, newPos)));
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      draggedNodeId: null,
      startPos: { x: 0, y: 0 },
      startMousePos: { x: 0, y: 0 }
    });
  };

  // Export functions
  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!visualizationRef.current || !planData) return;
    
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const canvas = await html2canvas(visualizationRef.current, {
        backgroundColor: '#1e1b4b',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: visualizationRef.current.scrollHeight,
        width: visualizationRef.current.scrollWidth
      });
      
      switch (format) {
        case 'png': {
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `${planData.planName}_network_plan.png`);
            }
          });
          break;
        }
          
        case 'jpg': {
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `${planData.planName}_network_plan.jpg`);
            }
          }, 'image/jpeg', 0.95);
          break;
        }
          
        case 'pdf': {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const imgWidth = pdf.internal.pageSize.getWidth();
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // If the content is too tall, scale it down to fit on one page
          if (imgHeight > pdf.internal.pageSize.getHeight()) {
            const scale = pdf.internal.pageSize.getHeight() / imgHeight;
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;
            const x = (pdf.internal.pageSize.getWidth() - scaledWidth) / 2;
            const y = (pdf.internal.pageSize.getHeight() - scaledHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
          } else {
            const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
            pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
          }
          
          pdf.save(`${planData.planName}_network_plan.pdf`);
          break;
        }
      }
    } catch (error) {
      console.error(`Error exporting as ${format.toUpperCase()}:`, error);
      const errorKey = `visualization.exportErrors.${format}Failed`;
      alert(t(errorKey));
    } finally {
      setIsExporting(false);
    }
  };

  // Get node position (either from state or default grid position)
  const getNodePosition = (activity: NetworkActivity, index: number): NodePosition => {
    const savedPos = nodePositions.get(activity.id);
    if (savedPos) return savedPos;
    
    // Default grid position
    const spacing = 300;
    return {
      x: 150 + (index % 4) * spacing,
      y: 150 + Math.floor(index / 4) * 280
    };
  };

  // Calculate network plan (CPM - Critical Path Method)
  const calculateNetworkPlan = (activities: PlanActivity[]): NetworkActivity[] => {
    const networkActivities: NetworkActivity[] = activities.map(activity => ({
      ...activity,
      duration: parseInt(activity.dauer) || 0,
      predecessors: activity.vorgaengerid 
        ? activity.vorgaengerid.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
        : [],
      faz: 0,
      fez: 0,
      saz: 0,
      sez: 0,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false
    }));

    // Sort activities by reference number to ensure proper processing order
    networkActivities.sort((a, b) => a.referenceNumber - b.referenceNumber);

    // FORWARD PASS - Calculate EAS/EAF
    // EAS = Earliest Activity Start
    // EAF = Earliest Activity Finish = EAS + Duration
    networkActivities.forEach(activity => {
      if (activity.predecessors.length === 0) {
        // Starting activity without predecessors
        activity.faz = 0;
      } else {
        // EAS = Maximum of all EAF of predecessors
        activity.faz = Math.max(...activity.predecessors.map(predId => {
          const predecessor = networkActivities.find(a => a.referenceNumber === predId);
          return predecessor ? predecessor.fez : 0;
        }));
      }
      // EAF = EAS + Duration of activity
      activity.fez = activity.faz + activity.duration;
    });

    // Project end = Maximum of all EAF values
    const projectEndTime = Math.max(...networkActivities.map(a => a.fez));

    // BACKWARD PASS - Calculate LAS/LAF
    // LAF = Latest Activity Finish
    // LAS = Latest Activity Start = LAF - Duration
    const reversedActivities = [...networkActivities].reverse();
    
    reversedActivities.forEach(activity => {
      // Find all successors (activities that have this activity as predecessor)
      const successors = networkActivities.filter(successor => 
        successor.predecessors.includes(activity.referenceNumber)
      );

      if (successors.length === 0) {
        // End activity without successors - LAF = Project end
        activity.sez = projectEndTime;
      } else {
        // LAF = Minimum of all LAS of successors
        activity.sez = Math.min(...successors.map(successor => successor.saz));
      }
      // LAS = LAF - Duration of activity
      activity.saz = activity.sez - activity.duration;
    });

    // BUFFER TIMES AND CRITICAL PATH
    networkActivities.forEach(activity => {
      // Total float = LAS - EAS = LAF - EAF
      activity.totalFloat = activity.saz - activity.faz;
      
      // Critical path: Activities without buffer time (Buffer time = 0)
      activity.isCritical = activity.totalFloat === 0;
      
      // Calculate free float
      const successors = networkActivities.filter(successor => 
        successor.predecessors.includes(activity.referenceNumber)
      );
      
      if (successors.length === 0) {
        // End activity: Free float = Total float
        activity.freeFloat = activity.totalFloat;
      } else {
        // Free float = Minimum(EAS of all successors) - EAF
        const minSuccessorFAZ = Math.min(...successors.map(s => s.faz));
        activity.freeFloat = Math.max(0, minSuccessorFAZ - activity.fez);
      }
    });

    // Sort back to original order
    return networkActivities.sort((a, b) => a.referenceNumber - b.referenceNumber);
  };

  // Render network node
  // Render network node according to German BWL standards
  const renderNetworkNode = (activity: NetworkActivity, index: number) => {
    const nodeSize = 200;
    const position = getNodePosition(activity, index);
    const isDragging = dragState.draggedNodeId === activity.id;

    return (
      <g 
        key={activity.id} 
        transform={`translate(${position.x}, ${position.y})`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => handleMouseDown(e, activity.id)}
      >
        {/* Enhanced shadow with multiple layers */}
        <rect
          x={-nodeSize/2 + 6}
          y={-nodeSize/2 + 6}
          width={nodeSize}
          height={nodeSize}
          fill="rgba(0, 0, 0, 0.3)"
          rx="12"
          opacity="0.8"
        />
        <rect
          x={-nodeSize/2 + 3}
          y={-nodeSize/2 + 3}
          width={nodeSize}
          height={nodeSize}
          fill="rgba(0, 0, 0, 0.2)"
          rx="12"
          opacity="0.6"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`nodeGradient-${activity.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {activity.isCritical ? (
              <>
                <stop offset="0%" stopColor="#fef2f2" />
                <stop offset="50%" stopColor="#fee2e2" />
                <stop offset="100%" stopColor="#fecaca" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </>
            )}
          </linearGradient>
          <linearGradient id={`borderGradient-${activity.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {activity.isCritical ? (
              <>
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f87171" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#94a3b8" />
              </>
            )}
          </linearGradient>
        </defs>
        
        {/* Main node rectangle with enhanced styling */}
        <rect
          x={-nodeSize/2}
          y={-nodeSize/2}
          width={nodeSize}
          height={nodeSize}
          fill={`url(#nodeGradient-${activity.id})`}
          stroke={`url(#borderGradient-${activity.id})`}
          strokeWidth={activity.isCritical ? "3" : "2"}
          rx="12"
          filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
        />
        
        {/* Inner glow effect */}
        <rect
          x={-nodeSize/2 + 2}
          y={-nodeSize/2 + 2}
          width={nodeSize - 4}
          height={nodeSize - 4}
          fill="none"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
          rx="10"
          opacity="0.7"
        />
        
        {/* Enhanced quadrant separators with subtle styling */}
        <line
          x1={-nodeSize/2 + 10}
          y1={0}
          x2={nodeSize/2 - 10}
          y2={0}
          stroke={activity.isCritical ? "#dc2626" : "#475569"}
          strokeWidth="1.5"
          opacity="0.8"
        />
        <line
          x1={0}
          y1={-nodeSize/2 + 10}
          x2={0}
          y2={nodeSize/2 - 10}
          stroke={activity.isCritical ? "#dc2626" : "#475569"}
          strokeWidth="1.5"
          opacity="0.8"
        />
        
        {/* Process Step circle with enhanced styling */}
        <circle
          cx={0}
          cy={-nodeSize/2 + 20}
          r="15"
          fill={activity.isCritical ? "#dc2626" : "#475569"}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
        />
        <text
          x={0}
          y={-nodeSize/2 + 27}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          {activity.referenceNumber}
        </text>
        
        {/* Duration badge with modern styling */}
        <rect
          x={-25}
          y={-8}
          width={50}
          height={16}
          fill={activity.isCritical ? "#dc2626" : "#475569"}
          rx="8"
          opacity="0.9"
        />
        <text
          x={0}
          y={3}
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="bold"
        >
          D={activity.duration}
        </text>
        
        {/* Enhanced ES (top-left quadrant) - Earliest Start */}
        <rect
          x={-nodeSize/2 + 5}
          y={-nodeSize/2 + 35}
          width={nodeSize/2 - 10}
          height={nodeSize/2 - 15}
          fill="rgba(255, 255, 255, 0.1)"
          rx="6"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.5"
        />
        <text
          x={-nodeSize/4}
          y={-nodeSize/4 - 5}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#475569"}
          fontSize="9"
          fontWeight="600"
          opacity="0.8"
        >
          ES
        </text>
        <text
          x={-nodeSize/4}
          y={-nodeSize/4 + 12}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1e293b"}
          fontSize="16"
          fontWeight="bold"
        >
          {activity.faz}
        </text>
        
        {/* Enhanced EF (top-right quadrant) - Earliest Finish */}
        <rect
          x={5}
          y={-nodeSize/2 + 35}
          width={nodeSize/2 - 10}
          height={nodeSize/2 - 15}
          fill="rgba(255, 255, 255, 0.1)"
          rx="6"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.5"
        />
        <text
          x={nodeSize/4}
          y={-nodeSize/4 - 5}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#475569"}
          fontSize="9"
          fontWeight="600"
          opacity="0.8"
        >
          EF
        </text>
        <text
          x={nodeSize/4}
          y={-nodeSize/4 + 12}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1e293b"}
          fontSize="16"
          fontWeight="bold"
        >
          {activity.fez}
        </text>
        
        {/* Enhanced LS (bottom-left quadrant) - Latest Start */}
        <rect
          x={-nodeSize/2 + 5}
          y={15}
          width={nodeSize/2 - 10}
          height={nodeSize/2 - 15}
          fill="rgba(255, 255, 255, 0.1)"
          rx="6"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.5"
        />
        <text
          x={-nodeSize/4}
          y={nodeSize/4 - 5}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#475569"}
          fontSize="9"
          fontWeight="600"
          opacity="0.8"
        >
          LS
        </text>
        <text
          x={-nodeSize/4}
          y={nodeSize/4 + 12}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1e293b"}
          fontSize="16"
          fontWeight="bold"
        >
          {activity.saz}
        </text>
        
        {/* Enhanced LF (bottom-right quadrant) - Latest Finish */}
        <rect
          x={5}
          y={15}
          width={nodeSize/2 - 10}
          height={nodeSize/2 - 15}
          fill="rgba(255, 255, 255, 0.1)"
          rx="6"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.5"
        />
        <text
          x={nodeSize/4}
          y={nodeSize/4 - 5}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#475569"}
          fontSize="9"
          fontWeight="600"
          opacity="0.8"
        >
          LF
        </text>
        <text
          x={nodeSize/4}
          y={nodeSize/4 + 12}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1e293b"}
          fontSize="16"
          fontWeight="bold"
        >
          {activity.sez}
        </text>
        
        {/* Enhanced Activity name below the node */}
        <rect
          x={-nodeSize/2 + 10}
          y={nodeSize/2 + 15}
          width={nodeSize - 20}
          height={20}
          fill={activity.isCritical ? "rgba(220, 38, 38, 0.1)" : "rgba(71, 85, 105, 0.1)"}
          rx="10"
          stroke={activity.isCritical ? "rgba(220, 38, 38, 0.3)" : "rgba(71, 85, 105, 0.3)"}
          strokeWidth="1"
        />
        <text
          x={0}
          y={nodeSize/2 + 29}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1e293b"}
          fontSize="11"
          fontWeight="600"
        >
          {activity.activityName.length > 18 ? activity.activityName.substring(0, 18) + '...' : activity.activityName}
        </text>
        
        {/* Enhanced Buffer information */}
        <rect
          x={-nodeSize/2 + 20}
          y={nodeSize/2 + 40}
          width={nodeSize - 40}
          height={16}
          fill={activity.totalFloat === 0 ? "rgba(220, 38, 38, 0.2)" : "rgba(34, 197, 94, 0.2)"}
          rx="8"
          stroke={activity.totalFloat === 0 ? "rgba(220, 38, 38, 0.4)" : "rgba(34, 197, 94, 0.4)"}
          strokeWidth="1"
        />
        <text
          x={0}
          y={nodeSize/2 + 52}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#64748b"}
          fontSize="9"
          fontWeight="500"
        >
          TF: {activity.totalFloat} | FF: {activity.freeFloat}
        </text>
      </g>
    );
  };

  // Render connections between nodes
  const renderConnections = () => {
    const nodeSize = 200;
    
    const connections: React.ReactElement[] = [];
    
    networkActivities.forEach((activity, index) => {
      activity.predecessors.forEach(predId => {
        const predIndex = networkActivities.findIndex(a => a.referenceNumber === predId);
        
        if (predIndex === -1) {
          return;
        }
        
        // Get dynamic positions
        const predecessorActivity = networkActivities[predIndex];
        const startPos = getNodePosition(predecessorActivity, predIndex);
        const endPos = getNodePosition(activity, index);
        
        // Calculate connection points (edge of nodes)
        const startX = startPos.x + nodeSize/2;
        const startY = startPos.y;
        const endX = endPos.x - nodeSize/2;
        const endY = endPos.y;
        
        const predecessor = networkActivities[predIndex];
        const isCriticalPath = activity.isCritical && predecessor.isCritical;
        
        connections.push(
          <g key={`${predId}-${activity.referenceNumber}`}>
            {/* Connection line with glow effect for critical path */}
            {isCriticalPath && (
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#dc2626"
                strokeWidth="8"
                opacity="0.3"
              />
            )}
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={isCriticalPath ? "#dc2626" : "#8b5cf6"}
              strokeWidth={isCriticalPath ? "4" : "3"}
              markerEnd={`url(#arrowhead-${isCriticalPath ? 'critical' : 'normal'})`}
              opacity={isCriticalPath ? "1" : "0.8"}
            />
          </g>
        );
      });
    });
    
    return connections;
  };

  const criticalPath = networkActivities.filter(a => a.isCritical);
  const projectDuration = Math.max(...networkActivities.map(a => a.fez));

  return (
    <Layout>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mx-auto px-4 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full max-w-none">
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6">
            {t('visualization.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {planData ? `${t('visualization.project')}: ${planData.planName}` : t('visualization.subtitle')}
          </p>
                
          {/* Visualization Container with ref */}
          <div ref={visualizationRef} className="visualization-container">

          {/* Project Statistics */}
          {networkActivities.length > 0 && (
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="text-4xl mb-2">⏱️</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('visualization.statistics.projectDuration')}</h3>
                  <p className="text-3xl font-bold text-green-400">{projectDuration}</p>
                  <p className="text-sm text-green-200">{t('visualization.statistics.days')}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('visualization.statistics.criticalPath')}</h3>
                  <p className="text-3xl font-bold text-red-400">{criticalPath.length}</p>
                  <p className="text-sm text-red-200">{t('visualization.statistics.criticalActivities')}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="text-4xl mb-2">📋</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('visualization.statistics.totalActivities')}</h3>
                  <p className="text-3xl font-bold text-blue-400">{networkActivities.length}</p>
                  <p className="text-sm text-blue-200">{t('visualization.statistics.activities')}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Network Plan Visualization */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            {networkActivities.length > 0 ? (
              <>
                {/* Export Button */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={isExporting}
                      className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                    >
                      <Download size={18} />
                      {isExporting ? t('visualization.exporting') : t('visualization.exportPlan')}
                      {!isExporting && (
                        <span className="ml-1 text-sm">▼</span>
                      )}
                    </Button>
                    
                    {/* Export Options Dropdown */}
                    {showExportMenu && !isExporting && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden z-50 shadow-xl">
                        <button
                          onClick={() => handleExport('png')}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 flex items-center gap-3"
                        >
                          <span className="text-lg">📸</span>
                          <div>
                            <div className="font-medium">{t('visualization.exportOptions.png.title')}</div>
                            <div className="text-xs text-white/60">{t('visualization.exportOptions.png.description')}</div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport('jpg')}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 flex items-center gap-3"
                        >
                          <span className="text-lg">🖼️</span>
                          <div>
                            <div className="font-medium">{t('visualization.exportOptions.jpg.title')}</div>
                            <div className="text-xs text-white/60">{t('visualization.exportOptions.jpg.description')}</div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport('pdf')}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                        >
                          <span className="text-lg">📄</span>
                          <div>
                            <div className="font-medium">{t('visualization.exportOptions.pdf.title')}</div>
                            <div className="text-xs text-white/60">{t('visualization.exportOptions.pdf.description')}</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-8 mb-6 text-sm">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-700 rounded shadow-lg"></div>
                    <span className="text-white font-medium">{t('visualization.legend.criticalPath')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded shadow-lg"></div>
                    <span className="text-white font-medium">{t('visualization.legend.normalActivity')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-700 rounded shadow-lg"></div>
                    <span className="text-white font-medium">{t('visualization.legend.bufferGreaterZero')}</span>
                  </div>
                </div>

                {/* Network Plan SVG */}
                <div className="overflow-x-auto bg-white/5 rounded-xl p-8 border border-white/10 w-full">
                  <svg 
                    width={Math.max(1600, (networkActivities.length % 4) * 300 + 600)} 
                    height={Math.max(800, Math.ceil(networkActivities.length / 4) * 280 + 400)}
                    className="mx-auto"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0.1) 70%)' }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Arrow marker definitions */}
                    <defs>
                      {/* Critical path arrow */}
                      <marker
                        id="arrowhead-critical"
                        markerWidth="16"
                        markerHeight="12"
                        refX="15"
                        refY="6"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 16 6, 0 12"
                          fill="#dc2626"
                        />
                      </marker>
                      {/* Normal arrow */}
                      <marker
                        id="arrowhead-normal"
                        markerWidth="16"
                        markerHeight="12"
                        refX="15"
                        refY="6"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 16 6, 0 12"
                          fill="#8b5cf6"
                        />
                      </marker>
                    </defs>
                    
                    {/* Render connections first (so they appear behind nodes) */}
                    {renderConnections()}
                    
                    {/* Render nodes */}
                    {networkActivities.map((activity, index) => renderNetworkNode(activity, index))}
                  </svg>
                </div>

                {/* Activity Details Table */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4">{t('visualization.table.title')}</h3>
                  <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20 bg-purple-600/20">
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.no')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.activity')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.duration')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.es')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.ef')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.ls')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.lf')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.tf')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.ff')}</th>
                          <th className="text-left text-white p-4 font-semibold">{t('visualization.table.headers.critical')}</th>
                        </tr>
                        <tr className="border-b border-white/10 bg-white/5 text-xs">
                          <th className="text-left text-white/70 p-2 font-normal"></th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.name')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.days')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.earliestStart')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.earliestFinish')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.latestStart')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.latestFinish')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.totalFloat')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.freeFloat')}</th>
                          <th className="text-left text-white/70 p-2 font-normal">{t('visualization.table.descriptions.critPath')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {networkActivities.map((activity, index) => (
                          <tr 
                            key={activity.id} 
                            className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                              activity.isCritical ? 'bg-red-500/10 hover:bg-red-500/20' : ''
                            } ${index % 2 === 0 ? 'bg-white/2' : ''}`}
                          >
                            <td className="text-white p-4">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                activity.isCritical ? 'bg-red-500 text-white' : 'bg-purple-500 text-white'
                              }`}>
                                {activity.referenceNumber}
                              </span>
                            </td>
                            <td className="text-white p-4 font-medium">{activity.activityName}</td>
                            <td className="text-white p-4">
                              <span className="inline-block bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs">
                                {activity.duration}d
                              </span>
                            </td>
                            <td className="text-white p-4 font-mono text-center">{activity.faz}</td>
                            <td className="text-white p-4 font-mono text-center">{activity.fez}</td>
                            <td className="text-white p-4 font-mono text-center">{activity.saz}</td>
                            <td className="text-white p-4 font-mono text-center">{activity.sez}</td>
                            <td className="text-white p-4 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                activity.totalFloat === 0 ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
                              }`}>
                                {activity.totalFloat}
                              </span>
                            </td>
                            <td className="text-white p-4 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                activity.freeFloat === 0 ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
                              }`}>
                                {activity.freeFloat}
                              </span>
                            </td>
                            <td className="text-white p-4 text-center">
                              {activity.isCritical ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-500/30 text-gray-400 rounded-full text-xs">
                                  -
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Terms explanation */}
                  <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-3">📚 {t('visualization.terms.title')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                      <div>
                        <strong className="text-white">{t('visualization.terms.easEaf.title')}</strong> {t('visualization.terms.easEaf.description')}
                      </div>
                      <div>
                        <strong className="text-white">{t('visualization.terms.lasLaf.title')}</strong> {t('visualization.terms.lasLaf.description')}
                      </div>
                      <div>
                        <strong className="text-white">{t('visualization.terms.totalFloat.title')}</strong> {t('visualization.terms.totalFloat.description')}
                      </div>
                      <div>
                        <strong className="text-white">{t('visualization.terms.criticalPath.title')}</strong> {t('visualization.terms.criticalPath.description')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critical Path Details */}
                {criticalPath.length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-2xl">🔥</div>
                      <h4 className="text-xl font-semibold text-white">{t('visualization.criticalPathDetails.title')}</h4>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        {criticalPath.map((activity, index) => (
                          <div key={activity.id} className="flex items-center">
                            <div className="bg-red-500 text-white px-3 py-1 rounded-lg font-medium text-sm">
                              {activity.referenceNumber}. {activity.activityName}
                            </div>
                            {index < criticalPath.length - 1 && (
                              <div className="mx-2 text-red-400 text-xl font-bold">→</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-red-200">
                        <strong>{t('visualization.criticalPathDetails.importantLabel')}</strong> {t('visualization.criticalPathDetails.importantText')}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('visualization.noData.title')}</h3>
                <p className="text-white/60 mb-6">
                  {t('visualization.noData.description')}
                </p>
                <Button 
                  onClick={() => navigate('/create-plan')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {t('visualization.noData.createButton')}
                </Button>
              </div>
            )}
          </div>
          
          </div> {/* End of visualization container */}
          
          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => navigate('/create-plan')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              ← {t('visualization.backButton')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Visualization;