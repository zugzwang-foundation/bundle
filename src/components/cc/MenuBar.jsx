import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Spark } from '../Icons';

/* The classic Mac OS menu bar: fixed at the top, ✦ at the left, menu titles with drop-down menus, a clock slot at the right. */

const enabledIndexes = (list) => list.map((it, i) => (it.divider || it.disabled ? -1 : i)).filter((i) => i >= 0);

// Renders a title or menu item as a link, a router component (item.as with item.to) or a button.
function Action({ item, actionRef, className, tabIndex, onActivate, onKeyDown, onPointerEnter, extra, children }) {
  const Tag = item.as || (item.href ? 'a' : 'button');
  const props = { className, role: 'menuitem', tabIndex, ref: actionRef, onKeyDown, onPointerEnter, ...extra };
  if (Tag === 'button') props.type = 'button';
  if (item.href) props.href = item.href;
  if (item.to) props.to = item.to;
  if (item.target) props.target = item.target;
  if (item.rel) props.rel = item.rel;
  if (item.disabled) props['aria-disabled'] = 'true';
  props.onClick = (e) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    onActivate?.(e);
  };
  return <Tag {...props}>{children}</Tag>;
}

/**
 * Input:
 * - items: menu titles in order, each { label, items?, href?, as?, to?, target?, rel?, onSelect?, spark? }.
 *   A title with items opens a drop-down; without items it is a link (href, or `as` such as a router Link with `to`) or a button (onSelect).
 *   spark: true shows the ✦ in place of the label text (the label stays as its accessible name); without such a title a decorative ✦ leads the bar.
 *   Drop-down entries are { label, href?, as?, to?, onSelect?, shortcut?, disabled? } or { divider: true }.
 * - clock: node shown at the right end (the story date).
 * - className.
 * Keyboard: Left and Right move between titles, Enter, Space or Down opens a menu, Up and Down move in it, Escape closes it, Tab leaves.
 * Selected items take the coral inverse highlight.
 */
export function MenuBar({ items, clock, className = '' }) {
  const [open, setOpen] = useState(-1); // index of the open menu, -1 when none is open
  const [focusIndex, setFocusIndex] = useState(0); // the title that holds the tab stop
  const [menuLeft, setMenuLeft] = useState(0);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const titleRefs = useRef([]);
  const itemRefs = useRef([]);
  const pendingFocus = useRef(null); // 'first', 'last' or 'menu': where focus goes when a menu opens
  const menuId = useId();
  const count = items.length;
  const hasSparkTitle = items.some((item) => item.spark);

  const focusTitle = (i) => {
    setFocusIndex(i);
    titleRefs.current[i]?.focus();
  };

  const openMenu = (i, focus) => {
    const title = titleRefs.current[i];
    setMenuLeft(title ? title.getBoundingClientRect().left : 0);
    pendingFocus.current = focus;
    setFocusIndex(i);
    setOpen(i);
  };

  const closeMenu = (refocus) => {
    const was = open;
    setOpen(-1);
    if (refocus && was >= 0) titleRefs.current[was]?.focus();
  };

  // Moves to the neighbouring title; from an open menu, the neighbour's menu opens too.
  const step = (from, delta, keepOpen) => {
    const next = (from + delta + count) % count;
    if (keepOpen && items[next].items) openMenu(next, 'first');
    else {
      setOpen(-1);
      focusTitle(next);
    }
  };

  // Keep the open menu inside the viewport, then move focus into it.
  useLayoutEffect(() => {
    if (open < 0 || !menuRef.current) return;
    const max = window.innerWidth - menuRef.current.offsetWidth - 4;
    if (menuLeft > max) setMenuLeft(Math.max(0, max));
  }, [open, menuLeft]);

  useEffect(() => {
    if (open < 0) return;
    const mode = pendingFocus.current;
    pendingFocus.current = null;
    const enabled = enabledIndexes(items[open].items || []);
    if (mode === 'first' && enabled.length) itemRefs.current[enabled[0]]?.focus();
    else if (mode === 'last' && enabled.length) itemRefs.current[enabled[enabled.length - 1]]?.focus();
    else menuRef.current?.focus();
  }, [open, items]);

  // A press anywhere outside the bar closes the menu.
  useEffect(() => {
    if (open < 0) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(-1);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onTitleKey = (e, i) => {
    const item = items[i];
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        step(i, 1, open >= 0);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        step(i, -1, open >= 0);
        break;
      case 'Home':
        e.preventDefault();
        focusTitle(0);
        break;
      case 'End':
        e.preventDefault();
        focusTitle(count - 1);
        break;
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        if (item.items) {
          e.preventDefault();
          openMenu(i, 'first');
        } else if (e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
        break;
      case 'ArrowUp':
        if (item.items) {
          e.preventDefault();
          openMenu(i, 'last');
        }
        break;
      case 'Escape':
        if (open >= 0) {
          e.preventDefault();
          setOpen(-1);
        }
        break;
      default:
    }
  };

  const onMenuKey = (e) => {
    const entries = items[open]?.items || [];
    const enabled = enabledIndexes(entries);
    const at = enabled.indexOf(itemRefs.current.indexOf(e.target));
    const focusItem = (pos) => itemRefs.current[enabled[(pos + enabled.length) % enabled.length]]?.focus();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (enabled.length) focusItem(at < 0 ? 0 : at + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (enabled.length) focusItem(at < 0 ? enabled.length - 1 : at - 1);
        break;
      case 'Home':
        e.preventDefault();
        if (enabled.length) focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        if (enabled.length) focusItem(enabled.length - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        step(open, 1, true);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        step(open, -1, true);
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu(true);
        break;
      case 'Tab':
        setOpen(-1);
        break;
      case ' ':
        if (e.target.tagName === 'A') {
          e.preventDefault();
          e.target.click();
        }
        break;
      default:
    }
  };

  // Focus leaving the bar (Tab out, or a click elsewhere) closes the menu.
  const onBlur = (e) => {
    if (open >= 0 && !e.currentTarget.contains(e.relatedTarget)) setOpen(-1);
  };

  return (
    <nav ref={rootRef} className={`cc-menubar ${className}`.trim()} aria-label="Menu bar" onBlur={onBlur}>
      <ul className="cc-menubar-list" role="menubar">
        {!hasSparkTitle && (
          <li role="none" className="cc-menubar-mark" aria-hidden="true">
            <Spark size={14} />
          </li>
        )}
        {items.map((item, i) => {
          const isOpen = open === i;
          const hasMenu = Boolean(item.items);
          return (
            <li key={item.label} role="none" className="cc-menubar-item">
              <Action
                item={item}
                actionRef={(el) => { titleRefs.current[i] = el; }}
                className={`cc-menubar-title${isOpen ? ' is-open' : ''}${item.spark ? ' is-spark' : ''}`}
                tabIndex={i === focusIndex ? 0 : -1}
                extra={hasMenu ? { 'aria-haspopup': 'menu', 'aria-expanded': isOpen, 'aria-controls': isOpen ? menuId : undefined } : undefined}
                onKeyDown={(e) => onTitleKey(e, i)}
                onPointerEnter={() => {
                  if (open >= 0 && !isOpen && hasMenu) openMenu(i, 'menu');
                }}
                onActivate={(e) => {
                  if (hasMenu) {
                    if (isOpen) setOpen(-1);
                    else openMenu(i, 'menu');
                  } else {
                    item.onSelect?.(e);
                    setOpen(-1);
                  }
                }}
              >
                {item.spark ? (
                  <>
                    <span className="cc-menubar-spark" aria-hidden="true"><Spark size={14} /></span>
                    <span className="cc-sr">{item.label}</span>
                  </>
                ) : item.label}
              </Action>
              {isOpen && hasMenu && (
                <ul
                  ref={menuRef}
                  id={menuId}
                  role="menu"
                  aria-label={item.label}
                  tabIndex={-1}
                  className="cc-menu"
                  style={{ left: menuLeft }}
                  onKeyDown={onMenuKey}
                >
                  {item.items.map((entry, j) => (entry.divider ? (
                    <li key={`divider-${j}`} role="separator" className="cc-menu-sep" />
                  ) : (
                    <li key={entry.label} role="none">
                      <Action
                        item={entry}
                        actionRef={(el) => { itemRefs.current[j] = el; }}
                        className="cc-menu-item"
                        tabIndex={-1}
                        onActivate={(e) => {
                          entry.onSelect?.(e);
                          closeMenu(!(entry.href || entry.to));
                        }}
                      >
                        <span className="cc-menu-label">{entry.label}</span>
                        {entry.shortcut && <span className="cc-menu-key">{`⌘${entry.shortcut}`}</span>}
                      </Action>
                    </li>
                  )))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      {clock != null && <div className="cc-menubar-clock">{clock}</div>}
    </nav>
  );
}

export default MenuBar;
