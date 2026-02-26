// Project-global ambient module declarations to satisfy editor/TS server
// for third-party modules without shipped type definitions or when
// the IDE has trouble resolving Next.js built-in types.

declare module 'next/navigation' {
  export function useRouter(...args: any[]): any;
  export function usePathname(...args: any[]): any;
  export function useSearchParams(...args: any[]): any;
  export function useParams(...args: any[]): any;
  export function redirect(url: string): never;
  export function notFound(): never;
  export const cookies: any;
}

declare module 'next/link' {
  import { ComponentType } from 'react';
  const Link: ComponentType<any>;
  export default Link;
}

declare module 'next/dynamic' {
  export default function dynamic(...args: any[]): any;
}

declare module '@dnd-kit/core' {
  export const DndContext: any;
  export const closestCenter: any;
  export const PointerSensor: any;
  export const useSensor: any;
  export const useSensors: any;
  export default any;
}

declare module '@dnd-kit/sortable' {
  export const SortableContext: any;
  export const verticalListSortingStrategy: any;
  export function useSortable(...args: any[]): any;
  export default any;
}

declare module '@dnd-kit/utilities' {
  export const CSS: any;
  export default any;
}
