import { EmptyState } from '@/shared/ui/empty-state';

/** Profile has no designed screen; the brief covers logging and discovery. */
export function ProfileScreen() {
  return (
    <div className="flex flex-col gap-24 px-20 pt-4">
      <h1 className="type-large-title text-text-primary">Profile</h1>
      <EmptyState
        icon="user"
        title="Not part of this prototype"
        body="The brief covers logging food and finding recipes. Profile settings are out of scope here."
      />
    </div>
  );
}
