import { Handle, NodeProps, Position } from "reactflow";

interface StrategyNodeData {
  label: string;
  subtitle?: string;
  accent?: string;
}

export default function StrategyNode({ data, selected }: NodeProps<StrategyNodeData>) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm shadow-card transition ${
        selected
          ? "border-ember bg-ink text-white ring-2 ring-amber-300/60"
          : "border-slate-200 bg-white text-slate-700"
      }`}
      style={data.accent ? { borderColor: data.accent } : undefined}
    >
      <Handle type="target" position={Position.Left} />
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{data.subtitle}</p>
      <p className="mt-1 font-semibold">{data.label}</p>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
