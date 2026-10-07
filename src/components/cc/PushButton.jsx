/**
 * A classic push button: a rounded platinum rectangle with a 1 px ink border and bevel; pressed, it fills with the coral highlight.
 * Input: children, isDefault (adds the thick outer ring of the default button), as (tag or component, e.g. 'a' or a router Link; default 'button'), className, and any other props for that element.
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
