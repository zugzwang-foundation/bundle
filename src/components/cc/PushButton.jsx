/**
 * A macOS push button: white with a faint top-to-bottom gradient, 6 px corners, a hairline border and a small shadow.
 * Input: children, isDefault (the default button: coral accent fill with white text), as (tag or component, e.g. 'a' or a router Link; default 'button'), className, and any other props for that element.
 * A plain button gets type="button" unless a type is passed.
 */
export function PushButton({ children, isDefault = false, as = 'button', className = '', ...rest }) {
  const Tag = as;
  const typeProp = Tag === 'button' && rest.type == null ? { type: 'button' } : {};
  const cls = ['cc-btn', isDefault && 'cc-btn--default', className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} {...typeProp} {...rest}>
      {children}
    </Tag>
  );
}

export default PushButton;
