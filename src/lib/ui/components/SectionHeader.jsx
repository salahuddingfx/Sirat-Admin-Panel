export function SectionHeader({ eyebrow, title, description, children }) {
  return (
    <div className="section-header">
      {eyebrow ? <p className="section-header__eyebrow">{eyebrow}</p> : null}
      <div className="section-header__row">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {children ? <div className="section-header__actions">{children}</div> : null}
      </div>
    </div>
  );
}
