import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";

import StrategyNode from "../components/StrategyNode";
import {
  createStrategy,
  listStrategies,
  updateStrategy,
  type StrategyResponse,
} from "../services/strategies";
import { createBacktest } from "../services/backtests";

const nodeTemplates = [
  {
    key: "data",
    label: "Market Feed",
    subtitle: "Data",
    accent: "#0ea5e9",
  },
  {
    key: "indicator",
    label: "Indicator",
    subtitle: "Signal",
    accent: "#f97316",
  },
  {
    key: "condition",
    label: "Condition",
    subtitle: "Logic",
    accent: "#14b8a6",
  },
  {
    key: "action",
    label: "Action",
    subtitle: "Execution",
    accent: "#f43f5e",
  },
];

const defaultNodes: Node[] = [
  {
    id: "data-1",
    type: "strategy",
    data: { label: "Price Feed", subtitle: "Data", accent: "#0ea5e9" },
    position: { x: 60, y: 140 },
  },
  {
    id: "indicator-1",
    type: "strategy",
    data: { label: "RSI (14)", subtitle: "Signal", accent: "#f97316" },
    position: { x: 320, y: 140 },
  },
  {
    id: "condition-1",
    type: "strategy",
    data: { label: "RSI < 30", subtitle: "Logic", accent: "#14b8a6" },
    position: { x: 580, y: 140 },
  },
  {
    id: "action-1",
    type: "strategy",
    data: { label: "Buy", subtitle: "Execution", accent: "#f43f5e" },
    position: { x: 840, y: 140 },
  },
];

const defaultEdges = [
  { id: "e1-2", source: "data-1", target: "indicator-1" },
  { id: "e2-3", source: "indicator-1", target: "condition-1" },
  { id: "e3-4", source: "condition-1", target: "action-1" },
];

function createNodeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export default function StrategyBuilderPage() {
  const fitViewOptions = useMemo(() => ({ padding: 0.2 }), []);
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [strategyName, setStrategyName] = useState("Momentum Draft");
  const [strategyDescription, setStrategyDescription] = useState(
    "RSI divergence with momentum filter and trailing exit."
  );
  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [strategyVersion, setStrategyVersion] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [strategyLibrary, setStrategyLibrary] = useState<StrategyResponse[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const nodeTypes = useMemo(() => ({ strategy: StrategyNode }), []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeId(params.nodes[0]?.id ?? null);
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#0f172a", strokeWidth: 2 },
          },
          current
        )
      );
    },
    [setEdges]
  );

  const handleAddNode = useCallback(
    (templateKey: string) => {
      const template = nodeTemplates.find((item) => item.key === templateKey);
      if (!template) return;
      const nextNode: Node = {
        id: createNodeId(templateKey),
        type: "strategy",
        data: {
          label: template.label,
          subtitle: template.subtitle,
          accent: template.accent,
        },
        position: {
          x: 140 + Math.random() * 320,
          y: 120 + Math.random() * 260,
        },
      };
      setNodes((current) => [...current, nextNode]);
    },
    [setNodes]
  );

  const updateSelectedNode = useCallback(
    (updates: { label?: string; subtitle?: string }) => {
      if (!selectedNodeId) return;
      setNodes((current) =>
        current.map((node) =>
          node.id === selectedNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...(updates.label !== undefined ? { label: updates.label } : null),
                  ...(updates.subtitle !== undefined ? { subtitle: updates.subtitle } : null),
                },
              }
            : node
        )
      );
    },
    [selectedNodeId, setNodes]
  );

  const loadStrategy = useCallback(
    (strategy: StrategyResponse) => {
      const config = strategy.config_json as { nodes?: Node[]; edges?: Edge[] };
      const nextNodes =
        config?.nodes?.map((node) => ({
          ...node,
          type: node.type ?? "strategy",
        })) ?? defaultNodes;
      const nextEdges = config?.edges ?? defaultEdges;
      setNodes(nextNodes);
      setEdges(nextEdges);
      setSelectedNodeId(null);
      setStrategyId(strategy.id);
      setStrategyVersion(strategy.version);
      setStrategyName(strategy.name);
      setStrategyDescription(strategy.description ?? "");
    },
    [setEdges, setNodes]
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoadingLibrary(true);
    listStrategies()
      .then((data) => {
        if (!isMounted) return;
        setStrategyLibrary(data);
        if (data.length > 0 && !strategyId) {
          loadStrategy(data[0]);
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        setStatusMessage(error instanceof Error ? error.message : "Unable to load strategies.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingLibrary(false);
      });
    return () => {
      isMounted = false;
    };
  }, [loadStrategy, strategyId]);

  const saveStrategy = async () => {
    if (!strategyName.trim()) {
      setStatusMessage("Name the strategy before saving.");
      return null;
    }
    const config = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges,
    };
    if (!strategyId) {
      const saved = await createStrategy({
        name: strategyName,
        description: strategyDescription || null,
        config_json: config,
      });
      setStrategyId(saved.id);
      setStrategyVersion(saved.version);
      setStrategyLibrary((current) => [saved, ...current]);
      return saved;
    }
    const saved = await updateStrategy(strategyId, {
      name: strategyName,
      description: strategyDescription || null,
      config_json: config,
      version: strategyVersion ?? undefined,
    });
    setStrategyVersion(saved.version);
    setStrategyLibrary((current) =>
      current.map((item) => (item.id === saved.id ? saved : item))
    );
    return saved;
  };

  const handleSave = async () => {
    setStatusMessage(null);
    setIsSaving(true);
    try {
      const saved = await saveStrategy();
      if (saved) {
        setStatusMessage("Draft saved to your strategy library.");
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunBacktest = async () => {
    setStatusMessage(null);
    setIsSaving(true);
    try {
      const saved = await saveStrategy();
      if (!saved) {
        return;
      }
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      await createBacktest({
        strategy_id: saved.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        initial_capital: 10000,
      });
      navigate("/backtests");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to run backtest.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-1 flex-col rounded-3xl bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Strategy Builder</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Drag nodes, wire signals, compile confidence.
          </p>
        </div>
        <div className="flex gap-3 text-xs uppercase tracking-[0.2em]">
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-600 disabled:opacity-60"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            className="rounded-full bg-ink px-4 py-2 text-white disabled:opacity-60"
            onClick={handleRunBacktest}
            disabled={isSaving}
          >
            Run Backtest
          </button>
        </div>
      </div>
      <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Node Palette</p>
          <div className="mt-4 space-y-3 text-sm">
            {nodeTemplates.map((template) => (
              <button
                key={template.key}
                type="button"
                onClick={() => handleAddNode(template.key)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-slate-700 shadow-sm hover:border-slate-300"
              >
                <span>{template.label}</span>
                <span className="text-xs uppercase tracking-[0.15em] text-slate-400">
                  {template.subtitle}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Library</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {isLoadingLibrary ? (
                <p className="text-xs text-slate-400">Loading strategies...</p>
              ) : strategyLibrary.length > 0 ? (
                strategyLibrary.map((strategy) => (
                  <button
                    key={strategy.id}
                    type="button"
                    onClick={() => loadStrategy(strategy)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                      strategy.id === strategyId
                        ? "border-ink bg-white text-ink"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold">{strategy.name}</p>
                    <p className="text-xs text-slate-400">
                      v{strategy.version} - {new Date(strategy.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400">No saved strategies yet.</p>
              )}
            </div>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
            Connect nodes to form a signal chain. Click a node to tune its label and role.
          </div>
        </aside>

        <div className="min-h-[560px] rounded-2xl bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onSelectionChange={handleSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={fitViewOptions}
          >
            <MiniMap zoomable pannable />
            <Controls />
            <Background gap={20} color="#cbd5f5" />
          </ReactFlow>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Strategy Details</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                value={strategyName}
                onChange={(event) => setStrategyName(event.target.value)}
              />
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Description
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                value={strategyDescription}
                onChange={(event) => setStrategyDescription(event.target.value)}
              />
              {strategyId ? (
                <div className="rounded-xl bg-mist px-3 py-2 text-xs text-slate-500">
                  Strategy ID: {strategyId.slice(0, 8)} - v{strategyVersion ?? 1}
                </div>
              ) : null}
              {statusMessage ? (
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {statusMessage}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Node Inspector</p>
            {selectedNode ? (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Label
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  value={(selectedNode.data as { label?: string }).label ?? ""}
                  onChange={(event) => updateSelectedNode({ label: event.target.value })}
                />
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Role
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  value={(selectedNode.data as { subtitle?: string }).subtitle ?? ""}
                  onChange={(event) => updateSelectedNode({ subtitle: event.target.value })}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Select a node to edit its label, role, and visual intent.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
