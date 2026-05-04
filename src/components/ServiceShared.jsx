export function ServiceProcessSteps() {
  return (
    <section className="section">
      <div className="container">
        <p className="section-label">Process</p>
        <h2 className="section-title">How we work</h2>
      </div>
    </section>
  )
}

export function ServiceInquiryForm({ service, heading, subtext }) {
  return (
    <section className="section">
      <div className="container">
        <p className="section-label">{service}</p>
        <h2 className="section-title">{heading}</h2>
        <p className="section-subtitle">{subtext}</p>
      </div>
    </section>
  )
}