export function getPriorityBadgeColor(level?: string, score?: number): { bg: string; text: string; border: string } {
  const s = score ?? 50;
  if (s >= 80 || level === 'Critical') {
    return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
  }
  if (s >= 65 || level === 'High') {
    return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
  }
  if (s >= 45 || level === 'Medium') {
    return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
  }
  return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
}

export function getStatusBadgeColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Reported':
      return { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' };
    case 'Verified':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    case 'Assigned':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'In Progress':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Resolved':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'Citizen Verified':
    case 'Closed':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString?: string): string {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    const days = Math.floor(diffSec / 86400);
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
}
