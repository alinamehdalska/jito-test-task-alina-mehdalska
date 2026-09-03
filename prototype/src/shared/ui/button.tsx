import type { ComponentPropsWithoutRef } from 'react';
import { Link, type LinkProps } from 'react-router';

import { cn } from '@/shared/lib/cn';
import { buttonClasses, type ButtonStyleProps } from '@/shared/ui/button-styles';
import { Icon } from '@/shared/ui/icon';

function ButtonContent({
  iconLeading,
  iconTrailing,
  children,
}: Pick<ButtonStyleProps, 'iconLeading' | 'iconTrailing'> & {
  readonly children: React.ReactNode;
}) {
  return (
    <>
      {iconLeading && <Icon name={iconLeading} />}
      {children}
      {iconTrailing && <Icon name={iconTrailing} />}
    </>
  );
}

type ButtonProps = ButtonStyleProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'className'> & {
    readonly className?: string | undefined;
  };

export function Button({
  variant,
  size,
  fullWidth,
  iconLeading,
  iconTrailing,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      {...rest}
    >
      <ButtonContent iconLeading={iconLeading} iconTrailing={iconTrailing}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonStyleProps &
  Omit<LinkProps, 'className'> & {
    readonly className?: string | undefined;
  };

/** A navigation that looks like a button — a real link, so it works with the keyboard and history. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  iconLeading,
  iconTrailing,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...rest}>
      <ButtonContent iconLeading={iconLeading} iconTrailing={iconTrailing}>
        {children}
      </ButtonContent>
    </Link>
  );
}
