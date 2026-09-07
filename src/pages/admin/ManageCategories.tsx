import { useState, useMemo } from 'react';
import { Plus, Search, Pencil } from 'lucide-react';

import { PageHeading }      from '@/components/common/PageHeading';
import { BackToDashboardButton } from '@/components/common/BackToDashboardButton';
import { SkeletonLoader }   from '@/components/common/SkeletonLoader';
import { ErrorState }       from '@/components/common/ErrorState';
import { FormModal }        from '@/components/common/FormModal';
import { AdminMobileHint }  from '@/components/common/AdminMobileHint';
import { EmptyState }       from '@/components/common/EmptyState';
import { PrimaryButton }    from '@/components/common/PrimaryButton';
import { INPUT_CLASS }      from '@/utils/constants';
import { usePageTitle }     from '@/hooks/usePageTitle';
import { useCategoryGroupsWithValues, useCreateCategoryGroup, useCreateCategory, useUpsertCategoryValue } from '@/hooks/useCategories';
import { useForms, useFormVersions } from '@/hooks/useForms';
import { useTerritories }   from '@/hooks/useTerritories';
import { useNotification }  from '@/context/NotificationContext';
import type { CategoryGroupDto, CategoryDto, CategoryValueDto } from '@/api/types/category.types';

/* ── Constants ─────────────────────────────────────────────────── */
const GROUP_TYPES  = ['Standard', 'Appendix', 'Reference', 'Lookup'];
const SOURCES      = ['GBS', 'GPM', 'Manual'];

/* ── Helpers ───────────────────────────────────────────────────── */
const sourceBadgeClass = (source: string) => {
  if (source === 'GBS') return 'bg-[#E8F4FD] text-[#0057CA]';
  if (source === 'GPM') return 'bg-[#FFF7D8] text-[#584921]';
  return 'bg-[#F2F2F5] text-[#383B54]';
};

/** Convert a display name to a UPPER_SNAKE_CASE key automatically. */
const toKey = (name: string) =>
  name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'CATEGORY';

/* ── Create Group Modal ────────────────────────────────────────── */
function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useNotification();
  const { mutate: createGroup, isPending } = useCreateCategoryGroup();

  const [formId, setFormId]               = useState(0);
  const [formVersionId, setFormVersionId] = useState(0);
  const [groupName, setGroupName]         = useState('');
  const [groupType, setGroupType]         = useState('Standard');
  const [source, setSource]               = useState('Manual');

  const { data: forms = [] }    = useForms();
  const { data: versions = [] } = useFormVersions(formId);

  const handleFormChange = (id: number) => {
    setFormId(id);
    setFormVersionId(0); // reset version when form changes
  };

  const handleSubmit = () => {
    if (!groupName.trim())    { showToast('error', 'Group name is required.'); return; }
    if (formVersionId <= 0)   { showToast('error', 'Please select a form version.'); return; }
    createGroup(
      { formVersionId, groupName: groupName.trim(), groupType, source },
      {
        onSuccess: () => { showToast('success', 'Category group created.'); onClose(); },
        onError:   () => showToast('error', 'Failed to create group.'),
      },
    );
  };

  return (
    <FormModal
      title="New Category Group"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
          <PrimaryButton onClick={handleSubmit} loading={isPending} label="Create Group" />
        </>
      }
    >
      <div className="fm-field">
        <label className="fm-label">Form <span className="fm-required-star">*</span></label>
        <select value={formId} onChange={(e) => handleFormChange(Number(e.target.value))} className={INPUT_CLASS}>
          <option value={0}>— Select Form —</option>
          {forms.map((f) => (
            <option key={f.formId} value={f.formId}>{f.territoryCode} — {f.formName}</option>
          ))}
        </select>
      </div>
      <div className="fm-field">
        <label className="fm-label">Form Version <span className="fm-required-star">*</span></label>
        <select value={formVersionId} onChange={(e) => setFormVersionId(Number(e.target.value))} className={INPUT_CLASS} disabled={formId <= 0}>
          <option value={0}>— Select Version —</option>
          {versions.map((v) => (
            <option key={v.formVersionId} value={v.formVersionId}>
              v{v.versionNumber}{v.isActive ? ' (Active)' : ''}{v.notes ? ` — ${v.notes}` : ''}
            </option>
          ))}
        </select>
        {formId > 0 && versions.length === 0 && (
          <p className="fm-helper-text">No versions found for this form. Create a version first.</p>
        )}
      </div>
      <div className="fm-field">
        <label className="fm-label">Group Name <span className="fm-required-star">*</span></label>
        <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className={INPUT_CLASS} placeholder="e.g. AU Limits" />
      </div>
      <div className="fm-field">
        <label className="fm-label">Group Type</label>
        <select value={groupType} onChange={(e) => setGroupType(e.target.value)} className={INPUT_CLASS}>
          {GROUP_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="fm-field">
        <label className="fm-label">Source</label>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={INPUT_CLASS}>
          {SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <p className="fm-helper-text">GBS = Global Business Systems · GPM = Global Policy Manager · Manual = hand-entered</p>
      </div>
    </FormModal>
  );
}

/* ── Add Category + Value (single-step) Modal ──────────────────── */
interface AddCategoryModalProps {
  groupId: number;
  territories: { territoryId: number; code: string; name: string; isActive: boolean }[];
  onClose: () => void;
}

function AddCategoryModal({ groupId, territories, onClose }: AddCategoryModalProps) {
  const { showToast } = useNotification();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: upsertValue,   isPending: isUpserting } = useUpsertCategoryValue();

  const [displayName,  setDisplayName]  = useState('');
  const [territoryId,  setTerritoryId]  = useState(0);
  const [rawValue,     setRawValue]     = useState('');
  const [currency,     setCurrency]     = useState('');

  const isPending = isCreating || isUpserting;

  const handleSubmit = () => {
    if (!displayName.trim()) { showToast('error', 'Display name is required.'); return; }
    if (territoryId <= 0)    { showToast('error', 'Please select a territory.'); return; }
    if (!rawValue.trim())    { showToast('error', 'Please enter a value.'); return; }

    const categoryKey = toKey(displayName.trim());
    const numParsed   = Number(rawValue.trim());
    const isNumeric   = rawValue.trim() !== '' && !isNaN(numParsed);

    createCategory(
      {
        groupId,
        categoryKey,
        displayName: displayName.trim(),
        dataType:    isNumeric ? 'Number' : 'Text',
      },
      {
        onSuccess: (res) => {
          /* Extract the newly created categoryId from the response */
          const dto = res as { data?: { categoryId?: number }; categoryId?: number } | null;
          const newCatId: number | undefined =
            (dto as { data?: { categoryId?: number } })?.data?.categoryId ??
            (dto as { categoryId?: number })?.categoryId;

          if (!newCatId) {
            /* Category was created but ID not returned — refresh and close */
            showToast('success', 'Category created. Set its value from the table.');
            onClose();
            return;
          }

          upsertValue(
            {
              categoryId:   newCatId,
              territoryId,
              numericValue: isNumeric ? numParsed : undefined,
              textValue:    !isNumeric ? rawValue.trim() : undefined,
              currency:     currency.trim() || undefined,
            },
            {
              onSuccess: () => { showToast('success', 'Category and value saved.'); onClose(); },
              onError:   () => showToast('error', 'Category created but value could not be saved.'),
            },
          );
        },
        onError: () => showToast('error', 'Failed to create category.'),
      },
    );
  };

  return (
    <FormModal
      title="Add Category"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
          <PrimaryButton onClick={handleSubmit} loading={isPending} label="Save" />
        </>
      }
    >
      <div className="fm-field">
        <label className="fm-label">Category Name <span className="fm-required-star">*</span></label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={INPUT_CLASS}
          placeholder="e.g. Minimum Sum Insured"
          autoFocus
        />
      </div>
      <div className="fm-field">
        <label className="fm-label">Territory <span className="fm-required-star">*</span></label>
        <select value={territoryId} onChange={(e) => setTerritoryId(Number(e.target.value))} className={INPUT_CLASS}>
          <option value={0}>— Select Territory —</option>
          {territories.filter((t) => t.isActive).map((t) => (
            <option key={t.territoryId} value={t.territoryId}>{t.code} — {t.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="fm-field mb-0">
          <label className="fm-label">Value <span className="fm-required-star">*</span></label>
          <input
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. 500000 or N/A"
          />
          <p className="fm-helper-text">Numeric or text — detected automatically.</p>
        </div>
        <div className="fm-field mb-0">
          <label className="fm-label">Currency</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. AUD"
            maxLength={3}
          />
        </div>
      </div>
    </FormModal>
  );
}


export function ManageCategories() {
  const { showToast } = useNotification();
  usePageTitle('Manage Categories');

  /* ── Data ────────────────────────────────────────────────────── */
  const { data: groups, isLoading, isError, error, refetch } = useCategoryGroupsWithValues();
  const { data: territories } = useTerritories();

  /* ── Mutations ───────────────────────────────────────────────── */
  const [categoryId, setCategoryId] = useState(0);
  const { mutate: upsertValue, isPending: isUpsertingVal } = useUpsertCategoryValue();

  /* ── Filters ─────────────────────────────────────────────────── */
  const [search, setSearch]                       = useState('');
  const [filterTerritoryId, setFilterTerritoryId] = useState<number>(0);

  /* ── Modal state ─────────────────────────────────────────────── */
  const [showGroupModal, setShowGroupModal]       = useState(false);
  const [addCategoryGroupId, setAddCategoryGroupId] = useState(0);
  const [showAddCatModal, setShowAddCatModal]     = useState(false);
  const [showValueModal, setShowValueModal]       = useState(false);

  /* ── Upsert value state (for updating existing values) ───────── */
  const [valTerritoryId, setValTerritoryId] = useState(0);
  const [valNumeric, setValNumeric]         = useState('');
  const [valCurrency, setValCurrency]       = useState('');
  const [valUnit, setValUnit]               = useState('');
  const [valQualifier, setValQualifier]     = useState('');
  const [valText, setValText]               = useState('');
  const [valEffective, setValEffective]     = useState('');

  /* ── Derived data ────────────────────────────────────────────── */
  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    let result = groups;

    if (filterTerritoryId > 0) {
      result = result.filter((g) =>
        (g.categories ?? []).some((c) =>
          (c.values ?? []).some((v) => v.territoryId === filterTerritoryId)
        )
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.groupName.toLowerCase().includes(q) ||
          (g.categories ?? []).some(
            (c) =>
              c.categoryKey.toLowerCase().includes(q) ||
              (c.displayName ?? '').toLowerCase().includes(q)
          )
      );
    }

    return result;
  }, [groups, filterTerritoryId, search]);

  const totalCategories = useMemo(
    () => filteredGroups.flatMap((g) => g.categories ?? []).length,
    [filteredGroups],
  );

  /* ── Handlers ────────────────────────────────────────────────── */
  const openAddCategory = (groupId: number) => {
    setAddCategoryGroupId(groupId);
    setShowAddCatModal(true);
  };

  const openUpsertValue = (catId: number) => {
    setCategoryId(catId);
    setValTerritoryId(0); setValNumeric(''); setValCurrency('');
    setValUnit(''); setValQualifier(''); setValText(''); setValEffective('');
    setShowValueModal(true);
  };

  const handleUpsertValue = () => {
    if (valTerritoryId <= 0) { showToast('error', 'Territory is required.'); return; }
    upsertValue(
      {
        categoryId:    categoryId,
        territoryId:   valTerritoryId,
        numericValue:  valNumeric ? Number(valNumeric) : undefined,
        currency:      valCurrency || undefined,
        unit:          valUnit || undefined,
        qualifier:     valQualifier || undefined,
        textValue:     valText || undefined,
        effectiveFrom: valEffective || undefined,
      },
      {
        onSuccess: () => { showToast('success', 'Value saved.'); setShowValueModal(false); },
        onError:   () => showToast('error', 'Failed to save value.'),
      },
    );
  };

  /* ── Loading / Error ─────────────────────────────────────────── */
  if (isLoading) return <div><PageHeading title="Manage Categories" /><SkeletonLoader rows={5} /></div>;
  if (isError)   return <div><PageHeading title="Manage Categories" /><ErrorState message={error instanceof Error ? error.message : 'Load failed'} onRetry={() => refetch()} /></div>;

  const pageActions = (
    <div className="flex items-center gap-2">
      <BackToDashboardButton />
      <button
        type="button"
        onClick={() => setShowGroupModal(true)}
        title="New Group"
        className="inline-flex items-center gap-1.5 px-2 py-2 sm:px-4 rounded-lg text-sm font-medium bg-[#383B54] text-white hover:bg-[#0D102B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Group</span>
      </button>
    </div>
  );

  return (
    <div>
      <AdminMobileHint />
      <PageHeading
        title="Manage Categories"
        subtitle="Configure category groups and reference data values"
        actions={pageActions}
      />

      {/* ── Toolbar: search left, territory right ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="search"
            placeholder="Search groups or categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search groups or categories"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#E0E0E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#0073E6] placeholder:text-[#6B7280]"
          />
        </div>

        {/* Territory filter */}
        <select
          value={filterTerritoryId}
          onChange={(e) => setFilterTerritoryId(Number(e.target.value))}
          className="px-3 py-2 text-sm rounded-lg border border-[#E0E0E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#0073E6]"
        >
          <option value={0}>All territories</option>
          {(territories ?? []).filter((t) => t.isActive).map((t) => (
            <option key={t.territoryId} value={t.territoryId}>{t.code} — {t.name}</option>
          ))}
        </select>

        <span className="text-sm text-[#6B7280] ml-auto">
          {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} · {totalCategories} categor{totalCategories !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* ── Groups — flat sections, no accordion ── */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          title={search || filterTerritoryId ? 'No results found' : 'No category groups'}
          description={
            search || filterTerritoryId
              ? 'Try adjusting your search or territory filter.'
              : 'Create a category group to start managing reference data.'
          }
          actionLabel={search || filterTerritoryId ? undefined : 'New Group'}
          onAction={search || filterTerritoryId ? undefined : () => setShowGroupModal(true)}
        />
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <GroupSection
              key={group.categoryGroupId}
              group={group}
              territories={territories ?? []}
              filterTerritoryId={filterTerritoryId}
              searchQuery={search}
              onAddCategory={() => openAddCategory(group.categoryGroupId)}
              onUpsertValue={(catId) => openUpsertValue(catId)}
            />
          ))}
        </div>
      )}

      {/* ── Create Group Modal ── */}
      {showGroupModal && (
        <CreateGroupModal onClose={() => setShowGroupModal(false)} />
      )}

      {/* ── Add Category + Value (single step) ── */}
      {showAddCatModal && (
        <AddCategoryModal
          groupId={addCategoryGroupId}
          territories={territories ?? []}
          onClose={() => setShowAddCatModal(false)}
        />
      )}

      {/* ── Update existing value modal ── */}
      {showValueModal && (
        <FormModal title="Update Value" onClose={() => setShowValueModal(false)} footer={
          <>
            <button type="button" onClick={() => setShowValueModal(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <PrimaryButton onClick={handleUpsertValue} loading={isUpsertingVal} label="Save" />
          </>
        }>
          <div className="fm-field">
            <label className="fm-label">Territory <span className="fm-required-star">*</span></label>
            <select value={valTerritoryId} onChange={(e) => setValTerritoryId(Number(e.target.value))} className={INPUT_CLASS}>
              <option value={0}>— Select Territory —</option>
              {(territories ?? []).filter(t => t.isActive).map((t) => (
                <option key={t.territoryId} value={t.territoryId}>{t.code} — {t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="fm-field">
              <label className="fm-label">Numeric Value</label>
              <input type="number" value={valNumeric} onChange={(e) => setValNumeric(e.target.value)} className={INPUT_CLASS} placeholder="e.g. 500000" />
            </div>
            <div className="fm-field">
              <label className="fm-label">Currency</label>
              <input value={valCurrency} onChange={(e) => setValCurrency(e.target.value)} className={INPUT_CLASS} placeholder="e.g. AUD" maxLength={3} />
            </div>
            <div className="fm-field">
              <label className="fm-label">Unit</label>
              <input value={valUnit} onChange={(e) => setValUnit(e.target.value)} className={INPUT_CLASS} placeholder="e.g. per year" />
            </div>
            <div className="fm-field">
              <label className="fm-label">Qualifier</label>
              <input value={valQualifier} onChange={(e) => setValQualifier(e.target.value)} className={INPUT_CLASS} placeholder="e.g. minimum" />
            </div>
            <div className="fm-field col-span-2">
              <label className="fm-label">Text Value</label>
              <input value={valText} onChange={(e) => setValText(e.target.value)} className={INPUT_CLASS} placeholder="e.g. Not applicable" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}

/* ── GroupSection — flat section with table ────────────────────── */
interface GroupSectionProps {
  group: CategoryGroupDto;
  territories: { territoryId: number; code: string; name: string; isActive: boolean }[];
  filterTerritoryId: number;
  searchQuery: string;
  onAddCategory: () => void;
  onUpsertValue: (catId: number) => void;
}

function GroupSection({
  group, territories, filterTerritoryId, searchQuery,
  onAddCategory, onUpsertValue,
}: GroupSectionProps) {
  const allCategories = group.categories ?? [];

  const q = searchQuery.toLowerCase();
  const groupNameMatches = !q || group.groupName.toLowerCase().includes(q);
  const categories = groupNameMatches
    ? allCategories
    : allCategories.filter(
        (c) =>
          c.categoryKey.toLowerCase().includes(q) ||
          (c.displayName ?? '').toLowerCase().includes(q)
      );

  const showTerritoryColumn = filterTerritoryId === 0;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-start justify-between mb-3 pb-2 border-b border-[#E0E0E5]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-[#383B54]">{group.groupName}</h2>
            <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${sourceBadgeClass(group.source)}`}>
              {group.source}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#F2F2F5] text-[#6B7280] shrink-0">
              {group.groupType}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCategory}
          className="inline-flex items-center gap-1 text-xs text-[#0057CA] hover:underline focus-visible:outline-none shrink-0 ml-3 mt-0.5"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">Add Category</span>
        </button>
      </div>

      {/* Category table */}
      {categories.length === 0 ? (
        <p className="text-xs italic text-[#6B7280] py-2 pl-1">
          No categories yet — click "+ Add Category" to create one.
        </p>
      ) : (
        <div className="fm-card fm-table-wrapper">
          <table className="fm-table" role="table">
            {/* Fixed column widths — same across all groups for visual alignment */}
            <colgroup>
              {showTerritoryColumn ? (
                <>
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '9%' }} />
                  <col className="hidden md:table-column" style={{ width: '14%' }} />
                  <col className="hidden md:table-column" style={{ width: '14%' }} />
                  <col style={{ width: '6%' }} />
                </>
              ) : (
                <>
                  <col style={{ width: '32%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '10%' }} />
                  <col className="hidden md:table-column" style={{ width: '14%' }} />
                  <col className="hidden md:table-column" style={{ width: '14%' }} />
                  <col style={{ width: '8%' }} />
                </>
              )}
            </colgroup>
            <thead>
              <tr>
                <th className="fm-table-th" scope="col">Name</th>
                {showTerritoryColumn && <th className="fm-table-th" scope="col">Territory</th>}
                <th className="fm-table-th" scope="col">Value</th>
                <th className="fm-table-th" scope="col">Currency</th>
                <th className="fm-table-th hidden md:table-cell" scope="col">Unit</th>
                <th className="fm-table-th hidden md:table-cell" scope="col">Qualifier</th>
                <th className="fm-table-th text-right" scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <CategoryRows
                  key={cat.categoryId}
                  category={cat}
                  territories={territories}
                  filterTerritoryId={filterTerritoryId}
                  showTerritoryColumn={showTerritoryColumn}
                  onUpsertValue={() => onUpsertValue(cat.categoryId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── CategoryRows — one or many <tr> per category ──────────────── */
interface CategoryRowsProps {
  category: CategoryDto;
  territories: { territoryId: number; code: string; name: string; isActive: boolean }[];
  filterTerritoryId: number;
  showTerritoryColumn: boolean;
  onUpsertValue: () => void;
}

function CategoryRows({
  category, territories, filterTerritoryId,
  showTerritoryColumn, onUpsertValue,
}: CategoryRowsProps) {
  const values: CategoryValueDto[] = category.values ?? [];
  const displayName = category.displayName || category.categoryKey;

  const fmtNum = (v: CategoryValueDto) =>
    v.numericValue !== null && v.numericValue !== undefined
      ? v.numericValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : null;

  const muted = 'text-[#9CA3AF]';

  if (!showTerritoryColumn) {
    // Territory selected — one row per category
    const v = values.find((val) => val.territoryId === filterTerritoryId);
    const hasValue = !!v;

    return (
      <tr className="fm-table-row">
        <td className="fm-table-td font-medium" style={{ color: 'var(--color-fm-navy)' }}>{displayName}</td>
        <td className={`fm-table-td ${hasValue ? 'text-[#0057CA] font-semibold' : muted}`}>
          {hasValue ? (fmtNum(v!) ?? v!.textValue ?? '—') : '—'}
        </td>
        <td className={`fm-table-td ${hasValue && v!.currency ? '' : muted}`}>
          {hasValue && v!.currency ? v!.currency : '—'}
        </td>
        <td className={`fm-table-td hidden md:table-cell ${hasValue && v!.unit ? '' : muted}`}>
          {hasValue && v!.unit ? v!.unit : '—'}
        </td>
        <td className={`fm-table-td hidden md:table-cell ${hasValue && v!.qualifier ? '' : muted}`}>
          {hasValue && v!.qualifier ? v!.qualifier : '—'}
        </td>
        <td className="fm-table-td text-right">
          <button
            type="button"
            onClick={onUpsertValue}
            className={`inline-flex items-center gap-1 text-xs focus-visible:outline-none hover:underline ${
              hasValue ? 'text-[#383B54]' : 'text-[#0057CA]'
            }`}
          >
            {hasValue ? <><Pencil size={11} /> Update</> : <><Plus size={11} /> Set</>}
          </button>
        </td>
      </tr>
    );
  }

  // All territories — one row per value (or one "no value" row if empty)
  if (values.length === 0) {
    return (
      <tr className="fm-table-row">
        <td className="fm-table-td font-medium" style={{ color: 'var(--color-fm-navy)' }}>{displayName}</td>
        <td className={`fm-table-td ${muted}`}>—</td>
        <td className={`fm-table-td ${muted}`}>—</td>
        <td className={`fm-table-td ${muted}`}>—</td>
        <td className={`fm-table-td hidden md:table-cell ${muted}`}>—</td>
        <td className={`fm-table-td hidden md:table-cell ${muted}`}>—</td>
        <td className="fm-table-td text-right">
          <button
            type="button"
            onClick={onUpsertValue}
            className="inline-flex items-center gap-1 text-xs text-[#0057CA] hover:underline focus-visible:outline-none"
          >
            <Plus size={11} /> Set
          </button>
        </td>
      </tr>
    );
  }

  return (
    <>
      {values.map((v, idx) => {
        const territory = territories.find((t) => t.territoryId === v.territoryId);
        return (
          <tr key={v.categoryValueId} className="fm-table-row">
            <td className="fm-table-td font-medium" style={{ color: 'var(--color-fm-navy)' }}>
              {idx === 0 ? displayName : ''}
            </td>
            <td className="fm-table-td">
              {territory ? (
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-[#F2F2F5] text-[#383B54]">
                  {territory.code}
                </span>
              ) : (
                <span className={muted}>ID: {v.territoryId}</span>
              )}
            </td>
            <td className="fm-table-td text-[#0057CA] font-semibold">
              {fmtNum(v) ?? v.textValue ?? '—'}
            </td>
            <td className={`fm-table-td ${v.currency ? '' : muted}`}>
              {v.currency ?? '—'}
            </td>
            <td className={`fm-table-td hidden md:table-cell ${v.unit ? '' : muted}`}>
              {v.unit ?? '—'}
            </td>
            <td className={`fm-table-td hidden md:table-cell ${v.qualifier ? '' : muted}`}>
              {v.qualifier ?? '—'}
            </td>
            <td className="fm-table-td text-right">
              {idx === 0 && (
                <button
                  type="button"
                  onClick={onUpsertValue}
                  className="inline-flex items-center gap-1 text-xs text-[#383B54] hover:underline focus-visible:outline-none"
                >
                  <Pencil size={11} /> Update
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
