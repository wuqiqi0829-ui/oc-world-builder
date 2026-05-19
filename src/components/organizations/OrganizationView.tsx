import { useEffect } from 'react';
import { useOrganizations } from '@/stores/organizations';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, Plus } from 'lucide-react';

interface Props {
  worldId: string;
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export default function OrganizationView({ worldId, onCreate, onEdit }: Props) {
  const { organizations, fetch } = useOrganizations();

  useEffect(() => { fetch(worldId); }, [worldId, fetch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">组织势力 ({organizations.length})</h3>
        <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
          <Plus size={12} /> 新建组织
        </button>
      </div>

      {organizations.length === 0 ? (
        <EmptyState icon={<Building2 size={48} />} title="还没有组织"
          description="记录国家、帮派、公会等集团信息"
          action={<button className="btn-primary text-sm" onClick={onCreate}>新建组织</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {organizations.map((org) => (
            <Card key={org.id} hover padding="sm" onClick={() => onEdit(org.id)}>
              <div className="flex gap-3">
                {org.images?.[0]?.url && (
                  <img src={org.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{org.name}</h4>
                  {org.type && (
                    <span className="text-[10px] bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-full">
                      {org.type}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
