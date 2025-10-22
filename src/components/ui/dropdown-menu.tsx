import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

type DropdownContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

const DropdownContext = React.createContext<DropdownContextType | null>(null);

export const DropdownMenu: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const toggle = React.useCallback(() => setOpen((s) => !s), []);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, toggle, triggerRef }}>{children}</DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<React.PropsWithChildren<{ asChild?: boolean }>> = ({ children, asChild }) => {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) return <>{children}</>;

  const { toggle, triggerRef } = ctx;

  const child = React.Children.only(children) as React.ReactElement;

  // helper to attach our ref to the child element
  const attachRef = (el: HTMLElement | null) => {
    // assign to mutable ref
    (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el;
    const existingRef = (child as any).ref;
    if (!existingRef) return;
    try {
      if (typeof existingRef === 'function') existingRef(el);
      else existingRef.current = el;
    } catch {}
  };

  if (asChild && React.isValidElement(child)) {
    const existingOnClick = (child.props as any).onClick;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        existingOnClick?.(e);
        toggle();
      },
      ref: attachRef as any,
      'aria-haspopup': 'menu',
      'aria-expanded': ctx.open as unknown as boolean,
    } as any);
  }

  return (
    <button ref={attachRef as any} onClick={(e) => { e.stopPropagation(); toggle(); }} aria-haspopup="menu" aria-expanded={ctx.open as unknown as boolean}>
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<React.PropsWithChildren<{ align?: 'start' | 'end'; className?: string }>> = ({ children, align = 'start', className }) => {
  const ctx = React.useContext(DropdownContext);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [styles, setStyles] = React.useState<React.CSSProperties | null>(null);

  React.useEffect(() => {
    const localCtx = ctx!; // asserted non-null for handlers
    if (!localCtx) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      // if click is inside trigger, ignore because trigger toggles
      const trig = localCtx.triggerRef.current;
      if (trig && trig.contains(e.target as Node)) return;
      localCtx.setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') localCtx.setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [ctx]);

  // position relative to trigger
  React.useLayoutEffect(() => {
    const localCtx = ctx;
    if (!localCtx || !localCtx.open) return;
    const trig = localCtx.triggerRef.current;
    if (!trig) return;
    const rect = trig.getBoundingClientRect();
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 9999,
      minWidth: 160,
    };
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    if (align === 'end') {
      baseStyle.top = rect.bottom + scrollY + 8;
      baseStyle.right = window.innerWidth - rect.right - scrollX;
    } else {
      baseStyle.top = rect.bottom + scrollY + 8;
      baseStyle.left = rect.left + scrollX;
    }

    setStyles(baseStyle);
  }, [ctx, align]);

  // focus management and keyboard navigation
  React.useEffect(() => {
    const localCtx = ctx;
    if (!localCtx || !localCtx.open) return;
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (items.length) items[0].focus();

    function onKey(e: KeyboardEvent) {
      if (!el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      const active = document.activeElement as HTMLElement | null;
      const idx = items.indexOf(active as HTMLElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[(idx + 1) % items.length];
        next?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[(idx - 1 + items.length) % items.length];
        prev?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        (document.activeElement as HTMLElement | null)?.click();
        localCtx!.setOpen(false);
      }
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ctx]);

  if (!ctx || !ctx.open) return null;

  const content = (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "bg-white border shadow p-2 rounded transition ease-out duration-150 transform origin-top scale-100 opacity-100",
        className,
      )}
      style={styles || undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );

  return createPortal(content, document.body);
};

export const DropdownMenuItem: React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => {
  const ctx = React.useContext(DropdownContext);
  return (
    <div
      {...props}
      role="menuitem"
      className={cn('px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer', (props as any).className)}
      onClick={(e) => {
        (props as any).onClick?.(e as any);
        ctx?.setOpen(false);
      }}
    >
      {children}
    </div>
  );
};

export const DropdownMenuCheckboxItem = DropdownMenuItem;
export const DropdownMenuRadioItem = DropdownMenuItem;
export const DropdownMenuLabel: React.FC<any> = ({ children }) => <div className="px-2 py-1 text-xs font-semibold">{children}</div>;
export const DropdownMenuSeparator: React.FC<any> = () => <div className="my-1 h-px bg-gray-100" />;
export const DropdownMenuGroup: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div>{children}</div>;
export const DropdownMenuPortal = ({ children }: any) => <>{children}</>;
export const DropdownMenuSub = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuSubTrigger = ({ children }: any) => <>{children}</>;
export const DropdownMenuSubContent = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuRadioGroup = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuShortcut = ({ children }: any) => <span className="ml-auto text-xs">{children}</span>;

export default DropdownMenu;
