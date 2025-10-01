import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

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
  faz: number;                     // Frühester Anfangszeitpunkt
  fez: number;                     // Frühester Endzeitpunkt  
  saz: number;                     // Spätester Anfangszeitpunkt
  sez: number;                     // Spätester Endzeitpunkt
  totalFloat: number;              // Gesamtpuffer
  freeFloat: number;               // Freier Puffer
  isCritical: boolean;             // Auf kritischem Pfad
}

interface NetworkPlanData {
  planName: string;
  planDescription: string;
  activities: PlanActivity[];
}

const Visualization: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [networkActivities, setNetworkActivities] = useState<NetworkActivity[]>([]);
  const [planData, setPlanData] = useState<NetworkPlanData | null>(null);

  useEffect(() => {
    const state = location.state as NetworkPlanData;
    if (state && state.activities) {
      setPlanData(state);
      const calculatedActivities = calculateNetworkPlan(state.activities);
      setNetworkActivities(calculatedActivities);
    }
  }, [location.state]);

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
  const renderNetworkNode = (activity: NetworkActivity, index: number) => {
    const nodeSize = 180;
    const spacing = 280;
    const x = 150 + (index % 5) * spacing;
    const y = 150 + Math.floor(index / 5) * 250;

    return (
      <g key={activity.id} transform={`translate(${x}, ${y})`}>
        {/* Node shadow */}
        <rect
          x={-nodeSize/2 + 4}
          y={-nodeSize/2 + 4}
          width={nodeSize}
          height={nodeSize}
          fill="rgba(0, 0, 0, 0.4)"
          rx="16"
        />
        
        {/* Node background gradient */}
        <defs>
          <linearGradient id={`gradient-${activity.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={activity.isCritical ? "#dc2626" : "#7c3aed"} />
            <stop offset="100%" stopColor={activity.isCritical ? "#991b1b" : "#5b21b6"} />
          </linearGradient>
        </defs>
        
        <rect
          x={-nodeSize/2}
          y={-nodeSize/2}
          width={nodeSize}
          height={nodeSize}
          fill={`url(#gradient-${activity.id})`}
          stroke={activity.isCritical ? "#fca5a5" : "#c4b5fd"}
          strokeWidth="3"
          rx="16"
        />
        
        {/* Inner sections */}
        {/* Top section - Activity info */}
        <rect
          x={-nodeSize/2 + 6}
          y={-nodeSize/2 + 6}
          width={nodeSize - 12}
          height="45"
          fill="rgba(255, 255, 255, 0.15)"
          rx="12"
        />
        
        {/* Activity number circle */}
        <circle
          cx={-nodeSize/2 + 30}
          cy={-nodeSize/2 + 28}
          r="16"
          fill="rgba(255, 255, 255, 0.9)"
        />
        <text
          x={-nodeSize/2 + 30}
          y={-nodeSize/2 + 35}
          textAnchor="middle"
          fill={activity.isCritical ? "#dc2626" : "#7c3aed"}
          fontSize="16"
          fontWeight="bold"
        >
          {activity.referenceNumber}
        </text>
        
        {/* Activity name */}
        <text
          x={-nodeSize/2 + 55}
          y={-nodeSize/2 + 22}
          fill="white"
          fontSize="14"
          fontWeight="600"
        >
          {activity.activityName.length > 12 
            ? activity.activityName.substring(0, 12) + '...' 
            : activity.activityName}
        </text>
        
        {/* Duration */}
        <text
          x={-nodeSize/2 + 55}
          y={-nodeSize/2 + 40}
          fill="rgba(255, 255, 255, 0.9)"
          fontSize="12"
        >
          Duration: {activity.duration}d
        </text>
        
        {/* Time values grid */}
        {/* FAZ */}
        <rect
          x={-nodeSize/2 + 12}
          y={-nodeSize/2 + 60}
          width="36"
          height="26"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          rx="4"
        />
        <text x={-nodeSize/2 + 16} y={-nodeSize/2 + 70} fill="rgba(255, 255, 255, 0.8)" fontSize="10">FAZ</text>
        <text x={-nodeSize/2 + 30} y={-nodeSize/2 + 82} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{activity.faz}</text>
        
        {/* FEZ */}
        <rect
          x={nodeSize/2 - 48}
          y={-nodeSize/2 + 60}
          width="36"
          height="26"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          rx="4"
        />
        <text x={nodeSize/2 - 44} y={-nodeSize/2 + 70} fill="rgba(255, 255, 255, 0.8)" fontSize="10">FEZ</text>
        <text x={nodeSize/2 - 30} y={-nodeSize/2 + 82} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{activity.fez}</text>
        
        {/* SAZ */}
        <rect
          x={-nodeSize/2 + 12}
          y={nodeSize/2 - 46}
          width="36"
          height="26"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          rx="4"
        />
        <text x={-nodeSize/2 + 16} y={nodeSize/2 - 36} fill="rgba(255, 255, 255, 0.8)" fontSize="10">SAZ</text>
        <text x={-nodeSize/2 + 30} y={nodeSize/2 - 24} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{activity.saz}</text>
        
        {/* SEZ */}
        <rect
          x={nodeSize/2 - 48}
          y={nodeSize/2 - 46}
          width="36"
          height="26"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          rx="4"
        />
        <text x={nodeSize/2 - 44} y={nodeSize/2 - 36} fill="rgba(255, 255, 255, 0.8)" fontSize="10">SEZ</text>
        <text x={nodeSize/2 - 30} y={nodeSize/2 - 24} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{activity.sez}</text>
        
        {/* Puffer (center) */}
        <rect
          x={-24}
          y={-13}
          width="48"
          height="26"
          fill={activity.totalFloat === 0 ? "rgba(220, 38, 38, 0.3)" : "rgba(34, 197, 94, 0.3)"}
          stroke={activity.totalFloat === 0 ? "#fca5a5" : "#86efac"}
          strokeWidth="1"
          rx="13"
        />
        <text x={0} y={-5} textAnchor="middle" fill="rgba(255, 255, 255, 0.8)" fontSize="10">Buffer</text>
        <text x={0} y={8} textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">{activity.totalFloat}</text>
      </g>
    );
  };

  // Render connections between nodes
  const renderConnections = () => {
    const nodeSize = 180;
    const spacing = 280;
    
    return networkActivities.map((activity, index) => {
      return activity.predecessors.map(predId => {
        const predIndex = networkActivities.findIndex(a => a.referenceNumber === predId);
        if (predIndex === -1) return null;
        
        // FROM predecessor TO current activity
        const startX = 150 + (predIndex % 5) * spacing + nodeSize/2;
        const startY = 150 + Math.floor(predIndex / 5) * 250;
        const endX = 150 + (index % 5) * spacing - nodeSize/2;
        const endY = 150 + Math.floor(index / 5) * 250;
        
        const predecessor = networkActivities[predIndex];
        const isCriticalPath = activity.isCritical && predecessor.isCritical;
        
        return (
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
  };

  const criticalPath = networkActivities.filter(a => a.isCritical);
  const projectDuration = Math.max(...networkActivities.map(a => a.fez));

  return (
    <Layout>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mx-auto px-4 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full max-w-none">
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6">
            Network Plan Analysis
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {planData ? `Project: ${planData.planName}` : 'Business network plan with critical path and buffer analysis'}
          </p>

          {/* Project Statistics */}
          {networkActivities.length > 0 && (
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="text-4xl mb-2">⏱️</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Project Duration</h3>
                  <p className="text-3xl font-bold text-green-400">{projectDuration}</p>
                  <p className="text-sm text-green-200">Days</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Critical Path</h3>
                  <p className="text-3xl font-bold text-red-400">{criticalPath.length}</p>
                  <p className="text-sm text-red-200">Critical Activities</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="text-4xl mb-2">📋</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Total Activities</h3>
                  <p className="text-3xl font-bold text-blue-400">{networkActivities.length}</p>
                  <p className="text-sm text-blue-200">Activities</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Network Plan Visualization */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            {networkActivities.length > 0 ? (
              <>
                {/* Legend */}
                <div className="flex justify-center gap-8 mb-6 text-sm">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-700 rounded shadow-lg"></div>
                    <span className="text-white font-medium">Critical Path</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded shadow-lg"></div>
                    <span className="text-white font-medium">Normal Activity</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-700 rounded shadow-lg"></div>
                    <span className="text-white font-medium">Buffer {'>'}0</span>
                  </div>
                </div>

                {/* Network Plan SVG */}
                <div className="overflow-x-auto bg-white/5 rounded-xl p-8 border border-white/10 w-full">
                  <svg 
                    width={Math.max(1400, (networkActivities.length % 5) * 280 + 500)} 
                    height={Math.max(700, Math.ceil(networkActivities.length / 5) * 250 + 350)}
                    className="mx-auto"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0.1) 70%)' }}
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
                  <h3 className="text-xl font-semibold text-white mb-4">Detailed Network Plan Analysis</h3>
                  <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20 bg-purple-600/20">
                          <th className="text-left text-white p-4 font-semibold">No.</th>
                          <th className="text-left text-white p-4 font-semibold">Activity</th>
                          <th className="text-left text-white p-4 font-semibold">Duration</th>
                          <th className="text-left text-white p-4 font-semibold">EAS</th>
                          <th className="text-left text-white p-4 font-semibold">EAF</th>
                          <th className="text-left text-white p-4 font-semibold">LAS</th>
                          <th className="text-left text-white p-4 font-semibold">LAF</th>
                          <th className="text-left text-white p-4 font-semibold">TF</th>
                          <th className="text-left text-white p-4 font-semibold">FF</th>
                          <th className="text-left text-white p-4 font-semibold">Critical</th>
                        </tr>
                        <tr className="border-b border-white/10 bg-white/5 text-xs">
                          <th className="text-left text-white/70 p-2 font-normal"></th>
                          <th className="text-left text-white/70 p-2 font-normal">Name</th>
                          <th className="text-left text-white/70 p-2 font-normal">Days</th>
                          <th className="text-left text-white/70 p-2 font-normal">Earliest Start</th>
                          <th className="text-left text-white/70 p-2 font-normal">Earliest Finish</th>
                          <th className="text-left text-white/70 p-2 font-normal">Latest Start</th>
                          <th className="text-left text-white/70 p-2 font-normal">Latest Finish</th>
                          <th className="text-left text-white/70 p-2 font-normal">Total Float</th>
                          <th className="text-left text-white/70 p-2 font-normal">Free Float</th>
                          <th className="text-left text-white/70 p-2 font-normal">Crit. Path</th>
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
                    <h4 className="text-lg font-semibold text-white mb-3">📚 Term Definitions:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                      <div>
                        <strong className="text-white">EAS/EAF:</strong> Earliest Activity Start/Finish - The earliest possible start and finish time of an activity.
                      </div>
                      <div>
                        <strong className="text-white">LAS/LAF:</strong> Latest Activity Start/Finish - The latest possible start and finish time of an activity.
                      </div>
                      <div>
                        <strong className="text-white">Total Float (TF):</strong> The time span by which an activity can be delayed without endangering the project.
                      </div>
                      <div>
                        <strong className="text-white">Critical Path:</strong> The path in the network plan consisting of activities without buffer time (TF = 0).
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critical Path Details */}
                {criticalPath.length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-2xl">🔥</div>
                      <h4 className="text-xl font-semibold text-white">Critical Path</h4>
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
                        <strong>Important:</strong> Delays in these activities will extend the entire project!
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
                <p className="text-white/60 mb-6">
                  Please create a plan with activities first.
                </p>
                <Button 
                  onClick={() => navigate('/create-plan')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Plan
                </Button>
              </div>
            )}
          </div>
          
          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => navigate('/create-plan')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              ← Back to Plan Creation
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Visualization;