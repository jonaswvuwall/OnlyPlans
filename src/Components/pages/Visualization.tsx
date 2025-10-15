import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { FC } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import axios from 'axios';

// Define the structure for a backend plan
interface BackendPlan {
  id: number;
  name: string;
  description: string;
}

// Define the structure for a backend activity
interface BackendActivity {
  id: number;
  ref_number: number;
  name: string;
  dauer: number;
  netzplan_id: number;
  vorgaenger?: number[]; // Array of predecessor activity IDs
}

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

// Layout constants for network nodes (reduced size for denser layout)
const NODE_WIDTH = 200;      // previously 280
const NODE_HEIGHT = 155;     // increased slightly to provide more space below LS/LF
const LEVEL_SPACING = 260;   // previously 350
const NODE_VERTICAL_SPACING = 160; // previously 220
const START_X = 120;         // previously 140
const START_Y = 100;         // previously 120

// Enhanced positioning algorithm for cleaner network visualization (uses new constants)
const calculateOptimalPositions = (activities: NetworkActivity[]): Map<string, NodePosition> => {
  const positions = new Map<string, NodePosition>();
  
  // Find critical path activities for special handling
  const criticalActivities = activities.filter(a => a.isCritical);
  const criticalIds = new Set(criticalActivities.map(a => a.id));
  
  // Step 1: Calculate levels (depth from start)
  const activityLevels = new Map<string, number>();
  
  // Helper function to calculate the level of an activity
  const calculateLevel = (activity: NetworkActivity): number => {
    if (activityLevels.has(activity.id)) {
      return activityLevels.get(activity.id)!;
    }
    
    if (activity.predecessors.length === 0) {
      activityLevels.set(activity.id, 0);
      return 0;
    }
    
    let maxPredLevel = -1;
    for (const predRef of activity.predecessors) {
      const predActivity = activities.find(a => a.referenceNumber === predRef);
      if (predActivity) {
        const predLevel = calculateLevel(predActivity);
        maxPredLevel = Math.max(maxPredLevel, predLevel);
      }
    }
    
    const level = maxPredLevel + 1;
    activityLevels.set(activity.id, level);
    return level;
  };
  
  // Calculate levels for all activities
  activities.forEach(activity => calculateLevel(activity));
  
  // Group activities by level
  const activitiesByLevel = new Map<number, NetworkActivity[]>();
  activities.forEach(activity => {
    const level = activityLevels.get(activity.id)!;
    if (!activitiesByLevel.has(level)) {
      activitiesByLevel.set(level, []);
    }
    activitiesByLevel.get(level)!.push(activity);
  });
  
  // Sort levels
  const sortedLevels = Array.from(activitiesByLevel.keys()).sort((a, b) => a - b);
  
  // Layout parameters now use reduced constants
  const NODE_SPACING = NODE_VERTICAL_SPACING;
  
  // Position activities level by level
  sortedLevels.forEach((level) => {
    const activitiesInLevel = activitiesByLevel.get(level)!;
    
    // Sort activities in level: critical path activities first, then by earliest start time
    activitiesInLevel.sort((a, b) => {
      if (criticalIds.has(a.id) && !criticalIds.has(b.id)) return -1;
      if (!criticalIds.has(a.id) && criticalIds.has(b.id)) return 1;
      return a.faz - b.faz;
    });
    
  const x = START_X + level * LEVEL_SPACING;
    
    // Calculate vertical positions to minimize crossings
    activitiesInLevel.forEach((activity, index) => {
      let y = START_Y + index * NODE_SPACING;
      
      // For non-critical activities, try to position them to minimize crossings
  if (!criticalIds.has(activity.id) && activity.predecessors.length > 0) {
        // Calculate average Y position of predecessors
        let predYSum = 0;
        let predCount = 0;
        
        activity.predecessors.forEach(predRef => {
          const predActivity = activities.find(a => a.referenceNumber === predRef);
          if (predActivity) {
            const predPos = positions.get(predActivity.id);
            if (predPos) {
              predYSum += predPos.y;
              predCount++;
            }
          }
        });
        
        if (predCount > 0) {
          const avgPredY = predYSum / predCount;
          // Try to position near predecessor average, but maintain some spacing
          y = Math.max(y, avgPredY - 50);
        }
      }
      
      positions.set(activity.id, { x, y });
    });
  });
  
  // Post-process: Adjust positions to reduce overlaps
  const adjustForOverlaps = () => {
    const positionsArray = Array.from(positions.entries());
    let adjusted = false;
    
    for (let i = 0; i < positionsArray.length; i++) {
      for (let j = i + 1; j < positionsArray.length; j++) {
        const [, pos1] = positionsArray[i];
        const [, pos2] = positionsArray[j];
        
        // Check if nodes are too close (same level)
        if (Math.abs(pos1.x - pos2.x) < 60 && Math.abs(pos1.y - pos2.y) < (NODE_VERTICAL_SPACING - 10)) {
          if (pos1.y < pos2.y) {
            pos2.y = pos1.y + NODE_VERTICAL_SPACING + 20;
          } else {
            pos1.y = pos2.y + NODE_VERTICAL_SPACING + 20;
          }
          adjusted = true;
        }
      }
    }
    
    if (adjusted) {
      positionsArray.forEach(([id, pos]) => positions.set(id, pos));
    }
    
    return adjusted;
  };
  
  // Apply overlap adjustment (may need multiple passes)
  let adjustmentPasses = 0;
  while (adjustForOverlaps() && adjustmentPasses < 3) {
    adjustmentPasses++;
  }
  
  return positions;
};

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
  const { planId } = useParams<{ planId: string }>();
  const { t } = useTranslation();
  const visualizationRef = useRef<HTMLDivElement>(null);
  const [networkActivities, setNetworkActivities] = useState<NetworkActivity[]>([]);
  const [planData, setPlanData] = useState<NetworkPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const fetchPlanData = async () => {
      if (!planId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching plan with ID:', planId);
        
        // Test if backend is reachable first by trying to get all plans
        console.log('Testing backend connection...');
        const testResponse = await axios.get('http://localhost:4000/netzplaene');
        console.log('Backend is reachable. Available plans:', testResponse.data);
        
        // Find the specific plan
        const plan = testResponse.data.find((p: BackendPlan) => p.id === parseInt(planId));
        if (!plan) {
          throw new Error(`Plan with ID ${planId} not found. Available plan IDs: ${testResponse.data.map((p: BackendPlan) => p.id).join(', ')}`);
        }
        console.log('Found plan:', plan);
        
        // Fetch activities for this plan
        console.log('Fetching activities...');
        const activitiesResponse = await axios.get(`http://localhost:4000/netzplaene/${planId}/aktivitaeten`);
        console.log('Activities response received:', activitiesResponse);
        console.log('Activities data:', activitiesResponse.data);
        const activities = activitiesResponse.data;
        
        const networkPlanData: NetworkPlanData = {
          planName: plan.name,
          planDescription: plan.description,
          activities: activities.map((activity: BackendActivity) => {
            // Convert predecessor activity IDs to reference numbers
            let predecessorRefNumbers = '';
            if (activity.vorgaenger && activity.vorgaenger.length > 0) {
              // Find the reference numbers for the predecessor activity IDs
              const predecessorRefs = activity.vorgaenger.map(predecessorId => {
                const predecessorActivity = activities.find((a: BackendActivity) => a.id === predecessorId);
                return predecessorActivity ? predecessorActivity.ref_number : null;
              }).filter(ref => ref !== null);
              
              predecessorRefNumbers = predecessorRefs.join(',');
            }
            
            return {
              id: activity.id.toString(),
              referenceNumber: activity.ref_number,
              activityName: activity.name,
              dauer: activity.dauer.toString(),
              vorgaengerid: predecessorRefNumbers
            };
          })
        };

        setPlanData(networkPlanData);
        
        // Check if there are activities to visualize
        if (networkPlanData.activities.length === 0) {
          console.warn('Plan has no activities to visualize');
          setNetworkActivities([]);
          setNodePositions(new Map());
          return;
        }
        
        const calculatedActivities = calculateNetworkPlan(networkPlanData.activities);
        setNetworkActivities(calculatedActivities);
        
        // Enhanced positioning algorithm for better visualization
        const positions = calculateOptimalPositions(calculatedActivities);
        setNodePositions(positions);
      } catch (error: unknown) {
        console.error('Error fetching plan data:', error);
        
        let errorMessage = 'Unknown error occurred';
        
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_NETWORK') {
          errorMessage = 'Cannot connect to backend server. Please make sure the server is running on http://localhost:4000';
        } else if (error && typeof error === 'object' && 'response' in error) {
          // Server responded with error status
          const axiosError = error as { response?: { status?: number; data?: { error?: string }; statusText?: string } };
          if (axiosError.response?.status === 404) {
            errorMessage = `Plan with ID ${planId} not found in database`;
          } else {
            errorMessage = `Server error: ${axiosError.response?.status || 'Unknown'} - ${axiosError.response?.data?.error || axiosError.response?.statusText || 'Unknown error'}`;
          }
        } else if (error && typeof error === 'object' && 'request' in error) {
          // Request was made but no response received
          errorMessage = 'No response from server. Check if backend is running on http://localhost:4000';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setPlanData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [planId]);

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

    // Constrain to viewbox bounds - use dynamic SVG dimensions
  const nodeWidth = NODE_WIDTH;
  const nodeHeight = NODE_HEIGHT;
    
    // Calculate SVG dimensions based on actual layout
  const levels = new Set(Array.from(nodePositions.values()).map(pos => Math.round(pos.x / LEVEL_SPACING)));
    const maxLevel = levels.size > 0 ? Math.max(...levels) : 0;
  const svgWidth = Math.max(1400, START_X + (maxLevel * LEVEL_SPACING) + NODE_WIDTH + 100);
    
  const maxY = nodePositions.size > 0 ? Math.max(...Array.from(nodePositions.values()).map(pos => pos.y)) : 0;
  const svgHeight = Math.max(800, maxY + NODE_HEIGHT + 100);
    
    const maxX = svgWidth - nodeWidth/2;
    const maxYConstraint = svgHeight - nodeHeight/2;
    newPos.x = Math.max(nodeWidth/2, Math.min(maxX, newPos.x));
    newPos.y = Math.max(nodeHeight/2, Math.min(maxYConstraint, newPos.y));

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
    
    // Default grid position adjusted for smaller nodes
    const spacing = LEVEL_SPACING;
    return {
      x: START_X + (index % 4) * spacing,
      y: START_Y + Math.floor(index / 4) * (NODE_VERTICAL_SPACING + NODE_HEIGHT/2)
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

  // Render network node according to German BWL standards
  const renderNetworkNode = (activity: NetworkActivity, index: number) => {
  const nodeWidth = NODE_WIDTH;  // reduced size constants
  const nodeHeight = NODE_HEIGHT; // reduced size constants
    const position = getNodePosition(activity, index);
    const isDragging = dragState.draggedNodeId === activity.id;

    return (
      <g 
        key={activity.id} 
        transform={`translate(${position.x}, ${position.y})`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => handleMouseDown(e, activity.id)}
      >
        {/* Modern shadow */}
        <rect
          x={-nodeWidth/2 + 3}
          y={-nodeHeight/2 + 3}
          width={nodeWidth}
          height={nodeHeight}
          fill="rgba(0, 0, 0, 0.15)"
          rx="10"
          opacity="0.6"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`nodeGradient-${activity.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {activity.isCritical ? (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fef2f2" />
                <stop offset="100%" stopColor="#fee2e2" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </>
            )}
          </linearGradient>
        </defs>
        
        {/* Main node rectangle */}
        <rect
          x={-nodeWidth/2}
          y={-nodeHeight/2}
          width={nodeWidth}
          height={nodeHeight}
          fill={`url(#nodeGradient-${activity.id})`}
          stroke={activity.isCritical ? "#dc2626" : "#64748b"}
          strokeWidth={activity.isCritical ? "2.5" : "1.5"}
          rx="10"
          filter="drop-shadow(0 3px 6px rgba(0, 0, 0, 0.08))"
        />
        
        {/* Header section with reference number and duration */}
        <rect
          x={-nodeWidth/2}
          y={-nodeHeight/2}
          width={nodeWidth}
          height={30}
          fill={activity.isCritical ? "#dc2626" : "#64748b"}
          rx="10"
        />
        <rect
          x={-nodeWidth/2}
          y={-nodeHeight/2 + 22}
          width={nodeWidth}
          height={8}
          fill={activity.isCritical ? "#dc2626" : "#64748b"}
        />
        
        {/* Reference number */}
        <circle
          cx={-nodeWidth/2 + 24}
          cy={-nodeHeight/2 + 16}
          r="11"
          fill="rgba(255, 255, 255, 0.2)"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
        />
        <text
          x={-nodeWidth/2 + 24}
          y={-nodeHeight/2 + 20}
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="bold"
        >
          {activity.referenceNumber}
        </text>
        
        {/* Duration badge */}
        <rect
          x={nodeWidth/2 - 60}
          y={-nodeHeight/2 + 7}
          width={50}
          height={16}
          fill="rgba(255, 255, 255, 0.2)"
          rx="8"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />
        <text
          x={nodeWidth/2 - 35}
          y={-nodeHeight/2 + 19}
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          {t('visualization.networkPlan.durationShort')}={activity.duration}
        </text>
        
        {/* Subtle background rectangles for visual separation */}
        {/* Top left quadrant background (ES) */}
        <rect
          x={-nodeWidth/2 + 6}
          y={-nodeHeight/2 + 40}
          width={nodeWidth/2 - 12}
          height={24}
          fill="rgba(255, 255, 255, 0.05)"
          rx="5"
          opacity="0.8"
        />
        
        {/* Top right quadrant background (EF) */}
        <rect
          x={6}
          y={-nodeHeight/2 + 40}
          width={nodeWidth/2 - 12}
          height={24}
          fill="rgba(255, 255, 255, 0.05)"
          rx="5"
          opacity="0.8"
        />
        
        {/* Bottom left quadrant background (LS) */}
        <rect
          x={-nodeWidth/2 + 6}
          y={-nodeHeight/2 + 100}
          width={nodeWidth/2 - 12}
          height={24}
          fill="rgba(255, 255, 255, 0.05)"
          rx="5"
          opacity="0.8"
        />
        
        {/* Bottom right quadrant background (LF) */}
        <rect
          x={6}
          y={-nodeHeight/2 + 100}
          width={nodeWidth/2 - 12}
          height={24}
          fill="rgba(255, 255, 255, 0.05)"
          rx="5"
          opacity="0.8"
        />
        
        {/* ES (Earliest Start) - Top Left */}
        <text
          x={-nodeWidth/4}
          y={-nodeHeight/2 + 46}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#64748b"}
          fontSize="9"
          fontWeight="600"
        >ἤ{t('visualization.networkPlan.es')}</text>
        <text
          x={-nodeWidth/4}
          y={-nodeHeight/2 + 60}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1f2937"}
          fontSize="14"
          fontWeight="bold"
        >{activity.faz}</text>
        
        {/* EF (Earliest Finish) - Top Right */}
        <text
          x={nodeWidth/4}
          y={-nodeHeight/2 + 46}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#64748b"}
          fontSize="9"
          fontWeight="600"
        >{t('visualization.networkPlan.ef')}</text>
        <text
          x={nodeWidth/4}
          y={-nodeHeight/2 + 60}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1f2937"}
          fontSize="14"
          fontWeight="bold"
        >{activity.fez}</text>
        
        {/* Beautiful Activity Name Section - Center Focus */}
        <rect
          x={-nodeWidth/2 + 10}
          y={-nodeHeight/2 + 64}
          width={nodeWidth - 20}
          height={28}
          fill="rgba(255, 255, 255, 0.95)"
          rx="10"
          stroke={activity.isCritical ? "#dc2626" : "#64748b"}
          strokeWidth="1.5"
          filter="drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))"
        />
        <text
          x={0}
          y={-nodeHeight/2 + 83}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1f2937"}
          fontSize="12"
          fontWeight="700"
          letterSpacing="0.2px"
        >
          {activity.activityName.length > 18 ? activity.activityName.substring(0, 18) + '...' : activity.activityName}
        </text>
        
        {/* LS (Latest Start) - Bottom Left */}
        <text
          x={-nodeWidth/4}
          y={-nodeHeight/2 + 106}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#64748b"}
          fontSize="9"
          fontWeight="600"
        >{t('visualization.networkPlan.ls')}</text>
        <text
          x={-nodeWidth/4}
          y={-nodeHeight/2 + 120}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1f2937"}
          fontSize="14"
          fontWeight="bold"
        >{activity.saz}</text>
        
        {/* LF (Latest Finish) - Bottom Right */}
        <text
          x={nodeWidth/4}
          y={-nodeHeight/2 + 106}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#64748b"}
          fontSize="9"
          fontWeight="600"
        >{t('visualization.networkPlan.lf')}</text>
        <text
          x={nodeWidth/4}
          y={-nodeHeight/2 + 120}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#1f2937"}
          fontSize="14"
          fontWeight="bold"
        >{activity.sez}</text>
        
        {/* Buffer Information (Bottom Section) */}
        <rect
          x={-nodeWidth/2 + 10}
          y={-nodeHeight/2 + 128}
          width={nodeWidth - 20}
          height={18}
          fill={activity.totalFloat === 0 ? "rgba(220, 38, 38, 0.1)" : "rgba(34, 197, 94, 0.1)"}
          rx="6"
          stroke={activity.totalFloat === 0 ? "rgba(220, 38, 38, 0.3)" : "rgba(34, 197, 94, 0.3)"}
          strokeWidth="1"
        />
        <text
          x={0}
          y={-nodeHeight/2 + 141}
          textAnchor="middle"
          fill={activity.totalFloat === 0 ? "#dc2626" : "#059669"}
          fontSize="10"
          fontWeight="600"
        >{t('visualization.table.headers.tf')}: {activity.totalFloat} | {t('visualization.table.headers.ff')}: {activity.freeFloat}</text>
      </g>
    );
  };

  // Render connections between nodes
  const renderConnections = () => {
  const nodeWidth = NODE_WIDTH;
    
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
  const startX = startPos.x + nodeWidth/2;
        const startY = startPos.y;
  const endX = endPos.x - nodeWidth/2;
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
              stroke={isCriticalPath ? "#dc2626" : "#64748b"}
              strokeWidth={isCriticalPath ? "2.5" : "1.5"}
              markerEnd={`url(#arrowhead-${isCriticalPath ? 'critical' : 'normal'})`}
              opacity={isCriticalPath ? "0.9" : "0.7"}
              strokeDasharray={isCriticalPath ? "none" : "none"}
            />
          </g>
        );
      });
    });
    
    return connections;
  };

  const criticalPath = networkActivities.filter(a => a.isCritical);
  const projectDuration = Math.max(...networkActivities.map(a => a.fez));

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mx-auto px-4 min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Loading Plan...</h2>
            <p className="text-white/70">Fetching plan data from database...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state - no planId provided
  if (!planId) {
    return (
      <Layout>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mx-auto px-4 min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No Plan Selected</h2>
            <p className="text-white/70 mb-6">Please select a plan to visualize from the manage plans page.</p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 transition-all duration-300"
              onClick={() => navigate('/manage-plans')}
            >
              Go to Manage Plans
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state - no plan data loaded
  if (!planData) {
    return (
      <Layout>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mx-auto px-4 min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              {error ? 'Error Loading Plan' : 'Plan Not Found'}
            </h2>
            <p className="text-white/70 mb-6">
              {error || 'The requested plan could not be loaded. It may have been deleted or doesn\'t exist.'}
            </p>
            <div className="space-y-3">
              <Button
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300"
                onClick={() => navigate('/manage-plans')}
              >
                Go to Manage Plans
              </Button>
              {error && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
                    width={Math.max(1200, (() => {
                      const levels = new Set(Array.from(nodePositions.values()).map(pos => Math.round(pos.x / LEVEL_SPACING)));
                      const maxLevel = levels.size > 0 ? Math.max(...levels) : 0;
                      return START_X + (maxLevel * LEVEL_SPACING) + NODE_WIDTH + 100;
                    })())} 
                    height={Math.max(700, (() => {
                      const maxY = nodePositions.size > 0 ? Math.max(...Array.from(nodePositions.values()).map(pos => pos.y)) : 0;
                      return maxY + NODE_HEIGHT + 100;
                    })())}
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
                        markerWidth="8"
                        markerHeight="6"
                        refX="7"
                        refY="3"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 8 3, 0 6"
                          fill="#dc2626"
                        />
                      </marker>
                      {/* Normal arrow */}
                      <marker
                        id="arrowhead-normal"
                        markerWidth="6"
                        markerHeight="4"
                        refX="5"
                        refY="2"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 6 2, 0 4"
                          fill="#64748b"
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