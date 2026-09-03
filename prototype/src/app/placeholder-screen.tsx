import { routes } from '@/app/routes';
import { Screen } from '@/shared/chrome/screen';
import { ScreenHeader } from '@/shared/chrome/screen-header';
import { StickyCta } from '@/shared/chrome/sticky-cta';
import { ButtonLink } from '@/shared/ui/button';

interface PlaceholderProps {
  readonly title: string;
  readonly stage: string;
}

/** Stands in for a tab screen until its feature lands. */
export function TabPlaceholder({ title, stage }: PlaceholderProps) {
  return (
    <div className="flex flex-col gap-8 px-20 pt-4">
      <h1 className="type-large-title text-text-primary">{title}</h1>
      <p className="type-subhead text-text-secondary">Arrives with {stage}.</p>
    </div>
  );
}

/** Stands in for a push screen: header, scrolling body, sticky CTA. */
export function PushPlaceholder({ title, stage }: PlaceholderProps) {
  return (
    <Screen
      bottomInset="cta"
      chrome={
        <StickyCta fade="nav">
          <ButtonLink to={routes.home} size="lg" fullWidth>
            Back to Today
          </ButtonLink>
        </StickyCta>
      }
    >
      <ScreenHeader title={title} closable />
      <p className="px-20 pt-24 type-subhead text-text-secondary">Arrives with {stage}.</p>
    </Screen>
  );
}
