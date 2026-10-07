import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Spinner } from './Spinner';

/* Claude Code transcript motifs inside macOS windows: tool call rows, the todo list, diffs and keycaps. */

const EASE = [0.16, 1, 0.3, 1];
const STATUS_TEXT = { running: 'running', done: 'done', error: 'failed' };

function Chevron({ className }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M3.5 2l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A tool call row: `⏺ Name(args)`, an optional result line after ⎿, and optional detail that expands under it.
 * Input: name, args (shown in brackets when given), status ('running' | 'done' | 'error'), result (one-line string), children (the detail; makes the row a toggle button), defaultOpen, index (position in a list; staggers the entrance by 90 ms each).
 * The dot is coral and blinks in steps while running, green when done, red on error.
 */
export function ToolCall({ name, args, status = 'done', result, children, defaultOpen = false, index = 0 }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);
  const detailId = useId();
  const hasDetail = children != null && children !== false;

  const head = (
    <>
      <span className="tc-dot" aria-hidden="true" />
      <span className="tc-call">
        <span className="tc-name">{name}</span>
        {args != null && <span className="tc-args">{typeof args === 'object' ? <>({args})</> : `(${args})`}</span>}
      </span>
      <span className="cc-sr">{`, ${STATUS_TEXT[status] ?? status}`}</span>
      {hasDetail && <Chevron className="tc-chev" />}
    </>
  );

  const row = hasDetail ? (
    <button
      type="button"
      className="tc-row"
      aria-expanded={open}
      aria-controls={open ? detailId : undefined}
      onClick={() => setOpen((o) => !o)}
    >
      {head}
    </button>
  ) : (
    <div className="tc-row">{head}</div>
  );

  const resultLine = result != null && (
    <div className="tc-result">
      <span className="tc-elbow" aria-hidden="true">⎿</span>
      <span className="tc-result-text">{result}</span>
    </div>
  );

  const detail = (body) => <div className="tc-detail-inner">{body}</div>;
  const cls = `tc is-${status}${open ? ' is-open' : ''}`;

  if (reduced) {
    return (
      <div className={cls}>
        {row}
        {resultLine}
        {hasDetail && open && <div className="tc-detail" id={detailId}>{detail(children)}</div>}
      </div>
    );
  }

  return (
    <motion.div
      className={cls}
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.33, delay: index * 0.09, ease: EASE }}
    >
      {row}
      <AnimatePresence initial={false}>
        {resultLine && (
          <motion.div key="result" initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.24, ease: EASE }}>
            {resultLine}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {hasDetail && open && (
          <motion.div
            key="detail"
            id={detailId}
            className="tc-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            {detail(children)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TodoItem({ item, isCurrent, onSelect }) {
  const state = isCurrent ? 'is-current' : item.done ? 'is-done' : 'is-todo';
  const srPrefix = isCurrent ? 'Current: ' : item.done ? 'Done: ' : '';
  const text = (
    <>
      <span className="cc-sr">{srPrefix}</span>
      <span className="todo-text">{item.label}</span>
    </>
  );
  const select = onSelect ? (e) => onSelect(item.id, e) : undefined;
  let label = <span className="todo-label">{text}</span>;
  if (item.href) {
    label = <a className="todo-label todo-link" href={item.href} onClick={select} aria-current={isCurrent ? 'step' : undefined}>{text}</a>;
  } else if (onSelect) {
    label = <button type="button" className="todo-label todo-link" onClick={select} aria-current={isCurrent ? 'step' : undefined}>{text}</button>;
  }

  return (
    <li className={`todo-item ${state}`}>
      <span className="todo-box" aria-hidden="true">
        {isCurrent ? (
          <Spinner size={13} className="todo-spin" />
        ) : (
          <span className={`todo-circle${item.done ? ' is-done' : ''}`}>
            <svg viewBox="0 0 14 14">
              <path d="M4.2 7.2l2 2 3.7-4.2" />
            </svg>
          </span>
        )}
      </span>
      {label}
    </li>
  );
}

/**
 * The Claude Code todo list in the macOS Reminders style: an empty ring for later items, a filled coral circle with a white tick and a strike-through for done items, the coral spinner glyph for the current one.
 * Input: items [{ id, label, done, href? }], current (id of the item in progress), onSelect(id, event) (optional; makes labels buttons, or runs on link click when items have href), className.
 * When an item turns done its circle fills, the tick draws on and the strike line draws left to right.
 */
export function TodoList({ items, current, onSelect, className = '' }) {
  return (
    <ul className={`todo ${className}`.trim()}>
      {items.map((item) => (
        <TodoItem key={item.id} item={item} isCurrent={item.id === current} onSelect={onSelect} />
      ))}
    </ul>
  );
}

// Splits a diff header so "+4" reads green and "−0" or "-0" reads red; only signed numbers at the start of a word count.
function tintHeader(header) {
  return header.split(/((?<=^|\s)[+−-]\d+)/).map((part, i) => {
    if (/^\+\d/.test(part)) return <span key={i} className="diff-plus">{part}</span>;
    if (/^[−-]\d/.test(part)) return <span key={i} className="diff-minus">{part}</span>;
    return part;
  });
}

/**
 * A line-numbered diff block in the Claude Code style.
 * Input: header (string or node, e.g. "+4 sections −0 chats"), lines [{ kind: 'add' | 'del' | 'ctx', text }], start (first line number, default 1).
 * Added lines are green with +, removed lines red with -; removed lines carry old line numbers, the rest new ones.
 * Lines stagger in 30 ms apart the first time the block scrolls into view; with reduced motion they render at once.
 */
export function Diff({ header, lines, start = 1 }) {
  const reduced = useReducedMotion();
  let oldLine = start;
  let newLine = start;
  const rows = lines.map((line, i) => {
    let n;
    if (line.kind === 'del') {
      n = oldLine;
      oldLine += 1;
    } else if (line.kind === 'add') {
      n = newLine;
      newLine += 1;
    } else {
      n = newLine;
      oldLine += 1;
      newLine += 1;
    }
    return { ...line, n, key: i };
  });

  const sign = { add: '+', del: '-', ctx: ' ' };
  const lineBody = (row) => (
    <>
      <span className="diff-num" aria-hidden="true">{row.n}</span>
      <span className="diff-sign" aria-hidden="true">{sign[row.kind] ?? ' '}</span>
      <span className="diff-text">
        {row.kind === 'add' && <span className="cc-sr">Added: </span>}
        {row.kind === 'del' && <span className="cc-sr">Removed: </span>}
        {row.text}
      </span>
    </>
  );

  return (
    <div className="diff">
      {header != null && <div className="diff-head">{typeof header === 'string' ? tintHeader(header) : header}</div>}
      {reduced ? (
        <div className="diff-body">
          {rows.map((row) => <div key={row.key} className={`diff-line is-${row.kind}`}>{lineBody(row)}</div>)}
        </div>
      ) : (
        <motion.div
          className="diff-body"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ shown: { transition: { staggerChildren: 0.03 } } }}
        >
          {rows.map((row) => (
            <motion.div
              key={row.key}
              className={`diff-line is-${row.kind}`}
              variants={{ hidden: { opacity: 0, x: -6 }, shown: { opacity: 1, x: 0, transition: { duration: 0.24, ease: EASE } } }}
            >
              {lineBody(row)}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/** A macOS key for keyboard hints: white, 4 px corners, a hairline edge and a 1 px shadow under it. Input: children (the key name, e.g. "⌘K"), className. */
export function Keycap({ children, className = '' }) {
  return <kbd className={`cc-keycap ${className}`.trim()}>{children}</kbd>;
}
