import {
  AvocadoIcon,
  BowlFoodIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  CircleHalfIcon,
  ClockIcon,
  CompassIcon,
  FishIcon,
  GrainsIcon,
  HeartIcon,
  HouseIcon,
  type Icon as PhosphorIcon,
  LeafIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  NotebookIcon,
  PlusIcon,
  ScanIcon,
  SlidersHorizontalIcon,
  StarIcon,
  UserIcon,
  XIcon,
} from '@phosphor-icons/react';

/**
 * The 22-glyph `Icon` set from the Figma file, one to one. Phosphor regular is fill-based,
 * so colour comes from `currentColor` on the wrapper — never `stroke`.
 */
export const GLYPHS = {
  'caret-left': CaretLeftIcon,
  'caret-right': CaretRightIcon,
  x: XIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  house: HouseIcon,
  compass: CompassIcon,
  notebook: NotebookIcon,
  user: UserIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  scan: ScanIcon,
  heart: HeartIcon,
  star: StarIcon,
  clock: ClockIcon,
  'sliders-horizontal': SlidersHorizontalIcon,
  leaf: LeafIcon,
  fish: FishIcon,
  grains: GrainsIcon,
  avocado: AvocadoIcon,
  'bowl-food': BowlFoodIcon,
  'circle-half': CircleHalfIcon,
  check: CheckIcon,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof GLYPHS;

export const ICON_NAMES = Object.keys(GLYPHS) as readonly IconName[];
