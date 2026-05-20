import type { Organization } from '@/lib/database';

interface Props { organization: Organization }

export default function OrganizationPreview({ organization }: Props) {
  return (
    <div>
      {organization.type && (
        <span className="inline-block text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded mb-3">{organization.type}</span>
      )}
      {organization.images && organization.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 mt-3">
          {organization.images.map((img, i) => (
            <div key={i} className="flex-shrink-0">
              <img src={img.url} alt={img.label || organization.name}
                className="w-48 h-28 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
              {img.label && <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">{img.label}</p>}
            </div>
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
