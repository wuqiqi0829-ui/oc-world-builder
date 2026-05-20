import type { Organization } from '@/lib/database';
import { Edit3, X } from 'lucide-react';

interface Props { organization: Organization; onEdit: () => void; onClose: () => void; }

export default function OrganizationDetail({ organization, onEdit, onClose }: Props) {
  return (
    <div className="card relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{organization.name}</h2>
          {organization.type && <span className="text-xs text-primary-500">{organization.type}</span>}
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={onEdit}><Edit3 size={12} /> 编辑</button>
          <button className="btn-ghost text-xs !px-2 !py-1" onClick={onClose}><X size={12} /></button>
        </div>
      </div>
      {organization.images && organization.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-3 mb-4">
          {organization.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.label || organization.name}
              className="w-32 h-24 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
          ))}
        </div>
      )}
      {organization.description && (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: organization.description }} />
      )}
    </div>
  );
}
